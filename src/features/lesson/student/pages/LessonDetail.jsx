import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Play, Pause, Volume2, Maximize, Settings, ChevronRight, ChevronDown, ChevronUp,
    MessageSquare, Send, FileText, Download, CheckCircle, Circle, Lightbulb, AlertCircle, PlayCircle,
    Lock, Search, MoreVertical, Bot, Clock, ListChecks, BookOpen, Layers, Target, CheckSquare, Sparkles
} from 'lucide-react';
import { getLessonDetail, getStudentLessonDetail, updateLessonProgress, getLessonsBySection, getStudentLessonBlocks, getStudentLessonFaqs, chatWithAI } from '../../api/lessonApi';
import { getStudentCourseDetail, getCourseSections } from '../../../course/api/courseApi';
import { getLessonQuizzes } from '../../../quiz/student/api/quizApi';
import { Spin, message, Tooltip, Breadcrumb, Button, Tabs, Empty } from 'antd';

// ----- Session-level completed lessons cache (per course) -----
const getCompletedSet = (courseId) => {
    try {
        const raw = sessionStorage.getItem(`completed_${courseId}`);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
};
const addCompletedLesson = (courseId, lessonId) => {
    try {
        const set = getCompletedSet(courseId);
        set.add(lessonId);
        sessionStorage.setItem(`completed_${courseId}`, JSON.stringify([...set]));
    } catch { /* ignore */ }
};
// ---------------------------------------------------------------

const getYoutubeId = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes(':')) return trimmed;
    return null;
};

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const justCompletedLessonId = location.state?.completedLessonId || null;
    if (justCompletedLessonId) addCompletedLesson(courseId, justCompletedLessonId);

    const [activeTab, setActiveTab] = useState('1');
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lessonData, setLessonData] = useState(null);
    const [lessonBlocks, setLessonBlocks] = useState([]);
    const [lessonFaqs, setLessonFaqs] = useState([]);
    const [courseData, setCourseData] = useState(null);
    const [courseSections, setCourseSections] = useState([]);
    const courseSectionsRef = useRef([]);
    const [quizData, setQuizData] = useState(null);

    const [expandedSections, setExpandedSections] = useState([1]);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Chào bạn! Mình là Trợ lý học tập AI. Bạn có cần mình hỗ trợ làm rõ khái niệm hay tóm tắt bài học không?',
            suggestions: [
                'Tóm tắt bài học',
                'Giải thích thuật ngữ chính',
                'Cho tôi ví dụ minh họa'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Track Progress Logic
    const progressIntervalRef = useRef(null);
    const videoRef = useRef(null);
    const [watchedTime, setWatchedTime] = useState(0);

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
                const sData = sectionsRes?.data || sectionsRes || [];

                const bRes = blocksRes?.data || (Array.isArray(blocksRes) ? blocksRes : blocksRes?.items) || [];
                const bData = Array.isArray(bRes) ? bRes.map(b => ({
                    id: b.id || b.Id,
                    blockType: b.blockType || b.Type || 'Concept',
                    title: b.title || b.Title || '',
                    content: b.content || b.Content || '',
                    sortOrder: b.sortOrder || b.SortOrder || 0
                })) : [];

                let fData = [];
                if (faqsRes) {
                    const faqItems = faqsRes?.data?.items || faqsRes?.items || faqsRes?.data || (Array.isArray(faqsRes) ? faqsRes : []);
                    fData = Array.isArray(faqItems) ? faqItems : [];
                }

                setLessonData(lData);
                setLessonBlocks(bData);
                setLessonFaqs(fData);
                setCourseData(cData);

                const quizzes = quizRes?.data?.items || quizRes?.items || (Array.isArray(quizRes?.data) ? quizRes.data : (Array.isArray(quizRes) ? quizRes : []));
                setQuizData(quizzes.length > 0 ? quizzes[0] : null);

                const apiSections = (cData?.sections || cData?.Sections || cData?.items || (Array.isArray(sData) ? sData : (sData?.items || []))) || [];
                const completedSet = getCompletedSet(courseId);
                const initialSections = Array.isArray(apiSections) ? apiSections.map(s => ({
                    id: s.id || s.Id,
                    title: s.title || s.name || s.Title || 'Chương học',
                    lessons: (s.lessons || s.Lessons || s.items || s.Items || []).map(l => ({
                        ...l,
                        isCompleted: !!(
                            l.isCompleted || l.IsCompleted || l.is_completed || l.completed || l.Completed ||
                            completedSet.has(l.id || l.Id || l.quizId)
                        )
                    })),
                    isLocked: s.isLocked || false
                })) : [];
                setCourseSections(initialSections);
                courseSectionsRef.current = initialSections;

                const currentSection = initialSections.find(s =>
                    (s.lessons || []).some(l => (l.id || l.Id || l.quizId) === lessonId)
                );
                if (currentSection) {
                    setExpandedSections([currentSection.id]);
                } else if (initialSections.length > 0) {
                    setExpandedSections([initialSections[0].id]);
                }

                initialSections.forEach(async (section) => {
                    if (section.lessons.length === 0) {
                        try {
                            const res = await getLessonsBySection(section.id);
                            const rawLessons = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);
                            const completedSetLazy = getCompletedSet(courseId);
                            const lessons = rawLessons.map(l => ({
                                ...l,
                                isCompleted: !!(
                                    l.isCompleted || l.IsCompleted || l.is_completed || l.completed || l.Completed ||
                                    completedSetLazy.has(l.id || l.Id || l.quizId)
                                )
                            }));
                            setCourseSections(prev => {
                                const updated = prev.map(s =>
                                    s.id === section.id ? { ...s, lessons: lessons } : s
                                );
                                courseSectionsRef.current = updated;
                                return updated;
                            });
                            if (lessons.some(l => (l.id || l.Id || l.quizId) === lessonId)) {
                                setExpandedSections(prev =>
                                    prev.includes(section.id) ? prev : [...prev, section.id]
                                );
                            }
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

    useEffect(() => {
        setWatchedTime(0);
        setIsPlaying(false);
    }, [lessonId]);

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
                addCompletedLesson(courseId, lessonId);
                message.success("Tuyệt vời! Bạn đã hoàn tất bài học.");
                setLessonData(prev => ({ ...prev, progress: 100, isCompleted: true }));
                setCourseSections(prev => {
                    const updated = prev.map(s => ({
                        ...s,
                        lessons: s.lessons.map(l =>
                            (l.id === lessonId || l.Id === lessonId)
                                ? { ...l, completed: true, isCompleted: true }
                                : l
                        )
                    }));
                    courseSectionsRef.current = updated;
                    return updated;
                });

                const allLessons = courseSectionsRef.current.flatMap(s => s.lessons || []);
                const currentIdx = allLessons.findIndex(l => (l.id || l.Id || l.quizId) === lessonId);
                if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
                    const nextLesson = allLessons[currentIdx + 1];
                    const nextId = nextLesson.id || nextLesson.Id || nextLesson.quizId;
                    const isNextQuiz = nextLesson.type?.toLowerCase() === 'quiz';

                    const hide = message.loading('Đang chuyển sang phần tiếp theo...', 0);
                    setTimeout(() => {
                        hide();
                        if (isNextQuiz) {
                            navigate(`/dashboard/student/quizzes/${nextId}`, {
                                state: { completedLessonId: lessonId }
                            });
                        } else {
                            navigate(`/dashboard/student/courses/${courseId}/lessons/${nextId}`, {
                                state: { completedLessonId: lessonId }
                            });
                        }
                    }, 1500);
                } else {
                    message.info("Bạn đã hoàn thành bài học cuối cùng của khóa học! 🎉", 3);
                }
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatMessages, isTyping]);

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() && !isTyping) {
            const userMsg = inputMessage.trim();
            const newMessage = {
                id: Date.now(),
                type: 'user',
                text: userMsg
            };

            setChatMessages(prev => [...prev, newMessage]);
            setInputMessage('');
            setIsTyping(true);

            try {
                // Map history for API: type 'user' -> 'user', type 'ai' -> 'assistant'
                const history = chatMessages.map(msg => ({
                    role: msg.type === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }));

                const response = await chatWithAI(lessonId, {
                    message: userMsg,
                    history: history
                });

                // Correctly extract the reply from the nested structure: response.data.data.reply
                const aiResponse = response.data?.data?.reply || response.data?.reply || response.data?.message || response.message || "Xin lỗi, mình đang gặp chút sự cố. Bạn thử hỏi lại nhé!";

                setChatMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: aiResponse
                }]);
            } catch (error) {
                console.error("AI Chat Error:", error);
                setChatMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: "Ồ, có vẻ kết nối với máy chủ AI đang bị gián đoạn. Hãy thử lại sau một lúc nhé!"
                }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
                <Spin size="large" className="text-[#0487e2]" />
                <p className="mt-4 text-slate-500 font-medium tracking-wide">Đang tải chi tiết bài học...</p>
            </div>
        );
    }

    if (!lessonData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-slate-500 font-medium">Không tìm thấy bài học này</span>}
                >
                    <Button type="primary" onClick={() => navigate(-1)} className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-6 rounded-lg font-semibold shadow-sm border-none">Quay lại khóa học</Button>
                </Empty>
            </div>
        );
    }

    const lessonInfo = {
        courseId: courseId,
        courseName: courseData?.title || 'Khóa học',
        lessonTitle: lessonData.title || lessonData.name || 'Bài học',
        lessonSubtitle: lessonData.sectionName || 'Chuyên đề',
        progress: lessonData.progress || 0,
        duration: lessonData.duration || '00:00',
        videoUrl: lessonData.videoUrl || lessonData.contentUrl || lessonData.content
    };

    const videoId = getYoutubeId(lessonData.videoUrl) || getYoutubeId(lessonData.contentUrl) || getYoutubeId(lessonData.content);

    const mappedCourseSections = (courseSections || []).map(s => ({
        id: s.id,
        title: s.title || s.name || 'Chương học',
        lessons: (s.lessons || []).map(item => ({
            id: item.id || item.Id || item.quizId,
            type: item.type?.toLowerCase() || 'video',
            title: item.title || item.name || 'Bài học',
            duration: item.duration || '45 p',
            completed: !!(item.isCompleted || item.IsCompleted || item.is_completed || item.completed || item.Completed),
            isCurrent: (item.id || item.Id || item.quizId) === lessonId
        }))
    }));

    const lessonMaterials = lessonData.materials?.length > 0
        ? lessonData.materials.map((m, idx) => ({
            id: m.id || `material-${idx}`,
            title: m.title || m.name || `Tài liệu ${idx + 1}`,
            type: m.type?.toLowerCase() || 'link',
            url: m.url || m.path,
            icon: FileText
        }))
        : (lessonData.materialUrl ? [{
            id: 'material-1',
            title: lessonData.materialName || `Tài liệu: ${lessonData.title || 'Bài học'}`,
            type: lessonData.materialType?.toLowerCase() || 'link',
            url: lessonData.materialUrl,
            icon: FileText
        }] : []);

    return (
        <div className="min-h-screen bg-slate-50/70 p-6 md:p-8 font-sans text-slate-800 pb-16">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <Breadcrumb
                        className="text-xs font-semibold text-slate-500 tracking-wide"
                        separator={<span className="text-slate-300">/</span>}
                        items={[
                            { title: <Link to={`/dashboard/student/courses/${lessonInfo.courseId}`} className="hover:text-[#0487e2] transition-colors bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">Khóa học</Link> },
                            { title: <span className="text-slate-800 font-bold bg-white px-2 py-1 rounded border border-[#0487e2]/20 text-[#0487e2]">{lessonInfo.lessonTitle}</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
                        <div className="flex items-start gap-5">
                            <Button
                                type="text"
                                icon={<ArrowLeft size={20} className="text-slate-600 group-hover:text-[#0487e2] transition-colors" />}
                                onClick={() => navigate(`/dashboard/student/courses/${lessonInfo.courseId}`)}
                                className="group h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm hover:border-[#0487e2]/40 hover:bg-blue-50 transition-all flex-shrink-0"
                            />
                            <div className="space-y-1.5 pt-0.5">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 m-0 leading-tight">
                                    {lessonInfo.lessonTitle}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200/50">
                                        <Layers size={14} className="text-[#0487e2]" />
                                        <span className="text-slate-700">{lessonInfo.lessonSubtitle || 'Topic'}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700">
                                        <Clock size={14} className="text-amber-500" /> {lessonInfo.duration || 0} phút
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-2 md:p-1 pl-3 md:pl-4 pr-1 rounded-xl whitespace-nowrap border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                            <div className="hidden md:flex items-center gap-3 px-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ</span>
                                <div className="w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden inset-shadow-sm">
                                    <div className="bg-gradient-to-r from-blue-400 to-[#0487e2] h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${lessonInfo.progress}%` }}></div>
                                </div>
                                <span className="text-xs font-extrabold text-[#0487e2] w-8 text-right">{parseInt(lessonInfo.progress || 0)}%</span>
                            </div>
                            {!lessonData?.isCompleted ? (
                                <button
                                    onClick={() => handleUpdateProgress(true)}
                                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-[38px] px-5 rounded-lg font-bold shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95"
                                >
                                    <CheckCircle size={16} />
                                    <span>Đánh dấu hoàn thành</span>
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 bg-emerald-50/80 text-emerald-600 border border-emerald-100 h-[38px] px-5 rounded-lg font-bold">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span>Đã hoàn thành</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white px-2 pt-2 pb-0 rounded-2xl border border-slate-200 shadow-sm mt-4 flex overflow-x-auto hide-scrollbar">
                    {[{ key: '1', label: 'Nội dung bài học', icon: BookOpen }, { key: '2', label: 'Bài Tập Củng Cố', icon: CheckSquare }].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex flex-1 md:flex-none justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold transition-all border-b-2 whitespace-nowrap rounded-t-lg mx-1 ${activeTab === tab.key
                                ? 'border-[#0487e2] text-[#0487e2] bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.key ? 'text-[#0487e2]' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Content (Chiếm 8 cột) */}
                    <div className="lg:col-span-8 space-y-6">

                        {activeTab === '1' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Video/Media Container */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center group w-full overflow-hidden">
                                        {videoId ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <iframe
                                                    key={`yt-${lessonId}`}
                                                    className="w-full h-full border-0"
                                                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0`}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Video bài học"
                                                    onLoad={() => setIsPlaying(true)}
                                                ></iframe>
                                            </div>
                                        ) : lessonInfo.videoUrl ? (
                                            <video
                                                ref={videoRef}
                                                key={`vid-${lessonId}`}
                                                src={lessonInfo.videoUrl}
                                                className="absolute inset-0 w-full h-full object-contain"
                                                controls
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                onEnded={() => {
                                                    setIsPlaying(false);
                                                    handleUpdateProgress(true);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <PlayCircle size={48} />
                                                <p className="font-bold">Video bài giảng đang được cập nhật</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Blocks/Theory Content */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
                                    {lessonBlocks && lessonBlocks.length > 0 ? (
                                        <div className="space-y-12">
                                            {lessonBlocks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((block, idx) => (
                                                <div key={block.id || idx} className="space-y-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0487e2] flex items-center justify-center font-black text-lg border border-blue-100 flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                                                {block.title}
                                                            </h3>
                                                            {block.blockType &&
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                                                                    {block.blockType}
                                                                </span>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="prose prose-slate prose-img:rounded-xl prose-a:text-[#0487e2] max-w-none text-slate-700 leading-relaxed font-medium pl-14"
                                                        dangerouslySetInnerHTML={{ __html: block.content ? block.content.replace(/\n/g, '<br/>') : '' }}
                                                    />
                                                </div>
                                            ))}

                                            <div className="pl-14 pt-4">
                                                <button
                                                    onClick={() => handleUpdateProgress(true)}
                                                    className="inline-flex items-center gap-2 bg-[#0487e2] hover:bg-[#0374c4] text-white px-6 py-3 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md shadow-blue-500/20"
                                                >
                                                    Đã hiểu bài, tiếp tục <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : lessonData?.content ? (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <BookOpen size={24} className="text-[#0487e2]" />
                                                <h2 className="text-xl font-bold text-slate-800">Lý thuyết trọng tâm</h2>
                                            </div>
                                            <div
                                                className="prose prose-slate prose-img:rounded-xl prose-a:text-[#0487e2] max-w-none text-slate-700 leading-relaxed font-medium"
                                                dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                            />
                                            <div className="pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => handleUpdateProgress(true)}
                                                    className="inline-flex items-center gap-2 bg-[#0487e2] hover:bg-[#0374c4] text-white px-6 py-3 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md shadow-blue-500/20"
                                                >
                                                    Đã hiểu bài, tiếp tục <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-4">
                                                <FileText className="text-slate-400" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">Đang cập nhật nội dung văn bản</h3>
                                            <p className="text-slate-500 font-medium text-sm">Nội dung chi tiết của chuyên đề này đang được giảng viên bổ sung.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === '2' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>

                                {quizData ? (
                                    <div className="relative text-center max-w-lg mx-auto">
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#0487e2] to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 rotate-3">
                                            <ListChecks size={36} className="text-white -rotate-3" />
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{quizData.title || 'Bài Tập Rèn Luyện'}</h3>
                                        <p className="text-slate-600 mb-10 text-[15px] font-medium leading-relaxed">Đã đến lúc kiểm chứng mức độ hiểu bài của bạn. Hãy click vào nút bên dưới để bắt đầu làm bài Quiz củng cố nhé!</p>

                                        <div className="grid grid-cols-2 gap-5 mb-10 text-sm">
                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center hover:border-blue-200 transition-colors">
                                                <div className="flex items-center justify-center mb-2">
                                                    <Target size={20} className="text-[#0487e2]" />
                                                </div>
                                                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black mb-1.5 object-center">Số câu hỏi</p>
                                                <p className="font-extrabold text-2xl text-slate-800">{quizData.totalQuestions || 0}</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center hover:border-amber-200 transition-colors">
                                                <div className="flex items-center justify-center mb-2">
                                                    <Clock size={20} className="text-amber-500" />
                                                </div>
                                                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black mb-1.5 object-center">Giới hạn thời gian</p>
                                                <p className="font-extrabold text-2xl text-slate-800">{quizData.duration || 15} <span className="text-sm">phút</span></p>
                                            </div>
                                        </div>

                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={() => navigate(`/dashboard/student/quizzes/${quizData.id || quizData.quizId}`)}
                                            className="bg-slate-900 hover:bg-[#0487e2] text-white px-12 h-14 rounded-2xl font-bold border-none text-base shadow-xl shadow-slate-900/10 hover:shadow-blue-500/30 transition-all hover:scale-105"
                                        >
                                            Vào Làm Bài Tập Ngay
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6">
                                            <CheckSquare className="text-slate-300" size={36} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài tập nào</h3>
                                        <p className="text-slate-500 font-medium">Bạn có thể dùng đoạn thời gian này tiếp tục tìm hiểu kiến thức bổ trợ.</p>
                                    </div>
                                )}
                            </div>
                        )}



                    </div>

                    {/* Right Column: Curriculum & AI Assistant (Chiếm 4 cột) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Curriculum Sidebar */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)]" style={{ maxHeight: '420px' }}>
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-white rounded-t-2xl z-10 sticky top-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <ListChecks size={16} className="text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm tracking-wide">Danh sách bài học</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-3 pb-4 custom-scrollbar bg-slate-50/50">
                                {mappedCourseSections.map((section) => (
                                    <div key={section.id} className="mb-3 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => !section.isLocked && toggleSection(section.id)}
                                            className={`w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${section.isLocked ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'bg-white'}`}
                                        >
                                            <span className="font-bold text-[13px] text-slate-800 text-left uppercase tracking-wide">
                                                {section.title}
                                            </span>
                                            {!section.isLocked && (
                                                expandedSections.includes(section.id)
                                                    ? <ChevronUp size={16} className="text-slate-400" />
                                                    : <ChevronDown size={16} className="text-slate-400" />
                                            )}
                                        </button>

                                        {expandedSections.includes(section.id) && !section.isLocked && (
                                            <div className="space-y-1 p-2 bg-slate-50/50 border-t border-slate-50">
                                                {section.lessons.map((lesson) => {
                                                    const isQuiz = lesson.type === 'quiz';
                                                    const isCurrent = lesson.isCurrent || lessonId === lesson.id;
                                                    return (
                                                        <Link
                                                            key={lesson.id}
                                                            to={isQuiz
                                                                ? `/dashboard/student/quizzes/${lesson.id}`
                                                                : `/dashboard/student/courses/${courseId}/lessons/${lesson.id}`
                                                            }
                                                            className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${isCurrent
                                                                ? 'bg-blue-50/80 border-[#0487e2]/20 shadow-sm'
                                                                : 'border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                                                                }`}
                                                        >
                                                            <div className="mt-0.5 flex-shrink-0">
                                                                {lesson.completed ? (
                                                                    <div className="w-[22px] h-[22px] bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle size={14} /></div>
                                                                ) : isCurrent ? (
                                                                    <div className="w-[22px] h-[22px] bg-[#0487e2] rounded-full flex items-center justify-center text-white shadow-sm shadow-blue-500/40 animate-pulse"><PlayCircle size={12} className="fill-current" /></div>
                                                                ) : isQuiz ? (
                                                                    <div className="w-[22px] h-[22px] bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100"><ListChecks size={12} /></div>
                                                                ) : (
                                                                    <div className="w-[22px] h-[22px] bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400"><Circle size={10} /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[13px] leading-snug line-clamp-2 ${isCurrent ? 'font-bold text-[#0487e2]' : 'font-semibold text-slate-700'}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                                    <Clock size={10} />
                                                                    <span>{lesson.duration || '0m'}</span>
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

                        {/* AI Assistant Sidebar */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden" style={{ height: '520px' }}>
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 z-20"></div>

                            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center gap-3 z-10 sticky top-0 shadow-sm shadow-slate-100/50">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0487e2] to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                        <Sparkles size={18} />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-[15px]">Trợ Lý Học Tập AI</h3>
                                    <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">Luôn sẵn sàng hỗ trợ bạn</p>
                                </div>
                            </div>

                            <div
                                ref={chatContainerRef}
                                className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 custom-scrollbar relative"
                            >
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.type === 'user' ? 'bg-indigo-100 text-indigo-700 text-xs font-bold ring-2 ring-white' : 'bg-gradient-to-br from-[#0487e2] to-indigo-600 text-white ring-2 ring-white'
                                            }`}>
                                            {msg.type === 'user' ? 'M' : <Bot size={16} />}
                                        </div>
                                        <div className={`max-w-[82%] px-4 py-3 text-[14px] leading-relaxed shadow-sm flex flex-col items-start font-medium ${msg.type === 'user'
                                            ? 'bg-slate-900 text-white rounded-[20px] rounded-tr-[4px]'
                                            : 'bg-white text-slate-800 rounded-[20px] rounded-tl-[4px] border border-slate-100'
                                            }`}>
                                            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>

                                            {msg.suggestions && (
                                                <div className="mt-3 flex flex-wrap gap-2 w-full">
                                                    {msg.suggestions.map((sug, i) => (
                                                        <button
                                                            key={i}
                                                            className="text-xs font-semibold bg-blue-50/80 border border-blue-200/50 text-[#0487e2] px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors text-left leading-tight w-fit shadow-sm hover:shadow"
                                                            onClick={() => setInputMessage(sug)}
                                                        >
                                                            {sug}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-3 animate-fade-in">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm bg-gradient-to-br from-[#0487e2] to-indigo-600 text-white ring-2 ring-white">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white text-slate-800 rounded-[20px] rounded-tl-[4px] border border-slate-100 px-4 py-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-[#0487e2]/60 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-[#0487e2]/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-[#0487e2]/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100 z-10 sticky bottom-0">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Nhập câu hỏi..."
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0487e2] focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all placeholder:text-slate-400 group-hover:border-slate-300"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isTyping}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#0487e2] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg hover:bg-[#0374c4] transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                                    >
                                        <Send size={14} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Materials Quick Access */}
                        {lessonMaterials.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                                <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-between uppercase tracking-wide">
                                    Tài liệu kham khảo
                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">{lessonMaterials.length} FILE</span>
                                </h3>
                                <div className="space-y-3">
                                    {lessonMaterials.map((mat) => (
                                        <a key={mat.id} href={mat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl group transition-all shadow-sm hover:shadow">
                                            <div className="w-10 h-10 bg-red-50/80 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 group-hover:scale-105 transition-all">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[13px] font-bold text-slate-700 group-hover:text-[#0487e2] truncate">{mat.title}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">{mat.type}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <Download size={14} className="text-slate-400 group-hover:text-[#0487e2]" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ Section moved to Right Column */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm border border-orange-100/50">
                                    <MessageSquare size={18} />
                                </div>
                                Các câu hỏi thường gặp
                            </h3>

                            {lessonFaqs.length > 0 ? (
                                <div className="space-y-4">
                                    {lessonFaqs.map((faq, idx) => (
                                        <div key={faq.id || idx} className="bg-white border border-slate-100 hover:border-[#0487e2] rounded-xl p-5 shadow-sm border-l-4 border-l-[#0487e2] transition-colors group">
                                            <h4 className="font-bold text-slate-800 text-sm mb-2.5 flex gap-2 leading-snug">
                                                <span className="text-[#0487e2] font-black group-hover:scale-110 transition-transform">Q:</span>
                                                {faq.question}
                                            </h4>
                                            <div className="text-slate-600 text-xs leading-relaxed flex gap-2 pl-0 bg-slate-50 p-3 rounded-lg">
                                                <span className="text-emerald-500 font-black shrink-0">A:</span>
                                                <div dangerouslySetInnerHTML={{ __html: faq.answer?.replace(/\n/g, '<br/>') }} className="font-medium" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 px-4">
                                    <div className="w-14 h-14 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-3">
                                        <MessageSquare className="text-slate-300" size={24} />
                                    </div>
                                    <p className="text-slate-700 font-bold text-[13px] mb-1">Trống</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
