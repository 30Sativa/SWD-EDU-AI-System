import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import Sidebar from './Sidebar';

export default function SidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ScrollToTop />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        userRole="teacher"
      />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
