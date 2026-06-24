import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ROUTES } from '../lib/constants';
import { ROUTE_ICONS } from './navIcons';

export function Sidebar({ onLogout, expanded }: { onLogout: () => void; expanded: boolean }) {
  const width = expanded ? 'w-60' : 'w-16 hover:w-60';
  // Quando fixa aberta, labels sempre visíveis; quando rail, aparecem no hover.
  const label = expanded
    ? 'whitespace-nowrap'
    : 'whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100';

  return (
    <aside className={`group fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-gradient-to-b from-brand-olive to-[#13150E] text-brand-cream shadow-[2px_0_20px_rgba(0,0,0,0.45)] transition-[width] duration-200 ease-out md:flex ${width}`}>
      <div className="flex h-16 items-center">
        <div className="grid w-16 shrink-0 place-items-center">
          <img src="/logo.jpg" alt="Toca do Lobo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
        </div>
        <div className={label}>
          <p className="font-highlight text-sm font-bold leading-tight">TOCA DO LOBO</p>
          <p className="text-[11px] font-medium text-brand-gold">Clube de Airsoft</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 py-2">
        {ROUTES.map((r) => {
          const Icon = ROUTE_ICONS[r.tab];
          return (
            <NavLink key={r.path} to={r.path} end={r.path === '/'}
              className={({ isActive }) =>
                `relative flex h-11 items-center font-highlight text-sm font-medium transition-colors ${
                  isActive ? 'text-brand' : 'text-brand-cream/70 hover:text-brand-gold'
                }`}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand" />}
                  <span className="grid w-16 shrink-0 place-items-center">{Icon && <Icon size={20} />}</span>
                  <span className={label}>{r.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="py-3">
        <button onClick={onLogout}
          className="flex h-11 w-full items-center text-brand-cream/70 transition-colors hover:text-brand">
          <span className="grid w-16 shrink-0 place-items-center"><LogOut size={20} /></span>
          <span className={label}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
