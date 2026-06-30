import { useMemo } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store/useStore';
import { lineItems } from '../lib/calc';
import { brl, fmtDate } from '../lib/format';
import { Badge } from './Badge';

interface Props {
  open: boolean;
  playerName: string | null;
  onClose: () => void;
}

export function PlayerHistoryModal({ open, playerName, onClose }: Props) {
  const attendance = useStore((s) => s.attendance);
  const settings = useStore((s) => s.settings);
  const products = useStore((s) => s.products);

  const filtered = useMemo(() => {
    if (!playerName) return [];
    return attendance
      .filter((p) => p.name.toLowerCase().trim() === playerName.toLowerCase().trim())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, playerName]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { totalGames: 0, rentedCount: 0, ownCount: 0, favoriteWeapon: 'Nenhuma', totalSpent: 0 };

    let rentedCount = 0;
    let ownCount = 0;
    const rentedWeapons: string[] = [];

    filtered.forEach((p) => {
      if (p.isTeam) return;
      if (p.hasWeapon) {
        ownCount++;
      } else {
        rentedCount++;
        if (p.rentedWeapon) {
          rentedWeapons.push(p.rentedWeapon);
        }
      }
    });

    const weaponCounts: Record<string, number> = {};
    rentedWeapons.forEach((w) => {
      weaponCounts[w] = (weaponCounts[w] || 0) + 1;
    });
    const sortedWeapons = Object.entries(weaponCounts).sort((a, b) => b[1] - a[1]);
    const favoriteWeapon = sortedWeapons[0]
      ? `${sortedWeapons[0][0]} (${sortedWeapons[0][1]}x)`
      : rentedCount > 0
      ? 'Não especificada'
      : 'Nenhuma (usa arma própria)';

    const totalSpent = filtered.reduce((sum, p) => sum + lineItems(p, settings, products).total, 0);

    return {
      totalGames: filtered.length,
      rentedCount,
      ownCount,
      favoriteWeapon,
      totalSpent,
    };
  }, [filtered, settings, products]);

  if (!playerName) return null;

  return (
    <Modal open={open} title={`Histórico do Jogador — ${playerName}`} onClose={onClose} size="large">
      <div className="flex flex-col gap-6">
        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-canvas p-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Presenças</div>
            <div className="mt-1 text-2xl font-bold text-surface-fg">{stats.totalGames}</div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Arma Favorita</div>
            <div className="mt-1 text-sm font-bold text-brand-gold truncate" title={stats.favoriteWeapon}>
              {stats.favoriteWeapon}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Aluguéis</div>
            <div className="mt-1 text-2xl font-bold text-surface-fg">{stats.rentedCount}</div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Total Gasto</div>
            <div className="mt-1 text-xl font-bold text-secondary">{brl(stats.totalSpent)}</div>
          </div>
        </div>

        {/* Listagem de Partidas */}
        <div>
          <h4 className="mb-3 font-highlight text-sm font-bold uppercase tracking-wide text-surface-fg">Partidas Recentes</h4>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wider text-surface-muted">
                  <th className="p-3">Data</th>
                  <th className="p-3">Armamento</th>
                  <th className="p-3 text-center">Carreg.</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-surface-muted">Nenhum registro de jogo encontrado.</td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const li = lineItems(p, settings, products);
                    const armamentoText = p.isTeam
                      ? 'Membro do Time'
                      : p.hasWeapon
                      ? 'Arma Própria'
                      : p.rentedWeapon
                      ? `Alugou ${p.rentedWeapon}`
                      : 'Alugou Arma';

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-canvas/40">
                        <td className="p-3 text-surface-fg whitespace-nowrap">{fmtDate(p.date)}</td>
                        <td className="p-3">
                          <span className="font-medium text-surface-fg">{armamentoText}</span>
                        </td>
                        <td className="p-3 text-center tabular-nums text-surface-fg">{p.magazines || 0}</td>
                        <td className="p-3 text-right font-semibold text-secondary tabular-nums">{brl(li.total)}</td>
                        <td className="p-3 text-center">
                          {p.paid ? (
                            <Badge kind="badge-active">Pago</Badge>
                          ) : (
                            <Badge kind="badge-rental">Aberto</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
