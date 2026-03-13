import { Truck, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Badge from '../../components/common/Badge';
import { useAppStore } from '../../store/appStore';
import type { BookingStatus } from '../../data/types';

export default function LogisticsPage() {
  const visits = useAppStore(s => s.visits);
  const setTransportStatus = useAppStore(s => s.setTransportStatus);

  const allTransport = visits.flatMap(v => v.transportBookings.map(b => ({ ...b, visitRef: v.visitRef, visitId: v.id, company: v.company })));
  const allAccom = visits.flatMap(v => v.accommodationBookings.map(b => ({ ...b, visitRef: v.visitRef, visitId: v.id, company: v.company })));
  const noTransportVisits = visits.filter(v => ['Confirmed', 'In Planning', 'Active'].includes(v.status) && v.transportBookings.length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={<Truck size={20} />} title="Travel & Logistics" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Transport Bookings', value: allTransport.length, color: 'var(--text-primary)' },
          { label: 'Confirmed', value: allTransport.filter(b => b.status === 'Confirmed').length, color: '#1e8449' },
          { label: 'Accommodation', value: allAccom.length, color: 'var(--text-primary)' },
          { label: 'Visits Without Transport', value: noTransportVisits.length, color: noTransportVisits.length > 0 ? '#c0392b' : 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {noTransportVisits.map(v => (
        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, fontSize: 13, color: '#e74c3c' }}>
          <AlertTriangle size={14} />
          <strong>{v.visitRef} · {v.company}</strong> — no transport bookings recorded, arrival {v.arrivalDate}
        </div>
      ))}

      <SectionCard title={`Transport Bookings (${allTransport.length})`}>
        {allTransport.length === 0 ? (
          <p className="section-card__empty">No transport bookings — add them from a visit's Travel & Logistics tab</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Visit', 'Date', 'Pickup', 'Dropoff', 'Time', 'Driver', 'Contact', 'Vehicle', 'Status', 'Cost'].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTransport.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 18px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{b.visitRef}</td>
                  <td style={{ padding: '10px 18px' }}>{b.date}</td>
                  <td style={{ padding: '10px 18px' }}>{b.pickupLocation}</td>
                  <td style={{ padding: '10px 18px' }}>{b.dropoffLocation}</td>
                  <td style={{ padding: '10px 18px' }}>{b.pickupTime}</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{b.driverName}</td>
                  <td style={{ padding: '10px 18px' }}>{b.driverContact}</td>
                  <td style={{ padding: '10px 18px' }}>{b.vehicleType}</td>
                  <td style={{ padding: '10px 18px' }}>
                    <select
                      value={b.status}
                      onChange={e => setTransportStatus(b.visitId, b.id, e.target.value as BookingStatus)}
                      className="visit-detail__inline-select"
                    >
                      {(['Pending', 'Booked', 'Confirmed', 'Cancelled'] as BookingStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{b.currency} {b.cost?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard title={`Accommodation Bookings (${allAccom.length})`}>
        {allAccom.length === 0 ? (
          <p className="section-card__empty">No accommodation bookings — add from a visit's Travel & Logistics tab</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Visit', 'Guest', 'Hotel', 'Check-In', 'Check-Out', 'Room', 'Confirmation', 'Status', 'Cost'].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAccom.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 18px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{b.visitRef}</td>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{b.guestName}</td>
                  <td style={{ padding: '10px 18px' }}>{b.hotelName}</td>
                  <td style={{ padding: '10px 18px' }}>{b.checkIn}</td>
                  <td style={{ padding: '10px 18px' }}>{b.checkOut}</td>
                  <td style={{ padding: '10px 18px' }}>{b.roomType}</td>
                  <td style={{ padding: '10px 18px', fontFamily: 'monospace', fontSize: 11 }}>{b.confirmationNumber || '—'}</td>
                  <td style={{ padding: '10px 18px' }}><Badge label={b.status} /></td>
                  <td style={{ padding: '10px 18px', fontWeight: 600 }}>{b.currency} {b.cost?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
