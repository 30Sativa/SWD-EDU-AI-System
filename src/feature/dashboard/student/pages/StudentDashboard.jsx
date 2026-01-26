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
  TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Points */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Điểm Tích Lũy</span>
              <div className="p-2 rounded-lg bg-blue-50">
                <Star size={18} className="text-yellow-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">8,5</h3>
            <p className="text-xs font-medium text-green-600">Trung bình môn HK1</p>
          </div>

          {/* Learning Streak */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Chuyên Cần</span>
              <div className="p-2 rounded-lg bg-amber-50">
                <Zap size={18} className="text-amber-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">15 ngày</h3>
            <p className="text-xs font-medium text-gray-500">Chuỗi học liên tục</p>
          </div>

          {/* Completed Lessons */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Bài Tập Đã Nộp</span>
              <div className="p-2 rounded-lg bg-indigo-50">
                <CheckCircle size={18} className="text-indigo-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-xs font-medium text-green-600">Đúng hạn 100%</p>
          </div>

          {/* Avg Quiz Score */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Điểm Kiểm Tra 15'</span>
              <div className="p-2 rounded-lg bg-blue-50">
                <Target size={18} className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">9.0</h3>
            <p className="text-xs font-medium text-green-600">Cao hơn lớp 15%</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Courses - 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Lớp Học Của Tôi</h2>
                <p className="text-sm text-gray-500">Các môn học theo thời khóa biểu học kỳ 2</p>
              </div>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Xem Tất Cả <ChevronRight size={16} />
              </button>
            </div>

            {/* Mathematics 11 */}
            <Link to="/dashboard/student/courses/math-11" className="block">
              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900 mb-0.5">Toán Học 11 - Lớp 11A1</h3>
                      <p className="text-sm text-gray-500">GV: Nguyễn Văn Hùng</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    ▶ Vào Lớp
                  </button>
                </div>

                <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                  <span>Chương 3: Quan hệ vuông góc</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Tiếp theo:</span>
                  <span className="font-medium text-gray-700">Hai mặt phẳng vuông góc (Tiết 2)</span>
                </div>
              </div>
            </Link>

            {/* Physics 12 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between mb-5">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 mb-0.5">Vật Lý 12 - Ôn Thi THPT</h3>
                    <p className="text-sm text-gray-500">GV: Trần Thị Mai</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  ▶ Vào Lớp
                </button>
              </div>

              <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                <span>Chương 4: Dao động và Sóng điện từ</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '40%' }}></div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Tiếp theo:</span>
                <span className="font-medium text-gray-700">Mạch dao động LC</span>
              </div>
            </div>
          </div>

          {/* Upcoming Quizzes - 1/3 width */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bài Viết & Kiểm Tra</h2>
              <p className="text-sm text-gray-500">Deadline nộp bài tập về nhà</p>
            </div>

            {/* Math Quiz */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 mb-0.5">Kiểm tra 15 phút: Hình học</h4>
                  <p className="text-xs text-gray-500">Toán 11 - 11A1</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span className="text-red-500 font-medium">Hạn: Tối mai 23:59</span>
                </div>
                <span>Trắc nghiệm</span>
              </div>
            </div>

            {/* Physic Homework */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 mb-0.5">Bài tập Sóng dừng</h4>
                  <p className="text-xs text-gray-500">Vật Lý 12</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Hạn: Thứ 6 tuần này</span>
                </div>
                <span>Tự luận</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Xem Thời Khóa Biểu
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hoạt Động Gần Đây</h2>
            <p className="text-sm text-gray-500">Cập nhật từ lớp học</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {/* Activity 1 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Đã nộp bài tập: Phương trình lượng giác</h4>
                  <p className="text-xs text-gray-500">Toán 11 - 11A1</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600">Đã chấm</span>
                <span className="text-xs text-gray-400">2 giờ trước</span>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Điểm kiểm tra 1 tiết: 9.5</h4>
                  <p className="text-xs text-gray-500">Hóa Học 10</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600">Gioi</span>
                <span className="text-xs text-gray-400">Hôm qua</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
