import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AttendanceRecord, Expense, Socio, TimeMember, Settings, PersistedData,
} from '../types';
import { DEFAULTS, LEGACY_KEYS, STORE_KEY, uid } from '../lib/constants';

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/** Pura/testável: monta o estado a partir das chaves legadas, ou null se não aplicável. */
export function buildMigratedState(): PersistedData | null {
  if (localStorage.getItem(STORE_KEY)) return null;
  const hasLegacy = Object.values(LEGACY_KEYS).some((k) => localStorage.getItem(k) !== null);
  if (!hasLegacy) return null;
  return {
    attendance: parse<AttendanceRecord[]>(localStorage.getItem(LEGACY_KEYS.attendance), []),
    expenses: parse<Expense[]>(localStorage.getItem(LEGACY_KEYS.expenses), []),
    socios: parse<Socio[]>(localStorage.getItem(LEGACY_KEYS.socios), []),
    time: parse<TimeMember[]>(localStorage.getItem(LEGACY_KEYS.time), []),
    settings: { ...DEFAULTS, ...parse<Partial<Settings>>(localStorage.getItem(LEGACY_KEYS.settings), {}) },
  };
}

function runMigration(): void {
  const migrated = buildMigratedState();
  if (migrated) {
    localStorage.setItem(STORE_KEY, JSON.stringify({ state: migrated, version: 0 }));
  }
}
runMigration();

interface AppState extends PersistedData {
  addPlayer: (data: Omit<AttendanceRecord, 'id'>) => void;
  updatePlayer: (id: string, patch: Partial<AttendanceRecord>) => void;
  deletePlayer: (id: string) => void;
  payComanda: (id: string) => void;

  addExpense: (data: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addSocio: (data: Omit<Socio, 'id'>) => void;
  updateSocio: (id: string, patch: Partial<Socio>) => void;
  deleteSocio: (id: string) => void;

  addMembro: (data: Omit<TimeMember, 'id'>) => void;
  updateMembro: (id: string, patch: Partial<TimeMember>) => void;
  deleteMembro: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      attendance: [],
      expenses: [],
      socios: [],
      time: [],
      settings: { ...DEFAULTS },

      addPlayer: (data) => set((s) => ({ attendance: [...s.attendance, { ...data, id: uid() }] })),
      updatePlayer: (id, patch) => set((s) => ({
        attendance: s.attendance.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
      deletePlayer: (id) => set((s) => ({ attendance: s.attendance.filter((p) => p.id !== id) })),
      payComanda: (id) => set((s) => ({
        attendance: s.attendance.map((p) => (p.id === id ? { ...p, paid: true, paidAt: Date.now() } : p)),
      })),

      addExpense: (data) => set((s) => ({ expenses: [...s.expenses, { ...data, id: uid() }] })),
      updateExpense: (id, patch) => set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addSocio: (data) => set((s) => ({ socios: [...s.socios, { ...data, id: uid() }] })),
      updateSocio: (id, patch) => set((s) => ({
        socios: s.socios.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
      deleteSocio: (id) => set((s) => ({ socios: s.socios.filter((x) => x.id !== id) })),

      addMembro: (data) => set((s) => ({ time: [...s.time, { ...data, id: uid() }] })),
      updateMembro: (id, patch) => set((s) => ({
        time: s.time.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
      deleteMembro: (id) => set((s) => ({ time: s.time.filter((m) => m.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: STORE_KEY,
      partialize: (s): PersistedData => ({
        attendance: s.attendance, expenses: s.expenses, socios: s.socios,
        time: s.time, settings: s.settings,
      }),
    },
  ),
);
