import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { ComandaModal } from './ComandaModal';
import { lineItems } from '../../lib/calc';
import { brl, fmtDate, todayStr } from '../../lib/format';
import type { AttendanceRecord, Settings } from '../../types';

function ComandaRow({ p, settings, onPay, onAdjust }: {
  p: AttendanceRecord; settings: Settings;
  onPay: (id: string) => void;
  onAdjust: (id: string, field: 'magazines' | 'drinks', value: number) => void;
}) {
  const li = lineItems(p, settings);
  const arma = p.isTeam ? '🪖 Membro do Time' : (p.hasWeapon ? '🪖 Própria' : '🔫 Alugada');
  const paidAt = p.paidAt ? new Date(p.paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const qty = (field: 'magazines' | 'drinks') => (
    <div className="cmd-qty-controls">
      <button className="btn-cmd-adj" disabled={p.paid} onClick={() => onAdjust(p.id, field, (p[field] || 0) - 1)}>-</button>
      <input type="number" min={0} className={`cmd-input cmd-${field === 'magazines' ? 'mags' : 'drinks'}`}
        value={p[field] || 0} disabled={p.paid}
        onChange={(e) => onAdjust(p.id, field, Math.max(0, parseInt(e.target.value) || 0))} />
      <button className="btn-cmd-adj" disabled={p.paid} onClick={() => onAdjust(p.id, field, (p[field] || 0) + 1)}>+</button>
    </div>
  );
  return (
    <div className={`comanda-row ${p.paid ? 'cmd-row-paid' : ''}`}>
      <div className="row-name" style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {p.isTeam ? '🪖 ' : ''}{p.name}
        {p.paid && <span className="badge-pago-sm">✅ PAGO</span>}
      </div>
      <div className="row-weapon">{arma}</div>
      <div className="row-mags">{qty('magazines')}</div>
      <div className="row-drinks">{qty('drinks')}</div>
      <div className="row-prices">
        <span className="price">{brl(li.field)}</span>
        <span className="price">{brl(li.mags)}</span>
        <span className="price">{brl(li.drinks)}</span>
      </div>
      <div className="row-total cmd-total"><strong>{brl(li.total)}</strong></div>
      <div className="row-action">
        {p.paid
          ? <div className="cmd-paid-badge">✅ PAGO {paidAt && <small>{paidAt}</small>}</div>
          : <button className="btn-close-comanda" onClick={() => onPay(p.id)}>✅ Fechar</button>}
      </div>
    </div>
  );
}

export function ComandasPage() {
  const attendance = useStore((s) => s.attendance);
  const settings = useStore((s) => s.settings);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const payComanda = useStore((s) => s.payComanda);
  const { toast } = useToast();

  const [date, setDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const records = useMemo(() => {
    let recs = attendance.filter((p) => p.date === date).sort((a, b) => a.name.localeCompare(b.name));
    const q = search.toLowerCase().trim();
    if (q) recs = recs.filter((p) => p.name.toLowerCase().includes(q));
    return recs;
  }, [attendance, date, search]);

  const total = records.reduce((s, p) => s + lineItems(p, settings).total, 0);
  const allPaid = records.length > 0 && records.every((p) => p.paid);

  const onAdjust = (id: string, field: 'magazines' | 'drinks', value: number) => {
    updatePlayer(id, { [field]: Math.max(0, value) });
    toast('✏️ Comanda atualizada!');
  };
  const onPay = (id: string) => {
    const p = records.find((x) => x.id === id);
    if (!p || p.paid) return;
    if (!window.confirm(`Fechar comanda de ${p.name}?\nTotal: ${brl(lineItems(p, settings).total)}\n\nConfirmar pagamento?`)) return;
    payComanda(id);
    toast(`✅ Comanda de ${p.name} fechada!`);
  };

  return (
    <section className="tab-content active">
      <div className="tab-toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="filter-group" style={{ flex: 1, minWidth: 250 }}>
          <input type="text" className="search-input" style={{ width: '100%' }}
            placeholder="🔍 Buscar jogador pelo nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <input type="date" className="date-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="section-card">
        <div className="comandas-list">
          {records.length === 0 ? (
            <div className="empty-state">📋 Nenhuma comanda encontrada para este filtro</div>
          ) : (
            <div className={`comanda-card fade-in ${allPaid ? 'comanda-card-paid' : ''}`}>
              <div className="comanda-header">
                <div className="comanda-title">
                  <h3>📅 {fmtDate(date)}</h3>
                  <span className="comanda-summary">
                    🎯 {records.length} jogador(es) · 💰 {brl(total)}
                    {allPaid && <span className="badge-pago">✅ PAGO</span>}
                  </span>
                </div>
                <button className="btn-primary btn-sm" onClick={() => setModalOpen(true)}>📋 Imprimir</button>
              </div>
              <div className="comanda-list">
                {records.map((p) => (
                  <ComandaRow key={p.id} p={p} settings={settings} onPay={onPay} onAdjust={onAdjust} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ComandaModal open={modalOpen} label={fmtDate(date)} records={records} onClose={() => setModalOpen(false)} />
    </section>
  );
}
