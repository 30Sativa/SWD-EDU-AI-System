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
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizDetail, startQuizAttempt, submitQuizAttempt, getQuizAttemptResult } from '../api/quizApi';
import { Spin, message, Modal } from 'antd';

export default function QuizDetail() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [mode, setMode] = useState('start'); // 'start' | 'taking' | 'completed'
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const reviewRef = useRef(null);
    const chatEndRef = useRef(null);
    
    // Cleanup modals on unmount (prevent stuck modals on other pages)
    useEffect(() => {
        return () => {
            Modal.destroyAll();
        };
    }, []);

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

    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const res = await getQuizDetail(quizId);
                const data = res.data || res;
                setQuizData(data);
                if (data.duration || data.timeLimit) {
                    setTimeLeft((data.duration || data.timeLimit) * 60);
                } else {
                    setTimeLeft(45 * 60); // default
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin quiz:", error);
                message.error("Không thể tải thông tin bài kiểm tra");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleStartQuiz = async () => {
        try {
            const res = await startQuizAttempt(quizId);
            const data = res.data || res;
            setAttemptId(data.attemptId || data.id);
            setMode('taking');
        } catch (error) {
            const errorData = error.response?.data;
            let serverMsg = errorData?.message || errorData?.Message || errorData?.error || errorData?.title;

            // Handle validation errors from .NET
            if (errorData?.errors) {
                serverMsg = Object.entries(errorData.errors)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
                    .join("; ");
            } else if (errorData && typeof errorData === 'object' && !serverMsg) {
                serverMsg = JSON.stringify(errorData);
            }

            // Detect stuck/unsubmitted attempt from server message
            if (serverMsg) {
                // Pattern: "AttemptId: <uuid>"
                const match = serverMsg.match(/AttemptId:\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
                if (match && match[1]) {
                    const stuckAttemptId = match[1];
                    Modal.confirm({
                        title: 'Bài làm chưa nộp',
                        content: 'Bạn đang có một lượt làm bài trước đó chưa nộp. Bạn muốn tiếp tục làm bài dở hay nộp ngay (bỏ trống)?',
                        okText: 'Tiếp tục làm bài',
                        cancelText: 'Nộp ngay (bỏ trống)',
                        cancelButtonProps: { danger: true },
                        zIndex: 10005,
                        onOk: async () => {
                            // Resume the existing attempt - fetch questions first
                            try {
                                setLoading(true);
                                const qRes = await getQuizDetail(quizId);
                                const qData = qRes.data || qRes;
                                setQuizData(qData);
                                if (qData.duration || qData.timeLimit) {
                                    setTimeLeft((qData.duration || qData.timeLimit) * 60);
                                }
                                setAttemptId(stuckAttemptId);
                                setMode('taking');
                            } catch (e) {
                                message.error("Không thể tiếp tục bài làm. Vui lòng thử lại.");
                            } finally {
                                setLoading(false);
                            }
                        },
                        onCancel: async () => {
                            try {
                                await submitQuizAttempt(stuckAttemptId, { timeSpentSeconds: 0, answers: [] });
                                message.success("Dọn dẹp bài làm cũ thành công! Bạn có thể nhấn 'Bắt đầu làm bài' một lần nữa.");
                                setTimeout(() => window.location.reload(), 1000);
                            } catch (e) {
                                message.error("Lỗi khi nộp bài cũ.");
                            }
                        }
                    });
                    return;
                }
            }

            // Generic error fallback
            message.error(serverMsg || "Không thể bắt đầu làm bài. Vui lòng thử lại.");
        }
    };

    // Helper: build submit payload safely (selectedOptionId must be UUID or null, never empty string)
    const buildSubmitPayload = (timeSpentSeconds) => ({
        timeSpentSeconds: timeSpentSeconds > 0 ? timeSpentSeconds : 0,
        answers: Object.entries(answers).map(([qId, oId]) => ({
            questionId: qId,
            selectedOptionId: (oId && oId.trim() !== '') ? oId : null,
            answerText: null
        }))
    });

    const handleSubmitQuiz = () => {
        Modal.confirm({
            title: <span className="font-bold text-lg">Nộp bài kiểm tra</span>,
            content: 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể quay lại thay đổi câu trả lời.',
            okText: 'Xác nhận nộp bài',
            cancelText: 'Chưa, tôi muốn xem lại',
            centered: true,
            zIndex: 10005, // Higher than taking mode container
            okButtonProps: { className: 'bg-[#0487e2] font-bold shadow-md' },
            cancelButtonProps: { className: 'font-bold' },
            onOk: async () => {
                setSubmitting(true);
                try {
                    const timeSpentSeconds = (quizData.duration || quizData.timeLimit || 45) * 60 - timeLeft;
                    const payload = buildSubmitPayload(timeSpentSeconds);

                    await submitQuizAttempt(attemptId, payload);

                    // Get final results
                    const res = await getQuizAttemptResult(attemptId);
                    setResultData(res.data || res);
                    setMode('completed');
                    message.success("Nộp bài thành công!");
                } catch (error) {
                    const errMsg = error.response?.data?.message || error.response?.data?.title || "Gặp lỗi khi nộp bài. Vui lòng thử lại.";
                    message.error(errMsg);
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    // Auto submit when time is up
    useEffect(() => {
        if (mode === 'taking') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        message.warning("Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài...");
                        // Call submit automatically bypassing the confirm dialog
                        const autoSubmit = async () => {
                            setSubmitting(true);
                            try {
                                const payload = {
                                    timeSpentSeconds: (quizData.duration || quizData.timeLimit || 45) * 60,
                                    answers: Object.entries(answers).map(([qId, oId]) => ({
                                        questionId: qId,
                                        selectedOptionId: (oId && oId.trim() !== '') ? oId : null,
                                        answerText: null
                                    }))
                                };
                                await submitQuizAttempt(attemptId, payload);
                                const res = await getQuizAttemptResult(attemptId);
                                setResultData(res.data || res);
                                setMode('completed');
                            } catch (e) {
                                message.error("Lỗi tự động nộp bài.");
                            } finally {
                                setSubmitting(false);
                            }
                        };
                        autoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode, attemptId, answers, quizData]);

    // Handle Before Unload (closing tab or refreshing while taking test)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (mode === 'taking') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [mode]);

    const handleGoBackWhileTaking = () => {
        Modal.confirm({
            title: 'Chưa nộp bài',
            content: 'Bạn đang trong quá trình làm bài. Nếu thoát bây giờ, hệ thống sẽ tự động Tự Nộp Bài của bạn với kết quả hiện tại. Bạn có chắc chắn muốn thoát?',
            okText: 'Thoát và Nộp',
            okType: 'danger',
            cancelText: 'Tiếp tục làm bài',
            zIndex: 10005,
            onOk: async () => {
                setSubmitting(true);
                try {
                    const timeSpentSeconds = (quizData.duration || quizData.timeLimit || 45) * 60 - timeLeft;
                    const payload = {
                        timeSpentSeconds: timeSpentSeconds > 0 ? timeSpentSeconds : 0,
                        answers: Object.entries(answers).map(([qId, oId]) => ({
                            questionId: qId,
                            selectedOptionId: (oId && oId.trim() !== '') ? oId : null,
                            answerText: null
                        }))
                    };
                    await submitQuizAttempt(attemptId, payload);
                    navigate('/dashboard/student/quizzes');
                } catch (e) {
                    message.error("Lỗi nộp bài.");
                    setSubmitting(false);
                }
            }
        });
    };

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

        const userMsg = text.trim();
        const newUserMsg = { id: Date.now(), type: 'user', text: userMsg };
        setChatMessages(prev => [...prev, newUserMsg]);
        setInputMessage('');

        // Mock AI response
        setTimeout(() => {
            let aiResponseText = "";
            const result = resultData || { score: 0 };

            if (userMsg.toLowerCase().includes("giải thích") || userMsg.toLowerCase().includes("tại sao")) {
                aiResponseText = `Về phần câu hỏi này, em đã chọn đáp án chưa chính xác. Lý do là vì em đã nhầm lẫn giữa các khái niệm A và B. Với số điểm ${result.score}/10, em nên xem lại chương "Hàm số bậc hai" bài số 3 nhé.`;
            } else if (userMsg.toLowerCase().includes("mẹo") || userMsg.toLowerCase().includes("nhanh")) {
                aiResponseText = `Mẹo làm nhanh cho dạng bài này là em nên thử các giá trị đặc biệt vào phương trình. Điều này giúp loại trừ 50% đáp án sai chỉ trong 10 giây đấy!`;
            } else {
                aiResponseText = `Thầy AI đã nhận được câu hỏi. Với kết quả đạt ${result.score} điểm, em đang làm rất tốt ở các câu nhận biết, nhưng cần cải thiện các câu vận dụng cao. Em có muốn thầy đưa ra lộ trình luyện tập không?`;
            }

            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                text: aiResponseText
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

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Spin size="large" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin bài kiểm tra...</p>
                </div>
            </div>
        );
    }

    if (!quizData) {
        return (
            <div className="h-screen flex items-center justify-center bg-white text-center p-8">
                <div className="max-w-md">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài kiểm tra</h2>
                    <p className="text-slate-500 mb-6">Xin lỗi, bài kiểm tra này không tồn tại hoặc bạn không có quyền truy cập.</p>
                    <button onClick={() => navigate('/dashboard/student/quizzes')} className="text-blue-600 font-bold hover:underline">Quay lại danh sách</button>
                </div>
            </div>
        );
    }

    if (mode === 'start') {
        const _maxAttempts = quizData.maxAttempts || 0;
        const _attemptsUsed = quizData.attemptsUsed || 0;
        const isLimitReached = _maxAttempts > 0 && _attemptsUsed >= _maxAttempts;

        return (
            <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto custom-scrollbar">
                {scrollbarStyle}
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 text-center relative overflow-hidden animate-in zoom-in duration-300 my-auto">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ClipboardList className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{quizData.title}</h1>
                    <p className="text-slate-500 font-medium mb-10">Vui lòng đọc kỹ thông tin trước khi bắt đầu bài làm.</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                        {[
                            { label: 'MÔN HỌC', value: quizData.subjectName || 'Bài tập', icon: LayoutGrid },
                            { label: 'THỜI GIAN', value: `${quizData.duration || quizData.timeLimit || 45} phút`, icon: Clock },
                            { label: 'SỐ CÂU', value: `${quizData.totalQuestions || (quizData.questions?.length || 0)} câu`, icon: ClipboardList },
                            { label: 'HÌNH THỨC', value: quizData.quizType === 'Summative' ? 'Tổng hợp' : 'Luyện tập', icon: BookOpen },
                            { label: 'LƯỢT LÀM', value: _maxAttempts > 0 ? `${_attemptsUsed}/${_maxAttempts}` : 'Không giới hạn', icon: RefreshCw, warning: isLimitReached },
                        ].map((stat, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${stat.warning ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                                <stat.icon className={`mx-auto mb-2 opacity-80 ${stat.warning ? 'text-red-600' : 'text-blue-600'}`} size={20} />
                                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${stat.warning ? 'text-red-400' : 'text-slate-400'}`}>{stat.label}</p>
                                <p className={`text-sm font-semibold ${stat.warning ? 'text-red-700' : 'text-slate-900'}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-10 text-left">
                        <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-4"><ShieldCheck size={20} /> Quy định phòng thi</h3>
                        <ul className="space-y-3 text-sm text-slate-600 font-medium">
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Không được phép thoát khỏi trình duyệt hoặc chuyển tab trong quá trình làm bài.</span></li>
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Hệ thống sẽ tự động nộp bài khi hết thời gian đếm ngược.</span></li>
                            <li className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle size={10} className="text-blue-600" /></div><span>Đảm bảo kết nối internet ổn định trong suốt {quizData.duration || 45} phút làm bài.</span></li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all">Quay lại</button>
                        <button
                            onClick={handleStartQuiz}
                            disabled={isLimitReached}
                            className={`w-full sm:w-auto px-12 py-4 font-semibold rounded-xl text-lg transition-all ${isLimitReached
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed hidden' // hide if they reach limit, could just show 'Quay lại' or 'Xem kết quả'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:-translate-y-1'
                                }`}
                        >
                            Bắt đầu làm bài
                        </button>
                        {isLimitReached && (
                            <button disabled className="w-full sm:w-auto px-8 py-4 bg-red-100 text-red-600 font-semibold rounded-xl cursor-not-allowed">
                                Đã hết lượt làm bài
                            </button>
                        )}
                    </div>
                    <p className="mt-6 text-slate-400 text-xs font-medium">Bằng cách nhấn bắt đầu, đồng hồ đếm ngược sẽ khởi chạy ngay lập tức.</p>
                </div>
            </div>
        );
    }

    if (mode === 'completed') {
        const result = resultData || {
            score: 0,
            maxScore: 0,
            percentage: 0,
            questions: []
        };
        const correctCount = result.questions?.filter(q => q.isCorrect).length || 0;
        const totalCount = result.questions?.length || quizData.questions?.length || 0;
        return (
            <div className="min-h-screen bg-slate-50 overflow-y-auto custom-scrollbar relative">
                {scrollbarStyle}
                <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Trang chủ</span> <ChevronRight size={12} />
                        <span>Luyện đề</span> <ChevronRight size={12} />
                        <span className="text-slate-900">Kết quả chi tiết</span>
                    </div>

                    {/* Result Summary Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
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
                                        strokeDashoffset={552 - (552 * (result.score || 0)) / 10}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-slate-900 leading-none">{result.score || 0}</span>
                                    <span className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">/ {result.maxScore || 10}</span>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Chúc mừng! Bạn đã hoàn thành bài thi</h1>
                                    <p className="text-slate-500 font-medium">{quizData.title}</p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'KẾT QUẢ', value: result.isPassed ? 'Đạt' : 'Chưa đạt', icon: ShieldCheck, color: result.isPassed ? 'text-emerald-600' : 'text-red-500' },
                                        { label: 'TỈ LỆ', value: `${(result.percentage || 0).toFixed(1)}%`, icon: Trophy },
                                        { label: 'CÂU ĐÚNG', value: `${correctCount}/${totalCount}`, icon: CheckCircle2 },
                                        { label: 'ĐIỂM ĐẠT', value: `${quizData.passingScore || 50}/100`, icon: Award },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                            <p className={`text-sm font-semibold ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
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
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <BookOpen size={28} className="text-blue-600" />
                                Review Câu hỏi
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {correctCount} Đúng
                                </span>
                                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {totalCount - correctCount} Sai
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(result.questions || quizData.questions || []).map((q, idx) => {
                                const questionId = q.questionId || q.id;
                                const originalQ = quizData?.questions?.find(oq => (oq.questionId || oq.id) === questionId) || {};
                                const isCorrect = q.isCorrect;
                                const optionsToRender = q.options || originalQ.options || [];
                                const correctOptId = q.correctOptionId || originalQ.correctOptionId;

                                return (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-5 transition-all hover:shadow-md">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-600' : (q.selectedOptionId ? 'text-red-500' : 'text-amber-500')}`}>
                                                        Câu {idx + 1}: {isCorrect ? 'Chính xác' : (q.selectedOptionId ? 'Chưa chính xác' : 'Chưa chọn')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">
                                                Điểm: {q.pointsEarned || 0}/{q.points || originalQ.points || 1}
                                            </div>
                                        </div>

                                        <p className="text-lg font-bold text-slate-900 leading-relaxed">
                                            {q.questionText || q.text || originalQ.questionText || originalQ.text}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {optionsToRender.map((opt) => {
                                                const optId = opt.optionId || opt.id;
                                                const isSelected = q.selectedOptionId === optId || answers[questionId] === optId;
                                                const isAnswer = opt.isCorrect || optId === correctOptId;

                                                let style = "bg-slate-50 border-slate-100 text-slate-600";
                                                if (isAnswer) style = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500";
                                                else if (isSelected && !isAnswer) style = "bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500";

                                                return (
                                                    <div key={optId} className={`p-5 rounded-2xl border-2 flex items-center justify-between ${style}`}>
                                                        <span className="font-bold">{opt.optionText || opt.text}</span>
                                                        {isAnswer && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                        {isSelected && !isAnswer && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider">Lựa chọn của bạn</span>
                                                                <XCircle className="text-red-500" size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {q.explanation && (
                                            <div className="mt-4 p-5 bg-slate-50/80 rounded-xl border border-slate-100 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600/20"></div>
                                                <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
                                                    <span className="font-bold text-slate-900 not-italic mr-2">Giải thích:</span>
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        )}
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
                        <button onClick={handleGoBackWhileTaking} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="hidden sm:flex w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <ClipboardList size={22} />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{quizData.title}</h2>
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
                            className="px-4 sm:px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                            onClick={handleSubmitQuiz}
                        >
                            {submitting ? 'Đang nộp...' : <><span className="hidden xs:inline">Nộp bài</span><span className="xs:hidden">Nộp</span></>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex gap-8">
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-4 sm:pt-8 pr-2">
                            <div className="bg-white rounded-xl p-6 sm:p-8 md:p-10 shadow-sm border border-slate-200 relative mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">Câu {currentQuestion + 1} / {quizData.questions?.length || 0}</span>
                                    <button className="text-slate-300 hover:text-blue-600 transition-colors"><Flag size={20} /></button>
                                </div>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-8 sm:mb-10">{quizData.questions?.[currentQuestion]?.questionText || quizData.questions?.[currentQuestion]?.text}</p>
                                <div className="space-y-4">
                                    {(quizData.questions?.[currentQuestion]?.options || []).map((option) => {
                                        const qId = quizData.questions[currentQuestion].questionId || quizData.questions[currentQuestion].id;
                                        const optId = option.optionId || option.id;
                                        return (
                                            <label key={optId} className={`flex items-center p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer group ${answers[qId] === optId ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm' : 'border-slate-50 hover:border-blue-200 hover:bg-slate-50'}`}>
                                                <div className="relative flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0">
                                                    <input type="radio" name="quiz-option" className="peer appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-200 rounded-full checked:border-blue-500 transition-all" checked={answers[qId] === optId} onChange={() => setAnswers({ ...answers, [qId]: optId })} />
                                                    <div className="absolute w-2.5 h-2.5 sm:w-3 h-3 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                                </div>
                                                <span className={`text-sm sm:text-base font-medium flex-1 ${answers[qId] === optId ? 'text-blue-900' : 'text-slate-700'}`}>{option.optionText || option.text}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="h-20 flex-shrink-0 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)] border-t border-slate-100 flex items-center justify-between px-4 sm:px-8 rounded-t-3xl mx-0 xs:mx-2">
                            <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 font-bold rounded-2xl transition-all ${currentQuestion === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}><ChevronLeft size={20} /><span className="hidden sm:inline">Câu trước</span></button>
                            <div className="hidden md:flex items-center gap-2"><span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Chuyển câu hỏi</span></div>
                            <button onClick={() => setCurrentQuestion(Math.min((quizData.questions?.length || 1) - 1, currentQuestion + 1))} disabled={currentQuestion === (quizData.questions?.length || 1) - 1} className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 bg-blue-600/10 text-blue-700 font-bold rounded-2xl transition-all ${currentQuestion === (quizData.questions?.length || 1) - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-600/20'}`}><span className="hidden sm:inline">Câu tiếp</span><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <div className="w-80 h-full overflow-y-auto py-6 custom-scrollbar hidden lg:flex flex-col gap-6 flex-shrink-0">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                            <h3 className="flex items-center gap-2 text-slate-800 font-semibold mb-5"><LayoutGrid size={20} className="text-blue-600" /> Bản đồ câu hỏi</h3>
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {(quizData.questions || []).map((q, i) => {
                                    const qId = q.questionId || q.id;
                                    return (
                                        <button key={i} onClick={() => setCurrentQuestion(i)} className={`w-full aspect-square flex items-center justify-center rounded-xl text-sm font-bold border-2 transition-all ${currentQuestion === i ? 'border-blue-600 text-blue-600 bg-blue-50 ring-2 ring-blue-100' : answers[qId] ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}>{i + 1}</button>
                                    );
                                })}
                            </div>
                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-blue-600 shadow-sm"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đã trả lời</span></div>
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-50"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang xem</span></div>
                                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-slate-100 border-2 border-transparent"></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chưa làm</span></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg shadow-blue-100">
                            <h4 className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><AlertCircle size={16} /> Mẹo làm bài</h4>
                            <p className="text-white text-sm leading-relaxed font-medium">Đừng dành quá nhiều thời gian cho một câu hỏi khó. Hãy đánh dấu lại và quay lại sau khi đã xong các câu dễ.</p>
                        </div>
                        <div className="mt-auto pt-8 pb-4"><p className="text-[10px] text-slate-300 font-bold text-center uppercase tracking-[0.2em]">© 2024 EDU-AI Platform</p></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
