import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { todayStr, brl } from '../../lib/format';
import type { Expense, ExpenseCategory } from '../../types';

interface Props { open: boolean; editing: Expense | null; onClose: () => void; }

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function ExpenseModal({ open, editing, onClose }: Props) {
  return (
    <Modal open={open} title={editing ? 'Editar Despesa' : 'Lançar Despesa'} onClose={onClose}>
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

  // Ao editar, reconstituímos o valor total original a partir de amount * installments
  const [totalAmount, setTotalAmount] = useState(() => {
    if (!editing) return '';
    const n = editing.installments ?? 1;
    return String(n > 1 ? editing.amount * n : editing.amount);
  });
  const [installments, setInstallments] = useState(() => String(editing?.installments ?? 1));

  const parsedTotal = parseFloat(totalAmount) || 0;
  const parsedInstallments = Math.max(1, parseInt(installments) || 1);
  const installmentValue = parsedTotal > 0 ? parsedTotal / parsedInstallments : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !description.trim() || parsedTotal <= 0) {
      toast('Preencha todos os campos corretamente!', 'error');
      return;
    }
    const data = {
      date,
      category,
      description: description.trim(),
      // amount = valor da parcela (o que impacta dashboard/financeiro)
      amount: installmentValue,
      installments: parsedInstallments,
      totalAmount: parsedInstallments > 1 ? parsedTotal : undefined,
    };
    if (editing) { updateExpense(editing.id, data); toast('Despesa atualizada!'); }
    else { addExpense(data); toast('Despesa lançada!'); }
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="e-date" className={labelCls}>Data *</label>
          <input id="e-date" type="date" className={inputCls} required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="e-category" className={labelCls}>Categoria</label>
          <select id="e-category" className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="e-desc" className={labelCls}>Descrição *</label>
        <input id="e-desc" type="text" className={inputCls} required placeholder="Descreva a despesa"
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="e-amount" className={labelCls}>Valor Total (R$) *</label>
          <input id="e-amount" type="number" min="0.01" step="0.01" className={inputCls} required placeholder="0,00"
            value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="e-installments" className={labelCls}>Parcelas</label>
          <input id="e-installments" type="number" min="1" step="1" className={inputCls}
            value={installments} onChange={(e) => setInstallments(e.target.value)} />
        </div>
      </div>

      {/* Preview do parcelamento */}
      {parsedTotal > 0 && (
        <div className="rounded-xl border border-line bg-canvas px-4 py-3 text-sm">
          {parsedInstallments > 1 ? (
            <>
              <div className="flex justify-between py-0.5 text-surface-muted">
                <span>Valor total</span>
                <span className="tabular-nums">{brl(parsedTotal)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-surface-muted">
                <span>Número de parcelas</span>
                <span className="tabular-nums">{parsedInstallments}x</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold text-surface-fg">
                <span>Valor por parcela (impacto no caixa)</span>
                <span className="tabular-nums text-secondary">{brl(installmentValue)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between font-bold text-surface-fg">
              <span>Valor lançado</span>
              <span className="tabular-nums text-negative">{brl(parsedTotal)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
