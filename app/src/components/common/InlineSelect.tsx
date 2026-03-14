import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import './InlineSelect.css';

interface InlineSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function InlineSelect({ value, options, onChange }: InlineSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom, left: r.left, width: r.width });
    }
    setOpen(o => !o);
  };

  return (
    <div className="inline-select">
      <button
        ref={triggerRef}
        className={`inline-select__trigger ${open ? 'inline-select__trigger--open' : ''}`}
        onClick={handleOpen}
        type="button"
      >
        <span>{value}</span>
        <ChevronDown size={12} className={`inline-select__chevron ${open ? 'inline-select__chevron--open' : ''}`} />
      </button>
      {open && createPortal(
        <div
          className="inline-select__dropdown"
          style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.width }}
        >
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`inline-select__option ${opt === value ? 'inline-select__option--active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
