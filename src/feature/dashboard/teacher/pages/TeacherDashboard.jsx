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
} from 'lucide-react';

const summaryCards = [
  {
    label: 'Tổng Học sinh',
    value: 84,
    change: '+12% so với tuần trước',
    positive: true,
    icon: Users,
  },
  {
    label: 'Khóa học Đang hoạt động',
    value: 3,
    change: null,
    icon: BookOpen,
  },
  {
    label: 'Bài học Đã xuất bản',
    value: 35,
    change: '+5% so với tuần trước',
    positive: true,
    icon: FileText,
  },
  {
    label: 'Bản nháp',
    value: 2,
    change: 'Đang chờ xem xét',
    positive: false,
    icon: ClipboardList,
  },
];

const activeCourses = [
  { name: 'Toán học 10A', students: 32, lessons: 12 },
  { name: 'Vật lý 11B', students: 28, lessons: 8 },
  { name: 'Tiếng Anh Nâng cao', students: 24, lessons: 15 },
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
  },
  {
    user: 'Bạn',
    type: 'Chỉnh sửa',
    text: 'Đã cập nhật nội dung bài học trong Bài 8: Đạo hàm',
    time: '2 giờ trước',
    action: null,
    icon: FileEdit,
  },
];

export default function TeacherDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bảng điều khiển</h1>
        <p className="text-gray-600">Chào mừng trở lại, Giáo viên Nguyễn</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tạo Khóa học
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={18} />
          Tạo Bài học
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={18} />
          Tạo Câu hỏi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-600">{card.label}</span>
                <Icon size={20} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              {card.change && (
                <p
                  className={`text-xs font-medium ${
                    card.positive ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {card.positive && '↑ '}
                  {card.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Khóa học Đang hoạt động</h2>
            <p className="text-sm text-gray-500">Các lớp học hiện tại của bạn</p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {activeCourses.map((course) => (
            <div
              key={course.name}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-500">
                  {course.students} học sinh • {course.lessons} bài học
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                đang hoạt động
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Bài học Bản nháp</h2>
          <p className="text-sm text-gray-500">Tiếp tục làm việc với những bài này</p>
        </div>
        <div className="space-y-3 mb-4">
          {draftLessons.map((draft) => (
            <div
              key={draft.name}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{draft.name}</p>
                <p className="text-sm text-gray-500">
                  {draft.course} • {draft.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-full py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Xem tất cả Bản nháp
        </button>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Hoạt động Gần đây</h2>
          <p className="text-sm text-gray-500">Câu hỏi và cập nhật từ học sinh</p>
        </div>
        <div className="space-y-4">
          {recentActivity.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-3 min-w-0">
                  <Icon size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{item.user}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          item.type === 'Câu hỏi'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
                {item.action && (
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    {item.action}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
