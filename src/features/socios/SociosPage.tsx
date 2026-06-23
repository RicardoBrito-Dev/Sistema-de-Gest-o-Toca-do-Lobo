import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
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
const BADGE: Record<ActivityStatus, { kind: string; text: string }> = {
  active: { kind: 'badge-active', text: 'Ativo' },
  inactive: { kind: 'badge-warning', text: 'Inativo' },
  'very-inactive': { kind: 'badge-critical', text: 'Crítico' },
};

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
    return socios.map((s) => {
      const visits = attendance.filter((p) => p.name === s.name).length;
      const days = daysInactive(s.name, attendance);
      const recs = attendance.filter((p) => p.name === s.name).sort((a, b) => b.date.localeCompare(a.date));
      return { socio: s, visits, days, status: statusOf(days), lastVisit: recs[0]?.date ?? null };
    }).filter((r) => (q === '' || r.socio.name.toLowerCase().includes(q)) && (filterStatus === 'all' || r.status === filterStatus));
  }, [socios, attendance, search, filterStatus]);

  const confirmRemove = () => {
    if (confirmId) { deleteSocio(confirmId); toast('Sócio removido!'); }
    setConfirmId(null);
  };

  const inputCls = 'h-10 rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)} className={inputCls}>
          <option value="all">Todos os Sócios</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos (30+ dias)</option>
          <option value="very-inactive">Críticos (60+ dias)</option>
        </select>
        <div className="relative flex-1 sm:min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input type="text" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-full pl-9`} />
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Novo Sócio</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-surface-muted">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Visitas</th>
                <th className="px-4 py-3 font-medium">Última Visita</th>
                <th className="px-4 py-3 text-center font-medium">Inatividade</th>
                <th className="px-4 py-3 text-right font-medium">Mensalidade</th>
                <th className="px-4 py-3 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-surface-muted">Nenhum sócio encontrado</td></tr>
              ) : rows.map(({ socio: s, visits, days, status, lastVisit }) => (
                <tr key={s.id} className="transition-colors hover:bg-canvas">
                  <td className="px-4 py-3 font-medium text-surface-fg">{s.name}</td>
                  <td className="px-4 py-3"><Badge kind={BADGE[status].kind}>{BADGE[status].text}</Badge></td>
                  <td className="px-4 py-3 text-center tabular-nums text-surface-fg">{visits}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-surface-fg">{lastVisit ? fmtDate(lastVisit) : 'Nunca veio'}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-surface-fg">{days} dias</td>
                  <td className="px-4 py-3 text-right tabular-nums text-surface-fg">{brl(s.monthlyFee)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Editar" onClick={() => { setEditing(s); setModalOpen(true); }}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-secondary/10 hover:text-secondary"><Pencil size={15} /></button>
                      <button title="Excluir" onClick={() => setConfirmId(s.id)}
                        className="rounded-lg p-2 text-surface-muted transition-colors hover:bg-negative-50 hover:text-negative"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SocioModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message="Deseja excluir este sócio? Esta ação não pode ser desfeita."
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
