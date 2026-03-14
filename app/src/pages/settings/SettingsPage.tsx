import { useState } from 'react';
import { Settings, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

interface Policy {
  id: number;
  label: string;
  value: string;
  type: 'select' | 'number' | 'text';
  options?: string[];
  unit?: string;
}

interface User {
  id: number;
  name: string;
  role: string;
  access: string;
  permissions: string;
}

const ACCESS_LEVELS = ['Visit Lead', 'Ops Admin', 'Finance Approver', 'Read-only', 'Administrator'];

const INITIAL_POLICIES: Policy[] = [
  {
    id: 1, label: 'Receipt Required', value: 'Yes — mandatory for all claims', type: 'select',
    options: ['Yes — mandatory for all claims', 'No — optional', 'Yes — required above PHP 500'],
  },
  {
    id: 2, label: 'Meal Per Diem Cap', value: 'PHP 800/day', type: 'select',
    options: ['PHP 500/day', 'PHP 800/day', 'PHP 1,000/day', 'PHP 1,500/day', 'PHP 2,000/day', 'No cap'],
  },
  {
    id: 3, label: 'Transport Pre-approval', value: 'Required for all bookings > PHP 3,000', type: 'select',
    options: ['Required for all bookings', 'Required for all bookings > PHP 1,000', 'Required for all bookings > PHP 3,000', 'Required for all bookings > PHP 5,000', 'Not required'],
  },
  {
    id: 4, label: 'Accommodation Approval', value: 'Visit Lead sign-off required', type: 'select',
    options: ['Visit Lead sign-off required', 'Visit Lead + Manager sign-off required', 'Manager approval only', 'No approval required'],
  },
  {
    id: 5, label: 'Expense Submission Window', value: 'Within 5 business days of visit end', type: 'select',
    options: ['Within 2 business days of visit end', 'Within 5 business days of visit end', 'Within 7 business days of visit end', 'Within 14 business days of visit end', 'Within 30 days of visit end'],
  },
  {
    id: 6, label: 'Remote Staff Travel', value: 'Pre-approved, Visit Lead + Manager sign-off', type: 'select',
    options: ['Pre-approved, Visit Lead + Manager sign-off', 'Pre-approved, Visit Lead sign-off', 'Pre-approved, Manager sign-off only', 'No pre-approval required'],
  },
  {
    id: 7, label: 'Pre-arrival Checklist Deadline', value: '7 calendar days before arrival', type: 'select',
    options: ['3 calendar days before arrival', '5 calendar days before arrival', '7 calendar days before arrival', '10 calendar days before arrival', '14 calendar days before arrival'],
  },
  {
    id: 8, label: 'Office Readiness Deadline', value: '48 hours before first office day', type: 'select',
    options: ['24 hours before first office day', '48 hours before first office day', '72 hours before first office day', '1 week before first office day'],
  },
];

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Nabil Sabin', role: 'Head of Service Delivery', access: 'Visit Lead', permissions: 'Full access — create, edit, approve, close' },
  { id: 2, name: 'Maria Santos', role: 'Operations Coordinator', access: 'Ops Admin', permissions: 'Create, edit logistics, submit expenses' },
  { id: 3, name: 'Finance Team', role: 'Finance', access: 'Finance Approver', permissions: 'View and approve/reject expense claims' },
  { id: 4, name: 'Leadership', role: 'Executive', access: 'Read-only', permissions: 'View dashboards and reports only' },
];

const DEFAULT_PERMISSIONS: Record<string, string> = {
  'Administrator':      'Full system access including settings',
  'Visit Lead':         'Full access — create, edit, approve, close',
  'Ops Admin':          'Create, edit logistics, submit expenses',
  'Finance Approver':   'View and approve/reject expense claims',
  'Read-only':          'View dashboards and reports only',
};

