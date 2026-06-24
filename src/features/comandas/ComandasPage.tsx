import { useMemo, useState } from 'react';
import { Minus, Plus, Printer, Check, Search, RotateCcw, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ComandaModal } from './ComandaModal';
import { PaymentModal } from './PaymentModal';
import { AddItemModal } from './AddItemModal';
import { ComandaQrModal } from './ComandaQrModal';
import { lineItems } from '../../lib/calc';
import { brl, fmtDate, todayStr } from '../../lib/format';
import type { AttendanceRecord, Settings } from '../../types';

function Stepper({ value, disabled, onDelta }: { value: number; disabled: boolean; onDelta: (d: number) => void }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-line">
      <button type="button" disabled={disabled} onClick={() => onDelta(-1)}
        className="flex h-8 w-8 items-center justify-center text-surface-muted transition-colors hover:bg-canvas disabled:opacity-40">
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums text-surface-fg">{value}</span>
      <button type="button" disabled={disabled} onClick={() => onDelta(1)}
        className="flex h-8 w-8 items-center justify-center text-surface-muted transition-colors hover:bg-canvas disabled:opacity-40">
        <Plus size={14} />
      </button>
    </div>
  );
}

function ComandaRow({ p, settings, onPay, onReopen, onAdjust, onAddItem, onRemoveExtra, onQr }: {
  p: AttendanceRecord; settings: Settings;
  onPay: (id: string) => void;
  onReopen: (id: string) => void;
  onAdjust: (id: string, field: 'magazines' | 'drinks', value: number) => void;
  onAddItem: (id: string) => void;
  onRemoveExtra: (playerId: string, itemId: string) => void;
  onQr: (id: string) => void;
}) {
  const li = lineItems(p, settings);
  const arma = p.isTeam ? 'Membro do Time' : (p.hasWeapon ? 'Arma própria' : 'Arma alugada');
  const paidAt = p.paidAt ? new Date(p.paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const extras = p.extras ?? [];

  return (
    <div className={`px-4 py-3 ${p.paid ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="min-w-[140px] flex-1">
          <div className="flex items-center gap-2 font-medium text-surface-fg">
            {p.name}
            {p.paid && <span className="rounded bg-positive-50 px-1.5 py-0.5 text-[10px] font-semibold text-positive">PAGO {paidAt}</span>}
            {p.paid && p.paymentMethod && <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase text-surface-muted">{p.paymentMethod}</span>}
          </div>
          <div className="text-xs text-surface-muted">{arma}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="mb-1 text-[10px] uppercase text-surface-muted">Carreg.</div>
            <Stepper value={p.magazines || 0} disabled={!!p.paid} onDelta={(d) => onAdjust(p.id, 'magazines', (p.magazines || 0) + d)} />
          </div>
          <div className="text-center">
            <div className="mb-1 text-[10px] uppercase text-surface-muted">Bebidas</div>
            <Stepper value={p.drinks || 0} disabled={!!p.paid} onDelta={(d) => onAdjust(p.id, 'drinks', (p.drinks || 0) + d)} />
          </div>
        </div>

        <div className="ml-auto text-right">
          <div className="font-bold tabular-nums text-secondary">{brl(li.total)}</div>
          <div className="text-[10px] text-surface-muted">
            {brl(li.field)} + {brl(li.mags)} + {brl(li.drinks)}{li.extras > 0 ? ` + ${brl(li.extras)}` : ''}
          </div>
        </div>

        {p.paid ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg bg-positive-50 px-3 py-2 text-sm font-medium text-positive"><Check size={15} /> Pago</span>
            <Button size="sm" variant="outline" aria-label="QR da comanda" onClick={() => onQr(p.id)}><QrCode size={15} /> QR</Button>
            <Button size="sm" variant="outline" onClick={() => onReopen(p.id)}><RotateCcw size={15} /> Reabrir</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" aria-label="QR da comanda" onClick={() => onQr(p.id)}><QrCode size={15} /> QR</Button>
            <Button size="sm" variant="outline" onClick={() => onAddItem(p.id)}><Plus size={15} /> Item</Button>
            <Button size="sm" onClick={() => onPay(p.id)}><Check size={15} /> Fechar</Button>
          </div>
        )}
      </div>

      {extras.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {extras.map((e) => (
            <span key={e.id} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs text-surface-fg">
              <span>{e.name} x{e.qty}</span>
              <span className="tabular-nums text-surface-muted">{brl(e.price * e.qty)}</span>
              {!p.paid && (
                <button type="button" aria-label={`Remover ${e.name}`} onClick={() => onRemoveExtra(p.id, e.id)}
                  className="rounded-full p-0.5 text-surface-muted transition-colors hover:bg-surface hover:text-alert-900">
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ComandasPage() {
  const attendance = useStore((s) => s.attendance);
  const settings = useStore((s) => s.settings);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const reopenComanda = useStore((s) => s.reopenComanda);
  const removeExtra = useStore((s) => s.removeExtra);
  const { toast } = useToast();

  const [date, setDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'pago'>('all');
  const [payTarget, setPayTarget] = useState<AttendanceRecord | null>(null);
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [addItemId, setAddItemId] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState<AttendanceRecord | null>(null);

  const records = useMemo(() => {
    let recs = attendance.filter((p) => p.date === date).sort((a, b) => a.name.localeCompare(b.name));
    const q = search.toLowerCase().trim();
    if (q) recs = recs.filter((p) => p.name.toLowerCase().includes(q));
    return recs;
  }, [attendance, date, search]);

  const visible = records.filter((p) =>
    statusFilter === 'all' ? true : statusFilter === 'pago' ? !!p.paid : !p.paid);

  const total = records.reduce((s, p) => s + lineItems(p, settings).total, 0);
  const recebido = records.filter((p) => p.paid).reduce((s, p) => s + lineItems(p, settings).total, 0);
  const pendente = total - recebido;
  const pagos = records.filter((p) => p.paid).length;
  const allPaid = records.length > 0 && records.every((p) => p.paid);

  const onAdjust = (id: string, field: 'magazines' | 'drinks', value: number) => {
    updatePlayer(id, { [field]: Math.max(0, value) });
  };
  const onPay = (id: string) => {
    const p = records.find((x) => x.id === id);
    if (p && !p.paid) setPayTarget(p);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-[260px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input type="text" placeholder="Buscar jogador pelo nome..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-surface-fg outline-none focus:border-secondary" />
        </div>
        <div className="inline-flex overflow-hidden rounded-xl border border-line">
          {(['all', 'pendente', 'pago'] as const).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${statusFilter === f ? 'bg-secondary text-white' : 'text-surface-muted hover:bg-canvas'}`}>
              {f === 'all' ? 'Todas' : f === 'pendente' ? 'Pendentes' : 'Pagas'}
            </button>
          ))}
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary" />
      </div>

      {records.length === 0 ? (
        <Card className="p-10 text-center text-surface-muted">Nenhuma comanda encontrada para este filtro</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-highlight font-bold text-surface-fg">{fmtDate(date)}</h3>
              <span className="text-sm text-surface-muted">
                {records.length} jogador(es) · <span className="font-semibold text-secondary">{brl(total)}</span>
                {allPaid && <span className="ml-2 rounded bg-positive-50 px-1.5 py-0.5 text-[10px] font-semibold text-positive">TUDO PAGO</span>}
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-surface-muted">
                <span>Recebido: <strong className="text-positive">{brl(recebido)}</strong></span>
                <span>Pendente: <strong className="text-alert-900">{brl(pendente)}</strong></span>
                <span>Pagos: <strong className="text-surface-fg">{pagos}/{records.length}</strong></span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}><Printer size={15} /> Imprimir</Button>
          </div>
          {visible.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-muted">Nenhuma comanda neste filtro.</div>
          ) : (
            <div className="divide-y divide-line">
              {visible.map((p) => (
                <ComandaRow key={p.id} p={p} settings={settings} onPay={onPay} onReopen={(id) => setReopenId(id)} onAdjust={onAdjust}
                  onAddItem={(id) => setAddItemId(id)} onRemoveExtra={removeExtra} onQr={(id) => setQrTarget(records.find((x) => x.id === id) ?? null)} />
              ))}
            </div>
          )}
        </Card>
      )}

      <ComandaModal open={modalOpen} label={fmtDate(date)} records={records} onClose={() => setModalOpen(false)} />

      <PaymentModal open={payTarget !== null} playerId={payTarget?.id ?? null}
        playerName={payTarget?.name ?? ''} total={payTarget ? lineItems(payTarget, settings).total : 0}
        onClose={() => setPayTarget(null)} />

      <AddItemModal open={addItemId !== null} playerId={addItemId} onClose={() => setAddItemId(null)} />

      <ComandaQrModal open={qrTarget !== null} playerId={qrTarget?.id ?? null}
        playerName={qrTarget?.name ?? ''} onClose={() => setQrTarget(null)} />

      <ConfirmDialog open={reopenId !== null} message="Reabrir esta comanda paga?"
        onConfirm={() => { if (reopenId) { reopenComanda(reopenId); toast('Comanda reaberta!'); } setReopenId(null); }}
        onCancel={() => setReopenId(null)} />
    </div>
  );
}
