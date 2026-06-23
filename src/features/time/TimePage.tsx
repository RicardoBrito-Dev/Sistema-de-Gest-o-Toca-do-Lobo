import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { MembroModal } from './MembroModal';
import { PATENTE_INFO, PATENTE_ORDER } from '../../lib/constants';
import { fmtDate } from '../../lib/format';
import type { Patente, TimeMember } from '../../types';

export function TimePage() {
  const time = useStore((s) => s.time);
  const deleteMembro = useStore((s) => s.deleteMembro);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [patenteFilter, setPatenteFilter] = useState<'all' | Patente>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimeMember | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const members = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...time]
      .filter((m) => (q === '' || m.name.toLowerCase().includes(q) || (m.nickname || '').toLowerCase().includes(q))
        && (patenteFilter === 'all' || m.patente === patenteFilter))
      .sort((a, b) => {
        const ri = PATENTE_ORDER.indexOf(b.patente) - PATENTE_ORDER.indexOf(a.patente);
        return ri !== 0 ? ri : a.name.localeCompare(b.name);
      });
  }, [time, search, patenteFilter]);

  const confirmRemove = () => {
    if (confirmId) { deleteMembro(confirmId); toast('🗑️ Membro removido do time!'); }
    setConfirmId(null);
  };

  return (
    <section className="tab-content active">
      <div className="tab-toolbar">
        <div className="filter-group" style={{ flex: 1, minWidth: 200 }}>
          <input type="text" className="search-input" style={{ width: '100%' }} placeholder="🔍 Buscar membro..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <select className="config-input" style={{ width: 170 }} value={patenteFilter}
            onChange={(e) => setPatenteFilter(e.target.value as 'all' | Patente)}>
            <option value="all">Todas as Patentes</option>
            {(Object.keys(PATENTE_INFO) as Patente[]).map((p) => (
              <option key={p} value={p}>{PATENTE_INFO[p].icon} {p}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>➕ Novo Membro</button>
      </div>

      <div className="time-grid">
        {members.length === 0 ? <p className="empty-state">Nenhum membro encontrado</p>
          : members.map((m) => {
            const pi = PATENTE_INFO[m.patente];
            const initials = (m.name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
            return (
              <div className="membro-card fade-in" key={m.id}>
                <div className="membro-card-header">
                  <div className="membro-avatar">{initials}</div>
                  <div className="membro-header-info">
                    <div className="membro-name">{m.name}</div>
                    {m.nickname && <div className="membro-callsign">"{m.nickname}"</div>}
                    <span className={`membro-patente-badge ${pi.cls}`}>{pi.icon} {m.patente}</span>
                  </div>
                </div>
                <div className="membro-card-body">
                  {m.weapon && <div className="membro-info-row"><span>🔫</span><span><strong>{m.weapon}</strong></span></div>}
                  {m.phone && <div className="membro-info-row"><span>📞</span><span>{m.phone}</span></div>}
                  <div className="membro-info-row"><span>📅</span><span>No time desde <strong>{m.joinDate ? fmtDate(m.joinDate) : '—'}</strong></span></div>
                  {m.notes && <div className="membro-info-row"><span>📝</span><span style={{ fontSize: '.78rem', color: 'var(--text-300)' }}>{m.notes}</span></div>}
                </div>
                <div className="membro-card-footer">
                  <button className="btn-icon btn-secondary" onClick={() => { setEditing(m); setModalOpen(true); }}>✏️ Editar</button>
                  <button className="btn-icon btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => setConfirmId(m.id)}>🗑️ Remover</button>
                </div>
              </div>
            );
          })}
      </div>

      <MembroModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmId !== null}
        message={`Remover ${time.find((m) => m.id === confirmId)?.name ?? 'este membro'} do time?`}
        onConfirm={confirmRemove} onCancel={() => setConfirmId(null)} />
    </section>
  );
}
