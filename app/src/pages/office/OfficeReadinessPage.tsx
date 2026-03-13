import { Building2, CheckCircle, CheckSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import ProgressBar from '../../components/common/ProgressBar';
import { useAppStore } from '../../store/appStore';

export default function OfficeReadinessPage() {
  const visits = useAppStore(s => s.visits);
  const toggleOfficeReadiness = useAppStore(s => s.toggleOfficeReadiness);
  const loadOfficeTemplate = useAppStore(s => s.loadOfficeTemplate);

  const activeVisits = visits.filter(v => ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(v.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={<Building2 size={20} />} title="Office Readiness" />

      {activeVisits.length === 0 && (
        <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No active or upcoming visits</p>
      )}

      {activeVisits.map(visit => {
        const done = visit.officeReadiness.filter(o => o.completed).length;
        const total = visit.officeReadiness.length;
        const categories = [...new Set(visit.officeReadiness.map(o => o.category))];

        return (
          <SectionCard
            key={visit.id}
            title={`${visit.visitRef} · ${visit.company} — Arriving ${visit.arrivalDate}`}
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ProgressBar value={done} max={Math.max(total, 1)} />
                {total === 0 && (
                  <button className="section-card__edit-btn" onClick={() => loadOfficeTemplate(visit.id)}>
                    Load Template
                  </button>
                )}
              </div>
            }
          >
            {total === 0 ? (
              <p className="section-card__empty">Checklist not started — click "Load Template" to populate standard items, or add from Visit Detail</p>
            ) : (
              <div>
                {categories.map(cat => (
                  <div key={cat}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 18px 4px', borderBottom: '1px solid var(--border)' }}>{cat}</div>
                    {visit.officeReadiness.filter(o => o.category === cat).map(item => (
                      <div
                        key={item.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => toggleOfficeReadiness(visit.id, item.id, 'Nabil Sabin')}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ color: item.completed ? '#1e8449' : 'var(--text-muted)', flexShrink: 0 }}>
                          {item.completed ? <CheckCircle size={18} /> : <CheckSquare size={18} />}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                          {item.item}
                        </span>
                        {item.completed && item.completedBy && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.completedBy}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        );
      })}
    </div>
  );
}
