import React, { useState } from 'react';
import {
  CheckCircle2,
  Users,
  Clock,
  BarChart3,
  Download,
  Play,
  Grid3x3,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Server,
  AlertTriangle,
  LogIn,
  UserCog,
  Shield,
  ExternalLink,
  FileText,
  Zap,
} from 'lucide-react';

export default function AuditLogManagement() {
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [timeFilter, setTimeFilter] = useState('Last 24 Hours');
  const [currentPage, setCurrentPage] = useState(1);
  const [logTypeFilter, setLogTypeFilter] = useState('all'); // 'all', 'login', 'user-role', 'system'
  const totalPages = 301; // 1204 results / 4 per page

  // Mock audit log data with categories
  const allAuditLogs = [
    {
      id: 1,
      type: 'login',
      timestamp: '24 Th11, 14:22:01',
      user: {
        initials: 'JD',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
      action: 'Đăng nhập thành công',
      module: { name: 'AUTH', color: 'bg-blue-100 text-blue-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: '192.168.1.45',
      details: 'Đăng nhập từ trình duyệt Chrome trên Windows',
    },
    {
      id: 2,
      type: 'user-role',
      timestamp: '24 Th11, 14:20:15',
      user: {
        initials: 'AS',
        name: 'Admin Smith',
        email: 'admin.smith@example.com',
      },
      action: 'Thay đổi vai trò: Nguyễn Văn A từ "Học sinh" → "Giáo viên"',
      module: { name: 'USER MGMT', color: 'bg-purple-100 text-purple-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: '192.168.1.10',
      details: 'Vai trò được cập nhật bởi Admin Smith',
    },
    {
      id: 3,
      type: 'user-role',
      timestamp: '24 Th11, 14:18:30',
      user: {
        initials: 'AS',
        name: 'Admin Smith',
        email: 'admin.smith@example.com',
      },
      action: 'Tạo người dùng mới: Trần Thị B (Email: tran.b@example.com)',
      module: { name: 'USER MGMT', color: 'bg-purple-100 text-purple-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: '192.168.1.10',
      details: 'Người dùng được tạo với vai trò "Học sinh"',
    },
    {
      id: 4,
      type: 'system',
      timestamp: '24 Th11, 14:18:33',
      user: {
        initials: 'SYS',
        name: 'System Worker',
        email: 'system@edu-ai.local',
      },
      action: 'Nhiệm vụ Dọn dẹp Cơ sở dữ liệu',
      module: { name: 'INFRA', color: 'bg-purple-100 text-purple-700' },
      status: { type: 'Processing', color: 'bg-blue-500', text: 'text-blue-700' },
      ipAddress: 'INTERNAL',
      details: 'Tự động dọn dẹp logs cũ hơn 90 ngày',
    },
    {
      id: 5,
      type: 'login',
      timestamp: '24 Th11, 14:15:12',
      user: {
        initials: 'AS',
        name: 'Admin Smith',
        email: 'admin.smith@example.com',
      },
      action: 'Thử Đăng nhập Thất bại - Mật khẩu không đúng',
      module: { name: 'AUTH', color: 'bg-red-100 text-red-700' },
      status: { type: 'Blocked', color: 'bg-red-500', text: 'text-red-700' },
      ipAddress: '203.0.113.89',
      details: '3 lần thử đăng nhập thất bại liên tiếp',
    },
    {
      id: 6,
      type: 'system',
      timestamp: '24 Th11, 14:10:45',
      user: {
        initials: 'MB',
        name: 'Mark Billings',
        email: 'mark.b@example.com',
      },
      action: 'Gói Thanh toán "Enterprise" Đã Cập nhật',
      module: { name: 'BILLING', color: 'bg-green-100 text-green-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: '198.51.100.22',
      details: 'Cập nhật từ gói "Professional" lên "Enterprise"',
    },
    {
      id: 7,
      type: 'system',
      timestamp: '24 Th11, 13:55:20',
      user: {
        initials: 'SYS',
        name: 'System Worker',
        email: 'system@edu-ai.local',
      },
      action: 'Sao lưu Cơ sở dữ liệu tự động',
      module: { name: 'INFRA', color: 'bg-purple-100 text-purple-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: 'INTERNAL',
      details: 'Sao lưu hàng ngày - Kích thước: 2.4GB',
    },
    {
      id: 8,
      type: 'login',
      timestamp: '24 Th11, 13:45:10',
      user: {
        initials: 'JD',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
      action: 'Đăng xuất',
      module: { name: 'AUTH', color: 'bg-blue-100 text-blue-700' },
      status: { type: 'Success', color: 'bg-green-500', text: 'text-green-700' },
      ipAddress: '192.168.1.45',
      details: 'Phiên đăng nhập kết thúc sau 2 giờ 15 phút',
    },
  ];

  // Filter logs based on selected type
  const auditLogs = logTypeFilter === 'all' 
    ? allAuditLogs 
    : allAuditLogs.filter(log => log.type === logTypeFilter);

  // Mock CPU load data for chart
  const cpuData = [35, 38, 42, 40, 45, 43, 45];
  const maxCpu = Math.max(...cpuData);

  // Mock memory data
  const memoryData = [2.1, 2.2, 2.3, 2.35, 2.4, 2.38, 2.4];
  const maxMemory = 8.0;
  const freeMemory = 5.0;

  // Mock error rate data
  const errorData = [0.01, 0.015, 0.02, 0.018, 0.02, 0.019, 0.02];
  const maxError = Math.max(...errorData);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nhật ký Kiểm toán & Giám sát
          </h1>
          <p className="text-gray-600">
            Theo dõi quản trị và telemetry hạ tầng thời gian thực.
          </p>
        </div>

        {/* System Health KPI Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                TÌNH TRẠNG HỆ THỐNG TRỰC TIẾP
              </span>
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-medium text-gray-700 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>24 Giờ Qua</option>
              <option>7 Ngày Qua</option>
              <option>30 Ngày Qua</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                TÌNH TRẠNG HỆ THỐNG
              </h3>
              <p className="text-2xl font-bold text-green-600 mb-1">Khỏe mạnh</p>
              <p className="text-xs text-gray-600">Tất cả module đang hoạt động</p>
            </div>

            {/* Active Sessions Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                PHIÊN HOẠT ĐỘNG
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">1,248</p>
              <p className="text-xs text-green-600 font-medium">+12.5% so với hôm qua</p>
            </div>

            {/* Avg Latency Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-orange-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock size={20} className="text-orange-600" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                ĐỘ TRỄ TRUNG BÌNH
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">142ms</p>
              <p className="text-xs text-gray-600">Trong phạm vi chấp nhận được</p>
            </div>

            {/* API Success Rate Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                TỶ LỆ THÀNH CÔNG API
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">99.98%</p>
              <p className="text-xs text-gray-600">Sự cố cuối cùng cách đây 4 ngày</p>
            </div>
          </div>
        </div>

        {/* Administrative Audit Trail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">DẤU VẾT KIỂM TOÁN QUẢN TRỊ</h2>
            <div className="flex items-center gap-3">
              {/* Log Type Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLogTypeFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    logTypeFilter === 'all'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setLogTypeFilter('login')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                    logTypeFilter === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LogIn size={14} />
                  Đăng nhập
                </button>
                <button
                  onClick={() => setLogTypeFilter('user-role')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                    logTypeFilter === 'user-role'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserCog size={14} />
                  User/Role
                </button>
                <button
                  onClick={() => setLogTypeFilter('system')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                    logTypeFilter === 'system'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Shield size={14} />
                  Hệ thống
                </button>
              </div>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs font-medium text-gray-700 bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Tất cả Module</option>
                <option>LMS CORE</option>
                <option>INFRA</option>
                <option>AUTH</option>
                <option>BILLING</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-medium text-gray-700 bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Trạng thái</option>
                <option>Thành công</option>
                <option>Đang xử lý</option>
                <option>Bị chặn</option>
              </select>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Grid3x3 size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <List size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={18} />
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <Play size={14} />
                Phát Trực tiếp
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    THỜI GIAN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    NGỮ CẢNH NGƯỜI DÙNG
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    LOẠI
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    HÀNH ĐỘNG ĐÃ THỰC HIỆN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    MODULE DỊCH VỤ
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    TRẠNG THÁI SỰ KIỆN
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ĐỊA CHỈ IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => {
                  const typeIcons = {
                    login: LogIn,
                    'user-role': UserCog,
                    system: Shield,
                  };
                  const typeLabels = {
                    login: 'Đăng nhập',
                    'user-role': 'User/Role',
                    system: 'Hệ thống',
                  };
                  const typeColors = {
                    login: 'bg-blue-50 text-blue-700 border-blue-200',
                    'user-role': 'bg-purple-50 text-purple-700 border-purple-200',
                    system: 'bg-orange-50 text-orange-700 border-orange-200',
                  };
                  const TypeIcon = typeIcons[log.type] || FileText;
                  
                  return (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-900">{log.timestamp}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                            {log.user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                            <p className="text-xs text-gray-500">{log.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={14} className={typeColors[log.type].split(' ')[1]} />
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${typeColors[log.type]}`}>
                            {typeLabels[log.type]}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-gray-700">{log.action}</p>
                          {log.details && (
                            <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.module.color}`}>
                          {log.module.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${log.status.color}`}></div>
                          <span className={`text-sm font-medium ${log.status.text}`}>
                            {log.status.type === 'Success' ? 'Thành công' : 
                             log.status.type === 'Processing' ? 'Đang xử lý' : 'Bị chặn'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              KẾT QUẢ {((currentPage - 1) * 4) + 1}-{Math.min(currentPage * 4, auditLogs.length)} CỦA {auditLogs.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                Sau
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Infrastructure Telemetry */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">TELEMETRY HẠ TẦNG</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Load */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CỤM TOÀN CẦU
                </h3>
                <Activity size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-4">45%</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>10 PHÚT TRƯỚC</span>
                  <span>HIỆN TẠI</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {cpuData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 rounded-t transition-all"
                      style={{
                        height: `${(value / maxCpu) * 100}%`,
                        minHeight: '8px',
                      }}
                      title={`${value}%`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Memory (RAM) */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SỬ DỤNG HEAP
                </h3>
                <Server size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-4">2.4GB</p>
              <div className="space-y-2">
                <div className="text-xs text-green-600 font-medium mb-2">LUỒNG ỔN ĐỊNH</div>
                <div className="relative h-20 bg-gray-100 rounded">
                  <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <polyline
                      points={memoryData.map((val, i) => `${(i / (memoryData.length - 1)) * 200},${80 - (val / maxMemory) * 80}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>TRỐNG: {freeMemory}GB</span>
                  <span>TỔNG: {maxMemory}GB</span>
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PHẢN HỒI HTTP 5XX
                </h3>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-600 mb-4">0.02%</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>10 PHÚT TRƯỚC</span>
                  <span className="text-red-600 font-semibold">PHÁT HIỆN SPIKE</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {errorData.map((value, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t transition-all ${
                        value >= 0.02 ? 'bg-red-500' : 'bg-red-300'
                      }`}
                      style={{
                        height: `${(value / maxError) * 100}%`,
                        minHeight: '4px',
                      }}
                      title={`${value}%`}
                    ></div>
                  ))}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  NGƯỠNG: 1.0%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Dashboard Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">BẢNG ĐIỀU KHIỂN GIÁM SÁT</h2>

          {/* Grafana & Prometheus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Grafana */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">Grafana Dashboard</h3>
                </div>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  Mở trong tab mới
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="bg-gray-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Grafana Dashboard</p>
                  <p className="text-xs text-gray-500">
                    Sẽ được nhúng tại đây
                    <br />
                    <span className="text-blue-600">http://grafana.example.com/dashboard</span>
                  </p>
                  {/* Placeholder for iframe - will be uncommented when Grafana URL is ready */}
                  {/* <iframe
                    src="http://grafana.example.com/dashboard"
                    className="w-full h-full border-0"
                    title="Grafana Dashboard"
                  /> */}
                </div>
              </div>
            </div>

            {/* Prometheus */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">Prometheus Metrics</h3>
                </div>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  Mở trong tab mới
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="bg-gray-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Activity size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Prometheus Metrics</p>
                  <p className="text-xs text-gray-500">
                    Sẽ được nhúng tại đây
                    <br />
                    <span className="text-blue-600">http://prometheus.example.com/graph</span>
                  </p>
                  {/* Placeholder for iframe - will be uncommented when Prometheus URL is ready */}
                  {/* <iframe
                    src="http://prometheus.example.com/graph"
                    className="w-full h-full border-0"
                    title="Prometheus Metrics"
                  /> */}
                </div>
              </div>
            </div>
          </div>

          {/* Error Logs & Performance Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Logs */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  <h3 className="text-sm font-bold text-gray-900">Error Logs</h3>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Xem tất cả
                  <ExternalLink size={12} />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { time: '14:22:01', level: 'ERROR', message: 'Database connection timeout', module: 'DB' },
                  { time: '14:18:33', level: 'WARN', message: 'API rate limit approaching', module: 'API' },
                  { time: '14:15:12', level: 'ERROR', message: 'Failed to send email notification', module: 'EMAIL' },
                  { time: '14:10:45', level: 'WARN', message: 'High memory usage detected', module: 'INFRA' },
                  { time: '13:55:20', level: 'ERROR', message: 'Payment gateway timeout', module: 'BILLING' },
                ].map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-gray-600">{log.time}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{log.message}</p>
                    <span className="text-xs text-gray-500">Module: {log.module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Logs */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-yellow-600" />
                  <h3 className="text-sm font-bold text-gray-900">Performance Logs</h3>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Xem tất cả
                  <ExternalLink size={12} />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { time: '14:22:01', metric: 'Response Time', value: '142ms', status: 'good' },
                  { time: '14:18:33', metric: 'Database Query', value: '45ms', status: 'good' },
                  { time: '14:15:12', metric: 'API Call', value: '234ms', status: 'warning' },
                  { time: '14:10:45', metric: 'Page Load', value: '1.2s', status: 'warning' },
                  { time: '13:55:20', metric: 'Cache Hit Rate', value: '87%', status: 'good' },
                ].map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-gray-600">{log.time}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        log.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status === 'good' ? 'Tốt' : 'Cảnh báo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{log.metric}</p>
                    <span className="text-xs font-semibold text-gray-900">{log.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              CÔNG CỤ GIÁM SÁT HỆ THỐNG V4.2.0-STABLE
            </p>
            <p className="text-xs text-gray-600">
              Đồng bộ dữ liệu cuối: <span className="text-blue-600 cursor-pointer">14:22:45 GMT+0</span> Cập nhật mỗi 5s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
