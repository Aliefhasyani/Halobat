import React, { useState, useEffect } from 'react';
import { roleAPI } from '../../../services/api';
import './Roles.css';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const mockRoles = [
      {
        id: 1,
        created_at: '2024-01-01',
        name: 'Super Admin',
        description: 'Full system access with all permissions including user management, system settings, and data management',
        users_count: 2,
        permissions_count: 50,
        color: '#2e7d32'
      },
      {
        id: 2,
        created_at: '2024-01-01',
        name: 'Admin',
        description: 'Administrative access with limited permissions for managing users and content',
        users_count: 5,
        permissions_count: 30,
        color: '#f57c00'
      },
      {
        id: 3,
        created_at: '2024-01-01',
        name: 'User',
        description: 'Basic user access for viewing and interacting with allowed content',
        users_count: 120,
        permissions_count: 10,
        color: '#1976d2'
      },
      {
        id: 4,
        created_at: '2024-03-15',
        name: 'Doctor',
        description: 'Medical professional access for patient management and medical records',
        users_count: 15,
        permissions_count: 25,
        color: '#7c4dff'
      },
      {
        id: 5,
        created_at: '2024-05-20',
        name: 'Pharmacist',
        description: 'Pharmacy staff access for medicine inventory and prescription management',
        users_count: 8,
        permissions_count: 18,
        color: '#00acc1'
      },
    ];
    
    console.log('Bypass: Loading mock roles data');
    
    let filteredRoles = mockRoles;
    
    if (searchTerm) {
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setRoles(filteredRoles);
    setLoading(false);
  }, [currentPage, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      alert('Bypass Mode: Delete functionality disabled');
    }
  };

  const handleEdit = (id) => {
    alert(`Edit role ID: ${id} - Coming soon`);
  };

  const handleView = (id) => {
    alert(`View role ID: ${id} - Coming soon`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading roles...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Roles Management</h2>
          <p className="table-subtitle">Manage user roles and permissions</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Role
          </button>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button className="btn-filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filters
          </button>
        </div>
      </div>

      <div className="roles-grid">
        {roles.length === 0 ? (
          <div className="empty-state-grid">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>No roles found</p>
            <span>Try adjusting your search</span>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="role-card" style={{ borderTopColor: role.color }}>
              <div className="role-card-header">
                <div className="role-icon" style={{ background: `${role.color}15`, color: role.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="role-card-actions">
                  <button className="card-action-btn" onClick={() => handleEdit(role.id)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="card-action-btn delete" onClick={() => handleDelete(role.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="role-card-body">
                <h3 className="role-name" style={{ color: role.color }}>{role.name}</h3>
                <p className="role-description">{role.description}</p>

                <div className="role-stats">
                  <div className="role-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="stat-value">{role.users_count}</span>
                    <span className="stat-label">Users</span>
                  </div>
                  <div className="role-stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="stat-value">{role.permissions_count}</span>
                    <span className="stat-label">Permissions</span>
                  </div>
                </div>

                <div className="role-card-footer">
                  <span className="role-date">Created {formatDate(role.created_at)}</span>
                  <button className="btn-view-role" onClick={() => handleView(role.id)}>
                    View Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <div className="pagination-info">
          Showing <strong>{roles.length}</strong> roles
        </div>

        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Previous
          </button>
          
          <div className="pagination-numbers">
            {[1, 2, 3].map((pageNum) => (
              <button
                key={pageNum}
                className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesList;