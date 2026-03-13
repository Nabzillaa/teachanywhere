import { Edit2 } from 'lucide-react';
import './SectionCard.css';

interface SectionCardProps {
  title: string;
  onEdit?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, onEdit, actions, children, className = '' }: SectionCardProps) {
  return (
    <div className={`section-card ${className}`}>
      <div className="section-card__header">
        <h2 className="section-card__title">{title}</h2>
        <div className="section-card__actions">
          {actions}
          {onEdit && (
            <button className="section-card__edit-btn" onClick={onEdit}>
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>
      </div>
      <div className="section-card__body">
        {children}
      </div>
    </div>
  );
}
