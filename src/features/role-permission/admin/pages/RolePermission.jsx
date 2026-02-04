import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Search,
  Info,
  Check,
  Code,
  Database,
  Shield,
  Users,
  GraduationCap,
  UserCog,
  Zap,
  Lock
} from 'lucide-react';
import { Button, Input, Table, Tag, Card, Modal, Switch, message, Tooltip, Avatar } from 'antd';

export default function RolePermission() {
  const allRoles = ['Quản trị viên', 'Quản lý', 'Giáo viên', 'Học sinh'];

  // Role Definitions
  const roleDefinitions = {
    'Quản trị viên': {
      icon: Shield,
      bgColor: '#f3e8ff', // bg-purple-100
      textColor: '#7e22ce', // text-purple-700
      description: 'Quyền truy cập toàn hệ thống, quản lý người dùng & cấu hình.',
    },
    'Quản lý': {
      icon: UserCog,
      bgColor: '#dbeafe', // bg-blue-100
      textColor: '#1d4ed8', // text-blue-700
      description: 'Quản lý nội dung học thuật & học sinh được phân công.',
    },
    'Giáo viên': {
      icon: GraduationCap,
      bgColor: '#d1fae5', // bg-green-100
      textColor: '#047857', // text-green-700
      description: 'Tạo khóa học, bài kiểm tra và theo dõi học sinh.',
    },
    'Học sinh': {
      icon: Users,
      bgColor: '#ffedd5', // bg-orange-100
      textColor: '#c2410c', // text-orange-700
      description: 'Truy cập khóa học và làm bài kiểm tra.',
    },
  };

  // Default permissions
  const defaultPermissions = {
    'Quản trị viên': { 'Quản lý Người dùng': true, 'Cấu hình Hệ thống': true, 'Nhật ký & Bảo mật': true, 'Nội dung Học thuật': true },
    'Quản lý': { 'Quản lý Người dùng': true, 'Cấu hình Hệ thống': false, 'Nhật ký & Bảo mật': true, 'Nội dung Học thuật': true },
    'Giáo viên': { 'Quản lý Người dùng': false, 'Cấu hình Hệ thống': false, 'Nhật ký & Bảo mật': false, 'Nội dung Học thuật': true },
    'Học sinh': { 'Quản lý Người dùng': false, 'Cấu hình Hệ thống': false, 'Nhật ký & Bảo mật': false, 'Nội dung Học thuật': false },
  };

  const modulesList = [
    { name: 'Quản lý Người dùng', desc: 'Thêm, sửa, xóa người dùng' },
    { name: 'Cấu hình Hệ thống', desc: 'Cài đặt chung toàn trang' },
    { name: 'Nhật ký & Bảo mật', desc: 'Xem log & audit trail' },
    { name: 'Nội dung Học thuật', desc: 'Tạo khóa học & câu hỏi' },
  ];

  // State
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (role, moduleName) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleName]: !prev[role][moduleName]
      }
    }));
  };

  const handleSave = () => {
    message.loading({ content: 'Đang lưu thay đổi...', key: 'save' });
    setTimeout(() => {
      message.success({ content: 'Cập nhật phân quyền thành công!', key: 'save' });
    }, 800);
  };

  const handleRestoreDefaults = () => {
    setPermissions(defaultPermissions);
    message.info('Đã khôi phục cài đặt gốc');
  };

  // Table Columns
  const columns = [
    {
      title: 'MODULE / QUYỀN HẠN',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text, record) => (
        <div>
          <div className="font-bold text-slate-700 text-[15px]">{text}</div>
          <div className="text-xs text-slate-400 font-medium">{record.desc}</div>
        </div>
      )
    },
    ...allRoles.map(role => ({
      title: (
        <div className="flex flex-col items-center gap-1 py-1">
          {React.createElement(roleDefinitions[role].icon, { size: 18, color: roleDefinitions[role].textColor })}
          <span className="text-xs font-bold uppercase" style={{ color: roleDefinitions[role].textColor }}>{role}</span>
        </div>
      ),
      key: role,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={permissions[role][record.name]}
          onChange={() => handleToggle(role, record.name)}
          className={permissions[role][record.name] ? 'bg-[#0487e2]' : ''}
        />
      )
    }))
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Phân quyền & Vai trò</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý ma trận phân quyền truy cập hệ thống.</p>
          </div>
          <div className="flex gap-3">
            <Button
              icon={<RotateCcw size={16} />}
              onClick={handleRestoreDefaults}
              className="bg-white text-slate-600 border-slate-300 font-semibold h-10 hover:text-[#0487e2] hover:border-[#0487e2]"
            >
              Khôi phục mặc định
            </Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              className="bg-[#0487e2] hover:bg-[#0463ca] h-10 font-bold shadow-md border-none"
            >
              Lưu thay đổi
            </Button>
          </div>
        </header>

        {/* Role Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(roleDefinitions).map(([role, def]) => {
            const Icon = def.icon;
            return (
              <div key={role} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: def.bgColor }}>
                    <Icon size={20} color={def.textColor} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{role}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">System Role</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {def.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Main Permission Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Lock size={16} className="text-[#0487e2]" />
              Ma trận quyền hạn
            </div>
            <Input
              placeholder="Tìm kiếm quyền hạn..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="w-64 h-9 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table
            columns={columns}
            dataSource={modulesList.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))}
            rowKey="name"
            pagination={false}
            className="custom-table"
          />
        </div>

        {/* Advanced Mock Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">Cài đặt nâng cao (Dev & API)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">Developer API Access</span>
                </div>
                <Switch defaultChecked={false} disabled />
              </div>
              <p className="text-xs text-slate-500">Cho phép truy cập vào endpoint API debug của hệ thống. Chỉ dành cho Admin.</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">Raw Data Export</span>
                </div>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-slate-500">Cho phép xuất dữ liệu dạng thô (JSON/SQL). Đang bật cho Quản lý & Admin.</p>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
          <Info size={20} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Thay đổi quyền hạn sẽ có hiệu lực ngay lập tức đối với tất cả tài khoản đang hoạt động. Một số người dùng có thể cần đăng nhập lại.
          </p>
        </div>

      </div>
    </div>
  );
}
