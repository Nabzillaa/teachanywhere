import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
}

export default function ProgressBar({ value, max = 100, showLabel = true, color }: ProgressBarProps) {
  const pct = Math.round((value / max) * 100);
  const barColor = color || (pct >= 80 ? '#1e8449' : pct >= 50 ? '#b7950b' : '#c0392b');

  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {showLabel && <span className="progress-bar__label">{pct}%</span>}
    </div>
  );
}
