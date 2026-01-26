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
} from 'lucide-react';
import ScrollToTop from './ScrollToTop';

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: 'dashboard',
    allowedRoles: ['admin', 'teacher', 'student']
  },
  {
    label: 'Courses',
    icon: BookOpen,
    path: 'courses',
    allowedRoles: ['admin', 'teacher', 'student']
  },
  {
    label: 'Quizzes',
    icon: ListChecks,
    path: 'quizzes',
    allowedRoles: ['student']
  },
  {
    label: 'Classes',
    icon: Users,
    path: 'classes',
    allowedRoles: ['admin', 'teacher']
  },
  {
    label: 'Students',
    icon: GraduationCap,
    path: 'students',
    allowedRoles: ['admin', 'teacher']
  },
  {
    label: 'Question Bank',
    icon: ListChecks,
    path: 'question-bank',
    allowedRoles: ['teacher']
  },
  {
    label: 'System Admin',
    icon: ShieldAlert,
    path: 'admin',
    allowedRoles: ['admin']
  },
  {
    label: 'Settings',
    icon: Settings,
    path: 'settings',
    allowedRoles: ['admin', 'teacher', 'student']
  },
];

export default function Sidebar({ userRole = 'teacher' }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Auto-detect base path from current location
  const BASE_PATH = location.pathname.startsWith('/dashboard/student')
    ? '/dashboard/student'
    : '/dashboard/teacher';

  // Auto-detect userRole from path if not provided
  const detectedRole = location.pathname.startsWith('/dashboard/student') ? 'student' :
    location.pathname.startsWith('/dashboard/teacher') ? 'teacher' :
      userRole;

  const filteredMenu = MENU_ITEMS.filter((item) => item.allowedRoles.includes(detectedRole));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ScrollToTop />

      {/* Sidebar panel */}
      <div
        className={`min-h-screen self-stretch bg-[#1a44b8] text-white flex flex-col font-sans shadow-xl transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-64'
          }`}
      >
        <div
          className={`p-4 flex flex-shrink-0 gap-2 ${collapsed ? 'flex-col items-center' : 'items-center justify-between'
            }`}
        >
          {!collapsed && (
            <Link to={BASE_PATH} className="flex items-center gap-3 min-w-0 flex-1">
              <LogoIcon size={28} className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight truncate">EDU-AI Classroom</h1>
                <p className="text-xs text-blue-200 truncate">Learning made simple</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to={BASE_PATH} className="flex justify-center">
              <LogoIcon size={28} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-lg hover:bg-white/10 text-blue-100 transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm truncate">{item.label}</span>}
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
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 flex-shrink-0">
              <User size={20} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">John Doe</p>
                <p className="text-xs text-blue-200 capitalize truncate">{detectedRole}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 flex items-center justify-end gap-4 px-4 md:px-6 py-3 bg-white border-b border-gray-200">
          <div className="relative w-64 md:w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
            />
          </div>
          <button type="button" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Thông báo">
            <Bell size={20} />
          </button>
          <button type="button" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Cài đặt">
            <Settings size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
