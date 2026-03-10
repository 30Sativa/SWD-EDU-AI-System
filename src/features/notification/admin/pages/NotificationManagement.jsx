import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Search,
  Plus,
  Filter,
  Send,
  Clock,
  RotateCcw,
  Eye,
  Calendar,
  Users,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  DatePicker,
  Tooltip,
  message,
  Empty,
  Spin,
  Badge
} from 'antd';
import { getAdminNotificationHistory, sendMassNotification } from '../../api/notificationApi';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mapping for Display
const ROLE_NAME_MAP = {
  "Teacher": { color: 'cyan', label: 'Giáo viên' },
  "Student": { color: 'blue', label: 'Học sinh' },
  "Manager": { color: 'purple', label: 'Quản lý' },
  "Admin": { color: 'gold', label: 'Quản trị viên' }
};

// Mapping for POST (based on Swagger [1])
const ROLE_ID_MAP = {
  "Student": 1,
  "Teacher": 2,
  "Manager": 3,
  "Admin": 4
};

export default function NotificationManagement() {
  const [form] = Form.useForm();

  // Data State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination & Filtering
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    title: '',
    dateRange: []
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ─── Fetch Logic ──────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(filters.title ? { title: filters.title } : {})
      };

      if (filters.dateRange?.length === 2) {
        params.fromDate = filters.dateRange[0].toISOString();
        params.toDate = filters.dateRange[1].toISOString();
      }

      const resp = await getAdminNotificationHistory(params);
      const data = resp.data || {};

      setNotifications(data.items || []);
      setPagination({
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Failed to fetch notification history', err);
      message.error('Không thể tải lịch sử thông báo');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSearch = (val) => {
    setFilters(prev => ({ ...prev, title: val }));
  };

  const handleDateChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates || [] }));
  };

  const handleReset = () => {
    setFilters({ title: '', dateRange: [] });
  };

  // ─── Submit Mass Notification ─────────────────────────────────────────────
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        message: values.message,
        targetRoles: values.targetRoles || [], // Expecting IDs here
        link: values.link || ""
      };

      const resp = await sendMassNotification(payload);
      if (resp.success) {
        message.success(resp.message || 'Đã gửi thông báo hàng loạt thành công!');
        setIsCreateModalOpen(false);
        form.resetFields();
        fetchNotifications(1); // Refresh list
      }
    } catch (err) {
      console.error('Failed to send notification', err);
      message.error('Gửi thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'THÔNG TIN THÔNG BÁO',
      key: 'info',
      width: 350,
      render: (_, r) => (
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <Bell size={22} />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-slate-800 text-[15px] leading-tight truncate">{r.title}</div>
            <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{r.message}</div>
          </div>
        </div>
      )
    },
    {
      title: 'ĐỐI TƯỢNG NHẬN',
      key: 'targets',
      render: (_, r) => (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {r.targetRoles?.length > 0 ? (
              r.targetRoles.map(role => (
                <Tag key={role} color={ROLE_NAME_MAP[role]?.color || 'default'} className="m-0 font-bold border-none rounded-md px-2 text-[10px] uppercase">
                  {ROLE_NAME_MAP[role]?.label || role}
                </Tag>
              ))
            ) : (
              <Tag color="cyan" className="m-0 font-bold border-none rounded-md px-2 text-[10px] uppercase">Tất cả</Tag>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
            <Users size={12} className="text-[#0487e2]" />
            {r.receiverCount?.toLocaleString()} người nhận
          </div>
        </div>
      )
    },
    {
      title: 'THỜI GIAN GỬI',
      key: 'time',
      render: (_, r) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Calendar size={13} className="text-slate-400" />
            {new Date(r.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <Clock size={13} className="text-slate-400" />
            {new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      title: 'LIÊN KẾT',
      key: 'link',
      render: (_, r) => r.link ? (
        <Tooltip title={r.link}>
          <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0487e2] hover:underline font-bold text-xs bg-blue-50 px-2 py-1 rounded-lg">
            Khám phá <ExternalLink size={12} />
          </a>
        </Tooltip>
      ) : <span className="text-slate-300 italic text-xs">Không có</span>
    },
    {
      title: 'TÁC VỤ',
      key: 'action',
      align: 'right',
      render: (_, r) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            shape="circle"
            icon={<Eye size={18} />}
            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
            onClick={() => {
              setSelectedRecord(r); Modal.info({
                title: 'Chi tiết thông báo',
                content: (
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiêu đề</p>
                      <p className="font-bold text-slate-800">{r.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nội dung</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{r.message}</p>
                    </div>
                    {r.link && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liên kết</p>
                        <a href={r.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 break-all">{r.link}</a>
                      </div>
                    )}
                  </div>
                ),
                width: 500
              })
            }}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#0487e2] text-white flex items-center justify-center shadow-lg shadow-blue-100">
                <Megaphone size={22} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý Thông báo</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Gửi thông báo hàng loạt cho các nhóm đối tượng và xem lịch sử phân phát.</p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={20} />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0487e2] hover:bg-[#0463ca] h-12 px-8 rounded-2xl font-black shadow-xl shadow-blue-200 border-none flex items-center gap-2"
          >
            SOẠN THÔNG BÁO
          </Button>
        </header>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tìm kiếm</label>
              <Input
                placeholder="Tìm tiêu đề thông báo..."
                prefix={<Search size={16} className="text-slate-300" />}
                className="h-11 rounded-xl border-slate-200"
                value={filters.title}
                onChange={e => handleSearch(e.target.value)}
                allowClear
              />
            </div>
            <div className="w-full md:w-72">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Khoảng thời gian</label>
              <RangePicker
                className="w-full h-11 rounded-xl border-slate-200"
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={handleDateChange}
                value={filters.dateRange}
              />
            </div>
            <div className="flex items-end pb-0.5">
              <Button
                onClick={handleReset}
                icon={<RotateCcw size={16} />}
                className="h-11 rounded-xl font-bold flex items-center gap-1 border-slate-200 text-slate-600 hover:text-blue-600"
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <Spin spinning={loading} tip="Đang tải dữ liệu...">
            <Table
              columns={columns}
              dataSource={notifications}
              rowKey={(r) => r.createdAt + r.title}
              pagination={false}
              className="custom-table"
              locale={{ emptyText: <Empty description="Chưa có lịch sử thông báo nào" className="py-12" /> }}
            />

            {/* Custom Pagination Footer */}
            {!loading && notifications.length > 0 && (
              <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-bold">
                  Trang <span className="text-slate-800">{pagination.page}</span> / {pagination.totalPages}
                  &nbsp;·&nbsp;
                  <span className="text-[#0487e2]">{pagination.totalCount.toLocaleString()}</span> lần gửi
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={pagination.page <= 1}
                    onClick={() => fetchNotifications(pagination.page - 1)}
                    icon={<ChevronLeft size={18} />}
                    className="rounded-xl flex items-center justify-center font-bold h-10"
                  >
                    Trước
                  </Button>
                  <Button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchNotifications(pagination.page + 1)}
                    icon={<ChevronRight size={18} />}
                    className="rounded-xl flex items-center justify-center font-bold h-10"
                    iconPosition="end"
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            )}
          </Spin>
        </div>
      </div>

      {/* ── Create Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send size={18} />
            </div>
            <div>
              <p className="text-base font-black text-slate-800 leading-tight">Soạn Thông báo Hàng loạt</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Broadcast System</p>
            </div>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        centered
        width={650}
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="pt-6 space-y-5"
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label={<span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Tiêu đề thông báo</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Vd: Thông báo bảo trì hệ thống..." className="h-12 rounded-xl border-slate-200 font-bold text-slate-800" />
          </Form.Item>

          <Form.Item
            name="targetRoles"
            label={<span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Nhóm đối tượng nhận</span>}
            tooltip="Nếu để trống, thông báo sẽ gửi đến TẤT CẢ người dùng"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các vai trò (Để trống = Tất cả)"
              className="h-12 w-full custom-multiselect [&>.ant-select-selector]:!rounded-xl"
              maxTagCount="responsive"
            >
              <Option value={ROLE_ID_MAP.Student}><Badge color="blue" text="Học sinh" /></Option>
              <Option value={ROLE_ID_MAP.Teacher}><Badge color="cyan" text="Giáo viên" /></Option>
              <Option value={ROLE_ID_MAP.Manager}><Badge color="purple" text="Quản lý" /></Option>
              <Option value={ROLE_ID_MAP.Admin}><Badge color="gold" text="Quản trị viên" /></Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label={<span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Nội dung chi tiết</span>}
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={5} placeholder="Nhập nội dung thông báo tới người dùng..." className="rounded-2xl border-slate-200 py-3" />
          </Form.Item>

          <Form.Item
            name="link"
            label={<span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Đường dẫn đính kèm (URL)</span>}
          >
            <Input prefix={<ExternalLink size={14} className="text-slate-400" />} placeholder="https://example.com/chi-tiet" className="h-12 rounded-xl border-slate-200" />
          </Form.Item>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button
              disabled={submitting}
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 h-12 rounded-2xl font-bold text-slate-600 border-none bg-slate-100 hover:bg-slate-200"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="flex-3 h-12 px-12 rounded-2xl bg-[#0487e2] font-black border-none flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <Send size={18} /> GỬI NGAY BÂY GIỜ
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
