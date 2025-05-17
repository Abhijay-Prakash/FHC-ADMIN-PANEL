import { Routes, Route } from 'react-router-dom';
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
function App() {
  return (
    <div className="d-flex">
      {/* Sidebar (always rendered) */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex-grow-1 p-3"
        style={{
          marginLeft: "0", 
          transition: 'margin-left 0.3s ease', // Smooth transition for content shift
        }}
      >
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

        </Routes>
      </div>
    </div>
  );
}

export default App;
