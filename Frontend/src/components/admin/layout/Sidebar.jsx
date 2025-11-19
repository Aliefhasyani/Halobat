import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Layout.css';

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', group: 'main' },
    { path: '/admin/users', icon: 'users', label: 'Users', group: 'main' },
    { path: '/admin/roles', icon: 'shield', label: 'Roles', group: 'main' },
    { path: '/admin/drugs', icon: 'pill', label: 'Drugs', group: 'pharmacy' },
    { path: '/admin/brands', icon: 'tag', label: 'Brands', group: 'pharmacy' },
    { path: '/admin/manufacturers', icon: 'factory', label: 'Manufacturers', group: 'pharmacy' },
    { path: '/admin/dosage-forms', icon: 'capsule', label: 'Dosage Forms', group: 'pharmacy' },
    { path: '/admin/active-ingredients', icon: 'molecule', label: 'Ingredients', group: 'pharmacy' },
    { path: '/admin/diagnoses', icon: 'clipboard', label: 'Diagnoses', group: 'medical' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      shield: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      pill: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 13.5L15.5 8.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      tag: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="7" r="1" fill="currentColor"/>
        </svg>
      ),
      factory: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M3 20V9l5 3V7l5 3V4l5 3v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      capsule: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      molecule: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M10.5 10.5L6.5 6.5M13.5 10.5L17.5 6.5M10.5 13.5L6.5 17.5M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      clipboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    };
    return icons[iconName] || icons['dashboard'];
  };

  const groupedMenus = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && <span className="logo-text">HaloBat</span>}
      </div>

      <nav className="sidebar-menu">
        {Object.entries(groupedMenus).map(([group, items]) => (
          <div key={group} className="menu-group">
            {!collapsed && group !== 'main' && (
              <div className="menu-group-label">{group}</div>
            )}
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `menu-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="menu-icon">{getIcon(item.icon)}</span>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="menu-item" onClick={() => alert('Help page - Coming soon')}>
          <span className="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          {!collapsed && <span className="menu-label">Help</span>}
        </button>
        
        <button className="menu-item" onClick={handleLogout}>
          <span className="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {!collapsed && <span className="menu-label">Logout</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-credit">
          <p>Developed by</p>
          <p><strong>Metadata Systems BV</strong></p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;