import {
  LayoutDashboard, ClipboardList, Wallet, ReceiptText,
  Users, Shield, Settings, HelpCircle, type LucideIcon,
} from 'lucide-react';

export const ROUTE_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  presenca: ClipboardList,
  financeiro: Wallet,
  comandas: ReceiptText,
  socios: Users,
  time: Shield,
  configuracoes: Settings,
  ajuda: HelpCircle,
};
