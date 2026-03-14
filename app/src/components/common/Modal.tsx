import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDestructive?: boolean;
  disableBackdropClose?: boolean;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ title, onClose, onSubmit, submitLabel = 'Save', submitDestructive = false, disableBackdropClose = false, width = 520, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => { if (!disableBackdropClose && e.target === overlayRef.current) onClose(); }}>
      <div className="modal" style={{ maxWidth: width }}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">
          {children}
        </div>
        {(onSubmit || footer) && (
          <div className="modal__footer">
            {footer || (
              <>
                <button className="modal__btn modal__btn--cancel" onClick={onClose}>Cancel</button>
                <button
                  className={`modal__btn modal__btn--submit ${submitDestructive ? 'modal__btn--destructive' : ''}`}
                  onClick={onSubmit}
                >
                  {submitLabel}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
