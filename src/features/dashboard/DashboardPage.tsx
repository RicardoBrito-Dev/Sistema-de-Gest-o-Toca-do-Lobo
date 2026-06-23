import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Badge } from '../../components/Badge';
import { calcTotal } from '../../lib/calc';
import { brl, fmtDate, getRange, inRange } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

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
    <section className="tab-content active">
      <div className="stats-grid">
        <div className="stat-card income"><div className="stat-icon">💹</div>
          <div className="stat-info"><span className="stat-label">Entradas · Mês</span>
            <span className="stat-value">{brl(income)}</span></div></div>
        <div className="stat-card expense"><div className="stat-icon">📉</div>
          <div className="stat-info"><span className="stat-label">Saídas · Mês</span>
            <span className="stat-value">{brl(expense)}</span></div></div>
        <div className="stat-card balance"><div className="stat-icon">💼</div>
          <div className="stat-info"><span className="stat-label">Saldo · Mês</span>
            <span className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>{brl(balance)}</span></div></div>
        <div className="stat-card players"><div className="stat-icon">🎯</div>
          <div className="stat-info"><span className="stat-label">Jogadores · Mês</span>
            <span className="stat-value">{players}</span></div></div>
      </div>

      <div className="section-card">
        <h3 className="section-title">📅 Últimas Presenças</h3>
        <div id="recent-attendance">
          {recentDates.length === 0 ? (
            <p className="empty-state">Nenhum registro encontrado</p>
          ) : recentDates.map(({ date, players, dayTotal }) => (
            <div className="recent-day" key={date}>
              <div className="recent-day-header">
                <span className="recent-date">📅 {fmtDate(date)}</span>
                <span className="recent-day-total">{players.length} jogador(es) · {brl(dayTotal)}</span>
              </div>
              <div className="recent-players">
                {players.map((p) => (
                  <div className="recent-player" key={p.id}>
                    <span>{p.name}</span>
                    <Badge kind={p.hasWeapon ? 'badge-own' : 'badge-rental'}>
                      {p.hasWeapon ? '🪖 Própria' : '🔫 Alugada'}
                    </Badge>
                    <span className="player-total">{brl(calcTotal(p, settings))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
