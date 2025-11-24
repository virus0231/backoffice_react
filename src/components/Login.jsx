import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import API from '../utils/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login request to backend
      const response = await API.post('auth.php', {
        action: 'Login',
        username_val: username,
        password_val: password
      }, { responseType: 'text' });

      if (response.includes('id and password matched')) {
        // Login successful
        login(username);
        setModalConfig({
          title: 'Success!',
          message: 'Login successful! Redirecting to dashboard...',
          type: 'success'
        });
        setModalOpen(true);
      } else {
        // Login failed
        setError('Invalid username or password');
        setModalConfig({
          title: 'Error!',
          message: 'Invalid username or password. Please try again.',
          type: 'error'
        });
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setModalConfig({
        title: 'Error!',
        message: 'An error occurred during login. Please check your credentials and try again.',
        type: 'error'
      });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="logo-container">
            <div className="logo-text">
              <span className="logo-forgotten">FORGOTTEN</span>
              <br />
              <span className="logo-women">WOMEN</span>
              <span className="logo-tagline">SAFE AID<br />FOR WOMEN BY WOMEN</span>
            </div>
          </div>

          <h1 className="login-title">Let's Get Started</h1>
          <p className="login-subtitle">Sign in to continue to Admin Panel.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                />
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="forgot-password">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <a href="#forgot">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
};

export default Login;
