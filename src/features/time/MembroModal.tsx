import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { PATENTE_INFO } from '../../lib/constants';
import { todayStr } from '../../lib/format';
import type { Patente, TimeMember } from '../../types';

interface Props { open: boolean; editing: TimeMember | null; onClose: () => void; }

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function MembroModal({ open, editing, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? 'Editar Membro' : 'Novo Membro'} onClose={onClose}>
      <MembroForm editing={editing} onClose={onClose} />
    </Modal>
  );
}

function MembroForm({ editing, onClose }: { editing: TimeMember | null; onClose: () => void }) {
  const addMembro = useStore((s) => s.addMembro);
  const updateMembro = useStore((s) => s.updateMembro);
  const { toast } = useToast();

  const [name, setName] = useState(() => editing?.name ?? '');
  const [nickname, setNickname] = useState(() => editing?.nickname ?? '');
  const [patente, setPatente] = useState<Patente | ''>(() => editing?.patente ?? '');
  const [weapon, setWeapon] = useState(() => editing?.weapon ?? '');
  const [joinDate, setJoinDate] = useState(() => editing?.joinDate ?? todayStr());
  const [phone, setPhone] = useState(() => editing?.phone ?? '');
  const [notes, setNotes] = useState(() => editing?.notes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !patente) { toast('Nome e Patente são obrigatórios!', 'error'); return; }
    const data = { name: name.trim(), nickname: nickname.trim(), patente, weapon: weapon.trim(), joinDate: joinDate || todayStr(), phone: phone.trim(), notes: notes.trim() };
    if (editing) { updateMembro(editing.id, data); toast('Membro atualizado!'); }
    else { addMembro(data); toast('Membro adicionado ao time!'); }
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m-name" className={labelCls}>Nome Completo *</label>
          <input id="m-name" className={inputCls} required value={name} autoFocus onChange={(e) => setName(e.target.value)} placeholder="Nome do jogador" />
        </div>
        <div>
          <label htmlFor="m-nick" className={labelCls}>Codinome / Callsign</label>
          <input id="m-nick" className={inputCls} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ex: Wolf, Shadow..." />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m-pat" className={labelCls}>Patente *</label>
          <select id="m-pat" className={inputCls} required value={patente} onChange={(e) => setPatente(e.target.value as Patente)}>
            <option value="">Selecionar patente...</option>
            {(Object.keys(PATENTE_INFO) as Patente[]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="m-weapon" className={labelCls}>Arma Principal</label>
          <input id="m-weapon" className={inputCls} value={weapon} onChange={(e) => setWeapon(e.target.value)} placeholder="Ex: M4A1, AK-47..." />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m-join" className={labelCls}>Entrada no Time *</label>
          <input id="m-join" type="date" className={inputCls} required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="m-phone" className={labelCls}>Telefone</label>
          <input id="m-phone" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div>
        <label htmlFor="m-notes" className={labelCls}>Observações</label>
        <textarea id="m-notes" rows={2} className={`${inputCls} h-auto py-2`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o membro..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
