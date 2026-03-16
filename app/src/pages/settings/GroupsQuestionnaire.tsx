import { useState } from 'react';
import { Pencil, Trash2, Plus, ShieldCheck } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import './GroupsQuestionnaire.css';

interface Action { key: string; label: string; }
interface Group {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
}

const MODULE_ACTIONS: Record<string, Action[]> = {
  Visits: [
    { key: 'view',    label: 'View' },
    { key: 'create',  label: 'Create' },
    { key: 'edit',    label: 'Edit Details' },
    { key: 'status',  label: 'Change Status' },
    { key: 'delete',  label: 'Delete' },
  ],
  Clients: [
    { key: 'view',    label: 'View' },
    { key: 'create',  label: 'Add' },
    { key: 'edit',    label: 'Edit' },
    { key: 'delete',  label: 'Delete' },
  ],
  Attendees: [
    { key: 'view',    label: 'View' },
    { key: 'add',     label: 'Add' },
    { key: 'edit',    label: 'Edit' },
    { key: 'remove',  label: 'Remove' },
    { key: 'confirm', label: 'Confirm Attendance' },
  ],
  Logistics: [
    { key: 'view',               label: 'View' },
    { key: 'transport_add',      label: 'Add Transport' },
    { key: 'transport_edit',     label: 'Edit Transport' },
    { key: 'transport_delete',   label: 'Delete Transport' },
    { key: 'accommodation_add',  label: 'Add Accommodation' },
    { key: 'accommodation_edit', label: 'Edit Accommodation' },
    { key: 'accommodation_delete', label: 'Delete Accommodation' },
  ],
  Office: [
    { key: 'view',     label: 'View' },
    { key: 'complete', label: 'Complete Items' },
    { key: 'add',      label: 'Add Items' },
    { key: 'delete',   label: 'Delete Items' },
    { key: 'template', label: 'Load Template' },
  ],
  Communications: [
    { key: 'view',      label: 'View' },
    { key: 'draft',     label: 'Draft' },
    { key: 'send',      label: 'Send' },
    { key: 'templates', label: 'Manage Templates' },
    { key: 'delete',    label: 'Delete' },
  ],
  Expenses: [
    { key: 'view',          label: 'View' },
    { key: 'submit_own',    label: 'Submit Own' },
    { key: 'submit_others', label: 'Submit for Others' },
    { key: 'approve',       label: 'Approve / Reject' },
    { key: 'delete',        label: 'Delete' },
    { key: 'export',        label: 'Export' },
  ],
  Reports: [
    { key: 'view',   label: 'View' },
    { key: 'export', label: 'Export' },
  ],
  Settings: [
    { key: 'view_users',    label: 'View Users' },
    { key: 'manage_users',  label: 'Manage Users' },
    { key: 'edit_policies', label: 'Edit Policies' },
    { key: 'manage_groups', label: 'Manage Groups' },
  ],
};

const MODULES = Object.keys(MODULE_ACTIONS);

function allActions(module: string) { return MODULE_ACTIONS[module].map(a => a.key); }
function fullPerms() { return Object.fromEntries(MODULES.map(m => [m, allActions(m)])); }

const PRESET_GROUPS: Group[] = [
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Full system access including user and settings management.',
    permissions: fullPerms(),
  },
  {
    id: 'visit_lead',
    name: 'Visit Lead',
    description: 'Manages visits end-to-end. No access to Settings.',
    permissions: {
      Visits:         ['view', 'create', 'edit', 'status'],
      Clients:        ['view'],
      Attendees:      ['view', 'add', 'edit', 'remove', 'confirm'],
      Logistics:      ['view', 'transport_add', 'transport_edit', 'accommodation_add', 'accommodation_edit'],
      Office:         ['view'],
      Communications: ['view', 'draft', 'send', 'templates'],
      Expenses:       ['view'],
      Reports:        ['view'],
      Settings:       [],
    },
  },
  {
    id: 'ops_admin',
    name: 'Ops Admin',
    description: 'Handles logistics, office readiness, and expense submission.',
    permissions: {
      Visits:         ['view'],
      Clients:        ['view'],
      Attendees:      ['view'],
      Logistics:      allActions('Logistics'),
      Office:         allActions('Office'),
      Communications: ['view', 'draft', 'send', 'templates'],
      Expenses:       ['view', 'submit_own'],
      Reports:        ['view'],
      Settings:       [],
    },
  },
  {
    id: 'finance_approver',
    name: 'Finance Approver',
    description: 'Views and approves or rejects expense claims and reports.',
    permissions: {
      Visits: [], Clients: [], Attendees: [], Logistics: [], Office: [], Communications: [],
      Expenses:  ['view', 'approve', 'export'],
      Reports:   ['view', 'export'],
      Settings:  [],
    },
  },
  {
    id: 'read_only',
    name: 'Read-only',
    description: 'View-only access. Cannot edit anything.',
    permissions: {
      Visits: ['view'], Clients: ['view'], Attendees: ['view'],
      Logistics: [], Office: [],
      Communications: ['view'],
      Expenses: ['view'], Reports: ['view'],
      Settings: [],
    },
  },
];

