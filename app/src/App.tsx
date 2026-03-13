import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
