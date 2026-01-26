import React from 'react';
import {
    Share2,
    Download,
    BookOpen,
    TrendingUp,
    Award,
    Clock,
    ChevronRight,
    CheckCircle,
    PlayCircle,
    Lock,
    FileText,
    Eye,
    Target,
    BarChart3
} from 'lucide-react';

export default function StudentProgress() {
    const stats = [
        { title: 'Khóa học hoàn thành', value: '12', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Điểm thông thạo', value: '85%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Tổng huy hiệu', value: '156', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    const weeklyActivity = [
        { day: 'T2', hours: 2.5, height: '40%', color: 'from-blue-400 to-blue-600' },
        { day: 'T3', hours: 4.0, height: '70%', color: 'from-indigo-400 to-indigo-600' },
        { day: 'T4', hours: 1.5, height: '25%', color: 'from-emerald-400 to-emerald-600' },
        { day: 'T5', hours: 5.0, height: '85%', color: 'from-amber-400 to-amber-600' },
        { day: 'T6', hours: 3.5, height: '60%', color: 'from-rose-400 to-rose-600' },
        { day: 'T7', hours: 6.0, height: '100%', color: 'from-violet-400 to-violet-600' },
        { day: 'CN', hours: 2.0, height: '35%', color: 'from-cyan-400 to-blue-500' },
    ];

    const lessonTimeline = [
        { id: '1.1', title: '1.1 Giới thiệu', status: 'completed', date: '12/10' },
        { id: '1.2', title: '1.2 Cơ bản', status: 'completed', date: '14/10' },
        { id: '1.3', title: '1.3 Nâng cao', status: 'completed', date: '15/10' },
        { id: '2.1', title: '2.1 Biến số', status: 'in-progress', date: 'Đang học' },
        { id: '2.2', title: '2.2 Logic', status: 'locked', date: 'Tiếp theo' },
        { id: '2.3', title: '2.3 Vòng lặp', status: 'locked', date: '' },
        { id: '3.1', title: '3.1 Mảng', status: 'locked', date: '' },
        { id: '3.2', title: '3.2 Đối tượng', status: 'locked', date: '' },
    ];

    const quizHistory = [
        { id: 1, name: 'Lập trình cơ bản', date: '24/10/2023', score: 95, status: 'Xuất sắc', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 2, name: 'Biến & Kiểu dữ liệu', date: '21/10/2023', score: 82, status: 'Đạt', color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 3, name: 'Toán học máy tính', date: '18/10/2023', score: 64, status: 'Thi lại', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Theo Dõi Tiến Độ</h1>
                        <p className="text-gray-500 text-sm italic">
                            Bạn đã đạt <span className="font-bold text-blue-600 text-lg">85%</span> mục tiêu tháng này. Cố gắng lên!
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all text-sm shadow-sm group">
                            <Share2 size={16} className="group-hover:text-blue-600" />
                            Chia sẻ
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 font-semibold transition-all text-sm shadow-lg shadow-blue-100 active:scale-95">
                            <Download size={16} />
                            Báo Cáo PDF
                        </button>
                    </div>
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all duration-300">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:rotate-6`}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Biểu đồ & Milestone */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Chart Card */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <BarChart3 size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Hoạt Động Học Tập</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">14.5 Giờ</p>
                                <p className="text-xs font-bold text-emerald-500">+12% Tuần Trước</p>
                            </div>
                        </div>

                        {/* Biểu đồ cột */}
                        <div className="relative h-64 flex items-end justify-between gap-4 px-4 pb-2">
                            {/* Đường lưới nền (Grid lines) */}
                            <div className="absolute inset-x-0 bottom-2 top-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                                <div className="w-full h-px bg-gray-900"></div>
                                <div className="w-full h-px bg-gray-900"></div>
                                <div className="w-full h-px bg-gray-900"></div>
                                <div className="w-full h-px bg-gray-900"></div>
                            </div>

                            {weeklyActivity.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end relative z-10">
                                    <div
                                        className={`w-full max-w-[32px] bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-700 shadow-sm group-hover:shadow-md group-hover:brightness-110 relative`}
                                        style={{ height: item.height }}
                                    >
                                        {/* Tooltip khi hover */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {item.hours}h
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-blue-600 transition-colors">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột mốc & Huy hiệu */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Award size={120} className="text-white" />
                            </div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-white/90 font-bold text-sm uppercase tracking-widest">Mục tiêu tiếp theo</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                                        <Award size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Chiến Thần Tốc Độ</h4>
                                        <p className="text-blue-100/70 text-xs uppercase tracking-wider font-semibold">Cấp độ 2 • 83%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden ring-1 ring-white/10">
                                        <div className="bg-gradient-to-r from-amber-300 to-yellow-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: '83%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Huy Hiệu Mới</h3>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Tất cả</button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {['🔥', '🎯', '🚀', '🌟'].map((emoji, i) => (
                                    <div key={i} className="aspect-square bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-xl hover:scale-110 hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer shadow-sm">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lộ trình bài học */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <PlayCircle className="text-blue-600" /> Lộ Trình Học Tập
                        </h3>
                        <div className="flex gap-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 px-4 py-2 rounded-full">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> HOÀN THÀNH</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> ĐANG HỌC</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200"></div> ĐÃ KHÓA</span>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex justify-between items-start min-w-[850px] px-6 relative">
                            {/* Line Connect */}
                            <div className="absolute top-[22px] left-0 right-0 h-0.5 bg-gray-100 -z-0 mx-14"></div>

                            {lessonTimeline.map((lesson, idx) => {
                                const isActive = lesson.status === 'in-progress';
                                const isDone = lesson.status === 'completed';
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-5 relative z-10 w-32">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isDone ? 'bg-emerald-500 border-emerald-50 text-white shadow-lg shadow-emerald-100' :
                                                isActive ? 'bg-blue-600 border-blue-50 text-white shadow-xl shadow-blue-100 scale-110 ring-4 ring-blue-50/50' :
                                                    'bg-white border-gray-100 text-gray-300'
                                            }`}>
                                            {isDone ? <CheckCircle size={20} /> : isActive ? <PlayCircle size={20} className="fill-white" /> : <Lock size={16} />}
                                        </div>
                                        <div className="text-center group-hover:scale-105 transition-transform">
                                            <p className={`text-sm font-bold leading-tight ${lesson.status === 'locked' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {lesson.title}
                                            </p>
                                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {lesson.date}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bảng kết quả */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="p-8 md:p-10 pb-4 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-900">Kết Quả Đánh Giá</h3>
                        <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all uppercase tracking-widest border border-blue-100"> Xem chi tiết </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                                    <th className="px-10 py-5">Bài Kiểm Tra</th>
                                    <th className="px-10 py-5">Thời Gian</th>
                                    <th className="px-10 py-5">Điểm Số</th>
                                    <th className="px-10 py-5">Xếp Loại</th>
                                    <th className="px-10 py-5 text-right">Xem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {quizHistory.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/40 transition-colors">
                                        <td className="px-10 py-8 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</td>
                                        <td className="px-10 py-8 text-gray-500 font-medium">{item.date}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4 w-44">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${item.score >= 90 ? 'bg-emerald-500' : item.score >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                                                        }`} style={{ width: `${item.score}%` }}></div>
                                                </div>
                                                <span className="font-extrabold text-gray-900 text-sm whitespace-nowrap">{item.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${item.bg} ${item.text} border-current/20`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white border border-gray-100">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
