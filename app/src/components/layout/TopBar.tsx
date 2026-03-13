import { Menu, Search, RefreshCw, Bell, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__icon-btn" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>

        <input
          type="text"
          placeholder="What are you working on?"
          className="topbar__search-main"
        />

        <div className="topbar__select-group">
          <button className="topbar__select-btn">
            Project <ChevronDown size={14} />
          </button>
          <button className="topbar__refresh-btn">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="topbar__select-group">
          <button className="topbar__select-btn">
            Task <ChevronDown size={14} />
          </button>
        </div>

        <div className="topbar__timer">
          <span className="topbar__timer-display">00:00:00</span>
          <button className="topbar__timer-play">▶</button>
          <button className="topbar__timer-add"><Plus size={14} /></button>
        </div>
      </div>

      <div className="topbar__right">
        <button className="topbar__icon-btn">
          <Search size={18} />
        </button>

        <button className="topbar__notification-btn" onClick={() => navigate('/visits')}>
          <Bell size={18} />
          <span className="topbar__badge">3</span>
        </button>

        <div className="topbar__profile">
          <div className="topbar__profile-info">
            <span className="topbar__profile-title">Head of Service Delivery</span>
            <span className="topbar__profile-name">Nabil Sabin</span>
          </div>
          <div className="topbar__avatar">N</div>
        </div>
      </div>
    </header>
  );
}
