import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { lineItems } from '../../lib/calc';
import { brl } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

interface Props { open: boolean; editing: AttendanceRecord | null; defaultDate: string; onClose: () => void; }

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function PlayerModal({ open, editing, defaultDate, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? 'Editar Jogador' : 'Adicionar Jogador'} onClose={onClose}>
      <PlayerForm editing={editing} defaultDate={defaultDate} onClose={onClose} />
    </Modal>
  );
}

function PlayerForm({ editing, defaultDate, onClose }: { editing: AttendanceRecord | null; defaultDate: string; onClose: () => void }) {
  const settings = useStore((s) => s.settings);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const { toast } = useToast();

  const [name, setName] = useState(() => editing?.name ?? '');
  const [date, setDate] = useState(() => editing?.date ?? defaultDate);
  const [hasWeapon, setHasWeapon] = useState(() => editing?.hasWeapon ?? false);
  const [magazines, setMagazines] = useState(() => editing?.magazines ?? 0);
  const [drinks, setDrinks] = useState(() => editing?.drinks ?? 0);
  const [isTeam, setIsTeam] = useState(() => editing?.isTeam ?? false);

  const preview = lineItems({ id: '', name, date, hasWeapon, magazines, drinks, isTeam }, settings);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    const data = { name: name.trim(), date, hasWeapon, magazines, drinks, isTeam };
    if (editing) { updatePlayer(editing.id, data); toast('Jogador atualizado!'); }
    else { addPlayer(data); toast('Jogador adicionado!'); }
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-name" className={labelCls}>Nome do Jogador *</label>
          <input id="p-name" className={inputCls} required value={name} autoFocus
            onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
        </div>
        <div>
          <label htmlFor="p-date" className={labelCls}>Data *</label>
          <input id="p-date" type="date" className={inputCls} required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <span className={labelCls}>Armamento</span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setHasWeapon(false)}
            className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${!hasWeapon ? 'border-secondary bg-secondary/10 text-secondary' : 'border-line text-surface-muted'}`}>
            Aluga Arma <span className="text-xs">{brl(settings.weaponRental)}</span>
          </button>
          <button type="button" onClick={() => setHasWeapon(true)}
            className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${hasWeapon ? 'border-secondary bg-secondary/10 text-secondary' : 'border-line text-surface-muted'}`}>
            Arma Própria <span className="text-xs">{brl(settings.fieldFeeOwn)}</span>
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/5 px-3 py-2.5">
        <input type="checkbox" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)}
          className="h-5 w-5 accent-secondary" />
        <span className="text-sm font-medium text-surface-fg">Jogador é membro do Time (isento de taxas, desconto em bebidas)</span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="p-mags" className={labelCls}>Carregadores</label>
          <input id="p-mags" type="number" min={0} className={inputCls} value={magazines}
            onChange={(e) => setMagazines(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
        <div>
          <label htmlFor="p-drinks" className={labelCls}>Bebidas</label>
          <input id="p-drinks" type="number" min={0} className={inputCls} value={drinks}
            onChange={(e) => setDrinks(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-canvas p-4 text-sm">
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Armamento</span><span className="tabular-nums">{brl(preview.field)}</span></div>
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Carregadores</span><span className="tabular-nums">{brl(preview.mags)}</span></div>
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Bebidas</span><span className="tabular-nums">{brl(preview.drinks)}</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold text-surface-fg"><span>TOTAL</span><span className="tabular-nums text-secondary">{brl(preview.total)}</span></div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
