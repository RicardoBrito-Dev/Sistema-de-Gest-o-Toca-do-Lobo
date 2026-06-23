import type { Settings, Patente, ExpenseCategory } from '../types';

export const STORE_KEY = 'tdl_store';

export const LEGACY_KEYS = {
  attendance: 'tdl_attendance',
  expenses: 'tdl_expenses',
  socios: 'tdl_socios',
  time: 'tdl_time',
  settings: 'tdl_settings',
} as const;

export const DEFAULTS: Settings = {
  weaponRental: 40,
  fieldFeeOwn: 10,
  magazinePrice: 15,
  drinkPrice: 5,
  teamDrinkPrice: 3,
  username: 'admin',
  password: 'toca2026',
};

export const PATENTE_ORDER: Patente[] = [
  'Soldado', 'Cabo', 'Sargento', 'Tenente', 'Capitão', 'Major', 'Coronel', 'General',
];

export const PATENTE_INFO: Record<Patente, { icon: string; cls: string }> = {
  Soldado: { icon: '🟢', cls: 'patente-soldado' },
  Cabo: { icon: '🔵', cls: 'patente-cabo' },
  Sargento: { icon: '🟡', cls: 'patente-sargento' },
  Tenente: { icon: '🟠', cls: 'patente-tenente' },
  Capitão: { icon: '🔴', cls: 'patente-capitao' },
  Major: { icon: '⭐', cls: 'patente-major' },
  Coronel: { icon: '⭐⭐', cls: 'patente-coronel' },
  General: { icon: '⭐⭐⭐', cls: 'patente-general' },
};

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'Manutenção', label: '🔧 Manutenção' },
  { value: 'Combustível', label: '⛽ Combustível' },
  { value: 'Equipamentos', label: '🎽 Equipamentos' },
  { value: 'Alimentação', label: '🍔 Alimentação' },
  { value: 'Marketing', label: '📢 Marketing' },
  { value: 'Aluguel', label: '📄 Aluguel' },
  { value: 'Outros', label: '📦 Outros' },
];

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export interface NavRoute { path: string; tab: string; icon: string; label: string; title: string; }

export const ROUTES: NavRoute[] = [
  { path: '/',              tab: 'dashboard',     icon: '📊', label: 'Dashboard',     title: 'Dashboard' },
  { path: '/presenca',      tab: 'presenca',      icon: '📋', label: 'Presenças',     title: 'Registro de Presenças' },
  { path: '/financeiro',    tab: 'financeiro',    icon: '💰', label: 'Financeiro',    title: 'Financeiro' },
  { path: '/comandas',      tab: 'comandas',      icon: '📝', label: 'Comandas',      title: 'Comandas' },
  { path: '/socios',        tab: 'socios',        icon: '👥', label: 'Sócios',        title: 'Sócios' },
  { path: '/time',          tab: 'time',          icon: '🪖', label: 'Time',          title: '🪖 Nosso Time' },
  { path: '/configuracoes', tab: 'configuracoes', icon: '⚙️', label: 'Configurações', title: 'Configurações' },
];
