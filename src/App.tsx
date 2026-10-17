import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ByteDashboard from './pages/ByteDashboard';
import ByteParticipants from './pages/ByteParticipants';
import EventsPage from './pages/EventsPage';
import ViewRegistrationsPage from './pages/ViewRegistrations';
import MembersPage from './pages/Members';
import AlumniPage from './pages/Alumni';
import MemberDetailPage from './pages/MemberDetail';
import CertificateSender from './pages/CertificateSender';
import SendIndividualCertificatesPage from './pages/SendIndividualCerti';
import ProjectsPage from './pages/ProjectsPage';
import { clearAdminSession, getAdminTokenPayload, hasAdminSession } from './adminSession';

function RequireAdmin() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(hasAdminSession);

  useEffect(() => {
    const payload = getAdminTokenPayload();
    if (!payload?.exp) {
      clearAdminSession();
      setAuthenticated(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      clearAdminSession();
      setAuthenticated(false);
    }, Math.max(0, payload.exp * 1000 - Date.now()));

    const syncSession = () => setAuthenticated(hasAdminSession());
    window.addEventListener('storage', syncSession);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <main className="flex-grow-1 content-area p-4 p-md-5">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLoginRoute() {
  return hasAdminSession()
    ? <Navigate to="/admin/dashboard" replace />
    : <LoginPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginRoute />} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/byte" element={<ByteDashboard />} />
        <Route path="/admin/events" element={<EventsPage />} />
        <Route path="/events/registrations/:eventId" element={<ViewRegistrationsPage />} />
        <Route path="/admin/members" element={<MembersPage />} />
        <Route path="/admin/alumni" element={<AlumniPage />} />
        <Route path="/admin/profile" element={<MemberDetailPage />} />
        <Route path="/byte-register/:courseId" element={<ByteParticipants />} />
        <Route path="/admin/certificates" element={<CertificateSender />} />
        <Route path="/certificates/individual/:eventId" element={<SendIndividualCertificatesPage />} />
        <Route path="/admin/projects" element={<ProjectsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
