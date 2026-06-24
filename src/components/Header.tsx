import { useLocation } from 'react-router-dom';
import { LogOut, Moon, PanelLeft, Sun } from 'lucide-react';
import { ROUTES } from '../lib/constants';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';

export function Header({ onLogout, onToggleSidebar }: { onLogout: () => void; onToggleSidebar: () => void }) {
  const { pathname } = useLocation();
  const username = useStore((s) => s.settings.username);
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
        <span className="hidden rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary sm:inline">
          {username}
        </span>
        <button onClick={onLogout} aria-label="Sair"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-negative transition-colors hover:bg-negative-50 md:hidden">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
