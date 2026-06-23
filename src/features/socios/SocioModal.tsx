import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { todayStr } from '../../lib/format';
import type { Socio } from '../../types';

interface Props { open: boolean; editing: Socio | null; onClose: () => void; }

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function SocioModal({ open, editing, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? 'Editar Sócio' : 'Novo Sócio'} onClose={onClose}>
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
    if (editing) { updateSocio(editing.id, data); toast('Sócio atualizado!'); }
    else { addSocio(data); toast('Sócio adicionado!'); }
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="s-name" className={labelCls}>Nome do Sócio *</label>
          <input id="s-name" className={inputCls} required value={name} autoFocus onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
        </div>
        <div>
          <label htmlFor="s-fee" className={labelCls}>Valor Mensal (R$) *</label>
          <input id="s-fee" type="number" min="0.01" step="0.01" className={inputCls} required value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} placeholder="0,00" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="s-join" className={labelCls}>Data de Filiação *</label>
          <input id="s-join" type="date" className={inputCls} required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="s-phone" className={labelCls}>Telefone</label>
          <input id="s-phone" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div>
        <label htmlFor="s-notes" className={labelCls}>Observações</label>
        <textarea id="s-notes" rows={2} className={`${inputCls} h-auto py-2`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o sócio..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
