import React from 'react';
import {
  Shield,
  Users,
  GraduationCap,
  UserCog,
  Info,
  CheckCircle2,
  LayoutDashboard,
  BookOpen,
  Settings,
  History
} from 'lucide-react';
import { Card, Tag, Table } from 'antd';

export default function RolePermission() {
  const roleDefinitions = [
    {
      role: 'Quản trị viên',
      icon: Shield,
      color: '#7e22ce',
      bgColor: '#f3e8ff',
      description: 'Quyền hạn cao nhất, quản lý toàn bộ hệ thống, cấu hình và bảo mật.',
      responsibilities: ['Quản lý người dùng', 'Cấu hình hệ thống', 'Xem nhật ký hệ thống', 'Quản lý phân quyền']
    },
    {
      role: 'Quản lý',
      icon: UserCog,
      color: '#1d4ed8',
      bgColor: '#dbeafe',
      description: 'Điều hành các hoạt động học thuật, phê duyệt nội dung và quản lý giáo viên.',
      responsibilities: ['Quản lý môn học', 'Quản lý kỳ học', 'Duyệt khóa học', 'Báo cáo tổng hợp']
    },
    {
      role: 'Giáo viên',
      icon: GraduationCap,
      color: '#047857',
      bgColor: '#d1fae5',
      description: 'Tạo nội dung giảng dạy, quản lý lớp học và đánh giá học sinh.',
      responsibilities: ['Tạo khóa học', 'Quản lý bài giảng', 'Chấm điểm & đánh giá', 'Quản lý lớp học']
    },
    {
      role: 'Học sinh',
      icon: Users,
      color: '#c2410c',
      bgColor: '#ffedd5',
      description: 'Người học tham gia các khóa học, làm bài kiểm tra và theo dõi tiến độ.',
      responsibilities: ['Tham gia khóa học', 'Làm bài kiểm tra', 'Xem kết quả học tập', 'Tương tác AI Tutor']
    },
  ];

  const columns = [
    {
      title: 'CHỨC NĂNG HỆ THỐNG',
      dataIndex: 'feature',
      key: 'feature',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            {record.icon}
          </div>
          <div>
            <div className="font-bold text-slate-700">{text}</div>
            <div className="text-xs text-slate-400">{record.desc}</div>
          </div>
        </div>
      )
    },
    {
      title: 'AD',
      key: 'admin',
      align: 'center',
      render: () => <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
    },
    {
      title: 'MN',
      key: 'manager',
      align: 'center',
      render: (record) => record.manager ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />
    },
    {
      title: 'TC',
      key: 'teacher',
      align: 'center',
      render: (record) => record.teacher ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />
    },
    {
      title: 'ST',
      key: 'student',
      align: 'center',
      render: (record) => record.student ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />
    }
  ];

  const featuresData = [
    { feature: 'Bảng điều khiển', desc: 'Xem thống kê và tổng quan', icon: <LayoutDashboard size={16} />, manager: true, teacher: true, student: true },
    { feature: 'Quản lý người dùng', desc: 'Thêm, sửa, xóa, khóa tài khoản', icon: <Users size={16} />, manager: true, teacher: false, student: false },
    { feature: 'Nội dung học thuật', desc: 'Môn học, Khóa học, Bài giảng', icon: <BookOpen size={16} />, manager: true, teacher: true, student: true },
    { feature: 'Cấu hình hệ thống', desc: 'Cài đặt chung, tham số hệ thống', icon: <Settings size={16} />, manager: false, teacher: false, student: false },
    { feature: 'Nhật ký & Bảo mật', desc: 'Xem lịch sử hoạt động, audit log', icon: <History size={16} />, manager: false, teacher: false, student: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Vai trò hệ thống</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Tổng quan về các nhóm người dùng và quyền hạn mặc định trong hệ thống.</p>
        </header>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleDefinitions.map((item) => (
            <Card key={item.role} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bgColor }}>
                  <item.icon size={24} color={item.color} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.role}</h3>
                  <Tag className="m-0 border-none text-[10px] uppercase font-bold bg-slate-100 text-slate-500">Mặc định</Tag>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-6 min-h-[40px] leading-relaxed font-medium">
                {item.description}
              </p>
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trách nhiệm chính</div>
                {item.responsibilities.map((res, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {res}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Matrix (Read-only) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#0463ca]">Ma trận chức năng</h2>
            <p className="text-xs text-slate-500 mt-1">Bảng đối chiếu quyền truy cập các module chính giữa các vai trò.</p>
          </div>
          <Table
            columns={columns}
            dataSource={featuresData}
            pagination={false}
            rowKey="feature"
            className="custom-table"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
          <Info size={24} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-1">Cơ chế quản lý Role-Based Access Control (RBAC)</h4>
            <p className="text-sm text-blue-800 leading-relaxed font-medium">
              Hệ thống sử dụng các vai trò cố định để đảm bảo tính bảo mật và ổn định. Các quyền hạn được gắn chặt với vai trò và không thể thay đổi đơn lẻ để tránh xung đột logic nghiệp vụ. Nếu cần thay đổi vai trò của một người dùng, vui lòng thực hiện tại trang <strong>Quản lý người dùng</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
