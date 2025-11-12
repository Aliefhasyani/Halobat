import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Navbar = ({ toggleSidebar, collapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('obat')) return 'Obat Management';
    if (path.includes('users')) return 'Users Management';
    if (path.includes('reports')) return 'Reports & Analytics';
    if (path.includes('roles')) return 'Roles Management';
    return 'Admin Panel';
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="page-title-section">
          <h1 className="page-title">{getPageTitle()}</h1>
          <span className="page-breadcrumb">Admin / {getPageTitle().split(' ')[0]}</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="notification-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button 
            className="user-avatar-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            title={user?.full_name || 'Admin'}
          >
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Administrator'}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`dropdown-icon ${showDropdown ? 'open' : ''}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={() => alert('Profile - Coming soon')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Profile
              </button>
              <button className="dropdown-item" onClick={() => alert('Settings - Coming soon')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;