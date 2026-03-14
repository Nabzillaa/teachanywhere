import { useState, useRef } from 'react';
import { Receipt, AlertTriangle, Search, Plus, Pencil, Trash2, Paperclip, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import InlineSelect from '../../components/common/InlineSelect';
import { useAppStore } from '../../store/appStore';
import type { ExpenseStatus, ExpenseCategory, ReceiptFile } from '../../data/types';
import './ExpensesList.css';

const STATUS_FILTERS: (ExpenseStatus | 'All')[] = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'];

function openReceipt(file: ReceiptFile) {
  const byteString = atob(file.dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: file.type });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
const CATEGORIES: ExpenseCategory[] = ['Transport', 'Accommodation', 'Meals', 'Incidentals', 'Other'];

type ExpenseForm = {
  visitId: string;
  claimantName: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  currency: string;
  date: string;
  receiptAttached: boolean;
  receiptFile?: ReceiptFile;
  policyBreach: boolean;
  status: ExpenseStatus;
};

const blank: ExpenseForm = {
  visitId: '', claimantName: '', category: 'Transport', description: '',
  amount: '', currency: 'PHP', date: '', receiptAttached: false, receiptFile: undefined, policyBreach: false, status: 'Submitted',
};

export default function ExpensesList() {
  const visits = useAppStore(s => s.visits);
  const deletedExpenses = useAppStore(s => s.deletedExpenses);
  const setExpenseStatus = useAppStore(s => s.setExpenseStatus);
  const addExpense = useAppStore(s => s.addExpense);
  const updateExpense = useAppStore(s => s.updateExpense);
  const deleteExpense = useAppStore(s => s.deleteExpense);
  const reinstateExpense = useAppStore(s => s.reinstateExpense);
  const purgeDeletedExpense = useAppStore(s => s.purgeDeletedExpense);

  const [tab, setTab] = useState<'active' | 'deleted'>('active');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editId?: string; form: ExpenseForm }>({ open: false, form: blank });
  const [deleteConfirm, setDeleteConfirm] = useState<{ visitId: string; id: string; desc: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [purgeConfirm, setPurgeConfirm] = useState<{ id: string; desc: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sum = (es: typeof allExpenses) => es.reduce((s, e) => s + Number(e.amount), 0);
  const totalAll = sum(allExpenses);
  const totalApproved = sum(allExpenses.filter(e => e.status === 'Approved' || e.status === 'Paid'));
  const totalPending = sum(allExpenses.filter(e => e.status === 'Submitted'));
  const totalRejected = sum(allExpenses.filter(e => e.status === 'Rejected'));
  const missingReceipts = allExpenses.filter(e => !e.receiptAttached && e.status !== 'Rejected').length;

  const openAdd = () => setModal({ open: true, form: { ...blank, visitId: visits[0]?.id || '' } });

  const openEdit = (e: typeof allExpenses[0]) => setModal({
    open: true, editId: e.id,
    form: { visitId: e.visitId, claimantName: e.claimantName, category: e.category, description: e.description, amount: String(e.amount), currency: e.currency, date: e.date, receiptAttached: e.receiptAttached, receiptFile: e.receiptFile, policyBreach: e.policyBreach ?? false, status: e.status },
  });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setF('receiptFile', { name: file.name, type: file.type, dataUrl });
      setF('receiptAttached', true);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const { visitId, amount, ...rest } = modal.form;
    if (!visitId || !amount) return;
    const data = { ...rest, amount: Number(amount), receiptFile: rest.receiptFile ?? undefined };
    if (modal.editId) updateExpense(visitId, modal.editId, data);
    else addExpense(visitId, data);
    setModal({ open: false, form: blank });
  };

  const confirmDelete = () => {
    if (!deleteConfirm || !deleteReason.trim()) return;
    deleteExpense(deleteConfirm.visitId, deleteConfirm.id, deleteReason.trim());
    setDeleteConfirm(null);
    setDeleteReason('');
  };

  const setF = <K extends keyof ExpenseForm>(k: K, v: ExpenseForm[K]) =>
    setModal(m => ({ ...m, form: { ...m.form, [k]: v } }));

  return (
    <div className="expenses-list">
      <PageHeader
        icon={<Receipt size={20} />}
        title="Expenses & Reimbursements"
        actions={
          <button className="page-header__btn page-header__btn--primary" onClick={openAdd}>
            <Plus size={14} /> Add Expense
          </button>
        }
      />

      <div className="expenses-list__summary">
        {[
          { label: 'Total Expenses', value: `PHP ${totalAll.toLocaleString()}`, color: undefined },
          { label: 'Approved & Paid', value: `PHP ${totalApproved.toLocaleString()}`, color: '#1e8449' },
          { label: 'Pending Approval', value: `PHP ${totalPending.toLocaleString()}`, color: '#ca6f1e' },
          { label: totalRejected > 0 ? `Rejected — PHP ${totalRejected.toLocaleString()}` : 'Missing Receipts', value: totalRejected > 0 ? String(allExpenses.filter(e => e.status === 'Rejected').length) + ' claims' : String(missingReceipts), color: (missingReceipts > 0 || totalRejected > 0) ? '#c0392b' : undefined },
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

      {/* Tabs */}
      <div className="expenses-list__tabs">
        <button className={`expenses-list__tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active Claims ({allExpenses.length})
        </button>
        <button className={`expenses-list__tab ${tab === 'deleted' ? 'active' : ''}`} onClick={() => setTab('deleted')}>
          Deleted ({deletedExpenses.length})
        </button>
      </div>

      {tab === 'active' && (
        <>
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
                  <tr><th>Visit</th><th>Claimant</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Receipt</th><th>Status</th><th>Policy</th><th></th></tr>
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
                        {e.receiptFile
                          ? <button className="expenses-list__view-receipt" onClick={() => openReceipt(e.receiptFile!)} title={e.receiptFile.name}><ExternalLink size={11} /> View</button>
                          : e.receiptAttached
                            ? <span style={{ color: '#1e8449', fontSize: 12 }}>✓ Yes</span>
                            : <span style={{ color: '#c0392b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><AlertTriangle size={12} /> Missing</span>
                        }
                      </td>
                      <td>
                        <InlineSelect
                          value={e.status}
                          options={['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid']}
                          onChange={v => setExpenseStatus(e.visitId, e.id, v as ExpenseStatus, 'Nabil Sabin')}
                        />
                      </td>
                      <td>
                        {e.policyBreach
                          ? <span style={{ color: '#ca6f1e', fontSize: 11, fontWeight: 600 }}>⚠ Breach</span>
                          : <span style={{ color: '#1e8449', fontSize: 11 }}>✓ OK</span>
                        }
                      </td>
                      <td>
                        <div className="visit-detail__row-actions">
                          <button className="visit-detail__action-btn" title="Edit" onClick={() => openEdit(e)}><Pencil size={13} /></button>
                          <button className="visit-detail__action-btn visit-detail__action-btn--delete" title="Delete" onClick={() => { setDeleteConfirm({ visitId: e.visitId, id: e.id, desc: e.description }); setDeleteReason(''); }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </>
      )}

      {tab === 'deleted' && (
        <SectionCard title={`Deleted Expenses (${deletedExpenses.length})`}>
          {deletedExpenses.length === 0 ? (
            <p className="section-card__empty">No deleted expenses</p>
          ) : (
            <table className="expenses-list__table">
              <thead>
                <tr><th>Visit</th><th>Claimant</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Was Status</th><th>Deleted At</th><th>Reason</th><th></th></tr>
              </thead>
              <tbody>
                {deletedExpenses.map(e => (
                  <tr key={`${e.id}-${e.deletedAt}`}>
                    <td className="expenses-list__ref">{e.visitRef}</td>
                    <td style={{ fontWeight: 600 }}>{e.claimantName}</td>
                    <td>{e.category}</td>
                    <td>{e.description}</td>
                    <td className="expenses-list__amount">{e.currency} {e.amount.toLocaleString()}</td>
                    <td>{e.date}</td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(e.deletedAt).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontSize: 12, color: '#ca6f1e', fontStyle: 'italic', maxWidth: 200 }}>{e.deletedReason}</td>
                    <td>
                      <div className="visit-detail__row-actions">
                        <button
                          className="expenses-list__reinstate-btn"
                          title="Reinstate expense"
                          onClick={() => reinstateExpense(e.id)}
                        >
                          Reinstate
                        </button>
                        <button
                          className="visit-detail__action-btn visit-detail__action-btn--delete"
                          title="Permanently delete"
                          onClick={() => setPurgeConfirm({ id: e.id, desc: e.description })}
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
      )}

      {modal.open && (
        <Modal title={modal.editId ? 'Edit Expense' : 'Add Expense'} onClose={() => setModal({ open: false, form: blank })} onSubmit={save} width={540}>
          {!modal.editId && (
            <div className="modal-field">
              <label>Visit *</label>
              <select value={modal.form.visitId} onChange={e => setF('visitId', e.target.value)}>
                <option value="">— Select a visit —</option>
                {visits.map(v => <option key={v.id} value={v.id}>{v.visitRef} · {v.company}</option>)}
              </select>
            </div>
          )}
          <div className="modal-row">
            <div className="modal-field">
              <label>Claimant Name *</label>
              <input value={modal.form.claimantName} onChange={e => setF('claimantName', e.target.value)} placeholder="e.g. Maria Santos" />
            </div>
            <div className="modal-field">
              <label>Category</label>
              <select value={modal.form.category} onChange={e => setF('category', e.target.value as ExpenseCategory)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-field">
            <label>Description *</label>
            <input value={modal.form.description} onChange={e => setF('description', e.target.value)} placeholder="e.g. Airport transfer" />
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Amount *</label>
              <input type="number" value={modal.form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0" />
            </div>
            <div className="modal-field">
              <label>Currency</label>
              <select value={modal.form.currency} onChange={e => setF('currency', e.target.value)}>
                <option>PHP</option><option>USD</option><option>AUD</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Date</label>
              <input type="date" value={modal.form.date} onChange={e => setF('date', e.target.value)} />
            </div>
          </div>
          <div className="modal-field">
            <label>Receipt</label>
            <div
              className="expenses-list__upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              {modal.form.receiptFile ? (
                <span className="expenses-list__upload-attached">
                  <Paperclip size={13} /> {modal.form.receiptFile.name}
                  <button onClick={e => { e.stopPropagation(); setF('receiptFile', undefined); setF('receiptAttached', false); }} className="expenses-list__upload-clear">✕</button>
                </span>
              ) : (
                <span className="expenses-list__upload-hint"><Paperclip size={13} /> Click or drag to attach receipt (image or PDF)</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={modal.form.policyBreach} onChange={e => setF('policyBreach', e.target.checked)} style={{ width: 'auto', accentColor: 'var(--accent-red)' }} />
              Policy Breach
            </label>
          </div>
        </Modal>
      )}

      {purgeConfirm && (
        <ConfirmModal
          title="Permanently Delete Expense"
          message={<>This will permanently remove <strong>{purgeConfirm.desc}</strong> and cannot be undone.</>}
          onConfirm={() => { purgeDeletedExpense(purgeConfirm.id); setPurgeConfirm(null); }}
          onClose={() => setPurgeConfirm(null)}
          confirmLabel="Delete Permanently"
        />
      )}

      {deleteConfirm && (
        <Modal
          title="Delete Expense"
          onClose={() => { setDeleteConfirm(null); setDeleteReason(''); }}
          onSubmit={confirmDelete}
          submitLabel="Delete"
          submitDestructive
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
            You are deleting <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.desc}</strong>. A reason is required and will be recorded in the Deleted tab.
          </p>
          <div className="modal-field">
            <label>Reason for deletion *</label>
            <textarea
              rows={3}
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="e.g. Duplicate entry, incorrect amount, claimed in wrong visit..."
              style={{ resize: 'vertical' }}
              autoFocus
            />
          </div>
          {!deleteReason.trim() && (
            <p style={{ fontSize: 11, color: '#c0392b', marginTop: 4 }}>A reason is required before deleting.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
