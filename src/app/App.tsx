import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import DashboardPage from '../pages/DashboardPage';
import ClientCardPage from '../pages/ClientCardPage';
import QualificationPage from '../pages/QualificationPage';
import DiagnosticWorkspacePage from '../pages/DiagnosticWorkspacePage';
import ClientReportPage from '../pages/ClientReportPage';
import AnalyticsPage from '../pages/AnalyticsPage';

export default function App() {
  return <AppShell><Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/clients/:id" element={<ClientCardPage />} />
    <Route path="/clients/:id/qualification" element={<QualificationPage />} />
    <Route path="/clients/:id/diagnostic" element={<DiagnosticWorkspacePage />} />
    <Route path="/clients/:id/report" element={<ClientReportPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AppShell>;
}
