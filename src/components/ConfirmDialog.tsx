import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-surface-fg shadow-2xl">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={20} className="text-alert" />
          <h3 className="font-highlight text-base font-bold">Confirmar</h3>
        </div>
        <p className="mb-6 text-sm text-surface-muted">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button colorVariant="negative" onClick={onConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
