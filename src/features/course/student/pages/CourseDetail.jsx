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
    ChevronRight,
    Trophy
} from 'lucide-react';
import { getStudentCourseDetail, getCourseSections, getStudentMyCourses } from "../../api/courseApi";
import { getLessonsBySection } from '../../../lesson/api/lessonApi';
import { Spin, message, Tooltip } from 'antd';
import StudentAssignmentsTab from '../../../assignment/student/components/StudentAssignmentsTab';
import { ArrowRight, RefreshCw, Target } from 'lucide-react';
import { getCourseQuizzes, getLessonQuizzes } from '../../../quiz/student/api/quizApi';


export default function CourseDetail() {
    const { courseId } = useParams();
    const [expandedSections, setExpandedSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'assignments'

    const [sectionsData, setSectionsData] = useState([]);
    const [summativeQuizzes, setSummativeQuizzes] = useState([]);
    const [formativeQuizzes, setFormativeQuizzes] = useState([]);
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
            // Fetch Summative
            const res = await getCourseQuizzes(courseId);
            const items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            setSummativeQuizzes(items);

            // Fetch Formative
            let formatives = [];
            if (sectionsData.length > 0) {
                const lessonIds = sectionsData.flatMap(s => (s.lessons || []).map(l => l.id || l.lessonId));

                const promises = lessonIds.map(id => getLessonQuizzes(id).catch(() => null));
                const results = await Promise.all(promises);

                results.forEach((res, index) => {
                    const list = res?.data || res || [];
                    if (Array.isArray(list)) {
                        let lName = "Bài học";
                        for (const s of sectionsData) {
                            const l = (s.lessons || []).find(x => (x.id || x.lessonId) === lessonIds[index]);
                            if (l) lName = l.title || l.name || "Bài học";
                        }

                        formatives = [...formatives, ...list.map(q => ({
                            ...q,
                            lessonName: lName
                        }))];
                    }
                });
            }
            setFormativeQuizzes(formatives);

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
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* --- COURSE INFO CARD --- */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 relative w-32 h-32 md:w-48 md:h-32 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center border border-slate-100 shadow-sm text-[#0487e2]">
                            {courseData.thumbnail ? (
                                <img
                                    src={courseData.thumbnail}
                                    className="absolute inset-0 z-10 w-full h-full object-cover"
                                    alt="Thumbnail"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <BookOpen size={48} className="opacity-50" />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {courseInfo.title}
                                </h1>
                                <p className="text-slate-500 text-sm max-w-3xl leading-relaxed line-clamp-2">
                                    {courseData.description || "Chào mừng bạn đến với khóa học."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 gap-y-4 pt-4 mt-2 justify-between items-center border-t border-slate-100">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <User size={16} className="text-blue-500" />
                                        <span className="font-bold text-slate-700">{courseInfo.instructor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Clock size={16} className="text-amber-500" />
                                        <span className="font-bold text-slate-700">
                                            {courseInfo.totalHours}h {courseData.totalDuration % 60 || 0}m
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <ListChecks size={16} className="text-emerald-500" />
                                        <span className="font-bold text-slate-700">{courseInfo.totalLessons}</span> bài học
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-semibold text-slate-500">Tiến trình</div>
                                        <div className="w-24 bg-slate-100 rounded-full h-1.5 flex flex-col justify-center">
                                            <div
                                                className="bg-[#0487e2] h-1.5 rounded-full"
                                                style={{ width: `${courseInfo.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-[#0487e2]">{courseInfo.progress}%</span>
                                    </div>

                                    {sections.length > 0 && sections[0].items.length > 0 ? (
                                        <Link
                                            to={`/dashboard/student/courses/${courseId}/lessons/${sections[0].items[0].id}`}
                                            className="flex items-center gap-2 px-5 py-2 bg-[#0487e2] hover:bg-[#0374c4] text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                                        >
                                            <PlayCircle size={16} />
                                            Học tiếp
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
                                            <Lock size={14} />
                                            Khóa học đang cập nhật
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-200 mb-6 font-sans">
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'curriculum' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('curriculum')}
                    >
                        Chương trình học
                    </button>
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'assignments' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        Bài tập (Assignments)
                    </button>
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'quizzes' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('quizzes')}
                    >
                        Hệ thống Kiểm tra
                    </button>
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
                                            className={`group/section border rounded-xl overflow-hidden transition-all duration-300 bg-white ${isExpanded ? 'border-blue-100 shadow-sm' : 'border-slate-100 hover:border-blue-100/50'}`}
                                        >
                                            <button
                                                onClick={() => !isLocked && toggleSection(section.id)}
                                                className={`w-full p-4 flex items-center justify-between transition-colors ${isLocked ? 'cursor-not-allowed bg-slate-50/50 opacity-80' : 'hover:bg-slate-50/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isLocked ? 'bg-slate-100 text-slate-400' : section.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0487e2]'}`}>
                                                        {isLocked ? (
                                                            <Lock size={18} />
                                                        ) : section.completed ? (
                                                            <CheckCircle size={18} strokeWidth={2.5} />
                                                        ) : (
                                                            <BookOpen size={18} strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-base text-slate-800 tracking-tight leading-none mb-1.5">{section.title}</h3>
                                                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 leading-none">
                                                            <span className={section.completed ? "text-emerald-500 font-bold" : ""}>{section.status}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                            <span>{section.lessonsCount} Bài học</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                            <span>{section.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'text-[#0487e2] rotate-180 bg-blue-50' : 'text-slate-400 bg-transparent hover:bg-slate-100'}`}>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                )}
                                            </button>

                                            {isExpanded && !isLocked && section.items.map((item, idx) => (
                                                <div key={item.id} className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <Link
                                                        to={item.type === 'quiz' ? `/dashboard/student/quizzes/${item.id}` : `/dashboard/student/courses/${courseId}/lessons/${item.id}`}
                                                        className="group flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-sm transition-all"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.completed ? 'bg-emerald-50 text-emerald-600' : item.type === 'quiz' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-[#0487e2]'}`}>
                                                                {item.completed ? (
                                                                    <CheckCircle size={14} strokeWidth={2.5} />
                                                                ) : item.type === 'quiz' ? (
                                                                    <ListChecks size={14} />
                                                                ) : (
                                                                    <PlayCircle size={14} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h4 className={`text-sm font-semibold transition-colors ${item.completed ? 'text-slate-400 line-through decoration-1' : 'text-slate-700 group-hover:text-[#0487e2]'}`}>
                                                                        {item.title}
                                                                    </h4>
                                                                    {item.isNew && (
                                                                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase rounded">Mới</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1 text-slate-400">
                                                                        <Clock size={10} />
                                                                        <span className="text-xs font-medium">{item.duration}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100 px-1 rounded">
                                                                        {item.type === 'quiz' ? 'Kiểm tra' : 'Video bài giảng'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-md bg-transparent text-slate-300 group-hover:text-[#0487e2] flex items-center justify-center transition-colors">
                                                            <ArrowRight size={16} />
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                                            <ListChecks size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 leading-none mb-1">Hệ thống bài kiểm tra</h2>
                                            <p className="text-sm text-slate-500 font-medium">Hoàn thành bài tập để củng cố kiến thức</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchQuizzes}
                                        disabled={quizzesLoading}
                                        className="p-3 md:px-5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                    >
                                        <RefreshCw size={18} className={quizzesLoading ? 'animate-spin' : ''} />
                                        <span className="text-sm font-bold hidden md:inline">Làm mới</span>
                                    </button>
                                </div>

                                {quizzesLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <Spin size="large" />
                                        <p className="text-slate-400 font-medium tracking-wide">Đang tải danh sách bài tập...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {/* Summative Quizzes */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-l-4 border-amber-400 pl-4">
                                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                                    <Trophy size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-0.5">Bài tập tổng kết (Summative)</h3>
                                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Đánh giá chung khóa học</p>
                                                </div>
                                            </div>

                                            {summativeQuizzes.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {summativeQuizzes.map((quiz, idx) => (
                                                        <div key={quiz.id || idx} className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 text-left shadow-sm hover:shadow-2xl hover:border-amber-200 hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />

                                                            <div className="relative z-10">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex gap-3">
                                                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                                                                            <ListChecks size={22} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-base font-bold text-slate-900 leading-tight mb-1 truncate">{quiz.title || 'Bài tập tổng kết'}</h4>
                                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200 shadow-sm">Summative</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-3 mb-6">
                                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Câu hỏi</span>
                                                                        <span className="text-sm font-bold text-slate-800">{quiz.totalQuestions || quiz.questions?.length || 0}</span>
                                                                    </div>
                                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</span>
                                                                        <span className="text-sm font-bold text-slate-800">{quiz.duration || quiz.timeLimit || 0}p</span>
                                                                    </div>
                                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm đạt</span>
                                                                        <span className="text-sm font-bold text-emerald-600">{quiz.passingScore || 50}%</span>
                                                                    </div>
                                                                </div>

                                                                <Link
                                                                    to={`/dashboard/student/quizzes/${quiz.id || quiz.quizId}`}
                                                                    className="w-full h-11 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-[#0487e2] transition-colors shadow-md group-hover:shadow-blue-500/20"
                                                                >
                                                                    Làm bài ngay
                                                                    <ArrowRight size={16} />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                                                    <ListChecks size={32} className="mx-auto text-slate-300 mb-3" />
                                                    <p className="text-sm font-medium text-slate-500">Chưa có bài tập tổng kết nào.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Formative Quizzes */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-l-4 border-blue-400 pl-4">
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-0.5">Bài luyện tập (Formative)</h3>
                                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Đánh giá theo bài học</p>
                                                </div>
                                            </div>

                                            {formativeQuizzes.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {formativeQuizzes.map((quiz, idx) => (
                                                        <div key={quiz.id || idx} className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 text-left shadow-sm hover:shadow-xl hover:border-blue-200 hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />

                                                            <div className="relative z-10">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                                                            <FileText size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1 truncate max-w-[180px]">{quiz.title || 'Bài luyện tập'}</h4>
                                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded border border-blue-200">Formative</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {quiz.lessonName && (
                                                                    <div className="flex items-center gap-1.5 mb-5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                                                                        <BookOpen size={12} className="text-slate-400" />
                                                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">
                                                                            Bài: {quiz.lessonName}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                                    <div className="flex items-center gap-2 bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                                                                        <Clock size={14} className="text-slate-400" />
                                                                        <span className="text-xs font-bold text-slate-700">{quiz.timeLimit || 0} phút</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                                                                        <Target size={14} className="text-emerald-500" />
                                                                        <span className="text-xs font-bold text-slate-700">{quiz.questions?.length || quiz.totalQuestions || 0} câu</span>
                                                                    </div>
                                                                </div>

                                                                <Link
                                                                    to={`/dashboard/student/quizzes/${quiz.id || quiz.quizId}`}
                                                                    className="w-full h-10 flex items-center justify-center gap-2 bg-[#0487e2] text-white rounded-xl font-bold text-xs hover:bg-[#0374c4] transition-colors shadow-sm"
                                                                >
                                                                    Bắt đầu luyện tập
                                                                    <ArrowRight size={14} />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                                                    <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
                                                    <p className="text-sm font-medium text-slate-500">Chưa có bài luyện tập nào.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        {/* Live/Next session info */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock size={14} className="text-[#0487e2]" />
                                Lịch học tiếp theo
                            </h4>
                            <div className="p-4 bg-blue-50 rounded-lg mb-4">
                                <p className="text-sm font-bold text-slate-800 mb-1">{nextClass.title}</p>
                                <p className="text-xs text-slate-500 mb-2">{nextClass.description}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#0487e2]">
                                    <Clock size={12} />
                                    {nextClass.time}
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                                Mở Zoom / Google Meet
                            </button>
                        </div>

                        {/* Resources area */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" />
                                Học liệu bổ trợ
                            </h4>
                            <div className="space-y-2">
                                {resources.map((resource, rIdx) => {
                                    const Icon = resource.icon;
                                    return (
                                        <button
                                            key={resource.id}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border-transparent hover:border-blue-100 group shadow-sm text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0487e2] shadow-sm transition-colors">
                                                    <Icon size={14} />
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <span className="block text-[13px] font-semibold text-slate-700 truncate">{resource.title}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">PDF • 1.2MB</span>
                                                </div>
                                            </div>
                                            <div className="w-7 h-7 rounded text-slate-300 group-hover:text-[#0487e2] flex items-center justify-center transition-colors">
                                                <Download size={14} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Instructor Note */}
                        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 text-white shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 overflow-hidden">
                                        {courseData.instructorThumbnail ? (
                                            <img src={courseData.instructorThumbnail} className="w-full h-full object-cover" alt="Instructor" />
                                        ) : (
                                            <User size={18} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5 font-bold">Lời nhắn từ Giảng viên</p>
                                        <h5 className="text-sm font-bold">{courseInfo.instructor}</h5>
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 text-sm font-medium leading-relaxed italic border border-white/10 backdrop-blur-sm">
                                    "Các em nhớ hoàn thành bài tập trắc nghiệm chương 1 trước thứ Sáu tuần này để thầy tổng hợp điểm cộng nhé. Chúc các em học tốt!"
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
