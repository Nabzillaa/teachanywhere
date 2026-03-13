import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Check, Plus, Trash2, ClipboardList } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { OFFICE_READINESS_TEMPLATE } from '../../data/mockData';
import type { VisitStatus, BookingStatus } from '../../data/types';
import './VisitWizard.css';

const STEPS = ['Overview', 'Client Attendees', 'Internal Team', 'Travel & Logistics', 'Office Readiness', 'Tasks', 'Review'];
const DIETARY = ['', 'None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'Nut Allergy', 'Shellfish Allergy', 'Egg Allergy', 'Soy Allergy', 'Low FODMAP', 'Diabetic-Friendly', 'Other (see notes)'];

type Overview = { company: string; clientName: string; clientId: string; purpose: string; arrivalDate: string; departureDate: string; officeDays: string; visitLead: string; operationsCoordinator: string; status: VisitStatus; flightDetails: string; hotelName: string; hotelAddress: string; visitGoals: string; socialActivities: string; specialRequirements: string };
type ClientDraft = { name: string; company: string; role: string; email: string; phone: string; dietaryRequirements: string; accessibilityRequirements: string; specialRequests: string; policyOverrides: string };
type InternalDraft = { name: string; role: string; department: string; location: 'Manila' | 'Remote'; email: string; phone: string; managerConfirmed: boolean; travelRequired: boolean; accommodationRequired: boolean };
type TransportDraft = { date: string; pickupLocation: string; dropoffLocation: string; pickupTime: string; driverName: string; driverContact: string; vehicleType: string; vehicleReg: string; status: BookingStatus; notes: string; cost: string; currency: string };
type AccomDraft = { guestName: string; hotelName: string; hotelAddress: string; checkIn: string; checkOut: string; roomType: string; confirmationNumber: string; status: BookingStatus; cost: string; currency: string };
type OfficeDraft = { category: 'AV & Tech' | 'Hospitality' | 'Access & Facilities' | 'Communication' | 'Signage'; item: string };
type TaskDraft = { title: string; description: string; assignedTo: string; dueDate: string; status: 'Not Started'; phase: 'Initiation' | 'Pre-Arrival' | 'Logistics' | 'Office Prep' | 'Onsite' | 'Post-Visit'; priority: 'High' | 'Medium' | 'Low' };

const ovBlank: Overview = { company: '', clientName: '', clientId: '', purpose: '', arrivalDate: '', departureDate: '', officeDays: '', visitLead: 'Nabil Sabin', operationsCoordinator: '', status: 'Draft', flightDetails: '', hotelName: '', hotelAddress: '', visitGoals: '', socialActivities: '', specialRequirements: '' };
const cBlank: ClientDraft = { name: '', company: '', role: '', email: '', phone: '', dietaryRequirements: '', accessibilityRequirements: '', specialRequests: '', policyOverrides: '' };
const iBlank: InternalDraft = { name: '', role: '', department: '', location: 'Manila', email: '', phone: '', managerConfirmed: false, travelRequired: false, accommodationRequired: false };
const tBlank: TransportDraft = { date: '', pickupLocation: '', dropoffLocation: '', pickupTime: '', driverName: '', driverContact: '', vehicleType: 'Car', vehicleReg: '', status: 'Pending', notes: '', cost: '', currency: 'PHP' };
const aBlank: AccomDraft = { guestName: '', hotelName: '', hotelAddress: '', checkIn: '', checkOut: '', roomType: 'Standard', confirmationNumber: '', status: 'Pending', cost: '', currency: 'PHP' };
const oBlank: OfficeDraft = { category: 'AV & Tech', item: '' };
const kBlank: TaskDraft = { title: '', description: '', assignedTo: '', dueDate: '', status: 'Not Started', phase: 'Initiation', priority: 'Medium' };

export default function VisitWizard() {
  const navigate = useNavigate();
  const addVisit = useAppStore(s => s.addVisit);
  const addClientAttendee = useAppStore(s => s.addClientAttendee);
  const addInternalAttendee = useAppStore(s => s.addInternalAttendee);
  const addTransport = useAppStore(s => s.addTransport);
  const addAccommodation = useAppStore(s => s.addAccommodation);
  const addOfficeReadinessItem = useAppStore(s => s.addOfficeReadinessItem);
  const addTask = useAppStore(s => s.addTask);

  const [step, setStep] = useState(1);
  const [ov, setOv] = useState<Overview>({ ...ovBlank });
  const [ca, setCA] = useState<ClientDraft[]>([]);
  const [cd, setCD] = useState<ClientDraft>({ ...cBlank });
  const [ia, setIA] = useState<InternalDraft[]>([]);
  const [id_, setID] = useState<InternalDraft>({ ...iBlank });
  const [tr, setTR] = useState<TransportDraft[]>([]);
  const [td, setTD] = useState<TransportDraft>({ ...tBlank });
  const [ac, setAC] = useState<AccomDraft[]>([]);
  const [ad, setAD] = useState<AccomDraft>({ ...aBlank });
  const [of_, setOF] = useState<OfficeDraft[]>([]);
  const [od, setOD] = useState<OfficeDraft>({ ...oBlank });
  const [tk, setTK] = useState<TaskDraft[]>([]);
  const [kd, setKD] = useState<TaskDraft>({ ...kBlank });

  const canNext = step !== 1 || !!(ov.company && ov.clientName && ov.purpose && ov.arrivalDate && ov.departureDate);

  const create = () => {
    const id = addVisit({ ...ov, clientId: ov.clientId || ov.company.toLowerCase().replace(/\s+/g, '-'), officeDays: ov.officeDays ? ov.officeDays.split(',').map(d => d.trim()).filter(Boolean) : [], operationsCoordinator: ov.operationsCoordinator || undefined, flightDetails: ov.flightDetails || undefined, hotelName: ov.hotelName || undefined, hotelAddress: ov.hotelAddress || undefined, visitGoals: ov.visitGoals || undefined, socialActivities: ov.socialActivities || undefined, specialRequirements: ov.specialRequirements || undefined });
    ca.forEach(a => addClientAttendee(id, a));
    ia.forEach(a => addInternalAttendee(id, { ...a, attendanceConfirmed: false }));
    tr.forEach(t => addTransport(id, { ...t, cost: t.cost ? Number(t.cost) : undefined, vehicleReg: t.vehicleReg || undefined, notes: t.notes || undefined }));
    ac.forEach(a => addAccommodation(id, { ...a, cost: a.cost ? Number(a.cost) : undefined, confirmationNumber: a.confirmationNumber || undefined }));
    of_.forEach(o => addOfficeReadinessItem(id, { ...o, completed: false }));
    tk.forEach(t => addTask(id, { ...t, description: t.description || undefined }));
    navigate(`/visits/${id}`);
  };

  return (
    <div className="wizard">
      <div className="wizard__breadcrumb">
        <button className="visit-detail__back" onClick={() => navigate('/visits')}><ArrowLeft size={16} /> Visits</button>
        <span className="wizard__sep">/</span>
        <span className="wizard__cur">New Visit</span>
      </div>

      <div className="wizard__stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`wz-step ${step === i + 1 ? 'wz-step--active' : ''} ${step > i + 1 ? 'wz-step--done' : ''}`}>
            <div className="wz-step__dot">{step > i + 1 ? <Check size={11} /> : <span>{i + 1}</span>}</div>
            <span className="wz-step__label">{s}</span>
            {i < STEPS.length - 1 && <div className="wz-step__line" />}
          </div>
        ))}
      </div>

      <div className="wizard__body">
        {step === 1 && <StepOverview ov={ov} setOv={setOv} />}
        {step === 2 && <StepClientAttendees items={ca} draft={cd} setDraft={setCD} defaultCompany={ov.company}
          onAdd={() => { if (cd.name) { setCA(a => [...a, { ...cd, company: cd.company || ov.company }]); setCD({ ...cBlank }); } }}
          onRemove={i => setCA(a => a.filter((_, j) => j !== i))} />}
        {step === 3 && <StepInternalTeam items={ia} draft={id_} setDraft={setID}
          onAdd={() => { if (id_.name) { setIA(a => [...a, id_]); setID({ ...iBlank }); } }}
          onRemove={i => setIA(a => a.filter((_, j) => j !== i))} />}
        {step === 4 && <StepTravel transport={tr} tDraft={td} setTDraft={setTD}
          onAddT={() => { if (td.pickupLocation || td.driverName) { setTR(t => [...t, td]); setTD({ ...tBlank }); } }}
          onRemoveT={i => setTR(t => t.filter((_, j) => j !== i))}
          accoms={ac} aDraft={ad} setADraft={setAD}
          onAddA={() => { if (ad.guestName) { setAC(a => [...a, ad]); setAD({ ...aBlank }); } }}
          onRemoveA={i => setAC(a => a.filter((_, j) => j !== i))} />}
        {step === 5 && <StepOffice items={of_} draft={od} setDraft={setOD}
          onAdd={() => { if (od.item) { setOF(o => [...o, od]); setOD({ ...oBlank }); } }}
          onRemove={i => setOF(o => o.filter((_, j) => j !== i))}
          onLoadTemplate={() => { const ex = new Set(of_.map(o => o.item)); setOF(o => [...o, ...OFFICE_READINESS_TEMPLATE.filter(t => !ex.has(t.item)).map(t => ({ category: t.category, item: t.item }))]); }} />}
        {step === 6 && <StepTasks items={tk} draft={kd} setDraft={setKD}
          onAdd={() => { if (kd.title) { setTK(t => [...t, kd]); setKD({ ...kBlank }); } }}
          onRemove={i => setTK(t => t.filter((_, j) => j !== i))} />}
        {step === 7 && <StepReview ov={ov} ca={ca} ia={ia} tr={tr} ac={ac} of_={of_} tk={tk} />}
      </div>

      <div className="wizard__footer">
        <button className="wizard__btn wizard__btn--back" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/visits')}>
          <ArrowLeft size={14} /> {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="wizard__pager">{step} / {STEPS.length}</span>
          {step < STEPS.length
            ? <button className="wizard__btn wizard__btn--next" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Next <ArrowRight size={14} /></button>
            : <button className="wizard__btn wizard__btn--create" onClick={create}><CheckCircle size={14} /> Create Visit</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Sec({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="wz-section">
      <div className="wz-section__header">{title}{action && <span>{action}</span>}</div>
      <div className="wz-section__body">{children}</div>
    </div>
  );
}

function Fld({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`wz-field${full ? ' wz-field--full' : ''}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function Item({ primary, sub, onRemove }: { primary: string; sub?: string; onRemove: () => void }) {
  return (
    <div className="wz-item">
      <div><div className="wz-item__name">{primary}</div>{sub && <div className="wz-item__sub">{sub}</div>}</div>
      <button className="wz-item__remove" onClick={onRemove}><Trash2 size={13} /></button>
    </div>
  );
}

/* ── Step 1: Overview ── */
function StepOverview({ ov, setOv }: { ov: Overview; setOv: React.Dispatch<React.SetStateAction<Overview>> }) {
  const f = (k: keyof Overview) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setOv(o => ({ ...o, [k]: e.target.value }));
  return (
    <>
      <Sec title="Client Information">
        <div className="wz-grid">
          <Fld label="Company *"><input value={ov.company} onChange={f('company')} placeholder="e.g. Interact Solutions" /></Fld>
          <Fld label="Primary Contact *"><input value={ov.clientName} onChange={f('clientName')} placeholder="e.g. Thomas Harrison" /></Fld>
          <Fld label="Purpose of Visit *" full><input value={ov.purpose} onChange={f('purpose')} placeholder="e.g. Quarterly team alignment and product review" /></Fld>
          <Fld label="Special Requirements" full><textarea rows={2} value={ov.specialRequirements} onChange={f('specialRequirements')} placeholder="Dietary, accessibility, other needs..." /></Fld>
        </div>
      </Sec>
      <Sec title="Schedule & Team">
        <div className="wz-grid">
          <Fld label="Arrival Date *"><input type="date" value={ov.arrivalDate} onChange={f('arrivalDate')} /></Fld>
          <Fld label="Departure Date *"><input type="date" value={ov.departureDate} onChange={f('departureDate')} /></Fld>
          <Fld label="Office Days (comma-separated dates)"><input value={ov.officeDays} onChange={f('officeDays')} placeholder="e.g. 2026-03-17, 2026-03-18" /></Fld>
          <Fld label="Status">
            <select value={ov.status} onChange={f('status')}>
              {['Draft', 'Proposed', 'Confirmed', 'In Planning', 'Ready for Arrival', 'Active'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
          <Fld label="Visit Lead">
            <select value={ov.visitLead} onChange={f('visitLead')}>
              <option>Nabil Sabin</option><option>Maria Santos</option><option>Other</option>
            </select>
          </Fld>
          <Fld label="Operations Coordinator"><input value={ov.operationsCoordinator} onChange={f('operationsCoordinator')} placeholder="e.g. Maria Santos" /></Fld>
        </div>
      </Sec>
      <Sec title="Accommodation & Flights">
        <div className="wz-grid">
          <Fld label="Hotel Name"><input value={ov.hotelName} onChange={f('hotelName')} placeholder="e.g. Seda BGC" /></Fld>
          <Fld label="Hotel Address"><input value={ov.hotelAddress} onChange={f('hotelAddress')} placeholder="e.g. 30th St, BGC, Taguig" /></Fld>
          <Fld label="Flight Details" full><input value={ov.flightDetails} onChange={f('flightDetails')} placeholder="e.g. QF19 SYD-MNL arriving 07:30" /></Fld>
        </div>
      </Sec>
      <Sec title="Goals & Activities">
        <div className="wz-grid">
          <Fld label="Visit Goals" full><textarea rows={3} value={ov.visitGoals} onChange={f('visitGoals')} placeholder="What does success look like? Who needs to meet whom?" /></Fld>
          <Fld label="Social Activities" full><textarea rows={2} value={ov.socialActivities} onChange={f('socialActivities')} placeholder="Planned dinners, team events, social sessions..." /></Fld>
        </div>
      </Sec>
    </>
  );
}

/* ── Step 2: Client Attendees ── */
function StepClientAttendees({ items, draft, setDraft, defaultCompany, onAdd, onRemove }: { items: ClientDraft[]; draft: ClientDraft; setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>; defaultCompany: string; onAdd: () => void; onRemove: (i: number) => void }) {
  const f = (k: keyof ClientDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [k]: e.target.value }));
  return (
    <Sec title={`Client Attendees (${items.length} added)`}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6 }}>Add all client-side attendees who will be visiting.</p>
      <div className="wz-grid">
        <Fld label="Full Name"><input value={draft.name} onChange={f('name')} placeholder="e.g. Thomas Harrison" /></Fld>
        <Fld label="Company"><input value={draft.company || defaultCompany} onChange={f('company')} placeholder={defaultCompany || 'Company'} /></Fld>
        <Fld label="Role / Title"><input value={draft.role} onChange={f('role')} placeholder="e.g. CEO" /></Fld>
        <Fld label="Email"><input type="email" value={draft.email} onChange={f('email')} /></Fld>
        <Fld label="Phone / WhatsApp"><input value={draft.phone} onChange={f('phone')} /></Fld>
        <Fld label="Dietary Requirements">
          <select value={draft.dietaryRequirements} onChange={f('dietaryRequirements')}>
            {DIETARY.map(o => <option key={o} value={o}>{o || '— Select —'}</option>)}
          </select>
        </Fld>
        <Fld label="Accessibility Requirements"><input value={draft.accessibilityRequirements} onChange={f('accessibilityRequirements')} /></Fld>
        <Fld label="Special Requests"><input value={draft.specialRequests} onChange={f('specialRequests')} /></Fld>
        <Fld label="Policy Overrides" full><input value={draft.policyOverrides} onChange={f('policyOverrides')} placeholder="e.g. Travel NOT covered under this account" /></Fld>
      </div>
      <button className="wz-add-btn" onClick={onAdd}><Plus size={13} /> Add Attendee</button>
      {items.length === 0 ? <p className="wz-empty">No client attendees added yet</p> : (
        <div className="wz-items">
          {items.map((a, i) => <Item key={i} primary={a.name} sub={`${a.role} · ${a.company}${a.dietaryRequirements ? ` · ${a.dietaryRequirements}` : ''}`} onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </Sec>
  );
}

/* ── Step 3: Internal Team ── */
function StepInternalTeam({ items, draft, setDraft, onAdd, onRemove }: { items: InternalDraft[]; draft: InternalDraft; setDraft: React.Dispatch<React.SetStateAction<InternalDraft>>; onAdd: () => void; onRemove: (i: number) => void }) {
  const f = (k: keyof InternalDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [k]: e.target.value as never }));
  return (
    <Sec title={`Internal Team (${items.length} added)`}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6 }}>Add TechAnywhere staff attending this visit.</p>
      <div className="wz-grid">
        <Fld label="Full Name"><input value={draft.name} onChange={f('name')} placeholder="e.g. Maria Santos" /></Fld>
        <Fld label="Role / Title"><input value={draft.role} onChange={f('role')} placeholder="e.g. Senior Developer" /></Fld>
        <Fld label="Department"><input value={draft.department} onChange={f('department')} placeholder="e.g. Engineering" /></Fld>
        <Fld label="Location">
          <select value={draft.location} onChange={f('location')}><option value="Manila">Manila</option><option value="Remote">Remote</option></select>
        </Fld>
        <Fld label="Email"><input type="email" value={draft.email} onChange={f('email')} /></Fld>
        <Fld label="Phone"><input value={draft.phone} onChange={f('phone')} /></Fld>
      </div>
      <div className="wz-checks">
        {([['managerConfirmed', 'Manager Confirmed'], ['travelRequired', 'Travel Required'], ['accommodationRequired', 'Accommodation Required']] as [keyof InternalDraft, string][]).map(([k, label]) => (
          <label key={k} className="wz-check">
            <input type="checkbox" checked={draft[k] as boolean} onChange={e => setDraft(d => ({ ...d, [k]: e.target.checked }))} />
            {label}
          </label>
        ))}
      </div>
      <button className="wz-add-btn" onClick={onAdd}><Plus size={13} /> Add Team Member</button>
      {items.length === 0 ? <p className="wz-empty">No internal attendees added yet</p> : (
        <div className="wz-items">
          {items.map((a, i) => <Item key={i} primary={a.name} sub={`${a.role} · ${a.department} · ${a.location}${a.travelRequired ? ' · ✈ Travel' : ''}`} onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </Sec>
  );
}

/* ── Step 4: Travel & Logistics ── */
function StepTravel({ transport, tDraft, setTDraft, onAddT, onRemoveT, accoms, aDraft, setADraft, onAddA, onRemoveA }: { transport: TransportDraft[]; tDraft: TransportDraft; setTDraft: React.Dispatch<React.SetStateAction<TransportDraft>>; onAddT: () => void; onRemoveT: (i: number) => void; accoms: AccomDraft[]; aDraft: AccomDraft; setADraft: React.Dispatch<React.SetStateAction<AccomDraft>>; onAddA: () => void; onRemoveA: (i: number) => void }) {
  const tf = (k: keyof TransportDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTDraft(d => ({ ...d, [k]: e.target.value as never }));
  const af = (k: keyof AccomDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setADraft(d => ({ ...d, [k]: e.target.value as never }));
  return (
    <>
      <Sec title={`Transport Bookings (${transport.length})`}>
        <div className="wz-grid wz-grid--3">
          <Fld label="Date"><input type="date" value={tDraft.date} onChange={tf('date')} /></Fld>
          <Fld label="Pickup Time"><input type="time" value={tDraft.pickupTime} onChange={tf('pickupTime')} /></Fld>
          <Fld label="Vehicle Type">
            <select value={tDraft.vehicleType} onChange={tf('vehicleType')}>
              {['Car', 'Van', 'SUV', 'Bus', 'Shuttle', 'Other'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Fld>
          <Fld label="Pickup Location"><input value={tDraft.pickupLocation} onChange={tf('pickupLocation')} placeholder="e.g. NAIA Terminal 3" /></Fld>
          <Fld label="Drop-off Location"><input value={tDraft.dropoffLocation} onChange={tf('dropoffLocation')} placeholder="e.g. Seda BGC" /></Fld>
          <Fld label="Vehicle Reg"><input value={tDraft.vehicleReg} onChange={tf('vehicleReg')} placeholder="e.g. ABC 1234" /></Fld>
          <Fld label="Driver Name"><input value={tDraft.driverName} onChange={tf('driverName')} placeholder="e.g. Juan Dela Cruz" /></Fld>
          <Fld label="Driver Contact"><input value={tDraft.driverContact} onChange={tf('driverContact')} placeholder="+63 9XX XXX XXXX" /></Fld>
          <Fld label="Status">
            <select value={tDraft.status} onChange={tf('status')}>
              {['Pending', 'Booked', 'Confirmed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
          <Fld label="Cost"><input value={tDraft.cost} onChange={tf('cost')} type="number" placeholder="0" /></Fld>
          <Fld label="Currency"><select value={tDraft.currency} onChange={tf('currency')}><option>PHP</option><option>USD</option><option>AUD</option></select></Fld>
          <Fld label="Notes"><input value={tDraft.notes} onChange={tf('notes')} placeholder="Any special instructions..." /></Fld>
        </div>
        <button className="wz-add-btn" onClick={onAddT}><Plus size={13} /> Add Transport Booking</button>
        {transport.length === 0 ? <p className="wz-empty">No transport bookings added yet</p> : (
          <div className="wz-items">
            {transport.map((t, i) => <Item key={i} primary={`${t.vehicleType} · ${t.pickupLocation} → ${t.dropoffLocation}`} sub={`${t.date}${t.pickupTime ? ' ' + t.pickupTime : ''} · Driver: ${t.driverName || 'TBC'} · ${t.status}`} onRemove={() => onRemoveT(i)} />)}
          </div>
        )}
      </Sec>

      <Sec title={`Accommodation Bookings (${accoms.length})`}>
        <div className="wz-grid">
          <Fld label="Guest Name"><input value={aDraft.guestName} onChange={af('guestName')} placeholder="e.g. Thomas Harrison" /></Fld>
          <Fld label="Hotel Name"><input value={aDraft.hotelName} onChange={af('hotelName')} placeholder="e.g. Seda BGC" /></Fld>
          <Fld label="Hotel Address" full><input value={aDraft.hotelAddress} onChange={af('hotelAddress')} placeholder="e.g. 30th St, BGC, Taguig" /></Fld>
          <Fld label="Check-In"><input type="date" value={aDraft.checkIn} onChange={af('checkIn')} /></Fld>
          <Fld label="Check-Out"><input type="date" value={aDraft.checkOut} onChange={af('checkOut')} /></Fld>
          <Fld label="Room Type"><input value={aDraft.roomType} onChange={af('roomType')} placeholder="e.g. Deluxe, Superior" /></Fld>
          <Fld label="Confirmation #"><input value={aDraft.confirmationNumber} onChange={af('confirmationNumber')} /></Fld>
          <Fld label="Status">
            <select value={aDraft.status} onChange={af('status')}>
              {['Pending', 'Booked', 'Confirmed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Fld>
          <Fld label="Cost"><input type="number" value={aDraft.cost} onChange={af('cost')} placeholder="0" /></Fld>
          <Fld label="Currency"><select value={aDraft.currency} onChange={af('currency')}><option>PHP</option><option>USD</option><option>AUD</option></select></Fld>
        </div>
        <button className="wz-add-btn" onClick={onAddA}><Plus size={13} /> Add Accommodation</button>
        {accoms.length === 0 ? <p className="wz-empty">No accommodation bookings added yet</p> : (
          <div className="wz-items">
            {accoms.map((a, i) => <Item key={i} primary={`${a.guestName} · ${a.hotelName}`} sub={`${a.checkIn} → ${a.checkOut} · ${a.roomType} · ${a.status}`} onRemove={() => onRemoveA(i)} />)}
          </div>
        )}
      </Sec>
    </>
  );
}

/* ── Step 5: Office Readiness ── */
function StepOffice({ items, draft, setDraft, onAdd, onRemove, onLoadTemplate }: { items: OfficeDraft[]; draft: OfficeDraft; setDraft: React.Dispatch<React.SetStateAction<OfficeDraft>>; onAdd: () => void; onRemove: (i: number) => void; onLoadTemplate: () => void }) {
  return (
    <Sec title={`Office Readiness Checklist (${items.length} items)`} action={
      <button className="wz-add-btn wz-add-btn--secondary" onClick={onLoadTemplate}><ClipboardList size={12} /> Load Standard Template</button>
    }>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6 }}>Add office preparation tasks or load the standard template to get started quickly.</p>
      <div className="wz-grid">
        <Fld label="Category">
          <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value as OfficeDraft['category'] }))}>
            {['AV & Tech', 'Hospitality', 'Access & Facilities', 'Communication', 'Signage'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Fld>
        <Fld label="Item"><input value={draft.item} onChange={e => setDraft(d => ({ ...d, item: e.target.value }))} placeholder="e.g. Confirm projector is working" /></Fld>
      </div>
      <button className="wz-add-btn" onClick={onAdd}><Plus size={13} /> Add Item</button>
      {items.length === 0 ? <p className="wz-empty">No items added — use Load Standard Template or add custom items above</p> : (
        <div className="wz-items">
          {items.map((o, i) => <Item key={i} primary={o.item} sub={o.category} onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </Sec>
  );
}

/* ── Step 6: Tasks ── */
function StepTasks({ items, draft, setDraft, onAdd, onRemove }: { items: TaskDraft[]; draft: TaskDraft; setDraft: React.Dispatch<React.SetStateAction<TaskDraft>>; onAdd: () => void; onRemove: (i: number) => void }) {
  const f = (k: keyof TaskDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [k]: e.target.value as never }));
  return (
    <Sec title={`Tasks (${items.length} added)`}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6 }}>Add preparation tasks to track before and during the visit.</p>
      <div className="wz-grid">
        <Fld label="Task Title" full><input value={draft.title} onChange={f('title')} placeholder="e.g. Book airport transfer" /></Fld>
        <Fld label="Assigned To"><input value={draft.assignedTo} onChange={f('assignedTo')} placeholder="e.g. Maria Santos" /></Fld>
        <Fld label="Due Date"><input type="date" value={draft.dueDate} onChange={f('dueDate')} /></Fld>
        <Fld label="Phase">
          <select value={draft.phase} onChange={f('phase')}>
            {['Initiation', 'Pre-Arrival', 'Logistics', 'Office Prep', 'Onsite', 'Post-Visit'].map(p => <option key={p}>{p}</option>)}
          </select>
        </Fld>
        <Fld label="Priority">
          <select value={draft.priority} onChange={f('priority')}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </Fld>
        <Fld label="Description" full><input value={draft.description} onChange={f('description')} placeholder="Optional details..." /></Fld>
      </div>
      <button className="wz-add-btn" onClick={onAdd}><Plus size={13} /> Add Task</button>
      {items.length === 0 ? <p className="wz-empty">No tasks added yet</p> : (
        <div className="wz-items">
          {items.map((t, i) => <Item key={i} primary={t.title} sub={`${t.phase} · ${t.priority} priority · Assigned to ${t.assignedTo || 'TBC'}${t.dueDate ? ' · Due ' + t.dueDate : ''}`} onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </Sec>
  );
}

/* ── Step 7: Review ── */
function StepReview({ ov, ca, ia, tr, ac, of_, tk }: { ov: Overview; ca: ClientDraft[]; ia: InternalDraft[]; tr: TransportDraft[]; ac: AccomDraft[]; of_: OfficeDraft[]; tk: TaskDraft[] }) {
  return (
    <>
      <div className="wz-review-grid">
        <div className="wz-review-section">
          <div className="wz-review-title">Visit Overview</div>
          <div className="wz-review-rows">
            {[['Company', ov.company], ['Contact', ov.clientName], ['Purpose', ov.purpose], ['Dates', `${ov.arrivalDate} → ${ov.departureDate}`], ['Status', ov.status], ['Lead', ov.visitLead], ['Hotel', ov.hotelName || '—'], ['Flights', ov.flightDetails || '—']].map(([k, v]) => (
              <div key={k} className="wz-review-row"><span className="wz-review-key">{k}</span><span className="wz-review-val">{v}</span></div>
            ))}
          </div>
        </div>

        <div className="wz-review-section">
          <div className="wz-review-title">Goals & Requirements</div>
          <div className="wz-review-rows">
            {[['Visit Goals', ov.visitGoals || '—'], ['Social Activities', ov.socialActivities || '—'], ['Special Requirements', ov.specialRequirements || '—']].map(([k, v]) => (
              <div key={k} className="wz-review-row"><span className="wz-review-key">{k}</span><span className="wz-review-val">{v}</span></div>
            ))}
          </div>
        </div>

        {[{ title: `Client Attendees (${ca.length})`, items: ca.map(a => ({ name: a.name, sub: `${a.role} · ${a.company}` })) },
          { title: `Internal Team (${ia.length})`, items: ia.map(a => ({ name: a.name, sub: `${a.role} · ${a.department}` })) },
          { title: `Transport Bookings (${tr.length})`, items: tr.map(t => ({ name: `${t.pickupLocation} → ${t.dropoffLocation}`, sub: t.date })) },
          { title: `Accommodation (${ac.length})`, items: ac.map(a => ({ name: `${a.guestName} · ${a.hotelName}`, sub: `${a.checkIn} → ${a.checkOut}` })) },
        ].map(({ title, items }) => (
          <div key={title} className="wz-review-section">
            <div className="wz-review-title">{title}</div>
            {items.length === 0 ? <p className="wz-empty">None added</p> : (
              <div className="wz-review-tags">
                {items.map((item, i) => (
                  <span key={i} className="wz-review-tag" title={item.sub}>{item.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="wz-review-section">
          <div className="wz-review-title">Office Readiness ({of_.length} items)</div>
          {of_.length === 0 ? <p className="wz-empty">None added</p> : (
            <div className="wz-review-tags">{of_.map((o, i) => <span key={i} className="wz-review-tag">{o.item}</span>)}</div>
          )}
        </div>

        <div className="wz-review-section">
          <div className="wz-review-title">Tasks ({tk.length})</div>
          {tk.length === 0 ? <p className="wz-empty">None added</p> : (
            <div className="wz-review-tags">{tk.map((t, i) => <span key={i} className="wz-review-tag">{t.title}</span>)}</div>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid #1e8449', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#1e8449', display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle size={16} />
        Everything looks good — click <strong>Create Visit</strong> to save and open the visit detail page.
      </div>
    </>
  );
}
