import React, { useState, useCallback } from "react";
import { LogIn, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Về EDU‑AI", href: "#about" },
    { label: "Tính năng", href: "#features" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Phản hồi", href: "#feedback" },
  ];

  const handleNavClick = useCallback(
    (href) => {
      if (href === "/") {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (href.startsWith("#")) {
        const id = href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      setIsOpen(false);
    },
    [navigate]
  );

  const handleLogin = useCallback(() => {
    navigate("/login");
    setIsOpen(false);
  }, [navigate]);

  return (
    <header className="h-16 w-full sticky top-0 z-50">
      {/* Header mờ nhẹ, đồng bộ với hero */}
      <div className="h-full w-full px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        {/* Logo / Brand */}
        <button
          type="button"
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-md">
            EA
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm md:text-base font-bold text-slate-900">
              EDU‑AI Classroom
            </span>
            <span className="text-[10px] md:text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              Learning Platform
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleLogin}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-xs md:text-sm rounded-full hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="w-full text-left px-2 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogin}
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}