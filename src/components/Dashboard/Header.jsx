import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const displayName = user?.display_name || user?.username || 'User';
  const email = user?.email || '';
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="dashboard-header">
      <div className="header-top">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="header-breadcrumbs">
            <span className="office-link">Back Office</span>
            <span className="divider">/</span>
            <span className="current-page">Dashboard</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              <span>{initial}</span>
            </div>
            <div className="user-meta">
              <span className="username">{displayName}</span>
              {email && <span className="user-email">{email}</span>}
            </div>
            <button className="logout-btn" onClick={logout} aria-label="Logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
