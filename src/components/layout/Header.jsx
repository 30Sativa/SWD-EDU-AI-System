import React, { useState } from "react";
import { Search, LogIn } from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 w-full bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="h-full w-full px-8 flex items-center justify-between gap-6">
       

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