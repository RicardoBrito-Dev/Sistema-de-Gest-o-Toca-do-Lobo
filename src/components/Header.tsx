import { useLocation } from 'react-router-dom';
import { LogOut, Moon, PanelLeft, Sun } from 'lucide-react';
import { ROUTES } from '../lib/constants';
import { useTheme } from '../hooks/useTheme';
import type { AuthUser } from '../types';

export function Header({ onLogout, onToggleSidebar, currentUser }: {
  onLogout: () => void;
  onToggleSidebar: () => void;
  currentUser: AuthUser | null;
}) {
  const { pathname } = useLocation();
  const displayName = currentUser?.name?.trim() || currentUser?.username || '';
  const { theme, toggle } = useTheme();
  const title = ROUTES.find((r) => r.path === pathname)?.title ?? 'Dashboard';
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-surface/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button onClick={onToggleSidebar} aria-label="Expandir ou recolher menu"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-surface-muted transition-colors hover:bg-canvas hover:text-surface-fg md:flex">
          <PanelLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-highlight text-lg font-bold text-surface-fg md:text-xl">{title}</h1>
          <p className="truncate text-xs capitalize text-surface-muted">{dateStr}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={toggle} aria-label="Alternar tema"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-surface-fg transition-colors hover:bg-canvas">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary sm:inline-flex">
          {displayName}
          {currentUser && (
            <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {currentUser.role === 'admin' ? 'Admin' : 'Operador'}
            </span>
          )}
        </span>
        <button onClick={onLogout} aria-label="Sair"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-negative transition-colors hover:bg-negative-50 md:hidden">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
