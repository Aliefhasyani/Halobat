 import React, { useState, useEffect } from 'react';
import { userAPI, roleAPI } from '../../../services/api';
import './Users.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    id: null,
    full_name: '',
    username: '',
    email: '',
    password: '',
    role_id: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      
      if (response.data.success) {
        let fetchedUsers = response.data.data || [];
        
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

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getAll();
      
      if (response.data.success) {
        const fetchedRoles = response.data.data || [];
        setRoles(fetchedRoles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_id: parseInt(formData.role_id),
      };
      
      if (editMode && formData.id) {
        await userAPI.update(formData.id, payload);
        alert('✅ User updated successfully!');
      } else {
        await userAPI.create(payload);
        alert('✅ User created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(error.response?.data?.message || '❌ Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id.toString(),
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Are you sure you want to delete this user?\n\nThis action cannot be undone.')) {
      try {
        await userAPI.delete(id);
        setUsers(users.filter(user => user.id !== id));
        alert('✅ User deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('❌ Failed to delete user');
      }
    }
  };

  const handleView = (user) => {
    setFormData({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id.toString(),
    });
    setEditMode(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      full_name: '',
      username: '',
      email: '',
      password: '',
      role_id: '',
    });
    setEditMode(false);
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(true);
    setShowModal(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      'SUPER ADMIN': 'badge-super-admin',
      'ADMIN': 'badge-admin',
      'USER': 'badge-user',
    };
    return badges[role] || 'badge-user';
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
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
          <button className="btn-add" onClick={handleAddNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New User
          </button>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
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
            {roles.map(role => (
              <option key={role.role_id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
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
              <th>JOINED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>No users found</p>
                  <span>Try adjusting your search or filter</span>
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
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
                      <span className="contacdt-email">{user.email || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadge(user.role)}`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td>
                    <span className="date-text">{formatDate(user.created_at)}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {/* VIEW BUTTON - Filled Eye Icon */}
                      <button className="action-btn view" onClick={() => handleView(user)} title="View Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </button>
                      
                      {/* EDIT BUTTON - Filled Pencil Icon */}
                      <button className="action-btn edit" onClick={() => handleEdit(user)} title="Edit User">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      
                      {/* DELETE BUTTON - Filled Trash Icon */}
                      <button className="action-btn delete" onClick={() => handleDelete(user.id)} title="Delete User">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
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

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, users.length)}</strong> of <strong>{users.length}</strong> users
          </div>

          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-numbers">
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="pagination-dots">...</span>
                ) : (
                  <button
                    key={pageNum}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? (formData.id ? 'Edit User' : 'Add New User') : 'View User Details'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label>Password {editMode && formData.id ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={editMode && !formData.id}
                  disabled={!editMode}
                  placeholder="Enter password (min. 8 characters)"
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  required
                  disabled={!editMode}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {editMode && (
                  <button type="submit" className="btn-submit">
                    {formData.id ? 'Update' : 'Create'} User
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;