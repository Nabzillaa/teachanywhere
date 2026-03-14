import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  ArrowLeft, Calendar, Users, Truck, Building2,
  MessageSquare, Receipt, ClipboardList, CheckSquare,
  AlertTriangle, CheckCircle, MapPin, Plus, Pencil, Trash2, ChevronDown
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import SectionCard from '../../components/common/SectionCard';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAppStore } from '../../store/appStore';
import type { VisitStatus, BookingStatus, ExpenseStatus, TaskStatus, CommStatus, ReceiptFile } from '../../data/types';

function openReceipt(file: ReceiptFile) {
  const byteString = atob(file.dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: file.type });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
import './VisitDetail.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Calendar },
  { id: 'attendees', label: 'Attendees', icon: Users },
  { id: 'logistics', label: 'Travel & Logistics', icon: Truck },
  { id: 'office', label: 'Office Readiness', icon: Building2 },
  { id: 'comms', label: 'Communications', icon: MessageSquare },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
];

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

const ALL_STATUSES: VisitStatus[] = [
  'Draft', 'Proposed', 'Confirmed', 'In Planning', 'Ready for Arrival', 'Active', 'Completed', 'Closed', 'Cancelled'
];

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const visit = useAppStore(s => s.visits.find(v => v.id === id));
  const setVisitStatus = useAppStore(s => s.setVisitStatus);

  if (!visit) return <div className="visit-detail__not-found">Visit not found</div>;

  const completedReadiness = visit.officeReadiness.filter(o => o.completed).length;
  const confirmedAttendees = visit.internalAttendees.filter(a => a.attendanceConfirmed).length;
  const openTasks = visit.tasks.filter(t => t.status !== 'Completed').length;
  const pendingExpenses = visit.expenses.filter(e => e.status === 'Submitted').length;

  return (
    <div className="visit-detail">
      <div className="visit-detail__breadcrumb">
        <button className="visit-detail__back" onClick={() => navigate('/visits')}>
          <ArrowLeft size={16} /> Visits
        </button>
        <span className="visit-detail__breadcrumb-sep">/</span>
        <span className="visit-detail__breadcrumb-current">{visit.visitRef}</span>
      </div>

      <div className="visit-detail__header">
        <div className="visit-detail__header-main">
          <div className="visit-detail__ref">{visit.visitRef}</div>
          <h1 className="visit-detail__company">{visit.company}</h1>
          <div className="visit-detail__client">{visit.clientName} · {visit.visitLead}</div>
          <div className="visit-detail__purpose">{visit.purpose}</div>
        </div>
        <div className="visit-detail__header-right">
          <div className="visit-detail__status-wrapper">
            <Badge label={visit.status} />
            <button className="visit-detail__status-btn" onClick={() => setShowStatusPicker(p => !p)}>
              <ChevronDown size={14} /> Change Status
            </button>
            {showStatusPicker && (
              <div className="visit-detail__status-dropdown">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    className={`visit-card__status-option ${s === visit.status ? 'active' : ''}`}
                    onClick={() => { setVisitStatus(visit.id, s); setShowStatusPicker(false); }}
                  >
                    <Badge label={s} /> {s === visit.status && '✓'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="visit-detail__dates">
            <span>Arrives {visit.arrivalDate}</span>
            <span>Departs {visit.departureDate}</span>
          </div>
          <div className="visit-detail__readiness">
            <span>Logistics Readiness</span>
            <ProgressBar value={visit.logisticsReadinessScore ?? 0} />
          </div>
        </div>
      </div>

      {visit.internalAttendees.some(a => !a.attendanceConfirmed) && (
        <div className="visit-detail__alert visit-detail__alert--warn">
          <AlertTriangle size={14} />
          {visit.internalAttendees.filter(a => !a.attendanceConfirmed).length} internal attendee(s) have not confirmed attendance
        </div>
      )}
      {visit.transportBookings.length === 0 && ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(visit.status) && (
        <div className="visit-detail__alert visit-detail__alert--warn">
          <AlertTriangle size={14} /> No transport bookings recorded
        </div>
      )}
      {visit.expenses.some(e => !e.receiptAttached && e.status !== 'Rejected') && (
        <div className="visit-detail__alert visit-detail__alert--warn">
          <AlertTriangle size={14} /> Expense claims with missing receipts require attention
        </div>
      )}

      <div className="visit-detail__quick-stats">
        {[
          { value: visit.clientAttendees.length, label: 'Client Visitors', warn: false },
          { value: `${confirmedAttendees}/${visit.internalAttendees.length}`, label: 'Team Confirmed', warn: confirmedAttendees < visit.internalAttendees.length },
          { value: visit.transportBookings.length, label: 'Transport Bookings', warn: visit.transportBookings.length === 0 },
          { value: `${completedReadiness}/${visit.officeReadiness.length}`, label: 'Office Ready', warn: completedReadiness < visit.officeReadiness.length },
          { value: openTasks, label: 'Open Tasks', warn: openTasks > 0 },
          { value: pendingExpenses, label: 'Expenses Pending', warn: pendingExpenses > 0 },
        ].map(s => (
          <div key={s.label} className="visit-detail__quick-stat">
            <div className="visit-detail__quick-stat-value" style={{ color: s.warn ? 'var(--accent-orange)' : undefined }}>{s.value}</div>
            <div className="visit-detail__quick-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="visit-detail__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`visit-detail__tab ${activeTab === tab.id ? 'visit-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="visit-detail__content">
        {activeTab === 'overview' && <OverviewTab visitId={visit.id} />}
        {activeTab === 'attendees' && <AttendeesTab visitId={visit.id} />}
        {activeTab === 'logistics' && <LogisticsTab visitId={visit.id} />}
        {activeTab === 'office' && <OfficeTab visitId={visit.id} />}
        {activeTab === 'comms' && <CommsTab visitId={visit.id} />}
        {activeTab === 'expenses' && <ExpensesTab visitId={visit.id} />}
        {activeTab === 'tasks' && <TasksTab visitId={visit.id} />}
      </div>
    </div>
  );
}

/* ─── OVERVIEW ─────────────────────────────────────────────────────────── */
function OverviewTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const updateVisit = useAppStore(s => s.updateVisit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company: visit.company, clientName: visit.clientName, purpose: visit.purpose,
    arrivalDate: visit.arrivalDate, departureDate: visit.departureDate,
    officeDays: visit.officeDays.join(', '),
    visitLead: visit.visitLead, operationsCoordinator: visit.operationsCoordinator || '',
    hotelName: visit.hotelName || '', hotelAddress: visit.hotelAddress || '',
    flightDetails: visit.flightDetails || '', visitGoals: visit.visitGoals || '',
    specialRequirements: visit.specialRequirements || '', socialActivities: visit.socialActivities || '',
  });

  const save = () => {
    updateVisit(visitId, {
      ...form,
      officeDays: form.officeDays ? form.officeDays.split(',').map(d => d.trim()) : [],
      operationsCoordinator: form.operationsCoordinator || undefined,
    });
    setEditing(false);
  };

  return (
    <div className="visit-detail__tab-content">
      <div className="visit-detail__two-col">
        <SectionCard
          title="Visit Details"
          actions={
            <button className="section-card__edit-btn" onClick={() => setEditing(true)}>
              <Pencil size={12} /> Edit
            </button>
          }
        >
          <div className="visit-detail__field-list">
            <Field label="Client Company" value={visit.company} />
            <Field label="Purpose" value={visit.purpose} />
            <Field label="Arrival Date" value={visit.arrivalDate} />
            <Field label="Departure Date" value={visit.departureDate} />
            <Field label="Office Days" value={visit.officeDays.join(', ') || 'TBC'} />
            <Field label="Visit Lead" value={visit.visitLead} />
            <Field label="Coordinator" value={visit.operationsCoordinator || 'TBC'} />
            <Field label="Hotel" value={visit.hotelName || 'TBC'} />
            <Field label="Hotel Address" value={visit.hotelAddress || 'TBC'} />
            <Field label="Flight Details" value={visit.flightDetails || 'TBC'} />
          </div>
        </SectionCard>

        <div className="visit-detail__side-col">
          <SectionCard title="Visit Goals">
            <div className="visit-detail__text-block">{visit.visitGoals || 'Not specified'}</div>
          </SectionCard>
          <SectionCard title="Special Requirements">
            <div className="visit-detail__text-block">{visit.specialRequirements || 'None'}</div>
          </SectionCard>
          <SectionCard title="Social Activities">
            <div className="visit-detail__text-block">{visit.socialActivities || 'Not planned'}</div>
          </SectionCard>
        </div>
      </div>

      {editing && (
        <Modal title="Edit Visit Details" onClose={() => setEditing(false)} onSubmit={save} submitLabel="Save Changes" width={640}>
          <div className="modal-row">
            <div className="modal-field"><label>Client Company</label><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="modal-field"><label>Primary Contact</label><input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} /></div>
          </div>
          <div className="modal-field"><label>Purpose of Visit</label><input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Arrival Date</label><input type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} /></div>
            <div className="modal-field"><label>Departure Date</label><input type="date" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} /></div>
          </div>
          <div className="modal-field"><label>Office Days (comma-separated)</label><input value={form.officeDays} onChange={e => setForm(f => ({ ...f, officeDays: e.target.value }))} placeholder="2026-03-17, 2026-03-18" /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Visit Lead</label><input value={form.visitLead} onChange={e => setForm(f => ({ ...f, visitLead: e.target.value }))} /></div>
            <div className="modal-field"><label>Coordinator</label><input value={form.operationsCoordinator} onChange={e => setForm(f => ({ ...f, operationsCoordinator: e.target.value }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Flight Details</label><input value={form.flightDetails} onChange={e => setForm(f => ({ ...f, flightDetails: e.target.value }))} /></div>
            <div className="modal-field"><label>Hotel Name</label><input value={form.hotelName} onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} /></div>
          </div>
          <div className="modal-field"><label>Hotel Address</label><input value={form.hotelAddress} onChange={e => setForm(f => ({ ...f, hotelAddress: e.target.value }))} /></div>
          <div className="modal-field"><label>Visit Goals</label><textarea rows={3} value={form.visitGoals} onChange={e => setForm(f => ({ ...f, visitGoals: e.target.value }))} /></div>
          <div className="modal-field"><label>Special Requirements</label><textarea rows={2} value={form.specialRequirements} onChange={e => setForm(f => ({ ...f, specialRequirements: e.target.value }))} /></div>
          <div className="modal-field"><label>Social Activities</label><textarea rows={2} value={form.socialActivities} onChange={e => setForm(f => ({ ...f, socialActivities: e.target.value }))} /></div>
        </Modal>
      )}
    </div>
  );
}

/* ─── ATTENDEES ─────────────────────────────────────────────────────────── */
function AttendeesTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const addClientAttendee = useAppStore(s => s.addClientAttendee);
  const updateClientAttendee = useAppStore(s => s.updateClientAttendee);
  const deleteClientAttendee = useAppStore(s => s.deleteClientAttendee);
  const addInternalAttendee = useAppStore(s => s.addInternalAttendee);
  const updateInternalAttendee = useAppStore(s => s.updateInternalAttendee);
  const deleteInternalAttendee = useAppStore(s => s.deleteInternalAttendee);
  const toggleAttendeeConfirmed = useAppStore(s => s.toggleAttendeeConfirmed);

  type ClientForm = { name: string; role: string; email: string; phone: string; dietaryRequirements: string; accessibilityRequirements: string; specialRequests: string; };
  type InternalForm = { name: string; role: string; department: string; location: 'Manila' | 'Remote'; email: string; phone: string; managerConfirmed: boolean; travelRequired: boolean; accommodationRequired: boolean; };

  const blankClient: ClientForm = { name: '', role: '', email: '', phone: '', dietaryRequirements: '', accessibilityRequirements: '', specialRequests: '' };
  const blankInternal: InternalForm = { name: '', role: '', department: '', location: 'Manila', email: '', phone: '', managerConfirmed: false, travelRequired: false, accommodationRequired: false };

  const [clientModal, setClientModal] = useState<{ open: boolean; editId?: string; form: ClientForm }>({ open: false, form: blankClient });
  const [internalModal, setInternalModal] = useState<{ open: boolean; editId?: string; form: InternalForm }>({ open: false, form: blankInternal });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'client' | 'internal'; id: string } | null>(null);

  const saveClient = () => {
    if (clientModal.editId) updateClientAttendee(visitId, clientModal.editId, { ...clientModal.form, company: visit.company, id: clientModal.editId });
    else addClientAttendee(visitId, { ...clientModal.form, company: visit.company });
    setClientModal({ open: false, form: blankClient });
  };

  const saveInternal = () => {
    if (internalModal.editId) updateInternalAttendee(visitId, internalModal.editId, { ...internalModal.form, attendanceConfirmed: false });
    else addInternalAttendee(visitId, { ...internalModal.form, attendanceConfirmed: false });
    setInternalModal({ open: false, form: blankInternal });
  };

  return (
    <div className="visit-detail__tab-content">
      <SectionCard
        title={`Client Attendees (${visit.clientAttendees.length})`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setClientModal({ open: true, form: blankClient })}>
            <Plus size={12} /> Add Attendee
          </button>
        }
      >
        {visit.clientAttendees.length === 0 ? (
          <p className="section-card__empty">No client attendees — click Add Attendee to start</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Dietary</th><th></th></tr></thead>
            <tbody>
              {visit.clientAttendees.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.role}</td>
                  <td>{a.email}</td>
                  <td>{a.phone}</td>
                  <td>{a.dietaryRequirements || '—'}</td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setClientModal({ open: true, editId: a.id, form: { name: a.name, role: a.role, email: a.email, phone: a.phone, dietaryRequirements: a.dietaryRequirements || '', accessibilityRequirements: a.accessibilityRequirements || '', specialRequests: a.specialRequests || '' } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setDeleteConfirm({ type: 'client', id: a.id })}>
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

      <SectionCard
        title={`Internal Attendees (${visit.internalAttendees.length})`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setInternalModal({ open: true, form: blankInternal })}>
            <Plus size={12} /> Add Attendee
          </button>
        }
      >
        {visit.internalAttendees.length === 0 ? (
          <p className="section-card__empty">No internal attendees — click Add Attendee to start</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Name</th><th>Role</th><th>Location</th><th>Attendance</th><th>Manager OK</th><th>Travel</th><th></th></tr></thead>
            <tbody>
              {visit.internalAttendees.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.role}</td>
                  <td>
                    <span className={`visit-detail__location ${a.location === 'Remote' ? 'remote' : ''}`}>
                      <MapPin size={12} /> {a.location}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleAttendeeConfirmed(visitId, a.id)}
                      className={`visit-detail__confirm-btn ${a.attendanceConfirmed ? 'confirmed' : 'pending'}`}
                      title="Click to toggle confirmation"
                    >
                      {a.attendanceConfirmed
                        ? <><CheckCircle size={13} /> Confirmed</>
                        : <><AlertTriangle size={13} /> Pending</>
                      }
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => updateInternalAttendee(visitId, a.id, { managerConfirmed: !a.managerConfirmed })}
                      className={`visit-detail__confirm-btn ${a.managerConfirmed ? 'confirmed' : 'pending'}`}
                      title="Click to toggle manager approval"
                    >
                      {a.managerConfirmed ? '✓ Yes' : '✗ No'}
                    </button>
                  </td>
                  <td>{a.travelRequired ? '✈ Yes' : '—'}</td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setInternalModal({ open: true, editId: a.id, form: { name: a.name, role: a.role, department: a.department, location: a.location, email: a.email, phone: a.phone, managerConfirmed: a.managerConfirmed, travelRequired: a.travelRequired, accommodationRequired: a.accommodationRequired } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setDeleteConfirm({ type: 'internal', id: a.id })}>
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

      {clientModal.open && (
        <Modal title={clientModal.editId ? 'Edit Client Attendee' : 'Add Client Attendee'} onClose={() => setClientModal({ open: false, form: blankClient })} onSubmit={saveClient}>
          <div className="modal-row">
            <div className="modal-field"><label>Full Name *</label><input value={clientModal.form.name} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))} placeholder="Thomas Harrison" /></div>
            <div className="modal-field"><label>Role / Title *</label><input value={clientModal.form.role} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, role: e.target.value } }))} placeholder="Chief Product Officer" /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Email</label><input type="email" value={clientModal.form.email} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, email: e.target.value } }))} /></div>
            <div className="modal-field"><label>Phone / WhatsApp</label><input value={clientModal.form.phone} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, phone: e.target.value } }))} /></div>
          </div>
          <div className="modal-field">
            <label>Dietary Requirements</label>
            <select value={clientModal.form.dietaryRequirements} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, dietaryRequirements: e.target.value } }))}>
              {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="modal-field"><label>Accessibility Requirements</label><input value={clientModal.form.accessibilityRequirements} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, accessibilityRequirements: e.target.value } }))} /></div>
          <div className="modal-field"><label>Special Requests</label><textarea rows={2} value={clientModal.form.specialRequests} onChange={e => setClientModal(m => ({ ...m, form: { ...m.form, specialRequests: e.target.value } }))} /></div>
        </Modal>
      )}

      {internalModal.open && (
        <Modal title={internalModal.editId ? 'Edit Internal Attendee' : 'Add Internal Attendee'} onClose={() => setInternalModal({ open: false, form: blankInternal })} onSubmit={saveInternal}>
          <div className="modal-row">
            <div className="modal-field"><label>Full Name *</label><input value={internalModal.form.name} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))} /></div>
            <div className="modal-field"><label>Role / Title *</label><input value={internalModal.form.role} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, role: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Department</label><input value={internalModal.form.department} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, department: e.target.value } }))} /></div>
            <div className="modal-field"><label>Location</label>
              <select value={internalModal.form.location} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, location: e.target.value as 'Manila' | 'Remote' } }))}>
                <option value="Manila">Manila</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Email</label><input type="email" value={internalModal.form.email} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, email: e.target.value } }))} /></div>
            <div className="modal-field"><label>Phone</label><input value={internalModal.form.phone} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, phone: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={internalModal.form.travelRequired} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, travelRequired: e.target.checked } }))} style={{ width: 'auto' }} />
              Travel Required
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={internalModal.form.accommodationRequired} onChange={e => setInternalModal(m => ({ ...m, form: { ...m.form, accommodationRequired: e.target.checked } }))} style={{ width: 'auto' }} />
              Accommodation Required
            </label>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteConfirm(null)} onSubmit={() => {
          if (deleteConfirm.type === 'client') deleteClientAttendee(visitId, deleteConfirm.id);
          else deleteInternalAttendee(visitId, deleteConfirm.id);
          setDeleteConfirm(null);
        }} submitLabel="Delete" submitDestructive>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Are you sure you want to remove this attendee?</p>
        </Modal>
      )}
    </div>
  );
}

/* ─── LOGISTICS ─────────────────────────────────────────────────────────── */
function LogisticsTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const addTransport = useAppStore(s => s.addTransport);
  const updateTransport = useAppStore(s => s.updateTransport);
  const deleteTransport = useAppStore(s => s.deleteTransport);
  const setTransportStatus = useAppStore(s => s.setTransportStatus);
  const addAccommodation = useAppStore(s => s.addAccommodation);
  const updateAccommodation = useAppStore(s => s.updateAccommodation);
  const deleteAccommodation = useAppStore(s => s.deleteAccommodation);

  type TForm = { date: string; pickupLocation: string; dropoffLocation: string; pickupTime: string; driverName: string; driverContact: string; vehicleType: string; vehicleReg: string; status: BookingStatus; notes: string; cost: string; currency: string; };
  type AForm = { guestName: string; hotelName: string; hotelAddress: string; checkIn: string; checkOut: string; roomType: string; confirmationNumber: string; status: BookingStatus; cost: string; currency: string; };

  const blankT: TForm = { date: '', pickupLocation: '', dropoffLocation: '', pickupTime: '', driverName: '', driverContact: '', vehicleType: '', vehicleReg: '', status: 'Pending', notes: '', cost: '', currency: 'PHP' };
  const blankA: AForm = { guestName: '', hotelName: visit.hotelName || '', hotelAddress: visit.hotelAddress || '', checkIn: visit.arrivalDate, checkOut: visit.departureDate, roomType: '', confirmationNumber: '', status: 'Pending', cost: '', currency: 'PHP' };

  const [tModal, setTModal] = useState<{ open: boolean; editId?: string; form: TForm }>({ open: false, form: blankT });
  const [aModal, setAModal] = useState<{ open: boolean; editId?: string; form: AForm }>({ open: false, form: blankA });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'transport' | 'accom'; id: string } | null>(null);

  const saveTransport = () => {
    const payload = { ...tModal.form, cost: tModal.form.cost ? Number(tModal.form.cost) : undefined };
    if (tModal.editId) updateTransport(visitId, tModal.editId, payload);
    else addTransport(visitId, payload);
    setTModal({ open: false, form: blankT });
  };

  const saveAccom = () => {
    const payload = { ...aModal.form, cost: aModal.form.cost ? Number(aModal.form.cost) : undefined };
    if (aModal.editId) updateAccommodation(visitId, aModal.editId, payload);
    else addAccommodation(visitId, payload);
    setAModal({ open: false, form: blankA });
  };

  return (
    <div className="visit-detail__tab-content">
      <SectionCard
        title={`Transport Bookings (${visit.transportBookings.length})`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setTModal({ open: true, form: blankT })}>
            <Plus size={12} /> Add Booking
          </button>
        }
      >
        {visit.transportBookings.length === 0 ? (
          <p className="section-card__empty">No transport bookings — arrange airport transfer and daily transport</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Date</th><th>Pickup</th><th>Dropoff</th><th>Time</th><th>Driver</th><th>Contact</th><th>Vehicle</th><th>Status</th><th>Cost</th><th></th></tr></thead>
            <tbody>
              {visit.transportBookings.map(b => (
                <tr key={b.id}>
                  <td>{b.date}</td>
                  <td>{b.pickupLocation}</td>
                  <td>{b.dropoffLocation}</td>
                  <td>{b.pickupTime}</td>
                  <td style={{ fontWeight: 600 }}>{b.driverName}</td>
                  <td>{b.driverContact}</td>
                  <td>{b.vehicleType}{b.vehicleReg ? ` (${b.vehicleReg})` : ''}</td>
                  <td>
                    <select
                      value={b.status}
                      onChange={e => setTransportStatus(visitId, b.id, e.target.value as BookingStatus)}
                      className="visit-detail__inline-select"
                    >
                      {(['Pending', 'Booked', 'Confirmed', 'Cancelled'] as BookingStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{b.currency} {b.cost?.toLocaleString()}</td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setTModal({ open: true, editId: b.id, form: { date: b.date, pickupLocation: b.pickupLocation, dropoffLocation: b.dropoffLocation, pickupTime: b.pickupTime, driverName: b.driverName, driverContact: b.driverContact, vehicleType: b.vehicleType, vehicleReg: b.vehicleReg || '', status: b.status, notes: b.notes || '', cost: b.cost?.toString() || '', currency: b.currency || 'PHP' } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setDeleteConfirm({ type: 'transport', id: b.id })}>
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

      <SectionCard
        title={`Accommodation (${visit.accommodationBookings.length})`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setAModal({ open: true, form: blankA })}>
            <Plus size={12} /> Add Booking
          </button>
        }
      >
        {visit.accommodationBookings.length === 0 ? (
          <p className="section-card__empty">No accommodation bookings</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Guest</th><th>Hotel</th><th>Check-In</th><th>Check-Out</th><th>Room</th><th>Confirmation</th><th>Status</th><th>Cost</th><th></th></tr></thead>
            <tbody>
              {visit.accommodationBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.guestName}</td>
                  <td>{b.hotelName}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td>{b.roomType}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{b.confirmationNumber || '—'}</td>
                  <td><Badge label={b.status} /></td>
                  <td>{b.currency} {b.cost?.toLocaleString()}</td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setAModal({ open: true, editId: b.id, form: { guestName: b.guestName, hotelName: b.hotelName, hotelAddress: b.hotelAddress, checkIn: b.checkIn, checkOut: b.checkOut, roomType: b.roomType, confirmationNumber: b.confirmationNumber || '', status: b.status, cost: b.cost?.toString() || '', currency: b.currency || 'PHP' } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setDeleteConfirm({ type: 'accom', id: b.id })}>
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

      {tModal.open && (
        <Modal title={tModal.editId ? 'Edit Transport Booking' : 'Add Transport Booking'} onClose={() => setTModal({ open: false, form: blankT })} onSubmit={saveTransport} width={640}>
          <div className="modal-row">
            <div className="modal-field"><label>Date *</label><input type="date" value={tModal.form.date} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, date: e.target.value } }))} /></div>
            <div className="modal-field"><label>Pickup Time</label><input type="time" value={tModal.form.pickupTime} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, pickupTime: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Pickup Location *</label><input value={tModal.form.pickupLocation} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, pickupLocation: e.target.value } }))} placeholder="e.g. NAIA Terminal 3" /></div>
            <div className="modal-field"><label>Dropoff Location *</label><input value={tModal.form.dropoffLocation} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, dropoffLocation: e.target.value } }))} placeholder="e.g. Seda BGC" /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Driver Name *</label><input value={tModal.form.driverName} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, driverName: e.target.value } }))} /></div>
            <div className="modal-field"><label>Driver Contact</label><input value={tModal.form.driverContact} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, driverContact: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Vehicle Type</label><input value={tModal.form.vehicleType} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, vehicleType: e.target.value } }))} placeholder="e.g. Toyota HiAce Van" /></div>
            <div className="modal-field"><label>Vehicle Registration</label><input value={tModal.form.vehicleReg} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, vehicleReg: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Status</label>
              <select value={tModal.form.status} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, status: e.target.value as BookingStatus } }))}>
                {(['Pending', 'Booked', 'Confirmed', 'Cancelled'] as BookingStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-field"><label>Cost (PHP)</label><input type="number" value={tModal.form.cost} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, cost: e.target.value } }))} /></div>
          </div>
          <div className="modal-field"><label>Notes</label><textarea rows={2} value={tModal.form.notes} onChange={e => setTModal(m => ({ ...m, form: { ...m.form, notes: e.target.value } }))} /></div>
        </Modal>
      )}

      {aModal.open && (
        <Modal title={aModal.editId ? 'Edit Accommodation' : 'Add Accommodation Booking'} onClose={() => setAModal({ open: false, form: blankA })} onSubmit={saveAccom} width={580}>
          <div className="modal-row">
            <div className="modal-field"><label>Guest Name *</label><input value={aModal.form.guestName} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, guestName: e.target.value } }))} /></div>
            <div className="modal-field"><label>Room Type</label><input value={aModal.form.roomType} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, roomType: e.target.value } }))} placeholder="e.g. Deluxe King" /></div>
          </div>
          <div className="modal-field"><label>Hotel Name *</label><input value={aModal.form.hotelName} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, hotelName: e.target.value } }))} /></div>
          <div className="modal-field"><label>Hotel Address</label><input value={aModal.form.hotelAddress} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, hotelAddress: e.target.value } }))} /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Check-In *</label><input type="date" value={aModal.form.checkIn} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, checkIn: e.target.value } }))} /></div>
            <div className="modal-field"><label>Check-Out *</label><input type="date" value={aModal.form.checkOut} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, checkOut: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Confirmation Number</label><input value={aModal.form.confirmationNumber} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, confirmationNumber: e.target.value } }))} /></div>
            <div className="modal-field"><label>Cost (PHP)</label><input type="number" value={aModal.form.cost} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, cost: e.target.value } }))} /></div>
          </div>
          <div className="modal-field"><label>Status</label>
            <select value={aModal.form.status} onChange={e => setAModal(m => ({ ...m, form: { ...m.form, status: e.target.value as BookingStatus } }))}>
              {(['Pending', 'Booked', 'Confirmed', 'Cancelled'] as BookingStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteConfirm(null)} onSubmit={() => {
          if (deleteConfirm.type === 'transport') deleteTransport(visitId, deleteConfirm.id);
          else deleteAccommodation(visitId, deleteConfirm.id);
          setDeleteConfirm(null);
        }} submitLabel="Delete" submitDestructive>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Are you sure you want to delete this booking?</p>
        </Modal>
      )}
    </div>
  );
}

/* ─── OFFICE READINESS ──────────────────────────────────────────────────── */
function OfficeTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const toggleOfficeReadiness = useAppStore(s => s.toggleOfficeReadiness);
  const addOfficeReadinessItem = useAppStore(s => s.addOfficeReadinessItem);
  const deleteOfficeReadinessItem = useAppStore(s => s.deleteOfficeReadinessItem);
  const loadOfficeTemplate = useAppStore(s => s.loadOfficeTemplate);

  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'AV & Tech' as const, item: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const completedCount = visit.officeReadiness.filter(o => o.completed).length;
  const total = visit.officeReadiness.length;
  const categories = [...new Set(visit.officeReadiness.map(o => o.category))];

  return (
    <div className="visit-detail__tab-content">
      <SectionCard
        title={`Office Readiness — ${completedCount}/${total} complete`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ProgressBar value={completedCount} max={Math.max(total, 1)} />
            {total === 0 && (
              <button className="section-card__edit-btn" onClick={() => loadOfficeTemplate(visitId)}>
                Load Template
              </button>
            )}
            <button className="section-card__edit-btn" onClick={() => setAddModal(true)}>
              <Plus size={12} /> Add Item
            </button>
          </div>
        }
      >
        {total === 0 ? (
          <p className="section-card__empty">No checklist items — click "Load Template" to add standard items or "Add Item" to add manually</p>
        ) : (
          <div className="visit-detail__checklist">
            {categories.map(cat => (
              <div key={cat} className="visit-detail__checklist-group">
                <div className="visit-detail__checklist-category">{cat}</div>
                {visit.officeReadiness.filter(o => o.category === cat).map(item => (
                  <div key={item.id} className={`visit-detail__checklist-item ${item.completed ? 'done' : 'pending'}`}>
                    <button
                      className="visit-detail__checklist-toggle"
                      onClick={() => toggleOfficeReadiness(visitId, item.id, 'Nabil Sabin')}
                      title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {item.completed ? <CheckCircle size={18} /> : <CheckSquare size={18} />}
                    </button>
                    <span className="visit-detail__checklist-text">{item.item}</span>
                    {item.completed && item.completedBy && (
                      <span className="visit-detail__checklist-meta">{item.completedBy}</span>
                    )}
                    <button
                      className="visit-detail__action-btn visit-detail__action-btn--delete"
                      style={{ marginLeft: 'auto', opacity: 0.5 }}
                      onClick={() => setConfirmDelete({ id: item.id, label: item.item })}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {confirmDelete && (
        <ConfirmModal
          title="Remove Item"
          message={<>Are you sure you want to remove <strong>{confirmDelete.label}</strong>? This cannot be undone.</>}
          onConfirm={() => { deleteOfficeReadinessItem(visitId, confirmDelete.id); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {addModal && (
        <Modal title="Add Readiness Item" onClose={() => setAddModal(false)} onSubmit={() => {
          if (newItem.item.trim()) {
            addOfficeReadinessItem(visitId, { category: newItem.category, item: newItem.item, completed: false });
            setNewItem({ category: 'AV & Tech', item: '' });
            setAddModal(false);
          }
        }}>
          <div className="modal-field">
            <label>Category</label>
            <select value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value as typeof newItem.category }))}>
              <option>AV & Tech</option>
              <option>Hospitality</option>
              <option>Access & Facilities</option>
              <option>Communication</option>
              <option>Signage</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Item Description *</label>
            <input value={newItem.item} onChange={e => setNewItem(n => ({ ...n, item: e.target.value }))} placeholder="e.g. Wi-Fi tested and credentials documented" />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── COMMUNICATIONS ────────────────────────────────────────────────────── */
function CommsTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const addCommunication = useAppStore(s => s.addCommunication);
  const updateCommunication = useAppStore(s => s.updateCommunication);
  const deleteCommunication = useAppStore(s => s.deleteCommunication);

  type CForm = { type: string; subject: string; recipient: string; channel: string; status: CommStatus; notes: string; sentAt: string; };
  const blank: CForm = { type: 'Initial Planning', subject: '', recipient: '', channel: 'Email', status: 'Draft', notes: '', sentAt: '' };
  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: CForm }>({ open: false, form: blank });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const save = () => {
    const payload = {
      ...modal.form,
      type: modal.form.type as CForm['type'],
      channel: modal.form.channel as 'Email' | 'WhatsApp' | 'Phone' | 'Slack',
      sentAt: modal.form.sentAt || (modal.form.status === 'Sent' ? new Date().toISOString() : undefined),
    };
    if (modal.editId) updateCommunication(visitId, modal.editId, payload as Parameters<typeof updateCommunication>[2]);
    else addCommunication(visitId, payload as Parameters<typeof addCommunication>[1]);
    setModal({ open: false, form: blank });
  };

  return (
    <div className="visit-detail__tab-content">
      <SectionCard
        title={`Communication Log (${visit.communications.length})`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setModal({ open: true, form: blank })}>
            <Plus size={12} /> Log Communication
          </button>
        }
      >
        {visit.communications.length === 0 ? (
          <p className="section-card__empty">No communications logged — click to add</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Type</th><th>Subject</th><th>Recipient</th><th>Channel</th><th>Sent</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {visit.communications.map(c => (
                <tr key={c.id}>
                  <td><Badge label={c.type} /></td>
                  <td>{c.subject}</td>
                  <td>{c.recipient}</td>
                  <td>{c.channel}</td>
                  <td>{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                  <td><Badge label={c.status} /></td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setModal({ open: true, editId: c.id, form: { type: c.type, subject: c.subject, recipient: c.recipient, channel: c.channel, status: c.status, notes: c.notes || '', sentAt: c.sentAt ? c.sentAt.slice(0, 10) : '' } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setConfirmDelete({ id: c.id, label: c.subject })}>
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete Communication"
          message={<>Are you sure you want to delete <strong>{confirmDelete.label}</strong>? This cannot be undone.</>}
          onConfirm={() => { deleteCommunication(visitId, confirmDelete.id); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {modal.open && (
        <Modal title={modal.editId ? 'Edit Communication' : 'Log Communication'} onClose={() => setModal({ open: false, form: blank })} onSubmit={save} width={560}>
          <div className="modal-row">
            <div className="modal-field"><label>Type</label>
              <select value={modal.form.type} onChange={e => setModal(m => ({ ...m, form: { ...m.form, type: e.target.value } }))}>
                {['Initial Planning', 'Itinerary Confirmation', 'Day-Before Reminder', 'Day-Of Check-In', 'Thank-You', 'Follow-Up', 'Internal', 'Ad Hoc'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="modal-field"><label>Channel</label>
              <select value={modal.form.channel} onChange={e => setModal(m => ({ ...m, form: { ...m.form, channel: e.target.value } }))}>
                {['Email', 'WhatsApp', 'Phone', 'Slack'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field"><label>Subject *</label><input value={modal.form.subject} onChange={e => setModal(m => ({ ...m, form: { ...m.form, subject: e.target.value } }))} /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Recipient</label><input value={modal.form.recipient} onChange={e => setModal(m => ({ ...m, form: { ...m.form, recipient: e.target.value } }))} /></div>
            <div className="modal-field"><label>Status</label>
              <select value={modal.form.status} onChange={e => setModal(m => ({ ...m, form: { ...m.form, status: e.target.value as CommStatus } }))}>
                {(['Draft', 'Sent', 'Delivered', 'Failed'] as CommStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field"><label>Date Sent</label><input type="date" value={modal.form.sentAt} onChange={e => setModal(m => ({ ...m, form: { ...m.form, sentAt: e.target.value } }))} /></div>
          <div className="modal-field"><label>Notes</label><textarea rows={2} value={modal.form.notes} onChange={e => setModal(m => ({ ...m, form: { ...m.form, notes: e.target.value } }))} /></div>
        </Modal>
      )}
    </div>
  );
}

/* ─── EXPENSES ──────────────────────────────────────────────────────────── */
function ExpensesTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const addExpense = useAppStore(s => s.addExpense);
  const updateExpense = useAppStore(s => s.updateExpense);
  const deleteExpense = useAppStore(s => s.deleteExpense);
  const setExpenseStatus = useAppStore(s => s.setExpenseStatus);

  type EForm = { claimantName: string; category: string; description: string; amount: string; currency: string; date: string; receiptAttached: boolean; receiptFile?: ReceiptFile; status: ExpenseStatus; exceptionReason: string; };
  const blank: EForm = { claimantName: '', category: 'Transport', description: '', amount: '', currency: 'PHP', date: '', receiptAttached: false, receiptFile: undefined, status: 'Submitted', exceptionReason: '' };
  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: EForm }>({ open: false, form: blank });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; desc: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = visit.expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setModal(m => ({ ...m, form: { ...m.form, receiptFile: { name: file.name, type: file.type, dataUrl }, receiptAttached: true } }));
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const payload = { ...modal.form, amount: Number(modal.form.amount), category: modal.form.category as Parameters<typeof addExpense>[1]['category'], receiptFile: modal.form.receiptFile ?? undefined };
    if (modal.editId) updateExpense(visitId, modal.editId, payload);
    else addExpense(visitId, payload as Parameters<typeof addExpense>[1]);
    setModal({ open: false, form: blank });
  };

  return (
    <div className="visit-detail__tab-content">
      <SectionCard
        title={`Expense Claims (${visit.expenses.length}) — Total: PHP ${total.toLocaleString()}`}
        actions={
          <button className="section-card__edit-btn" onClick={() => setModal({ open: true, form: blank })}>
            <Plus size={12} /> Add Claim
          </button>
        }
      >
        {visit.expenses.length === 0 ? (
          <p className="section-card__empty">No expense claims — click to add</p>
        ) : (
          <table className="visit-detail__table">
            <thead><tr><th>Claimant</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Receipt</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {visit.expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.claimantName}</td>
                  <td>{e.category}</td>
                  <td>{e.description}</td>
                  <td style={{ fontWeight: 600 }}>{e.currency} {e.amount.toLocaleString()}</td>
                  <td>{e.date}</td>
                  <td>
                    {e.receiptFile
                      ? <button className="visit-detail__receipt-view" onClick={() => openReceipt(e.receiptFile!)} title={e.receiptFile.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1e8449', background: 'none', border: '1px solid #1e8449', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>
                          <CheckCircle size={11} /> View
                        </button>
                      : <button
                          onClick={() => updateExpense(visitId, e.id, { receiptAttached: !e.receiptAttached })}
                          className={`visit-detail__confirm-btn ${e.receiptAttached ? 'confirmed' : 'pending'}`}
                        >
                          {e.receiptAttached ? <><CheckCircle size={12} /> Yes</> : <><AlertTriangle size={12} /> Missing</>}
                        </button>
                    }
                  </td>
                  <td>
                    <select
                      value={e.status}
                      onChange={ev => setExpenseStatus(visitId, e.id, ev.target.value as ExpenseStatus, 'Nabil Sabin')}
                      className="visit-detail__inline-select"
                    >
                      {(['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'] as ExpenseStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="visit-detail__row-actions">
                      <button className="visit-detail__action-btn" onClick={() => setModal({ open: true, editId: e.id, form: { claimantName: e.claimantName, category: e.category, description: e.description, amount: e.amount.toString(), currency: e.currency, date: e.date, receiptAttached: e.receiptAttached, receiptFile: e.receiptFile, status: e.status, exceptionReason: e.exceptionReason || '' } })}>
                        <Pencil size={13} />
                      </button>
                      <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => { setDeleteConfirm({ id: e.id, desc: e.description }); setDeleteReason(''); }}>
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
        <Modal title={modal.editId ? 'Edit Expense Claim' : 'Add Expense Claim'} onClose={() => setModal({ open: false, form: blank })} onSubmit={save} width={560}>
          <div className="modal-row">
            <div className="modal-field"><label>Claimant Name *</label><input value={modal.form.claimantName} onChange={e => setModal(m => ({ ...m, form: { ...m.form, claimantName: e.target.value } }))} /></div>
            <div className="modal-field"><label>Category</label>
              <select value={modal.form.category} onChange={e => setModal(m => ({ ...m, form: { ...m.form, category: e.target.value } }))}>
                {['Transport', 'Accommodation', 'Meals', 'Incidentals', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field"><label>Description *</label><input value={modal.form.description} onChange={e => setModal(m => ({ ...m, form: { ...m.form, description: e.target.value } }))} /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Amount *</label><input type="number" value={modal.form.amount} onChange={e => setModal(m => ({ ...m, form: { ...m.form, amount: e.target.value } }))} /></div>
            <div className="modal-field"><label>Currency</label>
              <select value={modal.form.currency} onChange={e => setModal(m => ({ ...m, form: { ...m.form, currency: e.target.value } }))}>
                <option>PHP</option><option>AUD</option><option>USD</option>
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Date *</label><input type="date" value={modal.form.date} onChange={e => setModal(m => ({ ...m, form: { ...m.form, date: e.target.value } }))} /></div>
          </div>
          <div className="modal-field">
            <label>Receipt</label>
            <div
              className="expenses-list__upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              {modal.form.receiptFile
                ? <span className="expenses-list__upload-attached"><span>📎</span> {modal.form.receiptFile.name}<button onClick={e => { e.stopPropagation(); setModal(m => ({ ...m, form: { ...m.form, receiptFile: undefined, receiptAttached: false } })); }} className="expenses-list__upload-clear">✕</button></span>
                : <span className="expenses-list__upload-hint"><span>📎</span> Click or drag to attach receipt (image or PDF)</span>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>
          {!modal.form.receiptAttached && (
            <div className="modal-field"><label>Exception Reason (if no receipt)</label><textarea rows={2} value={modal.form.exceptionReason} onChange={e => setModal(m => ({ ...m, form: { ...m.form, exceptionReason: e.target.value } }))} placeholder="Document reason for exception approval" /></div>
          )}
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Delete Expense"
          onClose={() => { setDeleteConfirm(null); setDeleteReason(''); }}
          onSubmit={() => { if (deleteReason.trim()) { deleteExpense(visitId, deleteConfirm.id, deleteReason.trim()); setDeleteConfirm(null); setDeleteReason(''); } }}
          submitLabel="Delete"
          submitDestructive
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
            Deleting <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.desc}</strong>. A reason is required and will be recorded in the Deleted tab.
          </p>
          <div className="modal-field">
            <label>Reason for deletion *</label>
            <textarea rows={3} value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="e.g. Duplicate entry, incorrect amount..." style={{ resize: 'vertical' }} autoFocus />
          </div>
          {!deleteReason.trim() && <p style={{ fontSize: 11, color: '#c0392b', marginTop: 4 }}>A reason is required before deleting.</p>}
        </Modal>
      )}
    </div>
  );
}

/* ─── TASKS ─────────────────────────────────────────────────────────────── */
function TasksTab({ visitId }: { visitId: string }) {
  const visit = useAppStore(s => s.visits.find(v => v.id === visitId))!;
  const addTask = useAppStore(s => s.addTask);
  const updateTask = useAppStore(s => s.updateTask);
  const deleteTask = useAppStore(s => s.deleteTask);
  const setTaskStatus = useAppStore(s => s.setTaskStatus);

  type TForm = { title: string; description: string; assignedTo: string; dueDate: string; status: TaskStatus; phase: string; priority: string; };
  const blank: TForm = { title: '', description: '', assignedTo: '', dueDate: '', status: 'Not Started', phase: 'Pre-Arrival', priority: 'Medium' };
  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: TForm }>({ open: false, form: blank });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const save = () => {
    const payload = { ...modal.form, status: modal.form.status as TaskStatus, phase: modal.form.phase as Parameters<typeof addTask>[1]['phase'], priority: modal.form.priority as 'High' | 'Medium' | 'Low' };
    if (modal.editId) updateTask(visitId, modal.editId, payload);
    else addTask(visitId, payload);
    setModal({ open: false, form: blank });
  };

  const phases = [...new Set(visit.tasks.map(t => t.phase))];
  const allPhases = ['Initiation', 'Pre-Arrival', 'Logistics', 'Office Prep', 'Onsite', 'Post-Visit'];

  return (
    <div className="visit-detail__tab-content">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="section-card__edit-btn" onClick={() => setModal({ open: true, form: blank })}>
          <Plus size={12} /> Add Task
        </button>
      </div>

      {visit.tasks.length === 0 ? (
        <SectionCard title="Tasks"><p className="section-card__empty">No tasks added yet — click Add Task</p></SectionCard>
      ) : (
        phases.map(phase => (
          <SectionCard key={phase} title={`${phase} Tasks`}>
            <table className="visit-detail__table">
              <thead><tr><th>Task</th><th>Assigned To</th><th>Due Date</th><th>Priority</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {visit.tasks.filter(t => t.phase === phase).map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td>{t.assignedTo}</td>
                    <td>{t.dueDate}</td>
                    <td><Badge label={t.priority} variant="priority" /></td>
                    <td>
                      <select
                        value={t.status}
                        onChange={e => setTaskStatus(visitId, t.id, e.target.value as TaskStatus)}
                        className="visit-detail__inline-select"
                      >
                        {(['Not Started', 'In Progress', 'Completed', 'Blocked'] as TaskStatus[]).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="visit-detail__row-actions">
                        <button className="visit-detail__action-btn" onClick={() => setModal({ open: true, editId: t.id, form: { title: t.title, description: t.description || '', assignedTo: t.assignedTo, dueDate: t.dueDate, status: t.status, phase: t.phase, priority: t.priority } })}>
                          <Pencil size={13} />
                        </button>
                        <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setConfirmDelete({ id: t.id, label: t.title })}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        ))
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Task"
          message={<>Are you sure you want to delete the task <strong>{confirmDelete.label}</strong>? This cannot be undone.</>}
          onConfirm={() => { deleteTask(visitId, confirmDelete.id); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {modal.open && (
        <Modal title={modal.editId ? 'Edit Task' : 'Add Task'} onClose={() => setModal({ open: false, form: blank })} onSubmit={save} width={520}>
          <div className="modal-field"><label>Task Title *</label><input value={modal.form.title} onChange={e => setModal(m => ({ ...m, form: { ...m.form, title: e.target.value } }))} /></div>
          <div className="modal-field"><label>Description</label><textarea rows={2} value={modal.form.description} onChange={e => setModal(m => ({ ...m, form: { ...m.form, description: e.target.value } }))} /></div>
          <div className="modal-row">
            <div className="modal-field"><label>Assigned To *</label><input value={modal.form.assignedTo} onChange={e => setModal(m => ({ ...m, form: { ...m.form, assignedTo: e.target.value } }))} placeholder="e.g. Nabil Sabin" /></div>
            <div className="modal-field"><label>Due Date</label><input type="date" value={modal.form.dueDate} onChange={e => setModal(m => ({ ...m, form: { ...m.form, dueDate: e.target.value } }))} /></div>
          </div>
          <div className="modal-row">
            <div className="modal-field"><label>Phase</label>
              <select value={modal.form.phase} onChange={e => setModal(m => ({ ...m, form: { ...m.form, phase: e.target.value } }))}>
                {allPhases.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="modal-field"><label>Priority</label>
              <select value={modal.form.priority} onChange={e => setModal(m => ({ ...m, form: { ...m.form, priority: e.target.value } }))}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
          </div>
          <div className="modal-field"><label>Status</label>
            <select value={modal.form.status} onChange={e => setModal(m => ({ ...m, form: { ...m.form, status: e.target.value as TaskStatus } }))}>
              {(['Not Started', 'In Progress', 'Completed', 'Blocked'] as TaskStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="visit-detail__field">
      <span className="visit-detail__field-label">{label}</span>
      <span className="visit-detail__field-value">{value}</span>
    </div>
  );
}
