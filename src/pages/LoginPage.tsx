// src/pages/LoginPage.tsx
import { useState } from 'react';
import axios from '../axiosConfig';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('authToken', token);

      setMsg('Login successful! Redirecting...');
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Invalid credentials');
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
            <label className="text-white opacity-90 fw-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label className="text-white opacity-90 fw-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mt-2"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: "12px",
              }}
              required
            />
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
            className={`mt-4 p-3 rounded-3 text-center fw-medium ${
              msg.includes('success') || msg.includes('Redirecting')
                ? 'bg-success bg-opacity-20 text-success border border-success'
                : 'bg-danger bg-opacity-20 text-danger border border-danger'
            }`}
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