export default function SettingsPage() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [policyValue, setPolicyValue] = useState('');

  const [editUser, setEditUser] = useState<User | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', role: '', access: 'Ops Admin', permissions: '' });
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  const openEditPolicy = (p: Policy) => {
    setEditPolicy(p);
    setPolicyValue(p.value);
  };

  const savePolicy = () => {
    if (!policyValue) return;
    setPolicies(ps => ps.map(p => p.id === editPolicy!.id ? { ...p, value: policyValue } : p));
    setEditPolicy(null);
  };

  const openEditUser = (u: User) => {
    setEditUser(u);
    setUserForm({ name: u.name, role: u.role, access: u.access, permissions: u.permissions });
  };

  const saveUser = () => {
    if (!userForm.name.trim()) return;
    setUsers(us => us.map(u => u.id === editUser!.id ? { ...u, ...userForm } : u));
    setEditUser(null);
  };

  const openAddUser = () => {
    setUserForm({ name: '', role: '', access: 'Ops Admin', permissions: DEFAULT_PERMISSIONS['Ops Admin'] });
    setAddUserOpen(true);
  };

  const addUser = () => {
    if (!userForm.name.trim()) return;
    setUsers(us => [...us, { id: Date.now(), ...userForm }]);
    setAddUserOpen(false);
  };

  const handleAccessChange = (access: string) => {
    setUserForm(f => ({ ...f, access, permissions: DEFAULT_PERMISSIONS[access] ?? f.permissions }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={<Settings size={20} />} title="Settings" />

      {/* Policies */}
      <SectionCard title="Standard Expense & Reimbursement Policy">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {policies.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--border)', gap: 16 }}>
              <span style={{ width: 240, fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{p.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{p.value}</span>
              <button
                style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: 4, padding: '3px 10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                onClick={() => openEditPolicy(p)}
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Users */}
      <SectionCard
        title="System Users & Roles"
        actions={
          <button className="section-card__edit-btn" onClick={openAddUser}>
            <Plus size={12} /> Add User
          </button>
        }
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Name', 'Role', 'Access Level', 'Permissions', ''].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 18px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '10px 18px', color: 'var(--text-secondary)' }}>{u.role}</td>
                <td style={{ padding: '10px 18px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-secondary)' }}>{u.access}</span>
                </td>
                <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', fontSize: 12 }}>{u.permissions}</td>
                <td style={{ padding: '10px 18px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="visit-detail__action-btn" onClick={() => openEditUser(u)}><Pencil size={13} /></button>
                    <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setConfirmDeleteUser(u)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Edit Policy Modal */}
      {editPolicy && (
        <Modal title={`Edit: ${editPolicy.label}`} onClose={() => setEditPolicy(null)} onSubmit={savePolicy} submitLabel="Save">
          <div className="modal-field">
            <label>{editPolicy.label}</label>
            <select value={policyValue} onChange={e => setPolicyValue(e.target.value)}>
              {editPolicy.options?.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)} onSubmit={saveUser} submitLabel="Save">
          <div className="modal-field"><label>Name *</label><input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="modal-field"><label>Role / Title</label><input value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} /></div>
          <div className="modal-field">
            <label>Access Level</label>
            <select value={userForm.access} onChange={e => handleAccessChange(e.target.value)}>
              {ACCESS_LEVELS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="modal-field"><label>Permissions</label><textarea rows={2} value={userForm.permissions} onChange={e => setUserForm(f => ({ ...f, permissions: e.target.value }))} /></div>
        </Modal>
      )}

      {/* Add User Modal */}
      {addUserOpen && (
        <Modal title="Add User" onClose={() => setAddUserOpen(false)} onSubmit={addUser} submitLabel="Add">
          <div className="modal-field"><label>Name *</label><input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Juan dela Cruz" /></div>
          <div className="modal-field"><label>Role / Title</label><input value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Operations Coordinator" /></div>
          <div className="modal-field">
            <label>Access Level</label>
            <select value={userForm.access} onChange={e => handleAccessChange(e.target.value)}>
              {ACCESS_LEVELS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="modal-field"><label>Permissions</label><textarea rows={2} value={userForm.permissions} onChange={e => setUserForm(f => ({ ...f, permissions: e.target.value }))} /></div>
        </Modal>
      )}

      {/* Confirm Delete User */}
      {confirmDeleteUser && (
        <ConfirmModal
          title="Remove User"
          message={<>Are you sure you want to remove <strong>{confirmDeleteUser.name}</strong>?</>}
          onConfirm={() => { setUsers(us => us.filter(u => u.id !== confirmDeleteUser.id)); setConfirmDeleteUser(null); }}
          onClose={() => setConfirmDeleteUser(null)}
        />
      )}
    </div>
  );
}
