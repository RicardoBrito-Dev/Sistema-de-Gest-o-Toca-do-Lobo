import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'default' | 'large';
}

export function Modal({ open, title, onClose, children, size = 'default' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const boxCls = size === 'sm' ? 'modal-box modal-box-sm'
    : size === 'large' ? 'modal-box modal-box-large' : 'modal-box';

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-overlay" onClick={onClose} />
      <div className={boxCls}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" aria-label="Fechar" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
