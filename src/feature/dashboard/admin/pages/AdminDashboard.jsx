import React from 'react';
import { Users, Shield, BookOpen, Gem, Download, ExternalLink, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const systemMetrics = [
    {
      label: 'Tổng Người dùng',
      value: '12,540',
      change: '+12% tháng này',
      positive: true,
      icon: Users,
    },
    {
      label: 'Tài khoản Hoạt động',
      value: '8,902',
      change: '+5.2% từ đỉnh',
      positive: true,
      icon: Shield,
    },
    {
      label: 'Tổng Môn học',
      value: '45',
      change: 'Trạng thái ổn định',
      positive: null,
      icon: BookOpen,
    },
    {
      label: 'Tổng Khóa học',
      value: '128',
      change: '+8% nội dung mới',
      positive: true,
      icon: Gem,
    },
  ];

  const roleDistribution = [
    { role: 'Học sinh', count: 8420, percentage: 67, color: '#3b82f6' },
    { role: 'Giáo viên', count: 3110, percentage: 25, color: '#60a5fa' },
    { role: 'Quản lý', count: 850, percentage: 7, color: '#93c5fd' },
    { role: 'Quản trị viên', count: 160, percentage: 1, color: '#dbeafe' },
  ];

  const systemInfo = [
    { label: 'Phiên bản Nền tảng', value: 'v1.0.2-stable' },
    { label: 'Môi trường', value: 'Sản xuất', link: true },
    { label: 'Thời gian Hoạt động Máy chủ', value: '16d 2h 12m' },
    { label: 'Khu vực', value: 'US-East-1 (VA)' },
    { label: 'Tải Cơ sở dữ liệu', value: '24%', progress: true },
    { label: 'Bộ nhớ Sử dụng', value: '68%', progress: true },
  ];

  const recentLogs = [
    {
      timestamp: 'Hôm nay, 10:42 SA',
      event: 'Khóa học Mới được Tạo: "Đại số Nâng cao"',
      user: 'Soran Jenkins (Giáo viên)',
      status: 'THÀNH CÔNG',
      statusColor: 'bg-green-500',
    },
    {
      timestamp: 'Hôm nay, 09:15 SA',
      event: 'Nhập Người dùng Hàng loạt (120 bản ghi)',
      user: 'Alex Admin',
      status: 'THÀNH CÔNG',
      statusColor: 'bg-green-500',
    },
    {
      timestamp: 'Hôm qua, 11:58 CH',
      event: 'Sao lưu Hệ thống Hoàn tất',
      user: 'Công cụ Hệ thống',
      status: 'THÔNG TIN',
      statusColor: 'bg-blue-500',
    },
  ];

  // Calculate donut chart segments
  const totalUsers = roleDistribution.reduce((sum, role) => sum + role.count, 0);
  let currentAngle = 0;
  const segments = roleDistribution.map((role) => {
    const percentage = (role.count / totalUsers) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...role,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage,
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* System Overview Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan Hệ thống</h2>
            <p className="text-gray-600 text-sm">
              Theo dõi các chỉ số hiệu suất chính và trạng thái hạ tầng của nền tảng học trực tuyến của bạn.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                  <p
                    className={`text-xs font-medium ${
                      metric.positive === true
                        ? 'text-green-600'
                        : metric.positive === false
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {metric.change}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution and System Information Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Distribution Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Phân bổ Vai trò</h2>
                <p className="text-gray-600 text-sm">Phân tích người dùng theo quyền hệ thống</p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                Xuất CSV
                <Download size={14} />
              </button>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="relative w-64 h-64 flex-shrink-0">
                <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="40"
                  />
                  {segments.map((segment, index) => {
                    const radius = 100;
                    const startAngleRad = (segment.startAngle * Math.PI) / 180;
                    const endAngleRad = (segment.endAngle * Math.PI) / 180;
                    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

                    const x1 = 128 + radius * Math.cos(startAngleRad);
                    const y1 = 128 + radius * Math.sin(startAngleRad);
                    const x2 = 128 + radius * Math.cos(endAngleRad);
                    const y2 = 128 + radius * Math.sin(endAngleRad);

                    const pathData = [
                      `M ${128} ${128}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z',
                    ].join(' ');

                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">12K</p>
                    <p className="text-sm font-medium text-gray-600">TỔNG</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-4">
                {roleDistribution.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: role.color }}
                      ></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{role.role}</p>
                        <p className="text-xs text-gray-500">
                          {role.count.toLocaleString()} ({role.percentage}% tổng số)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin Hệ thống</h2>
            <div className="space-y-4">
              {systemInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{info.label}</span>
                  <div className="flex items-center gap-2">
                    {info.progress ? (
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: info.value }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{info.value}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">
                        {info.value}
                        {info.link && (
                          <ExternalLink size={14} className="inline-block ml-1 text-blue-600" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Xem Chi tiết Hạ tầng
            </button>
          </div>
        </div>

        {/* Recent System Logs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nhật ký Hệ thống Gần đây</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Xem Tất cả Nhật ký
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    THỜI GIAN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    SỰ KIỆN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    NGƯỜI DÙNG
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.timestamp}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.event}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.user}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold text-white rounded ${log.statusColor}`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
