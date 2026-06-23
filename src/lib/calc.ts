import type { AttendanceRecord, Settings } from '../types';

export function getChargeableMags(hasWeapon: boolean, magazines: number): number {
  const mags = magazines || 0;
  return hasWeapon ? mags : Math.max(0, mags - 2);
}

export interface LineItems { field: number; mags: number; drinks: number; total: number; }

/** Fonte única de verdade do preço — usada por todas as telas. */
export function lineItems(p: AttendanceRecord, s: Settings): LineItems {
  const field = p.isTeam ? 0 : (p.hasWeapon ? s.fieldFeeOwn : s.weaponRental);
  const mags = p.isTeam ? 0 : getChargeableMags(p.hasWeapon, p.magazines) * s.magazinePrice;
  const drinks = (p.drinks || 0) * (p.isTeam ? s.teamDrinkPrice : s.drinkPrice);
  return { field, mags, drinks, total: field + mags + drinks };
}

export function calcTotal(p: AttendanceRecord, s: Settings): number {
  return lineItems(p, s).total;
}
