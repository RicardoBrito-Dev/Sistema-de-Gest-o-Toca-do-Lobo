import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AttendanceRecord, Expense, Socio, TimeMember, Settings, PersistedData, PaymentMethod, Product, ComandaItem, User,
} from '../types';
import { DEFAULTS, LEGACY_KEYS, STORE_KEY, uid } from '../lib/constants';
import { supabase } from '../lib/supabase';

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
    products: [],
    users: [],
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

// Mappers for database snake_case columns to/from camelCase interface properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>;
function toReactPlayer(p: DbRow): AttendanceRecord {
  return {
    id: p.id,
    name: p.name,
    date: p.date,
    hasWeapon: p.has_weapon ?? false,
    magazines: p.magazines ?? 0,
    drinks: p.drinks ?? 0,
    isTeam: p.is_team ?? false,
    paid: p.paid ?? false,
    paidAt: p.paid_at ? Number(p.paid_at) : undefined,
    paymentMethod: p.payment_method ?? undefined,
    extras: Array.isArray(p.extras) ? p.extras : [],
  };
}

function toDbPlayer(p: AttendanceRecord) {
  return {
    id: p.id,
    name: p.name,
    date: p.date,
    has_weapon: p.hasWeapon ?? false,
    magazines: p.magazines ?? 0,
    drinks: p.drinks ?? 0,
    is_team: p.isTeam ?? false,
    paid: p.paid ?? false,
    paid_at: p.paidAt || null,
    payment_method: p.paymentMethod ?? null,
    extras: p.extras ?? [],
  };
}

function toReactSocio(s: DbRow): Socio {
  return {
    id: s.id,
    name: s.name,
    monthlyFee: Number(s.monthly_fee),
    joinDate: s.join_date,
    phone: s.phone || undefined,
    notes: s.notes || undefined,
  };
}

function toDbSocio(s: Socio) {
  return {
    id: s.id,
    name: s.name,
    monthly_fee: s.monthlyFee,
    join_date: s.joinDate,
    phone: s.phone || null,
    notes: s.notes || null,
  };
}

function toReactMembro(m: DbRow): TimeMember {
  return {
    id: m.id,
    name: m.name,
    nickname: m.nickname || undefined,
    patente: m.patente,
    weapon: m.weapon || undefined,
    joinDate: m.join_date,
    phone: m.phone || undefined,
    notes: m.notes || undefined,
  };
}

function toDbMembro(m: TimeMember) {
  return {
    id: m.id,
    name: m.name,
    nickname: m.nickname || null,
    patente: m.patente,
    weapon: m.weapon || null,
    join_date: m.joinDate,
    phone: m.phone || null,
    notes: m.notes || null,
  };
}

function toReactSettings(s: DbRow): Settings {
  return {
    weaponRental: Number(s.weapon_rental),
    fieldFeeOwn: Number(s.field_fee_own),
    magazinePrice: Number(s.magazine_price),
    drinkPrice: Number(s.drink_price),
    teamDrinkPrice: Number(s.team_drink_price),
    username: s.username,
    password: s.password,
    pixKey: s.pix_key ?? undefined,
    pixCity: s.pix_city ?? undefined,
  };
}

function toDbSettings(s: Settings) {
  return {
    id: 1,
    weapon_rental: s.weaponRental,
    field_fee_own: s.fieldFeeOwn,
    magazine_price: s.magazinePrice,
    drink_price: s.drinkPrice,
    team_drink_price: s.teamDrinkPrice,
    username: s.username,
    password: s.password,
    pix_key: s.pixKey ?? null,
    pix_city: s.pixCity ?? null,
  };
}

function toReactProduct(p: DbRow): Product {
  return { id: p.id, name: p.name, price: Number(p.price), active: p.active ?? true };
}

function toDbProduct(p: Product) {
  return { id: p.id, name: p.name, price: p.price, active: p.active };
}

function toReactUser(u: DbRow): User {
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name || undefined,
    role: u.role === 'admin' ? 'admin' : 'operador',
    active: u.active ?? true,
  };
}

function toDbUser(u: User) {
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name || null,
    role: u.role,
    active: u.active,
  };
}

interface AppState extends PersistedData {
  dbStatus: 'idle' | 'loading' | 'success' | 'error';
  dbError: string | null;
  initDb: () => Promise<void>;

