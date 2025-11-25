import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ pageTitle = 'Dashboard', onMenuClick }) => {
  const { user, logout } = useAuth();
  const displayName = user?.display_name || user?.username || 'User';
  const email = user?.email || '';
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="dashboard-header">
      <div className="header-top">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="header-left">
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
