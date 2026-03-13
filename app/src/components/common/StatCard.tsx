import { RefreshCw, Edit2 } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  value: string | number;
  label: string;
  color: 'red' | 'gold' | 'orange' | 'dark';
  onRefresh?: () => void;
  onEdit?: () => void;
}

export default function StatCard({ value, label, color, onRefresh, onEdit }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__actions">
        {onEdit && (
          <button className="stat-card__action-btn" onClick={onEdit}>
            <Edit2 size={12} />
          </button>
        )}
        {onRefresh && (
          <button className="stat-card__action-btn" onClick={onRefresh}>
            <RefreshCw size={12} />
          </button>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
