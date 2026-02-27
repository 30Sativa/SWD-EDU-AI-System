import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../user/api/userApi';
import {
  ArrowRight,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const stats = [
  { label: 'Khóa học đang học', value: '4', icon: BookOpen },
  { label: 'Giờ học tuần này', value: '12.5h', icon: Clock },
  { label: 'Bài tập hoàn thành', value: '85%', icon: CheckCircle },
];

const studyData = [
  { day: 'T2', hours: 1.5 },
  { day: 'T3', hours: 2 },
  { day: 'T4', hours: 1 },
  { day: 'T5', hours: 2.5 },
  { day: 'T6', hours: 1.8 },
  { day: 'T7', hours: 3 },
  { day: 'CN', hours: 2.2 },
];

const continueLearning = [
  {
    id: 1,
    title: 'Nhập môn Trí tuệ Nhân tạo',
    lesson: 'Neural Networks Basic',
    progress: 65,
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    lastAccessed: '2 giờ trước',
  },
  {
    id: 2,
    title: 'Lập trình Python căn bản',
    lesson: 'Functions & Modules',
    progress: 42,
    image:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=1000',
    lastAccessed: '1 ngày trước',
  },
];

const upcomingDeadlines = [
  {
    title: 'Kiểm tra giữa kỳ AI',
    course: 'Nhập môn Trí tuệ Nhân tạo',
    date: 'Hôm nay, 14:00',
  },
  {
    title: 'Nộp bài tập Python',
    course: 'Lập trình Python căn bản',
    date: 'Ngày mai, 23:59',
  },
];

export default function StudentDashboard() {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        const userData = response?.data || response;
        if (userData?.userName) {
          setUserName(userData.userName);
          localStorage.setItem('userName', userData.userName);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-12 pb-16">

      {/* Header / Welcome Banner */}
      <div className="premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-r from-white to-blue-50/20">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Chào quay trở lại, <span className="text-[#0463ca]">{userName}</span>! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Em đã hoàn thành <span className="text-[#0487e2] font-bold">85%</span> mục tiêu học tập trong tuần này.
          </p>
        </div>

        <Link
          to="/dashboard/student/courses"
          className="btn-primary"
        >
          Tiếp tục hành trình
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="premium-card p-6 flex items-center gap-5 group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <item.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
              <p className="text-2xl font-extrabold text-slate-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📊 Study Chart */}
      <div className="premium-card p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-bold text-[#0463ca] mb-1">
              Thời gian học tập
            </h3>
            <p className="text-slate-500 text-xs font-medium tracking-tight">Phân tích nỗ lực của em trong 7 ngày qua</p>
          </div>
          <span className="text-[10px] font-bold text-[#0487e2] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest">7 ngày qua</span>
        </div>

        <div className="h-[280px] w-full overflow-hidden">
          <ResponsiveContainer width="99%" height="100%" minWidth={0}>
            <AreaChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0487e2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0487e2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{ stroke: '#0487e2', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#0487e2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHours)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#0463ca' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">
              Tiếp tục học
            </h2>
            <Link
              to="/dashboard/student/courses"
              className="text-xs font-bold text-[#0487e2] hover:text-[#0463ca] flex items-center gap-1 group/link uppercase tracking-widest transition-colors"
            >
              Xem tất cả <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {continueLearning.map((item) => (
            <div
              key={item.id}
              className="premium-card overflow-hidden group/item"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full sm:w-44 h-36 object-cover"
                />

                <div className="flex-1 p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover/item:text-[#0463ca] transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mb-8">
                    Bài học tiếp: <span className="text-slate-600">{item.lesson}</span>
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-[#0463ca]">{item.progress}% hoàn thành</span>
                      <span className="text-slate-400">{item.lastAccessed}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0487e2] rounded-full transition-all duration-1000"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          {/* Schedule */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-[#0463ca] mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Calendar size={18} />
              Lịch sắp tới
            </h3>

            <div className="space-y-5">
              {upcomingDeadlines.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-sm font-black text-slate-800 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    {item.course}
                  </p>
                  <p className="text-xs font-black text-blue-600">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-gradient-to-br from-[#0487e2] to-[#0463ca] rounded-2xl p-7 text-white shadow-lg shadow-blue-100">
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-blue-50">
              Mục tiêu tuần
            </h3>

            <div className="space-y-6">
              <Progress label="Bài học" value="4 / 5" percent={80} light />
              <Progress label="Thời gian học" value="12.5 / 15h" percent={83} light />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Progress({ label, value, percent, light }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className={light ? "text-blue-100" : "text-slate-400"}>{label}</span>
        <span className={light ? "text-white" : "text-slate-900"}>{value}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${light ? "bg-white/20" : "bg-slate-100"}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${light ? "bg-white" : "bg-blue-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}