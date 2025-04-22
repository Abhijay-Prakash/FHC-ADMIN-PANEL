import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
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
        </Routes>
      </div>
    </div>
  );
}

export default App;
