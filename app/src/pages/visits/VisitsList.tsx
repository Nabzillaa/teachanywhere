import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Filter, ArrowRight, Trash2, ChevronDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import { useAppStore } from '../../store/appStore';
import type { VisitStatus } from '../../data/types';
import './VisitsList.css';

const ALL_STATUSES: VisitStatus[] = [
  'Draft', 'Proposed', 'Confirmed', 'In Planning', 'Ready for Arrival', 'Active', 'Completed', 'Closed', 'Cancelled'
];
const STATUS_FILTERS: (VisitStatus | 'All')[] = ['All', ...ALL_STATUSES];

export default function VisitsList() {
  const navigate = useNavigate();
  const visits = useAppStore(s => s.visits);
  const setVisitStatus = useAppStore(s => s.setVisitStatus);
  const deleteVisit = useAppStore(s => s.deleteVisit);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitStatus | 'All'>('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusPickerId, setStatusPickerId] = useState<string | null>(null);

  const filtered = visits.filter(v => {
    const matchSearch = !search ||
      v.company.toLowerCase().includes(search.toLowerCase()) ||
      v.clientName.toLowerCase().includes(search.toLowerCase()) ||
      v.visitRef.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="visits-list">
      <PageHeader
        icon={<Calendar size={20} />}
        title="Visits"
        actions={
          <button className="page-header__btn page-header__btn--primary" onClick={() => navigate('/visits/new')}>
            <Plus size={14} /> New Visit
          </button>
        }
      />

      <div className="visits-list__filters">
        <div className="visits-list__search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search visits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="visits-list__search-input"
          />
        </div>
        <div className="visits-list__status-filters">
          <Filter size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`visits-list__filter-btn ${statusFilter === s ? 'visits-list__filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="visits-list__cards">
        {filtered.length === 0 && <div className="visits-list__empty">No visits found</div>}
        {filtered.map(visit => {
          const completedReadiness = visit.officeReadiness.filter(o => o.completed).length;
          const totalReadiness = visit.officeReadiness.length;
          const confirmedAttendees = visit.internalAttendees.filter(a => a.attendanceConfirmed).length;
          const totalAttendees = visit.internalAttendees.length;

          return (
            <div key={visit.id} className="visit-card">
              <div className="visit-card__header">
                <div className="visit-card__refs">
                  <span className="visit-card__ref">{visit.visitRef}</span>
                  <div className="visit-card__status-wrapper">
                    <Badge label={visit.status} />
                    <button
                      className="visit-card__status-btn"
                      title="Change status"
                      onClick={e => { e.stopPropagation(); setStatusPickerId(statusPickerId === visit.id ? null : visit.id); }}
                    >
                      <ChevronDown size={12} />
                    </button>
                    {statusPickerId === visit.id && (
                      <div className="visit-card__status-dropdown">
                        {ALL_STATUSES.map(s => (
                          <button
                            key={s}
                            className={`visit-card__status-option ${s === visit.status ? 'active' : ''}`}
                            onClick={e => { e.stopPropagation(); setVisitStatus(visit.id, s); setStatusPickerId(null); }}
                          >
                            <Badge label={s} /> {s === visit.status && '✓'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="visit-card__header-actions">
                  <button
                    className="visit-card__action-btn visit-card__action-btn--delete"
                    title="Delete visit"
                    onClick={e => { e.stopPropagation(); setDeleteId(visit.id); }}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button className="visit-card__arrow" onClick={() => navigate(`/visits/${visit.id}`)}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="visit-card__clickable" onClick={() => navigate(`/visits/${visit.id}`)}>
                <div className="visit-card__company">{visit.company}</div>
                <div className="visit-card__client">{visit.clientName}</div>
                <div className="visit-card__purpose">{visit.purpose}</div>

                <div className="visit-card__dates">
                  <span>📅 {visit.arrivalDate} → {visit.departureDate}</span>
                  <span>🏨 {visit.hotelName || 'Hotel TBC'}</span>
                </div>

                <div className="visit-card__meta">
                  <div className="visit-card__meta-item">
                    <span className="visit-card__meta-label">Visit Lead</span>
                    <span className="visit-card__meta-value">{visit.visitLead}</span>
                  </div>
                  <div className="visit-card__meta-item">
                    <span className="visit-card__meta-label">Clients</span>
                    <span className="visit-card__meta-value">{visit.clientAttendees.length}</span>
                  </div>
                  <div className="visit-card__meta-item">
                    <span className="visit-card__meta-label">Team</span>
                    <span className={`visit-card__meta-value ${confirmedAttendees < totalAttendees ? 'visit-card__meta-value--warn' : ''}`}>
                      {confirmedAttendees}/{totalAttendees} confirmed
                    </span>
                  </div>
                  <div className="visit-card__meta-item">
                    <span className="visit-card__meta-label">Office Ready</span>
                    <span className="visit-card__meta-value">{completedReadiness}/{totalReadiness}</span>
                  </div>
                </div>

                <div className="visit-card__readiness">
                  <span className="visit-card__readiness-label">Logistics Readiness</span>
                  <ProgressBar value={visit.logisticsReadinessScore ?? 0} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deleteId && (
        <Modal
          title="Delete Visit"
          onClose={() => setDeleteId(null)}
          onSubmit={() => { deleteVisit(deleteId); setDeleteId(null); }}
          submitLabel="Delete"
          submitDestructive
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>
              {visits.find(v => v.id === deleteId)?.visitRef} – {visits.find(v => v.id === deleteId)?.company}
            </strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
