import { RefreshCw, Edit2, HelpCircle } from 'lucide-react';
import './PageHeader.css';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  onRefresh?: () => void;
  onEdit?: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon, title, onRefresh, onEdit, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        {icon && <span className="page-header__icon">{icon}</span>}
        <h1 className="page-header__title">{title}</h1>
      </div>
      <div className="page-header__right">
        {actions}
        {onRefresh && (
          <button className="page-header__btn" onClick={onRefresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
        {onEdit && (
          <button className="page-header__btn" onClick={onEdit}>
            <Edit2 size={14} /> Edit
          </button>
        )}
        <button className="page-header__help-btn">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
}
