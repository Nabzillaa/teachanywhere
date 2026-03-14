import { useState } from 'react';
import { Building2, CheckCircle, CheckSquare, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import ProgressBar from '../../components/common/ProgressBar';
import { useAppStore } from '../../store/appStore';
import type { OfficeReadinessItem } from '../../data/types';

type Category = OfficeReadinessItem['category'];
const CATEGORIES: Category[] = ['AV & Tech', 'Hospitality', 'Access & Facilities', 'Communication', 'Signage'];

export default function OfficeReadinessPage() {
  const visits = useAppStore(s => s.visits);
  const toggleOfficeReadiness = useAppStore(s => s.toggleOfficeReadiness);
  const addOfficeReadinessItem = useAppStore(s => s.addOfficeReadinessItem);
  const deleteOfficeReadinessItem = useAppStore(s => s.deleteOfficeReadinessItem);
  const loadOfficeTemplate = useAppStore(s => s.loadOfficeTemplate);

  const [addModal, setAddModal] = useState<string | null>(null); // visitId
  const [newItem, setNewItem] = useState<{ category: Category; item: string }>({ category: 'AV & Tech', item: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ visitId: string; itemId: string; label: string } | null>(null);

  const activeVisits = visits.filter(v => ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(v.status));

  const openAdd = (visitId: string) => {
    setNewItem({ category: 'AV & Tech', item: '' });
    setAddModal(visitId);
  };

  const submitAdd = () => {
    if (!addModal || !newItem.item.trim()) return;
    addOfficeReadinessItem(addModal, { category: newItem.category, item: newItem.item.trim(), completed: false });
    setAddModal(null);
  };

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
                <button className="section-card__edit-btn" onClick={() => openAdd(visit.id)}>
                  <Plus size={12} /> Add Item
                </button>
              </div>
            }
          >
            {total === 0 ? (
              <p className="section-card__empty">Checklist not started — click "Load Template" to populate standard items or "Add Item" to add manually</p>
            ) : (
              <div>
                {categories.map(cat => (
                  <div key={cat}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 18px 4px', borderBottom: '1px solid var(--border)' }}>{cat}</div>
                    {visit.officeReadiness.filter(o => o.category === cat).map(item => (
                      <div
                        key={item.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderBottom: '1px solid var(--border)', background: 'transparent', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span
                          style={{ color: item.completed ? '#1e8449' : 'var(--text-muted)', flexShrink: 0, cursor: 'pointer' }}
                          onClick={() => toggleOfficeReadiness(visit.id, item.id, 'Nabil Sabin')}
                        >
                          {item.completed ? <CheckCircle size={18} /> : <CheckSquare size={18} />}
                        </span>
                        <span
                          style={{ flex: 1, fontSize: 13, color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                          onClick={() => toggleOfficeReadiness(visit.id, item.id, 'Nabil Sabin')}
                        >
                          {item.item}
                        </span>
                        {item.completed && item.completedBy && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.completedBy}</span>
                        )}
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.5, transition: 'opacity 0.15s, color 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                          onClick={() => setConfirmDelete({ visitId: visit.id, itemId: item.id, label: item.item })}
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        );
      })}

      {confirmDelete && (
        <ConfirmModal
          title="Remove Item"
          message={<>Are you sure you want to remove <strong>{confirmDelete.label}</strong>? This cannot be undone.</>}
          onConfirm={() => { deleteOfficeReadinessItem(confirmDelete.visitId, confirmDelete.itemId); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {addModal && (
        <Modal title="Add Readiness Item" onClose={() => setAddModal(null)} onSubmit={submitAdd}>
          <div className="modal-field">
            <label>Category</label>
            <select value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value as Category }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Item Description *</label>
            <input
              value={newItem.item}
              onChange={e => setNewItem(n => ({ ...n, item: e.target.value }))}
              placeholder="e.g. Wi-Fi tested and credentials documented"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
