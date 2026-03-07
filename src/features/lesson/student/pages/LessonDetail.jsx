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
    Clock,
    ListChecks
} from 'lucide-react';
import { getLessonDetail, getStudentLessonDetail, updateLessonProgress, getLessonsBySection, getStudentLessonBlocks, getStudentLessonFaqs } from '../../api/lessonApi';
import { getStudentCourseDetail, getCourseSections } from '../../../course/api/courseApi';
import { getLessonQuizzes } from '../../../quiz/student/api/quizApi';
import { Spin, message, Tooltip } from 'antd';

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const [activeTab, setActiveTab] = useState('content');
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lessonData, setLessonData] = useState(null);
    const [lessonBlocks, setLessonBlocks] = useState([]);
    const [lessonFaqs, setLessonFaqs] = useState([]);
    const [courseData, setCourseData] = useState(null);
    const [courseSections, setCourseSections] = useState([]);
    const [quizData, setQuizData] = useState(null);

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
                const [lessonRes, courseRes, quizRes, blocksRes, faqsRes, sectionsRes] = await Promise.all([
                    getStudentLessonDetail(lessonId).catch(() => getLessonDetail(lessonId)),
                    getStudentCourseDetail(courseId).catch(() => null),
                    getLessonQuizzes(lessonId).catch(() => null),
                    getStudentLessonBlocks(lessonId).catch(() => null),
                    getStudentLessonFaqs(lessonId).catch(() => null),
                    getCourseSections(courseId).catch(() => null)
                ]);

                const lData = lessonRes?.data || lessonRes;
                const cData = (courseRes?.data || courseRes) || {};
                const qData = (quizRes?.data || quizRes) || null;
                const sData = sectionsRes?.data || sectionsRes || [];

                // Process Blocks
                const bRes = blocksRes?.data || (Array.isArray(blocksRes) ? blocksRes : blocksRes?.items) || [];
                const bData = Array.isArray(bRes) ? bRes.map(b => ({
                    id: b.id || b.Id,
                    blockType: b.blockType || b.Type || 'Concept',
                    title: b.title || b.Title || '',
                    content: b.content || b.Content || '',
                    sortOrder: b.sortOrder || b.SortOrder || 0
                })) : [];

                // Process FAQs
                let fData = [];
                if (faqsRes) {
                    const faqItems = faqsRes?.data?.items || faqsRes?.items || faqsRes?.data || (Array.isArray(faqsRes) ? faqsRes : []);
                    fData = Array.isArray(faqItems) ? faqItems : [];
                }

                setLessonData(lData);
                setLessonBlocks(bData);
                setLessonFaqs(fData);
                setCourseData(cData);

                // Process Quiz (Formative) - Take the first one if it's a list
                const quizzes = quizRes?.data?.items || quizRes?.items || (Array.isArray(quizRes?.data) ? quizRes.data : (Array.isArray(quizRes) ? quizRes : []));
                setQuizData(quizzes.length > 0 ? quizzes[0] : null);

                const apiSections = (cData?.sections || cData?.Sections || cData?.items || (Array.isArray(sData) ? sData : (sData?.items || []))) || [];
                const initialSections = Array.isArray(apiSections) ? apiSections.map(s => ({
                    id: s.id || s.Id,
                    title: s.title || s.name || 'Chương học',
                    lessons: s.lessons || s.Lessons || s.items || s.Items || [],
                    isLocked: s.isLocked || false
                })) : [];
                setCourseSections(initialSections);

                if (initialSections.length > 0) {
                    setExpandedSections([initialSections[0].id]);
                }

                // Fetch lessons for each section if missing
                initialSections.forEach(async (section) => {
                    if (section.lessons.length === 0) {
                        try {
                            const res = await getLessonsBySection(section.id);
                            const lessons = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);
                            setCourseSections(prev => prev.map(s =>
                                s.id === section.id ? { ...s, lessons: lessons } : s
                            ));
                        } catch (e) {
                            console.error("Error fetching sidebar lessons:", e);
                        }
                    }
                });

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu bài học:", error);
                message.error("Không thể tải nội dung bài học");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, lessonId]);

    // Track Progress Logic
    const progressIntervalRef = useRef(null);
    const videoRef = useRef(null);
    const [watchedTime, setWatchedTime] = useState(0);

    useEffect(() => {
        if (isPlaying) {
            progressIntervalRef.current = setInterval(() => {
                setWatchedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isPlaying]);

    // Update progress periodically (every 30s)
    useEffect(() => {
        if (watchedTime > 0 && watchedTime % 30 === 0) {
            handleUpdateProgress(false);
        }
    }, [watchedTime]);

    const handleUpdateProgress = async (isCompleted = false) => {
        try {
            await updateLessonProgress(lessonId, {
                watchedDuration: watchedTime,
                isCompleted: isCompleted
            });
            if (isCompleted) {
                message.success("Chúc mừng! Bạn đã hoàn thành bài học này.");
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

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
            isCurrent: (item.id || item.Id) === lessonId
        }))
    }));

    const tabs = [
        { id: 'content', label: 'Lý Thuyết', icon: FileText },
        { id: 'exercises', label: 'Bài Tập', icon: CheckCircle },
        { id: 'examples', label: 'Ví Dụ', icon: Lightbulb },
        { id: 'qa', label: 'Hỏi Đáp', icon: MessageSquare }
    ];

    const lessonMaterials = lessonData.materials?.length > 0
        ? lessonData.materials.map((m, idx) => ({
            id: m.id || `material-${idx}`,
            title: m.title || m.name || `Tài liệu ${idx + 1}`,
            type: m.type?.toLowerCase() || 'link',
            url: m.url || m.path,
            icon: FileText
        }))
        : (lessonData.materialUrl ? [
            {
                id: 'material-1',
                title: lessonData.materialName || `Tài liệu: ${lessonData.title || 'Bài học'}`,
                type: lessonData.materialType?.toLowerCase() || 'link',
                url: lessonData.materialUrl,
                icon: FileText
            }
        ] : []);

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
            const userMsg = inputMessage.trim();
            setChatMessages([...chatMessages, {
                id: chatMessages.length + 1,
                type: 'user',
                text: userMsg
            }]);
            setInputMessage('');

            setTimeout(() => {
                let aiResponse = "";
                if (userMsg.toLowerCase().includes("tóm tắt")) {
                    aiResponse = `Dựa trên bài học "${lessonInfo.lessonTitle}", thầy xin tóm tắt các ý chính: 1. Định nghĩa cơ bản về nội dung bài học. 2. Các công thức quan trọng cần nhớ. 3. Lưu ý khi giải bài tập. Em có muốn thầy giải thích kỹ phần nào không?`;
                } else if (userMsg.toLowerCase().includes("giải thích") || userMsg.toLowerCase().includes("công thức")) {
                    aiResponse = `Về phần này, em cần chú ý đến mối liên hệ giữa các khái niệm trong bài. Đặc biệt là vận dụng vào bài tập trong tab "Bài Tập". Thầy khuyên em nên làm thử quiz để kiểm tra hiểu biết nhé!`;
                } else {
                    aiResponse = `Câu hỏi của em rất hay! Trong bài ${lessonInfo.lessonTitle} này, việc hiểu rõ bản chất sẽ giúp em làm các bài quiz Formative rất nhanh. Em có thắc mắc gì thêm về nội dung nào không?`;
                }

                setChatMessages(prev => [...prev, {
                    id: prev.length + 1,
                    type: 'ai',
                    text: aiResponse,
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
                                                        ? `/dashboard/student/quizzes/${lesson.id}`
                                                        : `/dashboard/student/courses/${courseId}/lessons/${lesson.id}`
                                                    }
                                                    className={`flex items-start gap-3.5 p-4 mx-2 my-1 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100 hover:shadow-sm ${lesson.isCurrent || lessonId === lesson.id
                                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-md translate-x-1'
                                                        : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        {lesson.completed ? (
                                                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                <CheckCircle size={14} className="text-emerald-500" />
                                                            </div>
                                                        ) : (lesson.isCurrent || lessonId === lesson.id) ? (
                                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-blue-200">
                                                                <PlayCircle size={14} className="text-white fill-current" />
                                                            </div>
                                                        ) : isQuiz ? (
                                                            <div className="w-5 h-5 bg-amber-50 rounded-full flex items-center justify-center">
                                                                <ListChecks size={14} className="text-amber-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                                                <Circle size={10} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                            <p className={`text-[13px] leading-snug line-clamp-2 ${lesson.isCurrent || lessonId === lesson.id ? 'font-bold text-blue-800' : 'font-medium text-slate-700'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            {isQuiz && <span className="text-[8px] uppercase font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded shadow-sm">Quiz</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={10} className="text-slate-400" />
                                                            <span className="text-[10px] font-semibold text-slate-400">{lesson.duration || '0m'}</span>
                                                        </div>
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
                            <div className="group relative rounded-3xl overflow-hidden bg-slate-900 border-b-8 border-slate-800 aspect-video shadow-[0_32px_80px_-20px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(37,99,235,0.2)]">
                                {lessonData?.videoUrl ? (
                                    <div className="w-full h-full relative group/video">
                                        <video
                                            ref={videoRef}
                                            src={lessonData.videoUrl}
                                            className="w-full h-full object-contain"
                                            controls={false}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                        />

                                        {/* Premium Overlay Play Button */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500 pointer-events-none">
                                                <button
                                                    onClick={() => {
                                                        setIsPlaying(true);
                                                        videoRef.current?.play();
                                                    }}
                                                    className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-500 pointer-events-auto hover:scale-110 group/btn shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(37,99,235,0.4)]"
                                                >
                                                    <div className="w-18 h-18 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:rotate-[360deg] relative overflow-hidden group-hover/btn:bg-blue-600">
                                                        <Play className="text-slate-900 group-hover/btn:text-white fill-current transition-all pl-1.5" size={28} />
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 opacity-50" />
                                                    </div>
                                                </button>
                                            </div>
                                        )}

                                        {/* Progress Tracking Bar - Mini */}
                                        <div className="absolute top-0 inset-x-0 h-1 w-full bg-white/10 z-20">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"
                                                style={{ width: videoRef.current ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' }}
                                            />
                                        </div>

                                        {/* Premium Contextual Info */}
                                        <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover/video:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover/video:translate-y-0 shadow-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                                                    {lessonData.type === 'quiz' ? <ListChecks size={16} /> : <Play size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-white/60">Đang xem</p>
                                                    <h4 className="text-xs font-bold text-white leading-tight mt-0.5">{lessonData.title}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-white/5 shadow-inner">
                                            <PlayCircle size={40} className="text-slate-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-400 font-bold tracking-wide uppercase text-xs">Video đang được cập nhật</p>
                                            <p className="text-slate-600 text-[11px] mt-1 italic">Vui lòng quay lại sau hoặc hỏi trợ lý AI bên phải nhé</p>
                                        </div>
                                    </div>
                                )}

                                {/* Controls Bar - Premium Redesign */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-10 pointer-events-auto">
                                    <div className="flex items-center gap-6 text-white group/controls">
                                        <button onClick={() => {
                                            if (isPlaying) {
                                                videoRef.current?.pause();
                                            } else {
                                                videoRef.current?.play();
                                            }
                                            setIsPlaying(!isPlaying);
                                        }} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white hover:text-slate-900 rounded-xl transition-all duration-300 active:scale-90">
                                            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current pl-1" />}
                                        </button>

                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/50 px-1">
                                                <span>{Math.floor(watchedTime / 60)}:{(watchedTime % 60).toString().padStart(2, '0')}</span>
                                                <div className="flex gap-4">
                                                    <span className="hover:text-blue-400 transition-colors cursor-pointer">Cài đặt</span>
                                                    <span className="hover:text-blue-400 transition-colors cursor-pointer">Tốc độ (1x)</span>
                                                </div>
                                            </div>
                                            <div className="relative group/slider h-1.5 w-full bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full relative shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                                    style={{ width: videoRef.current ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' }}
                                                >
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-0 group-hover/slider:scale-100 transition-all duration-300"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                                <Volume2 size={18} />
                                            </button>
                                            <button className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                                                <Maximize size={18} />
                                            </button>
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
                                            {/* Ưu tiên hiển thị Blocks nếu có, nếu không thì hiện content chính */}
                                            {lessonBlocks && lessonBlocks.length > 0 ? (
                                                <div className="space-y-12">
                                                    {lessonBlocks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((block, idx) => {
                                                        const blockThemes = {
                                                            'Concept': {
                                                                label: 'Khái niệm',
                                                                color: 'blue',
                                                                icon: <BookOpen size={18} />,
                                                                bg: 'from-blue-50/50 to-white',
                                                                accent: 'bg-blue-600'
                                                            },
                                                            'Example': {
                                                                label: 'Ví dụ minh họa',
                                                                color: 'emerald',
                                                                icon: <Lightbulb size={18} />,
                                                                bg: 'from-emerald-50/50 to-white',
                                                                accent: 'bg-emerald-600'
                                                            },
                                                            'Exercise': {
                                                                label: 'Thực hành',
                                                                color: 'amber',
                                                                icon: <Settings size={18} />,
                                                                bg: 'from-amber-50/50 to-white',
                                                                accent: 'bg-amber-600'
                                                            },
                                                            'Reflection': {
                                                                label: 'Tư duy - Củng cố',
                                                                color: 'indigo',
                                                                icon: <Bot size={18} />,
                                                                bg: 'from-indigo-50/50 to-white',
                                                                accent: 'bg-indigo-600'
                                                            }
                                                        };
                                                        const theme = blockThemes[block.blockType || block.type] || blockThemes['Concept'];

                                                        return (
                                                            <div key={block.id || idx} className="group/block relative duration-500 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <div className={`w-12 h-12 rounded-2xl ${theme.accent} text-white flex items-center justify-center shadow-lg shadow-${theme.color}-500/20 group-hover/block:scale-110 transition-transform duration-500`}>
                                                                        {theme.icon}
                                                                    </div>
                                                                    <div>
                                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${theme.color}-600 drop-shadow-sm`}>
                                                                            Phần {idx + 1} • {theme.label}
                                                                        </span>
                                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 group-hover/block:text-blue-700 transition-colors">
                                                                            {block.title}
                                                                        </h3>
                                                                    </div>
                                                                </div>

                                                                <div className={`relative p-8 md:p-10 rounded-[32px] bg-gradient-to-br ${theme.bg} border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover/block:-translate-y-1`}>
                                                                    <div className={`absolute top-0 right-10 h-1 w-24 ${theme.accent} rounded-b-full opacity-30`} />
                                                                    <div
                                                                        className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-medium"
                                                                    >
                                                                        {block.content && (
                                                                            <div dangerouslySetInnerHTML={{ __html: block.content.includes('<') ? block.content : block.content.replace(/\n/g, '<br/>') }} />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : lessonData.content ? (
                                                <div
                                                    className="prose prose-slate max-w-none text-slate-600 leading-7 text-[15px] bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
                                                    dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                                />
                                            ) : (
                                                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                                                    <p className="text-slate-500 font-medium">Nội dung bài học đang được chuẩn bị...</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'qa' && (
                                        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                                    <MessageSquare size={24} className="text-blue-600" />
                                                    Câu hỏi thường gặp
                                                </h3>
                                                <span className="px-4 py-1.5 bg-blue-50 text-[#0487e2] text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                                    {lessonFaqs.length} Câu hỏi
                                                </span>
                                            </div>

                                            {lessonFaqs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {lessonFaqs.map((faq, idx) => (
                                                        <div key={faq.id || idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-l-[6px] border-l-blue-200 hover:border-l-blue-500">
                                                            <h4 className="font-black text-slate-800 mb-3 flex items-start gap-3">
                                                                <span className="text-blue-600">Q:</span>
                                                                {faq.question}
                                                            </h4>
                                                            <div className="pl-7 text-slate-600 text-[14px] leading-relaxed flex items-start gap-3">
                                                                <span className="text-emerald-500 font-bold shrink-0">A:</span>
                                                                <div dangerouslySetInnerHTML={{ __html: faq.answer?.replace(/\n/g, '<br/>') }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
                                                    <p className="text-slate-500 font-medium">Chưa có câu hỏi thường gặp cho bài này.</p>
                                                    <p className="text-slate-400 text-xs mt-1">Hãy đặt câu hỏi với Trợ lý AI ở thanh bên phải nhé!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'exercises' && (
                                        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                                            {quizData ? (
                                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                                    <div className="p-8 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                            <ListChecks size={32} className="text-blue-600" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{quizData.title || 'Bài tập rèn luyện'}</h3>
                                                        <p className="text-slate-500 text-sm mb-8">Kiểm tra lại kiến thức vừa học qua bài quiz nhanh nhé!</p>

                                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                                            <div className="bg-white p-4 rounded-xl border border-slate-100">
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Số câu hỏi</p>
                                                                <p className="text-sm font-semibold text-slate-900">{quizData.totalQuestions || 0} câu</p>
                                                            </div>
                                                            <div className="bg-white p-4 rounded-xl border border-slate-100">
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Thời gian</p>
                                                                <p className="text-sm font-semibold text-slate-900">{quizData.duration || 15} phút</p>
                                                            </div>
                                                        </div>

                                                        <Link
                                                            to={`/dashboard/student/quizzes/${quizData.id}`}
                                                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                                                        >
                                                            Bắt đầu làm bài
                                                            <ChevronRight size={20} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                                                        <ListChecks className="text-slate-300" size={28} />
                                                    </div>
                                                    <h3 className="text-slate-900 font-semibold text-lg mb-2">Chưa có bài tập</h3>
                                                    <p className="text-slate-500 text-sm">Giảng viên chưa cập nhật bài tập cho bài học này.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeTab !== 'content' && activeTab !== 'exercises' && activeTab !== 'qa' && (
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

                            {/* Navigation Footer */}
                            <div className="flex items-center justify-between pt-10 mt-10 border-t border-slate-100">
                                <button className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-semibold text-sm">
                                    <ArrowLeft size={18} />
                                    Bài Trước
                                </button>
                                <button
                                    onClick={() => handleUpdateProgress(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Hoàn Thành & Tiếp Tục
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2.3 Right Sidebar - AI Assistant */}
                <div
                    className={`${isRightSidebarOpen ? 'w-[400px] translate-x-0 border-l' : 'w-0 translate-x-full border-none'
                        } transition-all duration-300 ease-in-out bg-white border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]`}
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
                                {lessonMaterials.length > 0 && (
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {lessonMaterials.length} file
                                    </span>
                                )}
                            </div>
                            {lessonMaterials.length > 0 ? (
                                <div className="space-y-2">
                                    {lessonMaterials.map((mat) => (
                                        <a key={mat.id} href={mat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 rounded-xl group transition-all">
                                            <div className="w-8 h-8 bg-white border border-slate-100 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 truncate flex-1">{mat.title}</span>
                                            <Download size={14} className="text-slate-300 group-hover:text-blue-500" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 italic">Không có tài liệu đính kèm</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
