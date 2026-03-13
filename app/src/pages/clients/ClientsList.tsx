import { useState } from 'react';
import { Briefcase, Search, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import { useAppStore } from '../../store/appStore';
import type { Client } from '../../data/types';
import './ClientsList.css';

const DIETARY_OPTIONS = [
  '',
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Nut Allergy',
  'Shellfish Allergy',
  'Egg Allergy',
  'Soy Allergy',
  'Low FODMAP',
  'Diabetic-Friendly',
  'Other (see notes)',
];

type CForm = Omit<Client, 'id'>;
const blank: CForm = { name: '', company: '', email: '', phone: '', role: '', dietaryRequirements: '', accessibilityRequirements: '', specialRequests: '', policyOverrides: '' };

export default function ClientsList() {
  const clients = useAppStore(s => s.clients);
  const visits = useAppStore(s => s.visits);
  const addClient = useAppStore(s => s.addClient);
  const updateClient = useAppStore(s => s.updateClient);
  const deleteClient = useAppStore(s => s.deleteClient);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: CForm }>({ open: false, form: blank });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (modal.editId) updateClient(modal.editId, modal.form);
    else addClient(modal.form);
    setModal({ open: false, form: blank });
  };

  return (
    <div className="clients-list">
      <PageHeader
        icon={<Briefcase size={20} />}
        title="Clients"
        actions={
          <button className="page-header__btn page-header__btn--primary" onClick={() => setModal({ open: true, form: blank })}>
            <Plus size={14} /> Add Client
          </button>
        }
      />

      <div className="clients-list__search-bar">
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'none', border: 'none', flex: 1, color: 'var(--text-primary)', fontSize: 14 }}
        />
      </div>

      <SectionCard title={`Client Accounts (${filtered.length})`}>
        {filtered.length === 0 ? (
          <p className="section-card__empty">No clients found</p>
        ) : (
          <table className="clients-list__table">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Role</th><th>Email</th><th>Phone</th><th>Dietary</th><th>Policy Override</th><th>Visits</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const clientVisits = visits.filter(v => v.clientId === client.id);
                return (
                  <tr key={client.id}>
                    <td className="clients-list__name">{client.name}</td>
                    <td>{client.company}</td>
                    <td>{client.role}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.dietaryRequirements || '—'}</td>
                    <td>
                      {client.policyOverrides
                        ? <span className="clients-list__policy-warn"><AlertCircle size={12} /> Has Override</span>
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>{clientVisits.length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="visit-detail__action-btn"
                          onClick={() => setModal({ open: true, editId: client.id, form: { name: client.name, company: client.company, email: client.email, phone: client.phone, role: client.role, dietaryRequirements: client.dietaryRequirements || '', accessibilityRequirements: client.accessibilityRequirements || '', specialRequests: client.specialRequests || '', policyOverrides: client.policyOverrides || '' } })}
                        >
                          <Pencil size={13} />
                        </button>
                        <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setDeleteId(client.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {filtered.filter(c => c.policyOverrides).map(c => (
        <SectionCard key={c.id} title={`Policy Override: ${c.company}`}>
          <div style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: 6, color: '#ca6f1e' }} />
            {c.policyOverrides}
          </div>
        </SectionCard>
      ))}

      {modal.open && (
        <Modal title={modal.editId ? 'Edit Client' : 'Add Client'} onClose={() => setModal({ open: false, form: blank })} onSubmit={save} width={560}>
          <div className="modal-row">
            <div className="modal-field"><label>Full Name *</label><input value={modal.form.name} onChange={e => setModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))} /></div>
            <div className="modal-field"><label>Company *</label><input value={modal.form.company} onChange={e => setModal(m => ({ ...m, form: { ...m.form, company: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Role / Title</label><input value={modal.form.role} onChange={e => setModal(m => ({ ...m, form: { ...m.form, role: e.target.value } }))} /></div>
            <div className="modal-field"><label>Email</label><input type="email" value={modal.form.email} onChange={e => setModal(m => ({ ...m, form: { ...m.form, email: e.target.value } }))} /></div>
          </div>
          <div className="modal-field"><label>Phone / WhatsApp</label><input value={modal.form.phone} onChange={e => setModal(m => ({ ...m, form: { ...m.form, phone: e.target.value } }))} /></div>
          <div className="modal-field">
            <label>Dietary Requirements</label>
            <select value={modal.form.dietaryRequirements} onChange={e => setModal(m => ({ ...m, form: { ...m.form, dietaryRequirements: e.target.value } }))}>
              {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || '— Select —'}</option>)}
            </select>
          </div>
          <div className="modal-field"><label>Accessibility Requirements</label><input value={modal.form.accessibilityRequirements} onChange={e => setModal(m => ({ ...m, form: { ...m.form, accessibilityRequirements: e.target.value } }))} /></div>
          <div className="modal-field"><label>Policy Overrides (if any)</label><textarea rows={2} value={modal.form.policyOverrides} onChange={e => setModal(m => ({ ...m, form: { ...m.form, policyOverrides: e.target.value } }))} placeholder="e.g. Remote staff travel NOT covered under this account" /></div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete Client" onClose={() => setDeleteId(null)} onSubmit={() => { deleteClient(deleteId); setDeleteId(null); }} submitLabel="Delete" submitDestructive>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{clients.find(c => c.id === deleteId)?.name}</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
