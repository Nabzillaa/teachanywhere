import { Settings } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';

export default function SettingsPage() {
  const POLICIES = [
    { label: 'Receipt Required', value: 'Yes — mandatory for all claims', editable: true },
    { label: 'Meal Per Diem Cap', value: 'PHP 800/day', editable: true },
    { label: 'Transport Pre-approval', value: 'Required for all bookings > PHP 3,000', editable: true },
    { label: 'Accommodation Approval', value: 'Visit Lead sign-off required', editable: true },
    { label: 'Expense Submission Window', value: 'Within 5 business days of visit end', editable: true },
    { label: 'Remote Staff Travel', value: 'Pre-approved, Visit Lead + Manager sign-off', editable: true },
    { label: 'Pre-arrival Checklist Deadline', value: '7 calendar days before arrival', editable: false },
    { label: 'Office Readiness Deadline', value: '48 hours before first office day', editable: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={<Settings size={20} />} title="Settings" />

      <SectionCard title="Standard Expense & Reimbursement Policy" onEdit={() => {}}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {POLICIES.map(p => (
            <div key={p.label} style={{ display: 'flex', padding: '12px 18px', borderBottom: '1px solid var(--border)', gap: 16 }}>
              <span style={{ width: 240, fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, paddingTop: 1 }}>{p.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{p.value}</span>
              {p.editable && (
                <button style={{ fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border-light)', borderRadius: 4, padding: '2px 10px', background: 'var(--bg-secondary)' }}>Edit</button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="System Users & Roles" onEdit={() => {}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Name', 'Role', 'Access Level', 'Permissions'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Nabil Sabin', role: 'Head of Service Delivery', access: 'Visit Lead', permissions: 'Full access — create, edit, approve, close' },
              { name: 'Maria Santos', role: 'Operations Coordinator', access: 'Ops Admin', permissions: 'Create, edit logistics, submit expenses' },
              { name: 'Finance Team', role: 'Finance', access: 'Finance Approver', permissions: 'View and approve/reject expense claims' },
              { name: 'Leadership', role: 'Executive', access: 'Read-only', permissions: 'View dashboards and reports only' },
            ].map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 18px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '10px 18px', color: 'var(--text-secondary)' }}>{u.role}</td>
                <td style={{ padding: '10px 18px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-secondary)' }}>{u.access}</span>
                </td>
                <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', fontSize: 12 }}>{u.permissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}
