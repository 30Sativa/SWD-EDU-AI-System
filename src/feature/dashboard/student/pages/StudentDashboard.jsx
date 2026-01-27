import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Xin chào!</h1>
              <p className="text-blue-100 text-lg mb-1">Bạn có 3 nhiệm vụ mới hôm nay!</p>
              <p className="text-blue-200 text-sm mb-4">Hãy bắt đầu học tập ngay thôi nào!</p>
              <Link 
                to="/dashboard/student/courses" 
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Xem ngay →
              </Link>
            </div>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Points */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-600">Điểm Tích Lũy</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">8,5</h3>
            <p className="text-sm font-medium text-emerald-600">Trung bình môn HK1</p>
          </div>

          {/* Learning Streak */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-600">Chuyên Cần</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">15 ngày</h3>
            <p className="text-sm font-medium text-gray-600">Chuỗi học liên tục</p>
          </div>

          {/* Completed Lessons */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-600">Bài Tập Đã Nộp</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">24</h3>
            <p className="text-sm font-medium text-emerald-600">Đúng hạn 100%</p>
          </div>

          {/* Avg Quiz Score */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-600">Điểm Kiểm Tra 15'</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">9.0</h3>
            <p className="text-sm font-medium text-emerald-600">Cao hơn lớp 15%</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Courses - 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Lớp Học Của Tôi</h2>
                <p className="text-sm text-gray-600">Các môn học theo thời khóa biểu học kỳ 2</p>
              </div>
              <Link 
                to="/dashboard/student/courses"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Xem Tất Cả →
              </Link>
            </div>

            {/* Mathematics 11 */}
            <Link to="/dashboard/student/courses/math-11" className="block">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Toán Học 11 - Lớp 11A1</h3>
                    <p className="text-sm text-gray-600">GV: Nguyễn Văn Hùng</p>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Vào Lớp
                  </button>
                </div>

                <div className="mb-3 flex justify-between text-sm font-semibold text-gray-600">
                  <span>Chương 3: Quan hệ vuông góc</span>
                  <span className="text-blue-600">75%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Tiếp theo:</span>
                  <span className="font-semibold text-gray-700">Hai mặt phẳng vuông góc (Tiết 2)</span>
                </div>
              </div>
            </Link>

            {/* Physics 12 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Vật Lý 12 - Ôn Thi THPT</h3>
                  <p className="text-sm text-gray-600">GV: Trần Thị Mai</p>
                </div>
                <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                  Vào Lớp
                </button>
              </div>

              <div className="mb-3 flex justify-between text-sm font-semibold text-gray-600">
                <span>Chương 4: Dao động và Sóng điện từ</span>
                <span className="text-indigo-600">40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Tiếp theo:</span>
                <span className="font-semibold text-gray-700">Mạch dao động LC</span>
              </div>
            </div>
          </div>

          {/* Upcoming Quizzes - 1/3 width */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Bài Viết & Kiểm Tra</h2>
              <p className="text-sm text-gray-600">Deadline nộp bài tập về nhà</p>
            </div>

            {/* Math Quiz */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="mb-4">
                <h4 className="font-bold text-base text-gray-900 mb-1">Kiểm tra 15 phút: Hình học</h4>
                <p className="text-sm text-gray-600">Toán 11 - 11A1</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-semibold">Hạn: Tối mai 23:59</span>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">Trắc nghiệm</span>
              </div>
            </div>

            {/* Physic Homework */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="mb-4">
                <h4 className="font-bold text-base text-gray-900 mb-1">Bài tập Sóng dừng</h4>
                <p className="text-sm text-gray-600">Vật Lý 12</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Hạn: Thứ 6 tuần này</span>
                </div>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold">Tự luận</span>
              </div>
            </div>

            <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
              Xem Thời Khóa Biểu
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Hoạt Động Gần Đây</h2>
            <p className="text-sm text-gray-600">Cập nhật từ lớp học</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {/* Activity 1 */}
            <div className="p-5 flex items-center justify-between hover:bg-blue-50/30 transition-all duration-200">
              <div className="flex-1">
                <h4 className="font-bold text-base text-gray-900 mb-0.5">Đã nộp bài tập: Phương trình lượng giác</h4>
                <p className="text-sm text-gray-600">Toán 11 - 11A1</p>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600 mb-1">Đã chấm</span>
                <span className="text-xs text-gray-500">2 giờ trước</span>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="p-5 flex items-center justify-between hover:bg-cyan-50/30 transition-all duration-200">
              <div className="flex-1">
                <h4 className="font-bold text-base text-gray-900 mb-0.5">Điểm kiểm tra 1 tiết: 9.5</h4>
                <p className="text-sm text-gray-600">Hóa Học 10</p>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-600 mb-1">Giỏi</span>
                <span className="text-xs text-gray-500">Hôm qua</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
