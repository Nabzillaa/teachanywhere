import { useState } from 'react';
import { Receipt, AlertTriangle, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import { useAppStore } from '../../store/appStore';
import type { ExpenseStatus } from '../../data/types';
import './ExpensesList.css';

const STATUS_FILTERS: (ExpenseStatus | 'All')[] = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'];

export default function ExpensesList() {
  const visits = useAppStore(s => s.visits);
  const setExpenseStatus = useAppStore(s => s.setExpenseStatus);

  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const allExpenses = visits.flatMap(v =>
    v.expenses.map(e => ({ ...e, visitRef: v.visitRef, visitId: v.id, company: v.company }))
  );

  const filtered = allExpenses.filter(e => {
    const matchSearch = !search ||
      e.claimantName.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalApproved = allExpenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = allExpenses.filter(e => e.status === 'Submitted').reduce((s, e) => s + e.amount, 0);
  const missingReceipts = allExpenses.filter(e => !e.receiptAttached && e.status !== 'Rejected').length;

  return (
    <div className="expenses-list">
      <PageHeader icon={<Receipt size={20} />} title="Expenses & Reimbursements" />

      <div className="expenses-list__summary">
        {[
          { label: 'Approved', value: `PHP ${totalApproved.toLocaleString()}`, color: undefined },
          { label: 'Pending Approval', value: `PHP ${totalPending.toLocaleString()}`, color: '#ca6f1e' },
          { label: 'Missing Receipts', value: String(missingReceipts), color: missingReceipts > 0 ? '#c0392b' : undefined },
          { label: 'Total Claims', value: String(allExpenses.length), color: undefined },
        ].map(s => (
          <div key={s.label} className="expenses-list__summary-card">
            <div className="expenses-list__summary-value" style={{ color: s.color }}>{s.value}</div>
            <div className="expenses-list__summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      {missingReceipts > 0 && (
        <div className="expenses-list__policy-alert">
          <AlertTriangle size={14} />
          <strong>Policy:</strong> No receipt, no reimbursement. {missingReceipts} claim(s) with missing receipts require exception approval before processing.
        </div>
      )}

      <div className="expenses-list__filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', flex: 1, color: 'var(--text-primary)', fontSize: 14 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`expenses-list__filter-btn ${statusFilter === s ? 'active' : ''}`}>{s}</button>
          ))}
        </div>
      </div>

      <SectionCard title={`Expense Claims (${filtered.length})`}>
        {filtered.length === 0 ? (
          <p className="section-card__empty">No expense claims match the current filter</p>
        ) : (
          <table className="expenses-list__table">
            <thead>
              <tr><th>Visit</th><th>Claimant</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Receipt</th><th>Status</th><th>Policy</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className={e.policyBreach ? 'expenses-list__row--breach' : ''}>
                  <td className="expenses-list__ref">{e.visitRef}</td>
                  <td style={{ fontWeight: 600 }}>{e.claimantName}</td>
                  <td>{e.category}</td>
                  <td>{e.description}</td>
                  <td className="expenses-list__amount">{e.currency} {e.amount.toLocaleString()}</td>
                  <td>{e.date}</td>
                  <td>
                    {e.receiptAttached
                      ? <span style={{ color: '#1e8449', fontSize: 12 }}>✓ Yes</span>
                      : <span style={{ color: '#c0392b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><AlertTriangle size={12} /> Missing</span>
                    }
                  </td>
                  <td>
                    <select
                      value={e.status}
                      onChange={ev => setExpenseStatus(e.visitId, e.id, ev.target.value as ExpenseStatus, 'Nabil Sabin')}
                      className="visit-detail__inline-select"
                    >
                      {(['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'] as ExpenseStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {e.policyBreach
                      ? <span style={{ color: '#ca6f1e', fontSize: 11, fontWeight: 600 }}>⚠ Breach</span>
                      : <span style={{ color: '#1e8449', fontSize: 11 }}>✓ OK</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
