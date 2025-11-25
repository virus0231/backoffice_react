import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const { login, error: authError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const ok = await login(username, password);
    if (ok) {
      setModalConfig({
        title: 'Success!',
        message: 'Login successful! Redirecting to dashboard...',
        type: 'success'
      });
      setModalOpen(true);
    } else {
      setModalConfig({
        title: 'Error!',
        message: 'Invalid username or password. Please try again.',
        type: 'error'
      });
      setModalOpen(true);
    }
    setLoading(false);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="hero-sheen" />
        <div className="hero-content">
          <div className="hero-logo">
            <span className="hero-mark">♥</span>
          </div>
          <div>
            <p className="hero-kicker">Forgotten Women</p>
            <h1 className="hero-title">Back Office Access</h1>
            <p className="hero-subtitle">
              Secure entry to your fundraising insights and operations dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="panel-header">
          <div className="panel-brand">
            <span className="brand-mark">FW</span>
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to continue</p>
            </div>
          </div>
          <span className="panel-badge">Back Office</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-group">
            <span className="form-label">Username</span>
            <div className="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </label>

          <label className="form-group">
            <span className="form-label">Password</span>
            <div className="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </label>

          {error && <div className="error-message">{error}</div>}

          <div className="panel-actions">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="panel-footer">
          <span>Secure access • YOC</span>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default Login;
