import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Menu,
  Star,
  Megaphone,
  Save,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function SystemSettings() {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);

  // AI Configuration Master Switch
  const [aiMasterSwitch, setAiMasterSwitch] = useState(true);

  // General Settings
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [rateLimit, setRateLimit] = useState(100);

  // Feature Toggles
  const [automatedGrading, setAutomatedGrading] = useState(true);
  const [studentChatbot, setStudentChatbot] = useState(true);
  const [lessonGenerator, setLessonGenerator] = useState(false);

  // Platform Communication
  const [announcementBanner, setAnnouncementBanner] = useState('');

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    // Logic to save changes
    console.log('Saving system settings...', {
      aiMasterSwitch,
      sessionTimeout,
      rateLimit,
      automatedGrading,
      studentChatbot,
      lessonGenerator,
      announcementBanner,
      maintenanceMode,
    });
    setHasChanges(false);
    alert('Đã lưu cài đặt hệ thống thành công!');
  };

  const handleDiscard = () => {
    // Reset to default values
    setAiMasterSwitch(true);
    setSessionTimeout(60);
    setRateLimit(100);
    setAutomatedGrading(true);
    setStudentChatbot(true);
    setLessonGenerator(false);
    setAnnouncementBanner('');
    setMaintenanceMode(false);
    setHasChanges(false);
  };

  const handleToggleChange = () => {
    setAiMasterSwitch(!aiMasterSwitch);
    setHasChanges(true);
  };

  const handleMaintenanceMode = () => {
    if (window.confirm('Bạn có chắc chắn muốn kích hoạt Chế độ Bảo trì? Tất cả người dùng không phải admin sẽ bị chặn truy cập.')) {
      setMaintenanceMode(true);
      setHasChanges(true);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cài đặt Hệ thống
              </h1>
              <p className="text-gray-600">
                Quản lý cấu hình toàn cục và điều khiển các tính năng của nền tảng.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} className="inline mr-2" />
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Save size={16} />
                Lưu Thay đổi
              </button>
            </div>
          </div>
        </div>

        {/* AI Configuration Master Switch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Zap size={20} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Công tắc Chính Cấu hình AI
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Bật hoặc tắt ngay lập tức tất cả các dịch vụ AI trên nền tảng EDU-AI. 
                  Điều này ảnh hưởng đến chatbot học sinh, chấm điểm tự động và công cụ hỗ trợ giáo viên trên toàn hệ thống.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleToggleChange}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                aiMasterSwitch ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  aiMasterSwitch ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <div>
              <p className={`text-sm font-semibold ${aiMasterSwitch ? 'text-blue-600' : 'text-gray-500'}`}>
                {aiMasterSwitch ? 'HỆ THỐNG HOẠT ĐỘNG' : 'HỆ THỐNG TẮT'}
              </p>
            </div>
          </div>
        </div>

        {/* General Settings & Feature Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GENERAL SETTINGS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Menu size={20} className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">CÀI ĐẶT CHUNG</h2>
            </div>

            <div className="space-y-6">
              {/* User Session Timeout */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian chờ Phiên Người dùng
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Thời gian không hoạt động trước khi người dùng bị đăng xuất.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(Number(e.target.value));
                      setHasChanges(true);
                    }}
                    min="1"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">phút</span>
                </div>
              </div>

              {/* Global Rate Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giới hạn Tốc độ Toàn cục
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Số lượng yêu cầu tối đa mỗi giây trên mỗi địa chỉ IP.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => {
                      setRateLimit(Number(e.target.value));
                      setHasChanges(true);
                    }}
                    min="1"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">yêu cầu/giây</span>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE TOGGLES (MVP) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Star size={20} className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">BẬT/TẮT TÍNH NĂNG (MVP)</h2>
            </div>

            <div className="space-y-6">
              {/* Automated Grading */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Chấm điểm Tự động
                  </label>
                  <p className="text-xs text-gray-600">
                    Đánh giá bài tập được hỗ trợ bởi AI
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAutomatedGrading(!automatedGrading);
                    setHasChanges(true);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    automatedGrading ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      automatedGrading ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Student Chatbot */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Chatbot Học sinh
                  </label>
                  <p className="text-xs text-gray-600">
                    Trợ lý gia sư thời gian thực
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStudentChatbot(!studentChatbot);
                    setHasChanges(true);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    studentChatbot ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      studentChatbot ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Lesson Generator */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trình Tạo Bài học
                  </label>
                  <p className="text-xs text-gray-600">
                    Tự động tạo tài liệu lớp học
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLessonGenerator(!lessonGenerator);
                    setHasChanges(true);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lessonGenerator ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      lessonGenerator ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Communication & Maintenance Mode */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PLATFORM COMMUNICATION */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Megaphone size={20} className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">GIAO TIẾP NỀN TẢNG</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Thông báo Toàn cục
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Văn bản hiển thị cho tất cả người dùng ở đầu nền tảng.
              </p>
              <textarea
                value={announcementBanner}
                onChange={(e) => {
                  setAnnouncementBanner(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="ví dụ: Bảo trì hệ thống đã được lên lịch vào Thứ Bảy lúc 2:00 AM UTC..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Chế độ Bảo trì</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Hạn chế quyền truy cập cho tất cả người dùng không phải admin trong quá trình cập nhật.
            </p>
            {maintenanceMode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                  <AlertCircle size={16} />
                  Chế độ Bảo trì đang hoạt động
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(false);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tắt Chế độ Bảo trì
                </button>
              </div>
            ) : (
              <button
                onClick={handleMaintenanceMode}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kích hoạt Chế độ
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-600">
                Lần thay đổi cuối: <span className="font-semibold text-gray-900">2 giờ trước</span> bởi{' '}
                <span className="font-semibold text-gray-900">admin_jane</span>
              </p>
              <button
                onClick={() => navigate('/dashboard/admin/audit-logs')}
                className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Xem Nhật ký Kiểm toán Đầy đủ
                <ExternalLink size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              EDU-AI v2.4.0-build.821
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
