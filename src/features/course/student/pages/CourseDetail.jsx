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
    ListChecks
} from 'lucide-react';
import { getClassDetail } from '../../../classes/api/classApi';
import { Spin, message } from 'antd';

export default function CourseDetail() {
    const { courseId } = useParams();
    const [expandedSections, setExpandedSections] = useState([1]);
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await getClassDetail(courseId);
                const data = res?.data || res;
                setCourseData(data);

                // Mở section đầu tiên mặc định
                if (data.sections && data.sections.length > 0) {
                    setExpandedSections([data.sections[0].id]);
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết khóa học:", error);
                message.error("Không thể tải thông tin khóa học");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [courseId]);

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

    // Mapping sections từ API sang format UI
    const apiSections = courseData.sections || [];
    const sections = apiSections.map((s, index) => ({
        id: s.id,
        title: s.title || `Chương ${index + 1}: ${s.name || 'Nội dung'}`,
        status: s.isLocked ? 'Đã khóa' : s.isCompleted ? 'Đã hoàn thành' : 'Đang học',
        lessons: s.lessonsCount || (s.items ? s.items.length : 0),
        duration: s.duration || '---',
        completed: s.isCompleted || false,
        description: s.description || '',
        items: (s.items || []).map(item => ({
            id: item.id,
            type: item.type?.toLowerCase() || 'video',
            title: item.title || item.name || 'Bài học',
            duration: item.duration || '45 p',
            completed: item.isCompleted || false,
            isNew: item.isNew || false
        }))
    }));

    const resources = courseData.resources || [
        { id: 1, title: 'Đề cương ôn tập.pdf', icon: Download },
        { id: 2, title: 'Bảng công thức bổ trợ', icon: FileText }
    ];

    const nextClass = {
        title: 'Tiết học tiếp theo',
        description: courseData.nextClassTopic || 'Chuyên đề học tập tiếp theo',
        time: courseData.nextClassTime || 'Xem lịch để biết thêm chi tiết'
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content - Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Course Header */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={36} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-2">
                                        {courseInfo.tag}
                                    </span>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{courseInfo.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <User size={16} /> GV: {courseInfo.instructor}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {courseInfo.totalHours} tiết học
                                        </span>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-[#0487e2] hover:bg-[#0463ca] text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <PlayCircle size={18} />
                                    Vào Học Ngay
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiến Độ Học Kỳ</span>
                                    <span className="text-sm text-slate-600">{courseInfo.completedLessons}/{courseInfo.totalLessons} bài đã học</span>
                                </div>
                                <div className="mb-3">
                                    <div className="text-2xl font-bold text-slate-900 mb-2">{courseInfo.progress}% Hoàn thành</div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${courseInfo.progress}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                    Bài tiếp theo: Giao thoa sóng (Tiết 18)
                                </p>
                            </div>
                        </div>

                        {/* Course Curriculum */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Đề Cương Môn Học</h2>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Mở Rộng Tất Cả
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sections.map((section) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const isLocked = section.status === 'Đã khóa' || section.status === 'Sắp học';

                                    return (
                                        <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-slate-300">
                                            {/* Section Header */}
                                            <button
                                                onClick={() => !isLocked && toggleSection(section.id)}
                                                className={`w-full p-4 flex items-center justify-between transition-colors ${isLocked ? 'cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLocked ? 'bg-slate-100' : section.completed ? 'bg-green-50' : 'bg-blue-50'
                                                        }`}>
                                                        {isLocked ? (
                                                            <Lock size={20} className="text-slate-400" />
                                                        ) : section.completed ? (
                                                            <CheckCircle size={20} className="text-green-600" />
                                                        ) : (
                                                            <Circle size={20} className="text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-base text-slate-900 mb-0.5">{section.title}</h3>
                                                        <p className="text-xs text-slate-500">
                                                            {section.status} • {section.lessons} bài • {section.duration}
                                                            {section.description && <span className="block text-indigo-600 mt-1 italic">Note: {section.description}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronUp size={20} className="text-slate-400" />
                                                        ) : (
                                                            <ChevronDown size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Section Items */}
                                            {isExpanded && !isLocked && section.items.length > 0 && (
                                                <div className="border-t border-slate-200 bg-slate-50/50">
                                                    {section.items.map((item) => {
                                                        const isQuiz = item.type === 'quiz';
                                                        return (
                                                            <Link
                                                                key={item.id}
                                                                to={isQuiz
                                                                    ? `/dashboard/student/quizzes/quiz-ch${section.id}-${item.id}`
                                                                    : `/dashboard/student/courses/${courseId}/lessons/lesson-${section.id}-${item.id}`
                                                                }
                                                                className="px-5 py-3.5 flex items-center justify-between hover:bg-white transition-colors border-b border-slate-100 last:border-b-0 group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : isQuiz ? 'bg-orange-100' : 'bg-slate-100'
                                                                        }`}>
                                                                        {item.completed ? (
                                                                            <CheckCircle size={16} className="text-green-600" />
                                                                        ) : isQuiz ? (
                                                                            <ListChecks size={16} className="text-orange-600" />
                                                                        ) : (
                                                                            <PlayCircle size={16} className="text-slate-400" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm font-medium ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                                                                                }`}>
                                                                                {item.title}
                                                                            </span>
                                                                            {item.isNew && (
                                                                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                                                                    MỚI
                                                                                </span>
                                                                            )}
                                                                            {isQuiz && (
                                                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded uppercase">
                                                                                    Quiz
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-slate-500">
                                                                            {isQuiz ? 'Bài kiểm tra' : 'Bài giảng Video'} • {item.duration}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className={`p-1.5 rounded-lg transition-colors ${isQuiz ? 'text-orange-600 group-hover:bg-orange-50' : 'text-blue-600 group-hover:text-blue-700 group-hover:bg-blue-50'
                                                                    }`}>
                                                                    {isQuiz ? <ListChecks size={18} /> : <PlayCircle size={18} />}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Column (1/3) */}
                    <div className="space-y-6">

                        {/* Live Session Info */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Clock size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-1">{nextClass.title}</h3>
                                    <p className="text-xs text-slate-600 mb-1">{nextClass.description}</p>
                                    <p className="text-xs text-slate-700 font-medium">{nextClass.time}</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                                Xem Lịch Học
                            </button>
                        </div>

                        {/* Course Resources */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-700 mb-4 uppercase tracking-wider">Tài Liệu Môn Học</h3>
                            <div className="space-y-2">
                                {resources.map((resource) => {
                                    const Icon = resource.icon;
                                    return (
                                        <button
                                            key={resource.id}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <Icon size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{resource.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                            <h3 className="text-sm font-bold text-yellow-800 mb-2">Lưu ý của Giáo viên</h3>
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Các em nhớ hoàn thành bài tập trắc nghiệm chương 1 trước thứ Sáu tuần này để thầy tổng hợp điểm cộng nhé.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                <span className="text-xs font-medium text-slate-600">Thầy Hùng</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
