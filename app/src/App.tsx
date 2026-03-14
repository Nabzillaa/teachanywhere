import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import VisitsList from './pages/visits/VisitsList';
import VisitDetail from './pages/visits/VisitDetail';
import VisitWizard from './pages/visits/VisitWizard';
import ClientsList from './pages/clients/ClientsList';
import ExpensesList from './pages/expenses/ExpensesList';
import CommunicationsList from './pages/communications/CommunicationsList';
import Reports from './pages/reports/Reports';
import AttendeesList from './pages/attendees/AttendeesList';
import LogisticsPage from './pages/logistics/LogisticsPage';
import OfficeReadinessPage from './pages/office/OfficeReadinessPage';
import SettingsPage from './pages/settings/SettingsPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="visits" element={<VisitsList />} />
          <Route path="visits/new" element={<VisitWizard />} />
          <Route path="visits/:id" element={<VisitDetail />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="attendees" element={<AttendeesList />} />
          <Route path="logistics" element={<LogisticsPage />} />
          <Route path="office-readiness" element={<OfficeReadinessPage />} />
          <Route path="communications" element={<CommunicationsList />} />
          <Route path="expenses" element={<ExpensesList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
