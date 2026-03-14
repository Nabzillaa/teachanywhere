import { useState } from 'react';
import Modal from '../../components/common/Modal';
import { useAppStore } from '../../store/appStore';
import type { CommunicationLog } from '../../data/types';

interface Template {
  id: string;
  name: string;
  type: 'Initial Planning' | 'Itinerary Confirmation' | 'Day-Before Reminder' | 'Day-Of Check-In' | 'Thank-You' | 'Follow-Up' | 'Internal' | 'Ad Hoc';
  channel: 'Email' | 'WhatsApp' | 'Phone' | 'Slack';
  description: string;
  subjectTemplate: string;
}

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
}

export default function TemplateModal({ template, onClose }: TemplateModalProps) {
  const visits = useAppStore(s => s.visits);
  const addCommunication = useAppStore(s => s.addCommunication);

  const [form, setForm] = useState({
    visitId: '',
    recipient: '',
    subject: template.subjectTemplate,
    notes: '',
  });

  const selectedVisit = visits.find(v => v.id === form.visitId);

  const handleSubmit = () => {
    if (!form.visitId || !form.subject || !form.recipient) {
      alert('Please fill in Visit, Recipient, and Subject');
      return;
    }

    const comm: Omit<CommunicationLog, 'id' | 'visitId'> = {
      type: template.type,
      subject: form.subject,
      recipient: form.recipient,
      channel: template.channel,
      status: 'Draft',
      notes: form.notes,
    };

    addCommunication(form.visitId, comm);
    onClose();
  };

  const insertPlaceholder = (placeholder: string) => {
    setForm(f => ({
      ...f,
      subject: f.subject.replace(`{${placeholder}}`, selectedVisit ?
        (placeholder === 'company' ? selectedVisit.company :
         placeholder === 'dates' ? `${selectedVisit.arrivalDate} to ${selectedVisit.departureDate}` :
         placeholder)
        : `{${placeholder}}`),
    }));
  };

  return (
    <Modal
      title={`Use Template: ${template.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Create Communication"
      width={600}
    >
      <div className="modal-field">
        <label>Select Visit *</label>
        <select
          value={form.visitId}
          onChange={e => setForm(f => ({ ...f, visitId: e.target.value }))}
        >
          <option value="">— Choose a visit —</option>
          {visits.map(v => (
            <option key={v.id} value={v.id}>
              {v.visitRef} · {v.company} ({v.arrivalDate})
            </option>
          ))}
        </select>
      </div>

      <div className="modal-field">
        <label>Recipient (Email/Phone/Name) *</label>
        <input
          value={form.recipient}
          onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
          placeholder={template.channel === 'Email' ? 'client@company.com' : 'Contact name or number'}
        />
      </div>

      <div className="modal-field">
        <label>Subject *</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Message subject"
          />
          {selectedVisit && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="section-card__edit-btn"
                style={{ fontSize: 11, padding: '4px 8px' }}
                onClick={() => insertPlaceholder('company')}
                title="Insert company name"
              >
                +Company
              </button>
              <button
                type="button"
                className="section-card__edit-btn"
                style={{ fontSize: 11, padding: '4px 8px' }}
                onClick={() => insertPlaceholder('dates')}
                title="Insert visit dates"
              >
                +Dates
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-field" style={{ flex: 1 }}>
          <label>Channel</label>
          <input
            type="text"
            value={template.channel}
            readOnly
            style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
          />
        </div>
        <div className="modal-field" style={{ flex: 1 }}>
          <label>Type</label>
          <input
            type="text"
            value={template.type}
            readOnly
            style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div className="modal-field">
        <label>Notes / Message Draft</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Add any additional notes or draft the full message here"
        />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong>Template Description:</strong> {template.description}
      </div>
    </Modal>
  );
}
