import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Crosshair, Phone, CalendarDays, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { MembroModal } from './MembroModal';
import { PATENTE_INFO, PATENTE_ORDER } from '../../lib/constants';
import { fmtDate } from '../../lib/format';
import type { Patente, TimeMember } from '../../types';

export function TimePage() {
  const time = useStore((s) => s.time);
  const deleteMembro = useStore((s) => s.deleteMembro);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [patenteFilter, setPatenteFilter] = useState<'all' | Patente>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimeMember | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const members = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...time]
      .filter((m) => (q === '' || m.name.toLowerCase().includes(q) || (m.nickname || '').toLowerCase().includes(q)) && (patenteFilter === 'all' || m.patente === patenteFilter))
      .sort((a, b) => {
        const ri = PATENTE_ORDER.indexOf(b.patente) - PATENTE_ORDER.indexOf(a.patente);
        return ri !== 0 ? ri : a.name.localeCompare(b.name);
      });
  }, [time, search, patenteFilter]);

  const confirmRemove = () => {
    if (confirmId) { deleteMembro(confirmId); toast('Membro removido do time!'); }
    setConfirmId(null);
  };

  const inputCls = 'h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input type="text" placeholder="Buscar membro..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} w-full pl-9`} />
        </div>
        <select value={patenteFilter} onChange={(e) => setPatenteFilter(e.target.value as 'all' | Patente)} className={inputCls}>
          <option value="all">Todas as Patentes</option>
          {(Object.keys(PATENTE_INFO) as Patente[]).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Novo Membro</Button>
      </div>

      {members.length === 0 ? (
        <Card className="p-10 text-center text-surface-muted">Nenhum membro encontrado</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => {
            const initials = (m.name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
            return (
              <Card key={m.id} className="flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 font-highlight text-lg font-bold text-secondary">{initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-surface-fg">{m.name}</div>
                    {m.nickname && <div className="truncate text-xs text-surface-muted">"{m.nickname}"</div>}
                    <span className="mt-1 inline-block rounded-md bg-brand-gold/15 px-2 py-0.5 text-[11px] font-semibold text-brand-gold">{PATENTE_INFO[m.patente].icon} {m.patente}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-1 flex-col gap-1.5 text-sm text-surface-muted">
                  {m.weapon && <div className="flex items-center gap-2"><Crosshair size={14} /> <strong className="font-medium text-surface-fg">{m.weapon}</strong></div>}
                  {m.phone && <div className="flex items-center gap-2"><Phone size={14} /> {m.phone}</div>}
                  <div className="flex items-center gap-2"><CalendarDays size={14} /> Desde {m.joinDate ? fmtDate(m.joinDate) : '—'}</div>
                  {m.notes && <div className="flex items-start gap-2"><StickyNote size={14} className="mt-0.5 shrink-0" /> <span className="text-xs">{m.notes}</span></div>}
                </div>
                <div className="mt-4 flex gap-2 border-t border-line pt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(m); setModalOpen(true); }}><Pencil size={14} /> Editar</Button>
                  <button onClick={() => setConfirmId(m.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-3xl border border-negative px-3 py-2 text-sm font-medium text-negative transition-colors hover:bg-negative-50">
                    <Trash2 size={14} /> Remover
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <MembroModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message={`Remover ${time.find((m) => m.id === confirmId)?.name ?? 'este membro'} do time?`}
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
