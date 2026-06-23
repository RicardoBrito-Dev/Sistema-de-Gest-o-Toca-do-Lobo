import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { lineItems } from '../../lib/calc';
import { brl } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

interface Props { open: boolean; editing: AttendanceRecord | null; defaultDate: string; onClose: () => void; }

export function PlayerModal({ open, editing, defaultDate, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? '✏️ Editar Jogador' : '🎯 Adicionar Jogador'} onClose={onClose}>
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

  const preview = lineItems(
    { id: '', name, date, hasWeapon, magazines, drinks, isTeam }, settings,
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    const data = { name: name.trim(), date, hasWeapon, magazines, drinks, isTeam };
    if (editing) { updatePlayer(editing.id, data); toast('Jogador atualizado! ✅'); }
    else { addPlayer(data); toast('Jogador adicionado! ✅'); }
    onClose();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="p-name">Nome do Jogador *</label>
          <input id="p-name" type="text" required value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Nome completo" autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="p-date">Data *</label>
          <input id="p-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Armamento</label>
        <div className="weapon-toggle">
          <button type="button" className={`weapon-btn${!hasWeapon ? ' active' : ''}`} onClick={() => setHasWeapon(false)}>
            🔫 Aluga Arma <span className="weapon-price">{brl(settings.weaponRental)}</span>
          </button>
          <button type="button" className={`weapon-btn${hasWeapon ? ' active' : ''}`} onClick={() => setHasWeapon(true)}>
            🪖 Arma Própria <span className="weapon-price">{brl(settings.fieldFeeOwn)}</span>
          </button>
        </div>
      </div>

      <div className="form-group" style={{ background: 'rgba(74,138,64,0.1)', padding: 10, borderRadius: 'var(--r-sm)', border: '1px solid rgba(74,138,64,0.3)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
        <input id="p-is-team" type="checkbox" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: 'var(--green-500)', cursor: 'pointer' }} />
        <label htmlFor="p-is-team" style={{ margin: 0, fontWeight: 'bold', color: 'var(--green-300)', cursor: 'pointer' }}>
          🪖 Jogador é membro do Time (Isento de taxas, desconto em bebidas)
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="p-magazines">🎯 Carregadores Usados</label>
          <input id="p-magazines" type="number" min={0} value={magazines}
            onChange={(e) => setMagazines(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
        <div className="form-group">
          <label htmlFor="p-drinks">🥤 Bebidas Consumidas</label>
          <input id="p-drinks" type="number" min={0} value={drinks}
            onChange={(e) => setDrinks(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
      </div>

      <div className="total-preview">
        <div className="total-breakdown">
          <div className="breakdown-row"><span>Armamento</span><span>{brl(preview.field)}</span></div>
          <div className="breakdown-row"><span>Carregadores</span><span>{brl(preview.mags)}</span></div>
          <div className="breakdown-row"><span>Bebidas</span><span>{brl(preview.drinks)}</span></div>
        </div>
        <div className="total-final"><span>TOTAL</span><strong>{brl(preview.total)}</strong></div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">💾 Salvar</button>
      </div>
    </form>
  );
}
