import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Briefcase, Truck,
  Building2, MessageSquare, Receipt, BarChart2, Settings,
  ChevronRight, MapPin
} from 'lucide-react';
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

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo">
        <button
          className="sidebar__logo-icon-btn"
          onClick={onToggle}
          title="Toggle sidebar"
        >
          <div className="sidebar__logo-icon">
            <MapPin size={20} />
          </div>
        </button>
        {!collapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-brand">tech</span>
            <span className="sidebar__logo-brand sidebar__logo-brand--highlight">anywhere</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ label, path, icon: Icon, hasChildren }) => {
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
                <>
                  <span className="sidebar__label">{label}</span>
                  {hasChildren && <ChevronRight size={14} className="sidebar__chevron" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
