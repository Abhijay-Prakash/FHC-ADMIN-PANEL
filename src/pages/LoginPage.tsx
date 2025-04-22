import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await axios.post(
        'http://localhost:5000/admin/login',
        { email, password },
        { withCredentials: true }
      );

      setMsg(res.data.message);
      setTimeout(() => navigate('/admin/dashboard'), 1000); // Navigate to admin page
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: 400, width: '100%' }}>
        <h3 className="mb-4 text-center">🔐 Admin Login</h3>
        <form onSubmit={handleAdminLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? <Loader2 className="spinner-border spinner-border-sm me-2" /> : 'Login'}
          </button>
        </form>
        {msg && (
          <div className={`alert mt-3 ${msg.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
