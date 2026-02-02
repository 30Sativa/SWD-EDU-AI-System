import React from 'react';
import {
  Users,
  Shield,
  BookOpen,
  Gem,
  Download,
  ExternalLink,
  Plus,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

// Giả lập dữ liệu chart cho các chỉ số hệ thống để đồng bộ UI
const chartData = [
  { v: 30 }, { v: 45 }, { v: 35 }, { v: 55 }, { v: 40 }, { v: 65 }, { v: 50 }
];

export default function AdminDashboard() {
  const systemMetrics = [
    {
      label: 'Tổng Người dùng',
      value: '12,540',
      change: '+12%',
      trend: 'up',
      positive: true,
      icon: Users,
      color: '#3b82f6',
      bgBadge: 'bg-green-50 text-green-600'
    },
    {
      label: 'Tài khoản Hoạt động',
      value: '8,902',
      change: '+5.2%',
      trend: 'up',
      positive: true,
      icon: Shield,
      color: '#10b981',
      bgBadge: 'bg-green-50 text-green-600'
    },
    {
      label: 'Tổng Môn học',
      value: '45',
      change: '0%',
      trend: 'neutral',
      positive: null,
      icon: BookOpen,
      color: '#6366f1',
      bgBadge: 'bg-gray-100 text-gray-500'
    },
    {
      label: 'Tổng Khóa học',
      value: '128',
      change: '+8%',
      trend: 'up',
      positive: true,
      icon: Gem,
      color: '#f59e0b',
      bgBadge: 'bg-green-50 text-green-600'
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
      statusColor: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    },
    {
      timestamp: 'Hôm nay, 09:15 SA',
      event: 'Nhập Người dùng Hàng loạt (120 bản ghi)',
      user: 'Alex Admin',
      status: 'THÀNH CÔNG',
      statusColor: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    },
    {
      timestamp: 'Hôm qua, 11:58 CH',
      event: 'Sao lưu Hệ thống Hoàn tất',
      user: 'Công cụ Hệ thống',
      status: 'THÔNG TIN',
      statusColor: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    },
  ];

  // Logic donut chart giữ nguyên
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header - Đồng bộ ManagerDashboard */}
        <header className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Tổng quan Hệ thống</h1>
            <p className="text-slate-500 text-sm mt-1">Theo dõi các chỉ số hiệu suất chính và trạng thái hạ tầng.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0487e2] text-white font-semibold rounded-lg hover:bg-[#0463ca] transition-all shadow-md shadow-[#0487e2]/20">
            <Plus size={18} />
            <span>Thêm Quản trị viên</span>
          </button>
        </header>

        {/* Stats Grid - Style StatCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const gradientId = `grad-${index}`;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[160px] group">
                <div className="flex justify-between items-start z-10">
                  <span className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                    <Icon size={16} className="text-slate-400" />
                    {metric.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${metric.bgBadge}`}>
                    {metric.trend === 'up' && <ArrowUpRight size={12} strokeWidth={3} />}
                    {metric.trend === 'neutral' && <Minus size={12} strokeWidth={3} />}
                    {metric.change}
                  </span>
                </div>
                <div className="z-10 mb-6">
                  <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{metric.value}</h3>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={metric.color} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Distribution - Donut Chart Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#0463ca]">Phân bổ Vai trò</h2>
                <p className="text-xs text-slate-500 mt-1">Phân tích người dùng theo quyền</p>
              </div>
              <button className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca] inline-flex items-center gap-1">
                Xuất CSV <Download size={14} />
              </button>
            </div>

            <div className="p-8 flex flex-col md:flex-row items-center gap-12">
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg width="192" height="192" viewBox="0 0 256 256" className="transform -rotate-90">
                  <circle cx="128" cy="128" r="100" fill="none" stroke="#f1f5f9" strokeWidth="30" />
                  {segments.map((segment, index) => {
                    const radius = 100;
                    const startAngleRad = (segment.startAngle * Math.PI) / 180;
                    const endAngleRad = (segment.endAngle * Math.PI) / 180;
                    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                    const x1 = 128 + radius * Math.cos(startAngleRad);
                    const y1 = 128 + radius * Math.sin(startAngleRad);
                    const x2 = 128 + radius * Math.cos(endAngleRad);
                    const y2 = 128 + radius * Math.sin(endAngleRad);
                    const pathData = [`M 128 128`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, 'Z'].join(' ');
                    return <path key={index} d={pathData} fill={segment.color} stroke="white" strokeWidth="2" />;
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">12K</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">TỔNG</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                {roleDistribution.map((role, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{role.role}</p>
                        <p className="text-xs text-slate-500">{role.count.toLocaleString()} người dùng</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-md">{role.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Information - Sidebar style */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0463ca]">Thông tin Hạ tầng</h2>
              <p className="text-xs text-slate-500 mt-1">Trạng thái tài nguyên máy chủ</p>
            </div>
            <div className="p-6 space-y-5">
              {systemInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{info.label}</span>
                  <div className="flex items-center gap-3">
                    {info.progress ? (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0487e2] rounded-full" style={{ width: info.value }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{info.value}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        {info.value}
                        {info.link && <ExternalLink size={12} className="text-[#0487e2]" />}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-2.5 text-sm font-bold text-[#0487e2] bg-[#f0f6fa] rounded-lg hover:bg-[#e0f2fe] transition-colors">
                Xem Chi tiết Logs Hạ tầng
              </button>
            </div>
          </div>
        </div>

        {/* Recent Logs - Table Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0463ca]">Nhật ký Hệ thống</h2>
            <button className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca]">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Sự kiện</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">{log.timestamp}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{log.event}</td>
                    <td className="px-6 py-4 text-slate-600">{log.user}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${log.statusColor}`}>
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