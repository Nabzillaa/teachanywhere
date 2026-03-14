import { useState, useEffect } from 'react';
import { Settings, Pencil, Trash2, Plus, ShieldAlert, Users, Eye, EyeOff } from 'lucide-react';
import GroupsQuestionnaire from './GroupsQuestionnaire';
import AuditLog from './AuditLog';
import './SettingsPage.css';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import { db, firebaseConfig } from '../../lib/firebase';
import { logAudit } from '../../services/auditService';

interface Policy {
  id: number;
  label: string;
  value: string;
  type: 'select' | 'number' | 'text';
  options?: string[];
}

interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  role: string;
}

const ACCESS_LEVELS = ['Administrator', 'Finance Approver', 'Ops Admin', 'Read-only', 'Visit Lead'];

const INITIAL_POLICIES: Policy[] = [
  { id: 1, label: 'Receipt Required', value: 'Yes — mandatory for all claims', type: 'select', options: ['Yes — mandatory for all claims', 'No — optional', 'Yes — required above PHP 500'] },
  { id: 2, label: 'Meal Per Diem Cap', value: 'PHP 800/day', type: 'select', options: ['PHP 500/day', 'PHP 800/day', 'PHP 1,000/day', 'PHP 1,500/day', 'PHP 2,000/day', 'No cap'] },
  { id: 3, label: 'Transport Pre-approval', value: 'Required for all bookings > PHP 3,000', type: 'select', options: ['Required for all bookings', 'Required for all bookings > PHP 1,000', 'Required for all bookings > PHP 3,000', 'Required for all bookings > PHP 5,000', 'Not required'] },
  { id: 4, label: 'Accommodation Approval', value: 'Visit Lead sign-off required', type: 'select', options: ['Visit Lead sign-off required', 'Visit Lead + Manager sign-off required', 'Manager approval only', 'No approval required'] },
  { id: 5, label: 'Expense Submission Window', value: 'Within 5 business days of visit end', type: 'select', options: ['Within 2 business days of visit end', 'Within 5 business days of visit end', 'Within 7 business days of visit end', 'Within 14 business days of visit end', 'Within 30 days of visit end'] },
  { id: 6, label: 'Remote Staff Travel', value: 'Pre-approved, Visit Lead + Manager sign-off', type: 'select', options: ['Pre-approved, Visit Lead + Manager sign-off', 'Pre-approved, Visit Lead sign-off', 'Pre-approved, Manager sign-off only', 'No pre-approval required'] },
  { id: 7, label: 'Pre-arrival Checklist Deadline', value: '7 calendar days before arrival', type: 'select', options: ['3 calendar days before arrival', '5 calendar days before arrival', '7 calendar days before arrival', '10 calendar days before arrival', '14 calendar days before arrival'] },
  { id: 8, label: 'Office Readiness Deadline', value: '48 hours before first office day', type: 'select', options: ['24 hours before first office day', '48 hours before first office day', '72 hours before first office day', '1 week before first office day'] },
];

const ROLE_DEFINITIONS = [
  {
    role: 'Administrator',
    description: 'Full system access including user and settings management.',
    modules: [
      { name: 'Visits', level: 'full' }, { name: 'Expenses', level: 'full' },
      { name: 'Logistics', level: 'full' }, { name: 'Reports', level: 'full' },
      { name: 'Settings', level: 'full' }, { name: 'Communications', level: 'full' },
    ],
  },
  {
    role: 'Visit Lead',
    description: 'Manages visits end-to-end. Cannot access Settings.',
    modules: [
      { name: 'Visits', level: 'full' }, { name: 'Logistics', level: 'full' },
      { name: 'Attendees', level: 'full' }, { name: 'Communications', level: 'full' },
      { name: 'Expenses', level: 'view' }, { name: 'Settings', level: 'none' },
    ],
  },
  {
    role: 'Ops Admin',
    description: 'Handles logistics, office readiness, and expense submission.',
    modules: [
      { name: 'Logistics', level: 'full' }, { name: 'Office', level: 'full' },
      { name: 'Expenses', level: 'submit' }, { name: 'Communications', level: 'full' },
      { name: 'Visits', level: 'view' }, { name: 'Settings', level: 'none' },
    ],
  },
  {
    role: 'Finance Approver',
    description: 'Views and approves or rejects expense claims and reports.',
    modules: [
      { name: 'Expenses', level: 'full' }, { name: 'Reports', level: 'full' },
      { name: 'Dashboard', level: 'view' }, { name: 'Visits', level: 'none' },
      { name: 'Logistics', level: 'none' }, { name: 'Settings', level: 'none' },
    ],
  },
  {
    role: 'Read-only',
    description: 'View-only access across dashboards and reports. Cannot edit anything.',
    modules: [
      { name: 'Dashboard', level: 'view' }, { name: 'Reports', level: 'view' },
      { name: 'Visits', level: 'view' }, { name: 'Expenses', level: 'view' },
      { name: 'Logistics', level: 'none' }, { name: 'Settings', level: 'none' },
    ],
  },
];

