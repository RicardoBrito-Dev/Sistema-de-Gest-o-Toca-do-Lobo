import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Clock, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getChargeableMags, lineItems } from '../../lib/calc';
import { buildPixPayload } from '../../lib/pix';
import { brl, fmtDate } from '../../lib/format';
import { DEFAULTS, FREE_RENTAL_MAGS } from '../../lib/constants';
import type { AttendanceRecord, Settings } from '../../types';

interface ComandaData { player: AttendanceRecord; settings: Settings; }

/** Busca a comanda + settings no Supabase (anon, sem auth). Retorna null se não existir. */
async function fetchComanda(id: string | undefined): Promise<ComandaData | null> {
  const [pRes, sRes] = await Promise.all([
    supabase.from('attendance').select('*').eq('id', id).maybeSingle(),
    supabase.from('settings').select('*').limit(1),
  ]);
  if (pRes.error || !pRes.data) return null;
  const d = pRes.data;
  const player: AttendanceRecord = {
    id: d.id, name: d.name, date: d.date, hasWeapon: d.has_weapon ?? false,
    magazines: d.magazines ?? 0, drinks: d.drinks ?? 0, isTeam: d.is_team ?? false,
    paid: d.paid ?? false, paidAt: d.paid_at ? Number(d.paid_at) : undefined,
    paymentMethod: d.payment_method ?? undefined,
    extras: Array.isArray(d.extras) ? d.extras : [],
  };
  const s = sRes.data?.[0];
  const settings: Settings = s ? {
    weaponRental: Number(s.weapon_rental), fieldFeeOwn: Number(s.field_fee_own),
    magazinePrice: Number(s.magazine_price), drinkPrice: Number(s.drink_price),
    teamDrinkPrice: Number(s.team_drink_price), username: s.username, password: s.password,
    pixKey: s.pix_key ?? undefined, pixCity: s.pix_city ?? undefined,
  } : DEFAULTS;
  return { player, settings };
}

export function PublicComandaPage() {
  const { id } = useParams();
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');
  const [player, setPlayer] = useState<AttendanceRecord | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchComanda(id);
      if (cancelled) return;
      if (!data) { setState('notfound'); return; }
      setPlayer(data.player);
      setSettings(data.settings);
      setState('ok');
    })();
    return () => { cancelled = true; };
  }, [id]);

  const refresh = async () => {
    setRefreshing(true);
    const data = await fetchComanda(id);
    if (data) { setPlayer(data.player); setSettings(data.settings); setState('ok'); }
    setRefreshing(false);
  };

  if (state === 'loading') {
    return <div className="grid min-h-dvh place-items-center bg-canvas font-body text-surface-muted">Carregando…</div>;
  }
  if (state === 'notfound' || !player) {
    return <div className="grid min-h-dvh place-items-center bg-canvas font-body text-surface-muted">Comanda não encontrada.</div>;
  }

  const li = lineItems(player, settings);
  const isRental = !player.isTeam && !player.hasWeapon;
  const armamento = player.isTeam ? 'Membro do Time' : (player.hasWeapon ? 'Arma própria' : 'Arma alugada');
  const chargeableMags = getChargeableMags(player.hasWeapon, player.magazines);
  const paidTime = player.paidAt
    ? new Date(player.paidAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';

  // Detalhamento estilo recibo: linha-base sempre; carregadores/bebidas/extras só se houver valor.
  const rows: { label: string; value: number }[] = [
    { label: player.isTeam ? 'Membro do Time' : (player.hasWeapon ? 'Taxa do campo' : 'Campo + aluguel de arma'), value: li.field },
  ];
  if (li.mags > 0) rows.push({ label: `Carregadores ${isRental ? 'extras ' : ''}(${chargeableMags}x)`, value: li.mags });
  if (li.drinks > 0) rows.push({ label: `Bebidas (${player.drinks}x)`, value: li.drinks });
  (player.extras ?? []).forEach((e) => rows.push({ label: e.qty > 1 ? `${e.name} x${e.qty}` : e.name, value: e.price * e.qty }));

  const pixCode = (!player.paid && settings.pixKey && li.total > 0)
    ? buildPixPayload({ key: settings.pixKey, merchantName: 'TOCA DO LOBO', city: settings.pixCity || 'BRASIL', amount: li.total })
    : null;

  const copy = () => {
    if (!pixCode) return;
    navigator.clipboard?.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-canvas px-4 py-6 font-body text-surface-fg">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
            <img src="/logo.jpg" alt="" className="h-12 w-12 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-highlight font-bold leading-tight">TOCA DO LOBO</p>
              <p className="text-xs text-surface-muted">Comanda · {fmtDate(player.date)}</p>
            </div>
            <button onClick={refresh} aria-label="Atualizar"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-surface-muted transition-colors hover:bg-canvas hover:text-surface-fg">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <p className="font-highlight text-lg font-bold">{player.name}</p>
          <p className="mb-4 text-xs text-surface-muted">
            {armamento}
            {isRental && <> · <span className="font-medium text-secondary">inclui {FREE_RENTAL_MAGS} carregadores</span></>}
          </p>

          <div className="flex flex-col">
            {rows.map((r, i) => (
              <div key={i} className="flex justify-between border-b border-line/60 py-2 text-sm">
                <span className="text-surface-muted">{r.label}</span>
                <span className="tabular-nums text-surface-fg">{brl(r.value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-highlight text-base font-bold">TOTAL</span>
            <span className="font-highlight text-xl font-bold tabular-nums text-secondary">{brl(li.total)}</span>
          </div>

          {player.paid ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-positive-50 px-3 py-3 text-sm font-semibold text-positive">
              <Check size={16} /> Paga{paidTime ? ` · ${paidTime}` : ''}
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-alert-50 px-3 py-3 text-sm font-semibold text-alert-900">
              <Clock size={16} /> Em aberto
            </div>
          )}
        </div>

        {pixCode && (
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-center font-highlight font-bold text-surface-fg">Pagar com PIX</p>
            <p className="mb-4 text-center text-xs text-surface-muted">Escaneie no app do seu banco ou use o copia-e-cola</p>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-3"><QRCodeSVG value={pixCode} size={200} /></div>
              <button onClick={copy}
                className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-canvas">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar PIX copia-e-cola'}
              </button>
            </div>
          </div>
        )}

        {!player.paid && (
          <p className="text-center text-xs text-surface-muted">Os valores podem mudar até o fechamento da comanda.</p>
        )}
        <p className="text-center text-xs text-surface-muted">Toca do Lobo · Clube de Airsoft</p>
      </div>
    </div>
  );
}
