import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    PlayCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    MessageSquare,
    Ticket,
    Video,
    Download,
    Lock,
    Circle,
    User,
    ListChecks,
    ChevronRight
} from 'lucide-react';
import { getStudentCourseDetail, getCourseSections, getStudentMyCourses } from "../../api/courseApi";
import { getLessonsBySection } from '../../../lesson/api/lessonApi';
import { Spin, message, Tooltip } from 'antd';
import StudentAssignmentsTab from '../../../assignment/student/components/StudentAssignmentsTab';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { getCourseQuizzes } from '../../../quiz/student/api/quizApi';


export default function CourseDetail() {
    const { courseId } = useParams();
    const [expandedSections, setExpandedSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'assignments'

    const [sectionsData, setSectionsData] = useState([]);
    const [summativeQuizzes, setSummativeQuizzes] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            // Lấy thông tin cơ bản
            const courseRes = await getStudentCourseDetail(courseId).catch(() => null);
            let data = courseRes?.data || courseRes || {};

            // Nếu API chính không trả về đầy đủ metadata (như môn học), thử lấy từ danh sách (Giống logic bên teacher)
            if (!data.subjectId && !data.SubjectId && !data.subjectName) {
                try {
                    const { getStudentMyCourses } = await import('../../api/courseApi');
                    const myCoursesRes = await getStudentMyCourses();
                    const coursesList = myCoursesRes?.data?.items || myCoursesRes?.items || myCoursesRes?.data || [];
                    const baseCourse = coursesList.find(c => c.id === courseId);
                    if (baseCourse) {
                        data.subjectName = baseCourse.subjectName || baseCourse.subject?.name;
                        data.teacherName = baseCourse.teacherName || baseCourse.instructor;
                        data.totalDuration = baseCourse.totalDuration || baseCourse.duration;
                        data.totalLessons = baseCourse.totalLessons || baseCourse.lessons;
                    }
                } catch (e) {
                    console.error("Could not supplement course base fields", e);
                }
            }

            setCourseData(data);

            // Xác định danh sách chương học từ nhiều trường có thể xảy ra
            let apiSections = data.sections || data.Sections || data.items || data.Items || data.curriculum || data.chapters || [];

            // Nếu không có sections, thử gọi API sections riêng biệt
            if (!apiSections || apiSections.length === 0) {
                try {
                    const sectionsRes = await getCourseSections(courseId);
                    apiSections = sectionsRes?.data?.items || sectionsRes?.items || sectionsRes?.data || (Array.isArray(sectionsRes) ? sectionsRes : []);
                } catch (e) {
                    console.error("Error fetching supplemental sections:", e);
                }
            }

            // Map ban đầu và xử lý ID ổn định
            const initialSections = (apiSections || []).map((s, index) => {
                const sId = s.id || s.Id || s.sectionId || `section-${index}`;
                const rawLessons = s.lessons || s.Lessons || s.items || s.Items || s.subSections || [];
                return {
                    ...s,
                    id: sId,
                    lessons: rawLessons,
                    lessonsCount: s.lessonsCount || (s.lessons?.length || rawLessons.length)
                };
            });

            setSectionsData(initialSections);

            // Mở section đầu tiên nếu có
            if (initialSections.length > 0) {
                setExpandedSections([initialSections[0].id]);

                // Fetch bài học cho từng section nếu chúng rỗng
                initialSections.forEach(async (section) => {
                    if (!section.lessons || section.lessons.length === 0) {
                        try {
                            const lessonsRes = await getLessonsBySection(section.id);
                            const lessons = lessonsRes?.data?.items || lessonsRes?.items || lessonsRes?.data || (Array.isArray(lessonsRes) ? lessonsRes : []);
                            if (lessons && lessons.length > 0) {
                                setSectionsData(prev => prev.map(s =>
                                    (s.id === section.id) ? { ...s, lessons: lessons, lessonsCount: lessons.length } : s
                                ));
                            }
                        } catch (err) {
                            console.error(`Failed to fetch lessons for section ${section.id}`, err);
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết khóa học:", error);
            message.error("Không thể tải thông tin khóa học");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        if (!courseId) return;
        setQuizzesLoading(true);
        try {
            const res = await getCourseQuizzes(courseId);
            const items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            setSummativeQuizzes(items);
        } catch (error) {
            console.error("Lỗi khi tải danh sách quiz:", error);
        } finally {
            setQuizzesLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchDetail();
    }, [courseId]);

    useEffect(() => {
        if (activeTab === 'quizzes' && summativeQuizzes.length === 0) {
            fetchQuizzes();
        }
    }, [activeTab]);

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <Spin size="large" />
            <p className="text-slate-500 font-medium">Đang chuẩn bị bài học cho bạn...</p>
        </div>
    );

    if (!courseData) return (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 m-8">
            <BookOpen size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy khóa học</h3>
            <p className="text-slate-500">Dữ liệu có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
        </div>
    );

    const courseInfo = {
        title: courseData.title || courseData.name || 'Khóa học',
        instructor: courseData.teacherName || courseData.instructor || 'Giảng viên',
        totalHours: courseData.totalDuration ? Math.floor(courseData.totalDuration / 60) : 0,
        progress: courseData.progress || 0,
        completedLessons: courseData.completedLessons || 0,
        totalLessons: courseData.totalLessons || 0,
        tag: courseData.subjectName || courseData.categoryName || 'Môn học'
    };

    // Mapping sections từ sectionsData sang format UI
    const sections = sectionsData.map((s, index) => {
        const sId = s.id || s.Id;
        const sLessons = s.lessons || [];

        return {
            id: sId,
            title: s.title || s.name || `Chương ${index + 1}`,
            status: s.isLocked ? 'Đã khóa' : s.isCompleted ? 'Đã hoàn thành' : 'Đang học',
            lessonsCount: s.lessonsCount || sLessons.length,
            duration: s.duration || '---',
            completed: s.isCompleted || false,
            description: s.description || '',
            items: (sLessons || []).map(item => ({
                id: item.id || item.Id || item.quizId,
                type: item.type?.toLowerCase() || 'video',
                title: item.title || item.name || 'Bài học',
                duration: item.duration || '45 p',
                completed: item.isCompleted || false,
                isNew: item.isNew || false
            }))
        };
    });

    const resources = courseData.resources || [
        { id: 1, title: 'Đề cương ôn tập.pdf', icon: Download },
        { id: 2, title: 'Bảng công thức bổ trợ', icon: FileText }
    ];

    // Sidebar & Tabs

    const nextClass = {
        title: 'Tiết học tiếp theo',
        description: courseData.nextClassTopic || 'Chuyên đề học tập tiếp theo',
        time: courseData.nextClassTime || 'Xem lịch để biết thêm chi tiết'
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- HEADER SECTION --- */}
                <div className="relative group overflow-hidden rounded-[3rem] p-10 lg:p-12 border border-slate-100/50 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] bg-white transition-all duration-700 hover:shadow-[0_48px_100px_-20px_rgba(0,0,0,0.12)]">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/30 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                        <div className="flex-shrink-0 relative w-full lg:w-64 h-64 rounded-[2.5rem] overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-2xl transition-all duration-500 group-hover:scale-102">
                            {courseData.thumbnail ? (
                                <>
                                    <img
                                        src={courseData.thumbnail}
                                        className="w-full h-full object-cover"
                                        alt="Thumbnail"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <BookOpen size={48} className="opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">EdAI Course</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-500/30">
                                        {courseInfo.tag}
                                    </div>
                                    <div className="px-5 py-2 bg-white text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100 shadow-sm backdrop-blur-sm">
                                        Niên khóa 2023 - 2024
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {courseInfo.title}
                                </h1>
                                <p className="text-slate-500 text-base max-w-2xl leading-relaxed font-medium">
                                    {courseData.description || "Chào mừng bạn đến với khóa học. Đây là lộ trình học tập được thiết kế tối ưu."}
                                </p>
                            </div>

                            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/80">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                        <User size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Giảng viên</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">{courseInfo.instructor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                                        <Clock size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Thời lượng</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{courseInfo.totalHours} Tiết / {courseData.totalDuration || 0}m</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                        <ListChecks size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Bài giảng</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{courseInfo.totalLessons} Bài học</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="w-full lg:max-w-xl">
                            <div className="flex justify-between items-end mb-5 px-1">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tiến trình học tập</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-[#22c55e] leading-none">{courseInfo.progress}%</span>
                                        <span className="text-xs font-semibold text-slate-400">Đã hoàn thành</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-900">{courseInfo.completedLessons}</span>
                                    <span className="text-xs font-semibold text-slate-400 mx-1">/</span>
                                    <span className="text-xs font-semibold text-slate-400">{courseInfo.totalLessons} bài giảng</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-2xl h-4 overflow-hidden shadow-inner p-1">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-xl transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    style={{ width: `${courseInfo.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {sections.length > 0 && sections[0].items.length > 0 ? (
                            <Link
                                to={`/dashboard/student/courses/${courseId}/lessons/${sections[0].items[0].id}`}
                                className="w-full lg:w-auto min-w-[280px] group/cta px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4"
                            >
                                <PlayCircle size={22} className="fill-current" />
                                <span className="text-sm font-bold uppercase tracking-widest">Tiếp tục học tập</span>
                                <ArrowRight size={20} className="ml-2 transition-transform duration-500 group-hover/cta:translate-x-2" />
                            </Link>
                        ) : (
                            <div className="w-full lg:w-auto min-w-[280px] px-10 py-5 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-[2rem] border border-slate-200 flex items-center justify-center gap-3">
                                <Lock size={18} />
                                Khóa học đang cập nhật
                            </div>
                        )}
                    </div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-slate-200 shadow-sm w-fit max-w-full overflow-x-auto">
                    {[
                        { id: 'curriculum', label: 'Chương trình học', icon: BookOpen },
                        { id: 'assignments', label: 'Bài tập về nhà', icon: FileText },
                        { id: 'quizzes', label: 'Bài kiểm tra', icon: ListChecks }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${active
                                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/5'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                    }`}
                            >
                                <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                                {tab.label}
                                {active && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse ml-1" />
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === 'curriculum' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                        <BookOpen size={24} className="text-[#0487e2]" />
                                        Nội dung học tập
                                    </h2>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                        {sections.length} Chương • {courseInfo.totalLessons} Bài học
                                    </div>
                                </div>

                                {sections.map((section, sIdx) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const isLocked = section.status === 'Đã khóa' || section.status === 'Sắp học';

                                    return (
                                        <div key={section.id}
                                            className={`group/section border rounded-[3rem] overflow-hidden transition-all duration-500 bg-white ${isExpanded ? 'border-blue-100 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.08)]' : 'border-slate-100/80 hover:border-blue-100/50 shadow-sm'}`}
                                            style={{ animationDelay: `${sIdx * 0.1}s` }}>
                                            <button
                                                onClick={() => !isLocked && toggleSection(section.id)}
                                                className={`w-full p-8 flex items-center justify-between transition-all duration-300 ${isLocked ? 'cursor-not-allowed bg-slate-50/50 opacity-80' : 'hover:bg-slate-50/20 active:scale-[0.99]'}`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover/section:scale-110 ${isLocked ? 'bg-slate-100 text-slate-400' : section.completed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                        {isLocked ? (
                                                            <Lock size={28} />
                                                        ) : section.completed ? (
                                                            <CheckCircle size={28} strokeWidth={2.5} />
                                                        ) : (
                                                            <BookOpen size={28} strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-3 mb-1.5">
                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] opacity-80">Chương {sIdx + 1}</span>
                                                            {isLocked && <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-black uppercase rounded">Locked</span>}
                                                        </div>
                                                        <h3 className="font-bold text-xl text-slate-900 tracking-tight leading-none mb-2">{section.title}</h3>
                                                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            <span className={section.completed ? "text-emerald-500" : ""}>{section.status}</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                            <span>{section.lessonsCount} Bài học</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                            <span>{section.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                                        <ChevronDown size={24} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>

                                            {isExpanded && !isLocked && section.items.map((item, idx) => (
                                                <div key={item.id} className="px-8 pb-8 space-y-4 animate-in fade-in slide-in-from-top-6 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                    <Link
                                                        to={item.type === 'quiz' ? `/dashboard/student/quizzes/${item.id}` : `/dashboard/student/courses/${courseId}/lessons/${item.id}`}
                                                        className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:rotate-12 ${item.completed ? 'bg-emerald-50 text-emerald-600' : item.type === 'quiz' ? 'bg-amber-50 text-amber-500' : 'bg-white text-blue-500 shadow-sm'}`}>
                                                                {item.completed ? (
                                                                    <CheckCircle size={22} strokeWidth={2.5} />
                                                                ) : item.type === 'quiz' ? (
                                                                    <ListChecks size={22} strokeWidth={2.5} />
                                                                ) : (
                                                                    <PlayCircle size={22} strokeWidth={2.5} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1.5">
                                                                    <h4 className={`text-sm font-bold tracking-tight transition-colors ${item.completed ? 'text-slate-400 line-through decoration-2' : 'text-slate-800 group-hover:text-blue-700'}`}>
                                                                        {item.title}
                                                                    </h4>
                                                                    {item.isNew && (
                                                                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.1em] rounded shadow-lg shadow-rose-200">NEW</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded-lg border border-slate-100">
                                                                        <Clock size={12} className="text-slate-400" />
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.duration}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                                        {item.type === 'quiz' ? 'Kiểm tra trắc nghiệm' : 'Bài giảng video'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white opacity-0 translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 flex items-center justify-center shadow-xl shadow-blue-500/20 transition-all duration-500">
                                                            <ArrowRight size={20} strokeWidth={3} />
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'assignments' && (
                            <StudentAssignmentsTab courseId={courseId} />
                        )}

                        {activeTab === 'quizzes' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 leading-none mb-2">Bài tập tổng kết</h2>
                                        <p className="text-sm text-slate-500 font-medium">Hoàn thành các bài quizz để củng cố toàn bộ kiến thức khóa học</p>
                                    </div>
                                    <button
                                        onClick={fetchQuizzes}
                                        disabled={quizzesLoading}
                                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
                                    >
                                        <RefreshCw size={20} className={quizzesLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {quizzesLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <Spin size="large" />
                                        <p className="text-slate-400 font-medium">Đang tải danh sách bài tập...</p>
                                    </div>
                                ) : summativeQuizzes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {summativeQuizzes.map((quiz, idx) => (
                                            <div key={quiz.id || idx} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />

                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                                            <ListChecks size={28} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1 truncate">{quiz.title || 'Bài tập tổng kết'}</h4>
                                                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100">Summative</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số câu hỏi</span>
                                                            <span className="text-sm font-bold text-slate-900">{quiz.totalQuestions || 0} câu</span>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</span>
                                                            <span className="text-sm font-bold text-slate-900">{quiz.duration || quiz.timeLimit || 15} phút</span>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/dashboard/student/quizzes/${quiz.id || quiz.quizId}`}
                                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg hover:-translate-y-1 active:scale-95 group-hover:shadow-blue-500/20"
                                                    >
                                                        Bắt đầu làm bài
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[2.5rem] p-16 border border-slate-100 text-center shadow-sm">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                                            <ListChecks size={48} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">Chưa có bài tập tổng kết</h3>
                                        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium mb-10 leading-relaxed">
                                            Hiện tại chưa có bài kiểm tra tổng kết cho khóa học này. Hãy hoàn thành các bài học để sẵn sàng nhé!
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('curriculum')}
                                            className="px-8 py-4 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                                        >
                                            Tiếp tục học tập
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Live/Next session info */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-[#0487e2] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Clock size={14} />
                                    Lịch học tiếp theo
                                </h4>
                                <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 mb-6">
                                    <p className="text-base font-bold text-slate-900 mb-1 leading-tight">{nextClass.title}</p>
                                    <p className="text-xs text-slate-500 font-medium mb-3">{nextClass.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#0487e2] uppercase tracking-wider">
                                        <Clock size={12} strokeWidth={3} />
                                        {nextClass.time}
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-slate-200">
                                    Mở Zoom / Google Meet
                                </button>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        </div>

                        {/* Resources area */}
                        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 blur-3xl rounded-full" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" />
                                Học liệu bổ trợ
                            </h4>
                            <div className="space-y-4">
                                {resources.map((resource, rIdx) => {
                                    const Icon = resource.icon;
                                    return (
                                        <button
                                            key={resource.id}
                                            className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 hover:bg-white transition-all duration-300 border border-transparent hover:border-blue-100 group shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 shadow-sm transition-all duration-500 group-hover:rotate-[10deg]">
                                                    <Icon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{resource.title}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PDF • v.1.0</span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 bg-white group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                <Download size={16} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Instructor Note */}
                        <div className="relative group overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-orange-500/20">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full transition-transform duration-1000 group-hover:scale-150" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl overflow-hidden">
                                        {courseData.instructorThumbnail ? (
                                            <img src={courseData.instructorThumbnail} className="w-full h-full object-cover" alt="Instructor" />
                                        ) : (
                                            <User size={24} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-1.5">Note from Instructor</p>
                                        <h5 className="text-lg font-bold tracking-tight leading-none">{courseInfo.instructor}</h5>
                                    </div>
                                </div>
                                <div className="relative">
                                    <MessageSquare size={48} className="absolute -top-6 -left-6 opacity-10 rotate-12" />
                                    <p className="text-sm font-bold leading-relaxed italic relative z-10 text-white/90">
                                        "Các em nhớ hoàn thành bài tập trắc nghiệm chương 1 trước thứ Sáu tuần này để thầy tổng hợp điểm cộng nhé. Chúc các em học tốt!"
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
