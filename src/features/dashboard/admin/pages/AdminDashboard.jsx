import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  BookOpen,
  Gem,
  Download,
  ExternalLink,
  ArrowUpRight,
  Minus,
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Monitor,
  Server,
  Activity,
  Layers,
  ChevronRight,
  Zap,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Spin, Modal } from 'antd';

import { getAdminDashboard, getInfrastructureMetrics } from '../../api/dashboardApi';
import { getRecentAuditLogs } from '../../../audit-log/api/auditLogApi';
import * as XLSX from 'xlsx';

const chartData = [
  { v: 30 }, { v: 45 }, { v: 35 }, { v: 55 }, { v: 40 }, { v: 65 }, { v: 50 }
];

// Progress bar with color based on usage percentage
function UsageBar({ percentage, color = '#0487e2' }) {
  const pct = Math.min(100, Math.max(0, percentage));
  const barColor =
    pct >= 90 ? '#ef4444' :
      pct >= 75 ? '#f59e0b' :
        color;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color: barColor }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// Metric row in the infra panel
function InfraRow({ icon: Icon, label, value, extra }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-[#0487e2]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      </div>
      {extra && <div className="flex-shrink-0">{extra}</div>}
    </div>
  );
}

// Modal detail card
function DetailCard({ title, icon: Icon, color = '#0487e2', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
        style={{ background: `linear-gradient(135deg, ${color}10 0%, #fff 100%)` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, badge, progress, progressColor }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-slate-500 min-w-0 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {progress !== undefined ? (
          <UsageBar percentage={progress} color={progressColor} />
        ) : (
          <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
        )}
        {badge && (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide flex-shrink-0 ${badge.cls}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}

// Helper: format ISO date to readable Vietnamese
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Badge color by action string
function actionBadgeCls(action = '') {
  const a = action.toLowerCase();
  if (a.includes('delete') || a.includes('xóa')) return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
  if (a.includes('create') || a.includes('add') || a.includes('tạo')) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (a.includes('update') || a.includes('edit') || a.includes('cập nhật')) return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
  if (a.includes('login') || a.includes('logout')) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  return 'bg-slate-100 text-slate-600';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSubjects: 0,
    totalCourses: 0,
    roleDistribution: []
  });
  const [infrastructure, setInfrastructure] = useState(null);
  const [infraModalOpen, setInfraModalOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // axiosClient interceptor đã unwrap response.data → resp = { success, message, data }
        const resp = await getAdminDashboard();
        const payload = resp.data || {};

        const totalUsers = payload.totalUsers ?? 0;
        const totalStudents = payload.totalStudents ?? 0;
        const totalTeachers = payload.totalTeachers ?? 0;
        const totalCourses = payload.totalCourses ?? 0;
        const totalClasses = payload.totalClasses ?? 0;

        const activeUsers = totalStudents + totalTeachers;
        const roleDistribution = [];
        if (totalStudents) roleDistribution.push({ name: 'Học sinh', value: totalStudents, color: '#3b82f6' });
        if (totalTeachers) roleDistribution.push({ name: 'Giáo viên', value: totalTeachers, color: '#10b981' });
        const otherUsers = totalUsers - totalStudents - totalTeachers;
        if (otherUsers > 0) roleDistribution.push({ name: 'Khác', value: otherUsers, color: '#6366f1' });

        setStats({ totalUsers, activeUsers, totalSubjects: totalClasses, totalCourses, roleDistribution });

        // axiosClient interceptor đã unwrap → infraResp = { success, message, data }
        const infraResp = await getInfrastructureMetrics();
        const infraData = infraResp.data || null;
        setInfrastructure(infraData);

        // Recent audit logs widget
        const logsResp = await getRecentAuditLogs(8);
        setRecentLogs(Array.isArray(logsResp.data) ? logsResp.data : []);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const systemMetrics = [
    { label: 'Tổng Người dùng', value: stats.totalUsers.toLocaleString(), change: '+12%', trend: 'up', icon: Users, color: '#3b82f6', bgBadge: 'bg-green-50 text-green-600' },
    { label: 'Tài khoản Hoạt động', value: stats.activeUsers.toLocaleString(), change: '+5.2%', trend: 'up', icon: Shield, color: '#10b981', bgBadge: 'bg-green-50 text-green-600' },
    { label: 'Tổng Môn học', value: stats.totalSubjects.toLocaleString(), change: '0%', trend: 'neutral', icon: BookOpen, color: '#6366f1', bgBadge: 'bg-gray-100 text-gray-500' },
    { label: 'Tổng Khung Khóa học', value: stats.totalCourses.toLocaleString(), change: '+8%', trend: 'up', icon: Gem, color: '#f59e0b', bgBadge: 'bg-green-50 text-green-600' },
  ];

  const infra = infrastructure;
  const memUsedPct = infra?.memory?.serverUsedPercentage ?? 0;
  const cpuPct = infra?.cpu?.appUsedPercentage ?? 0;
  const diskPct = infra?.disk?.rootUsedPercentage ?? 0;

  // Quick panel items
  const infraQuickRows = infra ? [
    {
      icon: Monitor,
      label: 'Hệ điều hành',
      value: infra.os?.platform || 'N/A',
      extra: infra.os?.isLinux
        ? <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Linux</span>
        : null
    },
    // { icon: Layers, label: 'CPU Cores (Logic)', value: `${infra.hardware?.logicalCores ?? 'N/A'} cores` },
    // { icon: Clock, label: 'Uptime App', value: infra.uptime?.app || 'N/A' },
    // { icon: Server, label: 'Uptime Server', value: infra.uptime?.server || 'N/A' },
    {
      icon: Cpu,
      label: 'CPU App',
      extra: <UsageBar percentage={cpuPct} color="#6366f1" />
    },
    {
      icon: MemoryStick,
      label: 'RAM Server',
      extra: <UsageBar percentage={memUsedPct} color="#0487e2" />
    },
    {
      icon: HardDrive,
      label: 'Disk sử dụng',
      extra: <UsageBar percentage={diskPct} color="#f59e0b" />
    },
  ] : [];

  // recentLogs is now state, populated from API

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Tổng quan Hệ thống</h1>
            <p className="text-slate-500 text-sm mt-1">Theo dõi các chỉ số hiệu suất chính và trạng thái hạ tầng.</p>
          </div>
        </header>

        {loading ? (
          <div className="h-96 flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
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
                      <ResponsiveContainer width="100%" height={64} minWidth={0} minHeight={0}>
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
              {/* Role Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-[#0463ca]">Phân bổ Vai trò</h2>
                    <p className="text-xs text-slate-500 mt-1">Tỷ lệ người dùng theo phân quyền</p>
                  </div>
                  <button
                    className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca] inline-flex items-center gap-1"
                    onClick={() => {
                      try {
                        const exportArr = [
                          { Metric: 'Tổng Người dùng', Value: stats.totalUsers },
                          { Metric: 'Tài khoản Hoạt động', Value: stats.activeUsers },
                          { Metric: 'Tổng Môn học', Value: stats.totalSubjects },
                          { Metric: 'Tổng Khung Khóa học', Value: stats.totalCourses }
                        ];
                        stats.roleDistribution.forEach(r => {
                          exportArr.push({ Metric: `Vai trò - ${r.name}`, Value: r.value });
                        });
                        const worksheet = XLSX.utils.json_to_sheet(exportArr);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
                        XLSX.writeFile(workbook, `dashboard_stats.xlsx`);
                      } catch (err) {
                        console.error('Export failed', err);
                      }
                    }}
                  >
                    Xuất Excel <Download size={14} />
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-[220px] h-[220px] relative">
                    <ResponsiveContainer width={220} height={220} minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie data={stats.roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {stats.roleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">USERS</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {stats.roleDistribution.map((role, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{role.name}</p>
                            <p className="text-xs text-slate-500">{role.value.toLocaleString()} tài khoản</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                          {((role.value / stats.totalUsers) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Infrastructure Quick Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-[#0463ca]">Thông tin Hạ tầng</h2>
                    <p className="text-xs text-slate-500 mt-1">Trạng thái tài nguyên máy chủ thời gian thực</p>
                  </div>
                  {infra && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-1 divide-y divide-slate-50">
                  {infra ? (
                    infraQuickRows.map((row, i) => (
                      <InfraRow key={i} {...row} />
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">Không thể tải dữ liệu hạ tầng.</p>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => setInfraModalOpen(true)}
                    className="w-full py-2.5 text-sm font-bold text-[#0487e2] bg-[#f0f6fa] rounded-xl hover:bg-[#e0f2fe] transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity size={15} />
                    Xem Chi tiết Hạ tầng
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Audit Logs Widget – dữ liệu thật từ /api/admin/audit-logs/recent */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#0463ca]">Nhật ký Hệ thống</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Các hoạt động gần đây nhất</p>
                </div>
                <button
                  className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca] flex items-center gap-1"
                  onClick={() => navigate('/dashboard/admin/audit-logs')}
                >
                  Xem tất cả <ChevronRight size={14} />
                </button>
              </div>
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">Không có nhật ký nào.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-3">Thời gian</th>
                        <th className="px-6 py-3">Hành động</th>
                        <th className="px-6 py-3">Entity</th>
                        <th className="px-6 py-3">Người thực hiện</th>
                        <th className="px-6 py-3">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                            {fmtDate(log.createdAt)}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${actionBadgeCls(log.action)}`}>
                              {log.action || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold text-slate-700">{log.entity || '—'}</td>
                          <td className="px-6 py-3">
                            <p className="text-sm font-bold text-slate-800 max-w-[160px] truncate">{log.userEmail || '—'}</p>
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-mono text-xs text-slate-500">{log.ipAddress || '—'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ====== Infrastructure Detail Modal ====== */}
      <Modal
        open={infraModalOpen}
        onCancel={() => setInfraModalOpen(false)}
        footer={null}
        width={900}
        centered
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Server size={18} className="text-[#0487e2]" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Chi tiết Hạ tầng Máy chủ</p>
              <p className="text-xs text-slate-500 font-normal">Thông tin kỹ thuật đầy đủ – chỉ dành cho Admin</p>
            </div>
          </div>
        }
        styles={{ body: { background: '#f8fafc', padding: '24px' } }}
      >
        {infra ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* OS & Hardware */}
            <DetailCard title="Hệ điều hành & Phần cứng" icon={Monitor} color="#6366f1">
              <DetailRow label="Nền tảng" value={infra.os?.platform || 'N/A'}
                badge={infra.os?.isLinux ? { text: 'Linux ✓', cls: 'bg-emerald-50 text-emerald-700' } : { text: 'Non-Linux', cls: 'bg-slate-100 text-slate-600' }}
              />
              <DetailRow label="CPU Logical Cores" value={`${infra.hardware?.logicalCores ?? 'N/A'} nhân`} />
            </DetailCard>

            {/* Uptime */}
            <DetailCard title="Thời gian Hoạt động" icon={Clock} color="#0487e2">
              <DetailRow label="App Uptime" value={infra.uptime?.app || 'N/A'} />
              <DetailRow label="Server Uptime" value={infra.uptime?.server || 'N/A'} />
            </DetailCard>

            {/* CPU */}
            <DetailCard title="CPU" icon={Cpu} color="#8b5cf6">
              <DetailRow label="App CPU Usage" progress={infra.cpu?.appUsedPercentage ?? 0} progressColor="#8b5cf6" />
              <DetailRow label="Server Load Avg" value={infra.cpu?.serverLoadAvg || 'N/A'}
                badge={{ text: parseFloat(infra.cpu?.serverLoadAvg || 0) < 1 ? 'THẤP' : 'CAO', cls: parseFloat(infra.cpu?.serverLoadAvg || 0) < 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' }}
              />
            </DetailCard>

            {/* Memory */}
            <DetailCard title="Bộ nhớ RAM" icon={MemoryStick} color="#0487e2">
              <DetailRow label="Tổng RAM" value={`${(infra.memory?.totalMb ?? 0).toFixed(0)} MB`} />
              <DetailRow label="App đang dùng" value={`${(infra.memory?.appUsedMb ?? 0).toFixed(1)} MB`} />
              <DetailRow label="Server đang dùng" value={`${(infra.memory?.serverUsedMb ?? 0).toFixed(1)} MB`} />
              <div className="pt-1">
                <p className="text-xs text-slate-500 mb-1">Server RAM Usage</p>
                <UsageBar percentage={infra.memory?.serverUsedPercentage ?? 0} color="#0487e2" />
              </div>
            </DetailCard>

            {/* Disk */}
            <DetailCard title="Ổ đĩa (Root)" icon={HardDrive} color="#f59e0b">
              <DetailRow label="Tổng dung lượng" value={`${(infra.disk?.rootTotalGb ?? 0).toFixed(2)} GB`} />
              <DetailRow label="Đã sử dụng" value={`${(infra.disk?.rootUsedGb ?? 0).toFixed(2)} GB`} />
              <DetailRow label="Còn trống" value={`${((infra.disk?.rootTotalGb ?? 0) - (infra.disk?.rootUsedGb ?? 0)).toFixed(2)} GB`} />
              <div className="pt-1">
                <p className="text-xs text-slate-500 mb-1">Disk Usage</p>
                <UsageBar percentage={infra.disk?.rootUsedPercentage ?? 0} color="#f59e0b" />
              </div>
            </DetailCard>

            {/* Quick Summary */}
            <DetailCard title="Tóm tắt Sức khỏe Hệ thống" icon={Activity} color="#10b981">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'CPU App', val: infra.cpu?.appUsedPercentage ?? 0, color: '#8b5cf6' },
                  { label: 'RAM Server', val: infra.memory?.serverUsedPercentage ?? 0, color: '#0487e2' },
                  { label: 'Disk', val: infra.disk?.rootUsedPercentage ?? 0, color: '#f59e0b' },
                ].map(({ label, val, color }) => {
                  const status = val >= 90 ? 'NGUY HIỂM' : val >= 75 ? 'CẢNH BÁO' : 'BÌNH THƯỜNG';
                  const statusCls = val >= 90 ? 'text-red-600 bg-red-50' : val >= 75 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                  return (
                    <div key={label} className="flex flex-col items-center bg-slate-50 rounded-xl p-3 gap-2">
                      <RadialBarChart width={80} height={80} innerRadius={25} outerRadius={38}
                        data={[{ value: val, fill: color }]} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#e2e8f0' }} />
                      </RadialBarChart>
                      <p className="text-xs font-bold text-slate-600">{label}</p>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${statusCls}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </DetailCard>

          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Server size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không có dữ liệu hạ tầng.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}