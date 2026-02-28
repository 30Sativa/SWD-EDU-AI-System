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
import { getLessonDetail } from '../../api/lessonApi';
import { getClassDetail } from '../../../classes/api/classApi';
import { Spin, message } from 'antd';

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const [activeTab, setActiveTab] = useState('content');
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lessonData, setLessonData] = useState(null);
    const [courseData, setCourseData] = useState(null);

    // Sidebar States
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const [expandedSections, setExpandedSections] = useState([1]);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Chào em! Thầy AI đây. Em có thắc mắc gì về bài học này không?',
            suggestions: [
                'Tóm tắt bài học ghi nhớ?',
                'Giải thích các công thức chính?',
                'Ví dụ vận dụng thức tế?'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [lessonRes, courseRes] = await Promise.all([
                    getLessonDetail(lessonId),
                    getClassDetail(courseId)
                ]);

                const lData = lessonRes?.data || lessonRes;
                const cData = courseRes?.data || courseRes;

                setLessonData(lData);
                setCourseData(cData);

                if (cData.sections && cData.sections.length > 0) {
                    setExpandedSections([cData.sections[0].id]);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu bài học:", error);
                message.error("Không thể tải nội dung bài học");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, lessonId]);

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

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Spin size="large" />
                <p className="text-slate-500 font-medium">Đang tải nội dung bài học...</p>
            </div>
        </div>
    );

    if (!lessonData) return (
        <div className="h-screen flex items-center justify-center bg-white text-center p-8">
            <div className="max-w-md">
                <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài học</h2>
                <p className="text-slate-500 mb-6">Xin lỗi, nội dung bài học này có thể đã bị gỡ bỏ hoặc bạn không có quyền truy cập.</p>
                <Link to={`/dashboard/student/courses/${courseId}`} className="text-blue-600 font-bold hover:underline">Quay lại khóa học</Link>
            </div>
        </div>
    );

    const lessonInfo = {
        courseId: courseId,
        courseName: courseData?.title || 'Khóa học',
        lessonTitle: lessonData.title || lessonData.name || 'Bài học',
        lessonSubtitle: lessonData.sectionName || 'Nội dung bài học',
        progress: lessonData.progress || 0,
        duration: lessonData.duration || '00:00',
        videoUrl: lessonData.videoUrl || lessonData.contentUrl
    };

    // Mapping sections từ courseData sang format UI cho sidebar
    const apiSections = courseData?.sections || [];
    const courseSections = apiSections.map(s => ({
        id: s.id,
        title: s.title || s.name || 'Chương học',
        lessons: (s.items || []).map(item => ({
            id: item.id,
            type: item.type?.toLowerCase() || 'video',
            title: item.title || item.name || 'Bài học',
            duration: item.duration || '45 p',
            completed: item.isCompleted || false,
            isCurrent: item.id === lessonId
        })),
        isLocked: s.isLocked || false
    }));

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
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            <style>
                {`
               .hide-scrollbar::-webkit-scrollbar {
                  display: none;
               }
               .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
               }
            `}
            </style>

            {/* 1. Header Navigation Bar */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-5">
                    <Link
                        to={`/dashboard/student/courses/${lessonInfo.courseId}`}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100/80 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                        title="Quay lại khóa học"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="h-8 w-px bg-slate-200/60"></div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-tight">{lessonInfo.lessonTitle}</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{lessonInfo.lessonSubtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 bg-slate-50/50 px-4 py-2 rounded-full border border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tiến độ</span>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lessonInfo.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{lessonInfo.progress}%</span>
                    </div>
                </div>
            </div>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* 2.1 Left Sidebar - Curriculum */}
                <div
                    className={`${isLeftSidebarOpen ? 'w-80 translate-x-0 border-r' : 'w-0 -translate-x-full border-none'} transition-all duration-300 ease-in-out bg-white border-slate-200 flex flex-col flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
                >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Nội Dung Bài Học</h2>
                        <button onClick={() => setIsLeftSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                            <PanelLeftClose size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {/* Search Input */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm bài học..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 border-0 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {courseSections.map((section) => (
                            <div key={section.id} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                                <button
                                    onClick={() => !section.isLocked && toggleSection(section.id)}
                                    className={`w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors ${section.isLocked ? 'opacity-60 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <span className="font-semibold text-xs text-slate-600 uppercase tracking-wide truncate flex-1 text-left">
                                        {section.title}
                                    </span>
                                    {!section.isLocked && (
                                        expandedSections.includes(section.id) ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />
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
                                                    className={`flex items-start gap-3.5 p-3.5 hover:bg-blue-50/60 transition-colors border-b border-slate-50 last:border-0 ${lesson.isCurrent ? 'bg-blue-50/80 border-l-[3px] border-l-blue-600 pl-[11px]' : 'border-l-[3px] border-l-transparent pl-[11px]'
                                                        }`}
                                                >
                                                    <div className="mt-0.5">
                                                        {lesson.completed ? (
                                                            <CheckCircle size={18} className="text-emerald-500" />
                                                        ) : lesson.isCurrent ? (
                                                            <PlayCircle size={18} className="text-blue-600 fill-blue-100" />
                                                        ) : isQuiz ? (
                                                            <ListChecks size={18} className="text-amber-500" />
                                                        ) : (
                                                            <Circle size={18} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className={`text-sm ${lesson.isCurrent ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            {isQuiz && <span className="text-[9px] uppercase font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm">Quiz</span>}
                                                        </div>
                                                        <span className="text-[11px] font-medium text-slate-400 block">{lesson.duration} • {isQuiz ? 'Bài kiểm tra' : 'Video'}</span>
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

                    {/* Toggle Buttons Overlay */}
                    <div className="absolute top-5 left-5 z-20 pointer-events-none">
                        <div className="pointer-events-auto">
                            {!isLeftSidebarOpen && (
                                <button
                                    onClick={() => setIsLeftSidebarOpen(true)}
                                    className="bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 text-slate-500 hover:text-blue-600 hover:scale-105 transition-all group"
                                    title="Hiện danh sách bài học"
                                >
                                    <PanelLeft size={20} />
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Hiện danh sách</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="absolute top-5 right-5 z-20 pointer-events-none">
                        <div className="pointer-events-auto">
                            {!isRightSidebarOpen && (
                                <button
                                    onClick={() => setIsRightSidebarOpen(true)}
                                    className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-white hover:scale-105 transition-all group"
                                    title="Hiện trợ lý AI"
                                >
                                    <PanelRight size={20} />
                                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Hỏi AI</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">

                            {/* Video Player Section */}
                            <div className="group relative rounded-2xl overflow-hidden bg-black aspect-video shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-900/10 ring-1 ring-slate-900/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 active:scale-95"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl pl-1">
                                            {isPlaying ? <Pause className="text-slate-900 fill-slate-900" size={28} /> : <Play className="text-slate-900 fill-slate-900" size={28} />}
                                        </div>
                                    </button>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Controls Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <div className="flex items-center gap-5 text-white">
                                        <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-blue-400 transition-colors">
                                            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                                        </button>
                                        <div className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group/slider">
                                            <div className="h-full bg-blue-500 w-[35%] relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/slider:scale-100 transition-transform"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-medium tracking-wide">15:20 / 45:00</span>
                                        <div className="flex gap-4">
                                            <Settings size={20} className="cursor-pointer hover:text-blue-400 transition-colors" />
                                            <Maximize size={20} className="cursor-pointer hover:text-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs & Content */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="flex border-b border-slate-100 px-6 pt-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2.5 px-6 py-4 text-sm font-semibold border-b-[3px] transition-all ${isActive
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                                                    }`}
                                            >
                                                <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab Panels */}
                                <div className="p-8 min-h-[400px]">
                                    {activeTab === 'content' && (
                                        <div className="space-y-10 max-w-3xl mx-auto animate-fade-in">
                                            {contentSections.map(section => (
                                                <div key={section.id} className="relative pl-8">
                                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-sm">{section.icon}</div>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-slate-600 leading-7 mb-6 text-[15px]">{section.content}</p>

                                                    {section.subsections?.map((sub, idx) => (
                                                        <div key={idx} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-5 border border-blue-100/50 mb-4">
                                                            <h4 className="font-semibold text-blue-900 mb-4 text-sm uppercase tracking-wide">{sub.title}</h4>
                                                            <ul className="space-y-3">
                                                                {sub.items.map((item, i) => (
                                                                    <li key={i} className="text-slate-700 text-[15px] flex items-start gap-3">
                                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                        <span>
                                                                            <strong className="text-slate-900 font-semibold">{item.label}</strong> {item.text}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}

                                                    {section.examples?.map((ex, idx) => (
                                                        <div key={idx} className={`mt-6 p-5 rounded-xl border-l-[6px] shadow-sm ${ex.type === 'info' ? 'bg-blue-50 border-blue-500' : 'bg-amber-50 border-amber-500'
                                                            }`}>
                                                            <h4 className={`text-xs font-semibold uppercase mb-2 ${ex.type === 'info' ? 'text-blue-800' : 'text-amber-800'
                                                                }`}>{ex.title}</h4>
                                                            <p className="text-sm font-medium text-slate-800 leading-relaxed">{ex.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                            {/* Navigation Footer */}
                                            <div className="flex items-center justify-between pt-10 mt-10 border-t border-slate-100">
                                                <button className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-semibold text-sm">
                                                    <ArrowLeft size={18} />
                                                    Bài Trước
                                                </button>
                                                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                                    Hoàn Thành & Tiếp Tục
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab !== 'content' && (
                                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                                                <Settings className="text-slate-400" size={28} />
                                            </div>
                                            <h3 className="text-slate-900 font-semibold text-lg mb-2">Đang cập nhật</h3>
                                            <p className="text-slate-500 text-sm">Nội dung {activeTab} sẽ sớm được bổ sung.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2.3 Right Sidebar - AI Assistant */}
                <div
                    className={`${isRightSidebarOpen ? 'w-[400px] translate-x-0 border-l' : 'w-0 translate-x-full border-none'} transition-all duration-300 ease-in-out bg-white border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]`}
                >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 text-sm">Trợ Lý AI</h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsRightSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                            <PanelRightClose size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 custom-scrollbar">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${msg.type === 'user' ? 'bg-indigo-100' : 'bg-white'
                                    }`}>
                                    {msg.type === 'user' ? <span className="text-xs font-semibold text-indigo-600">You</span> : <Bot size={16} className="text-blue-600" />}
                                </div>
                                <div className={`max-w-[85%] space-y-3 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.type === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.suggestions && (
                                        <div className="flex flex-wrap gap-2">
                                            {msg.suggestions.map((sug, i) => (
                                                <button key={i} className="text-[11px] font-medium bg-white border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
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
                    <div className="p-5 border-t border-slate-200 bg-white">
                        <div className="relative shadow-sm rounded-xl">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Hỏi gì đó đi..."
                                className="w-full pl-4 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm resize-none custom-scrollbar"
                                rows="1"
                                style={{ minHeight: '52px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        {/* Materials Quick Access */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tài liệu đính kèm</h4>
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 file</span>
                            </div>
                            <div className="space-y-2">
                                {lessonMaterials.map((mat) => (
                                    <a key={mat.id} href="#" className="flex items-center gap-3 p-2.5 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 rounded-xl group transition-all">
                                        <div className="w-8 h-8 bg-white border border-slate-100 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 truncate flex-1">{mat.title}</span>
                                        <Download size={14} className="text-slate-300 group-hover:text-blue-500" />
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
