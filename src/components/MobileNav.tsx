import { NavLink } from 'react-router-dom';
import { ROUTES, type NavRoute } from '../lib/constants';

export function MobileNav() {
  const main = ROUTES.slice(0, 4);
  const secondary = ROUTES.slice(4);
  const item = (r: NavRoute) => (
    <NavLink key={r.path} to={r.path} end={r.path === '/'}
      className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
      <span className="mn-icon">{r.icon}</span>
      <span>{r.label === 'Configurações' ? 'Config.' : r.label}</span>
    </NavLink>
  );
  return (
    <nav className="mobile-nav" aria-label="Navegação principal">
      <div className="mobile-nav-row">{main.map(item)}</div>
      <div className="mobile-nav-divider" />
      <div className="mobile-nav-row">{secondary.map(item)}</div>
    </nav>
  );
}
