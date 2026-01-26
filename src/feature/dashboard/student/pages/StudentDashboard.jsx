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
              <span className="text-sm font-medium text-gray-600">Tổng Điểm</span>
              <div className="p-2 rounded-lg bg-blue-50">
                <Star size={18} className="text-yellow-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">1250</h3>
            <p className="text-xs font-medium text-green-600">↑ 150% so với tuần trước</p>
          </div>

          {/* Learning Streak */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Chuỗi Học Tập</span>
              <div className="p-2 rounded-lg bg-amber-50">
                <Zap size={18} className="text-amber-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">7 ngày</h3>
            <p className="text-xs font-medium text-gray-500">Tiếp tục phát huy!</p>
          </div>

          {/* Completed Lessons */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Bài Đã Hoàn Thành</span>
              <div className="p-2 rounded-lg bg-indigo-50">
                <CheckCircle size={18} className="text-indigo-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-xs font-medium text-gray-400">&nbsp;</p>
          </div>

          {/* Avg Quiz Score */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-600">Điểm TB Bài Kiểm Tra</span>
              <div className="p-2 rounded-lg bg-blue-50">
                <Target size={18} className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">82%</h3>
            <p className="text-xs font-medium text-green-600">↑ 5% so với tuần trước</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Courses - 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Khóa Học Của Tôi</h2>
                <p className="text-sm text-gray-500">Tiếp tục học tập từ nơi bạn đã dừng lại</p>
              </div>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Xem Tất Cả <ChevronRight size={16} />
              </button>
            </div>

            {/* Mathematics 10A */}
            <Link to="/dashboard/student/courses/math-10a" className="block">
              <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900 mb-0.5">Toán Học 10A</h3>
                      <p className="text-sm text-gray-500">Giảng viên: Nguyễn Văn A</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    ▶ Continue
                  </button>
                </div>

                <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                  <span>8/12 bài học</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Tiếp theo:</span>
                  <span className="font-medium text-gray-700">Giới thiệu về Hàm số</span>
                </div>
              </div>
            </Link>

            {/* Physics 11B */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between mb-5">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 mb-0.5">Vật Lý 11B</h3>
                    <p className="text-sm text-gray-500">Giảng viên: Trần Thị B</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  ▶ Continue
                </button>
              </div>

              <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                <span>4/10 bài học</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '40%' }}></div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Tiếp theo:</span>
                <span className="font-medium text-gray-700">Cơ bản về Sóng</span>
              </div>
            </div>
          </div>

          {/* Upcoming Quizzes - 1/3 width */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bài Kiểm Tra Sắp Tới</h2>
              <p className="text-sm text-gray-500">Đừng bỏ lỡ các deadline này</p>
            </div>

            {/* Functions Quiz */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 mb-0.5">Kiểm Tra Hàm Số</h4>
                  <p className="text-xs text-gray-500">Toán Học 10A</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Hạn trong 2 ngày</span>
                </div>
                <span>10 câu hỏi</span>
              </div>
            </div>

            {/* Wave Motion Assessment */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-100 flex-shrink-0">
                  <FileText size={20} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 mb-0.5">Đánh Giá Chuyển Động Sóng</h4>
                  <p className="text-xs text-gray-500">Vật Lý 11B</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Hạn trong 5 ngày</span>
                </div>
                <span>8 câu hỏi</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Xem Tất Cả Bài Kiểm Tra
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hoạt Động Gần Đây</h2>
            <p className="text-sm text-gray-500">Hành trình học tập của bạn</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {/* Activity 1 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Đã hoàn thành: Ứng dụng Phương trình Bậc 2</h4>
                  <p className="text-xs text-gray-500">Toán Học 10A</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600">+50 pts</span>
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
                  <h4 className="font-semibold text-sm text-gray-900">Điểm Kiểm Tra: 85%</h4>
                  <p className="text-xs text-gray-500">Toán Học 10A</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600">+100 pts</span>
                <span className="text-xs text-gray-400">Hôm qua</span>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} className="text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Chuỗi Học 7 Ngày Liên Tiếp!</h4>
                  <p className="text-xs text-gray-500">Thành tích</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600">+200 pts</span>
                <span className="text-xs text-gray-400">Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
