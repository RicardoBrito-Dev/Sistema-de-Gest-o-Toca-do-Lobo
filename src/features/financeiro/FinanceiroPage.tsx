import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
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
      if (p.hasWeapon) fieldFee += settings.fieldFeeOwn; else rental += settings.weaponRental;
      mags += getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
      drinks += (p.drinks || 0) * settings.drinkPrice;
    });
    const totalIncome = fieldFee + rental + mags + drinks;
    const totalExpense = periodExp.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const barPct = totalIncome > 0 ? Math.max(0, Math.min(100, (balance / totalIncome) * 100)) : 0;
    return { fieldFee, rental, mags, drinks, totalIncome, totalExpense, balance, barPct,
      periodExp, label: periodLabel(period, range) };
  }, [attendance, expenses, settings, period, customDate]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); setModalOpen(true); };
  const confirmRemove = () => {
    if (confirmId) { deleteExpense(confirmId); toast('Despesa removida!'); }
    setConfirmId(null);
  };

  return (
    <section className="tab-content active">
      <div className="fin-toolbar">
        <div className="period-filters">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Esta Semana' : 'Este Mês'}
            </button>
          ))}
        </div>
        {period === 'day' && (
          <input type="date" className="date-input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
        )}
      </div>

      <div className="fin-summary-grid">
        <div className="fin-card income">
          <h4>💹 ENTRADAS</h4>
          <div className="fin-breakdown">
            <div className="fin-row"><span>Taxa do Campo (arma própria)</span><strong>{brl(data.fieldFee)}</strong></div>
            <div className="fin-row"><span>Aluguel de Armas</span><strong>{brl(data.rental)}</strong></div>
            <div className="fin-row"><span>Carregadores</span><strong>{brl(data.mags)}</strong></div>
            <div className="fin-row"><span>Bebidas</span><strong>{brl(data.drinks)}</strong></div>
            <div className="fin-row total-row"><span>TOTAL ENTRADAS</span><strong>{brl(data.totalIncome)}</strong></div>
          </div>
        </div>
        <div className="fin-card expense">
          <h4>📉 SAÍDAS</h4>
          <div className="fin-breakdown">
            <div className="fin-expenses-list">
              {data.periodExp.length === 0 ? <p className="empty-state">Sem despesas no período</p>
                : data.periodExp.map((e) => (
                  <div className="fin-row" key={e.id}><span>{e.category}: {e.description}</span><strong>{brl(e.amount)}</strong></div>
                ))}
            </div>
            <div className="fin-row total-row"><span>TOTAL SAÍDAS</span><strong>{brl(data.totalExpense)}</strong></div>
          </div>
          <button className="btn-secondary btn-block" onClick={openAdd}>➕ Lançar Despesa</button>
        </div>
        <div className="fin-card balance-card">
          <h4>💼 SALDO LÍQUIDO</h4>
          <div className="balance-display">
            <span className={`balance-value ${data.balance >= 0 ? 'positive' : 'negative'}`}>{brl(data.balance)}</span>
          </div>
          <div className="balance-bar-wrap">
            <div className={`balance-bar ${data.balance >= 0 ? 'pos' : 'neg'}`} style={{ width: `${data.barPct}%` }} />
          </div>
          <p className="balance-label">{data.label}</p>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">📝 Despesas do Período</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
            <tbody>
              {data.periodExp.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">Nenhuma despesa no período</td></tr>
              ) : data.periodExp.map((e) => (
                <tr key={e.id} className="fade-in">
                  <td data-label="Data" style={{ whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                  <td data-label="Categoria"><Badge kind="badge-expense">{e.category}</Badge></td>
                  <td data-label="Descrição">{e.description}</td>
                  <td data-label="Valor" className="text-right"><span className="value-negative">{brl(e.amount)}</span></td>
                  <td data-label="Ações" className="text-center" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-icon" title="Editar" onClick={() => openEdit(e)}>✏️</button>
                    <button className="btn-icon danger" title="Excluir" onClick={() => setConfirmId(e.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir esta despesa? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </section>
  );
}
