import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Save,
  Send,
  Edit,
  Trash2,
  X,
  Check,
  Lightbulb,
  BarChart3,
  Users,
  User,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
} from 'lucide-react';

export default function NotificationManagement() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    targetRoles: {
      'Quản trị viên': false,
      'Quản lý': false,
      'Giáo viên': false,
      'Học sinh': false,
    },
    deliveryChannels: {
      inApp: true,
      email: false,
    },
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      subject: 'Khẩn cấp: Bản vá Bảo mật 4.2.0',
      sentBy: 'Hệ thống',
      sentAt: '2 giờ trước',
      category: 'Cảnh báo Bảo mật',
      categoryColor: 'bg-red-100 text-red-700',
      audience: ['Quản trị viên', 'Quản lý'],
      status: 'Trực tiếp',
      statusColor: 'text-green-600',
      statusDot: 'bg-green-500',
    },
    {
      id: 2,
      subject: 'Ra mắt Tính năng: AI-Tutor v2',
      sentBy: 'Admin',
      sentAt: '24/10/2023',
      category: 'Cập nhật Sản phẩm',
      categoryColor: 'bg-blue-100 text-blue-700',
      audience: ['Học sinh'],
      status: 'Đã gửi',
      statusColor: 'text-gray-600',
      statusDot: 'bg-gray-400',
    },
    {
      id: 3,
      subject: 'Quy trình Sao lưu Cơ sở dữ liệu',
      sentBy: 'Hệ thống',
      sentAt: '30/10',
      category: 'Bảo trì',
      categoryColor: 'bg-orange-100 text-orange-700',
      audience: ['Quản trị viên', 'Quản lý'],
      status: 'Đã lên lịch',
      statusColor: 'text-blue-600',
      statusDot: 'bg-blue-500',
    },
  ]);

  const kpis = [
    {
      label: 'Phát sóng Trực tiếp',
      value: '12',
      change: '+5%',
      positive: true,
    },
    {
      label: 'Nhiệm vụ Đã lên lịch',
      value: '04',
      change: 'Không thay đổi',
      positive: null,
    },
    {
      label: 'Tổng số Đã gửi (Hàng tháng)',
      value: '14.2k',
      change: '~2.4%',
      positive: false,
    },
  ];

  const handleRoleToggle = (role) => {
    setFormData({
      ...formData,
      targetRoles: {
        ...formData.targetRoles,
        [role]: !formData.targetRoles[role],
      },
    });
  };

  const handleChannelToggle = (channel) => {
    setFormData({
      ...formData,
      deliveryChannels: {
        ...formData.deliveryChannels,
        [channel]: !formData.deliveryChannels[channel],
      },
    });
  };

  const handleSaveDraft = () => {
    if (!formData.subject || !formData.message) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    alert('Đã lưu bản nháp thành công!');
  };

  const handleBroadcast = () => {
    if (!formData.subject || !formData.message) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    const selectedRoles = Object.entries(formData.targetRoles)
      .filter(([_, selected]) => selected)
      .map(([role]) => role);

    if (selectedRoles.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò mục tiêu');
      return;
    }

    const newNotification = {
      id: notifications.length + 1,
      subject: formData.subject,
      sentBy: 'Admin',
      sentAt: 'Vừa xong',
      category: 'Thông báo',
      categoryColor: 'bg-blue-100 text-blue-700',
      audience: selectedRoles,
      status: 'Trực tiếp',
      statusColor: 'text-green-600',
      statusDot: 'bg-green-500',
    };

    setNotifications([newNotification, ...notifications]);
    setFormData({
      subject: '',
      message: '',
      targetRoles: {
        'Quản trị viên': false,
        'Quản lý': false,
        'Giáo viên': false,
        'Học sinh': false,
      },
      deliveryChannels: {
        inApp: true,
        email: false,
      },
    });

    alert('Đã gửi thông báo thành công!');
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Đang hoạt động') return notif.status === 'Trực tiếp';
    if (activeTab === 'Đã lên lịch') return notif.status === 'Đã lên lịch';
    return true;
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Thông báo</h1>
              <p className="text-gray-600">
                Phát đi các cập nhật quan trọng và quản lý cảnh báo toàn hệ thống trong hệ sinh thái EDU-AI.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <Plus size={16} />
              Tạo Thông báo
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.positive === true && (
                      <>
                        <ArrowUp size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-600">{kpi.change}</span>
                      </>
                    )}
                    {kpi.positive === false && (
                      <>
                        <ArrowDown size={14} className="text-red-600" />
                        <span className="text-xs font-medium text-red-600">{kpi.change}</span>
                      </>
                    )}
                    {kpi.positive === null && (
                      <span className="text-xs font-medium text-gray-500">{kpi.change}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - New Communication */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Edit size={20} className="text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Thông báo Mới</h2>
            </div>

            <div className="space-y-5">
              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="ví dụ: Bảo trì hệ thống đã lên lịch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Nội dung Tin nhắn
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mô tả ngắn gọn về cập nhật..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Target Roles */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Vai trò Mục tiêu
                </label>
                <div className="space-y-2">
                  {Object.keys(formData.targetRoles).map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles[role]}
                        onChange={() => handleRoleToggle(role)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Kênh Gửi
                </label>
                <div className="space-y-4">
                  {/* In-App Notification */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">Thông báo trong Ứng dụng</span>
                      </div>
                      <p className="text-xs text-gray-600">Cửa sổ bật lên thời gian thực</p>
                    </div>
                    <button
                      onClick={() => handleChannelToggle('inApp')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.deliveryChannels.inApp ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.deliveryChannels.inApp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Email Blast */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-900">Gửi Email Hàng loạt</span>
                      </div>
                      <p className="text-xs text-gray-600">Gửi đến địa chỉ đã xác minh</p>
                    </div>
                    <button
                      onClick={() => handleChannelToggle('email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.deliveryChannels.email ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.deliveryChannels.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Lưu Bản nháp
                </button>
                <button
                  onClick={handleBroadcast}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Gửi Ngay
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Broadcast Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hoạt động Phát sóng Gần đây</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {['Tất cả', 'Đang hoạt động', 'Đã lên lịch'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notif) => (
                <div key={notif.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{notif.subject}</h3>
                      <p className="text-xs text-gray-500">
                        Được gửi {notif.sentAt} bởi {notif.sentBy}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${notif.categoryColor}`}>
                      {notif.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Audience */}
                      <div className="flex items-center gap-2">
                        {notif.audience.length > 1 ? (
                          <Users size={16} className="text-gray-400" />
                        ) : (
                          <User size={16} className="text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600">{notif.audience.join(', ')}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${notif.statusDot}`}></div>
                        <span className={`text-xs font-medium ${notif.statusColor}`}>{notif.status}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600">
                HIỂN THỊ {filteredNotifications.length} TRONG TỔNG SỐ {notifications.length} MỤC
              </p>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <ArrowUp size={16} className="rotate-[-90deg]" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <ArrowDown size={16} className="rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Tip Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={24} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Mẹo Chuyên nghiệp: Vai trò Mục tiêu</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Chỉ chọn các vai trò cần thiết để giảm mệt mỏi do thông báo và cải thiện tỷ lệ tương tác.
                </p>
              </div>
            </div>
          </div>

          {/* Engagement Insights Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Thông tin Chi tiết về Tương tác</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Cảnh báo "Bảo trì toàn cầu" tuần trước có tỷ lệ đọc <strong>92%</strong> trong vòng{' '}
                  <strong>15 phút</strong> đầu tiên.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
