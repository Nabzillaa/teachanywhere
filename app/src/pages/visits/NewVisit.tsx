import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import { useAppStore } from '../../store/appStore';
import './NewVisit.css';

export default function NewVisit() {
  const navigate = useNavigate();
  const addVisit = useAppStore(s => s.addVisit);

  const [form, setForm] = useState({
    company: '',
    clientName: '',
    clientId: '',
    purpose: '',
    arrivalDate: '',
    departureDate: '',
    officeDays: '',
    visitLead: 'Nabil Sabin',
    operationsCoordinator: '',
    hotelName: '',
    hotelAddress: '',
    flightDetails: '',
    visitGoals: '',
    specialRequirements: '',
    socialActivities: '',
    status: 'Draft' as const,
  });

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addVisit({
      company: form.company,
      clientName: form.clientName,
      clientId: form.clientId || form.company.toLowerCase().replace(/\s+/g, '-'),
      purpose: form.purpose,
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      officeDays: form.officeDays ? form.officeDays.split(',').map(d => d.trim()) : [],
      visitLead: form.visitLead,
      operationsCoordinator: form.operationsCoordinator || undefined,
      hotelName: form.hotelName || undefined,
      hotelAddress: form.hotelAddress || undefined,
      flightDetails: form.flightDetails || undefined,
      visitGoals: form.visitGoals || undefined,
      specialRequirements: form.specialRequirements || undefined,
      socialActivities: form.socialActivities || undefined,
      status: 'Draft',
    });
    navigate(`/visits/${id}`);
  };

  return (
    <div className="new-visit">
      <div className="new-visit__breadcrumb">
        <button className="visit-detail__back" onClick={() => navigate('/visits')}>
          <ArrowLeft size={16} /> Visits
        </button>
        <span style={{ color: 'var(--border-light)' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>New Visit</span>
      </div>

      <PageHeader icon={<Calendar size={20} />} title="Create New Visit" />

      <form onSubmit={handleSubmit}>
        <div className="new-visit__grid">
          <SectionCard title="Client Information">
            <div className="new-visit__fields">
              <FormField label="Client Company *">
                <input type="text" placeholder="e.g. Interact Solutions" value={form.company} onChange={e => handleChange('company', e.target.value)} required />
              </FormField>
              <FormField label="Primary Contact Name *">
                <input type="text" placeholder="e.g. Thomas Harrison" value={form.clientName} onChange={e => handleChange('clientName', e.target.value)} required />
              </FormField>
              <FormField label="Purpose of Visit *">
                <input type="text" placeholder="e.g. Quarterly team alignment and product review" value={form.purpose} onChange={e => handleChange('purpose', e.target.value)} required />
              </FormField>
              <FormField label="Special Requirements">
                <textarea rows={3} placeholder="Dietary requirements, accessibility needs, etc." value={form.specialRequirements} onChange={e => handleChange('specialRequirements', e.target.value)} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Visit Schedule">
            <div className="new-visit__fields">
              <FormField label="Arrival Date *">
                <input type="date" value={form.arrivalDate} onChange={e => handleChange('arrivalDate', e.target.value)} required />
              </FormField>
              <FormField label="Departure Date *">
                <input type="date" value={form.departureDate} onChange={e => handleChange('departureDate', e.target.value)} required />
              </FormField>
              <FormField label="Office Days (comma-separated dates)">
                <input type="text" placeholder="e.g. 2026-03-17, 2026-03-18" value={form.officeDays} onChange={e => handleChange('officeDays', e.target.value)} />
              </FormField>
              <FormField label="Visit Lead *">
                <select value={form.visitLead} onChange={e => handleChange('visitLead', e.target.value)}>
                  <option>Nabil Sabin</option>
                  <option>Maria Santos</option>
                  <option>Other</option>
                </select>
              </FormField>
              <FormField label="Operations Coordinator">
                <input type="text" placeholder="e.g. Maria Santos" value={form.operationsCoordinator} onChange={e => handleChange('operationsCoordinator', e.target.value)} />
              </FormField>
              <FormField label="Flight Details">
                <input type="text" placeholder="e.g. QF19 SYD-MNL arriving 07:30" value={form.flightDetails} onChange={e => handleChange('flightDetails', e.target.value)} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Accommodation">
            <div className="new-visit__fields">
              <FormField label="Hotel Name">
                <input type="text" placeholder="e.g. Seda BGC" value={form.hotelName} onChange={e => handleChange('hotelName', e.target.value)} />
              </FormField>
              <FormField label="Hotel Address">
                <input type="text" placeholder="e.g. 30th St, Bonifacio Global City, Taguig" value={form.hotelAddress} onChange={e => handleChange('hotelAddress', e.target.value)} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Visit Planning">
            <div className="new-visit__fields">
              <FormField label="Visit Goals">
                <textarea rows={4} placeholder="What does success look like? Who needs to meet whom?" value={form.visitGoals} onChange={e => handleChange('visitGoals', e.target.value)} />
              </FormField>
              <FormField label="Social Activities">
                <textarea rows={3} placeholder="Planned dinners, team events, or social sessions" value={form.socialActivities} onChange={e => handleChange('socialActivities', e.target.value)} />
              </FormField>
            </div>
          </SectionCard>
        </div>

        <div className="new-visit__actions">
          <button type="button" className="new-visit__btn-cancel" onClick={() => navigate('/visits')}>Cancel</button>
          <button type="submit" className="new-visit__btn-submit">Create Visit</button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="new-visit__field">
      <label className="new-visit__label">{label}</label>
      {children}
    </div>
  );
}
