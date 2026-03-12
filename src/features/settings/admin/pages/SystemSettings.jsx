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
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Cấu hình Hệ thống</h1>
            <p className="text-slate-500 text-sm font-medium mt-1 italic opacity-80">Quản lý các tính năng cốt lõi và kiểm soát lưu lượng nhật ký nền tảng.</p>
          </div>
          <Button
            icon={<RefreshCcw size={16} />}
            onClick={fetchStatus}
            loading={loading}
            className="rounded-xl h-12 px-6 font-bold text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-200 shadow-sm"
          >
            LÀM MỚI
          </Button>
        </header>

        {/* Status Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">TRẠNG THÁI TỔNG</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${statusText === "Hoạt động bình thường" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className={`text-base font-bold ${statusText === "Hoạt động bình thường" ? "text-emerald-600" : "text-amber-600"}`}>
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
              <Cpu size={26} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">TẢI MÁY CHỦ</p>
              <p className="text-xl font-bold text-slate-800">{infra?.cpu?.serverLoadAvg || '0.00'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Load Average</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
              <History size={26} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">HOẠT ĐỘNG APP</p>
              <p className="text-xl font-bold text-slate-800">{infra?.uptime?.app || 'N/A'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Uptime</p>
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Notifications Toggle */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-8 relative">
              <Bell size={48} className="text-[#0487e2]" />
              <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${notifEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {notifEnabled ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">Thông báo Hệ thống</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4 font-medium">
              Bật hoặc tắt các thông báo tự động từ hệ thống khi có bài tập mới, bài học mới, hoặc thông tin cập nhật cho học học sinh và giáo viên.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-8 flex items-center justify-between border border-slate-100">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CẤU HÌNH TRUYỀN PHÁT</p>
                <p className="text-base font-bold text-slate-800">Trạng thái hiện tại</p>
              </div>
              <Switch
                checked={notifEnabled}
                onChange={handleToggleNotifications}
                loading={loading}
                className={notifEnabled ? '!bg-[#0487e2]' : '!bg-slate-300'}
                size="large"
              />
            </div>
          </section>

          {/* Audit Logs Toggle */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 relative">
              <Database size={48} className="text-slate-700" />
              <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${auditLogEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {auditLogEnabled ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">Audit Logs (Truy vết)</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4 font-medium">
              Ghi lại chi tiết mọi hành động thay đổi dữ liệu của người dùng. Tắt nhật ký có thể tiết kiệm dung lượng cơ sở dữ liệu nhưng sẽ làm mất khả năng truy vết lỗi.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-8 flex items-center justify-between border border-slate-100">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TRÌNH GHI NHẬT KÝ</p>
                <p className="text-base font-bold text-slate-800">Hoạt động Backend</p>
              </div>
              <Switch
                checked={auditLogEnabled}
                onChange={handleToggleAuditLogs}
                loading={loading}
                className={auditLogEnabled ? '!bg-slate-800' : '!bg-slate-300'}
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
        <div className="relative overflow-hidden bg-white rounded-2xl p-8 border border-slate-200 shadow-sm group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <Zap size={120} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">CÀI ĐẶT NÂNG CAO (DỰ KIẾN)</h3>
          </div>
          <p className="text-sm text-slate-500 mb-0 max-w-2xl font-medium leading-relaxed">Các tính năng giới hạn tốc độ (Rate Limit), chế độ bảo trì toàn cục và cấu hình tham số AI sẽ được cập nhật trong các phiên bản tiếp theo.</p>
        </div>

      </div>
    </div>
  );
}
