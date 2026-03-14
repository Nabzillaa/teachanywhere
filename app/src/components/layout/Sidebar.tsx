import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Briefcase, Truck,
  Building2, MessageSquare, Receipt, BarChart2, Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'DASHBOARD', path: '/', icon: LayoutDashboard },
  { label: 'VISITS', path: '/visits', icon: Calendar },
  { label: 'CLIENTS', path: '/clients', icon: Briefcase },
  { label: 'ATTENDEES', path: '/attendees', icon: Users },
  { label: 'TRAVEL & LOGISTICS', path: '/logistics', icon: Truck },
  { label: 'OFFICE READINESS', path: '/office-readiness', icon: Building2 },
  { label: 'COMMUNICATIONS', path: '/communications', icon: MessageSquare },
  { label: 'EXPENSES', path: '/expenses', icon: Receipt },
  { label: 'REPORTS', path: '/reports', icon: BarChart2 },
  { label: 'SETTINGS', path: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo">
        <button
          className="sidebar__logo-icon-btn"
          onClick={onToggle}
          title="Toggle sidebar"
        >
          <img src="/icon.png" alt="TechAnywhere" className="sidebar__logo-icon" />
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
            >
              <Icon size={16} className="sidebar__icon" />
              {!collapsed && (
                <span className="sidebar__label">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className={`sidebar__user ${collapsed ? 'sidebar__user--collapsed' : ''}`}>
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.name}</span>
              <span className="sidebar__user-role">{user.role}</span>
            </div>
          )}
          <button className="sidebar__logout-btn" onClick={logout} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  );
}
