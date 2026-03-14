import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Badge from '../../components/common/Badge';
import { useAppStore } from '../../store/appStore';
import TemplateModal from './TemplateModal';
import './CommunicationsList.css';

interface Template {
  id: string;
  name: string;
  type: 'Initial Planning' | 'Itinerary Confirmation' | 'Day-Before Reminder' | 'Day-Of Check-In' | 'Thank-You' | 'Follow-Up' | 'Internal' | 'Ad Hoc';
  channel: 'Email' | 'WhatsApp' | 'Phone' | 'Slack';
  description: string;
  subjectTemplate: string;
}

export default function CommunicationsList() {
  const visits = useAppStore(s => s.visits);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const allComms = visits.flatMap(v =>
    v.communications.map(c => ({ ...c, visitRef: v.visitRef, company: v.company }))
  ).sort((a, b) => new Date(b.sentAt || '').getTime() - new Date(a.sentAt || '').getTime());

  const TEMPLATES: Template[] = [
    {
      id: 't1',
      name: 'Initial Planning Email',
      type: 'Initial Planning',
      channel: 'Email',
      description: 'Sent 10–14 days before arrival. Requests attendee details, flight info, hotel, dietary requirements, and visit objectives.',
      subjectTemplate: 'Visit Planning – {company} – {dates}',
    },
    {
      id: 't2',
      name: 'Confirmed Itinerary Email',
      type: 'Itinerary Confirmation',
      channel: 'Email',
      description: 'Sent 5–7 days before. Includes arrival details, driver info, hotel, office details, and full visit schedule.',
      subjectTemplate: 'Confirmed Itinerary – {company} – {dates}',
    },
    {
      id: 't3',
      name: 'Day-Before Reminder',
      type: 'Day-Before Reminder',
      channel: 'WhatsApp',
      description: 'Sent 1 day before arrival. Short warm message with driver details and contact info.',
      subjectTemplate: 'Arrival Tomorrow – Welcome Details',
    },
    {
      id: 't4',
      name: 'Day-Of Arrival Check-In',
      type: 'Day-Of Check-In',
      channel: 'WhatsApp',
      description: 'Sent on arrival day. Live support contact and welcome.',
      subjectTemplate: 'Welcome to Manila – Support Hotline',
    },
    {
      id: 't5',
      name: 'Internal Team Brief',
      type: 'Internal',
      channel: 'Slack',
      description: 'Sent to team channel before visit. Covers objectives, schedule, client sensitivities, dress code, attendance expectations.',
      subjectTemplate: 'Team Brief – {company} Visit – {dates}',
    },
    {
      id: 't6',
      name: 'Post-Visit Thank You',
      type: 'Thank-You',
      channel: 'Email',
      description: 'Sent within 2 business days of visit end. Warm thanks, visit summary, confirmed next steps.',
      subjectTemplate: 'Thank You – {company} Visit',
    },
  ];

  return (
    <div className="comms-page">
      <PageHeader icon={<MessageSquare size={20} />} title="Communications" />

      <SectionCard title={`Communication Log — All Visits (${allComms.length})`}>
        {allComms.length === 0 ? (
          <p className="section-card__empty">No communications logged across any visits</p>
        ) : (
          <table className="comms-page__table">
            <thead>
              <tr><th>Visit</th><th>Type</th><th>Subject</th><th>Recipient</th><th>Channel</th><th>Sent</th><th>Status</th></tr>
            </thead>
            <tbody>
              {allComms.map(c => (
                <tr key={c.id}>
                  <td className="comms-page__ref">{c.visitRef} · {c.company}</td>
                  <td><Badge label={c.type} /></td>
                  <td>{c.subject}</td>
                  <td>{c.recipient}</td>
                  <td>{c.channel}</td>
                  <td>{c.sentAt ? new Date(c.sentAt).toLocaleDateString('en-AU') : '—'}</td>
                  <td><Badge label={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard title="Communication Templates">
        <div className="comms-page__templates">
          {TEMPLATES.map(t => (
            <div key={t.id} className="comms-page__template">
              <div className="comms-page__template-header">
                <span className="comms-page__template-name">{t.name}</span>
                <span className="comms-page__template-type">{t.channel}</span>
              </div>
              <div className="comms-page__template-desc">{t.description}</div>
              <button className="comms-page__template-btn" onClick={() => setSelectedTemplate(t)}>
                Use Template
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
