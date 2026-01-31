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
    MoreVertical,
    ListFilter
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
            case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'overdue': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
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
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-900 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Bài Kiểm Tra</h1>
                        <p className="text-gray-500 text-lg font-medium">Quản lý và thực hiện các bài đánh giá năng lực.</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                        {['all', 'upcoming', 'completed', 'overdue'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'all' ? 'Tất cả' : getStatusText(f)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm bài kiểm tra, môn học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <ListFilter size={18} />
                            Bộ lọc
                        </button>
                    </div>
                </div>

                {/* Quiz List */}
                <div className="grid gap-5">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Left Border Status Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${quiz.status === 'completed' ? 'bg-emerald-500' :
                                quiz.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                                }`}></div>

                            <div className="flex flex-col md:flex-row items-center gap-6 pl-2">

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${quiz.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                    quiz.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <FileText size={28} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${quiz.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                            quiz.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>{quiz.subject}</span>
                                        <span className="text-xs font-bold text-gray-400 opacity-60">•</span>
                                        <span className="text-xs font-bold text-gray-500">{quiz.className}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-4 md:mb-2 leading-tight">
                                        {quiz.title}
                                    </h3>

                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <Clock size={16} className="text-gray-400" /> {quiz.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <FileText size={16} className="text-gray-400" /> {quiz.questions} câu
                                        </span>
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${quiz.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <Calendar size={16} className={quiz.status === 'overdue' ? 'text-red-500' : 'text-gray-400'} />
                                            Hạn: {quiz.dueDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
                                    {quiz.status === 'upcoming' && (
                                        <Link
                                            to={`/dashboard/student/quizzes/${quiz.id}`}
                                            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 text-sm whitespace-nowrap w-full md:w-auto flex justify-center items-center gap-2"
                                        >
                                            Làm Bài <ChevronRight size={18} />
                                        </Link>
                                    )}
                                    {quiz.status === 'completed' && (
                                        <div className="text-right flex items-center gap-5">
                                            <div className="flex flex-col items-center md:items-end">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Điểm số</span>
                                                <span className="text-2xl font-extrabold text-emerald-600">{quiz.score}</span>
                                            </div>
                                            <Link
                                                to={`/dashboard/student/quizzes/${quiz.id}`}
                                                className="px-6 py-3 border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all text-sm active:scale-95"
                                            >
                                                Xem Lại
                                            </Link>
                                        </div>
                                    )}
                                    {quiz.status === 'overdue' && (
                                        <span className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl text-sm border border-red-100 shadow-sm">
                                            Đã quá hạn
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredQuizzes.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy bài kiểm tra nào</h3>
                            <p className="text-gray-500 font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