function generateId() { return Math.random().toString(36).slice(2, 10); }

function badgeStyle(granted: number, total: number) {
  if (granted === 0) return null;
  if (granted === total) return { bg: 'rgba(30,132,73,0.12)', color: '#1e8449' };
  return { bg: 'rgba(36,113,163,0.12)', color: '#2471a3' };
}

export default function GroupsManager() {
  const [groups, setGroups] = useState<Group[]>(PRESET_GROUPS);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Group | null>(null);

  const openAdd = () => {
    setEditGroup({ id: generateId(), name: '', description: '', permissions: Object.fromEntries(MODULES.map(m => [m, []])) });
    setIsNew(true);
  };

  const openEdit = (group: Group) => {
    setEditGroup({ ...group, permissions: Object.fromEntries(MODULES.map(m => [m, [...(group.permissions[m] ?? [])]]))  });
    setIsNew(false);
  };

  const saveGroup = () => {
    if (!editGroup || !editGroup.name.trim()) return;
    setGroups(gs => isNew ? [...gs, editGroup] : gs.map(g => g.id === editGroup.id ? editGroup : g));
    setEditGroup(null);
  };

  const toggleAction = (module: string, key: string) => {
    if (!editGroup) return;
    const current = editGroup.permissions[module] ?? [];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    setEditGroup({ ...editGroup, permissions: { ...editGroup.permissions, [module]: next } });
  };

  const toggleAll = (module: string) => {
    if (!editGroup) return;
    const current = editGroup.permissions[module] ?? [];
    const all = allActions(module);
    const next = current.length === all.length ? [] : all;
    setEditGroup({ ...editGroup, permissions: { ...editGroup.permissions, [module]: next } });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px 0' }}>
        <button className="section-card__edit-btn" onClick={openAdd}>
          <Plus size={12} /> Add Group
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Group', 'Description', 'Module Access', ''].map(h => (
              <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  {group.name}
                </div>
              </td>
              <td style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 200 }}>{group.description}</td>
              <td style={{ padding: '12px 18px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {MODULES.map(m => {
                    const granted = (group.permissions[m] ?? []).length;
                    const total = MODULE_ACTIONS[m].length;
                    const s = badgeStyle(granted, total);
                    if (!s) return null;
                    return (
                      <span key={m} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {m} · {granted}/{total}
                      </span>
                    );
                  })}
                  {MODULES.every(m => (group.permissions[m] ?? []).length === 0) && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No access</span>
                  )}
                </div>
              </td>
              <td style={{ padding: '12px 18px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="visit-detail__action-btn" onClick={() => openEdit(group)}><Pencil size={13} /></button>
                  <button className="visit-detail__action-btn visit-detail__action-btn--delete" onClick={() => setConfirmDelete(group)}><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editGroup && (
        <Modal title={isNew ? 'Add Group' : `Edit — ${editGroup.name}`} onClose={() => setEditGroup(null)} onSubmit={saveGroup} submitLabel="Save Group" width={640}>
          <div className="modal-row">
            <div className="modal-field">
              <label>Group Name *</label>
              <input value={editGroup.name} onChange={e => setEditGroup({ ...editGroup, name: e.target.value })} placeholder="e.g. Operations Team" />
            </div>
            <div className="modal-field">
              <label>Description</label>
              <input value={editGroup.description} onChange={e => setEditGroup({ ...editGroup, description: e.target.value })} placeholder="What this group can do" />
            </div>
          </div>

          <div className="modal-field" style={{ marginTop: 8 }}>
            <label>Module Permissions</label>
            <div className="gm__modules">
              {MODULES.map(module => {
                const granted = editGroup.permissions[module] ?? [];
                const actions = MODULE_ACTIONS[module];
                const allGranted = granted.length === actions.length;
                const hasAny = granted.length > 0;
                return (
                  <div key={module} className={`gm__module-block ${hasAny ? 'active' : ''}`}>
                    <div className="gm__module-header">
                      <span className="gm__module-name">{module}</span>
                      <button type="button" className={`gm__select-all ${allGranted ? 'all-on' : ''}`} onClick={() => toggleAll(module)}>
                        {allGranted ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="gm__actions">
                      {actions.map(action => {
                        const checked = granted.includes(action.key);
                        return (
                          <button
                            key={action.key}
                            type="button"
                            className={`gm__action-chip ${checked ? 'checked' : ''}`}
                            onClick={() => toggleAction(module, action.key)}
                          >
                            <span className={`gm__chip-dot ${checked ? 'checked' : ''}`} />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Group"
          message={<>Delete <strong>{confirmDelete.name}</strong>? Users assigned to this group will lose their permissions.</>}
          onConfirm={() => { setGroups(gs => gs.filter(g => g.id !== confirmDelete.id)); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
