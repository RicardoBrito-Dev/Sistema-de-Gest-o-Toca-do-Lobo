import { NavLink } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { ROUTE_ICONS } from './navIcons';

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const routes = ROUTES.filter((r) => isAdmin || r.path !== '/configuracoes');
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 bg-gradient-to-b from-brand-olive to-[#13150E] p-2 text-brand-cream shadow-[0_-2px_20px_rgba(0,0,0,0.4)] md:hidden">
      {routes.map((r) => {
        const Icon = ROUTE_ICONS[r.tab];
        const label = r.label === 'Configurações' ? 'Config.' : r.label;
        return (
          <NavLink key={r.path} to={r.path} end={r.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-brand-cream/60'
              }`}>
            {Icon && <Icon size={18} />}
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
