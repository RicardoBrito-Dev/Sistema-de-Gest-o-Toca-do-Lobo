import { useMemo, useState } from 'react';
import { Minus, Plus, Printer, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ComandaModal } from './ComandaModal';
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

function ComandaRow({ p, settings, onPay, onAdjust }: {
  p: AttendanceRecord; settings: Settings;
  onPay: (id: string) => void;
  onAdjust: (id: string, field: 'magazines' | 'drinks', value: number) => void;
}) {
  const li = lineItems(p, settings);
  const arma = p.isTeam ? 'Membro do Time' : (p.hasWeapon ? 'Arma própria' : 'Arma alugada');
  const paidAt = p.paidAt ? new Date(p.paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 ${p.paid ? 'opacity-60' : ''}`}>
      <div className="min-w-[140px] flex-1">
        <div className="flex items-center gap-2 font-medium text-surface-fg">
          {p.name}
          {p.paid && <span className="rounded bg-positive-50 px-1.5 py-0.5 text-[10px] font-semibold text-positive">PAGO {paidAt}</span>}
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
          {brl(li.field)} + {brl(li.mags)} + {brl(li.drinks)}
        </div>
      </div>

      {p.paid ? (
        <span className="flex items-center gap-1 rounded-lg bg-positive-50 px-3 py-2 text-sm font-medium text-positive"><Check size={15} /> Pago</span>
      ) : (
        <Button size="sm" onClick={() => onPay(p.id)}><Check size={15} /> Fechar</Button>
      )}
    </div>
  );
}

export function ComandasPage() {
  const attendance = useStore((s) => s.attendance);
  const settings = useStore((s) => s.settings);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const payComanda = useStore((s) => s.payComanda);
  const { toast } = useToast();

  const [date, setDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const records = useMemo(() => {
    let recs = attendance.filter((p) => p.date === date).sort((a, b) => a.name.localeCompare(b.name));
    const q = search.toLowerCase().trim();
    if (q) recs = recs.filter((p) => p.name.toLowerCase().includes(q));
    return recs;
  }, [attendance, date, search]);

  const total = records.reduce((s, p) => s + lineItems(p, settings).total, 0);
  const allPaid = records.length > 0 && records.every((p) => p.paid);

  const onAdjust = (id: string, field: 'magazines' | 'drinks', value: number) => {
    updatePlayer(id, { [field]: Math.max(0, value) });
  };
  const onPay = (id: string) => {
    const p = records.find((x) => x.id === id);
    if (!p || p.paid) return;
    if (!window.confirm(`Fechar comanda de ${p.name}?\nTotal: ${brl(lineItems(p, settings).total)}`)) return;
    payComanda(id);
    toast(`Comanda de ${p.name} fechada!`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-[260px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input type="text" placeholder="Buscar jogador pelo nome..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-surface-fg outline-none focus:border-secondary" />
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary" />
      </div>

      {records.length === 0 ? (
        <Card className="p-10 text-center text-surface-muted">Nenhuma comanda encontrada para este filtro</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <h3 className="font-highlight font-bold text-surface-fg">{fmtDate(date)}</h3>
              <span className="text-sm text-surface-muted">
                {records.length} jogador(es) · <span className="font-semibold text-secondary">{brl(total)}</span>
                {allPaid && <span className="ml-2 rounded bg-positive-50 px-1.5 py-0.5 text-[10px] font-semibold text-positive">TUDO PAGO</span>}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}><Printer size={15} /> Imprimir</Button>
          </div>
          <div className="divide-y divide-line">
            {records.map((p) => (
              <ComandaRow key={p.id} p={p} settings={settings} onPay={onPay} onAdjust={onAdjust} />
            ))}
          </div>
        </Card>
      )}

      <ComandaModal open={modalOpen} label={fmtDate(date)} records={records} onClose={() => setModalOpen(false)} />
    </div>
  );
}
