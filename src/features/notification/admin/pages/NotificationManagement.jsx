import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Filter,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  Users
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
  Tabs
} from 'antd';

const { TextArea } = Input;
const { Option } = Select;

export default function NotificationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock Data
  const mockNotifications = [
    {
      id: 'NOT-001',
      title: 'Bảo trì hệ thống định kỳ',
      content: 'Hệ thống sẽ tạm dừng để bảo trì từ 00:00 - 02:00 ngày 25/10/2023. Vui lòng lưu lại công việc của bạn.',
      type: 'System',
      target: 'All',
      status: 'Sent',
      sentAt: '24/10/2023 10:00',
      author: 'Admin System'
    },
    {
      id: 'NOT-002',
      title: 'Thông báo nghỉ lễ Quốc Khánh',
      content: 'Nhà trường thông báo lịch nghỉ lễ Quốc Khánh 2/9 cho toàn thể học sinh và giáo viên.',
      type: 'General',
      target: 'All Users',
      status: 'Scheduled',
      sentAt: '30/08/2024 08:00',
      author: 'Phòng Đào tạo'
    },
    {
      id: 'NOT-003',
      title: 'Nhắc nhở nộp bài tập cuối kỳ',
      content: 'Các em học sinh khối 12 lưu ý hạn nộp bài tập cuối kỳ môn Toán là ngày 15/11.',
      type: 'Academic',
      target: 'Students (Grade 12)',
      status: 'Sent',
      sentAt: '10/11/2023 09:30',
      author: 'Nguyễn Văn A'
    },
    {
      id: 'NOT-004',
      title: 'Cập nhật chính sách bảo mật',
      content: 'Chúng tôi đã cập nhật chính sách bảo mật mới. Vui lòng xem chi tiết tại trang cài đặt.',
      type: 'Security',
      target: 'All Users',
      status: 'Draft',
      sentAt: '-',
      author: 'Admin Security'
    },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  // Filter Logic
  const filteredData = notifications.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Columns
  const columns = [
    {
      title: 'TIÊU ĐỀ',
      key: 'title',
      width: 300,
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${record.type === 'System' ? 'bg-red-50 text-red-600' :
              record.type === 'Security' ? 'bg-orange-50 text-orange-600' :
                record.type === 'Academic' ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-100 text-slate-500'
            }`}>
            {record.type === 'System' ? <AlertCircle size={20} /> :
              record.type === 'Security' ? <Info size={20} /> :
                record.type === 'Academic' ? <Bell size={20} /> :
                  <Info size={20} />}
          </div>
          <div>
            <div className="font-bold text-slate-700 text-[15px] hover:text-[#0487e2] cursor-pointer transition-colors">{record.title}</div>
            <div className="text-xs text-slate-400 font-medium truncate max-w-[250px]">{record.content}</div>
          </div>
        </div>
      )
    },
    {
      title: 'LOẠI & ĐỐI TƯỢNG',
      key: 'type',
      render: (_, record) => (
        <div className="space-y-1">
          <Tag className="m-0 font-bold border-none bg-slate-100 text-slate-600">{record.type}</Tag>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users size={12} />
            {record.target}
          </div>
        </div>
      )
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      render: (_, record) => {
        let color = 'default';
        let text = record.status;
        if (record.status === 'Sent') { color = 'success'; text = 'Đã gửi'; }
        if (record.status === 'Scheduled') { color = 'processing'; text = 'Đã lên lịch'; }
        if (record.status === 'Draft') { color = 'default'; text = 'Bản nháp'; }

        return (
          <Tag color={color} className="rounded-full px-2.5 font-bold border-none text-[11px] uppercase">
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'THỜI GIAN',
      key: 'time',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock size={14} className="text-slate-400" />
          {record.sentAt}
        </div>
      )
    },
    {
      title: 'TÁC VỤ',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Xem chi tiết">
            <Button type="text" shape="circle" icon={<Eye size={16} />} className="text-slate-400 hover:text-[#0487e2]" />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" shape="circle" icon={<Trash2 size={16} />} className="text-slate-400 hover:text-rose-500" />
          </Tooltip>
        </div>
      )
    }
  ];

  const handleSubmit = () => {
    message.success('Tạo thông báo thành công! (Mock)');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Thông báo</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Gửi và quản lý thông báo hệ thống tới người dùng.</p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
          >
            Tạo Thông báo
          </Button>
        </header>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3 w-full md:w-auto">
            <Input
              placeholder="Tìm kiếm thông báo..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="h-10 w-full md:w-64 rounded-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select
              defaultValue="All"
              className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg"
              onChange={setFilterType}
            >
              <Option value="All">Tất cả loại</Option>
              <Option value="System">Hệ thống</Option>
              <Option value="Academic">Học tập</Option>
              <Option value="General">Chung</Option>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <Filter size={14} />
            Hiển thị {filteredData.length} kết quả
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="custom-table"
            locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title={<div className="text-[#0463ca] uppercase text-xs font-black tracking-widest">Tạo Thông báo Mới</div>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form layout="vertical" onFinish={handleSubmit} className="pt-4">
          <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Tiêu đề</span>} required>
            <Input placeholder="Nhập tiêu đề thông báo" className="h-10 rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Loại thông báo</span>} required>
              <Select className="h-10">
                <Option value="System">Hệ thống (System)</Option>
                <Option value="General">Thông tin chung (General)</Option>
                <Option value="Academic">Học tập (Academic)</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Gửi tới</span>} required>
              <Select className="h-10" mode="multiple" placeholder="Chọn đối tượng">
                <Option value="All">Tất cả người dùng</Option>
                <Option value="Student">Học sinh</Option>
                <Option value="Teacher">Giáo viên</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Nội dung</span>} required>
            <TextArea rows={4} placeholder="Nhập nội dung chi tiết..." className="rounded-lg" />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Thời gian gửi</span>}>
            <DatePicker showTime className="w-full h-10 rounded-lg" placeholder="Gửi ngay lập tức nếu để trống" />
          </Form.Item>

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-11 rounded-lg">Hủy bỏ</Button>
            <Button type="primary" htmlType="submit" className="flex-1 h-11 rounded-lg bg-[#0487e2] font-bold border-none flex items-center justify-center gap-2">
              <Send size={16} /> Gửi thông báo
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
