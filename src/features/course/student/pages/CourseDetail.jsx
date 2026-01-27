import React, { useState } from 'react';
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

export default function CourseDetail() {
    const { courseId } = useParams();
    const [expandedSections, setExpandedSections] = useState([1, 2]);

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    const courseInfo = {
        title: 'Vật Lý 12 - Luyện Thi THPT',
        instructor: 'Cô Trần Thị Mai',
        totalHours: 60,
        progress: 40,
        completedLessons: 12,
        totalLessons: 30,
        tag: 'BAN TỰ NHIÊN'
    };

    const sections = [
        {
            id: 1,
            title: 'Chương 1: Dao Động Cơ',
            status: 'Đã hoàn thành',
            lessons: 10,
            duration: '15 tiết',
            completed: true,
            items: [
                { id: 1, type: 'video', title: '1.1 Dao động điều hòa', duration: '45 p', completed: true },
                { id: 2, type: 'video', title: '1.2 Con lắc lò xo', duration: '45 p', completed: true },
                { id: 3, type: 'video', title: '1.3 Con lắc đơn', duration: '45 p', completed: true },
                { id: 4, type: 'video', title: '1.4 Dao động tắt dần, dao động cưỡng bức', duration: '45 p', completed: true },
                { id: 5, type: 'quiz', title: 'Kiểm tra 15 phút: Dao động cơ', duration: '15 p', completed: false, isNew: true }
            ]
        },
        {
            id: 2,
            title: 'Chương 2: Sóng Cơ và Sóng Âm',
            status: 'Đang học',
            lessons: 8,
            duration: '12 tiết',
            completed: false,
            items: [
                { id: 1, type: 'video', title: '2.1 Sóng cơ và sự truyền sóng cơ', duration: '45 p', completed: true },
                { id: 2, type: 'video', title: '2.2 Giao thoa sóng', duration: '45 p', completed: false, isNew: true },
                { id: 3, type: 'quiz', title: 'Bài tập trắc nghiệm: Giao thoa sóng', duration: '20 p', completed: false },
                { id: 4, type: 'video', title: '2.3 Sóng dừng', duration: '45 p', completed: false }
            ]
        },
        {
            id: 3,
            title: 'Chương 3: Dòng Điện Xoay Chiều',
            status: 'Sắp học',
            lessons: 12,
            duration: '18 tiết',
            completed: false,
            items: []
        },
        {
            id: 4,
            title: '[Bổ sung] Chuyên đề Ôn thi Đại học',
            description: 'Nội dung nâng cao do GV biên soạn thêm',
            status: 'Đã khóa',
            lessons: 5,
            duration: '10 tiết',
            completed: false,
            items: []
        }
    ];

    const resources = [
        { id: 1, title: 'Đề cương ôn tập HK1.pdf', icon: Download },
        { id: 2, title: 'Bảng công thức Vật Lý 12', icon: FileText },
        { id: 3, title: 'Nhóm Zalo lớp học tập', icon: MessageSquare }
    ];

    const nextClass = {
        title: 'Tiết học tiếp theo',
        description: 'Chuyên đề: Bài tập Giao thoa sóng',
        time: 'Thứ Tư, Tiết 3-4 (9:00 AM)'
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content - Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Course Header */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={36} className="text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                        {courseInfo.tag}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{courseInfo.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            <User size={16} /> GV: {courseInfo.instructor}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {courseInfo.totalHours} tiết học
                                        </span>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <PlayCircle size={18} />
                                    Vào Học Ngay
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tiến Độ Học Kỳ</span>
                                    <span className="text-sm text-gray-600">{courseInfo.completedLessons}/{courseInfo.totalLessons} bài đã học</span>
                                </div>
                                <div className="mb-3">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">{courseInfo.progress}% Hoàn thành</div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${courseInfo.progress}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                    Bài tiếp theo: Giao thoa sóng (Tiết 18)
                                </p>
                            </div>
                        </div>

                        {/* Course Curriculum */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Đề Cương Môn Học</h2>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Mở Rộng Tất Cả
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sections.map((section) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const isLocked = section.status === 'Đã khóa' || section.status === 'Sắp học';

                                    return (
                                        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
                                            {/* Section Header */}
                                            <button
                                                onClick={() => !isLocked && toggleSection(section.id)}
                                                className={`w-full p-4 flex items-center justify-between transition-colors ${isLocked ? 'cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLocked ? 'bg-gray-100' : section.completed ? 'bg-green-50' : 'bg-blue-50'
                                                        }`}>
                                                        {isLocked ? (
                                                            <Lock size={20} className="text-gray-400" />
                                                        ) : section.completed ? (
                                                            <CheckCircle size={20} className="text-green-600" />
                                                        ) : (
                                                            <Circle size={20} className="text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-base text-gray-900 mb-0.5">{section.title}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {section.status} • {section.lessons} bài • {section.duration}
                                                            {section.description && <span className="block text-indigo-600 mt-1 italic">Note: {section.description}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronUp size={20} className="text-gray-400" />
                                                        ) : (
                                                            <ChevronDown size={20} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Section Items */}
                                            {isExpanded && !isLocked && section.items.length > 0 && (
                                                <div className="border-t border-gray-200 bg-gray-50/50">
                                                    {section.items.map((item) => {
                                                        const isQuiz = item.type === 'quiz';
                                                        return (
                                                            <Link
                                                                key={item.id}
                                                                to={isQuiz
                                                                    ? `/dashboard/student/quizzes/quiz-ch${section.id}-${item.id}`
                                                                    : `/dashboard/student/courses/${courseId}/lessons/lesson-${section.id}-${item.id}`
                                                                }
                                                                className="px-5 py-3.5 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-100 last:border-b-0 group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : isQuiz ? 'bg-orange-100' : 'bg-gray-100'
                                                                        }`}>
                                                                        {item.completed ? (
                                                                            <CheckCircle size={16} className="text-green-600" />
                                                                        ) : isQuiz ? (
                                                                            <ListChecks size={16} className="text-orange-600" />
                                                                        ) : (
                                                                            <PlayCircle size={16} className="text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
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
                                                                        <span className="text-xs text-gray-500">
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
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Clock size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{nextClass.title}</h3>
                                    <p className="text-xs text-gray-600 mb-1">{nextClass.description}</p>
                                    <p className="text-xs text-gray-700 font-medium">{nextClass.time}</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                                Xem Lịch Học
                            </button>
                        </div>

                        {/* Course Resources */}
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Tài Liệu Môn Học</h3>
                            <div className="space-y-2">
                                {resources.map((resource) => {
                                    const Icon = resource.icon;
                                    return (
                                        <button
                                            key={resource.id}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <Icon size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{resource.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                            <h3 className="text-sm font-bold text-yellow-800 mb-2">Lưu ý của Giáo viên</h3>
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Các em nhớ hoàn thành bài tập trắc nghiệm chương 1 trước thứ Sáu tuần này để thầy tổng hợp điểm cộng nhé.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                <span className="text-xs font-medium text-gray-600">Thầy Hùng</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
