import React from 'react';
import {
  Plus,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  FileEdit,
  MessageCircle,
  ArrowRight,
  MoreVertical,
  Clock,
  Search
} from 'lucide-react';

const summaryCards = [
  {
    label: 'Tổng Học sinh',
    value: 84,
    change: '+12% tuần này',
    positive: true,
    icon: Users,
    color: 'blue'
  },
  {
    label: 'Khóa học Đang hoạt động',
    value: 3,
    change: 'Ổn định',
    positive: true,
    icon: BookOpen,
    color: 'emerald'
  },
  {
    label: 'Bài học Đã xuất bản',
    value: 35,
    change: '+5% tuần này',
    positive: true,
    icon: FileText,
    color: 'indigo'
  },
  {
    label: 'Bản nháp',
    value: 2,
    change: 'Đang chờ xem xét',
    positive: false,
    icon: ClipboardList,
    color: 'amber'
  },
];

const activeCourses = [
  { name: 'Toán học 10A', students: 32, lessons: 12, category: 'Lớp 10' },
  { name: 'Vật lý 11B', students: 28, lessons: 8, category: 'Lớp 11' },
  { name: 'Tiếng Anh Nâng cao', students: 24, lessons: 15, category: 'Ngôn ngữ' },
];

const draftLessons = [
  { name: 'Giới thiệu về Giải tích', course: 'Toán học 10A', time: 'Hôm qua' },
  { name: 'Chuyển động Sóng', course: 'Vật lý 11B', time: '2 ngày trước' },
];

const recentActivity = [
  {
    user: 'Nguyễn Văn A',
    type: 'Câu hỏi',
    text: 'Đã hỏi về phương trình bậc hai trong Bài 5: Hàm số Bậc hai',
    time: '10 phút trước',
    action: 'Trả lời',
    icon: MessageCircle,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    user: 'Bạn',
    type: 'Chỉnh sửa',
    text: 'Đã cập nhật nội dung bài học trong Bài 8: Đạo hàm',
    time: '2 giờ trước',
    action: null,
    icon: FileEdit,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
];

export default function TeacherDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-gray-900 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Bảng điều khiển</h1>
          <p className="text-gray-500 font-medium">Quản lý lớp học và nội dung giảng dạy của bạn.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton icon={Plus} label="Khóa học" primary />
          <ActionButton icon={Plus} label="Bài học" />
          <ActionButton icon={Plus} label="Câu hỏi" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Active Courses */}
          <SectionContainer title="Khóa học Đang hoạt động" subtitle="Các lớp học hiện tại của bạn" action="Xem tất cả">
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <div
                  key={course.name}
                  className="group flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {course.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{course.name}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        <span className="inline-flex items-center gap-1"><Users size={14} /> {course.students} học sinh</span>
                        <span className="mx-2">•</span>
                        <span className="inline-flex items-center gap-1"><BookOpen size={14} /> {course.lessons} bài học</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full uppercase tracking-wide">
                    Hoạt động
                  </span>
                </div>
              ))}
            </div>
          </SectionContainer>

          {/* Recent Activity */}
          <SectionContainer title="Hoạt động Gần đây" subtitle="Tương tác mới nhất">
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item, idx) => (
                <ActivityItem key={idx} {...item} />
              ))}
            </div>
          </SectionContainer>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Drafts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Bản nháp đang chờ</h2>
              <p className="text-sm text-gray-500 mt-1">Tiếp tục công việc của bạn</p>
            </div>

            <div className="space-y-4 mb-6">
              {draftLessons.map((draft) => (
                <div key={draft.name} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{draft.course}</span>
                    <Clock size={14} className="text-gray-300" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{draft.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">Chỉnh sửa lần cuối: {draft.time}</p>
                </div>
              ))}
            </div>

            <button className="w-full py-3 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100 border-dashed hover:border-solid">
              Xem tất cả Bản nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
const ActionButton = ({ icon: Icon, label, primary }) => (
  <button
    type="button"
    className={`inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95
      ${primary
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatCard = ({ label, value, change, positive, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {change && (
        <div className={`mt-3 inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${positive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {positive ? '↑ ' : ''} {change}
        </div>
      )}
    </div>
  );
};

const SectionContainer = ({ title, subtitle, action, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
      </div>
      {action && (
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline">
          {action} <ArrowRight size={16} />
        </button>
      )}
    </div>
    {children}
  </section>
);

const ActivityItem = ({ user, type, text, time, action, icon: Icon, iconColor, bgColor }) => (
  <div className="py-4 flex flex-col sm:flex-row items-start gap-4 hover:bg-gray-50 rounded-xl transition-colors px-2 -mx-2">
    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-1`}>
      <Icon size={18} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-bold text-gray-900 text-sm">{user}</span>
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${type === 'Câu hỏi' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {type}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      <p className="text-xs text-gray-400 font-medium mt-2 flex items-center gap-1">
        <Clock size={12} /> {time}
      </p>
    </div>
    {action && (
      <button className="self-start sm:self-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all">
        {action}
      </button>
    )}
  </div>
);
