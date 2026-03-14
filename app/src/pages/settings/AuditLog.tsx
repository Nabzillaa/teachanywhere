import { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import SectionCard from '../../components/common/SectionCard';
import { fetchAuditLogs, type AuditLogEntry } from '../../services/auditService';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'Login', 'auth.logout': 'Logout',
  'settings.user_created': 'User Created', 'settings.user_deleted': 'User Deleted',
  'settings.role_changed': 'Role Changed', 'settings.policy_updated': 'Policy Updated',
  'visit.created': 'Visit Created', 'visit.updated': 'Visit Updated',
  'visit.deleted': 'Visit Deleted', 'visit.status_changed': 'Status Changed',
  'attendee.client_added': 'Client Attendee Added', 'attendee.client_updated': 'Client Attendee Updated',
  'attendee.client_deleted': 'Client Attendee Removed', 'attendee.internal_added': 'Internal Attendee Added',
  'attendee.internal_updated': 'Internal Attendee Updated', 'attendee.internal_deleted': 'Internal Attendee Removed',
  'attendee.confirmed': 'Attendance Toggled',
  'logistics.transport_added': 'Transport Added', 'logistics.transport_updated': 'Transport Updated',
  'logistics.transport_deleted': 'Transport Deleted', 'logistics.transport_status_changed': 'Transport Status',
  'logistics.accommodation_added': 'Accommodation Added', 'logistics.accommodation_updated': 'Accommodation Updated',
  'logistics.accommodation_deleted': 'Accommodation Deleted',
  'office.item_toggled': 'Office Item Toggled', 'office.item_added': 'Office Item Added',
  'office.item_deleted': 'Office Item Deleted', 'office.template_loaded': 'Office Template Loaded',
  'comms.added': 'Communication Added', 'comms.updated': 'Communication Updated', 'comms.deleted': 'Communication Deleted',
  'expense.added': 'Expense Added', 'expense.updated': 'Expense Updated',
  'expense.deleted': 'Expense Deleted', 'expense.reinstated': 'Expense Reinstated',
  'expense.status_changed': 'Expense Status',
  'task.added': 'Task Added', 'task.updated': 'Task Updated',
  'task.deleted': 'Task Deleted', 'task.status_changed': 'Task Status',
  'client.created': 'Client Created', 'client.updated': 'Client Updated', 'client.deleted': 'Client Deleted',
};

const MODULE_COLORS: Record<string, { bg: string; color: string }> = {
  auth:       { bg: 'rgba(30,132,73,0.12)',   color: '#1e8449' },
  settings:   { bg: 'rgba(113,54,143,0.12)',  color: '#71368f' },
  visit:      { bg: 'rgba(36,113,163,0.12)',  color: '#2471a3' },
  attendee:   { bg: 'rgba(20,143,119,0.12)',  color: '#148f77' },
  logistics:  { bg: 'rgba(202,111,30,0.12)',  color: '#ca6f1e' },
  office:     { bg: 'rgba(93,109,126,0.12)',  color: '#5d6d7e' },
  comms:      { bg: 'rgba(23,162,184,0.12)',  color: '#17a2b8' },
  expense:    { bg: 'rgba(192,57,43,0.12)',   color: '#c0392b' },
  task:       { bg: 'rgba(52,73,94,0.12)',    color: '#34495e' },
  client:     { bg: 'rgba(22,160,133,0.12)',  color: '#16a085' },
};

function getActionStyle(action: string) {
  const module = action.split('.')[0];
  return MODULE_COLORS[module] ?? { bg: 'var(--bg-hover)', color: 'var(--text-muted)' };
}

function formatTimestamp(ts: AuditLogEntry['timestamp']): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = () => {
    setLoading(true);
    setError('');
    fetchAuditLogs(200)
      .then(setLogs)
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogs(); }, []);

  return (
    <SectionCard
      title="Audit Log"
      actions={
        <button className="section-card__edit-btn" onClick={loadLogs} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <RefreshCw size={11} /> Refresh
        </button>
      }
    >
      {loading ? (
        <p className="section-card__empty">Loading audit logs…</p>
      ) : error ? (
        <p className="section-card__empty" style={{ color: 'var(--accent-red-hover)' }}>{error}</p>
      ) : logs.length === 0 ? (
        <div style={{ padding: '32px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
          <ClipboardList size={28} style={{ opacity: 0.4 }} />
          <p style={{ fontSize: 13 }}>No audit events recorded yet.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Time', 'Action', 'Actor', 'Target / Details'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const style = getActionStyle(log.action);
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 18px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td style={{ padding: '10px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: style.bg, color: style.color, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 18px' }}>
                    <span style={{ fontWeight: 600, display: 'block' }}>{log.actorName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.actorEmail}</span>
                  </td>
                  <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', fontSize: 12 }}>
                    {log.target && <span style={{ display: 'block', fontWeight: 500 }}>{log.target}</span>}
                    {log.details && <span style={{ color: 'var(--text-muted)' }}>{log.details}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
