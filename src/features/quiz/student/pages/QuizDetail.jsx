import React, { useState, useEffect, useRef } from 'react';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    CheckCircle,
    LayoutGrid,
    BookOpen,
    ClipboardList,
    ShieldCheck,
    AlertCircle,
    HelpCircle,
    ArrowLeft,
    RefreshCw,
    Award,
    Trophy,
    CheckCircle2,
    XCircle,
    ExternalLink,
    ChevronDown,
    Search,
    Bot,
    Send,
    X,
    MessageCircle,
    Sparkles,
    User,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuizDetail() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('start'); // 'start' | 'taking' | 'completed'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const reviewRef = useRef(null);
    const chatEndRef = useRef(null);

    // AI Chat State
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isFloatingIconVisible, setIsFloatingIconVisible] = useState(true);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Chào em! Thầy AI đây. Chúc mừng em đã hoàn thành bài thi. Em có thắc mắc gì về bài làm của mình không?',
            suggestions: ['Giải thích câu 2', 'Tại sao em sai câu 1?', 'Kiến thức trọng tâm chương này']
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const quiz = {
        title: 'Kiểm tra 1 tiết: Hàm số bậc hai',
        subject: 'Toan học',
        time: '45 phút',
        totalQuestions: 20,
        type: 'Trac nghiệm',
        questions: Array(20).fill(null).map((_, i) => ({
            id: i + 1,
            text: i === 0
                ? "Cho hàm số f(x) có bảng biến thiên như sau. Hàm số đã cho đồng biến trên khoảng nào dưới đây?"
                : i === 1
                    ? "Tính thể tích V của khối lăng trụ có diện tích đáy B = 6 và chiều cao h = 4."
                    : `Câu hỏi ${i + 1}: Nội dung câu hỏi trắc nghiệm liên quan đến kiến thức chương trình Toán học 11.`,
            options: i === 1
                ? [
                    { id: 'A', text: 'V = 8' },
                    { id: 'B', text: 'V = 24' },
                    { id: 'C', text: 'V = 12' },
                    { id: 'D', text: 'V = 72' }
                ]
                : [
                    { id: 'A', text: 'Đáp án lựa chọn A' },
                    { id: 'B', text: 'Đáp án lựa chọn B' },
                    { id: 'C', text: 'Đáp án lựa chọn C' },
                    { id: 'D', text: 'Đáp án lựa chọn D' }
                ],
            correctAnswer: i === 0 ? 'B' : 'B',
            explanation: i === 0
                ? "Dựa vào bảng biến thiên, ta thấy đạo hàm f'(x) > 0 trên khoảng (-1; 1) nên hàm số đồng biến trên khoảng này."
                : i === 1
                    ? "Thể tích khối lăng trụ: V = B.h = 6.4 = 24. Bạn đã nhầm lẫn với công thức khối chóp V = 1/3.B.h."
                    : "Giải thích chi tiết cho câu hỏi này dựa trên các định lý và tính chất sách giáo khoa."
        }))
    };

    useEffect(() => {
        if (mode === 'taking') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        setMode('completed');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode]);

    // Scroll chat to bottom
    useEffect(() => {
        if (isAIChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isAIChatOpen]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        return {
            correct,
            total: quiz.totalQuestions,
            score: ((correct / quiz.totalQuestions) * 10).toFixed(1)
        };
    };

    const handleSendMessage = (text = inputMessage) => {
        if (!text.trim()) return;

        const newUserMsg = { id: Date.now(), type: 'user', text };
        setChatMessages(prev => [...prev, newUserMsg]);
        setInputMessage('');

        // Mock AI response
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                text: `Thầy AI đang phân tích yêu cầu của em... Với nội dung "${text}", em cần tập trung vào các tính chất của hàm số bậc hai, đặc biệt là cách xét dấu đạo hàm f'(x).`
            };
            setChatMessages(prev => [...prev, aiResponse]);
        }, 800);
    };

    const scrollbarStyle = (
        <style>
            {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}
        </style>
    );

    if (mode === 'start') {
        return (
            <div className="fixed inset-0 bg-[#f8fafc] flex items-center justify-center p-4 z-[9999] overflow-y-auto custom-scrollbar">
                {scrollbarStyle}
                <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 text-center relative overflow-hidden animate-in zoom-in duration-300 my-auto">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ClipboardList className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{quiz.title}</h1>
                    <p className="text-slate-500 font-medium mb-10">Vui lòng đọc kỹ thông tin trước khi bắt đầu bài làm.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'MÔN HỌC', value: quiz.subject, icon: LayoutGrid },
                            { label: 'THỜI GIAN', value: quiz.time, icon: Clock },
                            { label: 'SỐ CÂU', value: `${quiz.totalQuestions} câu`, icon: ClipboardList },
                            { label: 'HÌNH THỨC', value: quiz.type, icon: BookOpen },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <stat.icon className="text-blue-600 mx-auto mb-2 opacity-80" size={20} />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-10 text-left">
                        <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-4"><ShieldCheck size={20} /> Quy định phòng thi</h3>
                        <ul className="space-y-3 text-sm text-slate-600 font-medium">
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Không được phép thoát khỏi trình duyệt hoặc chuyển tab trong quá trình làm bài.</span></li>
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Hệ thống sẽ tự động nộp bài khi hết thời gian đếm ngược.</span></li>
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Đảm bảo kết nối internet ổn định trong suốt {quiz.time} làm bài.</span></li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/dashboard/student/quizzes')} className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95">Quay lại</button>
                        <button onClick={() => setMode('taking')} className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 text-lg">Bắt đầu làm bài</button>
                    </div>
                    <p className="mt-6 text-slate-400 text-xs font-medium">Bằng cách nhấn bắt đầu, đồng hồ đếm ngược sẽ khởi chạy ngay lập tức.</p>
                </div>
            </div>
        );
    }

    if (mode === 'completed') {
        const result = calculateScore();
        return (
            <div className="min-h-screen bg-[#f8fafc] overflow-y-auto custom-scrollbar relative">
                {scrollbarStyle}
                <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Trang chủ</span> <ChevronRight size={12} />
                        <span>Luyện đề</span> <ChevronRight size={12} />
                        <span className="text-slate-900">Kết quả chi tiết</span>
                    </div>

                    {/* Result Summary Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>

                        <div className="relative z-10 flex flex-col items-center md:flex-row gap-12">
                            {/* Score Circle */}
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="88" className="stroke-slate-100 fill-none" strokeWidth="12" />
                                    <circle
                                        cx="96" cy="96" r="88"
                                        className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                                        strokeWidth="12"
                                        strokeDasharray={552}
                                        strokeDashoffset={552 - (552 * result.score) / 10}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-slate-900 leading-none">{result.score}</span>
                                    <span className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">/ 10</span>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2">Chúc mừng! Bạn đã hoàn thành bài thi</h1>
                                    <p className="text-slate-500 font-medium">Kỳ thi đánh giá năng lực THPT - Môn Toán (Mã đề: 102)</p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'THỜI GIAN', value: '38:00', icon: Clock },
                                        { label: 'TRẠNG THÁI', value: 'Đã chấm', icon: ShieldCheck, color: 'text-emerald-600' },
                                        { label: 'CÂU ĐÚNG', value: `${result.correct}/${result.total}`, icon: CheckCircle2 },
                                        { label: 'XẾP HẠNG', value: '#12', icon: Trophy },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className={`text-sm font-extrabold ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        <RefreshCw size={20} /> Làm lại bài tập
                                    </button>
                                    <button
                                        onClick={() => setIsAIChatOpen(true)}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold rounded-2xl transition-all hover:bg-indigo-100 active:scale-95"
                                    >
                                        <Bot size={20} /> Hỏi thầy trợ lý AI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div ref={reviewRef} className="space-y-8 pb-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <BookOpen size={28} className="text-blue-600" />
                                Review Câu hỏi
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {result.correct} Đúng
                                </span>
                                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {result.total - result.correct} Sai
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {quiz.questions.slice(0, 3).map((q, idx) => {
                                const isCorrect = answers[idx] === q.correctAnswer;
                                return (
                                    <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-10 space-y-6 transition-all hover:shadow-md">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        Câu {idx + 1}: {isCorrect ? 'Chính xác' : 'Chưa chính xác'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">
                                                Điểm: {isCorrect ? '0.5/0.5' : '0/0.5'}
                                            </div>
                                        </div>

                                        <p className="text-lg font-bold text-slate-900 leading-relaxed">
                                            {q.text}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt) => {
                                                const isSelected = answers[idx] === opt.id;
                                                const isAnswer = opt.id === q.correctAnswer;

                                                let style = "bg-slate-50 border-slate-100 text-slate-600";
                                                if (isAnswer) style = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500";
                                                else if (isSelected && !isAnswer) style = "bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500";

                                                return (
                                                    <div key={opt.id} className={`p-5 rounded-2xl border-2 flex items-center justify-between ${style}`}>
                                                        <span className="font-bold">{opt.id}. {opt.text}</span>
                                                        {isAnswer && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                        {isSelected && !isAnswer && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Lựa chọn của bạn</span>
                                                                <XCircle className="text-red-500" size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 p-6 bg-slate-50/80 rounded-2xl border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600/20"></div>
                                            <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
                                                <span className="font-black text-slate-900 not-italic mr-2">Giải thích:</span>
                                                {q.explanation}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => navigate('/dashboard/student/quizzes')}
                                className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-3"
                            >
                                <LayoutGrid size={22} /> Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Chatbox – panel giống “trợ lý sau khi nộp bài” */}
                <div className="fixed bottom-6 right-20 z-[10000] flex flex-col items-end gap-4">
                    {/* Chat panel */}
                    <div
                        className={`w-[380px] sm:w-[420px] bg-white/95 backdrop-blur rounded-[1.75rem] border border-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden transition-all duration-400 ease-out origin-bottom-right ${isAIChatOpen
                            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto max-h-[620px]'
                            : 'translate-y-4 opacity-0 scale-95 pointer-events-none max-h-0'
                            }`}
                    >
                        {/* Header */}
                        <div className="relative border-b border-slate-100 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-5 py-4 text-white">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
                                        <Bot size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100">
                                            Trợ lý sau khi làm bài
                                        </p>
                                        <h3 className="text-sm font-semibold leading-tight">
                                            Thầy AI giải thích kết quả cho bạn
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAIChatOpen(false)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-indigo-50 hover:bg-white/20 transition-colors"
                                >
                                    <Minimize2 size={16} />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-indigo-100/90">
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Đang trực tuyến
                                </span>
                                <span className="opacity-80">
                                    Hỏi lại các câu sai, kiến thức trọng tâm, mẹo làm bài nhanh…
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 px-4 py-4 custom-scrollbar">
                            {chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${msg.type === 'user'
                                            ? 'border-indigo-500 bg-indigo-600 text-white'
                                            : 'border-slate-200 bg-white text-indigo-600'
                                            }`}
                                    >
                                        {msg.type === 'user' ? <User size={14} /> : <Bot size={16} />}
                                    </div>
                                    <div className="flex max-w-[78%] flex-col gap-2">
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${msg.type === 'user'
                                                ? 'rounded-tr-md bg-indigo-600 text-white'
                                                : 'rounded-tl-md border border-slate-100 bg-white text-slate-700'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        {msg.suggestions && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.suggestions.map((sug, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleSendMessage(sug)}
                                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-500 hover:text-indigo-600"
                                                    >
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

                        {/* Input */}
                        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ví dụ: Giải thích chi tiết câu 2 cho em với ạ..."
                                        className="flex-1 bg-transparent text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputMessage.trim()}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                    >
                                        <Send size={17} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                <Sparkles size={11} className="text-indigo-500" />
                                <span>AI phân tích dựa trên bài làm của riêng bạn</span>
                            </div>
                        </div>
                    </div>

                    {/* Toggle button */}
                    <button
                        type="button"
                        onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_40px_rgba(37,99,235,0.55)] transition-all duration-200 hover:scale-110 active:scale-95 ${isAIChatOpen
                            ? 'bg-slate-900'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {isAIChatOpen ? <X size={26} /> : <Bot size={26} />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#f1f5f9] flex flex-col h-screen overflow-hidden z-[9999]">
            {scrollbarStyle}
            <header className="h-16 bg-white border-b border-slate-200 flex-shrink-0 z-50">
                <div className="h-full px-6 flex items-center justify-between max-w-[1600px] mx-auto w-full">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <button onClick={() => navigate('/dashboard/student/quizzes')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="hidden sm:flex w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <ClipboardList size={22} />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{quiz.title}</h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 bg-blue-50 px-3 sm:px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex-shrink-0">
                        <Clock className="text-blue-600 hidden xs:block" size={18} />
                        <span className="text-base sm:text-lg font-mono font-bold text-blue-700">{formatTime(timeLeft)}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                            <Flag size={18} /> Báo lỗi
                        </button>
                        <button
                            className="px-4 sm:px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95"
                            onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) setMode('completed');
                            }}
                        >
                            <span className="hidden xs:inline">Nộp bài</span>
                            <span className="xs:hidden">Nộp</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex gap-8">
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-4 sm:pt-8 pr-2">
                            <div className="bg-white rounded-[2rem] p-6 sm:p-10 md:p-12 shadow-sm border border-slate-200 relative mb-6">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">Câu {currentQuestion + 1} / {quiz.totalQuestions}</span>
                                    <button className="text-slate-300 hover:text-blue-600 transition-colors"><Flag size={20} /></button>
                                </div>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-8 sm:mb-10">{quiz.questions[currentQuestion].text}</p>
                                <div className="space-y-4">
                                    {quiz.questions[currentQuestion].options.map((option) => (
                                        <label key={option.id} className={`flex items-center p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer group ${answers[currentQuestion] === option.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm' : 'border-slate-50 hover:border-blue-200 hover:bg-slate-50'}`}>
                                            <div className="relative flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0">
                                                <input type="radio" name="quiz-option" className="peer appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-200 rounded-full checked:border-blue-500 transition-all" checked={answers[currentQuestion] === option.id} onChange={() => setAnswers({ ...answers, [currentQuestion]: option.id })} />
                                                <div className="absolute w-2.5 h-2.5 sm:w-3 h-3 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span className={`text-sm sm:text-base font-medium flex-1 ${answers[currentQuestion] === option.id ? 'text-blue-900' : 'text-slate-700'}`}>{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="h-20 flex-shrink-0 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] border-t border-slate-100 flex items-center justify-between px-4 sm:px-8 rounded-t-3xl mx-0 xs:mx-2">
                            <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 font-bold rounded-2xl transition-all ${currentQuestion === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}><ChevronLeft size={20} /><span className="hidden sm:inline">Câu trước</span></button>
                            <div className="hidden md:flex items-center gap-2"><span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Chuyển câu hỏi</span></div>
                            <button onClick={() => setCurrentQuestion(Math.min(quiz.totalQuestions - 1, currentQuestion + 1))} disabled={currentQuestion === quiz.totalQuestions - 1} className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 bg-blue-600/10 text-blue-700 font-bold rounded-2xl transition-all ${currentQuestion === quiz.totalQuestions - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-600/20'}`}><span className="hidden sm:inline">Câu tiếp</span><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <div className="w-80 h-full overflow-y-auto py-8 custom-scrollbar hidden lg:flex flex-col gap-6 flex-shrink-0">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                            <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-6"><LayoutGrid size={20} className="text-blue-600" /> Bản đồ câu hỏi</h3>
                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {quiz.questions.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentQuestion(i)} className={`w-full aspect-square flex items-center justify-center rounded-xl text-sm font-bold border-2 transition-all ${currentQuestion === i ? 'border-blue-600 text-blue-600 bg-blue-50 ring-2 ring-blue-100' : answers[i] ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}>{i + 1}</button>
                                ))}
                            </div>
                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-blue-600 shadow-sm"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đã trả lời</span></div>
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-50"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang xem</span></div>
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-slate-100 border-2 border-transparent"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chưa làm</span></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-100">
                            <h4 className="text-white/80 font-bold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle size={16} /> Mẹo làm bài</h4>
                            <p className="text-white text-sm leading-relaxed font-medium">Đừng dành quá nhiều thời gian cho một câu hỏi khó. Hãy đánh dấu lại và quay lại sau khi đã xong các câu dễ.</p>
                        </div>
                        <div className="mt-auto pt-8 pb-4"><p className="text-[10px] text-slate-300 font-bold text-center uppercase tracking-[0.2em]">© 2024 EDU-AI Platform</p></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
