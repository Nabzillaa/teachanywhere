import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
}

export default function ConfirmModal({ title, message, onConfirm, onClose, confirmLabel = 'Delete' }: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      onSubmit={onConfirm}
      submitLabel={confirmLabel}
      submitDestructive
      width={420}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <AlertTriangle size={20} style={{ color: '#ca6f1e', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
      </div>
    </Modal>
  );
}
