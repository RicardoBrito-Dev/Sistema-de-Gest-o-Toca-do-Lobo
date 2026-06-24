import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useStore } from './store/useStore';
import { ToastProvider } from './components/ToastProvider';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Header } from './components/Header';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { ComandasPage } from './features/comandas/ComandasPage';
import { FinanceiroPage } from './features/financeiro/FinanceiroPage';
import { SociosPage } from './features/socios/SociosPage';
import { TimePage } from './features/time/TimePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { HelpPage } from './features/help/HelpPage';

function DbLoadingPage({ error, onRetry, onOffline }: { error: string | null; onRetry: () => void; onOffline: () => void }) {
  return (
    <div id="login-page" className="page">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .db-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: var(--primary, #c8963e);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }
      `}</style>
      <div className="login-bg">
        <div className="login-container">
          <div className="login-logo">
            <img src="/logo.jpg" alt="Toca do Lobo Logo" className="logo-img-login" />
            <h1>TOCA DO LOBO</h1>
            <p>Gerenciamento Tático de Airsoft</p>
          </div>
          {error ? (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ Erro de conexão: {error}</p>
              <button onClick={onRetry} className="btn-login" style={{ marginBottom: '0.5rem' }}>
                TENTAR NOVAMENTE
              </button>
              <button 
                onClick={onOffline} 
                className="btn-login" 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  color: '#ccc',
                  marginTop: '0.5rem'
                }}
              >
                MODO OFFLINE (USAR CACHE LOCAL)
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="db-spinner" />
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Conectando ao banco de dados Supabase...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const dbStatus = useStore((s) => s.dbStatus);
  const dbError = useStore((s) => s.dbError);
  const initDb = useStore((s) => s.initDb);
  const { authed, login, logout } = useAuth();

  useEffect(() => {
    initDb();
  }, [initDb]);

  if (dbStatus === 'loading' || dbStatus === 'idle') {
    return <DbLoadingPage error={null} onRetry={initDb} onOffline={() => useStore.setState({ dbStatus: 'success' })} />;
  }

  if (dbStatus === 'error') {
    return <DbLoadingPage error={dbError} onRetry={initDb} onOffline={() => useStore.setState({ dbStatus: 'success' })} />;
  }

  if (!authed) return <LoginPage onLogin={login} />;

  return (
    <ToastProvider>
      <BrowserRouter>
        <div id="app-page" className="page">
          <Sidebar onLogout={logout} />
          <MobileNav />
          <main className="main-content">
            <Header onLogout={logout} />
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/presenca" element={<AttendancePage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/comandas" element={<ComandasPage />} />
              <Route path="/socios" element={<SociosPage />} />
              <Route path="/time" element={<TimePage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/ajuda" element={<HelpPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
