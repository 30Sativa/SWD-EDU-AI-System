import React from 'react';
import { Link } from 'react-router-dom';
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
  Search,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard',
    icon: LayoutDashboard, 
    path: 'dashboard', 
    allowedRoles: ['admin', 'teacher', 'student'] 
  },
  { label: 'Courses', 
    icon: BookOpen, 
    path: 'courses', 
    allowedRoles: ['admin', 'teacher', 'student'] 
  },
  { label: 'Classes', 
    icon: Users, 
    path: 'classes', 
    allowedRoles: ['admin', 'teacher'] 
  },
  { label: 'Students', 
    icon: GraduationCap, 
    path: 'students', 
    allowedRoles: ['admin', 'teacher'] 
  },
  { label: 'Question Bank', 
    icon: ListChecks, 
    path: 'question-bank', 
    allowedRoles: ['teacher'] 
  },
  { label: 'System Admin', 
    icon: ShieldAlert, 
    path: 'admin', 
    allowedRoles: ['admin'] },
  { label: 'Settings', 
    icon: Settings, 
    path: 'settings', 
    allowedRoles: ['admin', 'teacher', 'student'] 
  },
];

const BASE_PATH = '/dashboard/teacher';

export default function Sidebar({ collapsed, onToggle, userRole = 'teacher' }) {
  const filteredMenu = MENU_ITEMS.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <div
      className={`h-screen bg-[#1a44b8] text-white flex flex-col font-sans shadow-xl transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div
        className={`p-4 flex flex-shrink-0 gap-2 ${
          collapsed ? 'flex-col items-center' : 'items-center justify-between'
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
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 text-blue-100 transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 bg-white/10 rounded-lg text-sm text-white placeholder-blue-200 border-0 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const href = item.path === 'dashboard' ? BASE_PATH : `${BASE_PATH}/${item.path}`;
          return (
            <Link
              key={item.label}
              to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.path === 'dashboard'
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:bg-white/10'
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
              <p className="text-xs text-blue-200 capitalize truncate">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
