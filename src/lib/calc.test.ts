import { describe, it, expect } from 'vitest';
import { getChargeableMags, lineItems, calcTotal } from './calc';
import type { AttendanceRecord, Settings, Product } from '../types';

const settings: Settings = {
  weaponRental: 40, fieldFeeOwn: 10, magazinePrice: 15,
  drinkPrice: 5, teamDrinkPrice: 3, teamDiscountPercent: 40, socioDiscountPercent: 40,
  username: 'admin', password: 'x',
};
const base: AttendanceRecord = {
  id: '1', name: 'João', date: '2026-06-21',
  hasWeapon: false, magazines: 0, drinks: 0, isTeam: false, isSocio: false,
};

const products: Product[] = [
  { id: '1', name: 'Cerveja', price: 10.00, active: true },
  { id: '2', name: 'Água', price: 5.00, active: true },
  { id: '3', name: 'Refrigerante', price: 6.00, active: true },
  { id: '4', name: 'Salgado', price: 8.00, active: true },
];

describe('calc', () => {
  it('aluga arma: 2 carregadores são cortesia', () => {
    expect(getChargeableMags(false, 3)).toBe(1);
    expect(getChargeableMags(true, 3)).toBe(3);
  });

  it('jogador comum: campo + carregadores + consumo dinâmico', () => {
    const p = { ...base, hasWeapon: true, magazines: 2, cerveja: 1, agua: 2 };
    // 10 (campo) + 2*15 (mags) + 1*10 (cerveja) + 2*5 (agua) = 60
    expect(calcTotal(p, settings, products)).toBe(60);
  });

  it('membro do time: isento de campo/mags, consumo com desconto percentual', () => {
    const p = { ...base, isTeam: true, hasWeapon: false, magazines: 5, cerveja: 2, refrigerante: 1 };
    // cerveja: 10.00 -> 6.00 com 40% desc
    // refrigerante: 6.00 -> 3.60 com 40% desc
    // total: 2*6.00 + 1*3.60 = 15.60
    const li = lineItems(p, settings, products);
    expect(li).toEqual({ field: 0, mags: 0, drinks: 15.60, extras: 0, total: 15.60 });
  });

  it('sócio: consumo com desconto percentual', () => {
    const p = { ...base, isSocio: true, salgado: 1 };
    // salgado: 8.00 -> 4.80 com 40% desc
    expect(lineItems(p, settings, products).drinks).toBe(4.80);
  });

  it('fallback de preços quando catalogo nao contem o produto', () => {
    const p = { ...base, cerveja: 1, agua: 1, refrigerante: 1, salgado: 1 };
    // fallbacks: Cerveja=8, Agua=4, Refrigerante=6, Salgado=7. Total = 25
    expect(lineItems(p, settings, []).drinks).toBe(25);
  });

  it('compatibilidade retroativa com drinks quando novos produtos nao estao presentes', () => {
    const p = { ...base, drinks: 2 };
    // 2 * 5 (drinkPrice de settings) = 10
    expect(lineItems(p, settings, products).drinks).toBe(10);
  });

  it('soma drinks genericos e produtos especificos ao mesmo tempo', () => {
    const p = { ...base, drinks: 2, cerveja: 1 };
    // drinks: 2 * 5 = 10
    // cerveja: 1 * 10 = 10
    // total: 20
    expect(lineItems(p, settings, products).drinks).toBe(20);
  });

  it('soma os extras no total', () => {
    const p = { ...base, hasWeapon: true, magazines: 0, extras: [{ id: 'x', name: 'Alvo', price: 5, qty: 2 }] };
    // 10 (campo) + 0 + 0 + 2*5 = 20
    expect(calcTotal(p, settings, products)).toBe(20);
    expect(lineItems(p, settings, products).extras).toBe(10);
  });
});

