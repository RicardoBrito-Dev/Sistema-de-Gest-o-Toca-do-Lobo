import { NavLink } from 'react-router-dom';
import { ROUTES } from '../lib/constants';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <img src="/logo.jpg" alt="Logo" className="sidebar-logo-img" />
        <div className="sidebar-title"><h2>TOCA DO LOBO</h2><small>Airsoft</small></div>
      </div>
      <nav className="sidebar-nav">
        {ROUTES.map((r) => (
          <NavLink key={r.path} to={r.path} end={r.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">{r.icon}</span><span className="nav-label">{r.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={onLogout}>🚪 <span>Sair</span></button>
      </div>
    </aside>
  );
}