const DEFAULT_PERMISSIONS: Record<string, string> = {
  'Administrator':    'Full system access including settings',
  'Visit Lead':       'Full access — create, edit, approve, close',
  'Ops Admin':        'Create, edit logistics, submit expenses',
  'Finance Approver': 'View and approve/reject expense claims',
  'Read-only':        'View dashboards and reports only',
};

export default function SettingsPage() {
  const currentUser = useAuthStore(s => s.user);
  const isAdmin = currentUser?.role === 'Administrator';

  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [policyValue, setPolicyValue] = useState('');

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editUser, setEditUser] = useState<FirestoreUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'Ops Admin' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<FirestoreUser | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<{ questionId: string; value: string | string[] }[] | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    getDocs(collection(db, 'users'))
      .then(snap => {
        setUsers(snap.docs.map(d => ({
          uid: d.id,
          name: d.data().name ?? '',
          email: d.data().email ?? '',
          role: d.data().role ?? 'Read-only',
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [isAdmin]);

  const savePolicy = () => {
    if (!policyValue || !currentUser) return;
    const prev = editPolicy!.value;
    setPolicies(ps => ps.map(p => p.id === editPolicy!.id ? { ...p, value: policyValue } : p));
    logAudit({
      action: 'settings.policy_updated',
      actorUid: currentUser.uid,
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      target: editPolicy!.label,
      details: `Changed from "${prev}" to "${policyValue}"`,
    });
    setEditPolicy(null);
  };

  const saveUserRole = async () => {
    if (!editUser || !currentUser) return;
    const prevRole = editUser.role;
    await updateDoc(doc(db, 'users', editUser.uid), { role: editRole });
    setUsers(us => us.map(u => u.uid === editUser.uid ? { ...u, role: editRole } : u));
    logAudit({
      action: 'settings.role_changed',
      actorUid: currentUser.uid,
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      target: editUser.name,
      details: `Role changed from ${prevRole} to ${editRole}`,
    });
    setEditUser(null);
  };

  const createUser = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) return;
    setAddError('');
    setAddLoading(true);
    let secondaryApp;
    try {
      secondaryApp = initializeApp(firebaseConfig, `create-user-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, addForm.email, addForm.password);
      await setDoc(doc(secondaryDb, 'users', cred.user.uid), {
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
      });
      await firebaseSignOut(secondaryAuth);
      setUsers(us => [...us, { uid: cred.user.uid, name: addForm.name, email: addForm.email, role: addForm.role }]);
      if (currentUser) {
        logAudit({
          action: 'settings.user_created',
          actorUid: currentUser.uid,
          actorName: currentUser.name,
          actorEmail: currentUser.email,
          target: addForm.name,
          details: `${addForm.email} · Role: ${addForm.role}`,
        });
      }
      setAddUserOpen(false);
      setAddForm({ name: '', email: '', password: '', role: 'Ops Admin' });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const ERROR_MESSAGES: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      };
      setAddError(ERROR_MESSAGES[code] ?? (err instanceof Error ? err.message : 'Failed to create user'));
    } finally {
      setAddLoading(false);
      if (secondaryApp) await deleteApp(secondaryApp).catch(() => {});
    }
  };

  const deleteUser = async (user: FirestoreUser) => {
    await deleteDoc(doc(db, 'users', user.uid));
    setUsers(us => us.filter(u => u.uid !== user.uid));
    if (currentUser) {
      logAudit({
        action: 'settings.user_deleted',
        actorUid: currentUser.uid,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        target: user.name,
        details: `${user.email} · Role: ${user.role}`,
      });
    }
    setConfirmDeleteUser(null);
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
                onClick={() => { setEditPolicy(p); setPolicyValue(p.value); }}
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
          isAdmin ? (
            <button className="section-card__edit-btn" onClick={() => { setAddForm({ name: '', email: '', password: '', role: 'Ops Admin' }); setAddError(''); setShowPassword(false); setAddUserOpen(true); }}>
              <Plus size={12} /> Add User
            </button>
          ) : undefined
        }
      >
        {!isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', color: 'var(--text-muted)', fontSize: 13 }}>
            <ShieldAlert size={16} />
            <span>Only Administrators can manage users.</span>
          </div>
        ) : loadingUsers ? (
          <p className="section-card__empty">Loading users…</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Permissions', ''].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '10px 18px', color: 'var(--text-muted)', fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: '10px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-secondary)' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', fontSize: 12 }}>{DEFAULT_PERMISSIONS[u.role] ?? '—'}</td>
                  <td style={{ padding: '10px 18px' }}>
                    {u.uid !== currentUser?.uid && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="visit-detail__action-btn" onClick={() => { setEditUser(u); setEditRole(u.role); }}><Pencil size={13} /></button>
                        <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setConfirmDeleteUser(u)}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

      {/* Edit User Role Modal */}
      {editUser && (
        <Modal title={`Edit Role — ${editUser.name}`} onClose={() => setEditUser(null)} onSubmit={saveUserRole} submitLabel="Save">
          <div className="modal-field">
            <label>Access Level</label>
            <select value={editRole} onChange={e => setEditRole(e.target.value)}>
              {ACCESS_LEVELS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{DEFAULT_PERMISSIONS[editRole]}</p>
        </Modal>
      )}

      {/* Add User Modal */}
      {addUserOpen && (
        <Modal title="Create New User" onClose={() => setAddUserOpen(false)} onSubmit={createUser} submitLabel={addLoading ? 'Creating…' : 'Create User'} width={580} disableBackdropClose>
          <div className="modal-row">
            <div className="modal-field"><label>Full Name *</label><input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Juan dela Cruz" /></div>
            <div className="modal-field"><label>Email Address *</label><input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="juan@techanywhere.com" /></div>
          </div>
          <div className="modal-field">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={addForm.password}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="modal-field">
            <label>Access Control</label>
            <div className="role-picker">
              {ROLE_DEFINITIONS.map(r => (
                <button
                  key={r.role}
                  type="button"
                  className={`role-picker__card ${addForm.role === r.role ? 'selected' : ''}`}
                  onClick={() => setAddForm(f => ({ ...f, role: r.role }))}
                >
                  <div className="role-picker__header">
                    <span className="role-picker__name">{r.role}</span>
                    {addForm.role === r.role && <span className="role-picker__check">✓</span>}
                  </div>
                  <p className="role-picker__desc">{r.description}</p>
                  <div className="role-picker__modules">
                    {r.modules.map(m => (
                      <span key={m.name} className={`role-picker__module role-picker__module--${m.level}`}>
                        {m.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {addError && <p style={{ fontSize: 12, color: 'var(--accent-red-hover)', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, padding: '8px 12px' }}>{addError}</p>}
        </Modal>
      )}

      {/* Groups & Access */}
      {isAdmin && (
        <SectionCard
          title="Groups & Access Control"
          actions={
            <button className="section-card__edit-btn" onClick={() => setShowQuestionnaire(true)}>
              <Users size={12} /> Configure Groups
            </button>
          }
        >
          {questionnaireAnswers ? (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Requirements captured. Groups configuration will be built based on your answers.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {questionnaireAnswers.map(a => (
                  <div key={a.questionId} style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', width: 180, flexShrink: 0, textTransform: 'capitalize' }}>{a.questionId.replace(/_/g, ' ')}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {Array.isArray(a.value) ? a.value.join(', ') : a.value}
                    </span>
                  </div>
                ))}
              </div>
              <button className="section-card__edit-btn" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => setShowQuestionnaire(true)}>
                Re-run questionnaire
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <Users size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400 }}>
                Set up custom access groups to control exactly which areas of the system each team member can see and use.
              </p>
              <button className="section-card__edit-btn" onClick={() => setShowQuestionnaire(true)}>
                <Users size={12} /> Start Setup
              </button>
            </div>
          )}
        </SectionCard>
      )}

      {/* Confirm Delete User */}
      {confirmDeleteUser && (
        <ConfirmModal
          title="Remove User"
          message={<>Remove <strong>{confirmDeleteUser.name}</strong>? They will no longer be able to access the system.</>}
          onConfirm={() => deleteUser(confirmDeleteUser)}
          onClose={() => setConfirmDeleteUser(null)}
        />
      )}
      {showQuestionnaire && (
        <GroupsQuestionnaire
          onComplete={answers => { setQuestionnaireAnswers(answers); setShowQuestionnaire(false); }}
          onCancel={() => setShowQuestionnaire(false)}
        />
      )}

      {isAdmin && <AuditLog />}
    </div>
  );
}
