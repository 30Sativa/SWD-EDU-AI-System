import React, { useState, useRef, useEffect } from 'react';
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
    PanelLeftClose,
    PanelLeft,
    PanelRightClose,
    PanelRight,
    MoreVertical,
    Bot,
    ListChecks
} from 'lucide-react';

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const [activeTab, setActiveTab] = useState('content');
    const [isPlaying, setIsPlaying] = useState(false);

    // Sidebar States
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const [expandedSections, setExpandedSections] = useState([1, 2]);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Chào em! Thầy AI đây. Em có thắc mắc gì về bài Dao động điều hòa không?',
            suggestions: [
                'Công thức tính chu kỳ T?',
                'Giải thích pha ban đầu φ',
                'Vẽ đồ thị x = Acos(ωt + φ)'
            ]
        },
        {
            id: 2,
            type: 'user',
            text: 'Thầy giải thích giúp em ý nghĩa của tần số góc ạ?'
        },
        {
            id: 3,
            type: 'ai',
            text: 'Tần số góc (ω - omega) cho biết tốc độ biến đổi trạng thái dao động. Nó liên hệ với chu kỳ qua công thức ω = 2π / T. Đơn vị là rad/s nhé.',
            isTyping: false
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    const lessonInfo = {
        courseId: courseId || 'physics-12',
        courseName: 'Vật Lý 12 - Luyện Thi THPT',
        lessonTitle: 'Bài 1: Dao Động Điều Hòa',
        lessonSubtitle: 'Chương 1: Dao Động Cơ',
        progress: 40,
        duration: '45:00',
        currentTime: '15:20'
    };

    const courseSections = [
        {
            id: 1,
            title: 'Chương 1: Dao Động Cơ',
            lessons: [
                { id: 1, type: 'video', title: '1.1 Dao động điều hòa', duration: '45 p', completed: false, isCurrent: true },
                { id: 2, type: 'video', title: '1.2 Con lắc lò xo', duration: '45 p', completed: false },
                { id: 3, type: 'video', title: '1.3 Con lắc đơn', duration: '45 p', completed: false },
                { id: 4, type: 'video', title: '1.4 Dao động tắt dần', duration: '45 p', completed: false },
                { id: 5, type: 'quiz', title: 'Kiểm tra 15 phút: Dao động cơ', duration: '15 p', completed: false }
            ]
        },
        {
            id: 2,
            title: 'Chương 2: Sóng Cơ',
            lessons: [
                { id: 1, type: 'video', title: '2.1 Sự truyền sóng cơ', duration: '45 p', completed: false },
                { id: 2, type: 'video', title: '2.2 Giao thoa sóng', duration: '45 p', completed: false, isNew: true },
                { id: 3, type: 'quiz', title: 'Bài tập: Giao thoa sóng', duration: '20 p', completed: false },
                { id: 4, type: 'video', title: '2.3 Sóng dừng', duration: '45 p', completed: false }
            ]
        },
        {
            id: 3,
            title: 'Chương 3: Dòng Điện Xoay Chiều',
            lessons: [],
            isLocked: true
        }
    ];

    const tabs = [
        { id: 'content', label: 'Lý Thuyết', icon: FileText },
        { id: 'exercises', label: 'Bài Tập', icon: CheckCircle },
        { id: 'examples', label: 'Ví Dụ', icon: Lightbulb },
        { id: 'qa', label: 'Hỏi Đáp', icon: MessageSquare }
    ];

    const lessonMaterials = [
        { id: 1, title: 'Ly_thuyet_dao_dong.pdf', type: 'pdf', icon: FileText },
        { id: 2, title: 'Bai_tap_tu_luyen_Level_1.pdf', type: 'pdf', icon: FileText }
    ];

    const contentSections = [
        {
            id: 1,
            icon: '📖',
            title: 'Định nghĩa Dao động điều hòa',
            content: 'Dao động điều hòa là dao động trong đó li độ của vật là một hàm côsin (hay sin) của thời gian.',
            subsections: [
                {
                    title: 'Phương trình dao động:',
                    items: [
                        { label: 'x = Acos(ωt + φ)', text: '' },
                        { label: 'x:', text: 'Li độ (khoảng cách từ VTCB)' },
                        { label: 'A:', text: 'Biên độ (li độ cực đại, A > 0)' },
                        { label: 'ω (omega):', text: 'Tần số góc (rad/s)' },
                        { label: 'φ (phi):', text: 'Pha ban đầu (tại t=0)' }
                    ]
                }
            ]
        },
        {
            id: 2,
            icon: '⚡',
            title: 'Vận tốc và Gia tốc',
            examples: [
                {
                    title: 'VẬN TỐC (v)',
                    description: 'v = x\' = -ωAsin(ωt + φ). Vận tốc sớm pha pi/2 so với li độ.',
                    type: 'info'
                },
                {
                    title: 'GIA TỐC (a)',
                    description: 'a = v\' = -ω²x. Gia tốc ngược pha với li độ và tỉ lệ với li độ.',
                    type: 'warning'
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
                    text: 'Thầy đang suy nghĩ câu trả lời... (Giả lập AI)',
                    isTyping: false
                }]);
            }, 1000);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* 1. Header Navigation Bar */}
            <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/dashboard/student/courses/${lessonInfo.courseId}`}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                        title="Quay lại khóa học"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 leading-tight">{lessonInfo.lessonTitle}</h1>
                        <p className="text-xs text-gray-500">{lessonInfo.lessonSubtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiến độ</span>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${lessonInfo.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{lessonInfo.progress}%</span>
                    </div>
                </div>
            </div>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* 2.1 Left Sidebar - Curriculum */}
                <div
                    className={`${isLeftSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative`}
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">Nội Dung Bài Học</h2>
                        <button onClick={() => setIsLeftSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                            <PanelLeftClose size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Search Input */}
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm bài học..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border-0 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {courseSections.map((section) => (
                            <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => !section.isLocked && toggleSection(section.id)}
                                    className={`w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors ${section.isLocked ? 'opacity-60 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <span className="font-semibold text-xs text-gray-700 uppercase tracking-wide truncate flex-1 text-left">
                                        {section.title}
                                    </span>
                                    {!section.isLocked && (
                                        expandedSections.includes(section.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    )}
                                </button>

                                {expandedSections.includes(section.id) && !section.isLocked && (
                                    <div className="bg-white">
                                        {section.lessons.map((lesson) => {
                                            const isQuiz = lesson.type === 'quiz';
                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    to={isQuiz
                                                        ? `/dashboard/student/quizzes/quiz-ch${section.id}-${lesson.id}`
                                                        : '#'
                                                    }
                                                    className={`flex items-start gap-3 p-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${lesson.isCurrent ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                                                        }`}
                                                >
                                                    <div className="mt-0.5">
                                                        {lesson.completed ? (
                                                            <CheckCircle size={16} className="text-green-500" />
                                                        ) : lesson.isCurrent ? (
                                                            <PlayCircle size={16} className="text-blue-600 fill-blue-100" />
                                                        ) : isQuiz ? (
                                                            <ListChecks size={16} className="text-orange-500" />
                                                        ) : (
                                                            <Circle size={16} className="text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <p className={`text-sm ${lesson.isCurrent ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            {isQuiz && <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-1 rounded">Quiz</span>}
                                                        </div>
                                                        <span className="text-xs text-gray-400 block mt-1">{lesson.duration} • {isQuiz ? 'Bài kiểm tra' : 'Video'}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2.2 Main Content Area (Center) */}
                <div className="flex-1 flex flex-col min-w-0 bg-white relative">

                    {/* Toggle Buttons Overlay (Visible when sidebars closed) */}
                    <div className="absolute top-4 left-4 z-10">
                        {!isLeftSidebarOpen && (
                            <button
                                onClick={() => setIsLeftSidebarOpen(true)}
                                className="bg-white/80 backdrop-blur p-2 rounded-lg shadow border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all"
                                title="Hiện danh sách bài học"
                            >
                                <PanelLeft size={20} />
                            </button>
                        )}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                        {!isRightSidebarOpen && (
                            <button
                                onClick={() => setIsRightSidebarOpen(true)}
                                className="bg-white/80 backdrop-blur p-2 rounded-lg shadow border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all"
                                title="Hiện trợ lý AI"
                            >
                                <PanelRight size={20} />
                            </button>
                        )}
                    </div>

                    {/* Scrollable Content Container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

                            {/* Video Player Section */}
                            <div className="group relative rounded-2xl overflow-hidden bg-black aspect-video shadow-xl border border-gray-200">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                    >
                                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                            {isPlaying ? <Pause className="text-white fill-white" size={24} /> : <Play className="text-white fill-white ml-1" size={24} />}
                                        </div>
                                    </button>
                                </div>

                                {/* Controls Bar (Visible on Hover/Pause) */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity opacity-0 group-hover:opacity-100">
                                    <div className="flex items-center gap-4 text-white">
                                        <button onClick={() => setIsPlaying(!isPlaying)}>
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <div className="flex-1 h-1.5 bg-white/30 rounded-full cursor-pointer overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[35%] relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono">15:20 / 45:00</span>
                                        <div className="flex gap-3">
                                            <Settings size={18} className="cursor-pointer hover:text-blue-400" />
                                            <Maximize size={18} className="cursor-pointer hover:text-blue-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs & Content */}
                            <div>
                                <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10 pt-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                                        ? 'border-blue-600 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab Panels */}
                                <div className="animate-fadeIn">
                                    {activeTab === 'content' && (
                                        <div className="space-y-8">
                                            {contentSections.map(section => (
                                                <div key={section.id}>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                        <span className="opacity-70">{section.icon}</span> {section.title}
                                                    </h3>
                                                    <p className="text-gray-600 leading-relaxed mb-4">{section.content}</p>

                                                    {section.subsections?.map((sub, idx) => (
                                                        <div key={idx} className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                                            <h4 className="font-semibold text-blue-900 mb-3">{sub.title}</h4>
                                                            <ul className="space-y-2">
                                                                {sub.items.map((item, i) => (
                                                                    <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                                        <span>
                                                                            <strong className="text-gray-900 font-medium">{item.label}</strong> {item.text}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}

                                                    {section.examples?.map((ex, idx) => (
                                                        <div key={idx} className={`mt-4 p-4 rounded-xl border-l-4 ${ex.type === 'info' ? 'bg-blue-50 border-blue-400' : 'bg-orange-50 border-orange-400'
                                                            }`}>
                                                            <h4 className={`text-sm font-bold uppercase mb-1 ${ex.type === 'info' ? 'text-blue-700' : 'text-orange-700'
                                                                }`}>{ex.title}</h4>
                                                            <p className="text-sm text-gray-700">{ex.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                            {/* Navigation Footer */}
                                            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                                                <button className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                                                    <ArrowLeft size={18} />
                                                    Bài Trước
                                                </button>
                                                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-200 transition-all hover:translate-y-[-1px]">
                                                    Hoàn Thành & Tiếp Tục
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab !== 'content' && (
                                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Settings className="text-gray-400" size={24} />
                                            </div>
                                            <h3 className="text-gray-500 font-medium">Nội dung tab {activeTab} đang được cập nhật</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2.3 Right Sidebar - AI Assistant */}
                <div
                    className={`${isRightSidebarOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full'} transition-all duration-300 ease-in-out bg-white border-l border-gray-200 flex flex-col flex-shrink-0 z-10`}
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-blue-100" />
                            <h2 className="font-bold">Trợ Lý Ảo Vật Lý</h2>
                        </div>
                        <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded text-blue-100">
                            <PanelRightClose size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-indigo-100' : 'bg-blue-100'
                                    }`}>
                                    {msg.type === 'user' ? 'U' : <Bot size={16} className="text-blue-600" />}
                                </div>
                                <div className={`max-w-[80%] space-y-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.suggestions && (
                                        <div className="flex flex-col gap-2">
                                            {msg.suggestions.map((sug, i) => (
                                                <button key={i} className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 text-left transition-colors">
                                                    {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi câu hỏi về bài học..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        {/* Materials Quick Access */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Tài liệu bài học</h4>
                            <div className="space-y-2">
                                {lessonMaterials.map((mat) => (
                                    <a key={mat.id} href="#" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                        <div className="w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-sm text-gray-600 group-hover:text-blue-600 truncate flex-1">{mat.title}</span>
                                        <Download size={14} className="text-gray-400 group-hover:text-gray-600" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
