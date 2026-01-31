import React from 'react';
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

export default function StudentDashboard() {
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

  return (
    <div className="space-y-10 pb-12">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0463ca]">
            Chào buổi sáng, Ngọc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bạn đã hoàn thành 85% mục tiêu tuần
          </p>
        </div>

        <Link
          to="/dashboard/student/courses"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl
                      bg-[#0487e2] text-white hover:bg-[#0463ca] transition"
        >
          Vào học tiếp
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <item.icon size={18} className="text-[#0487e2]" />
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📊 Study Chart (UPDATED) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-base font-bold text-gray-900">
             Thời gian học tập
           </h3>
           <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">7 ngày qua</span>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0487e2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0487e2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
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
            <h2 className="text-lg font-semibold text-gray-900">
              Tiếp tục học
            </h2>
            <Link
              to="/dashboard/student/courses"
              className="text-sm text-[#0487e2] hover:text-[#0463ca] flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {continueLearning.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full sm:w-44 h-36 object-cover"
                />

                <div className="flex-1 p-5">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {item.lesson}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{item.progress}% hoàn thành</span>
                      <span>{item.lastAccessed}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-[#0487e2] rounded-full"
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
        <div className="space-y-6">

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#0487e2]" />
              Lịch sắp tới
            </h3>

            <div className="space-y-4">
              {upcomingDeadlines.map((item, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.course}
                  </p>
                  <p className="text-xs text-[#0487e2] mt-1">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-[#e0f2fe] rounded-2xl p-6 border border-[#b0d6f5]">
            <h3 className="font-semibold text-gray-900 mb-4">
              Mục tiêu tuần
            </h3>

            <div className="space-y-4">
              <Progress label="Bài học" value="4 / 5" percent={80} />
              <Progress label="Thời gian học" value="12.5 / 15h" percent={83} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Progress({ label, value, percent }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-[#e0f2fe] rounded-full">
        <div
          className="h-full bg-[#0487e2] rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}