import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

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
  const w = size === 'sm' ? 'max-w-sm' : size === 'large' ? 'max-w-3xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full ${w} overflow-hidden rounded-2xl border border-line bg-surface text-surface-fg shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-highlight text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Fechar"
            className="rounded-full p-1.5 text-surface-muted transition-colors hover:bg-canvas hover:text-surface-fg">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-64px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
