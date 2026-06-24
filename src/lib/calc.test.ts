import { describe, it, expect } from 'vitest';
import { getChargeableMags, lineItems, calcTotal } from './calc';
import type { AttendanceRecord, Settings } from '../types';

const settings: Settings = {
  weaponRental: 40, fieldFeeOwn: 10, magazinePrice: 15,
  drinkPrice: 5, teamDrinkPrice: 3, username: 'admin', password: 'x',
};
const base: AttendanceRecord = {
  id: '1', name: 'João', date: '2026-06-21',
  hasWeapon: false, magazines: 0, drinks: 0, isTeam: false,
};

describe('calc', () => {
  it('aluga arma: 2 carregadores são cortesia', () => {
    expect(getChargeableMags(false, 3)).toBe(1);
    expect(getChargeableMags(true, 3)).toBe(3);
  });
  it('jogador comum: campo + carregadores + bebidas', () => {
    const p = { ...base, hasWeapon: true, magazines: 2, drinks: 1 };
    // 10 (campo) + 2*15 (mags) + 1*5 (bebida) = 45
    expect(calcTotal(p, settings)).toBe(45);
  });
  it('membro do time: isento de campo/mags, bebida com preço de time', () => {
    const p = { ...base, isTeam: true, hasWeapon: false, magazines: 5, drinks: 2 };
    // 0 + 0 + 2*3 = 6
    expect(calcTotal(p, settings)).toBe(6);
    const li = lineItems(p, settings);
    expect(li).toEqual({ field: 0, mags: 0, drinks: 6, extras: 0, total: 6 });
  });
  it('soma os extras no total', () => {
    const p = { ...base, hasWeapon: true, magazines: 0, drinks: 0, extras: [{ id: 'x', name: 'Água', price: 5, qty: 2 }] };
    // 10 (campo) + 0 + 0 + 2*5 = 20
    expect(calcTotal(p, settings)).toBe(20);
    expect(lineItems(p, settings).extras).toBe(10);
  });
});
