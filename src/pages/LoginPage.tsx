// src/pages/LoginPage.tsx
import { useState, type FormEvent } from 'react';
import axios from '../axiosConfig';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const response = await axios.post('/admin/login', { email: email.trim().toLowerCase(), password });
      const { token } = response.data;
      if (!token) throw new Error('The server did not return an admin session.');
      localStorage.setItem('authToken', token);

      const state = location.state as { from?: { pathname?: string } } | null;
      const requestedPath = state?.from?.pathname;
      const safeDestination = requestedPath && requestedPath !== '/admin/login'
        ? requestedPath
        : '/admin/dashboard';
      navigate(safeDestination, { replace: true });
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      <div 
        className="p-5 rounded-4 shadow-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Logo + Title */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 p-4" 
               style={{ background: "rgba(0, 212, 255, 0.2)", width: 90, height: 90 }}>
            <span className="text-cyan fs-1 fw-bold">FHC</span>
          </div>
          <h2 className="text-gradient fw-bold">Admin Portal</h2>
          <p className="text-white opacity-70 mt-2">Secure Access Only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="text-white opacity-90 fw-medium">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="form-control mt-2"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: "12px",
              }}
              placeholder="admin@fisathackclub.in"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-white opacity-90 fw-medium">Password</label>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="form-control mt-2"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: "12px",
              }}
              required
            />
            <button
              type="button"
              className="btn btn-link text-white-50 p-0 mt-2 d-flex align-items-center gap-2"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 mt-4 py-3 fw-bold text-white rounded-pill"
            style={{
              background: "linear-gradient(90deg, #00d4ff, #ff6bcb)",
              boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)",
              border: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            {loading ? (
              <>
                <Loader2 className="spin me-2" size={20} />
                Logging in...
              </>
            ) : (
              "Enter Portal"
            )}
          </button>
        </form>

        {/* Message */}
        {msg && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-3 text-center fw-medium bg-danger bg-opacity-20 text-danger border border-danger"
            style={{ borderRadius: "12px" }}
          >
            {msg}
          </div>
        )}

        <div className="text-center mt-4">
          <small className="text-white opacity-50">
            © 2025 FHC Tech Club • All Systems Secured
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
