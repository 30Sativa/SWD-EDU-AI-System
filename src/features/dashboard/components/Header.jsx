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
import { getCurrentUser } from '../../user/api/userApi';

export default function Header({ userRole, basePath }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Get user info from API
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        const userData = response?.data || response;
        setCurrentUser(userData);

        // Prioritize full name for display
        const nameToStore = userData?.fullName || userData?.profile?.fullName || userData?.userName;
        if (nameToStore) localStorage.setItem('userName', nameToStore);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Determine display name: State > LocalStorage > Default
  const userName = currentUser?.fullName || currentUser?.profile?.fullName || currentUser?.userName || localStorage.getItem('userName') || 'User';

  const getRoleLabel = (role) => {
    const labels = {
      'teacher': 'Giáo viên',
      'student': 'Học sinh',
      'admin': 'Quản trị viên',
      'manager': 'Quản lý chuyên môn'
    };
    return labels[role] || role;
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success('Đăng xuất thành công');
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        <form autoComplete="off" className="relative hidden md:block md:w-64" onSubmit={(e) => e.preventDefault()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="site-search-input"
            id="site-search-input"
            autoComplete="new-password"
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
          />
        </form>

        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative transition-colors" title="Thông báo">
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
              <span className="text-sm font-semibold text-gray-800 leading-tight">{userName}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase">{getRoleLabel(userRole)}</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-75">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
                </div>
                <Link
                  onClick={() => setUserDropdownOpen(false)}
                  to={`${basePath}/profile`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                >
                  <User size={16} /> Hồ sơ cá nhân
                </Link>
                <Link
                  onClick={() => setUserDropdownOpen(false)}
                  to={`${basePath}/settings`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                >
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