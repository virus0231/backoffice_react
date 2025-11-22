import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-header">
      <div className="header-top">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="header-right">
          <span className="office-link">Back Office</span>
          <span className="divider">/</span>
          <span className="current-page">Dashboard</span>
          <div className="user-profile">
            <div className="user-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="username">superadmin</span>
            <svg className="dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
