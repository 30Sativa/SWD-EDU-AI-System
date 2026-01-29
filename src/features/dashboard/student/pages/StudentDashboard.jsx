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
  LineChart,
  Line,
  XAxis,
  YAxis,
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Chào buổi sáng, Ngọc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bạn đã hoàn thành 85% mục tiêu tuần
          </p>
        </div>

        <Link
          to="/dashboard/student/courses"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl
                     bg-blue-600 text-white hover:bg-blue-700 transition"
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
            <item.icon size={18} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📊 Study Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Thời gian học 7 ngày gần đây
        </h3>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={studyData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => `${value} giờ`}
                labelStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
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
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                        className="h-full bg-blue-600 rounded-full"
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
              <Calendar size={16} className="text-blue-500" />
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
                  <p className="text-xs text-blue-600 mt-1">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
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
      <div className="h-1.5 bg-blue-100 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
