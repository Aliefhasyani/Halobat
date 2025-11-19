  import React, { useState, useEffect } from 'react';
  import { userAPI } from '../../../services/api';
  import './Users.css';

  const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(3);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const response = await userAPI.getAll();
          
          if (response.data.success) {
            let fetchedUsers = response.data.data || [];
            
            // Apply filters
            if (searchTerm) {
              fetchedUsers = fetchedUsers.filter(user =>
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            
            if (filterRole !== 'all') {
              fetchedUsers = fetchedUsers.filter(user => user.role === filterRole);
            }
            
            setUsers(fetchedUsers);
          }
        } catch (error) {
          console.error('Failed to fetch users:', error);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, [currentPage, searchTerm, filterRole]);

    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          await userAPI.delete(id);
          setUsers(users.filter(user => user.id !== id));
          alert('User deleted successfully');
        } catch (error) {
          console.error('Delete failed:', error);
          alert('Failed to delete user');
        }
      }
    };

    const handleEdit = (id) => {
      alert(`Edit user ID: ${id} - Coming soon`);
    };

    const handleView = (id) => {
      alert(`View user ID: ${id} - Coming soon`);
    };

    const getRoleBadge = (role) => {
      const badges = {
        'SUPER ADMIN': 'badge-super-admin',
        'ADMIN': 'badge-admin',
        'USER': 'badge-user',
      };
      return badges[role] || 'badge-user';
    };

    const getStatusBadge = (status) => {
      return status === 'active' ? 'status-active' : 'status-inactive';
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
          <p>Loading users...</p>
        </div>
      );
    }

    return (
      <div className="admin-page">
        <div className="page-header">
          <div className="header-left">
            <h2 className="table-title">Users Management</h2>
            <p className="table-subtitle">Manage and monitor all system users</p>
          </div>
          
          <div className="header-right">
            <button className="btn-add">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New User
            </button>
            
            <button className="btn-export">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export
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
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="filter-select" 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="SUPER ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>

            <button className="btn-filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              More Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="checkbox" />
                </th>
                <th>USER</th>
                <th>CONTACT</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>JOINED DATE</th>
                <th>IN CHARGE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p>No users found</p>
                    <span>Try adjusting your search or filter</span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input type="checkbox" className="checkbox" />
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.full_name || '-'}</span>
                          <span className="user-username">@{user.username || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-email">{user.email || '-'}</span>
                        <span className="contact-phone">{user.phone || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadge(user.role)}`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(user.status)}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(user.created_at)}</span>
                    </td>
                    <td>
                      <span className="in-charge-text">{user.in_charge || '-'}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => handleView(user.id)} title="View">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button className="action-btn edit" onClick={() => handleEdit(user.id)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(user.id)} title="Delete">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Showing <strong>{users.length}</strong> of <strong>150</strong> users
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
              {[1, 2, 3, 4, 5].map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              <span className="pagination-dots">...</span>
              <button className="page-number" onClick={() => setCurrentPage(15)}>
                15
              </button>
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

  export default UserList;