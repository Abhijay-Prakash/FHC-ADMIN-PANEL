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


function App() {
  return (
    <div className="d-flex">
      {/* Sidebar (always rendered) */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex-grow-1 p-3 "
        style={{ marginLeft: '75px', width: '100%' }}
      >
        <Routes>
      
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/byte" element={<ByteDashboard/>} />
          <Route path="/admin/byte-register" element={<ByteParticipants />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/events/registrations/:eventId" element={<ViewRegistrationsPage />} />
          <Route path="/admin/members" element={<MembersPage />} />
          <Route path="/admin/profile" element={<MemberDetailPage />} />
          

          

        </Routes>
      </div>
    </div>
  );
}

export default App;
