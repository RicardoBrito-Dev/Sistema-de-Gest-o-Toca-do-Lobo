import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PlayerModal } from './PlayerModal';
import { PlayerHistoryModal } from '../../components/PlayerHistoryModal';
import { calcTotal } from '../../lib/calc';
import { brl, todayStr } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

export function AttendancePage() {
  const attendance = useStore((s) => s.attendance);
  const settings = useStore((s) => s.settings);
  const deletePlayer = useStore((s) => s.deletePlayer);
  const { toast } = useToast();

  const [dateFilter, setDateFilter] = useState(todayStr());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [historyPlayer, setHistoryPlayer] = useState<string | null>(null);

  const filtered = useMemo(
    () => attendance.filter((p) => p.date === dateFilter),
    [attendance, dateFilter],
  );
  const totals = useMemo(() => ({
    total: filtered.reduce((s, p) => s + calcTotal(p, settings), 0),
    mags: filtered.reduce((s, p) => s + (p.magazines || 0), 0),
    drinks: filtered.reduce((s, p) => s + (p.drinks || 0), 0),
  }), [filtered, settings]);

  const confirmRemove = () => {
    if (confirmId) { deletePlayer(confirmId); toast('Jogador removido!'); }
    setConfirmId(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-muted">
          Data:
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary" />
        </label>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16} /> Adicionar Jogador
        </Button>
      </div>

      <Card className="flex flex-wrap items-center gap-x-8 gap-y-2 p-4 text-sm">
        <span className="text-surface-muted">Jogadores: <strong className="text-surface-fg">{filtered.length}</strong></span>
        <span className="text-surface-muted">Total: <strong className="text-secondary">{brl(totals.total)}</strong></span>
        <span className="text-surface-muted">Carregadores: <strong className="text-surface-fg">{totals.mags}</strong></span>
        <span className="text-surface-muted">Bebidas: <strong className="text-surface-fg">{totals.drinks}</strong></span>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm resp-table">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-surface-muted">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Armamento</th>
                <th className="px-4 py-3 text-center font-medium">Carreg.</th>
                <th className="px-4 py-3 text-center font-medium">Bebidas</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-surface-muted">Nenhum jogador registrado nesta data</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-canvas">
                  <td data-label="Nome" className="px-4 py-3 font-medium text-surface-fg">
                    <button type="button" onClick={() => setHistoryPlayer(p.name)} className="text-left font-semibold text-surface-fg hover:text-secondary hover:underline">
                      {p.name}
                    </button>
                  </td>
                  <td data-label="Armamento" className="px-4 py-3">
                    {p.isTeam
                      ? <Badge kind="badge-active">🪖 Time</Badge>
                      : <Badge kind={p.hasWeapon ? 'badge-own' : 'badge-rental'}>{p.hasWeapon ? 'Arma própria' : 'Arma alugada'}</Badge>}
                  </td>
                  <td data-label="Carreg." className="px-4 py-3 text-center tabular-nums text-surface-fg">{p.magazines || 0}</td>
                  <td data-label="Bebidas" className="px-4 py-3 text-center tabular-nums text-surface-fg">{p.drinks || 0}</td>
                  <td data-label="Total" className="px-4 py-3 text-right font-semibold tabular-nums text-secondary">{brl(calcTotal(p, settings))}</td>
                  <td data-label="Ações" className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Editar" onClick={() => { setEditing(p); setModalOpen(true); }}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-secondary/10 hover:text-secondary">
                        <Pencil size={15} />
                      </button>
                      <button title="Excluir" onClick={() => setConfirmId(p.id)}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-negative-50 hover:text-negative">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PlayerModal open={modalOpen} editing={editing} defaultDate={dateFilter} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir este jogador? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
      <PlayerHistoryModal open={historyPlayer !== null} playerName={historyPlayer} onClose={() => setHistoryPlayer(null)} />
    </div>
  );
}
