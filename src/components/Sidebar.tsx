import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ROUTES } from '../lib/constants';
import { ROUTE_ICONS } from './navIcons';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-xl object-cover" />
        <div>
          <p className="font-highlight text-sm font-bold leading-tight text-surface-fg">TOCA DO LOBO</p>
          <p className="text-xs text-surface-muted">Airsoft</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ROUTES.map((r) => {
          const Icon = ROUTE_ICONS[r.tab];
          return (
            <NavLink key={r.path} to={r.path} end={r.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-secondary text-white' : 'text-surface-muted hover:bg-canvas hover:text-surface-fg'
                }`}>
              {Icon && <Icon size={18} />}
              {r.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-negative transition-colors hover:bg-negative-50">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
