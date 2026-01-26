import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Play,
    Pause,
    Volume2,
    Maximize,
    Settings,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Send,
    FileText,
    Download,
    CheckCircle,
    Circle,
    Lightbulb,
    AlertCircle,
    PlayCircle,
    Lock,
    Search,
    Menu,
    X
} from 'lucide-react';

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const [activeTab, setActiveTab] = useState('content');
    const [isPlaying, setIsPlaying] = useState(false);
    const [expandedSections, setExpandedSections] = useState([1, 2]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Xin chào! Tôi ở đây để hỗ trợ bạn với bài học về Phân cấp Thị giác hôm nay. Bạn muốn tìm hiểu gì?',
            suggestions: [
                'Tóm tắt "Tháp Phân cấp"',
                'Giải thích bằng tiếng Nhật #MachineTranslation'
            ]
        },
        {
            id: 2,
            type: 'user',
            text: 'Sự khác biệt giữa phân cấp và căn chỉnh là gì?'
        },
        {
            id: 3,
            type: 'ai',
            text: 'Câu hỏi hay! Phân cấp là sự sắp xếp trực quan các yếu tố để thể hiện thứ tự quan trọng của chúng. Các nhà thiết kế sử dụng nó để hướng sự chú ý của người dùng đến thông tin quan trọng nhất trước tiên, tạo ra một sự ưu tiên cụ thể cho các yếu tố.',
            isTyping: false
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    const lessonInfo = {
        courseId: courseId || 'ui-design',
        courseName: 'Nguyên Lý Thiết Kế UI Nâng Cao',
        lessonTitle: 'Làm Chủ Nền Tảng UI',
        lessonSubtitle: '1.2 Hiểu về Phân cấp Thị giác',
        progress: 65,
        duration: '18:45',
        currentTime: '12:10'
    };

    const courseSections = [
        {
            id: 1,
            title: 'Chương 1: Nền Tảng UI',
            lessons: [
                { id: 1, title: '1.1 Giới thiệu về Tư duy Thiết kế', duration: '15:20', completed: true },
                { id: 2, title: '1.2 Cơ bản về Phân cấp Thị giác', duration: '18:45', completed: false, isCurrent: true },
                { id: 3, title: '1.3 Thấu hiểu Nhu cầu Người dùng', duration: '22:10', completed: false }
            ]
        },
        {
            id: 2,
            title: 'Chương 2: Typography & Lý thuyết Màu sắc',
            lessons: [
                { id: 1, title: '2.1 Nền tảng Font chữ', duration: '16:30', completed: false },
                { id: 2, title: '2.2 Tâm lý học Màu sắc', duration: '19:25', completed: false },
                { id: 3, title: '2.3 Chọn Font chữ Phù hợp', duration: '12:30', completed: false, isNew: true }
            ]
        },
        {
            id: 3,
            title: 'Chương 3: Hệ thống Lưới & Bố cục',
            lessons: [],
            isLocked: true
        }
    ];

    const tabs = [
        { id: 'content', label: 'Nội Dung', icon: FileText },
        { id: 'quizzes', label: 'Bài Kiểm Tra', icon: CheckCircle },
        { id: 'examples', label: 'Ví Dụ', icon: Lightbulb },
        { id: 'reflection', label: 'Phản Tư', icon: MessageSquare }
    ];

    const lessonMaterials = [
        { id: 1, title: 'Tom_tat_bai_giang.pdf', type: 'pdf', icon: FileText },
        { id: 2, title: 'Nghiên cứu điển hình: Apple.com', type: 'link', icon: FileText }
    ];

    const contentSections = [
        {
            id: 1,
            icon: '📘',
            title: 'Hiểu về Phân cấp Thị giác',
            content: 'Phân cấp thị giác là nguyên tắc sắp xếp các yếu tố để thể hiện thứ tự quan trọng của chúng. Các nhà thiết kế sử dụng nó để hướng sự chú ý của người dùng đến thông tin quan trọng nhất trước tiên, đảm bảo trải nghiệm người dùng liền mạch.',
            subsections: [
                {
                    title: 'Ba trụ cột chính chúng ta khám phá hôm nay:',
                    items: [
                        { label: 'Kích thước và Tỷ lệ:', text: 'Các yếu tố lớn hơn tự nhiên thu hút ánh nhìn trước tiên, thiết lập sự ưu tiên rõ ràng.' },
                        { label: 'Màu sắc và Độ tương phản:', text: 'Màu sắc tương phản cao tạo ra các điểm nhấn trên nền trung tính.' },
                        { label: 'Typography:', text: 'Sử dụng độ đậm nhạt (Bold, Medium, Light) để phân biệt cấp bậc.' }
                    ]
                }
            ]
        },
        {
            id: 2,
            icon: '🎯',
            title: 'Ứng dụng Thực tế',
            examples: [
                {
                    title: 'THỰC HÀNH HIỆU QUẢ',
                    description: 'Điểm nhấn rõ ràng với Lời kêu gọi hành động (CTA) mạnh mẽ và khoảng trắng đồ họa.',
                    type: 'success'
                },
                {
                    title: 'TRÁNH ĐIỀU NÀY',
                    description: 'Quá nhiều yếu tố cạnh tranh mà không có đường dẫn thị giác rõ ràng cho người dùng.',
                    type: 'error'
                }
            ]
        }
    ];

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            setChatMessages([...chatMessages, {
                id: chatMessages.length + 1,
                type: 'user',
                text: inputMessage
            }]);
            setInputMessage('');

            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    id: prev.length + 1,
                    type: 'ai',
                    text: 'Tôi hiểu câu hỏi của bạn. Hãy để tôi giúp bạn...',
                    isTyping: false
                }]);
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-30">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {showMobileSidebar ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <Link
                            to={`/dashboard/student/courses/${lessonInfo.courseId}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Quay lại Khóa học</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="hidden sm:block">
                            <h1 className="text-base md:text-lg font-bold text-gray-900">{lessonInfo.lessonTitle}</h1>
                            <p className="text-xs md:text-sm text-gray-500">{lessonInfo.lessonSubtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Tiến độ</div>
                            <div className="text-sm font-bold text-gray-900">{lessonInfo.progress}%</div>
                        </div>
                        <div className="w-24 md:w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{ width: `${lessonInfo.progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto flex">

                {/* Left Sidebar - Course Curriculum */}
                <div className={`${showMobileSidebar ? 'fixed inset-0 z-40 bg-black/50' : 'hidden'
                    } lg:block lg:relative lg:bg-transparent`}
                    onClick={() => setShowMobileSidebar(false)}
                >
                    <div
                        className={`w-80 bg-white border-r border-gray-200 h-[calc(100vh-73px)] overflow-y-auto ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
                            } lg:translate-x-0 transition-transform duration-300 fixed lg:sticky top-[73px] left-0 z-50`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài học..."
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Course Sections */}
                        <div className="p-4 space-y-2">
                            {courseSections.map((section) => {
                                const isExpanded = expandedSections.includes(section.id);
                                const isLocked = section.isLocked;

                                return (
                                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => !isLocked && toggleSection(section.id)}
                                            className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isLocked ? 'cursor-not-allowed opacity-60' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {isLocked ? (
                                                    <Lock size={16} className="text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <PlayCircle size={16} className="text-blue-600 flex-shrink-0" />
                                                )}
                                                <span className="font-semibold text-sm text-gray-900 truncate">{section.title}</span>
                                            </div>
                                            {!isLocked && (
                                                isExpanded ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                                            )}
                                        </button>

                                        {isExpanded && !isLocked && section.lessons.length > 0 && (
                                            <div className="bg-gray-50 border-t border-gray-200">
                                                {section.lessons.map((lesson) => (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/dashboard/student/courses/${courseId}/lessons/lesson-${section.id}-${lesson.id}`}
                                                        className={`flex items-start gap-3 p-3 hover:bg-white transition-colors border-b border-gray-100 last:border-b-0 ${lesson.isCurrent ? 'bg-green-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            {lesson.completed ? (
                                                                <CheckCircle size={18} className="text-green-600" />
                                                            ) : lesson.isCurrent ? (
                                                                <PlayCircle size={18} className="text-green-600" />
                                                            ) : (
                                                                <Circle size={18} className="text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className={`text-sm font-medium truncate ${lesson.isCurrent ? 'text-green-700' : 'text-gray-900'
                                                                    }`}>
                                                                    {lesson.title}
                                                                </p>
                                                                {lesson.isNew && (
                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded flex-shrink-0">
                                                                        🔥
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span>📹 Video</span>
                                                                <span>•</span>
                                                                <span>⏱️ {lesson.duration}</span>
                                                            </div>
                                                        </div>
                                                        {lesson.isCurrent && (
                                                            <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-1" />
                                                        )}
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

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row min-w-0">

                    {/* Center - Video & Content */}
                    <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">

                        {/* Video Player */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="relative z-10 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                                >
                                    {isPlaying ? (
                                        <Pause size={28} className="text-white" />
                                    ) : (
                                        <Play size={28} className="text-white ml-1" />
                                    )}
                                </button>

                                {/* Video Controls */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="flex items-center gap-3 text-white">
                                        <button className="hover:text-blue-400 transition-colors">
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <div className="flex-1 bg-white/30 rounded-full h-1 overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="text-xs font-medium">{lessonInfo.currentTime} / {lessonInfo.duration}</span>
                                        <button className="hover:text-blue-400 transition-colors">
                                            <Volume2 size={20} />
                                        </button>
                                        <button className="hover:text-blue-400 transition-colors">
                                            <Settings size={20} />
                                        </button>
                                        <button className="hover:text-blue-400 transition-colors">
                                            <Maximize size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="border-b border-gray-200 overflow-x-auto">
                                <div className="flex gap-1 p-2 min-w-max">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-4 md:p-6">
                                {activeTab === 'content' && (
                                    <div className="space-y-6">
                                        {contentSections.map((section) => (
                                            <div key={section.id} className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{section.icon}</span>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                                                        {section.content && (
                                                            <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
                                                        )}

                                                        {section.subsections && section.subsections.map((subsection, idx) => (
                                                            <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                                                <p className="font-semibold text-gray-900 mb-3">{subsection.title}</p>
                                                                <ul className="space-y-2">
                                                                    {subsection.items.map((item, itemIdx) => (
                                                                        <li key={itemIdx} className="text-sm text-gray-700">
                                                                            <span className="font-semibold">{item.label}</span> {item.text}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}

                                                        {section.examples && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                                {section.examples.map((example, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`p-4 rounded-lg border-2 ${example.type === 'success'
                                                                                ? 'border-green-200 bg-green-50'
                                                                                : 'border-red-200 bg-red-50'
                                                                            }`}
                                                                    >
                                                                        <div className="aspect-video bg-white rounded-lg mb-3 flex items-center justify-center">
                                                                            {example.type === 'success' ? (
                                                                                <CheckCircle size={32} className="text-green-500" />
                                                                            ) : (
                                                                                <AlertCircle size={32} className="text-red-500" />
                                                                            )}
                                                                        </div>
                                                                        <h4 className={`text-xs font-bold uppercase tracking-wide mb-1 ${example.type === 'success' ? 'text-green-700' : 'text-red-700'
                                                                            }`}>
                                                                            {example.title}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600">{example.description}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab !== 'content' && (
                                    <div className="text-center py-12">
                                        <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Nội dung đang được cập nhật...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                <ArrowLeft size={18} />
                                Bài Trước
                            </button>
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
                                Hoàn Thành & Tiếp Tục
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Right Sidebar - AI Assistant & Materials */}
                    <div className="w-full lg:w-96 p-4 md:p-6 space-y-6 border-l border-gray-200 bg-white lg:bg-transparent">

                        {/* AI Student Assistant */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        <MessageSquare size={18} className="text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-white">Trợ Lý AI</h3>
                                </div>
                                <button className="text-white/80 hover:text-white">
                                    <Settings size={18} />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {chatMessages.map((message) => (
                                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                                            <div className={`rounded-2xl px-4 py-2.5 ${message.type === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-900'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{message.text}</p>
                                            </div>
                                            {message.suggestions && (
                                                <div className="mt-2 space-y-2">
                                                    {message.suggestions.map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg transition-colors"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Đặt câu hỏi..."
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    AI đã được kiểm duyệt trên Mô hình Học tập
                                </p>
                            </div>
                        </div>

                        {/* Lesson Materials */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Tài Liệu Bài Học</h3>
                            <div className="space-y-2">
                                {lessonMaterials.map((material) => (
                                    <button
                                        key={material.id}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                            <material.icon size={18} className="text-red-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 flex-1 truncate">{material.title}</span>
                                        <Download size={16} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
