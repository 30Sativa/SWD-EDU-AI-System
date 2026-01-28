import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ListChecks,
  Settings,
  ShieldAlert,
  User,
  GraduationCap as LogoIcon,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Search,
  TrendingUp,
  Lock,
  FileText,
} from 'lucide-react';
import ScrollToTop from './ScrollToTop';

const MENU_ITEMS = [
  {
    label: 'Bảng điều khiển',
    icon: LayoutDashboard,
    path: 'dashboard',
    allowedRoles: ['admin', 'teacher', 'student']
  },
  {
    label: 'Khóa học',
    icon: BookOpen,
    path: 'courses',
    allowedRoles: ['teacher', 'student']
  },
  {
    label: 'Bài kiểm tra',
    icon: ListChecks,
    path: 'quizzes',
    allowedRoles: ['student']
  },
  {
    label: 'Tiến độ',
    icon: TrendingUp,
    path: 'progress',
    allowedRoles: ['student']
  },
  {
    label: 'Lớp học',
    icon: Users,
    path: 'classes',
    allowedRoles: ['teacher']
  },
  {
    label: 'Học sinh',
    icon: GraduationCap,
    path: 'students',
    allowedRoles: ['teacher']
  },
  {
    label: 'Câu hỏi',
    icon: ListChecks,
    path: 'question-bank',
    allowedRoles: ['teacher']
  },
  {
    label: 'Vai trò & Quyền',
    icon: Lock,
    path: 'roles-permissions',
    allowedRoles: ['admin']
  },
  {
    label: 'Quản lý Người dùng',
    icon: Users,
    path: 'users',
    allowedRoles: ['admin']
  },
  {
    label: 'Thông báo',
    icon: Bell,
    path: 'notifications',
    allowedRoles: ['admin']
  },
  {
    label: 'Nhật ký Kiểm toán',
    icon: FileText,
    path: 'audit-logs',
    allowedRoles: ['admin']
  },
  {
    label: 'Cài đặt',
    icon: Settings,
    path: 'settings',
    allowedRoles: ['teacher', 'student']
  },
];

export default function Sidebar({ userRole = 'teacher' }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Auto-detect base path from current location
  const BASE_PATH = location.pathname.startsWith('/dashboard/student')
    ? '/dashboard/student'
    : location.pathname.startsWith('/dashboard/admin')
    ? '/dashboard/admin'
    : '/dashboard/teacher';

  // Auto-detect userRole from path if not provided
  const detectedRole = location.pathname.startsWith('/dashboard/student') ? 'student' :
    location.pathname.startsWith('/dashboard/admin') ? 'admin' :
    location.pathname.startsWith('/dashboard/teacher') ? 'teacher' :
      userRole;

  const filteredMenu = MENU_ITEMS.filter((item) => item.allowedRoles.includes(detectedRole));

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <ScrollToTop />

      {/* Sidebar panel */}
      <div
        className={`min-h-screen self-stretch bg-gradient-to-b from-[#1a44b8] to-[#1e3a8a] text-white flex flex-col transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px] shadow-none' : 'w-64 shadow-xl'
          }`}
      >
        <div
          className={`p-4 flex flex-shrink-0 gap-2 ${collapsed ? 'flex-col items-center' : 'items-center justify-between'
            }`}
        >
          {!collapsed && (
            <Link to={BASE_PATH} className="flex items-center gap-3 min-w-0 flex-1">
              {detectedRole !== 'student' && <LogoIcon size={28} className="flex-shrink-0" />}
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight truncate">EDU-AI Classroom</h1>
                <p className="text-xs text-blue-200 truncate">Học tập đơn giản hơn</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="flex justify-center w-full p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Mở rộng sidebar"
            >
              {detectedRole !== 'student' && <LogoIcon size={28} />}
              {detectedRole === 'student' && <span className="text-white font-bold text-lg">E</span>}
            </button>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="p-2 rounded-lg hover:bg-white/10 text-blue-100 transition-colors flex-shrink-0"
              aria-label="Thu gọn sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const href = item.path === 'dashboard' ? BASE_PATH : `${BASE_PATH}/${item.path}`;
            const isActive = item.path === 'dashboard'
              ? location.pathname === BASE_PATH
              : location.pathname.startsWith(`${BASE_PATH}/${item.path}`);

            return (
              <Link
                key={item.label}
                to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-white/20 text-white shadow-md' : 'text-blue-100 hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                {detectedRole !== 'student' && <Icon size={20} className="flex-shrink-0" />}
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto flex-shrink-0">
          <div
            className={
              'bg-white/10 rounded-xl flex items-center gap-3 hover:bg-white/20 transition-colors cursor-pointer ' +
              (collapsed ? 'justify-center p-3' : 'p-3')
            }
          >
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 flex-shrink-0 font-bold">
              {detectedRole !== 'student' ? <User size={20} /> : <span className="text-sm">JD</span>}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">John Doe</p>
                <p className="text-xs text-blue-200 truncate">
                  {detectedRole === 'teacher' ? 'Giáo viên' : 
                   detectedRole === 'student' ? 'Học sinh' : 
                   detectedRole === 'admin' ? 'Quản trị viên' : detectedRole}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 flex items-center justify-end gap-4 px-4 md:px-6 py-3 bg-white border-b border-gray-200">
          <div className="relative w-64 md:w-40">
            {detectedRole !== 'student' && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
            <input
              type="text"
              placeholder={detectedRole === 'admin' ? 'Search notifications, logs, or users.' : 'Tìm kiếm...'}
              className={`w-full ${detectedRole !== 'student' ? 'pl-9' : 'pl-3'} pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white`}
            />
          </div>
          {detectedRole !== 'student' && (
            <>
              <button type="button" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Thông báo">
                <Bell size={20} />
              </button>
              <button type="button" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Cài đặt">
                <Settings size={20} />
              </button>
            </>
          )}
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
