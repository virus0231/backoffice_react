import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const displayName = user?.display_name || user?.username || 'User';
  const email = user?.email || '';
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="dashboard-header">
      <div className="header-top">
        <div className="header-left">
          <div className="header-pill">
            <span className="pill-dot" />
            <span className="pill-text">Back Office</span>
          </div>
          <h1 className="dashboard-title">{pageTitle}</h1>
          <div className="header-crumbs">
            <span>Back Office</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{pageTitle}</span>
          </div>
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
  );
};

export default Header;
