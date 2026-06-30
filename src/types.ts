export type Period = 'day' | 'week' | 'month';

export type Patente =
  | 'Soldado' | 'Cabo' | 'Sargento' | 'Tenente'
  | 'Capitão' | 'Major' | 'Coronel' | 'General';

export type ExpenseCategory =
  | 'Manutenção' | 'Combustível' | 'Equipamentos'
  | 'Alimentação' | 'Marketing' | 'Aluguel' | 'Outros';

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao';

export interface ComandaItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  date: string;          // 'YYYY-MM-DD'
  hasWeapon: boolean;
  magazines: number;
  drinks: number;
  isTeam: boolean;
  isSocio?: boolean;
  paid?: boolean;
  paidAt?: number;       // epoch ms
  paymentMethod?: PaymentMethod;
  extras?: ComandaItem[];
  cerveja?: number;
  agua?: number;
  refrigerante?: number;
  salgado?: number;
  rentedWeapon?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  /** Valor da parcela (= totalAmount / installments). É este valor que impacta o dashboard. */
  amount: number;
  /** Número de parcelas (padrão 1 = sem parcelamento). */
  installments?: number;
  /** Valor total original antes do parcelamento. Apenas informativo. */
  totalAmount?: number;
}

export interface Socio {
  id: string;
  name: string;
  monthlyFee: number;
  joinDate: string;
  phone?: string;
  notes?: string;
}

export interface TimeMember {
  id: string;
  name: string;
  nickname?: string;
  patente: Patente;
  weapon?: string;
  joinDate: string;
  phone?: string;
  notes?: string;
}

export interface Settings {
  weaponRental: number;
  fieldFeeOwn: number;
  magazinePrice: number;
  drinkPrice: number;
  /** @deprecated Derivado de drinkPrice + teamDiscountPercent; mantido por compatibilidade com o banco. */
  teamDrinkPrice: number;
  teamDiscountPercent: number;
  socioDiscountPercent: number;
  username: string;
  password: string;
  pixKey?: string;
  pixCity?: string;
}

export type UserRole = 'admin' | 'operador';

export interface User {
  id: string;
  username: string;
  password: string;
  name?: string;
  role: UserRole;
  active: boolean;
}

/** Identidade do usuário logado, guardada na sessão (sem a senha). */
export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  role: UserRole;
}

export interface PersistedData {
  attendance: AttendanceRecord[];
  expenses: Expense[];
  socios: Socio[];
  time: TimeMember[];
  products: Product[];
  users: User[];
  settings: Settings;
}
