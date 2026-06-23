import { NavLink } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { ROUTE_ICONS } from './navIcons';

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-line bg-surface p-2 md:hidden">
      {ROUTES.map((r) => {
        const Icon = ROUTE_ICONS[r.tab];
        const label = r.label === 'Configurações' ? 'Config.' : r.label;
        return (
          <NavLink key={r.path} to={r.path} end={r.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'bg-secondary/10 text-secondary' : 'text-surface-muted'
              }`}>
            {Icon && <Icon size={18} />}
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
