import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { todayStr } from '../../lib/format';
import type { Expense, ExpenseCategory } from '../../types';

interface Props { open: boolean; editing: Expense | null; onClose: () => void; }

export function ExpenseModal({ open, editing, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? '✏️ Editar Despesa' : '📉 Lançar Despesa'} onClose={onClose}>
      <ExpenseForm editing={editing} onClose={onClose} />
    </Modal>
  );
}

function ExpenseForm({ editing, onClose }: { editing: Expense | null; onClose: () => void }) {
  const addExpense = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const { toast } = useToast();

  const [date, setDate] = useState(() => editing?.date ?? todayStr());
  const [category, setCategory] = useState<ExpenseCategory>(() => editing?.category ?? 'Manutenção');
  const [description, setDescription] = useState(() => editing?.description ?? '');
  const [amount, setAmount] = useState(() => (editing ? String(editing.amount) : ''));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount) || 0;
    if (!date || !description.trim() || value <= 0) { toast('Preencha todos os campos corretamente!', 'error'); return; }
    const data = { date, category, description: description.trim(), amount: value };
    if (editing) { updateExpense(editing.id, data); toast('Despesa atualizada! ✅'); }
    else { addExpense(data); toast('Despesa lançada! ✅'); }
    onClose();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="e-date">Data *</label>
          <input id="e-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="e-category">Categoria</label>
          <select id="e-category" className="config-input" value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="e-description">Descrição *</label>
        <input id="e-description" type="text" required placeholder="Descreva a despesa"
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="e-amount">Valor *</label>
        <div className="input-money"><span>R$</span>
          <input id="e-amount" type="number" min="0.01" step="0.01" placeholder="0,00" required
            value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">💾 Salvar</button>
      </div>
    </form>
  );
}
