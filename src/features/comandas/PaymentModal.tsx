import { useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Banknote, CreditCard, QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { buildPixPayload } from '../../lib/pix';
import { brl } from '../../lib/format';
import type { PaymentMethod } from '../../types';

interface Props { open: boolean; playerId: string | null; playerName: string; total: number; onClose: () => void; }

export function PaymentModal({ open, playerId, playerName, total, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const payComanda = useStore((s) => s.payComanda);
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('dinheiro');

  const pixCode = settings.pixKey
    ? buildPixPayload({ key: settings.pixKey, merchantName: 'TOCA DO LOBO', city: settings.pixCity || 'BRASIL', amount: total })
    : null;

  const confirm = () => {
    if (!playerId) return;
    payComanda(playerId, method);
    toast(`Comanda de ${playerName} fechada (${method})!`);
    onClose();
  };

  const opt = (m: PaymentMethod, label: string, icon: ReactNode) => (
    <button type="button" onClick={() => setMethod(m)}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${method === m ? 'border-secondary bg-secondary/10 text-secondary' : 'border-line text-surface-muted'}`}>
      {icon}{label}
    </button>
  );

  return (
    <Modal open={open} title={`Fechar comanda — ${playerName}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-line bg-canvas p-4 text-center">
          <p className="text-xs uppercase text-surface-muted">Total</p>
          <p className="font-highlight text-2xl font-bold text-secondary">{brl(total)}</p>
        </div>
        <div className="flex gap-2">
          {opt('dinheiro', 'Dinheiro', <Banknote size={18} />)}
          {opt('pix', 'PIX', <QrCode size={18} />)}
          {opt('cartao', 'Cartão', <CreditCard size={18} />)}
        </div>

        {method === 'pix' && (
          pixCode ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-line p-4">
              <div className="rounded-lg bg-white p-3"><QRCodeSVG value={pixCode} size={180} /></div>
              <button onClick={() => { navigator.clipboard?.writeText(pixCode); toast('PIX copiado!'); }}
                className="flex items-center gap-1.5 text-sm font-medium text-secondary">
                <Copy size={14} /> Copiar PIX copia-e-cola
              </button>
            </div>
          ) : (
            <p className="rounded-xl border border-alert-500 bg-alert-50 p-3 text-sm text-alert-900">
              Configure a chave PIX em Configurações para gerar o QR.
            </p>
          )
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirm}>Confirmar pagamento</Button>
        </div>
      </div>
    </Modal>
  );
}
