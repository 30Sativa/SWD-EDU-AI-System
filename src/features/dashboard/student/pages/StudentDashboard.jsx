import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Zap,
  CheckCircle,
  Target,
  Trophy,
  Clock,
  ChevronRight,
  Star,
  TrendingUp,
  MoreVertical
} from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Bảng điều khiển</h1>
          <p className="text-gray-500 font-medium">Chào mừng trở lại, chúc bạn một ngày học tập hiệu quả!</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            Học kỳ II - 2025-2026
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Điểm Tích Lũy"
          value="8.5"
          sub="Trung bình môn HK1"
          icon={Star}
          iconColor="text-yellow-500"
          bgIcon="bg-yellow-50"
          trend="+0.2"
        />
        <StatCard
          title="Chuyên Cần"
          value="15 ngày"
          sub="Chuỗi học liên tục"
          icon={Zap}
          iconColor="text-amber-500"
          bgIcon="bg-amber-50"
          trend="Giữ vững"
        />
        <StatCard
          title="Bài Tập Đã Nộp"
          value="24"
          sub="Đúng hạn 100%"
          icon={CheckCircle}
          iconColor="text-indigo-500"
          bgIcon="bg-indigo-50"
        />
        <StatCard
          title="Điểm Kiểm Tra"
          value="9.0"
          sub="Cao hơn lớp 15%"
          icon={Target}
          iconColor="text-blue-500"
          bgIcon="bg-blue-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* My Courses - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lớp Học Của Tôi</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Các môn học theo thời khóa biểu</p>
            </div>
            <Link to="/dashboard/student/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline">
              Xem Tất Cả <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-5">
            {/* Mathematics 11 */}
            <CourseCard
              id="math-11"
              title="Toán Học 11 - Lớp 11A1"
              teacher="Nguyễn Văn Hùng"
              chapter="Chương 3: Quan hệ vuông góc"
              progress={75}
              nextLesson="Hai mặt phẳng vuông góc (Tiết 2)"
              icon={BookOpen}
              theme="blue"
            />

            {/* Physics 12 */}
            <CourseCard
              id="physics-12"
              title="Vật Lý 12 - Ôn Thi THPT"
              teacher="Trần Thị Mai"
              chapter="Chương 4: Dao động và Sóng điện từ"
              progress={40}
              nextLesson="Mạch dao động LC"
              icon={BookOpen}
              theme="indigo"
            />
          </div>
        </div>

        {/* Upcoming Quizzes & Activity - 1/3 width */}
        <div className="space-y-8">

          {/* Due Deadlines */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Sắp Đến Hạn</h2>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <DeadlineItem
                subject="Toán 11"
                title="Kiểm tra 15 phút: Hình học"
                due="Tối mai 23:59"
                type="Trắc nghiệm"
                urgent
              />
              <div className="h-px bg-gray-50 my-4"></div>
              <DeadlineItem
                subject="Vật Lý 12"
                title="Bài tập Sóng dừng"
                due="Thứ 6 tuần này"
                type="Tự luận"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Hoạt Động Mới</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <ActivityItem
                icon={CheckCircle}
                iconColor="text-emerald-500"
                bgIcon="bg-emerald-50"
                title="Đã nộp bài tập"
                subtitle="Toán 11 - Phương trình lượng giác"
                time="2 giờ trước"
                status="Đã chấm"
              />
              <ActivityItem
                icon={Trophy}
                iconColor="text-amber-500"
                bgIcon="bg-amber-50"
                title="Điểm kiểm tra: 9.5"
                subtitle="Hóa Học 10"
                time="Hôm qua"
                status="Giỏi"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, iconColor, bgIcon, trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgIcon}`}>
          <Icon size={22} className={iconColor} />
        </div>
        {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{value}</h3>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function CourseCard({ id, title, teacher, chapter, progress, nextLesson, icon: Icon, theme }) {
  const themeColors = {
    blue: { bg: 'bg-blue-600', light: 'bg-blue-100', text: 'text-blue-600', border: 'hover:border-blue-200' },
    indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-100', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
  };
  const t = themeColors[theme] || themeColors.blue;

  return (
    <Link to={`/dashboard/student/courses/${id}`} className="block group">
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ${t.border}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl ${t.light} flex items-center justify-center flex-shrink-0 shadow-inner`}>
              <Icon size={28} className={t.text} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 font-medium">GV: {teacher}</p>
            </div>
          </div>
          <button className={`px-5 py-2.5 ${t.bg} hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95`}>
            Vào Lớp
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
            <span>{chapter}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className={`${t.bg} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <p className="text-sm text-gray-600">
              Tiếp theo: <span className="font-semibold text-gray-900">{nextLesson}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DeadlineItem({ subject, title, due, type, urgent }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={`p-3 rounded-xl flex-shrink-0 ${urgent ? 'bg-orange-50' : 'bg-gray-50 group-hover:bg-blue-50'} transition-colors`}>
        <FileText size={20} className={urgent ? 'text-orange-500' : 'text-gray-400 group-hover:text-blue-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span className="font-medium">{subject}</span>
          <span>•</span>
          <span className={urgent ? 'text-red-500 font-bold' : ''}>{due}</span>
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
        {type}
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, iconColor, bgIcon, title, subtitle, time, status }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${bgIcon} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">{status}</span>
        <span className="text-[10px] text-gray-400 font-medium">{time}</span>
      </div>
    </div>
  );
}
