import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ROUTES } from '../lib/constants';
import { ROUTE_ICONS } from './navIcons';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-gradient-to-b from-brand-olive to-[#13150E] text-brand-cream shadow-[2px_0_30px_0_rgba(0,0,0,0.45)] md:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <img src="/logo.jpg" alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />
        <div>
          <p className="font-highlight text-sm font-bold leading-tight">TOCA DO LOBO</p>
          <p className="text-[11px] font-medium text-brand-gold">Clube de Airsoft</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-4">
        {ROUTES.map((r) => {
          const Icon = ROUTE_ICONS[r.tab];
          return (
            <NavLink key={r.path} to={r.path} end={r.path === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-highlight text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/[0.06] text-brand' : 'text-brand-cream/70 hover:bg-white/[0.04] hover:text-brand-gold'
                }`}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />}
                  {Icon && <Icon size={18} />}
                  {r.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 border-t border-white/10 py-3">
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-cream/70 transition-colors hover:bg-white/[0.04] hover:text-brand">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
