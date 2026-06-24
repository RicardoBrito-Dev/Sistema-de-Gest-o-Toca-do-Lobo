import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../../components/Modal';

export function ComandaQrModal({ open, playerId, playerName, onClose }: { open: boolean; playerId: string | null; playerName: string; onClose: () => void }) {
  const url = playerId ? `${window.location.origin}/comanda/${playerId}` : '';
  return (
    <Modal open={open} title={`QR — ${playerName}`} onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-surface-muted">O cliente escaneia para ver a comanda no celular.</p>
        {url && <div className="rounded-lg bg-white p-3"><QRCodeSVG value={url} size={200} /></div>}
        <p className="break-all text-center text-xs text-surface-muted">{url}</p>
      </div>
    </Modal>
  );
}
