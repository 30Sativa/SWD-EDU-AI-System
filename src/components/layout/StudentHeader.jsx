import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, GraduationCap } from 'lucide-react';
import { message } from 'antd';

export default function StudentHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const BASE_PATH = '/dashboard/student';

    const navItems = [
        { label: 'Tổng quan', path: 'dashboard' },
        { label: 'Khóa học', path: 'courses' },
        { label: 'Bài kiểm tra', path: 'quizzes' },
        { label: 'Tiến độ', path: 'progress' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        message.success('Đăng xuất thành công');
        navigate('/');
    };

    return (
        <header className="h-16 w-full bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
            <div className="h-full w-full px-8 relative flex items-center justify-between">
                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <GraduationCap size={28} className="flex-shrink-0 text-blue-600" />
                    <div>
                        <h1 className="text-base font-bold leading-none text-gray-900">EDU-AI Classroom</h1>
                        <p className="text-[10px] text-gray-500 mt-1">Học tập đơn giản hơn</p>
                    </div>
                </div>

                {/* Navigation - Perfectly Centered, Absolute */}
                <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
                    {navItems.map((item) => {
                        const fullPath = item.path === 'dashboard' ? BASE_PATH : `${BASE_PATH}/${item.path}`;
                        const isActive = item.path === 'dashboard'
                            ? location.pathname === BASE_PATH
                            : location.pathname.startsWith(fullPath);

                        return (
                            <Link
                                key={item.label}
                                to={fullPath}
                                className={`font-medium text-sm px-2 py-1 mx-2 border-b-2 transition-all duration-200 ${isActive
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Section: User Profile */}
                <div className="flex items-center gap-4 flex-shrink-0">

                    <button className="text-gray-500 hover:text-blue-600 transition-colors">
                        <Search size={20} />
                    </button>

                    <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-px bg-gray-200/60 mx-1"></div>

                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-blue-600 transition-colors">Ngọc Nguyễn</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Student</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                            NN
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 transition-colors ml-2"
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                    </button>

                </div>
            </div>
        </header>
    );
}
