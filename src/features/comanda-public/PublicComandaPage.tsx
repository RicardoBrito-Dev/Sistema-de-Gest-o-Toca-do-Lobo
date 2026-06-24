import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { lineItems } from '../../lib/calc';
import { brl, fmtDate } from '../../lib/format';
import { DEFAULTS } from '../../lib/constants';
import type { AttendanceRecord, Settings } from '../../types';

export function PublicComandaPage() {
  const { id } = useParams();
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');
  const [player, setPlayer] = useState<AttendanceRecord | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      const [pRes, sRes] = await Promise.all([
        supabase.from('attendance').select('*').eq('id', id).maybeSingle(),
        supabase.from('settings').select('*').limit(1),
      ]);
      if (pRes.error || !pRes.data) { setState('notfound'); return; }
      const d = pRes.data;
      setPlayer({
        id: d.id, name: d.name, date: d.date, hasWeapon: d.has_weapon ?? false,
        magazines: d.magazines ?? 0, drinks: d.drinks ?? 0, isTeam: d.is_team ?? false,
        paid: d.paid ?? false, paidAt: d.paid_at ? Number(d.paid_at) : undefined,
        extras: Array.isArray(d.extras) ? d.extras : [],
      });
      const s = sRes.data?.[0];
      if (s) setSettings({
        weaponRental: Number(s.weapon_rental), fieldFeeOwn: Number(s.field_fee_own),
        magazinePrice: Number(s.magazine_price), drinkPrice: Number(s.drink_price),
        teamDrinkPrice: Number(s.team_drink_price), username: s.username, password: s.password,
      });
      setState('ok');
    })();
  }, [id]);

  if (state === 'loading') return <div className="grid min-h-dvh place-items-center bg-canvas font-body text-surface-muted">Carregando…</div>;
  if (state === 'notfound' || !player) return <div className="grid min-h-dvh place-items-center bg-canvas font-body text-surface-muted">Comanda não encontrada.</div>;

  const li = lineItems(player, settings);
  const row = (label: string, value: string) => (
    <div className="flex justify-between border-b border-line py-2 text-sm"><span className="text-surface-muted">{label}</span><span className="tabular-nums text-surface-fg">{value}</span></div>
  );

  return (
    <div className="min-h-dvh bg-canvas px-4 py-8 font-body text-surface-fg">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
          <img src="/logo.jpg" alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div><p className="font-highlight font-bold">TOCA DO LOBO</p><p className="text-xs text-surface-muted">Comanda · {fmtDate(player.date)}</p></div>
        </div>
        <p className="mb-3 font-highlight text-lg font-bold">{player.name}</p>
        {row('Armamento', player.isTeam ? 'Membro do Time' : (player.hasWeapon ? 'Arma própria' : 'Arma alugada'))}
        {row('Carregadores', String(player.magazines || 0))}
        {row('Bebidas', String(player.drinks || 0))}
        {(player.extras ?? []).map((e) => row(`${e.name} x${e.qty}`, brl(e.price * e.qty)))}
        <div className="mt-3 flex justify-between text-base font-bold"><span>TOTAL</span><span className="tabular-nums text-secondary">{brl(li.total)}</span></div>
        <p className={`mt-4 rounded-lg px-3 py-2 text-center text-sm font-semibold ${player.paid ? 'bg-positive-50 text-positive' : 'bg-alert-50 text-alert-900'}`}>
          {player.paid ? '✅ PAGO' : '⏳ Em aberto'}
        </p>
      </div>
    </div>
  );
}
