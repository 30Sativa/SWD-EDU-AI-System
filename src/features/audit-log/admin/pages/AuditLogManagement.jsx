import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, Clock, RotateCcw, User, Globe, Database,
  FileText, Eye, ChevronRight, ChevronLeft, Filter, X,
  ChevronsLeft, ChevronsRight, Zap, UserSearch, Calendar
} from 'lucide-react';
import {
  Tag, Empty, Spin, Drawer, Tooltip, Select, DatePicker, Input, Badge
} from 'antd';
import { getAuditLogs } from '../../api/auditLogApi';

const { Option } = Select;
const { RangePicker } = DatePicker;

// ─── Preset options ────────────────────────────────────────────────────────
const ACTION_OPTIONS = [
  { value: 'Create', label: '🟢 Create' },
  { value: 'Update', label: '🔵 Update' },
  { value: 'Delete', label: '🔴 Delete' },
  { value: 'Login', label: '🟡 Login' },
  { value: 'Logout', label: '🟡 Logout' },
];

const ENTITY_OPTIONS = [
  { value: 'User', label: '👤 User' },
  { value: 'Course', label: '📚 Course' },
  { value: 'Lesson', label: '📖 Lesson' },
  { value: 'Quiz', label: '✏️ Quiz' },
  { value: 'Class', label: '🏫 Class' },
  { value: 'Notification', label: '🔔 Notification' },
  { value: 'SystemSetting', label: '⚙️ SystemSetting' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function actionColor(action = '') {
  const a = action.toLowerCase();
  if (a.includes('delete')) return 'error';
  if (a.includes('create') || a.includes('add')) return 'success';
  if (a.includes('update') || a.includes('edit')) return 'processing';
  if (a.includes('login') || a.includes('logout')) return 'warning';
  return 'default';
}

function EntityIcon({ entity = '' }) {
  const e = entity.toLowerCase();
  if (e.includes('user')) return <User size={13} />;
  if (e.includes('course') || e.includes('lesson')) return <FileText size={13} />;
  if (e.includes('system') || e.includes('setting')) return <Activity size={13} />;
  if (e.includes('database') || e.includes('log')) return <Database size={13} />;
  return <Globe size={13} />;
}

function JsonViewer({ value }) {
  if (!value) return <span className="text-slate-400 text-xs italic">— trống —</span>;
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return (
      <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-56 text-slate-700 whitespace-pre-wrap">
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  } catch {
    return (
      <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-56 text-slate-600 whitespace-pre-wrap">
        {value}
      </pre>
    );
  }
}

function SkeletonRow({ cols }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

function FilterChip({ label, value, onRemove }) {
  return (
    <div className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
      <span className="text-blue-400 font-normal">{label}:</span>
      <span className="truncate max-w-[120px]">{value}</span>
      <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
        <X size={10} strokeWidth={3} />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AuditLogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1, pageSize: 20, totalCount: 0, totalPages: 0,
    hasPreviousPage: false, hasNextPage: false
  });

  // Applied Filters
  const [appliedAction, setAppliedAction] = useState('');
  const [appliedEntity, setAppliedEntity] = useState('');
  const [appliedUser, setAppliedUser] = useState('');
  const [dateRange, setDateRange] = useState([]);

  // Local Drafts (for input fields)
  const [draftUser, setDraftUser] = useState('');
  const debounceRef = useRef(null);

  // Detail Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchLogs = useCallback(async (page, pageSize, action, entity, user, dates) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        ...(action ? { Action: action } : {}),
        ...(entity ? { Entity: entity } : {}),
        ...(user ? { UserId: user } : {}),
      };

      if (dates && dates.length === 2) {
        params.FromDate = dates[0].toISOString();
        params.ToDate = dates[1].toISOString();
      }

      const resp = await getAuditLogs(params);
      const data = resp.data || {};
      setLogs(data.items || []);
      setPagination({
        page: data.page ?? page,
        pageSize: data.pageSize ?? pageSize,
        totalCount: data.totalCount ?? 0,
        totalPages: data.totalPages ?? 0,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      });
    } catch (err) {
      console.error('Audit log fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1, pagination.pageSize, appliedAction, appliedEntity, appliedUser, dateRange);
  }, [appliedAction, appliedEntity, appliedUser, dateRange, fetchLogs, pagination.pageSize]);

  const handleUserSearch = (e) => {
    const val = e.target.value;
    setDraftUser(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAppliedUser(val);
    }, 800);
  };

  const handleResetAll = () => {
    setDraftUser('');
    setAppliedUser('');
    setAppliedAction('');
    setAppliedEntity('');
    setDateRange([]);
  };

  const goPage = (p) => fetchLogs(p, pagination.pageSize, appliedAction, appliedEntity, appliedUser, dateRange);

  const activeFilterCount = [appliedAction, appliedEntity, appliedUser].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Nhật ký Hệ thống</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic opacity-80">
              Theo dõi toàn bộ hoạt động và lịch sử thay đổi dữ liệu trong hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-5 py-2.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Activity size={16} className="text-[#0487e2]" />
            <span className="text-base font-bold text-slate-800">
              {loading && pagination.totalCount === 0 ? '...' : pagination.totalCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">bản ghi</span>
          </div>
        </header>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end border-b border-slate-100">
            {/* User Search */}
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                <UserSearch size={12} /> NGƯỜI THỰC HIỆN
              </label>
              <Input
                placeholder="Email hoặc ID..."
                value={draftUser}
                onChange={handleUserSearch}
                className="h-12 rounded-xl text-sm font-medium"
                allowClear
              />
            </div>

            {/* Action */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                <Zap size={12} /> HÀNH ĐỘNG
              </label>
              <Select
                placeholder="Tất cả"
                allowClear
                value={appliedAction || undefined}
                onChange={val => setAppliedAction(val || '')}
                className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl"
              >
                {ACTION_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
              </Select>
            </div>

            {/* Entity */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                <Database size={12} /> ĐỐI TƯỢNG (ENTITY)
              </label>
              <Select
                placeholder="Tất cả"
                allowClear
                value={appliedEntity || undefined}
                onChange={val => setAppliedEntity(val || '')}
                className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl"
              >
                {ENTITY_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
              </Select>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                <Calendar size={12} /> THỜI GIAN
              </label>
              <RangePicker
                className="h-12 w-full rounded-xl"
                value={dateRange}
                onChange={val => setDateRange(val || [])}
                placeholder={['Từ', 'Đến']}
              />
            </div>

            {/* Reset / Size */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hàng</label>
                <Select
                  value={pagination.pageSize}
                  onChange={size => fetchLogs(1, size, appliedAction, appliedEntity, appliedUser, dateRange)}
                  className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl"
                >
                  {PAGE_SIZE_OPTIONS.map(n => <Option key={n} value={n}>{n}</Option>)}
                </Select>
              </div>
              <button
                onClick={handleResetAll}
                className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all shadow-sm mt-auto"
                title="Làm mới bộ lọc"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Active Chips */}
          {(activeFilterCount > 0 || dateRange.length > 0) && (
            <div className="px-5 py-2.5 flex flex-wrap gap-2 items-center bg-blue-50/40 border-b border-blue-100">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter size={11} /> Đang lọc:
              </span>
              {appliedUser && <FilterChip label="User" value={appliedUser} onRemove={() => { setAppliedUser(''); setDraftUser(''); }} />}
              {appliedAction && <FilterChip label="Action" value={appliedAction} onRemove={() => setAppliedAction('')} />}
              {appliedEntity && <FilterChip label="Entity" value={appliedEntity} onRemove={() => setAppliedEntity('')} />}
              {dateRange.length === 2 && (
                <FilterChip
                  label="Ngày"
                  value={`${dateRange[0].format('DD/MM')} - ${dateRange[1].format('DD/MM')}`}
                  onRemove={() => setDateRange([])}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Hành động</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-5 py-4">Người thực hiện</th>
                  <th className="px-5 py-4">IP</th>
                  <th className="px-5 py-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Empty description={<span className="text-slate-400">Không tìm thấy bản ghi nào.</span>} />
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock size={12} className="text-slate-400" />
                          {formatDate(row.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Tag color={actionColor(row.action)} className="font-bold text-[11px] uppercase rounded-full border-none px-2.5">
                          {row.action}
                        </Tag>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400"><EntityIcon entity={row.entity} /></span>
                          <span className="font-semibold text-slate-700">{row.entity}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800 truncate max-w-[220px]">{row.userEmail || '—'}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]">{row.userId}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {row.ipAddress || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => { setSelected(row); setDrawerOpen(true); }}
                          className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-100 text-slate-400 group-hover:text-[#0487e2] flex items-center justify-center mx-auto transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Hiển thị trang <strong>{pagination.page}</strong> / {pagination.totalPages}
                &nbsp;·&nbsp;
                <strong>{pagination.totalCount.toLocaleString()}</strong> bản ghi
              </span>
              <div className="flex items-center gap-1">
                <PagBtn icon={<ChevronsLeft size={16} />} disabled={!pagination.hasPreviousPage} onClick={() => goPage(1)} />
                <PagBtn icon={<ChevronLeft size={16} />} label="Trước" disabled={!pagination.hasPreviousPage} onClick={() => goPage(pagination.page - 1)} />
                <div className="flex items-center gap-1 px-2">
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                    {pagination.page}
                  </span>
                </div>
                <PagBtn icon={<ChevronRight size={16} />} label="Tiếp" iconRight disabled={!pagination.hasNextPage} onClick={() => goPage(pagination.page + 1)} />
                <PagBtn icon={<ChevronsRight size={16} />} disabled={!pagination.hasNextPage} onClick={() => goPage(pagination.totalPages)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={580}
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-[#0487e2]" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 leading-none">Chi tiết Nhật ký</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1.5">{selected?.id}</p>
            </div>
          </div>
        }
        styles={{ body: { background: '#f8fafc', padding: '24px' } }}
      >
        {selected && (
          <div className="space-y-6">
            <DrawerSection title="Hành động & Đối tượng">
              <DrawerRow label="Hành động">
                <Tag color={actionColor(selected.action)} className="font-bold uppercase border-none text-xs rounded-full px-3 m-0">
                  {selected.action}
                </Tag>
              </DrawerRow>
              <DrawerRow label="Entity" value={selected.entity} />
              <DrawerRow label="Entity ID">
                <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded break-all">
                  {selected.entityId || '—'}
                </span>
              </DrawerRow>
              <DrawerRow label="Thời gian" value={formatDate(selected.createdAt)} />
            </DrawerSection>

            <DrawerSection title="Người thực hiện & Thiết bị">
              <DrawerRow label="Email" value={selected.userEmail} />
              <DrawerRow label="IP Address" value={selected.ipAddress} isMono />
              <div className="space-y-1 mt-2">
                <p className="text-xs text-slate-400">User Agent</p>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                  {selected.userAgent || '—'}
                </p>
              </div>
            </DrawerSection>

            <DrawerSection title="Thay đổi dữ liệu">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị cũ (Before)</p>
                  </div>
                  <JsonViewer value={selected.oldValues} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị mới (After)</p>
                  </div>
                  <JsonViewer value={selected.newValues} />
                </div>
              </div>
            </DrawerSection>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ─── Internal Sub-components ───────────────────────────────────────────────

function DrawerSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DrawerRow({ label, value, children, isMono }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="text-right">
        {children ?? (
          <span className={`text-sm font-bold text-slate-800 ${isMono ? 'font-mono bg-slate-50 px-1.5 py-0.5 rounded' : ''}`}>
            {value || '—'}
          </span>
        )}
      </div>
    </div>
  );
}

function PagBtn({ icon, label, iconRight, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-9 px-3 flex items-center gap-1.5 rounded-xl text-xs font-bold transition-all
        ${disabled ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-[#0487e2]'}`}
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </button>
  );
}
