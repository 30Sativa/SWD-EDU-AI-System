import React, { useState } from "react";
import { Search, LogIn } from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 w-full bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="h-full w-full px-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-shrink-0 group cursor-pointer">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/40 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
            <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white shadow-md"></div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-gray-800 tracking-tight">
                Edu
              </span>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI
              </span>
            </div>
            <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase">Learning Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Tìm kiếm khóa học, bài giảng..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm shadow-sm hover:shadow-md transition-all"
            />
          </div>

          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
        </div>

      </div>
    </header>
  );
}