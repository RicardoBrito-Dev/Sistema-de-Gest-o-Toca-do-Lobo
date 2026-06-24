import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSidebar } from './hooks/useSidebar';
import { useStore } from './store/useStore';
import { ToastProvider } from './components/ToastProvider';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Header } from './components/Header';
import { Button } from '@/components/ui/button';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { ComandasPage } from './features/comandas/ComandasPage';
import { FinanceiroPage } from './features/financeiro/FinanceiroPage';
import { SociosPage } from './features/socios/SociosPage';
import { TimePage } from './features/time/TimePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { HelpPage } from './features/help/HelpPage';
import { PublicComandaPage } from './features/comanda-public/PublicComandaPage';

function DbLoadingPage({ error, onRetry, onOffline }: { error: string | null; onRetry: () => void; onOffline: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 font-body">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 text-center shadow-xl">
        <img src="/logo.jpg" alt="Toca do Lobo" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-md" />
        <h1 className="font-highlight text-2xl font-bold tracking-tight text-surface-fg">TOCA DO LOBO</h1>
        <p className="mt-1 text-sm text-surface-muted">Clube de Airsoft</p>

        {error ? (
          <div className="mt-6">
            <p className="mb-4 text-sm font-medium text-negative">⚠️ Erro de conexão: {error}</p>
            <Button className="w-full" onClick={onRetry}>Tentar novamente</Button>
            <button onClick={onOffline}
              className="mt-2 w-full rounded-3xl border border-line px-5 py-3 text-sm font-medium text-surface-muted transition-colors hover:bg-canvas">
              Modo offline (usar cache local)
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-l-secondary" />
            <p className="text-sm text-surface-muted">Conectando ao banco de dados…</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthedApp() {
  const dbStatus = useStore((s) => s.dbStatus);
  const dbError = useStore((s) => s.dbError);
  const initDb = useStore((s) => s.initDb);
  const { authed, login, logout } = useAuth();
  const { expanded, toggle: toggleSidebar } = useSidebar();

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
      <div className="min-h-dvh bg-canvas font-body text-surface-fg">
        <Sidebar onLogout={logout} expanded={expanded} />
        <div className={`flex min-h-dvh flex-col transition-[padding] duration-200 ${expanded ? 'md:pl-60' : 'md:pl-16'}`}>
          <Header onLogout={logout} onToggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
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
        <MobileNav />
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/comanda/:id" element={<PublicComandaPage />} />
        <Route path="/*" element={<AuthedApp />} />
      </Routes>
    </BrowserRouter>
  );
}
