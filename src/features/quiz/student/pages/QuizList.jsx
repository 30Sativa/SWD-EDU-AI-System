import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Clock,
    User,
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    CheckCircle2,
    Clock3,
    Circle,
    ClipboardList,
} from 'lucide-react';

export default function QuizList() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [quizType, setQuizType] = useState('trac-nghiem');
    const [searchTerm, setSearchTerm] = useState('');

    const quizzes = [
        {
            id: 1,
            title: 'Toán 11 – Hàm số bậc hai (Nâng cao)',
            type: 'KIỂM TRA 1 TIẾT',
            typeColor: 'blue',
            duration: '45 phút',
            questions: 20,
            topic: 'Hàm số',
            teacher: 'GV Nguyễn Văn A',
            status: 'doing', // doing, not-started, completed
            statusText: 'Đang làm',
        },
        {
            id: 2,
            title: 'Vật lý 11 – Khúc xạ ánh sáng & Thấu kính',
            type: 'KIỂM TRA ĐỊNH KỲ',
            typeColor: 'green',
            duration: '60 phút',
            questions: 40,
            topic: 'Quang hình',
            teacher: 'GV Trần Thị B',
            status: 'not-started',
            statusText: 'Chưa bắt đầu',
        },
        {
            id: 3,
            title: 'Hóa học 11 – Ancol & Phenol',
            type: 'KIỂM TRA 1 TIẾT',
            typeColor: 'blue',
            duration: '45 phút',
            questions: 30,
            topic: 'Hữu cơ',
            teacher: 'GV Lê Hoàng C',
            status: 'completed',
            statusText: 'Đã hoàn thành',
        },
        {
            id: 4,
            title: 'Tiếng Anh 11 – Grammar & Reading Unit 1-5',
            type: 'ĐÁNH GIÁ NĂNG LỰC',
            typeColor: 'purple',
            duration: '90 phút',
            questions: 50,
            topic: 'Tổng hợp',
            teacher: 'GV Phạm Minh D',
            status: 'not-started',
            statusText: 'Chưa bắt đầu',
        }
    ];

    const getTypeStyles = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 text-blue-600';
            case 'green': return 'bg-emerald-50 text-emerald-600';
            case 'purple': return 'bg-purple-50 text-purple-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'doing': return 'bg-orange-400';
            case 'completed': return 'bg-emerald-400';
            default: return 'bg-gray-300';
        }
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-50 pb-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Danh sách bài kiểm tra</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Tổng hợp các bài kiểm tra 1 tiết, học kỳ và đánh giá năng lực mới nhất.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm hover:shadow-md transition-all">
                            <Calendar size={18} className="text-blue-500" />
                            Gần đây nhất
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài kiểm tra theo tên, chủ đề hoặc giáo viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bộ lọc bài thi</h3>
                                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Xóa hết</button>
                            </div>

                            <div className="space-y-6">
                                {/* Môn học */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <LayoutGrid size={16} className="text-blue-500" />
                                        MÔN HỌC
                                    </label>
                                    <div className="relative group">
                                        <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                                            <option>Tất cả môn học</option>
                                            <option>Toán học</option>
                                            <option>Vật lý</option>
                                            <option>Hóa học</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Chủ đề */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <ClipboardList size={16} className="text-blue-500" />
                                        CHỦ ĐỀ
                                    </label>
                                    <div className="relative group">
                                        <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                                            <option>Tất cả chủ đề</option>
                                            <option>Hàm số</option>
                                            <option>Quang hình</option>
                                            <option>Hữu cơ</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Trạng thái */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <Clock3 size={16} className="text-blue-500" />
                                        TRẠNG THÁI
                                    </label>
                                    <div className="space-y-2">
                                        {['Chưa làm', 'Đang làm', 'Đã nộp', 'Đã chấm'].map((status) => (
                                            <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-blue-500 transition-all"
                                                        checked={status === 'Đang làm'}
                                                        readOnly
                                                    />
                                                    <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                                </div>
                                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Hình thức */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <BookOpen size={16} className="text-blue-500" />
                                        HÌNH THỨC
                                    </label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setQuizType('trac-nghiem')}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${quizType === 'trac-nghiem' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Trắc nghiệm
                                        </button>
                                        <button
                                            onClick={() => setQuizType('tu-luan')}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${quizType === 'tu-luan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Tự luận
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </aside>

                    <main className="flex-1 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                                        <div className="p-6 flex-1">
                                            {/* Quiz Tag */}
                                            <div className="mb-4">
                                                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${getTypeStyles(quiz.typeColor)} uppercase tracking-wider`}>
                                                    {quiz.type}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-slate-900 mb-5 group-hover:text-blue-600 transition-colors">
                                                {quiz.title}
                                            </h3>

                                            {/* Info Rows */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <ClipboardList size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.questions} câu</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <BookOpen size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.topic}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <User size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.teacher}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(quiz.status)} shadow-sm`}></div>
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{quiz.statusText}</span>
                                            </div>

                                            {quiz.status === 'completed' ? (
                                                <button className="px-5 py-2.5 bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-300 transition-all">
                                                    Kết quả
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/dashboard/student/quizzes/${quiz.id}`}
                                                    className="px-6 py-2.5 bg-[#0487e2] hover:bg-[#0463ca] text-white font-semibold rounded-lg transition-all"
                                                >
                                                    Làm bài
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">Không tìm thấy bài kiểm tra nào phù hợp với từ khóa "{searchTerm}"</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-1 mt-8">
                            <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all">
                                <ChevronLeft size={20} />
                            </button>
                            {[1, 2, 3, '...', 12].map((page, idx) => (
                                <button
                                    key={idx}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${page === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-blue-600'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
