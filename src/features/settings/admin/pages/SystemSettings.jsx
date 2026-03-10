import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Database,
  ShieldCheck,
  History,
  Activity,
  AlertTriangle,
  RefreshCcw,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, Switch, Button, Badge, Spin, message, Divider, Tooltip } from 'antd';
import { getSystemSettingsStatus, toggleSystemNotifications, toggleAuditLogs } from '../../api/settingsApi';
import { getInfrastructureMetrics } from '../../../dashboard/api/dashboardApi';

export default function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // States correspond to the 2 main toggles
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [auditLogEnabled, setAuditLogEnabled] = useState(false);

  // Infra metrics for aesthetics (Quick view)
  const [infra, setInfra] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [statusResp, infraResp] = await Promise.all([
        getSystemSettingsStatus(),
        getInfrastructureMetrics()
      ]);

      // Data structure: {"isEventNotificationEnabled":bool, "isAuditLogEnabled":bool}
      const data = statusResp.data || {};

      // Update toggle states to match server values
      setNotifEnabled(!!data.isEventNotificationEnabled);
      setAuditLogEnabled(!!data.isAuditLogEnabled);

      // Determine overall status message
      let msg = "Hoạt động bình thường";
      if (!data.isEventNotificationEnabled && !data.isAuditLogEnabled) {
        msg = "Đang tạm dừng dịch vụ";
      } else if (!data.isEventNotificationEnabled || !data.isAuditLogEnabled) {
        msg = "Đang tối ưu hóa lưu lượng";
      }

      setStatusText(msg);
      setInfra(infraResp.data);
    } catch (err) {
      console.error('Failed to fetch system status', err);
      message.error('Không thể tải trạng thái hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleNotifications = async (checked) => {
    try {
      setLoading(true);
      const resp = await toggleSystemNotifications(checked);
      if (resp.success) {
        setNotifEnabled(checked);
        message.success(resp.message || `Đã ${checked ? 'bật' : 'tắt'} thông báo hệ thống`);
        fetchStatus(); // Refresh status text
      }
    } catch (err) {
      message.error('Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuditLogs = async (checked) => {
    try {
      setLoading(true);
      const resp = await toggleAuditLogs(checked);
      if (resp.success) {
        setAuditLogEnabled(checked);
        message.success(resp.message || `Đã ${checked ? 'bật' : 'tắt'} ghi nhật ký hệ thống`);
        fetchStatus(); // Refresh status text
      }
    } catch (err) {
      message.error('Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Settings size={22} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cấu hình Hệ thống</h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">
              Quản lý các tính năng cốt lõi và kiểm soát lưu lượng nhật ký nền tảng.
            </p>
          </div>
          <Button
            icon={<RefreshCcw size={16} />}
            onClick={fetchStatus}
            loading={loading}
            className="rounded-xl h-11 px-6 font-bold text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-200"
          >
            Làm mới
          </Button>
        </header>

        {/* Status Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái Tổng</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={statusText === "Hoạt động bình thường" ? "success" : "warning"} />
                  <span className={`text-sm font-bold ${statusText === "Hoạt động bình thường" ? "text-emerald-600" : "text-amber-600"}`}>
                    {statusText}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Cpu size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tải máy chủ</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{infra?.cpu?.serverLoadAvg || '0.00'} Load Avg</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <History size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hoạt động App</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{infra?.uptime?.app || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Notifications Toggle */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 relative">
              <Bell size={40} className="text-blue-600" />
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${notifEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {notifEnabled ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-2">Thông báo Hệ thống</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
              Bật hoặc tắt các thông báo tự động từ hệ thống khi có bài tập mới, bài học mới, hoặc thông tin cập nhật cho học sinh và giáo viên.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Trạng thái truyền phát</p>
                <p className="text-xs text-slate-400">Tất cả thông báo Broadcast</p>
              </div>
              <Switch
                checked={notifEnabled}
                onChange={handleToggleNotifications}
                loading={loading}
                className={notifEnabled ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-slate-300'}
                size="large"
              />
            </div>
          </section>

          {/* Audit Logs Toggle */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 relative">
              <Database size={40} className="text-slate-700" />
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${auditLogEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {auditLogEnabled ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-2">Nhật ký Hệ thống (Audit Logs)</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
              Ghi lại chi tiết mọi hành động thay đổi dữ liệu của người dùng. Tắt nhật ký có thể tiết kiệm dung lượng cơ sở dữ liệu nhưng sẽ làm mất khả năng truy vết lỗi.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Trình ghi nhật ký</p>
                <p className="text-xs text-slate-400">Hoạt động tại /api/admin/audit-logs</p>
              </div>
              <Switch
                checked={auditLogEnabled}
                onChange={handleToggleAuditLogs}
                loading={loading}
                className={auditLogEnabled ? 'bg-slate-800 shadow-md shadow-slate-200' : 'bg-slate-300'}
                size="large"
              />
            </div>
          </section>

        </div>

        {/* Important Notice */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-600 mb-1 uppercase tracking-wider">Lưu ý quan trọng</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Việc tắt Audit Logs sẽ ngăn cản quá trình điều tra các sự cố bảo mật trong tương lai. Chỉ nên tắt khi hệ thống đang trong giai đoạn bảo trì hoặc cơ sở dữ liệu gặp áp lực quá tải về I/O.
            </p>
          </div>
        </div>

        {/* Advanced Placeholder Section (Optional Aesthetics) */}
        <div className="opacity-60 bg-slate-100 rounded-3xl p-8 border-2 border-dashed border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={20} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cài đặt Nâng cao (Dự kiến)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-0">Các tính năng giới hạn tốc độ (Rate Limit), chế độ bảo trì toàn cục và cấu hình tham số AI sẽ được cập nhật trong các phiên bản tiếp theo.</p>
        </div>

      </div>
    </div>
  );
}
