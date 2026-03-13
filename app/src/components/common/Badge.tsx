import './Badge.css';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'priority' | 'category';
  value?: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Draft': '#5a5a7a',
  'Proposed': '#2471a3',
  'Confirmed': '#1e8449',
  'In Planning': '#7d6608',
  'Ready for Arrival': '#117a65',
  'Active': '#c0392b',
  'Completed': '#1a5276',
  'Closed': '#424242',
  'Cancelled': '#641e16',
  'Not Started': '#5a5a7a',
  'In Progress': '#2471a3',
  'Blocked': '#7d6608',
  'Pending': '#7d6608',
  'Booked': '#2471a3',
  'Submitted': '#2471a3',
  'Approved': '#1e8449',
  'Rejected': '#641e16',
  'Paid': '#1a5276',
  'Delivered': '#1e8449',
  'Failed': '#641e16',
  'Sent': '#2471a3',
};

const PRIORITY_COLORS: Record<string, string> = {
  'High': '#c0392b',
  'Medium': '#b7950b',
  'Low': '#1e8449',
};

export default function Badge({ label, variant = 'status' }: BadgeProps) {
  const bg = variant === 'priority' ? PRIORITY_COLORS[label] : STATUS_COLORS[label];

  return (
    <span
      className="badge"
      style={{ background: bg || '#5a5a7a' }}
    >
      {label}
    </span>
  );
}
