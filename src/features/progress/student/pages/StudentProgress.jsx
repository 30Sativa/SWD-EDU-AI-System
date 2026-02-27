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
        { day: 'T2', hours: 14.5 },
        { day: 'T3', hours: 5.2 },
        { day: 'T4', hours: 8.8 },
        { day: 'T5', hours: 18.5 },
        { day: 'T6', hours: 4.2 },
        { day: 'T7', hours: 12.0 },
        { day: 'CN', hours: 6.5 },
    ];

    const skillData = [
        { subject: 'Toán', A: 85, fullMark: 100 },
        { subject: 'Lý', A: 90, fullMark: 100 },
        { subject: 'Hóa', A: 75, fullMark: 100 },
        { subject: 'Văn', A: 80, fullMark: 100 },
        { subject: 'Anh', A: 70, fullMark: 100 },
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
        { label: 'TỔNG KHÓA HỌC', value: '08', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'ĐÃ HOÀN THÀNH', value: '03', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'ĐANG HỌC', value: '04', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'CẦN ÔN TẬP', value: '02', icon: Hourglass, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const subjects = [
        {
            id: 1,
            name: 'Toán học 11',
            progress: 65,
            lessons: '24/36',
            quizzes: '12/15',
            hours: '42 Giờ học',
            iconColor: 'bg-slate-100 text-slate-400',
            icon: 'ψ'
        },
        {
            id: 2,
            name: 'Ngữ văn 11',
            progress: 40,
            lessons: '12/30',
            quizzes: '4/10',
            hours: '28 Giờ học',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=200',
            icon: '✎'
        }
    ];

    const achievements = [
        { title: 'CHĂM CHỈ', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'THỦ KHOA', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'VƯỢT KHÓ', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'KHÓA', icon: Lock, color: 'text-slate-300', bg: 'bg-slate-50', locked: true },
    ];

    const weeklyPath = [
        { week: 'Tuần 1', status: 'completed' },
        { week: 'Tuần 2', status: 'completed' },
        { week: 'Tuần 3', status: 'completed' },
        { week: 'Tuần 4', status: 'current' },
        { week: 'Tuần 5', status: 'locked' },
        { week: 'Tuần 6', status: 'locked' },
        { week: 'Tuần 7', status: 'locked' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-[#0463ca] mb-1">TRUNG TÂM PHÂN TÍCH HỌC TẬP</h1>
                    <p className="text-slate-500 text-sm font-medium">Dữ liệu chi tiết về hành trình chinh phục tri thức của bạn.</p>
                </div>

                {/* Hero section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Performance Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-3xl p-10 text-white relative overflow-hidden shadow-xl shadow-blue-100 flex flex-col justify-between h-[300px]">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <TrendingUp size={16} className="text-white" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">CẢI THIỆN PHONG ĐỘ</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Điểm trung bình tăng 0.8</h2>
                                <p className="text-blue-100 text-sm font-medium max-w-sm">Bạn đang có sự bứt phá đáng kể trong 6 tháng qua. Tiếp tục duy trì đà tăng trưởng này nhé!</p>
                            </div>

                            <div className="relative z-10">
                                <button className="px-8 py-3 bg-white text-[#1d4ed8] font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wide">
                                    Xem chi tiết bài thi
                                </button>
                            </div>

                            {/* Background Chart Overlay */}
                            <div className="absolute bottom-0 right-[-20px] w-1/2 h-1/2 opacity-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={scoreTrendData}>
                                        <Area type="monotone" dataKey="score" stroke="#fff" fill="#fff" fillOpacity={0.4} strokeWidth={4} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Achievements */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Trophy size={16} className="text-[#0487e2]" /> THÀNH TỰU MỚI
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {achievements.map((ach, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 rounded-2xl ${ach.bg} ${ach.color} flex items-center justify-center transition-all hover:scale-110 shadow-sm`}>
                                            <ach.icon size={28} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${ach.locked ? 'text-slate-300' : 'text-slate-900'}`}>{ach.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skill Radar Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">BẢN ĐỒ KỸ NĂNG</h3>
                                <div className="text-slate-300"><Target size={18} /></div>
                            </div>
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Radar
                                            name="Kỹ năng"
                                            dataKey="A"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.15}
                                            strokeWidth={3}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="text-center mt-6">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overall average score</p>
                            <p className="text-5xl font-bold text-[#1d4ed8]">8.5</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Activity Bar Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">THỜI GIAN HỌC TẬP</h3>
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold">
                                <TrendingUp size={12} /> +12%
                            </div>
                        </div>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivityData}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <Bar
                                        dataKey="hours"
                                        fill="#f8fafc"
                                        radius={[4, 4, 4, 4]}
                                        hover={{ fill: '#3b82f6' }}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase">Tuần này: 18 giờ 45 phút</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Progress Detail */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-[#0463ca]">Tiến độ chi tiết</h2>
                        <button className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca] flex items-center gap-1 group transition-colors">
                            Xem tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all transform hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-50 text-2xl">
                                    {subject.image ? (
                                        <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-300 font-bold">{subject.icon}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-lg font-bold text-slate-900">{subject.name}</h4>
                                        <span className="text-xs font-bold text-[#1d4ed8]">{subject.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-[#1d4ed8] rounded-full transition-all duration-1000"
                                            style={{ width: `${subject.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <BookOpen size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{subject.lessons} Bài học</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <ClipboardList size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{subject.quizzes} Kiểm tra</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn-primary">
                                    Học tiếp
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Journey Path */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold tracking-tight text-[#0463ca] mb-2 uppercase">Lộ trình học tập hàng tuần</h2>
                        <p className="text-slate-500 text-sm font-medium">Kế hoạch chi tiết giúp bạn đạt mục tiêu học kỳ một cách khoa học và hiệu quả.</p>
                    </div>

                    <div className="relative pt-4 overflow-x-auto pb-10 custom-scrollbar">
                        <div className="flex items-center min-w-[800px] gap-0 px-8">
                            {weeklyPath.map((item, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-4 relative z-10 w-28 shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${item.status === 'completed' ? 'bg-[#3b82f6] border-white text-white shadow-lg' :
                                            item.status === 'current' ? 'bg-white border-[#3b82f6] text-[#3b82f6] shadow-lg ring-8 ring-blue-50' :
                                                'bg-[#f1f5f9] border-white text-[#cbd5e1]'
                                            }`}>
                                            {item.status === 'completed' ? <Check size={22} strokeWidth={3} /> :
                                                item.status === 'current' ? <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div> :
                                                    <Lock size={18} />}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-black mb-1 ${item.status === 'locked' ? 'text-slate-300' : 'text-slate-900'}`}>{item.week}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${item.status === 'completed' ? 'text-blue-600' :
                                                item.status === 'current' ? 'text-[#3b82f6]' :
                                                    'text-slate-300'
                                                }`}>
                                                {item.status === 'completed' ? 'XONG' :
                                                    item.status === 'current' ? 'ĐANG HỌC' :
                                                        'CHƯA MỞ'}
                                            </p>
                                        </div>
                                    </div>
                                    {i < weeklyPath.length - 1 && (
                                        <div className={`flex-1 h-1.5 min-w-[40px] rounded-full mx-[-10px] z-0 ${item.status === 'completed' ? 'bg-[#3b82f6]' : 'bg-[#f1f5f9]'}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

