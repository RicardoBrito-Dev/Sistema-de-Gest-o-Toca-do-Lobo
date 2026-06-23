import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { PATENTE_INFO } from '../../lib/constants';
import { todayStr } from '../../lib/format';
import type { Patente, TimeMember } from '../../types';

interface Props { open: boolean; editing: TimeMember | null; onClose: () => void; }

export function MembroModal({ open, editing, onClose }: Props) {
  const addMembro = useStore((s) => s.addMembro);
  const updateMembro = useStore((s) => s.updateMembro);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [patente, setPatente] = useState<Patente | ''>('');
  const [weapon, setWeapon] = useState('');
  const [joinDate, setJoinDate] = useState(todayStr());
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setNickname(editing?.nickname ?? '');
    setPatente(editing?.patente ?? '');
    setWeapon(editing?.weapon ?? '');
    setJoinDate(editing?.joinDate ?? todayStr());
    setPhone(editing?.phone ?? '');
    setNotes(editing?.notes ?? '');
  }, [open, editing]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !patente) { toast('⚠️ Nome e Patente são obrigatórios!'); return; }
    const data = { name: name.trim(), nickname: nickname.trim(), patente, weapon: weapon.trim(),
      joinDate: joinDate || todayStr(), phone: phone.trim(), notes: notes.trim() };
    if (editing) { updateMembro(editing.id, data); toast('✅ Membro atualizado!'); }
    else { addMembro(data); toast('✅ Membro adicionado ao time!'); }
    onClose();
  };

  return (
    <Modal open={open} title={editing ? '✏️ Editar Membro' : '🪖 Novo Membro'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="m-name">Nome Completo *</label>
            <input id="m-name" type="text" required placeholder="Nome do jogador" value={name}
              onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="m-nickname">Codinome / Callsign</label>
            <input id="m-nickname" type="text" placeholder="Ex: Wolf, Shadow..." value={nickname}
              onChange={(e) => setNickname(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="m-patente">Patente *</label>
            <select id="m-patente" className="config-input" required value={patente}
              onChange={(e) => setPatente(e.target.value as Patente)}>
              <option value="">Selecionar patente...</option>
              {(Object.keys(PATENTE_INFO) as Patente[]).map((p) => (
                <option key={p} value={p}>{PATENTE_INFO[p].icon} {p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="m-weapon">Arma Principal</label>
            <input id="m-weapon" type="text" placeholder="Ex: M4A1, AK-47..." value={weapon}
              onChange={(e) => setWeapon(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="m-join-date">Entrada no Time *</label>
            <input id="m-join-date" type="date" required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="m-phone">Telefone</label>
            <input id="m-phone" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="m-notes">Observações</label>
          <textarea id="m-notes" rows={2} placeholder="Notas sobre o membro..." value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--bg-input)', color: 'var(--text-100)', fontFamily: 'var(--ff-body)', outline: 'none', resize: 'vertical' }} />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">💾 Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
