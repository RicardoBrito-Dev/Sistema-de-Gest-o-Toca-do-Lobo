import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { todayStr } from '../../lib/format';
import type { Socio } from '../../types';

interface Props { open: boolean; editing: Socio | null; onClose: () => void; }

export function SocioModal({ open, editing, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? '✏️ Editar Sócio' : '👥 Novo Sócio'} onClose={onClose}>
      <SocioForm editing={editing} onClose={onClose} />
    </Modal>
  );
}

function SocioForm({ editing, onClose }: { editing: Socio | null; onClose: () => void }) {
  const addSocio = useStore((s) => s.addSocio);
  const updateSocio = useStore((s) => s.updateSocio);
  const { toast } = useToast();

  const [name, setName] = useState(() => editing?.name ?? '');
  const [monthlyFee, setMonthlyFee] = useState(() => (editing ? String(editing.monthlyFee) : ''));
  const [joinDate, setJoinDate] = useState(() => editing?.joinDate ?? todayStr());
  const [phone, setPhone] = useState(() => editing?.phone ?? '');
  const [notes, setNotes] = useState(() => editing?.notes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(monthlyFee) || 0;
    if (!name.trim() || !joinDate || fee <= 0) { toast('Preencha todos os campos obrigatórios!', 'error'); return; }
    const data = { name: name.trim(), monthlyFee: fee, joinDate, phone: phone.trim(), notes: notes.trim() };
    if (editing) { updateSocio(editing.id, data); toast('Sócio atualizado! ✅'); }
    else { addSocio(data); toast('Sócio adicionado! ✅'); }
    onClose();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="s-name">Nome do Sócio *</label>
          <input id="s-name" type="text" required placeholder="Nome completo"
            value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="s-monthly-fee">Valor Mensal (R$) *</label>
          <div className="input-money"><span>R$</span>
            <input id="s-monthly-fee" type="number" min="0.01" step="0.01" placeholder="0,00" required
              value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="s-join-date">Data de Filiação *</label>
          <input id="s-join-date" type="date" required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="s-phone">Telefone</label>
          <input id="s-phone" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="s-notes">Observações</label>
        <textarea id="s-notes" rows={2} placeholder="Notas sobre o sócio..." value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--bg-input)', color: 'var(--text-100)', fontFamily: 'var(--ff-body)', outline: 'none' }} />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">💾 Salvar</button>
      </div>
    </form>
  );
}
