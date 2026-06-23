import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { PlayerModal } from './PlayerModal';
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

  const filtered = useMemo(
    () => attendance.filter((p) => p.date === dateFilter),
    [attendance, dateFilter],
  );
  const totals = useMemo(() => ({
    total: filtered.reduce((s, p) => s + calcTotal(p, settings), 0),
    mags: filtered.reduce((s, p) => s + (p.magazines || 0), 0),
    drinks: filtered.reduce((s, p) => s + (p.drinks || 0), 0),
  }), [filtered, settings]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: AttendanceRecord) => { setEditing(p); setModalOpen(true); };
  const confirmRemove = () => {
    if (confirmId) { deletePlayer(confirmId); toast('Jogador removido!'); }
    setConfirmId(null);
  };

  return (
    <section className="tab-content active">
      <div className="tab-toolbar">
        <div className="date-filter">
          <label htmlFor="attendance-date-filter">📅 Data:</label>
          <input id="attendance-date-filter" type="date" className="date-input"
            value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={openAdd}>➕ Adicionar Jogador</button>
      </div>

      <div className="day-summary">
        <div className="summary-item">🎯 Jogadores: <strong>{filtered.length}</strong></div>
        <div className="summary-divider" />
        <div className="summary-item">💰 Total: <strong>{brl(totals.total)}</strong></div>
        <div className="summary-divider" />
        <div className="summary-item">🎯 Carregadores: <strong>{totals.mags}</strong></div>
        <div className="summary-divider" />
        <div className="summary-item">🥤 Bebidas: <strong>{totals.drinks}</strong></div>
      </div>

      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Nome</th><th>Armamento</th><th>Carregadores</th><th>Bebidas</th><th>Total</th><th>Ações</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">Nenhum jogador registrado nesta data</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="fade-in">
                  <td data-label="Nome"><strong>{p.name}</strong></td>
                  <td data-label="Armamento">
                    <Badge kind={p.hasWeapon ? 'badge-own' : 'badge-rental'}>
                      {p.hasWeapon ? '🪖 Própria' : '🔫 Alugada'}
                    </Badge>
                  </td>
                  <td data-label="Carregadores" className="text-center">{p.magazines || 0}</td>
                  <td data-label="Bebidas" className="text-center">{p.drinks || 0}</td>
                  <td data-label="Total" className="text-right">
                    <span className="value-positive">{brl(calcTotal(p, settings))}</span>
                  </td>
                  <td data-label="Ações" className="text-center" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-icon" title="Editar" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon danger" title="Excluir" onClick={() => setConfirmId(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerModal open={modalOpen} editing={editing} defaultDate={dateFilter} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir este jogador? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </section>
  );
}
