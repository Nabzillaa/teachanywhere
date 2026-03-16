import { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { sendEmail } from '../../services/emailService';
import type { CommunicationLog, Visit } from '../../data/types';

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

function formatDate(dateStr: string) {
  if (!dateStr) return dateStr;
  return new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function generateBody(type: Template['type'], visit: Visit, senderName: string): string {
  const arrival = formatDate(visit.arrivalDate);
  const departure = formatDate(visit.departureDate);
  const officeDays = visit.officeDays?.length ? visit.officeDays.map(d => formatDate(d)).join(', ') : 'TBC';
  const signoff = senderName || visit.visitLead || 'your TechAnywhere coordinator';

  switch (type) {
    case 'Initial Planning': {
      const attendeeList = visit.clientAttendees.length
        ? visit.clientAttendees.map(a => `  - ${a.name} (${a.role})`).join('\n')
        : '  - Please provide attendee details';
      const hotelLine = visit.hotelName
        ? `- Hotel: ${visit.hotelName}${visit.hotelAddress ? `, ${visit.hotelAddress}` : ''}`
        : "- Please advise your hotel preference or if you'd like us to assist with booking";
      return `Dear ${visit.company} team,

I hope this message finds you well. We are looking forward to welcoming you to our Manila office from ${arrival} to ${departure}.

To help us prepare, could you please confirm or update the following:

ATTENDEES
${attendeeList}

TRAVEL DETAILS
- Flight arrival info (flight number, arrival time, terminal)
- Return flight details

ACCOMMODATION
${hotelLine}

REQUIREMENTS
- Dietary requirements or allergies for each attendee
- Any accessibility or special requirements

VISIT OBJECTIVES
${visit.visitGoals ? visit.visitGoals : '- Please share your key objectives or agenda topics for the visit'}

Please respond at your earliest convenience so we can ensure everything is arranged for a smooth and productive visit.

Looking forward to seeing you soon.

Warm regards,
${signoff}
TechAnywhere`;
    }

    case 'Itinerary Confirmation': {
      const transportLines = visit.transportBookings.length
        ? visit.transportBookings.map(t =>
            `  Date: ${formatDate(t.date)}\n  Pickup: ${t.pickupLocation} at ${t.pickupTime}\n  Drop-off: ${t.dropoffLocation}\n  Driver: ${t.driverName} — ${t.driverContact}\n  Vehicle: ${t.vehicleType}${t.vehicleReg ? ` (${t.vehicleReg})` : ''}`
          ).join('\n\n')
        : '  Transport details to be confirmed — we will follow up shortly.';

      const accomLines = visit.accommodationBookings.length
        ? visit.accommodationBookings.map(a =>
            `  Guest: ${a.guestName}\n  Hotel: ${a.hotelName}, ${a.hotelAddress}\n  Check-in: ${formatDate(a.checkIn)} | Check-out: ${formatDate(a.checkOut)}\n  Room: ${a.roomType}${a.confirmationNumber ? ` | Confirmation: ${a.confirmationNumber}` : ''}`
          ).join('\n\n')
        : visit.hotelName
          ? `  ${visit.hotelName}${visit.hotelAddress ? `, ${visit.hotelAddress}` : ''}`
          : '  Accommodation details to be confirmed.';

      return `Dear ${visit.company} team,

Please find your confirmed itinerary for your visit to Manila from ${arrival} to ${departure}.

──────────────────────────────
TRANSPORT ARRANGEMENTS
──────────────────────────────
${transportLines}

──────────────────────────────
ACCOMMODATION
──────────────────────────────
${accomLines}

──────────────────────────────
OFFICE VISIT DAYS
──────────────────────────────
  ${officeDays}

──────────────────────────────
VISIT OBJECTIVES
──────────────────────────────
${visit.visitGoals ? `  ${visit.visitGoals}` : '  To be confirmed.'}
${visit.socialActivities ? `\nSOCIAL ACTIVITIES\n  ${visit.socialActivities}` : ''}
Should you have any questions or need to make changes, please don't hesitate to get in touch.

We look forward to welcoming you to Manila!

Warm regards,
${signoff}
TechAnywhere`;
    }

    case 'Day-Before Reminder': {
      const firstTransport = visit.transportBookings[0];
      const driverInfo = firstTransport
        ? `Your driver tomorrow is ${firstTransport.driverName} (${firstTransport.driverContact}). They will pick you up from ${firstTransport.pickupLocation} at ${firstTransport.pickupTime}.`
        : 'Your transport details will be shared shortly — please reach out if you need anything.';

      return `Hi ${visit.company} team! 👋

Just a quick reminder that we're looking forward to welcoming you tomorrow, ${arrival}.

${driverInfo}

If you have any questions or need anything before then, don't hesitate to reach out. We're here to help!

See you tomorrow 🙂
${signoff} | TechAnywhere`;
    }

    case 'Day-Of Check-In': {
      const firstTransport = visit.transportBookings[0];
      const driverLine = firstTransport
        ? `Your driver ${firstTransport.driverName} is on the way and will meet you at ${firstTransport.pickupLocation} at ${firstTransport.pickupTime}.`
        : 'Our team is ready to assist you with your arrival today.';

      return `Good morning, ${visit.company} team! 🌟

Welcome to Manila — we're so excited to have you here!

${driverLine}

Your support contact for today is ${signoff}. Please reach out any time if you need anything at all.

We look forward to a wonderful visit! 😊
TechAnywhere`;
    }

    case 'Internal': {
      const clientList = visit.clientAttendees.length
        ? visit.clientAttendees.map(a => `  • ${a.name} — ${a.role}${a.dietaryRequirements ? ` (Dietary: ${a.dietaryRequirements})` : ''}`).join('\n')
        : '  • To be confirmed';

      const internalList = visit.internalAttendees.length
        ? visit.internalAttendees.map(a => `  • ${a.name} — ${a.role}, ${a.department}${a.attendanceConfirmed ? ' ✓' : ' (pending)'}`).join('\n')
        : '  • To be confirmed';

      return `📋 TEAM BRIEF — ${visit.company} Visit | ${arrival} to ${departure}

VISIT OVERVIEW
  Purpose: ${visit.purpose}
  Office Days: ${officeDays}
  Visit Lead: ${signoff}
${visit.operationsCoordinator ? `  Ops Coordinator: ${visit.operationsCoordinator}` : ''}

CLIENT ATTENDEES
${clientList}

INTERNAL TEAM
${internalList}

OBJECTIVES
${visit.visitGoals ? `  ${visit.visitGoals}` : '  To be confirmed — please check with the visit lead.'}
${visit.specialRequirements ? `\nSPECIAL REQUIREMENTS\n  ${visit.specialRequirements}` : ''}${visit.socialActivities ? `\nSOCIAL ACTIVITIES\n  ${visit.socialActivities}` : ''}

REMINDERS
  • Please confirm your attendance if you haven't already
  • Smart casual dress code unless advised otherwise
  • Be prepared to introduce yourself and your role
  • Any questions — reach out to ${signoff}`;
    }

    case 'Thank-You': {
      return `Dear ${visit.company} team,

On behalf of the entire TechAnywhere team, I wanted to take a moment to thank you for visiting us in Manila from ${arrival} to ${departure}.

It was truly a pleasure having you here, and we hope you found the visit valuable and enjoyable. ${visit.visitGoals ? `We were glad to work through ${visit.visitGoals} together.` : ''}

We will follow up shortly with any agreed action items and next steps. In the meantime, please don't hesitate to reach out if you have any questions or feedback.

We hope to see you again soon, and please do pass on our warm regards to the rest of the team.

With thanks and warm regards,
${signoff}
TechAnywhere`;
    }

    default:
      return '';
  }
}

export default function TemplateModal({ template, onClose }: TemplateModalProps) {
  const visits = useAppStore(s => s.visits);
  const clients = useAppStore(s => s.clients);
  const addCommunication = useAppStore(s => s.addCommunication);
  const currentUser = useAuthStore(s => s.user);

  const [form, setForm] = useState({
    visitId: '',
    recipientAttendeeId: '',
    recipient: '',
    subject: template.subjectTemplate,
    notes: '',
    senderName: currentUser?.name ?? '',
  });
  const [sending, setSending] = useState(false);

  const selectedVisit = visits.find(v => v.id === form.visitId);

  const senderOptions: { label: string; value: string }[] = [
    ...(currentUser ? [{ label: `${currentUser.name} (you)`, value: currentUser.name }] : []),
    ...(selectedVisit?.internalAttendees
      .filter(a => !currentUser || a.name !== currentUser.name)
      .map(a => ({ label: `${a.name} — ${a.role}`, value: a.name })) ?? []),
  ];

  const clientAttendees = (selectedVisit?.clientAttendees ?? []).map(a => {
    const latest = clients.find(c => c.name === a.name && c.company === a.company);
    return latest ? { ...a, ...latest } : a;
  });

  useEffect(() => {
    if (!selectedVisit) return;

    const company = selectedVisit.company;
    const dates = `${selectedVisit.arrivalDate} to ${selectedVisit.departureDate}`;
    const resolvedSubject = template.subjectTemplate
      .replace('{company}', company)
      .replace('{dates}', dates);

    const senderName = form.senderName || currentUser?.name || selectedVisit.visitLead || '';
    const body = generateBody(template.type, selectedVisit, senderName);

    const firstClient = clientAttendees[0];
    const autoRecipient = firstClient?.email ?? '';
    const autoAttendeeId = firstClient?.id ?? '';

    setForm(f => ({
      ...f,
      subject: resolvedSubject,
      notes: body,
      recipient: autoRecipient || f.recipient,
      recipientAttendeeId: autoAttendeeId || f.recipientAttendeeId,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.visitId]);

  useEffect(() => {
    if (!selectedVisit) return;
    const body = generateBody(template.type, selectedVisit, form.senderName);
    setForm(f => ({ ...f, notes: body }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.senderName]);

  const handleRecipientAttendeeChange = (attendeeId: string) => {
    const attendee = clientAttendees.find(a => a.id === attendeeId);
    setForm(f => ({
      ...f,
      recipientAttendeeId: attendeeId,
      recipient: attendee?.email ?? '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.visitId || !form.subject || !form.recipient) {
      alert('Please fill in Visit, Recipient, and Subject');
      return;
    }

    setSending(true);
    try {
      await sendEmail({
        to_email: form.recipient,
        subject: form.subject,
        message: form.notes || form.subject,
      });

      const comm: Omit<CommunicationLog, 'id' | 'visitId'> = {
        type: template.type,
        subject: form.subject,
        recipient: form.recipient,
        channel: template.channel,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        notes: form.notes,
      };
      addCommunication(form.visitId, comm);
      onClose();
    } catch {
      const comm: Omit<CommunicationLog, 'id' | 'visitId'> = {
        type: template.type,
        subject: form.subject,
        recipient: form.recipient,
        channel: template.channel,
        status: 'Failed',
        notes: form.notes,
      };
      addCommunication(form.visitId, comm);
      alert('Failed to send email. The communication has been logged as Failed.');
      setSending(false);
    }
  };

  return (
    <Modal
      title={`Use Template: ${template.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={sending ? 'Sending…' : 'Send'}
      width={600}
    >
      <div className="modal-field">
        <label>Select Visit *</label>
        <select
          value={form.visitId}
          onChange={e => setForm(f => ({ ...f, visitId: e.target.value, recipient: '', recipientAttendeeId: '' }))}
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
        <label>Sending As *</label>
        <select
          value={form.senderName}
          onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))}
        >
          {senderOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {selectedVisit && clientAttendees.length > 0 ? (
        <div className="modal-row">
          <div className="modal-field" style={{ flex: 1 }}>
            <label>Recipient *</label>
            <select
              value={form.recipientAttendeeId}
              onChange={e => handleRecipientAttendeeChange(e.target.value)}
            >
              <option value="">— Select attendee —</option>
              {clientAttendees.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
          <div className="modal-field" style={{ flex: 1 }}>
            <label>Email Address *</label>
            <input
              value={form.recipient}
              onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
              placeholder="client@company.com"
            />
          </div>
        </div>
      ) : (
        <div className="modal-field">
          <label>Recipient (Email Address) *</label>
          <input
            value={form.recipient}
            onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
            placeholder="client@company.com"
          />
        </div>
      )}

      <div className="modal-field">
        <label>Subject *</label>
        <input
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          placeholder="Message subject"
        />
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
        <label>Message Body</label>
        <textarea
          rows={10}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder={selectedVisit ? '' : 'Select a visit to auto-populate the message'}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong>Template Description:</strong> {template.description}
      </div>
    </Modal>
  );
}