  addPlayer: (data: Omit<AttendanceRecord, 'id'>) => void;
  updatePlayer: (id: string, patch: Partial<AttendanceRecord>) => void;
  deletePlayer: (id: string) => void;
  payComanda: (id: string, method: PaymentMethod) => void;
  reopenComanda: (id: string) => void;

  addProduct: (data: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addExtra: (playerId: string, item: Omit<ComandaItem, 'id'>) => void;
  removeExtra: (playerId: string, itemId: string) => void;

  addExpense: (data: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addSocio: (data: Omit<Socio, 'id'>) => void;
  updateSocio: (id: string, patch: Partial<Socio>) => void;
  deleteSocio: (id: string) => void;

  addMembro: (data: Omit<TimeMember, 'id'>) => void;
  updateMembro: (id: string, patch: Partial<TimeMember>) => void;
  deleteMembro: (id: string) => void;

  addUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      attendance: [],
      expenses: [],
      socios: [],
      time: [],
      products: [],
      users: [],
      settings: { ...DEFAULTS },
      dbStatus: 'idle',
      dbError: null,

      initDb: async () => {
        set({ dbStatus: 'loading', dbError: null });
        try {
          const [settingsRes, timeRes, sociosRes, expensesRes, attendanceRes, productsRes, usersRes] = await Promise.all([
            supabase.from('settings').select('*'),
            supabase.from('time_members').select('*'),
            supabase.from('socios').select('*'),
            supabase.from('expenses').select('*'),
            supabase.from('attendance').select('*'),
            supabase.from('products').select('*'),
            supabase.from('users').select('*'),
          ]);

          // products/users são opcionais: se a tabela ainda não existe (migração não aplicada), não derruba o app
          const err = settingsRes.error || timeRes.error || sociosRes.error || expensesRes.error || attendanceRes.error;
          if (err) {
            throw new Error(err.message || 'Erro desconhecido ao carregar dados do Supabase.');
          }
          if (productsRes.error) {
            console.warn('Tabela "products" indisponível (rode a migração SQL do Comandas v2):', productsRes.error.message);
          }
          if (usersRes.error) {
            console.warn('Tabela "users" indisponível (rode a migração SQL do multiusuário):', usersRes.error.message);
          }

          let finalSettings = settingsRes.data?.[0] ? toReactSettings(settingsRes.data[0]) : null;
          let finalTime = timeRes.data ? timeRes.data.map(toReactMembro) : [];
          let finalSocios = sociosRes.data ? sociosRes.data.map(toReactSocio) : [];
          let finalExpenses = expensesRes.data ? expensesRes.data : [];
          let finalAttendance = attendanceRes.data ? attendanceRes.data.map(toReactPlayer) : [];
          let finalProducts = productsRes.data ? productsRes.data.map(toReactProduct) : [];
          let finalUsers = usersRes.data ? usersRes.data.map(toReactUser) : [];

          // Seed do primeiro admin: se a tabela users existe mas está vazia, cria o admin
          // a partir das credenciais atuais do settings (preserva o acesso existente).
          if (!usersRes.error && finalUsers.length === 0 && finalSettings) {
            const seedAdmin: User = {
              id: uid(),
              username: finalSettings.username,
              password: finalSettings.password,
              name: 'Administrador',
              role: 'admin',
              active: true,
            };
            const { error: seedErr } = await supabase.from('users').insert(toDbUser(seedAdmin));
            if (!seedErr) finalUsers = [seedAdmin];
            else console.warn('Falha ao semear admin inicial:', seedErr.message);
          }

          // Se as tabelas estiverem sem dados (primeiro acesso no Supabase), alimentamos com os dados locais atuais do localStorage
          if (!finalSettings) {
            const state = get();
            console.log('Supabase vazio. Seeding com dados locais...');

            await supabase.from('settings').upsert(toDbSettings(state.settings));
            finalSettings = state.settings;

            if (state.time.length > 0) {
              await supabase.from('time_members').upsert(state.time.map(toDbMembro));
              finalTime = state.time;
            }
            if (state.socios.length > 0) {
              await supabase.from('socios').upsert(state.socios.map(toDbSocio));
              finalSocios = state.socios;
            }
            if (state.expenses.length > 0) {
              await supabase.from('expenses').upsert(state.expenses);
              finalExpenses = state.expenses;
            }
            if (state.attendance.length > 0) {
              await supabase.from('attendance').upsert(state.attendance.map(toDbPlayer));
              finalAttendance = state.attendance;
            }
            if (state.products.length > 0) {
              await supabase.from('products').upsert(state.products.map(toDbProduct));
              finalProducts = state.products;
            }
          }

          set({
            settings: finalSettings,
            time: finalTime,
            socios: finalSocios,
            expenses: finalExpenses,
            attendance: finalAttendance,
            products: finalProducts,
            users: finalUsers,
            dbStatus: 'success',
            dbError: null,
          });
        } catch (err) {
          console.error('Falha ao conectar com o Supabase:', err);
          set({
            dbStatus: 'error',
            dbError: (err instanceof Error ? err.message : null) || 'Erro ao carregar dados do banco de dados.',
          });
        }
      },

      addPlayer: (data) => {
        // Inicializa explicitamente paid: false para evitar undefined e bugs com comandas reabertas
        const newPlayer: AttendanceRecord = { ...data, id: uid(), paid: false };
        set((s) => ({ attendance: [...s.attendance, newPlayer] }));
        supabase.from('attendance').insert(toDbPlayer(newPlayer)).then(({ error }) => {
          if (error) console.error('Erro ao adicionar jogador no Supabase:', error);
        });
      },
      updatePlayer: (id, patch) => {
        set((s) => {
          const updated = s.attendance.map((p) => (p.id === id ? { ...p, ...patch } : p));
          const target = updated.find((p) => p.id === id);
          if (target) {
            supabase.from('attendance').update(toDbPlayer(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar jogador no Supabase:', error);
            });
          }
          return { attendance: updated };
        });
      },
      deletePlayer: (id) => {
        set((s) => ({ attendance: s.attendance.filter((p) => p.id !== id) }));
        supabase.from('attendance').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar jogador no Supabase:', error);
        });
      },
      payComanda: (id, method) => {
        set((s) => {
          const updated = s.attendance.map((p) =>
            p.id === id ? { ...p, paid: true, paidAt: Date.now(), paymentMethod: method } : p);
          const target = updated.find((p) => p.id === id);
          if (target) {
            supabase.from('attendance').update(toDbPlayer(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao fechar comanda no Supabase:', error);
            });
          }
          return { attendance: updated };
        });
      },
      reopenComanda: (id) => {
        set((s) => {
          const updated = s.attendance.map((p) =>
            p.id === id ? { ...p, paid: false, paidAt: undefined, paymentMethod: undefined } : p);
          const target = updated.find((p) => p.id === id);
          if (target) {
            supabase.from('attendance').update(toDbPlayer(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao reabrir comanda no Supabase:', error);
            });
          }
          return { attendance: updated };
        });
      },

