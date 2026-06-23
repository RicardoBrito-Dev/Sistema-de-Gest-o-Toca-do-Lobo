import { describe, it, expect } from 'vitest';
import { ymd, inRange, fmtDate, brl, getRange } from './format';

describe('format', () => {
  it('ymd formata Date como YYYY-MM-DD', () => {
    expect(ymd(new Date(2026, 5, 9))).toBe('2026-06-09');
  });
  it('inRange respeita limites inclusivos', () => {
    const r = { start: '2026-06-01', end: '2026-06-30' };
    expect(inRange('2026-06-15', r)).toBe(true);
    expect(inRange('2026-07-01', r)).toBe(false);
  });
  it('brl formata moeda BRL', () => {
    // Intl usa espaço não-quebrável (U+00A0/U+202F) — normaliza antes de comparar.
    expect(brl(40).replace(/\s/g, ' ')).toBe('R$ 40,00');
  });
  it('getRange("day") usa a data custom', () => {
    expect(getRange('day', '2026-06-21')).toEqual({ start: '2026-06-21', end: '2026-06-21' });
  });
  it('fmtDate produz string não vazia em pt-BR', () => {
    expect(fmtDate('2026-06-21')).toMatch(/2026/);
  });
});
