import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { message } from 'antd';

export default function Header({ userRole }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý chuyên môn';
      default: return role;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token'); // Clear possible other token keys
    message.success('Đăng xuất thành công');
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
          />
        </div>

        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-800 leading-tight">John Doe</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase">{getRoleLabel(userRole)}</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-75">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                  <User size={16} /> Hồ sơ
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                  <Settings size={16} /> Cài đặt
                </Link>
                <div className="my-1 border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}