interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="modal" role="alertdialog" aria-modal="true">
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-box modal-box-sm">
        <div className="modal-header"><h3>⚠️ Confirmar</h3></div>
        <div className="confirm-body"><p>{message}</p></div>
        <div className="modal-actions confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
