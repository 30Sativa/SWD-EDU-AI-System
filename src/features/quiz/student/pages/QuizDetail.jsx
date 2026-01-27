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
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">

            {/* 1. Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard/student/quizzes" className="text-gray-400 hover:text-gray-900 transition-colors">
                                <ArrowLeft size={24} />
                            </Link>
                            <div>
                                <h1 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">{quiz.title}</h1>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{quiz.subject}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {mode === 'taking' ? (
                                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                                    <Clock size={16} className="text-red-500" />
                                    <span className="text-sm font-bold text-red-600 font-mono">{formatTime(timeLeft)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                                    <span className="text-sm font-bold text-green-700">Điểm: {calculateScore().toFixed(1)}/10</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar (Taking Mode) */}
                    {mode === 'taking' && (
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Main Content */}
            <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'mr-0 md:mr-96' : ''}`}>
                <div className="max-w-4xl mx-auto w-full p-4 md:p-6 pb-24">

                    {/* Review Header (Only in Review Mode) */}
                    {mode === 'review' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Flag size={32} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành bài thi!</h2>
                            <p className="text-gray-600 mb-6">Bạn đã làm đúng {calculateScore() / 2} trên {quiz.totalQuestions} câu hỏi.</p>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Bot size={18} /> Hỏi trợ lý AI
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw size={18} /> Làm lại
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 relative">

                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Câu hỏi {currentQuestion + 1}</h2>
                            {mode === 'taking' && (
                                <button className="text-gray-400 hover:text-yellow-500 transition-colors" title="Đánh dấu xem lại">
                                    <Flag size={20} />
                                </button>
                            )}
                            {mode === 'review' && (
                                answers[quiz.questions[currentQuestion].id] === quiz.questions[currentQuestion].correctAnswer ? (
                                    <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">
                                        <CheckCircle size={14} /> ĐÚNG
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">
                                        <XCircle size={14} /> SAI
                                    </span>
                                )
                            )}
                        </div>

                        <p className="text-lg text-gray-800 leading-relaxed mb-8 font-medium">
                            {quiz.questions[currentQuestion].text}
                        </p>

                        <div className="space-y-3">
                            {quiz.questions[currentQuestion].options.map((option) => {
                                const question = quiz.questions[currentQuestion];
                                const isSelected = answers[question.id] === option.id;
                                const isCorrect = option.id === question.correctAnswer;

                                let cardClass = "border-gray-100 hover:bg-gray-50"; // Default
                                let iconClass = "bg-white border-gray-300 text-gray-500";

                                if (mode === 'taking') {
                                    if (isSelected) {
                                        cardClass = "border-blue-600 bg-blue-50";
                                        iconClass = "bg-blue-600 border-blue-600 text-white";
                                    } else {
                                        cardClass = "border-gray-100 hover:border-blue-200 hover:bg-gray-50";
                                    }
                                } else {
                                    // Review Mode
                                    if (isCorrect) {
                                        cardClass = "border-green-500 bg-green-50";
                                        iconClass = "bg-green-500 border-green-500 text-white";
                                    } else if (isSelected && !isCorrect) {
                                        cardClass = "border-red-500 bg-red-50";
                                        iconClass = "bg-red-500 border-red-500 text-white";
                                    } else if (!isSelected && !isCorrect) {
                                        cardClass = "opacity-60"; // Dim non-selected wrong answers
                                    }
                                }

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        disabled={mode === 'review'}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${cardClass}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border flex-shrink-0 transition-colors ${iconClass}`}>
                                            {option.id}
                                        </div>
                                        <span className={`text-base font-medium ${mode === 'taking' && isSelected ? 'text-blue-900' : 'text-gray-700'
                                            }`}>
                                            {option.text}
                                        </span>

                                        {mode === 'review' && isCorrect && <CheckCircle className="ml-auto text-green-600" size={20} />}
                                        {mode === 'review' && isSelected && !isCorrect && <XCircle className="ml-auto text-red-600" size={20} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Section (Review Mode Only) */}
                        {mode === 'review' && (
                            <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-100 animate-fadeIn">
                                <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                                    <CheckCircle size={18} /> Giải thích đáp án
                                </h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    {quiz.questions[currentQuestion].explanation}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center flex-wrap gap-2 mb-8">
                        {quiz.questions.map((_, idx) => {
                            let dotClass = "bg-gray-200 hover:bg-gray-300";
                            if (mode === 'taking') {
                                if (idx === currentQuestion) dotClass = "bg-blue-600 scale-125 ring-2 ring-blue-200";
                                else if (answers[idx + 1]) dotClass = "bg-blue-400"; // Assuming question IDs match index+1
                            } else {
                                // Review mode dots
                                if (idx === currentQuestion) dotClass = "ring-2 ring-offset-1 ring-gray-400 scale-110";
                                // Check correctness
                                const q = quiz.questions[idx];
                                if (answers[q.id] === q.correctAnswer) dotClass += " bg-green-500";
                                else dotClass += " bg-red-400";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`w-3.5 h-3.5 rounded-full transition-all ${dotClass}`}
                                    title={`Câu ${idx + 1}`}
                                />
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* 3. Footer Navigation - Fixed Bottom */}
            <div className={`bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0 z-20 transition-all duration-300 ${isChatOpen ? 'md:mr-96' : ''}`}>
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {mode === 'taking' && (
                            <>
                                <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
                                    <CheckCircle size={12} className="text-green-500" /> Đã lưu tự động
                                </span>
                                <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    <Save size={18} /> Lưu Nháp
                                </button>
                            </>
                        )}
                        {mode === 'review' && (
                            <button
                                onClick={() => navigate('/dashboard/student/quizzes')}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Thoát
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentQuestion === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={20} /> <span className="hidden sm:inline">Câu Trước</span>
                        </button>

                        {currentQuestion < quiz.totalQuestions - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200 hover:translate-y-[-1px]"
                            >
                                Câu Tiếp <span className="hidden sm:inline">Theo</span> <ChevronRight size={20} />
                            </button>
                        ) : (
                            mode === 'taking' && (
                                <button
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-200 animate-pulse"
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

            {/* 4. AI Assistant Sidebar (Overlay on Mobile, Fixed on Desktop) */}
            <div
                className={`fixed top-0 right-0 bottom-0 bg-white border-l border-gray-200 z-30 transition-transform duration-300 ease-in-out w-96 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <h2 className="font-bold">Trợ Lý Review AI</h2>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded">
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
                                <div className={`max-w-[85%] space-y-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
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

                    <div className="p-4 border-t border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi về câu hỏi này..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isChatOpen && (
                <div
                    onClick={() => setIsChatOpen(false)}
                    className="fixed inset-0 bg-black/20 z-20 md:hidden"
                />
            )}

        </div>
    );
}
