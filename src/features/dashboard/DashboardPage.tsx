import { useMemo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, CalendarDays } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '@/components/ui/badge';
import { calcTotal } from '../../lib/calc';
import { brl, fmtDate, getRange, inRange } from '../../lib/format';
import { useStore } from '../../store/useStore';
import type { AttendanceRecord } from '../../types';

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-muted">{label}</p>
        <p className="font-highlight text-xl font-bold text-surface-fg">{value}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const attendance = useStore((s) => s.attendance);
  const expenses = useStore((s) => s.expenses);
  const settings = useStore((s) => s.settings);

  const { income, expense, balance, players, recentDates } = useMemo(() => {
    const range = getRange('month');
    const mAtt = attendance.filter((p) => inRange(p.date, range));
    const mExp = expenses.filter((e) => inRange(e.date, range));
    const income = mAtt.reduce((s, p) => s + calcTotal(p, settings), 0);
    const expense = mExp.reduce((s, e) => s + e.amount, 0);

    const grouped: Record<string, AttendanceRecord[]> = {};
    [...attendance].sort((a, b) => b.date.localeCompare(a.date))
      .forEach((p) => { (grouped[p.date] ??= []).push(p); });
    const recentDates = Object.keys(grouped).slice(0, 5).map((date) => ({
      date, players: grouped[date],
      dayTotal: grouped[date].reduce((s, p) => s + calcTotal(p, settings), 0),
    }));

    return { income, expense, balance: income - expense, players: mAtt.length, recentDates };
  }, [attendance, expenses, settings]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<TrendingUp className="text-positive" size={22} />} tone="bg-positive-50"
          label="Entradas · Mês" value={brl(income)} />
        <Stat icon={<TrendingDown className="text-negative" size={22} />} tone="bg-negative-50"
          label="Saídas · Mês" value={brl(expense)} />
        <Stat icon={<Wallet className="text-secondary" size={22} />} tone="bg-secondary/10"
          label="Saldo · Mês" value={brl(balance)} />
        <Stat icon={<Target className="text-steelblue" size={22} />} tone="bg-steelblue-50"
          label="Jogadores · Mês" value={String(players)} />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-secondary" />
          <h3 className="font-highlight text-base font-bold text-surface-fg">Últimas Presenças</h3>
        </div>

        {recentDates.length === 0 ? (
          <p className="py-8 text-center text-sm text-surface-muted">Nenhum registro encontrado</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentDates.map(({ date, players, dayTotal }) => (
              <div key={date} className="rounded-xl border border-line">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="text-sm font-semibold text-surface-fg">{fmtDate(date)}</span>
                  <span className="text-sm font-medium text-surface-muted">
                    {players.length} jogador(es) · <span className="text-secondary">{brl(dayTotal)}</span>
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                      <span className="font-medium text-surface-fg">{p.name}</span>
                      {p.isTeam
                        ? <Badge colorsVariant="alert">🪖 Time</Badge>
                        : <Badge colorsVariant={p.hasWeapon ? 'positive' : 'steelblue'}>{p.hasWeapon ? 'Arma própria' : 'Arma alugada'}</Badge>}
                      <span className="font-semibold tabular-nums text-surface-fg">{brl(calcTotal(p, settings))}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
