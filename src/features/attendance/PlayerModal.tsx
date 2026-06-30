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
  const products = useStore((s) => s.products);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const { toast } = useToast();

  const [name, setName] = useState(() => editing?.name ?? '');
  const [date, setDate] = useState(() => editing?.date ?? defaultDate);
  const [hasWeapon, setHasWeapon] = useState(() => editing?.hasWeapon ?? false);
  const [magazines, setMagazines] = useState(() => editing?.magazines ?? 0);
  const [rentedWeapon, setRentedWeapon] = useState(() => editing?.rentedWeapon ?? '');
  const [isTeam, setIsTeam] = useState(() => editing?.isTeam ?? false);
  const [isSocio, setIsSocio] = useState(() => editing?.isSocio ?? false);

  const preview = lineItems(
    {
      id: '',
      name,
      date,
      hasWeapon,
      magazines,
      drinks: editing?.drinks ?? 0,
      isTeam,
      isSocio,
      cerveja: editing?.cerveja ?? 0,
      agua: editing?.agua ?? 0,
      refrigerante: editing?.refrigerante ?? 0,
      salgado: editing?.salgado ?? 0,
      rentedWeapon: !hasWeapon ? rentedWeapon : undefined,
      extras: editing?.extras ?? [],
    },
    settings,
    products
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    const data = {
      name: name.trim(),
      date,
      hasWeapon,
      magazines,
      drinks: editing?.drinks ?? 0,
      isTeam,
      isSocio,
      cerveja: editing?.cerveja ?? 0,
      agua: editing?.agua ?? 0,
      refrigerante: editing?.refrigerante ?? 0,
      salgado: editing?.salgado ?? 0,
      rentedWeapon: !hasWeapon ? rentedWeapon : undefined,
    };
    if (editing) {
      updatePlayer(editing.id, data);
      toast('Jogador updated!');
    } else {
      addPlayer(data);
      toast('Jogador adicionado!');
    }
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

      {!hasWeapon && (
        <div className="rounded-xl border border-line bg-canvas/30 p-3 flex flex-col gap-3">
          <div>
            <label htmlFor="p-rented-weapon" className={labelCls}>Arma Alugada</label>
            <select id="p-rented-weapon" className={inputCls} 
              value={rentedWeapon && ['M4A1', 'AK-47', 'G36C', 'Glock 17'].includes(rentedWeapon) ? rentedWeapon : rentedWeapon ? 'Outra' : ''} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Outra') {
                  setRentedWeapon('Outra');
                } else {
                  setRentedWeapon(val);
                }
              }}>
              <option value="">Selecione a arma alugada (opcional)...</option>
              <option value="M4A1">M4A1</option>
              <option value="AK-47">AK-47</option>
              <option value="G36C">G36C</option>
              <option value="Glock 17">Glock 17</option>
              <option value="Outra">Outra (especificar)...</option>
            </select>
          </div>
          {(rentedWeapon === 'Outra' || (rentedWeapon && !['M4A1', 'AK-47', 'G36C', 'Glock 17'].includes(rentedWeapon))) && (
            <div>
              <label htmlFor="p-rented-weapon-custom" className={labelCls}>Especificar Arma</label>
              <input id="p-rented-weapon-custom" type="text" className={inputCls} placeholder="Digite o modelo da arma (ex: MP5, Sniper...)"
                value={rentedWeapon === 'Outra' ? '' : rentedWeapon} onChange={(e) => setRentedWeapon(e.target.value)} />
            </div>
          )}
        </div>
      )}

      <label className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/5 px-3 py-2.5">
        <input type="checkbox" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)}
          className="h-5 w-5 accent-secondary" />
        <span className="text-sm font-medium text-surface-fg">Jogador é membro do Time (isento de taxas, desconto em consumo)</span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
        <input type="checkbox" checked={isSocio} onChange={(e) => setIsSocio(e.target.checked)}
          className="h-5 w-5 accent-secondary" />
        <span className="text-sm font-medium text-surface-fg">Jogador é Sócio (desconto em consumo)</span>
      </label>

      <div>
        <label htmlFor="p-mags" className={labelCls}>Carregadores</label>
        <input id="p-mags" type="number" min={0} className={inputCls} value={magazines}
          onChange={(e) => setMagazines(Math.max(0, parseInt(e.target.value) || 0))} />
      </div>

      <div className="rounded-xl border border-line bg-canvas p-4 text-sm">
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Armamento</span><span className="tabular-nums">{brl(preview.field)}</span></div>
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Carregadores</span><span className="tabular-nums">{brl(preview.mags)}</span></div>
        <div className="flex justify-between py-0.5 text-surface-muted"><span>Consumo</span><span className="tabular-nums">{brl(preview.drinks)}</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold text-surface-fg"><span>TOTAL</span><span className="tabular-nums text-secondary">{brl(preview.total)}</span></div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
