import React from 'react';
import {
    BookOpen,
    CheckCircle,
    Clock,
    Hourglass,
    Trophy,
    ChevronRight,
    Book,
    Lock,
    Check,
    TrendingUp,
    Zap,
    Target,
    Medal,
    Star,
    LayoutGrid,
    ClipboardList
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

export default function StudentProgress() {
    // Mock data for charts
    const weeklyActivityData = [
        { day: 'T2', hours: 4.5 },
        { day: 'T3', hours: 5.2 },
        { day: 'T4', hours: 3.8 },
        { day: 'T5', hours: 6.5 },
        { day: 'T6', hours: 4.2 },
        { day: 'T7', hours: 7.0 },
        { day: 'CN', hours: 2.5 },
    ];

    const skillData = [
        { subject: 'Toán học', A: 85, fullMark: 100 },
        { subject: 'Vật lí', A: 90, fullMark: 100 },
        { subject: 'Ngữ văn', A: 65, fullMark: 100 },
        { subject: 'Hóa học', A: 75, fullMark: 100 },
        { subject: 'Tiếng Anh', A: 80, fullMark: 100 },
        { subject: 'Sinh học', A: 55, fullMark: 100 },
    ];

    const scoreTrendData = [
        { month: 'Jan', score: 7.2 },
        { month: 'Feb', score: 7.5 },
        { month: 'Mar', score: 8.0 },
        { month: 'Apr', score: 7.8 },
        { month: 'May', score: 8.5 },
        { month: 'Jun', score: 8.8 },
    ];

    const stats = [
        { label: 'Tổng khóa học', value: '08', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Đã hoàn thành', value: '03', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Đang học', value: '04', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Còn lại', value: '01', icon: Hourglass, color: 'text-slate-500', bg: 'bg-slate-50' },
    ];

    const subjects = [
        {
            id: 1,
            name: 'Toán học 11',
            progress: 65,
            lessons: '24/36',
            quizzes: '12/15',
            hours: '42 Giờ học',
            iconColor: 'bg-blue-100 text-blue-600',
            icon: 'Σ'
        },
        {
            id: 2,
            name: 'Ngữ văn 11',
            progress: 40,
            lessons: '12/30',
            quizzes: '4/10',
            hours: '28 Giờ học',
            iconColor: 'bg-orange-100 text-orange-600',
            icon: '✎'
        },
        {
            id: 3,
            name: 'Vật lí 11',
            progress: 85,
            lessons: '28/32',
            quizzes: '9/10',
            hours: '36 Giờ học',
            iconColor: 'bg-indigo-100 text-indigo-600',
            icon: '⚗'
        }
    ];

    const achievements = [
        { title: 'Chăm chỉ', desc: 'Học 7 ngày liên tiếp', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'Thủ khoa', desc: 'Đạt điểm 10 môn Toán', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { title: 'Vượt khó', desc: 'Hoàn thành bài tập khó', icon: Medal, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    const weeklyPath = [
        { week: 'Tuần 1', status: 'completed' },
        { week: 'Tuần 2', status: 'completed' },
        { week: 'Tuần 3', status: 'completed' },
        { week: 'Tuần 4', status: 'current' },
        { week: 'Tuần 5', status: 'locked' },
        { week: 'Tuần 6', status: 'locked' },
        { week: 'Tuần 7', status: 'locked' },
        { week: 'Tuần 8', status: 'locked' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Tiến độ học tập của bạn</h1>
                        <p className="text-slate-500 font-medium">Theo dõi hành trình học tập và phát triển bản thân mỗi ngày.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm">
                            <Zap size={18} fill="currentColor" />
                            <span>Streak: 12 ngày</span>
                        </div>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Analytics Section - Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Weekly Activity Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-1">Thời gian học tập</h3>
                                <p className="text-slate-400 text-sm font-medium">Lượng thời gian em dành ra mỗi ngày trong tuần qua</p>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-bold">
                                <TrendingUp size={14} /> 15% vs tuần trước
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Bar
                                        dataKey="hours"
                                        fill="#3b82f6"
                                        radius={[8, 8, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Skill Radar Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-900 mb-1">Nghiên cứu kỹ năng</h3>
                            <p className="text-slate-400 text-sm font-medium">Bản đồ thế mạnh các môn học</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Level"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.15}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400">ĐIỂM TRUNG BÌNH</span>
                                <span className="text-sm font-black text-indigo-600">8.2 / 10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Motivation Banner & Achievements */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Target size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-2">Tiếp tục duy trì phong độ!</h3>
                                <p className="text-blue-100 font-medium">Em đang hoàn thành 65% nội dung Toán học 11. Chỉ còn một chút nữa thôi bài kiểm tra định kỳ sẽ đến!</p>
                            </div>
                            <button className="px-8 py-3.5 bg-white text-blue-600 font-extrabold rounded-2xl shadow-lg transition-all hover:-translate-y-1 active:scale-95">
                                Học tiếp ngay
                            </button>
                        </div>
                        <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                            {/* Score visualization in banner */}
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={scoreTrendData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fff" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="score" stroke="#fff" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Trophy size={22} className="text-orange-500" /> Thành tựu mới
                        </h3>
                        <div className="space-y-4">
                            {achievements.map((ach, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                    <div className={`w-12 h-12 rounded-xl ${ach.bg} ${ach.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                                        <ach.icon size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{ach.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{ach.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all text-sm uppercase tracking-widest">
                            Xem tất cả danh hiệu
                        </button>
                    </div>
                </div>

                {/* Progress By Subject */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900">Chi tiết theo môn học</h2>
                        <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                            Xem báo cáo đầy đủ <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all">
                                <div className={`w-14 h-14 rounded-2x flex flex-shrink-0 items-center justify-center text-2xl font-black rounded-2xl ${subject.iconColor}`}>
                                    {subject.icon}
                                </div>

                                <div className="flex-1 w-full space-y-4 text-center md:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
                                        <span className="text-sm font-bold text-blue-600">{subject.progress}% hoàn thành</span>
                                    </div>

                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${subject.progress}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Book size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">{subject.lessons} Bài học</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ClipboardList size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">{subject.quizzes} Bài kiểm tra</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">{subject.hours}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap active:scale-95">
                                    Tiếp tục học
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Path */}
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-1">Lộ trình học tập hàng tuần</h2>
                        <p className="text-slate-400 font-medium">Học tập đều đặn giúp bạn ghi nhớ kiến thức tốt hơn</p>
                    </div>

                    <div className="relative overflow-x-auto pb-6 custom-scrollbar">
                        <div className="flex items-center justify-between min-w-[800px] px-4 relative">
                            <div className="absolute top-[18px] left-10 right-10 h-1 bg-slate-100 -z-0"></div>

                            {weeklyPath.map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-6 relative z-10 w-24">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${item.status === 'completed' ? 'bg-blue-600 border-blue-50/50 text-white shadow-lg shadow-blue-100' :
                                        item.status === 'current' ? 'bg-white border-blue-600 text-blue-600 shadow-lg scale-110 ring-4 ring-blue-50/50' :
                                            'bg-slate-50 border-white text-slate-200'
                                        }`}>
                                        {item.status === 'completed' ? <Check size={20} strokeWidth={3} /> :
                                            item.status === 'current' ? <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div> :
                                                <Lock size={16} />}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs font-bold mb-1 ${item.status === 'locked' ? 'text-slate-300' : 'text-slate-900'}`}>{item.week}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'completed' ? 'text-blue-600' :
                                            item.status === 'current' ? 'text-blue-700' :
                                                'text-slate-300'
                                            }`}>
                                            {item.status === 'completed' ? 'Hoàn thành' :
                                                item.status === 'current' ? 'Đang học' :
                                                    'Chưa bắt đầu'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

