import React from 'react';

export default function StudentProgress() {
    const stats = [
        { title: 'Khóa học hoàn thành', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Điểm thông thạo', value: '85%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Tổng huy hiệu', value: '156', color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    const inProgressTasks = [
        { title: 'Toán Học 11 - Chương 3', date: '2 Tháng 3, 2024', progress: 90, daysLeft: 3, color: 'bg-blue-500' },
        { title: 'Vật Lý 12 - Ôn Thi THPT', date: '15 Tháng 3, 2024', progress: 65, daysLeft: 25, color: 'bg-emerald-500' },
        { title: 'Hóa Học 10 - Cơ bản', date: '9 Tháng 3, 2024', progress: 45, daysLeft: 7, color: 'bg-orange-500' },
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

    const weeklySummary = [
        { label: 'Thời gian học', value: '18h', percentage: 120 },
        { label: 'Bài học đã học', value: '15h', percentage: 120 },
        { label: 'Bài kiểm tra đã làm', value: '2h', percentage: 100 },
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
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header with Greeting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">Chào bạn!</h1>
                        <p className="text-gray-600 text-lg font-medium">Hãy hoàn thành nhiệm vụ hôm nay của bạn!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all text-sm shadow-sm">
                            Chia sẻ
                        </button>
                    </div>
                </div>

                {/* Today Task Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Nhiệm Vụ Hôm Nay</h2>
                            <p className="text-blue-100 text-base mb-4">Kiểm tra nhiệm vụ và lịch học hàng ngày của bạn</p>
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
                                Lịch học hôm nay
                            </button>
                        </div>
                    </div>
                </div>

                {/* In-Progress Tasks */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nhiệm Vụ Đang Thực Hiện</h2>
                    <p className="text-gray-600 text-sm mb-4">Kiểm tra tiến độ các nhiệm vụ của bạn</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {inProgressTasks.map((task, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-400 mb-2">{task.date}</p>
                                    <h3 className="text-base font-bold text-gray-900 mb-3">{task.title}</h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-600">Tiến độ {task.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3">
                                        <div
                                            className={`h-full rounded-full ${task.color} transition-all duration-500`}
                                            style={{ width: `${task.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {task.daysLeft} ngày còn lại
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all duration-300">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.title}</p>
                                <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 font-bold text-2xl`}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tasks Progress & Weekly Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Chart Card */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Tiến Độ Nhiệm Vụ</h2>
                        <div className="relative h-64 border-2 border-gray-200 rounded-lg bg-gray-50 p-4">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="w-full h-px bg-gray-200"></div>
                            </div>

                            <div className="relative h-full flex items-end justify-between gap-2">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-gray-500 z-10">
                                    <span className="bg-gray-50 px-1">05</span>
                                    <span className="bg-gray-50 px-1">04</span>
                                    <span className="bg-gray-50 px-1">03</span>
                                    <span className="bg-gray-50 px-1">02</span>
                                    <span className="bg-gray-50 px-1">01</span>
                                </div>

                                {/* Bars */}
                                <div className="flex-1 flex items-end justify-center gap-2 ml-8 h-full">
                                    {weeklyActivity.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end relative">
                                            <div
                                                className={`w-full max-w-[40px] bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-700 shadow-md group-hover:shadow-lg group-hover:brightness-110 relative border-2 border-white`}
                                                style={{ height: item.height }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                    {item.hours}h
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors bg-gray-50 px-1 rounded">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Tóm Tắt Tuần</h3>
                            <select className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Tuần này</option>
                                <option>Tuần trước</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            {weeklySummary.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-1">{item.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                                        {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Milestone Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl shadow-blue-100 mb-6">
                    <div className="mb-6">
                        <h3 className="text-white/90 font-bold text-sm uppercase tracking-widest mb-4">Mục tiêu tiếp theo</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300 font-bold text-xl">
                                🏆
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

                {/* Lộ trình bài học */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden mb-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Lộ Trình Học Tập</h3>
                            <p className="text-sm text-gray-500">Theo dõi tiến độ từng bài học</p>
                        </div>
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
                                            {isDone ? '✓' : isActive ? '▶' : '○'}
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

                {/* Assignments */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Bài Tập ({quizHistory.length})</h3>
                            <p className="text-sm text-gray-500 mt-1">2/5 đã hoàn thành</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {quizHistory.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center font-bold text-xs ${item.score > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                                        }`}>
                                        {item.score > 0 ? '✓' : ''}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {item.score > 0 ? (
                                        <span className="text-sm font-bold text-gray-900">{item.score}/100 Điểm</span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-400">Chưa làm</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
