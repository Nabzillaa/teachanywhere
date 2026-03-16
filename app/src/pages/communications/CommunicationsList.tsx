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

const PAGE_SIZE = 10;

export default function CommunicationsList() {
  const visits = useAppStore(s => s.visits);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: '', channel: '', status: '' });

  const allComms = visits.flatMap(v =>
    v.communications.map(c => ({ ...c, visitRef: v.visitRef, company: v.company }))
  ).sort((a, b) => new Date(b.sentAt || '').getTime() - new Date(a.sentAt || '').getTime());

  const typeOptions = [...new Set(allComms.map(c => c.type))].sort();
  const channelOptions = [...new Set(allComms.map(c => c.channel))].filter(c => c !== 'Slack' && c !== 'Phone').sort();
  const statusOptions = [...new Set(allComms.map(c => c.status))].sort();

  const filtered = allComms.filter(c => {
    const search = filters.search.toLowerCase();
    if (search && !c.company.toLowerCase().includes(search) && !c.subject.toLowerCase().includes(search) && !c.recipient.toLowerCase().includes(search)) return false;
    if (filters.type && c.type !== filters.type) return false;
    if (filters.channel && c.channel !== filters.channel) return false;
    if (filters.status && c.status !== filters.status) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageComms = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

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

      <div className="comms-page__filters">
        <input
          className="comms-page__filter-search"
          placeholder="Search company, subject, recipient…"
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select value={filters.type} onChange={e => setFilter('type', e.target.value)}>
          <option value="">All Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.channel} onChange={e => setFilter('channel', e.target.value)}>
          <option value="">All Channels</option>
          {channelOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.search || filters.type || filters.channel || filters.status) && (
          <button className="comms-page__filter-clear" onClick={() => { setFilters({ search: '', type: '', channel: '', status: '' }); setPage(1); }}>
            Clear
          </button>
        )}
      </div>

      <SectionCard title={`Communication Log — All Visits (${allComms.length})`}>
        {filtered.length === 0 ? (
          <p className="section-card__empty">No communications match the current filters</p>
        ) : (
          <>
            <table className="comms-page__table">
              <thead>
                <tr><th>Visit</th><th>Type</th><th>Subject</th><th>Recipient</th><th>Channel</th><th>Sent</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pageComms.map(c => (
                  <tr key={c.id}>
                    <td className="comms-page__ref">{c.visitRef} · {c.company}</td>
                    <td><Badge label={c.type} /></td>
                    <td>{c.subject}</td>
                    <td>{c.recipient}</td>
                    <td>{c.channel}</td>
                    <td>{c.sentAt ? new Date(c.sentAt).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td><Badge label={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="comms-page__pagination">
                <button
                  className="comms-page__page-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  ‹ Prev
                </button>
                <span className="comms-page__page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="comms-page__page-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
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
