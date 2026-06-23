import { useLocation } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { useStore } from '../store/useStore';

export function Header({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation();
  const username = useStore((s) => s.settings.username);
  const title = ROUTES.find((r) => r.path === pathname)?.title ?? 'Dashboard';
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 id="page-title">{title}</h1>
        <span className="page-date">{dateStr}</span>
      </div>
      <div className="header-right">
        <span className="user-badge">👤 {username}</span>
        <button className="mobile-logout-btn" aria-label="Sair" onClick={onLogout}>🚪</button>
      </div>
    </header>
  );
}
