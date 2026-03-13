import { useState } from 'react';
import { Users, CheckCircle, AlertTriangle, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import { useAppStore } from '../../store/appStore';

type AttendeeForm = {
  name: string;
  role: string;
  department: string;
  location: 'Manila' | 'Remote';
  email: string;
  phone: string;
  managerConfirmed: boolean;
  travelRequired: boolean;
  accommodationRequired: boolean;
  visitId: string;
};

const blank: AttendeeForm = {
  name: '', role: '', department: '', location: 'Manila',
  email: '', phone: '', managerConfirmed: false,
  travelRequired: false, accommodationRequired: false, visitId: '',
};

export default function AttendeesList() {
  const visits = useAppStore(s => s.visits);
  const toggleAttendeeConfirmed = useAppStore(s => s.toggleAttendeeConfirmed);
  const updateInternalAttendee = useAppStore(s => s.updateInternalAttendee);
  const addInternalAttendee = useAppStore(s => s.addInternalAttendee);
  const deleteInternalAttendee = useAppStore(s => s.deleteInternalAttendee);

  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: AttendeeForm }>({ open: false, form: blank });
  const [deleteConfirm, setDeleteConfirm] = useState<{ visitId: string; id: string; name: string } | null>(null);

  const allInternal = visits.flatMap(v =>
    v.internalAttendees.map(a => ({ ...a, visitRef: v.visitRef, visitId: v.id, company: v.company }))
  );

  const openAddForReal = () => setModal({ open: true, form: { ...blank, visitId: visits[0]?.id || '' } });

  const openEdit = (a: typeof allInternal[0]) => setModal({
    open: true,
    editId: a.id,
    form: {
      name: a.name, role: a.role, department: a.department,
      location: a.location, email: a.email, phone: a.phone,
      managerConfirmed: a.managerConfirmed, travelRequired: a.travelRequired,
      accommodationRequired: a.accommodationRequired, visitId: a.visitId,
    },
  });

  const save = () => {
    const { visitId, ...rest } = modal.form;
    if (!visitId) return;
    if (modal.editId) {
      updateInternalAttendee(visitId, modal.editId, rest);
    } else {
      addInternalAttendee(visitId, { ...rest, attendanceConfirmed: false });
    }
    setModal({ open: false, form: blank });
  };

  const setField = <K extends keyof AttendeeForm>(key: K, value: AttendeeForm[K]) =>
    setModal(m => ({ ...m, form: { ...m.form, [key]: value } }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        icon={<Users size={20} />}
        title="Attendees"
        actions={
          <button className="page-header__btn page-header__btn--primary" onClick={openAddForReal}>
            <Plus size={14} /> Add Attendee
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Internal', value: allInternal.length, color: 'var(--text-primary)' },
          { label: 'Confirmed', value: allInternal.filter(a => a.attendanceConfirmed).length, color: '#1e8449' },
          { label: 'Pending Confirmation', value: allInternal.filter(a => !a.attendanceConfirmed).length, color: '#ca6f1e' },
          { label: 'Travel Required', value: allInternal.filter(a => a.travelRequired).length, color: '#2471a3' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title="All Internal Attendees">
        {allInternal.length === 0 ? (
          <p className="section-card__empty">No internal attendees added yet — click Add Attendee to start</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Visit', 'Name', 'Role', 'Department', 'Location', 'Attendance', 'Manager Approved', 'Travel', 'Accom', ''].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allInternal.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 18px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{a.visitRef}</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{a.name}</td>
                  <td style={{ padding: '10px 18px', color: 'var(--text-secondary)' }}>{a.role}</td>
                  <td style={{ padding: '10px 18px', color: 'var(--text-secondary)' }}>{a.department}</td>
                  <td style={{ padding: '10px 18px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: a.location === 'Remote' ? '#ca6f1e' : 'var(--text-secondary)' }}>
                      <MapPin size={12} /> {a.location}
                    </span>
                  </td>
                  <td style={{ padding: '10px 18px' }}>
                    <button
                      onClick={() => toggleAttendeeConfirmed(a.visitId, a.id)}
                      className={`visit-detail__confirm-btn ${a.attendanceConfirmed ? 'confirmed' : 'pending'}`}
                      title="Click to toggle"
                    >
                      {a.attendanceConfirmed ? <><CheckCircle size={12} /> Confirmed</> : <><AlertTriangle size={12} /> Pending</>}
                    </button>
                  </td>
                  <td style={{ padding: '10px 18px' }}>
                    <button
                      onClick={() => updateInternalAttendee(a.visitId, a.id, { managerConfirmed: !a.managerConfirmed })}
                      className={`visit-detail__confirm-btn ${a.managerConfirmed ? 'confirmed' : 'pending'}`}
                    >
                      {a.managerConfirmed ? '✓ Yes' : '✗ No'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 18px', fontSize: 12 }}>{a.travelRequired ? '✈ Yes' : '—'}</td>
                  <td style={{ padding: '10px 18px', fontSize: 12 }}>{a.accommodationRequired ? '🏨 Yes' : '—'}</td>
                  <td style={{ padding: '10px 18px' }}>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" title="Edit" onClick={() => openEdit(a)}>
                        <Pencil size={13} />
                      </button>
                      <button
                        className="visit-detail__action-btn visit-detail__action-btn--delete"
                        title="Delete"
                        onClick={() => setDeleteConfirm({ visitId: a.visitId, id: a.id, name: a.name })}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {modal.open && (
        <Modal
          title={modal.editId ? 'Edit Attendee' : 'Add Internal Attendee'}
          onClose={() => setModal({ open: false, form: blank })}
          onSubmit={save}
          width={540}
        >
          {!modal.editId && (
            <div className="modal-field">
              <label>Visit *</label>
              <select value={modal.form.visitId} onChange={e => setField('visitId', e.target.value)}>
                <option value="">— Select a visit —</option>
                {visits.map(v => (
                  <option key={v.id} value={v.id}>{v.visitRef} · {v.company}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-row">
            <div className="modal-field">
              <label>Full Name *</label>
              <input value={modal.form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Juan Dela Cruz" />
            </div>
            <div className="modal-field">
              <label>Role / Title *</label>
              <input value={modal.form.role} onChange={e => setField('role', e.target.value)} placeholder="e.g. Senior Developer" />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Department</label>
              <input value={modal.form.department} onChange={e => setField('department', e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div className="modal-field">
              <label>Location</label>
              <select value={modal.form.location} onChange={e => setField('location', e.target.value as 'Manila' | 'Remote')}>
                <option value="Manila">Manila</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Email</label>
              <input type="email" value={modal.form.email} onChange={e => setField('email', e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Phone</label>
              <input value={modal.form.phone} onChange={e => setField('phone', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(
              [
                { key: 'managerConfirmed', label: 'Manager has confirmed attendance' },
                { key: 'travelRequired', label: 'Travel required (flights or long-distance)' },
                { key: 'accommodationRequired', label: 'Accommodation required' },
              ] as { key: keyof AttendeeForm; label: string }[]
            ).map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modal.form[key] as boolean}
                  onChange={e => setField(key, e.target.checked)}
                  style={{ width: 'auto', accentColor: 'var(--accent-red)' }}
                />
                {label}
              </label>
            ))}
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Remove Attendee"
          onClose={() => setDeleteConfirm(null)}
          onSubmit={() => { deleteInternalAttendee(deleteConfirm.visitId, deleteConfirm.id); setDeleteConfirm(null); }}
          submitLabel="Remove"
          submitDestructive
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Remove <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong> from this visit?
          </p>
        </Modal>
      )}
    </div>
  );
}
