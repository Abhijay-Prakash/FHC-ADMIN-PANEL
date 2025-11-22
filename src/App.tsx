import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ByteDashboard from './pages/ByteDashboard';
import ByteParticipants from './pages/ByteParticipants';
import EventsPage from './pages/EventsPage';
import ViewRegistrationsPage from './pages/ViewRegistrations';
import MembersPage from './pages/Members';
import MemberDetailPage from './pages/MemberDetail';
import CertificateSender from './pages/CertificateSender';
import SendIndividualCertificatesPage from './pages/SendIndividualCerti';
import ProjectsPage from './pages/ProjectsPage'; 

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';

  return (
    <div className="d-flex min-vh-100">
      {!isLoginPage && <Sidebar />}

      <main className={!isLoginPage ? "flex-grow-1 content-area p-4 p-md-5" : "w-100"}>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/byte" element={<ByteDashboard />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/events/registrations/:eventId" element={<ViewRegistrationsPage />} />
          <Route path="/admin/members" element={<MembersPage />} />
          <Route path="/admin/profile" element={<MemberDetailPage />} />
          <Route path="/byte-register/:courseId" element={<ByteParticipants />} />
          <Route path="/admin/certificates" element={<CertificateSender />} />
          <Route path="/certificates/individual/:eventId" element={<SendIndividualCertificatesPage />} />
          
          {/* NEW ROUTE */}
          <Route path="/admin/projects" element={<ProjectsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <Layout />;
}

export default App;