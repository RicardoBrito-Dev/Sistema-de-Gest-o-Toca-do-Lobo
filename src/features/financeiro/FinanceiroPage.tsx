import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ExpenseModal } from './ExpenseModal';
import { getChargeableMags } from '../../lib/calc';
import { brl, fmtDate, getRange, inRange, periodLabel } from '../../lib/format';
import type { Expense, Period } from '../../types';

export function FinanceiroPage() {
  const attendance = useStore((s) => s.attendance);
  const expenses = useStore((s) => s.expenses);
  const settings = useStore((s) => s.settings);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const { toast } = useToast();

  const [period, setPeriod] = useState<Period>('month');
  const [customDate, setCustomDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const data = useMemo(() => {
    const range = getRange(period, period === 'day' ? customDate : undefined);
    const periodAtt = attendance.filter((p) => inRange(p.date, range));
    const periodExp = expenses.filter((e) => inRange(e.date, range));
    let fieldFee = 0, rental = 0, mags = 0, drinks = 0;
    periodAtt.forEach((p) => {
      if (p.isTeam) {
        // Membro do Time: isento de campo/carregadores; bebida com preço de time.
        drinks += (p.drinks || 0) * settings.teamDrinkPrice;
        return;
      }
      if (p.hasWeapon) fieldFee += settings.fieldFeeOwn; else rental += settings.weaponRental;
      mags += getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
      drinks += (p.drinks || 0) * settings.drinkPrice;
    });
    const totalIncome = fieldFee + rental + mags + drinks;
    const totalExpense = periodExp.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const barPct = totalIncome > 0 ? Math.max(0, Math.min(100, (balance / totalIncome) * 100)) : 0;
    return { fieldFee, rental, mags, drinks, totalIncome, totalExpense, balance, barPct, periodExp, label: periodLabel(period, range) };
  }, [attendance, expenses, settings, period, customDate]);

  const confirmRemove = () => {
    if (confirmId) { deleteExpense(confirmId); toast('Despesa removida!'); }
    setConfirmId(null);
  };

  const row = (label: string, value: string, strong = false) => (
    <div className="flex justify-between py-1 text-sm">
      <span className={strong ? 'font-semibold text-surface-fg' : 'text-surface-muted'}>{label}</span>
      <span className={`tabular-nums ${strong ? 'font-bold text-surface-fg' : 'text-surface-fg'}`}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-xl border border-line">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? 'bg-secondary text-white' : 'text-surface-muted hover:bg-canvas'}`}>
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Esta Semana' : 'Este Mês'}
            </button>
          ))}
        </div>
        {period === 'day' && (
          <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h4 className="mb-3 font-highlight text-sm font-bold uppercase tracking-wide text-positive">Entradas</h4>
          {row('Taxa do Campo', brl(data.fieldFee))}
          {row('Aluguel de Armas', brl(data.rental))}
          {row('Carregadores', brl(data.mags))}
          {row('Bebidas', brl(data.drinks))}
          <div className="mt-2 border-t border-line pt-2">{row('TOTAL ENTRADAS', brl(data.totalIncome), true)}</div>
        </Card>

        <Card className="flex flex-col p-5">
          <h4 className="mb-3 font-highlight text-sm font-bold uppercase tracking-wide text-negative">Saídas</h4>
          <div className="flex-1">
            {data.periodExp.length === 0 ? <p className="py-2 text-sm text-surface-muted">Sem despesas no período</p>
              : data.periodExp.map((e) => (
                <div key={e.id} className="flex justify-between py-1 text-sm">
                  <span className="text-surface-muted">{e.category}: {e.description}</span>
                  <span className="tabular-nums text-surface-fg">{brl(e.amount)}</span>
                </div>
              ))}
          </div>
          <div className="mt-2 border-t border-line pt-2">{row('TOTAL SAÍDAS', brl(data.totalExpense), true)}</div>
          <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={15} /> Lançar Despesa
          </Button>
        </Card>

        <Card className="flex flex-col justify-center p-5">
          <h4 className="mb-2 font-highlight text-sm font-bold uppercase tracking-wide text-surface-muted">Saldo Líquido</h4>
          <p className={`font-highlight text-3xl font-bold tabular-nums ${data.balance >= 0 ? 'text-positive' : 'text-negative'}`}>{brl(data.balance)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
            <div className={`h-full rounded-full ${data.balance >= 0 ? 'bg-positive' : 'bg-negative'}`} style={{ width: `${data.barPct}%` }} />
          </div>
          <p className="mt-2 text-xs capitalize text-surface-muted">{data.label}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <h3 className="border-b border-line px-4 py-3 font-highlight font-bold text-surface-fg">Despesas do Período</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm resp-table">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-surface-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.periodExp.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-surface-muted">Nenhuma despesa no período</td></tr>
              ) : data.periodExp.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-canvas">
                  <td data-label="Data" className="whitespace-nowrap px-4 py-3 text-surface-fg">{fmtDate(e.date)}</td>
                  <td data-label="Categoria" className="px-4 py-3"><Badge kind="badge-expense">{e.category}</Badge></td>
                  <td data-label="Descrição" className="px-4 py-3 text-surface-fg">{e.description}</td>
                  <td data-label="Valor" className="px-4 py-3 text-right font-semibold tabular-nums text-negative">{brl(e.amount)}</td>
                  <td data-label="Ações" className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Editar" onClick={() => { setEditing(e); setModalOpen(true); }}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-secondary/10 hover:text-secondary"><Pencil size={15} /></button>
                      <button title="Excluir" onClick={() => setConfirmId(e.id)}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-negative-50 hover:text-negative"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ExpenseModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir esta despesa? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
