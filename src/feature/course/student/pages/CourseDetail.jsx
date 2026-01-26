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
    Circle
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
        title: 'Nguyên Lý Thiết Kế UI Nâng Cao',
        instructor: 'GS. Sarah Jenkins',
        totalHours: 32,
        progress: 26,
        completedLessons: 12,
        totalLessons: 45,
        tag: 'LỘ TRÌNH THIẾT KẾ'
    };

    const sections = [
        {
            id: 1,
            title: 'Chương 1: Nền Tảng UI',
            status: 'Đang học',
            lessons: 3,
            duration: '3h 20m',
            completed: true,
            items: [
                { id: 1, title: '1.1 Giới thiệu về Tư duy Thiết kế', duration: '15:20', completed: true },
                { id: 2, title: '1.2 Cơ bản về Phân cấp Thị giác', duration: '18:45', completed: true },
                { id: 3, title: '1.3 Thấu hiểu Nhu cầu Người dùng', duration: '22:10', completed: true }
            ]
        },
        {
            id: 2,
            title: 'Chương 2: Typography & Lý thuyết Màu sắc',
            status: 'Đang học',
            lessons: 10,
            duration: '4h 30m',
            completed: false,
            items: [
                { id: 1, title: '2.3 Chọn Font chữ Phù hợp', duration: '12:30', completed: false, isNew: true },
                { id: 2, title: '2.4 Tâm lý học Màu sắc trong UI', duration: '19:25', completed: false },
                { id: 3, title: '2.5 Tạo Bảng màu Dễ tiếp cận', duration: '16:15', completed: false }
            ]
        },
        {
            id: 3,
            title: 'Chương 3: Hệ thống Lưới & Bố cục',
            status: 'Đã khóa',
            lessons: 8,
            duration: '5h 15m',
            completed: false,
            items: []
        },
        {
            id: 4,
            title: 'Chương 4: Đồ Án Cuối Khóa',
            status: 'Đã khóa',
            lessons: 3,
            duration: '8h',
            completed: false,
            items: []
        }
    ];

    const resources = [
        { id: 1, title: 'Tài liệu Khóa học (.fig, .pdf)', icon: Download },
        { id: 2, title: 'Thảo luận Học viên', icon: MessageSquare },
        { id: 3, title: 'Phiếu Hỗ trợ', icon: Ticket }
    ];

    const liveSession = {
        title: 'Giờ Giải Đáp Trực Tuyến',
        description: 'Tham gia cùng GS. Sarah trong buổi Q&A trực tiếp',
        time: 'Thứ Ba này lúc 20:00'
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
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={36} className="text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                        {courseInfo.tag}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{courseInfo.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            👨‍🏫 {courseInfo.instructor}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {courseInfo.totalHours} tổng giờ học
                                        </span>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <PlayCircle size={18} />
                                    Tiếp Tục Bài Học
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tiến Độ Của Bạn</span>
                                    <span className="text-sm text-gray-600">{courseInfo.completedLessons} trên {courseInfo.totalLessons} bài học đã hoàn thành</span>
                                </div>
                                <div className="mb-3">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành {courseInfo.progress}%</div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${courseInfo.progress}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                    Cột mốc tiếp theo: Tâm lý Người dùng (Bài 15)
                                </p>
                            </div>
                        </div>

                        {/* Course Curriculum */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Nội Dung Khóa Học</h2>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Mở Rộng Tất Cả
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sections.map((section) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const isLocked = section.status === 'Đã khóa';

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
                                                            {section.status} • {section.lessons} bài học • {section.duration}
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
                                                    {section.items.map((item) => (
                                                        <Link
                                                            key={item.id}
                                                            to={`/dashboard/student/courses/${courseId}/lessons/lesson-${section.id}-${item.id}`}
                                                            className="px-5 py-3.5 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-100 last:border-b-0 group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : 'bg-gray-100'
                                                                    }`}>
                                                                    {item.completed ? (
                                                                        <CheckCircle size={16} className="text-green-600" />
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
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Video • {item.duration}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-blue-600 group-hover:text-blue-700 p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                                <PlayCircle size={18} />
                                                            </div>
                                                        </Link>
                                                    ))}
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

                        {/* Course Resources */}
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Tài Nguyên Khóa Học</h3>
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

                        {/* Live Office Hours */}
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Video size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{liveSession.title}</h3>
                                    <p className="text-xs text-gray-600 mb-1">{liveSession.description}</p>
                                    <p className="text-xs text-gray-700 font-medium">{liveSession.time}</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                                Thêm vào Lịch
                            </button>
                            <p className="text-xs text-gray-600 text-center mt-4 pt-4 border-t border-blue-100">
                                Cần hỗ trợ? Liên hệ đội ngũ hỗ trợ học viên tại <br />
                                <a href="mailto:support@eduai.com" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                    support@eduai.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
