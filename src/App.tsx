import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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

export default function App() {
  const { authed, login, logout } = useAuth();
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
