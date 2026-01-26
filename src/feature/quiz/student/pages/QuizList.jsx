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
    Calendar,
    ArrowUpDown,
    MoreVertical
} from 'lucide-react';

export default function QuizList() {
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, overdue
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const quizzes = [
        {
            id: 1,
            title: 'Kiểm tra 15 phút: Hình học không gian',
            subject: 'Toán Học 11',
            className: '11A1',
            duration: '15 phút',
            questions: 10,
            dueDate: 'Hôm nay, 23:59',
            status: 'upcoming',
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

    const filteredQuizzes = quizzes.filter(q => {
        const matchFilter = filter === 'all' || q.status === filter;
        const matchSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchFilter && matchSearch;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        // Default sort (Date logic placeholder)
        return 0;
    });

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài Kiểm Tra</h1>
                    <p className="text-gray-600">Quản lý và thực hiện các bài đánh giá năng lực</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Status Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                        {['all', 'upcoming', 'completed', 'overdue'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none ${filter === f
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {f === 'all' ? 'Tất cả' : getStatusText(f)}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm bài kiểm tra..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="relative">
                            <button className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quiz List */}
                <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            {/* Left Border Status Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${quiz.status === 'completed' ? 'bg-green-500' :
                                    quiz.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                                }`}></div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pl-2">

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
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{quiz.subject}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs font-medium text-gray-500">{quiz.className}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs">
                                            <Clock size={14} /> {quiz.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs">
                                            <FileText size={14} /> {quiz.questions} câu
                                        </span>
                                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${quiz.status === 'overdue' ? 'bg-red-50 text-red-600 font-medium' : 'bg-gray-50'
                                            }`}>
                                            <Calendar size={14} /> Hạn: {quiz.dueDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 justify-end">
                                    {quiz.status === 'upcoming' && (
                                        <Link
                                            to={`/dashboard/student/quizzes/${quiz.id}`}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200 text-sm whitespace-nowrap"
                                        >
                                            Làm Bài
                                        </Link>
                                    )}
                                    {quiz.status === 'completed' && (
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-bold uppercase">Điểm số</span>
                                                <span className="text-xl font-bold text-green-600">{quiz.score}</span>
                                            </div>
                                            <Link
                                                to={`/dashboard/student/quizzes/${quiz.id}`}
                                                className="px-4 py-2 border border-blue-200 text-blue-600 font-medium rounded-lg hover:bg-blue-50 text-sm"
                                            >
                                                Xem Lại
                                            </Link>
                                        </div>
                                    )}
                                    {quiz.status === 'overdue' && (
                                        <span className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg text-sm border border-red-100">
                                            Quá hạn
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredQuizzes.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-300" size={28} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">Không tìm thấy bài kiểm tra nào</h3>
                            <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
