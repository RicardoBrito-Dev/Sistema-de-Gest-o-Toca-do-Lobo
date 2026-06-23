import type { Period } from '../types';

export interface DateRange { start: string; end: string; }

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}

export function todayStr(): string {
  return ymd(new Date());
}

export function getRange(period: Period, customDate?: string): DateRange {
  const now = new Date();
  if (period === 'day') {
    const ds = customDate || todayStr();
    return { start: ds, end: ds };
  }
  if (period === 'week') {
    const dow = now.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now); mon.setDate(now.getDate() + offset);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: ymd(mon), end: ymd(sun) };
  }
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: ymd(first), end: ymd(last) };
}

export function inRange(ds: string, range: DateRange): boolean {
  return ds >= range.start && ds <= range.end;
}

export function fmtDate(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function periodLabel(period: Period, range: DateRange): string {
  if (period === 'day') return `Data: ${fmtDate(range.start)}`;
  if (period === 'week') return `Semana: ${fmtDate(range.start)} – ${fmtDate(range.end)}`;
  const [y, m] = range.start.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function brl(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
