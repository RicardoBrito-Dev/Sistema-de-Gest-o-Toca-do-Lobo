import type { AttendanceRecord, Settings, Product } from '../types';
import { FREE_RENTAL_MAGS } from './constants';

export function getChargeableMags(hasWeapon: boolean, magazines: number): number {
  const mags = magazines || 0;
  return hasWeapon ? mags : Math.max(0, mags - FREE_RENTAL_MAGS);
}

export interface LineItems { field: number; mags: number; drinks: number; extras: number; total: number; }

/** Desconto percentual aplicável a bebidas/comidas conforme perfil do jogador. */
export function memberDiscountPercent(
  p: Pick<AttendanceRecord, 'isTeam' | 'isSocio'>,
  s: Settings,
): number {
  if (p.isTeam) return s.teamDiscountPercent;
  if (p.isSocio) return s.socioDiscountPercent;
  return 0;
}

/** Aplica desconto percentual sobre um preço base (ex.: preço cadastrado do produto). */
export function applyDiscount(basePrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return basePrice;
  return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
}

/** Preço unitário com desconto de time/sócio. */
export function unitPrice(basePrice: number, p: AttendanceRecord, s: Settings): number {
  return applyDiscount(basePrice, memberDiscountPercent(p, s));
}

/** Busca o preço base do produto no catálogo, ignorando acentos e maiúsculas/minúsculas. */
export function getProductPrice(name: string, products: Product[] = []): number {
  const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const prod = products.find((pr) => {
    const prName = pr.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return prName === normalized && pr.active;
  });
  if (prod) return prod.price;

  // Fallbacks padrão caso o produto não esteja cadastrado no catálogo
  if (normalized === 'cerveja') return 8.00;
  if (normalized === 'agua') return 4.00;
  if (normalized === 'refrigerante') return 6.00;
  if (normalized === 'salgado') return 7.00;
  return 0;
}

/** Fonte única de verdade do preço — usada por todas as telas. */
export function lineItems(p: AttendanceRecord, s: Settings, products: Product[] = []): LineItems {
  const field = p.isTeam ? 0 : (p.hasWeapon ? s.fieldFeeOwn : s.weaponRental);
  const mags = p.isTeam ? 0 : getChargeableMags(p.hasWeapon, p.magazines) * s.magazinePrice;
  
  // Cálculo de consumo com base nos produtos específicos
  const cervejaPrice = unitPrice(getProductPrice('Cerveja', products), p, s);
  const aguaPrice = unitPrice(getProductPrice('Água', products), p, s);
  const refriPrice = unitPrice(getProductPrice('Refrigerante', products), p, s);
  const salgadoPrice = unitPrice(getProductPrice('Salgado', products), p, s);

  const cervejaTotal = (p.cerveja || 0) * cervejaPrice;
  const aguaTotal = (p.agua || 0) * aguaPrice;
  const refriTotal = (p.refrigerante || 0) * refriPrice;
  const salgadoTotal = (p.salgado || 0) * salgadoPrice;

  const legacyDrinks = (p.drinks || 0) * unitPrice(s.drinkPrice || 5.00, p, s);

  const drinks = cervejaTotal + aguaTotal + refriTotal + salgadoTotal + legacyDrinks;
  const extras = (p.extras ?? []).reduce((sum, it) => sum + it.price * it.qty, 0);

  return { field, mags, drinks, extras, total: field + mags + drinks + extras };
}

export function calcTotal(p: AttendanceRecord, s: Settings, products: Product[] = []): number {
  return lineItems(p, s, products).total;
}