      addProduct: (data) => {
        const newProduct: Product = { ...data, id: uid() };
        set((s) => ({ products: [...s.products, newProduct] }));
        supabase.from('products').insert(toDbProduct(newProduct)).then(({ error }) => {
          if (error) console.error('Erro ao adicionar produto no Supabase:', error);
        });
      },
      updateProduct: (id, patch) => {
        set((s) => {
          const updated = s.products.map((p) => (p.id === id ? { ...p, ...patch } : p));
          const target = updated.find((p) => p.id === id);
          if (target) {
            supabase.from('products').update(toDbProduct(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar produto no Supabase:', error);
            });
          }
          return { products: updated };
        });
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        supabase.from('products').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar produto no Supabase:', error);
        });
      },
      addExtra: (playerId, item) => {
        const newItem: ComandaItem = { ...item, id: uid() };
        set((s) => {
          const updated = s.attendance.map((p) =>
            p.id === playerId ? { ...p, extras: [...(p.extras ?? []), newItem] } : p);
          const target = updated.find((p) => p.id === playerId);
          if (target) {
            supabase.from('attendance').update(toDbPlayer(target)).eq('id', playerId).then(({ error }) => {
              if (error) console.error('Erro ao adicionar item na comanda no Supabase:', error);
            });
          }
          return { attendance: updated };
        });
      },
      removeExtra: (playerId, itemId) => {
        set((s) => {
          const updated = s.attendance.map((p) =>
            p.id === playerId ? { ...p, extras: (p.extras ?? []).filter((e) => e.id !== itemId) } : p);
          const target = updated.find((p) => p.id === playerId);
          if (target) {
            supabase.from('attendance').update(toDbPlayer(target)).eq('id', playerId).then(({ error }) => {
              if (error) console.error('Erro ao remover item da comanda no Supabase:', error);
            });
          }
          return { attendance: updated };
        });
      },

      addExpense: (data) => {
        const newExpense: Expense = { ...data, id: uid() };
        set((s) => ({ expenses: [...s.expenses, newExpense] }));
        supabase.from('expenses').insert(newExpense).then(({ error }) => {
          if (error) console.error('Erro ao adicionar despesa no Supabase:', error);
        });
      },
      updateExpense: (id, patch) => {
        set((s) => {
          const updated = s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
          const target = updated.find((e) => e.id === id);
          if (target) {
            supabase.from('expenses').update(target).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar despesa no Supabase:', error);
            });
          }
          return { expenses: updated };
        });
      },
      deleteExpense: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
        supabase.from('expenses').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar despesa no Supabase:', error);
        });
      },

      addSocio: (data) => {
        const newSocio: Socio = { ...data, id: uid() };
        set((s) => ({ socios: [...s.socios, newSocio] }));
        supabase.from('socios').insert(toDbSocio(newSocio)).then(({ error }) => {
          if (error) console.error('Erro ao adicionar socio no Supabase:', error);
        });
      },
      updateSocio: (id, patch) => {
        set((s) => {
          const updated = s.socios.map((x) => (x.id === id ? { ...x, ...patch } : x));
          const target = updated.find((x) => x.id === id);
          if (target) {
            supabase.from('socios').update(toDbSocio(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar socio no Supabase:', error);
            });
          }
          return { socios: updated };
        });
      },
      deleteSocio: (id) => {
        set((s) => ({ socios: s.socios.filter((x) => x.id !== id) }));
        supabase.from('socios').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar socio no Supabase:', error);
        });
      },

      addMembro: (data) => {
        const newMembro: TimeMember = { ...data, id: uid() };
        set((s) => ({ time: [...s.time, newMembro] }));
        supabase.from('time_members').insert(toDbMembro(newMembro)).then(({ error }) => {
          if (error) console.error('Erro ao adicionar membro no Supabase:', error);
        });
      },
      updateMembro: (id, patch) => {
        set((s) => {
          const updated = s.time.map((m) => (m.id === id ? { ...m, ...patch } : m));
          const target = updated.find((m) => m.id === id);
          if (target) {
            supabase.from('time_members').update(toDbMembro(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar membro no Supabase:', error);
            });
          }
          return { time: updated };
        });
      },
      deleteMembro: (id) => {
        set((s) => ({ time: s.time.filter((m) => m.id !== id) }));
        supabase.from('time_members').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar membro no Supabase:', error);
        });
      },

      addUser: (data) => {
        const newUser: User = { ...data, id: uid() };
        set((s) => ({ users: [...s.users, newUser] }));
        supabase.from('users').insert(toDbUser(newUser)).then(({ error }) => {
          if (error) console.error('Erro ao adicionar usuário no Supabase:', error);
        });
      },
      updateUser: (id, patch) => {
        set((s) => {
          const updated = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
          const target = updated.find((u) => u.id === id);
          if (target) {
            supabase.from('users').update(toDbUser(target)).eq('id', id).then(({ error }) => {
              if (error) console.error('Erro ao atualizar usuário no Supabase:', error);
            });
          }
          return { users: updated };
        });
      },
      deleteUser: (id) => {
        set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
        supabase.from('users').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao deletar usuário no Supabase:', error);
        });
      },

      updateSettings: (patch) => {
        set((s) => {
          const updated = { ...s.settings, ...patch };
          supabase.from('settings').upsert(toDbSettings(updated)).then(({ error }) => {
            if (error) console.error('Erro ao atualizar configurações no Supabase:', error);
          });
          return { settings: updated };
        });
      },
    }),
    {
      name: STORE_KEY,
      partialize: (s): PersistedData => ({
        attendance: s.attendance, expenses: s.expenses, socios: s.socios,
        time: s.time, products: s.products, users: s.users, settings: s.settings,
      }),
    },
  ),
);
