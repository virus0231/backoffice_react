import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeMenu, onMenuChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { id: 'users', label: 'Users', icon: 'users', badge: '12' },
    { id: 'permissions', label: 'Permissions', icon: 'shield', badge: null },
    { id: 'donors', label: 'Donors', icon: 'heart', badge: '45' },
    { id: 'donation', label: 'Donation', icon: 'gift', badge: 'New' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar', hasSubmenu: true, submenu: [
      { id: 'schedule', label: 'Schedule' }
    ]},
    { id: 'configuration', label: 'Configuration', icon: 'settings', badge: null },
    { id: 'reports', label: 'Reports', icon: 'file-text', hasSubmenu: true, submenu: [
      { id: 'donations-report', label: 'Donation Report' },
      { id: 'fund-report', label: 'Fund Report' },
      { id: 'campaign-report', label: 'Campaign Report' },
      { id: 'monthly-report', label: 'Monthly Report' },
      { id: 'donor-report', label: 'Donor Report' }
    ]},
    { id: 'causes', label: 'Causes', icon: 'folder', hasSubmenu: true, submenu: [
      { id: 'appeal', label: 'Appeal' },
      { id: 'amount', label: 'Amount' },
      { id: 'fund-list', label: 'Fund List' },
      { id: 'featured-amount', label: 'Featured Amount' },
      { id: 'fund-amount', label: 'Fund-Amount' },
      { id: 'category', label: 'Category' },
      { id: 'country', label: 'Country' }
    ]}
  ];

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else {
      onMenuChange(item.id);
    }
  };

  const handleSubmenuClick = (submenuId) => {
    onMenuChange(submenuId);
  };

  const getIcon = (iconName) => {
    const icons = {
      dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
      users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
      shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
      heart: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
      gift: <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>,
      calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
      settings: <><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m6.36 6.36l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m6.36-6.36l4.24-4.24" /></>,
      'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
      folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
    };
    return icons[iconName];
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="logo-icon">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill="url(#gradient)" stroke="none"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#f472b6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <span className="logo-forgotten-sidebar">FORGOTTEN</span>
              <span className="logo-women-sidebar">WOMEN</span>
            </div>
          )}
        </div>
        <button className="menu-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div
              className={`nav-item ${openSubmenu === item.id || activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <div className="nav-item-content">
                <div className="nav-icon-wrapper">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {getIcon(item.icon)}
                  </svg>
                </div>
                {!isCollapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-badge ${item.badge === 'New' ? 'badge-new' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.hasSubmenu && (
                      <svg
                        className={`submenu-icon ${openSubmenu === item.id ? 'open' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </>
                )}
              </div>
              {!item.hasSubmenu && activeMenu === item.id && <div className="active-indicator"></div>}
            </div>

            {/* Submenu Items */}
            {item.hasSubmenu && openSubmenu === item.id && !isCollapsed && (
              <div className="submenu">
                {item.submenu.map((subitem) => (
                  <div
                    key={subitem.id}
                    className={`submenu-item ${activeMenu === subitem.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmenuClick(subitem.id);
                    }}
                  >
                    <span className="submenu-dot"></span>
                    <span className="submenu-label">{subitem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
