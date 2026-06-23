import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { SocioModal } from './SocioModal';
import { brl, fmtDate } from '../../lib/format';
import type { AttendanceRecord, Socio } from '../../types';

type StatusFilter = 'all' | 'active' | 'inactive' | 'very-inactive';
type ActivityStatus = 'active' | 'inactive' | 'very-inactive';

function daysInactive(name: string, attendance: AttendanceRecord[]): number {
  const recs = attendance.filter((p) => p.name === name).sort((a, b) => b.date.localeCompare(a.date));
  if (recs.length === 0) return 999;
  const [y, m, d] = recs[0].date.split('-').map(Number);
  return Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000);
}
function statusOf(days: number): ActivityStatus {
  if (days > 60) return 'very-inactive';
  if (days > 30) return 'inactive';
  return 'active';
}

export function SociosPage() {
  const socios = useStore((s) => s.socios);
  const attendance = useStore((s) => s.attendance);
  const deleteSocio = useStore((s) => s.deleteSocio);
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Socio | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return socios
      .map((s) => {
        const visits = attendance.filter((p) => p.name === s.name).length;
        const days = daysInactive(s.name, attendance);
        const recs = attendance.filter((p) => p.name === s.name).sort((a, b) => b.date.localeCompare(a.date));
        return { socio: s, visits, days, status: statusOf(days), lastVisit: recs[0]?.date ?? null };
      })
      .filter((r) => (q === '' || r.socio.name.toLowerCase().includes(q))
        && (filterStatus === 'all' || r.status === filterStatus));
  }, [socios, attendance, search, filterStatus]);

  const badge = (status: ActivityStatus) =>
    status === 'inactive' ? { cls: 'badge-warning', text: '⚠️ Inativo' }
    : status === 'very-inactive' ? { cls: 'badge-critical', text: '🔴 Crítico' }
    : { cls: 'badge-active', text: '✅ Ativo' };

  const confirmRemove = () => {
    if (confirmId) { deleteSocio(confirmId); toast('Sócio removido!'); }
    setConfirmId(null);
  };

  return (
    <section className="tab-content active">
      <div className="tab-toolbar">
        <div className="filter-group">
          <label htmlFor="socios-filter-status">🔍 Filtrar:</label>
          <select id="socios-filter-status" className="config-input" style={{ width: 200 }}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}>
            <option value="all">Todos os Sócios</option>
            <option value="active">✅ Ativos (visitaram recentemente)</option>
            <option value="inactive">⚠️ Inativos (sem visitas há 30+ dias)</option>
            <option value="very-inactive">🔴 Muito Inativos (sem visitas há 60+ dias)</option>
          </select>
        </div>
        <input type="text" className="search-input" placeholder="Buscar por nome..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>➕ Novo Sócio</button>
      </div>

      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Nome</th><th>Status de Filiação</th><th>Visitas</th><th>Última Visita</th>
              <th>Dias de Inatividade</th><th>Valor Mensal</th><th>Ações</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">Nenhum sócio encontrado com esse filtro</td></tr>
              ) : rows.map(({ socio: s, visits, days, status, lastVisit }) => {
                const b = badge(status);
                return (
                  <tr key={s.id} className="fade-in">
                    <td data-label="Nome"><strong>{s.name}</strong></td>
                    <td data-label="Status de Filiação"><Badge kind={b.cls}>{b.text}</Badge></td>
                    <td data-label="Visitas" className="text-center"><strong>{visits}</strong></td>
                    <td data-label="Última Visita" style={{ whiteSpace: 'nowrap' }}>{lastVisit ? fmtDate(lastVisit) : 'Nunca veio'}</td>
                    <td data-label="Dias de Inatividade" className="text-center"><strong>{days} dias</strong></td>
                    <td data-label="Valor Mensal" className="text-right">{brl(s.monthlyFee)}</td>
                    <td data-label="Ações" className="text-center" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-icon" title="Editar" onClick={() => { setEditing(s); setModalOpen(true); }}>✏️</button>
                      <button className="btn-icon danger" title="Excluir" onClick={() => setConfirmId(s.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SocioModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir este sócio? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </section>
  );
}
