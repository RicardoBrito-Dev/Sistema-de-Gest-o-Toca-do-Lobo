export type Period = 'day' | 'week' | 'month';

export type Patente =
  | 'Soldado' | 'Cabo' | 'Sargento' | 'Tenente'
  | 'Capitão' | 'Major' | 'Coronel' | 'General';

export type ExpenseCategory =
  | 'Manutenção' | 'Combustível' | 'Equipamentos'
  | 'Alimentação' | 'Marketing' | 'Aluguel' | 'Outros';

export interface AttendanceRecord {
  id: string;
  name: string;
  date: string;          // 'YYYY-MM-DD'
  hasWeapon: boolean;
  magazines: number;
  drinks: number;
  isTeam: boolean;
  paid?: boolean;
  paidAt?: number;       // epoch ms
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
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
  teamDrinkPrice: number;
  username: string;
  password: string;
}

export interface PersistedData {
  attendance: AttendanceRecord[];
  expenses: Expense[];
  socios: Socio[];
  time: TimeMember[];
  settings: Settings;
}
