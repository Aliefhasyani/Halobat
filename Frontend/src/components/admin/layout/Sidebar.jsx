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
    { path: '/admin/users', icon: 'users', label: 'Users' },
    { path: '/admin/obat', icon: 'pill', label: 'Obat' },
    { path: '/admin/reports', icon: 'chart', label: 'Reports' },
    { path: '/admin/roles', icon: 'shield', label: 'Roles' },
  ];

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
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="menu-icon">
              {item.icon === 'users' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {item.icon === 'pill' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M10.5 13.5L8.5 15.5M10.5 13.5L15.5 8.5M10.5 13.5L8.5 11.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5M15.5 8.5L13.5 10.5M8.5 15.5L6.5 17.5C5.12 18.88 5.12 21.12 6.5 22.5C7.88 23.88 10.12 23.88 11.5 22.5L13.5 20.5M8.5 15.5L10.5 17.5M13.5 10.5L8.5 15.5M13.5 10.5L15.5 12.5M10.5 17.5L8.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {item.icon === 'chart' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 17V9m-5 8V5m-5 12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {item.icon === 'shield' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            {!collapsed && <span className="menu-label">{item.label}</span>}
          </NavLink>
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