import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Clock, Save, Send, ChevronRight, ChevronLeft,
    Flag, CheckCircle, XCircle, AlertCircle, MessageSquare,
    Bot, PanelRightClose, RefreshCw, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function QuizDetail() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('taking'); // 'taking' | 'review'

    // Quiz State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // AI Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Chào em! Thầy AI đây. Chúc mừng em đã hoàn thành bài thi. Em cần giải thích câu nào không?',
            suggestions: ['Giải thích câu 1', 'Tại sao câu 3 mình sai?', 'Tổng hợp kiến thức bị hổng']
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

    const quiz = {
        title: 'Kiểm tra 15 phút: Hình học không gian',
        subject: 'Toán Học 11 - 11A1',
        description: 'Chương 3: Quan hệ vuông góc trong không gian',
        totalQuestions: 5,
        questions: [
            {
                id: 1,
                text: 'Cho hình chóp S.ABCD có đáy ABCD là hình vuông. SA ⊥ (ABCD). Khẳng định nào sau đây là ĐÚNG?',
                options: [
                    { id: 'A', text: 'AC ⊥ SB' },
                    { id: 'B', text: 'BD ⊥ (SAC)' },
                    { id: 'C', text: 'CD ⊥ (SAB)' },
                    { id: 'D', text: 'BC ⊥ (SAB)' }
                ],
                correctAnswer: 'B',
                explanation: 'Vì ABCD là hình vuông nên AC ⊥ BD. Lại có SA ⊥ (ABCD) => SA ⊥ BD. Vậy BD ⊥ (SAC).'
            },
            {
                id: 2,
                text: 'Cho hình lập phương ABCD.A\'B\'C\'D\'. Góc giữa hai đường thẳng AC và B\'D\' bằng:',
                options: [
                    { id: 'A', text: '45°' },
                    { id: 'B', text: '60°' },
                    { id: 'C', text: '90°' },
                    { id: 'D', text: '30°' }
                ],
                correctAnswer: 'C',
                explanation: 'Do B\'D\' // BD mà AC ⊥ BD (tính chất hình vuông) nên góc giữa AC và B\'D\' bằng 90°.'
            },
            {
                id: 3,
                text: 'Cho tứ diện đều ABCD. Góc giữa hai đường thẳng AB và CD bằng:',
                options: [
                    { id: 'A', text: '60°' },
                    { id: 'B', text: '30°' },
                    { id: 'C', text: '90°' },
                    { id: 'D', text: '45°' }
                ],
                correctAnswer: 'C',
                explanation: 'Dùng tích vô hướng: AB.CD = (AC+CB).CD = AC.CD + CB.CD = -a²/2 + a²/2 = 0. Vậy AB ⊥ CD => Góc = 90°.'
            },
            {
                id: 4,
                text: 'Trong không gian, qua một điểm O cho trước, có bao nhiêu đường thẳng vuông góc với mặt phẳng (P) cho trước?',
                options: [
                    { id: 'A', text: 'Vô số' },
                    { id: 'B', text: '2' },
                    { id: 'C', text: '1' },
                    { id: 'D', text: '0' }
                ],
                correctAnswer: 'C',
                explanation: 'Tính chất cơ bản: Có duy nhất một đường thẳng đi qua một điểm và vuông góc với một mặt phẳng cho trước.'
            },
            {
                id: 5,
                text: 'Mệnh đề nào sau đây SAI?',
                options: [
                    { id: 'A', text: 'Hai đường thẳng phân biệt cùng vuông góc với một đường thẳng thứ ba thì song song với nhau.' },
                    { id: 'B', text: 'Một đường thẳng vuông góc với hai đường thẳng cắt nhau cùng thuộc một mặt phẳng thì vuông góc với mặt phẳng đó.' },
                    { id: 'C', text: 'Hai mặt phẳng phân biệt cùng vuông góc với một đường thẳng thì song song với nhau.' },
                    { id: 'D', text: 'Đường thẳng vuông góc với mặt phẳng thì vuông góc với mọi đường thẳng nằm trong mặt phẳng đó.' }
                ],
                correctAnswer: 'A',
                explanation: 'Sai vì trong không gian, hai đường thẳng cùng vuông góc với đường thẳng thứ 3 có thể chéo nhau.'
            }
        ]
    };

    useEffect(() => {
        if (mode === 'taking' && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode, isSubmitted]);

    // Scroll chat to bottom
    useEffect(() => {
        if (isChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatOpen]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswer = (optionId) => {
        if (mode === 'review') return;
        setAnswers({ ...answers, [currentQuestion]: optionId });
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        setMode('review');
        setCurrentQuestion(0); // Reset to Q1 for review
        setIsChatOpen(true); // Auto open AI help
    };

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
                    text: 'Để thầy giải thích rõ hơn nhé: Đây là câu hỏi về hình học không gian, em cần chú ý đến tính chất vuông góc...',
                    isTyping: false
                }]);
            }, 1000);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correct++;
        });
        return (correct / quiz.totalQuestions) * 10; // Scale 10
    };

    const progress = ((Object.keys(answers).length) / quiz.totalQuestions) * 100;

    return (
        <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans">
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

            {/* 1. Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm z-30 flex-shrink-0 h-16 flex items-center">
                <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link to="/dashboard/student/quizzes" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={22} />
                        </Link>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-tight">{quiz.title}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-gray-500">{quiz.subject}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{quiz.description}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {mode === 'taking' ? (
                            <div className="flex flex-col items-end min-w-[140px]">
                                <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-lg leading-none mb-1">
                                    <Clock size={18} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <span className="text-sm font-bold text-emerald-800">Kết quả:</span>
                                <span className="text-xl font-extrabold text-emerald-600">{calculateScore().toFixed(1)}/10</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. Main Content */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Scrollable Question Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
                    <div className="max-w-4xl mx-auto p-8 pb-32">

                        {/* Review Header */}
                        {mode === 'review' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-blue-50/50">
                                    <Flag size={36} className="text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành bài thi!</h2>
                                <p className="text-gray-500 mb-8 font-medium">Bạn đã làm đúng <span className="text-gray-900 font-bold">{calculateScore() / 2}</span> trên <span className="text-gray-900 font-bold">{quiz.totalQuestions}</span> câu hỏi.</p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setIsChatOpen(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                                    >
                                        <Bot size={20} /> Hỏi trợ lý AI
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                                    >
                                        <RefreshCw size={20} /> Làm lại
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Question Card */}
                        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 md:p-10 mb-8 relative animate-fade-in">

                            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Câu hỏi {currentQuestion + 1} / {quiz.totalQuestions}</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                                        {quiz.questions[currentQuestion].text}
                                    </h2>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                    {mode === 'taking' && (
                                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors" title="Đánh dấu xem lại">
                                            <Flag size={20} />
                                        </button>
                                    )}
                                    {mode === 'review' && (
                                        answers[quiz.questions[currentQuestion].id] === quiz.questions[currentQuestion].correctAnswer ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm border border-emerald-100">
                                                <CheckCircle size={16} /> Đúng
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl text-sm border border-red-100">
                                                <XCircle size={16} /> Sai
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {quiz.questions[currentQuestion].options.map((option) => {
                                    const question = quiz.questions[currentQuestion];
                                    const isSelected = answers[question.id] === option.id;
                                    const isCorrect = option.id === question.correctAnswer;

                                    let cardClass = "border-gray-200 hover:border-blue-300 hover:bg-gray-50"; // Default
                                    let iconClass = "bg-white border-gray-300 text-gray-500 font-bold shadow-sm";
                                    let textClass = "text-gray-600";

                                    if (mode === 'taking') {
                                        if (isSelected) {
                                            cardClass = "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500";
                                            iconClass = "bg-blue-600 border-blue-600 text-white font-bold shadow-md";
                                            textClass = "text-blue-900 font-semibold";
                                        }
                                    } else {
                                        // Review Mode
                                        if (isCorrect) {
                                            cardClass = "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500";
                                            iconClass = "bg-emerald-500 border-emerald-500 text-white shadow-md";
                                            textClass = "text-emerald-900 font-bold";
                                        } else if (isSelected && !isCorrect) {
                                            cardClass = "border-red-500 bg-red-50/50 ring-1 ring-red-500";
                                            iconClass = "bg-red-500 border-red-500 text-white shadow-md";
                                            textClass = "text-red-900 font-semibold";
                                        } else if (!isSelected && !isCorrect) {
                                            cardClass = "opacity-50 border-gray-100 bg-gray-50";
                                            textClass = "text-gray-400";
                                        }
                                    }

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(option.id)}
                                            disabled={mode === 'review'}
                                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-5 group ${cardClass}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border-2 flex-shrink-0 transition-all ${iconClass}`}>
                                                {option.id}
                                            </div>
                                            <span className={`text-base flex-1 ${textClass}`}>
                                                {option.text}
                                            </span>

                                            {mode === 'review' && isCorrect && <CheckCircle className="text-emerald-500" size={24} />}
                                            {mode === 'review' && isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation Section */}
                            {mode === 'review' && (
                                <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 animate-fade-in relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <h3 className="font-bold text-emerald-800 flex items-center gap-2.5 mb-3 text-sm uppercase tracking-wide">
                                        <LightbulbIcon className="text-emerald-600" /> Giải thích chi tiết
                                    </h3>
                                    <p className="text-emerald-900 text-[15px] leading-relaxed font-medium">
                                        {quiz.questions[currentQuestion].explanation}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Dots */}
                        <div className="flex justify-center flex-wrap gap-3">
                            {quiz.questions.map((_, idx) => {
                                let dotClass = "bg-gray-200 hover:bg-gray-300 text-gray-500";
                                let content = idx + 1;

                                if (mode === 'taking') {
                                    if (idx === currentQuestion) {
                                        dotClass = "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 font-bold";
                                    } else if (answers[idx + 1]) {
                                        dotClass = "bg-blue-100 text-blue-600 font-semibold";
                                    }
                                } else {
                                    // Review mode dots
                                    if (idx === currentQuestion) dotClass = "ring-2 ring-offset-2 ring-gray-400 scale-110 font-bold";

                                    const q = quiz.questions[idx];
                                    if (answers[q.id] === q.correctAnswer) dotClass += " bg-emerald-100 text-emerald-600 border border-emerald-200";
                                    else dotClass += " bg-red-100 text-red-600 border border-red-200";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-200 border border-transparent ${dotClass}`}
                                    >
                                        {content}
                                    </button>
                                );
                            })}
                        </div>

                    </div>
                </div>

                {/* 3. Right Sidebar - AI Assistant (Fixed) */}
                <div
                    className={`absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 z-30 transition-transform duration-300 ease-in-out shadow-[-4px_0_24px_rgba(0,0,0,0.05)] flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="h-16 flex-shrink-0 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm">Trợ Lý AI</h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                            <PanelRightClose size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${msg.type === 'user' ? 'bg-indigo-100' : 'bg-white'
                                    }`}>
                                    {msg.type === 'user' ? <span className="text-xs font-bold text-indigo-600">You</span> : <Bot size={16} className="text-blue-600" />}
                                </div>
                                <div className={`max-w-[85%] space-y-3 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.type === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
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

                    <div className="p-6 border-t border-gray-200 bg-white">
                        <div className="relative shadow-sm rounded-xl">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi AI về câu hỏi này..."
                                className="w-full pl-5 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Footer Navigation */}
                <div className={`absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-200 z-20 transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {mode === 'taking' && (
                                <>
                                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <CheckCircle size={14} className="text-emerald-500" /> Đã lưu tự động
                                    </span>
                                </>
                            )}
                            {mode === 'review' && (
                                <button
                                    onClick={() => navigate('/dashboard/student/quizzes')}
                                    className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 text-sm"
                                >
                                    Thoát
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${currentQuestion === 0
                                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <ChevronLeft size={18} /> Câu Trước
                            </button>

                            {currentQuestion < quiz.totalQuestions - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 text-sm"
                                >
                                    Câu Tiếp <ChevronRight size={18} />
                                </button>
                            ) : (
                                mode === 'taking' && (
                                    <button
                                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 active:scale-95 text-sm"
                                        onClick={() => {
                                            if (Object.keys(answers).length < quiz.totalQuestions) {
                                                if (!window.confirm('Bạn chưa trả lời hết các câu hỏi. Có chắc chắn muốn nộp bài?')) return;
                                            } else {
                                                if (!window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;
                                            }
                                            handleSubmit();
                                        }}
                                    >
                                        Nộp Bài <Send size={18} />
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Helper Icon Component */}
            {mode === 'review' && (
                <div style={{ display: 'none' }}>
                    {/* Just ensuring icons are imported */}
                </div>
            )}
        </div>
    );
}

const LightbulbIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5a6 6 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5 2.5 2.4 2.9 2.5 3 4" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
);
