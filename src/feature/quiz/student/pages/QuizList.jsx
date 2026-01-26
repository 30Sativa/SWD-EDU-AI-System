import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Calendar
} from 'lucide-react';

export default function QuizList() {
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, overdue

    const quizzes = [
        {
            id: 1,
            title: 'Kiểm tra 15 phút: Hình học không gian',
            subject: 'Toán Học 11',
            className: '11A1',
            duration: '15 phút',
            questions: 10,
            dueDate: 'Hôm nay, 23:59',
            status: 'upcoming', // upcoming, completed, overdue
            score: null
        },
        {
            id: 2,
            title: 'Bài tập: Sóng cơ và sự truyền sóng',
            subject: 'Vật Lý 12',
            className: 'Ôn Thi THPT',
            duration: '45 phút',
            questions: 30,
            dueDate: 'Ngày mai, 12:00',
            status: 'upcoming',
            score: null
        },
        {
            id: 3,
            title: 'Kiểm tra 1 tiết: Cấu tạo nguyên tử',
            subject: 'Hóa Học 10',
            className: 'Cơ bản',
            duration: '45 phút',
            questions: 40,
            dueDate: '20/10/2025',
            status: 'completed',
            score: 9.5
        },
        {
            id: 4,
            title: 'Unit 3: Vocabulary Quiz',
            subject: 'Tiếng Anh 12',
            className: 'Hệ 10 năm',
            duration: '20 phút',
            questions: 20,
            dueDate: '15/10/2025',
            status: 'overdue',
            score: null
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'text-blue-600 bg-blue-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'overdue': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return 'Sắp tới';
            case 'completed': return 'Đã làm';
            case 'overdue': return 'Quá hạn';
            default: return '';
        }
    };

    const filteredQuizzes = filter === 'all'
        ? quizzes
        : quizzes.filter(q => q.status === filter);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài Kiểm Tra</h1>
                        <p className="text-gray-600">Quản lý và thực hiện các bài đánh giá năng lực</p>
                    </div>

                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        {['all', 'upcoming', 'completed', 'overdue'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'all' ? 'Tất cả' : getStatusText(f)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quiz List */}
                <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${quiz.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        quiz.status === 'overdue' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    <FileText size={24} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getStatusColor(quiz.status)}`}>
                                            {getStatusText(quiz.status)}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">{quiz.subject} • {quiz.className}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={16} /> {quiz.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <FileText size={16} /> {quiz.questions} câu hỏi
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={16} /> Hạn: {quiz.dueDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                    {quiz.status === 'upcoming' && (
                                        <Link
                                            to={`/dashboard/student/quizzes/${quiz.id}`}
                                            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-center shadow-lg shadow-blue-200"
                                        >
                                            Làm Bài Ngay
                                        </Link>
                                    )}
                                    {quiz.status === 'completed' && (
                                        <div className="text-right">
                                            <span className="block text-xs text-gray-500">Điểm số</span>
                                            <span className="text-2xl font-bold text-green-600">{quiz.score}</span>
                                        </div>
                                    )}
                                    {quiz.status === 'overdue' && (
                                        <span className="text-red-500 font-medium italic">Đã hết hạn nộp</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredQuizzes.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500">Không có bài kiểm tra nào trong mục này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
