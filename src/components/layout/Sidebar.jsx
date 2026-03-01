import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ListChecks,
  Settings,

  GraduationCap as LogoIcon,
  TrendingUp,
  Lock,
  Bell,
  FileText,
  Book,
  Layers,
  Calendar, // Import Calendar
} from 'lucide-react';
import ScrollToTop from './ScrollToTop';
import Header from '../../features/dashboard/components/Header';

const MENU_ITEMS = [
  { label: 'Tổng quan', icon: LayoutDashboard, path: 'dashboard', allowedRoles: ['admin', 'teacher', 'student', 'manager'] },
  { label: 'Vai trò & Quyền', icon: Lock, path: 'roles-permissions', allowedRoles: ['admin'] },
  { label: 'Người dùng', icon: Users, path: 'users', allowedRoles: ['admin'] },
  { label: 'Thông báo', icon: Bell, path: 'notifications', allowedRoles: ['admin'] },
  { label: 'Nhật ký hệ thống', icon: FileText, path: 'audit-logs', allowedRoles: ['admin'] },
  { label: 'Môn học & Danh mục', icon: Book, path: 'subjects', allowedRoles: ['manager'] },
  { label: 'Quản lý Kỳ học', icon: Calendar, path: 'terms', allowedRoles: ['manager'] },
  { label: 'Quản lý Khối/Lớp', icon: Layers, path: 'grades', allowedRoles: ['manager'] },
  { label: 'Khóa học', icon: BookOpen, path: 'courses', allowedRoles: ['teacher', 'student'] },
  { label: 'Khóa học mẫu ', icon: BookOpen, path: 'courses', allowedRoles: ['manager'] },
  { label: 'Bài kiểm tra', icon: ListChecks, path: 'quizzes', allowedRoles: ['student'] },
  { label: 'Tiến độ', icon: TrendingUp, path: 'progress', allowedRoles: ['student'] },
  { label: 'Lớp học', icon: Users, path: 'classes', allowedRoles: ['teacher'] },
  { label: 'Câu hỏi', icon: ListChecks, path: 'question-bank', allowedRoles: ['teacher'] },
  { label: 'Ngân hàng câu hỏi', icon: ListChecks, path: 'question-bank', allowedRoles: ['manager'] },
  { label: 'Cài đặt', icon: Settings, path: 'settings', allowedRoles: ['admin', 'teacher', 'student', 'manager'] },
];

export default function Sidebar({ userRole = 'teacher' }) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  const BASE_PATH = location.pathname.startsWith('/dashboard/student') ? '/dashboard/student' :
    location.pathname.startsWith('/dashboard/admin') ? '/dashboard/admin' :
      location.pathname.startsWith('/dashboard/manager') ? '/dashboard/manager' :
        '/dashboard/teacher';

  const detectedRole = location.pathname.startsWith('/dashboard/student') ? 'student' :
    location.pathname.startsWith('/dashboard/admin') ? 'admin' :
      location.pathname.startsWith('/dashboard/manager') ? 'manager' :
        location.pathname.startsWith('/dashboard/teacher') ? 'teacher' :
          userRole;

  const filteredMenu = MENU_ITEMS.filter((item) => item.allowedRoles.includes(detectedRole));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <ScrollToTop />

      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`flex flex-col flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-xl z-40
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-200 overflow-hidden whitespace-nowrap">
          <div className={`flex items-center gap-3 transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            <LogoIcon size={30} className="flex-shrink-0 text-blue-600" />
            <div className={`min-w-0 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 flex-1'}`}>
              <h1 className="text-base font-bold leading-none text-gray-900">EDU-AI Classroom</h1>
              <p className="text-[10px] text-gray-500 mt-1">Học tập đơn giản hơn</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
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
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } 
                  ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={22} className="flex-shrink-0" />
                <span className={`text-sm transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole={detectedRole} basePath={BASE_PATH} />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}