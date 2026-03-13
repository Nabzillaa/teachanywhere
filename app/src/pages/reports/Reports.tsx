import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { useAppStore } from '../../store/appStore';
import './Reports.css';

export default function Reports() {
  const visits = useAppStore(s => s.visits);
  const allExpenses = visits.flatMap(v => v.expenses);
  const allTasks = visits.flatMap(v => v.tasks);
  const allAttendees = visits.flatMap(v => v.internalAttendees);

  const byStatus = ['Draft','Proposed','Confirmed','In Planning','Ready for Arrival','Active','Completed','Closed','Cancelled']
    .map(status => ({ status, count: visits.filter(v => v.status === status).length }))
    .filter(b => b.count > 0);

  const avgReadiness = visits.length > 0
    ? Math.round(visits.reduce((sum, v) => sum + (v.logisticsReadinessScore ?? 0), 0) / visits.length)
    : 0;
  const attendanceRate = Math.round((allAttendees.filter(a => a.attendanceConfirmed).length / Math.max(allAttendees.length, 1)) * 100);
  const expenseCompliance = Math.round((allExpenses.filter(e => e.receiptAttached).length / Math.max(allExpenses.length, 1)) * 100);
  const taskCompletion = Math.round((allTasks.filter(t => t.status === 'Completed').length / Math.max(allTasks.length, 1)) * 100);

  const risks = visits.flatMap(v => {
    const r = [];
    if (v.transportBookings.length === 0 && ['Confirmed', 'In Planning', 'Active'].includes(v.status))
      r.push({ visit: v, risk: 'No Transport', detail: 'Airport and daily transport not booked' });
    if (v.internalAttendees.some(a => !a.attendanceConfirmed))
      r.push({ visit: v, risk: 'Unconfirmed Attendees', detail: `${v.internalAttendees.filter(a => !a.attendanceConfirmed).length} team member(s) not confirmed` });
    if (v.expenses.some(e => !e.receiptAttached && e.status !== 'Rejected'))
      r.push({ visit: v, risk: 'Missing Receipts', detail: 'Expense claims without receipts' });
    return r;
  });

  return (
    <div className="reports-page">
      <PageHeader icon={<BarChart2 size={20} />} title="Reports & Metrics" />

      <div className="reports-page__kpis">
        {[
          { icon: <TrendingUp size={20} />, value: visits.length, label: 'Total Visits (2026)', color: '#c0392b' },
          { icon: <BarChart2 size={20} />, value: `${avgReadiness}%`, label: 'Avg Logistics Readiness', color: '#b7950b' },
          { icon: <CheckCircle size={20} />, value: `${attendanceRate}%`, label: 'Attendance Confirmation Rate', color: '#1e8449' },
          { icon: <AlertTriangle size={20} />, value: `${expenseCompliance}%`, label: 'Receipt Compliance', color: '#ca6f1e' },
          { icon: <Clock size={20} />, value: `${taskCompletion}%`, label: 'Task Completion Rate', color: '#2471a3' },
        ].map(k => (
          <div key={k.label} className="reports-page__kpi">
            <div className="reports-page__kpi-icon" style={{ color: k.color }}>{k.icon}</div>
            <div>
              <div className="reports-page__kpi-value">{k.value}</div>
              <div className="reports-page__kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-page__grid">
        <SectionCard title="Visits by Status">
          {byStatus.length === 0 ? (
            <p className="section-card__empty">No visits yet</p>
          ) : (
            <div className="reports-page__status-bars">
              {byStatus.map(b => (
                <div key={b.status} className="reports-page__status-bar">
                  <div className="reports-page__status-bar-header">
                    <Badge label={b.status} />
                    <span className="reports-page__status-count">{b.count}</span>
                  </div>
                  <ProgressBar value={b.count} max={visits.length} showLabel={false} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Visits by Client">
          <table className="reports-page__table">
            <thead><tr><th>Company</th><th>Status</th><th>Readiness</th></tr></thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id}>
                  <td>{v.company}</td>
                  <td><Badge label={v.status} /></td>
                  <td style={{ width: 140 }}><ProgressBar value={v.logisticsReadinessScore ?? 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Expense Summary by Visit">
          <table className="reports-page__table">
            <thead><tr><th>Visit</th><th>Company</th><th>Claims</th><th>Total (PHP)</th><th>Approved</th><th>Receipts</th></tr></thead>
            <tbody>
              {visits.map(v => {
                const total = v.expenses.reduce((s, e) => s + e.amount, 0);
                const approved = v.expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
                return (
                  <tr key={v.id}>
                    <td className="reports-page__ref">{v.visitRef}</td>
                    <td>{v.company}</td>
                    <td style={{ textAlign: 'center' }}>{v.expenses.length}</td>
                    <td>{total.toLocaleString()}</td>
                    <td>{approved.toLocaleString()}</td>
                    <td>{v.expenses.filter(e => e.receiptAttached).length}/{v.expenses.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Office Readiness by Visit">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {visits.map(v => {
              const done = v.officeReadiness.filter(o => o.completed).length;
              const total = v.officeReadiness.length;
              return (
                <div key={v.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>{v.visitRef}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{v.company}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{done}/{total}</span>
                  </div>
                  {total > 0 ? <ProgressBar value={done} max={total} /> : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checklist not started</span>}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Operational Risk Watchlist">
        {risks.length === 0 ? (
          <p className="section-card__empty">No active risks — all visits are on track</p>
        ) : (
          <table className="reports-page__table">
            <thead><tr><th>Visit</th><th>Company</th><th>Risk</th><th>Detail</th></tr></thead>
            <tbody>
              {risks.map((r, i) => (
                <tr key={i}>
                  <td className="reports-page__ref">{r.visit.visitRef}</td>
                  <td>{r.visit.company}</td>
                  <td><span style={{ color: '#ca6f1e', fontWeight: 600, fontSize: 12 }}>⚠ {r.risk}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
