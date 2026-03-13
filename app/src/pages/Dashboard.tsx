import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import SectionCard from '../components/common/SectionCard';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { useAppStore } from '../store/appStore';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const visits = useAppStore(s => s.visits);

  const activeVisits = visits.filter(v => v.status === 'Active');
  const openTasks = visits.flatMap(v => v.tasks).filter(t => t.status !== 'Completed');
  const pendingExpenses = visits.flatMap(v => v.expenses).filter(e => e.status === 'Submitted');
  const upcomingVisits = visits.filter(v => ['Confirmed', 'In Planning', 'Ready for Arrival'].includes(v.status));

  const atRiskVisits = visits.filter(v =>
    ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(v.status) &&
    (v.logisticsReadinessScore ?? 100) < 60
  );

  const recentComms = visits
    .flatMap(v => v.communications.map(c => ({ ...c, visitRef: v.visitRef, company: v.company })))
    .sort((a, b) => new Date(b.sentAt || '').getTime() - new Date(a.sentAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="dashboard">
      <PageHeader
        icon={<LayoutDashboard size={20} />}
        title="Dashboard"
        onRefresh={() => {}}
      />

      <div className="dashboard__stats">
        <StatCard value={activeVisits.length} label="Active Visits" color="red" onEdit={() => navigate('/visits')} onRefresh={() => {}} />
        <StatCard value={openTasks.length} label="Open Tasks" color="gold" onEdit={() => navigate('/visits')} onRefresh={() => {}} />
        <StatCard value={pendingExpenses.length} label="Expenses Pending" color="orange" onEdit={() => navigate('/expenses')} onRefresh={() => {}} />
        <StatCard value={upcomingVisits.length} label="Upcoming Visits" color="dark" onEdit={() => navigate('/visits')} onRefresh={() => {}} />
      </div>

      <div className="dashboard__grid">
        <SectionCard title="Open Tasks" onEdit={() => navigate('/visits')}>
          {openTasks.length === 0 ? (
            <p className="section-card__empty">No Open Tasks to display</p>
          ) : (
            <ul className="dashboard__task-list">
              {openTasks.slice(0, 6).map(task => (
                <li key={task.id} className="dashboard__task-item">
                  <div className="dashboard__task-main">
                    <Badge label={task.priority} variant="priority" />
                    <span className="dashboard__task-title">{task.title}</span>
                  </div>
                  <div className="dashboard__task-meta">
                    <span className="dashboard__task-assignee">{task.assignedTo}</span>
                    <span className="dashboard__task-due">Due {task.dueDate}</span>
                    <Badge label={task.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Completed Tasks" onEdit={() => navigate('/visits')}>
          {visits.flatMap(v => v.tasks).filter(t => t.status === 'Completed').length === 0 ? (
            <p className="section-card__empty">No completed tasks to display</p>
          ) : (
            <ul className="dashboard__task-list">
              {visits.flatMap(v => v.tasks)
                .filter(t => t.status === 'Completed')
                .slice(0, 4)
                .map(task => (
                  <li key={task.id} className="dashboard__task-item">
                    <div className="dashboard__task-main">
                      <CheckCircle size={14} style={{ color: '#1e8449', flexShrink: 0 }} />
                      <span className="dashboard__task-title">{task.title}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Inbox – Recent Communications" onEdit={() => navigate('/communications')}>
          {recentComms.length === 0 ? (
            <p className="section-card__empty">No communications to display</p>
          ) : (
            <ul className="dashboard__comm-list">
              {recentComms.map(comm => (
                <li key={comm.id} className="dashboard__comm-item" onClick={() => navigate('/communications')}>
                  <div className="dashboard__comm-header">
                    <span className="dashboard__comm-recipient">{comm.recipient}</span>
                    <span className="dashboard__comm-date">{comm.sentAt ? new Date(comm.sentAt).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Draft'}</span>
                  </div>
                  <div className="dashboard__comm-subject">{comm.subject}</div>
                  <div className="dashboard__comm-ref">{comm.company}</div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Visits at Risk" onEdit={() => navigate('/visits')}>
          {atRiskVisits.length === 0 ? (
            <p className="section-card__empty">No at-risk visits — great work!</p>
          ) : (
            <ul className="dashboard__risk-list">
              {atRiskVisits.map(visit => (
                <li key={visit.id} className="dashboard__risk-item" onClick={() => navigate(`/visits/${visit.id}`)}>
                  <div className="dashboard__risk-header">
                    <AlertTriangle size={14} style={{ color: '#ca6f1e', flexShrink: 0 }} />
                    <span className="dashboard__risk-company">{visit.company}</span>
                    <Badge label={visit.status} />
                  </div>
                  <div className="dashboard__risk-detail">
                    <span>{visit.visitRef}</span>
                    <span>Arrives {visit.arrivalDate}</span>
                  </div>
                  <div className="dashboard__risk-score">
                    <span className="dashboard__risk-score-label">Readiness</span>
                    <ProgressBar value={visit.logisticsReadinessScore ?? 0} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="dashboard__row">
        <SectionCard title="Upcoming Visits" onEdit={() => navigate('/visits')}>
          {upcomingVisits.length === 0 ? (
            <p className="section-card__empty">No upcoming visits</p>
          ) : (
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Ref</th><th>Client</th><th>Company</th><th>Arrival</th><th>Status</th><th>Readiness</th><th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingVisits.map(visit => (
                  <tr key={visit.id} onClick={() => navigate(`/visits/${visit.id}`)}>
                    <td className="dashboard__table-ref">{visit.visitRef}</td>
                    <td>{visit.clientName}</td>
                    <td>{visit.company}</td>
                    <td>{visit.arrivalDate}</td>
                    <td><Badge label={visit.status} /></td>
                    <td style={{ width: 140 }}><ProgressBar value={visit.logisticsReadinessScore ?? 0} /></td>
                    <td>
                      <button className="dashboard__table-link" onClick={e => { e.stopPropagation(); navigate(`/visits/${visit.id}`); }}>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard title="Expense Actions" onEdit={() => navigate('/expenses')}>
          {pendingExpenses.length === 0 ? (
            <p className="section-card__empty">No expenses pending approval</p>
          ) : (
            <ul className="dashboard__expense-list">
              {pendingExpenses.slice(0, 5).map(exp => (
                <li key={exp.id} className="dashboard__expense-item" onClick={() => navigate('/expenses')}>
                  <div className="dashboard__expense-header">
                    <span className="dashboard__expense-claimant">{exp.claimantName}</span>
                    <Badge label={exp.status} />
                  </div>
                  <div className="dashboard__expense-desc">{exp.description}</div>
                  <div className="dashboard__expense-footer">
                    <span className="dashboard__expense-amount">{exp.currency} {exp.amount.toLocaleString()}</span>
                    {!exp.receiptAttached && (
                      <span className="dashboard__expense-warn">
                        <AlertTriangle size={12} /> No receipt
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="dashboard__row">
        <SectionCard title="Logistics Overview" onEdit={() => navigate('/logistics')}>
          <div className="dashboard__logistics-grid">
            {visits.filter(v => ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(v.status)).map(visit => (
              <div key={visit.id} className="dashboard__logistics-item" onClick={() => navigate(`/visits/${visit.id}`)}>
                <div className="dashboard__logistics-header">
                  <span className="dashboard__logistics-ref">{visit.visitRef}</span>
                  <Badge label={visit.status} />
                </div>
                <div className="dashboard__logistics-company">{visit.company}</div>
                <div className="dashboard__logistics-dates">{visit.arrivalDate} → {visit.departureDate}</div>
                <div className="dashboard__logistics-checks">
                  <span className={`dashboard__logistics-check ${visit.transportBookings.length > 0 ? 'ok' : 'missing'}`}>
                    {visit.transportBookings.length > 0 ? '✓' : '✗'} Transport
                  </span>
                  <span className={`dashboard__logistics-check ${visit.accommodationBookings.length > 0 ? 'ok' : 'missing'}`}>
                    {visit.accommodationBookings.length > 0 ? '✓' : '✗'} Accommodation
                  </span>
                  <span className={`dashboard__logistics-check ${visit.officeReadiness.filter(o => o.completed).length === visit.officeReadiness.length && visit.officeReadiness.length > 0 ? 'ok' : 'missing'}`}>
                    {visit.officeReadiness.filter(o => o.completed).length}/{visit.officeReadiness.length} Office Ready
                  </span>
                </div>
                <ProgressBar value={visit.logisticsReadinessScore ?? 0} />
              </div>
            ))}
            {visits.filter(v => ['Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].includes(v.status)).length === 0 && (
              <p className="section-card__empty">No active or upcoming visits</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Quick Stats">
          <div className="dashboard__quick-stats">
            <div className="dashboard__quick-stat">
              <span className="dashboard__quick-stat-icon" style={{ color: '#c0392b' }}><TrendingUp size={20} /></span>
              <div>
                <div className="dashboard__quick-stat-value">{visits.length}</div>
                <div className="dashboard__quick-stat-label">Total Visits (2026)</div>
              </div>
            </div>
            <div className="dashboard__quick-stat">
              <span className="dashboard__quick-stat-icon" style={{ color: '#1e8449' }}><CheckCircle size={20} /></span>
              <div>
                <div className="dashboard__quick-stat-value">{visits.filter(v => v.status === 'Completed' || v.status === 'Closed').length}</div>
                <div className="dashboard__quick-stat-label">Completed Visits</div>
              </div>
            </div>
            <div className="dashboard__quick-stat">
              <span className="dashboard__quick-stat-icon" style={{ color: '#ca6f1e' }}><Clock size={20} /></span>
              <div>
                <div className="dashboard__quick-stat-value">{visits.flatMap(v => v.expenses).filter(e => ['Submitted', 'Draft'].includes(e.status)).length}</div>
                <div className="dashboard__quick-stat-label">Expense Claims Pending</div>
              </div>
            </div>
            <div className="dashboard__quick-stat">
              <span className="dashboard__quick-stat-icon" style={{ color: '#c0392b' }}><AlertTriangle size={20} /></span>
              <div>
                <div className="dashboard__quick-stat-value">{visits.flatMap(v => v.internalAttendees).filter(a => !a.attendanceConfirmed).length}</div>
                <div className="dashboard__quick-stat-label">Unconfirmed Attendees</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
