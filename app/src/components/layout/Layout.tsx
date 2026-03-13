import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="layout__main">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(c => !c)} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
