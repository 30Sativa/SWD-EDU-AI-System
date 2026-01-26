import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Save, Send, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function QuizDetail() {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

    const quiz = {
        title: 'Kiểm tra 15 phút: Hình học không gian',
        subject: 'Toán Học 11 - 11A1',
        description: 'Kiểm tra kiến thức về quan hệ vuông góc trong không gian',
        totalQuestions: 5,
        questions: [
            {
                id: 1,
                text: 'Cho hình chóp S.ABCD có đáy ABCD là hình vuông. SA ⊥ (ABCD). Khẳng định nào sau đây là ĐÚNG?',
                options: [
                    { id: 'A', text: 'AC ⊥ SB' },
                    { id: 'B', text: 'BD ⊥ (SAC)' },
                    { id: 'C', text: 'CD ⊥ (SAB)' },
                    { id: 'D', text: 'BC ⊥ (SAB)' } // Correct: BC ⊥ AB, BC ⊥ SA => BC ⊥ (SAB)
                ]
            },
            {
                id: 2,
                text: 'Cho hình lập phương ABCD.A\'B\'C\'D\'. Góc giữa hai đường thẳng AC và B\'D\' bằng:',
                options: [
                    { id: 'A', text: '45°' },
                    { id: 'B', text: '60°' },
                    { id: 'C', text: '90°' },
                    { id: 'D', text: '30°' }
                ]
            },
            {
                id: 3,
                text: 'Cho tứ diện đều ABCD. Góc giữa hai đường thẳng AB và CD bằng:',
                options: [
                    { id: 'A', text: '60°' },
                    { id: 'B', text: '30°' },
                    { id: 'C', text: '90°' },
                    { id: 'D', text: '45°' }
                ]
            },
            {
                id: 4,
                text: 'Trong không gian, qua một điểm O cho trước, có bao nhiêu đường thẳng vuông góc với mặt phẳng (P) cho trước?',
                options: [
                    { id: 'A', text: 'Vô số' },
                    { id: 'B', text: '2' },
                    { id: 'C', text: '1' },
                    { id: 'D', text: '0' }
                ]
            },
            {
                id: 5,
                text: 'Mệnh đề nào sau đây SAI?',
                options: [
                    { id: 'A', text: 'Hai đường thẳng phân biệt cùng vuông góc với một đường thẳng thứ ba thì song song với nhau.' },
                    { id: 'B', text: 'Một đường thẳng vuông góc với hai đường thẳng cắt nhau cùng thuộc một mặt phẳng thì vuông góc với mặt phẳng đó.' },
                    { id: 'C', text: 'Hai mặt phẳng phân biệt cùng vuông góc với một đường thẳng thì song song với nhau.' },
                    { id: 'D', text: 'Đường thẳng vuông góc với mặt phẳng thì vuông góc với mọi đường thẳng nằm trong mặt phẳng đó.' }
                ]
            }
        ]
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswer = (optionId) => {
        setAnswers({ ...answers, [currentQuestion]: optionId });
    };

    const progress = ((Object.keys(answers).length) / quiz.totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - Fixed Top */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            {/* Logo or Back button */}
                            <Link to="/dashboard/student/quizzes" className="text-gray-400 hover:text-gray-900">
                                <ArrowLeft size={24} />
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{quiz.title}</h1>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{quiz.subject}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                <Clock size={16} className="text-red-500" />
                                <span className="text-sm font-bold text-red-600 font-mono">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="hidden sm:block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                {currentQuestion + 1}/{quiz.totalQuestions} Câu hỏi
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-6 pb-24">

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 animate-fadeIn">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Câu hỏi {currentQuestion + 1}</h2>
                        <button className="text-gray-400 hover:text-yellow-500 transition-colors" title="Đánh dấu xem lại">
                            <Flag size={20} />
                        </button>
                    </div>

                    <p className="text-lg text-gray-800 leading-relaxed mb-8">
                        {quiz.questions[currentQuestion].text}
                    </p>

                    <div className="space-y-3">
                        {quiz.questions[currentQuestion].options.map((option) => {
                            const isSelected = answers[currentQuestion] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswer(option.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${isSelected
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-500 group-hover:border-blue-400 group-hover:text-blue-600'
                                        }`}>
                                        {option.id}
                                    </div>
                                    <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'
                                        }`}>
                                        {option.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Dots (Optional for easy jumping) */}
                <div className="flex justify-center gap-2 mb-8">
                    {quiz.questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestion(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentQuestion ? 'bg-blue-600 scale-125' :
                                    answers[idx] ? 'bg-blue-300' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

            </div>

            {/* Footer Navigation - Fixed Bottom */}
            <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Auto-save indicator */}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-500" /> Đã lưu tự động
                        </span>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            <Save size={18} /> Lưu Nháp
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${currentQuestion === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <ChevronLeft size={20} /> Câu Trước
                        </button>

                        {currentQuestion < quiz.totalQuestions - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200"
                            >
                                Câu Tiếp Theo <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-200 animate-pulse"
                                onClick={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) {
                                        navigate('/dashboard/student/quizzes');
                                    }
                                }}
                            >
                                Nộp Bài Thi <Send size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
