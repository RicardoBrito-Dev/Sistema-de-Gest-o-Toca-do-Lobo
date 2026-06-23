import { describe, it, expect, beforeEach } from 'vitest';
import { buildMigratedState } from './useStore';
import { LEGACY_KEYS, STORE_KEY, DEFAULTS } from '../lib/constants';

describe('buildMigratedState', () => {
  beforeEach(() => localStorage.clear());

  it('retorna null se já existe store nova', () => {
    localStorage.setItem(STORE_KEY, '{}');
    expect(buildMigratedState()).toBeNull();
  });

  it('retorna null se não há nada legado', () => {
    expect(buildMigratedState()).toBeNull();
  });

  it('importa as chaves legadas presentes e completa o resto', () => {
    localStorage.setItem(LEGACY_KEYS.attendance, JSON.stringify([{ id: 'a', name: 'João' }]));
    localStorage.setItem(LEGACY_KEYS.settings, JSON.stringify({ drinkPrice: 7 }));
    const state = buildMigratedState();
    expect(state).not.toBeNull();
    expect(state!.attendance).toHaveLength(1);
    expect(state!.expenses).toEqual([]);
    expect(state!.settings.drinkPrice).toBe(7);
    expect(state!.settings.weaponRental).toBe(DEFAULTS.weaponRental);
  });
});
