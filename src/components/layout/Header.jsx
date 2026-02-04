import React from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Về chúng tôi", href: "#" },
    { label: "Liên hệ", href: "#" },
    { label: "Chính sách", href: "#" },
  ];

  return (
    <header className="h-16 w-full bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
      <div className="h-full w-full px-8 relative flex items-center justify-end">

        {/* Navigation - Perfectly Centered */}
        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="font-medium text-sm px-2 py-1 mx-2 border-b-2 border-transparent text-gray-600 transition-all duration-200 hover:text-blue-600 hover:border-blue-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Login Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:shadow-blue-600/30 hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
        </div>

      </div>
    </header>
  );
}