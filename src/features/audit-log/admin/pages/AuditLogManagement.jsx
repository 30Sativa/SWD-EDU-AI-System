import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Download
} from 'lucide-react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  DatePicker,
  Empty,
  Card,
  Tooltip
} from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock Data for Audit Logs
const mockLogs = [
  {
    id: 'LOG-001',
    action: 'Login',
    description: 'User Admin logged in successfully',
    module: 'Auth',
    actor: 'Admin System',
    role: 'Admin',
    ip: '192.168.1.10',
    status: 'Success',
    timestamp: '24/10/2023 08:30:12'
  },
  {
    id: 'LOG-002',
    action: 'Create Course',
    description: 'Created new course "Mathematics Grade 10"',
    module: 'Course',
    actor: 'Nguyen Van A',
    role: 'Teacher',
    ip: '192.168.1.15',
    status: 'Success',
    timestamp: '24/10/2023 09:15:22'
  },
  {
    id: 'LOG-003',
    action: 'Delete User',
    description: 'Failed attempt to delete user ID #12345',
    module: 'User',
    actor: 'Le Thi B',
    role: 'Manager',
    ip: '192.168.1.20',
    status: 'Failed',
    timestamp: '24/10/2023 10:05:00'
  },
  {
    id: 'LOG-004',
    action: 'Update Settings',
    description: 'Changed system system default language to Vietnamese',
    module: 'System',
    actor: 'Admin System',
    role: 'Admin',
    ip: '192.168.1.10',
    status: 'Success',
    timestamp: '24/10/2023 11:45:33'
  },
  {
    id: 'LOG-005',
    action: 'Export Data',
    description: 'Exported student list data to Excel',
    module: 'Report',
    actor: 'Tran Van C',
    role: 'Manager',
    ip: '192.168.1.25',
    status: 'Warning',
    timestamp: '24/10/2023 13:20:10'
  },
];

export default function AuditLogManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter Logic
  const filteredData = mockLogs.filter(item => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = filterModule === 'All' || item.module === filterModule;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

    return matchesSearch && matchesModule && matchesStatus;
  });

  const columns = [
    {
      title: 'HÀNH ĐỘNG & NỘI DUNG',
      key: 'action',
      width: 350,
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${record.status === 'Success' ? 'bg-emerald-50 text-emerald-600' :
              record.status === 'Failed' ? 'bg-rose-50 text-rose-600' :
                'bg-amber-50 text-amber-600'
            }`}>
            {record.status === 'Success' ? <CheckCircle size={18} /> :
              record.status === 'Failed' ? <AlertTriangle size={18} /> :
                <Info size={18} />}
          </div>
          <div>
            <div className="font-bold text-slate-700 text-sm hover:text-[#0487e2] cursor-pointer">{record.action}</div>
            <div className="text-xs text-slate-500 font-medium truncate max-w-[280px]" title={record.description}>
              {record.description}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'NGƯỜI THỰC HIỆN',
      key: 'actor',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">{record.actor}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Tag className="m-0 text-[10px] font-bold border-none bg-slate-100 text-slate-500 uppercase">{record.role}</Tag>
              <span className="text-[10px] text-slate-400 font-mono">{record.ip}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'MODULE',
      key: 'module',
      render: (_, record) => (
        <Tag color="cyan" className="font-bold border-none text-[11px] uppercase">
          {record.module}
        </Tag>
      )
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      render: (_, record) => {
        let color = 'default';
        let text = record.status;
        if (record.status === 'Success') { color = 'success'; text = 'Thành công'; }
        if (record.status === 'Failed') { color = 'error'; text = 'Thất bại'; }
        if (record.status === 'Warning') { color = 'warning'; text = 'Cảnh báo'; }

        return (
          <Tag color={color} className="rounded-full px-2.5 font-bold border-none text-[10px] uppercase">
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'THỜI GIAN',
      key: 'timestamp',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock size={14} className="text-slate-400" />
          {record.timestamp}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Nhật ký Hệ thống</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Theo dõi hoạt động và lịch sử truy cập của người dùng.</p>
          </div>
          <Button
            icon={<Download size={18} />}
            className="bg-white text-slate-600 border-slate-300 font-semibold h-10 hover:text-[#0487e2] hover:border-[#0487e2]"
          >
            Xuất báo cáo (CSV)
          </Button>
        </header>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <Input
              placeholder="Tìm kiếm nhật ký..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="h-10 w-full md:w-64 rounded-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select
              defaultValue="All"
              className="w-full md:w-40 h-10 [&>.ant-select-selector]:!rounded-lg"
              onChange={setFilterModule}
            >
              <Option value="All">Tất cả Module</Option>
              <Option value="Auth">Xác thực (Auth)</Option>
              <Option value="Course">Khóa học</Option>
              <Option value="User">Người dùng</Option>
              <Option value="System">Hệ thống</Option>
            </Select>
            <Select
              defaultValue="All"
              className="w-full md:w-40 h-10 [&>.ant-select-selector]:!rounded-lg"
              onChange={setFilterStatus}
            >
              <Option value="All">Tất cả Trạng thái</Option>
              <Option value="Success">Thành công</Option>
              <Option value="Failed">Thất bại</Option>
              <Option value="Warning">Cảnh báo</Option>
            </Select>
            <RangePicker className="h-10 rounded-lg w-full md:w-64" placeholder={['Từ ngày', 'Đến ngày']} />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 whitespace-nowrap">
            <Activity size={14} />
            Total Logs: {filteredData.length}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 15 }}
            className="custom-table"
            locale={{ emptyText: <Empty description="Không tìm thấy nhật ký nào" /> }}
          />
        </div>
      </div>
    </div>
  );
}
