import React, { useState, useEffect } from 'react';
import { roleAPI } from '../../../services/api';
import './Roles.css';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
  });

  const roleColors = ['#2e7d32', '#f57c00', '#1976d2', '#7c4dff', '#00acc1', '#e91e63', '#9c27b0'];

  useEffect(() => {
    fetchRoles();
  }, [searchTerm]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleAPI.getAll();
      console.log('Raw API response:', response); // Debug
      console.log('Response data:', response.data); // Debug
      
      if (response.data && response.data.success) {
        const fetchedRoles = response.data.data || [];
        console.log('Fetched roles before mapping:', fetchedRoles); // Debug
        
        // Map roles
        let mappedRoles = fetchedRoles.map((role, index) => {
          console.log('Mapping role:', role); // Debug each role
          
          return {
            id: role.role_id,
            role_id: role.role_id,
            name: role.name || 'Unnamed Role',
            description: role.description || 'No description provided',
            users_count: Array.isArray(role.users_with_role) ? role.users_with_role.length : 0,
            users_with_role: role.users_with_role || [],
            created_at: role.created_at,
            updated_at: role.updated_at,
            color: roleColors[index % roleColors.length],
          };
        });
        
        console.log('Mapped roles:', mappedRoles); // Debug
        
        // Apply search filter
        if (searchTerm && searchTerm.trim() !== '') {
          mappedRoles = mappedRoles.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        console.log('Final filtered roles:', mappedRoles); // Debug
        setRoles(mappedRoles);
      } else {
        console.error('Invalid response structure:', response.data);
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      console.error('Error details:', error.response?.data);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting role data:', formData);
    
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      console.log('Payload to send:', payload);

      let response;
      if (editMode && formData.id) {
        response = await roleAPI.update(formData.id, payload);
        console.log('Update response:', response.data);
        alert('Role updated successfully');
      } else {
        response = await roleAPI.create(payload);
        console.log('Create response:', response.data);
        alert('Role created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Failed to save role:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.name?.[0] ||
                      'Failed to save role';
      alert(errorMsg);
    }
  };

  const handleEdit = (role) => {
    console.log('Editing role:', role);
    
    setFormData({
      id: role.role_id,
      name: role.name,
      description: role.description || '',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const role = roles.find(r => r.role_id === id);
    
    if (role && role.users_count > 0) {
      alert(`Cannot delete role "${role.name}" because it has ${role.users_count} user(s) assigned to it.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete role "${role?.name}"?`)) {
      try {
        await roleAPI.delete(id);
        alert('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        console.error('Delete failed:', error);
        alert(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const handleView = (role) => {
    console.log('Viewing role:', role);
    setSelectedRole(role);
    setFormData({
      id: role.role_id,
      name: role.name,
      description: role.description || '',
    });
    setEditMode(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
    });
    setSelectedRole(null);
    setEditMode(false);
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(true);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch {
      return '-';
    }
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
          <button className="btn-add" onClick={handleAddNew}>
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
      </div>

      {/* Debug Info */}
      <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '12px' }}>
        <strong>Debug:</strong> Total roles loaded: {roles.length}
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
            <span>{searchTerm ? 'Try adjusting your search' : 'Click "Add New Role" to create your first role'}</span>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.role_id} className="role-card" style={{ borderTopColor: role.color }}>
              <div className="role-card-header">
                <div className="role-icon" style={{ background: `${role.color}15`, color: role.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="role-card-actions">
                  <button className="card-action-btn" onClick={() => handleEdit(role)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className="card-action-btn delete" 
                    onClick={() => handleDelete(role.role_id)} 
                    title={role.users_count > 0 ? `Cannot delete - ${role.users_count} users assigned` : 'Delete'}
                    disabled={role.users_count > 0}
                    style={{ opacity: role.users_count > 0 ? 0.5 : 1 }}
                  >
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
                </div>

                <div className="role-card-footer">
                  <span className="role-date">Created {formatDate(role.created_at)}</span>
                  <button className="btn-view-role" onClick={() => handleView(role)}>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editMode ? (formData.id ? 'Edit Role' : 'Add New Role') : 'View Role Details'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter role name (e.g., Admin, User)"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!editMode}
                  placeholder="Enter role description"
                  rows={4}
                />
              </div>

              {!editMode && selectedRole && (
                <div className="form-group">
                  <label>Assigned Users ({selectedRole.users_count})</label>
                  {selectedRole.users_with_role && selectedRole.users_with_role.length > 0 ? (
                    <div className="users-list">
                      {selectedRole.users_with_role.map(user => (
                        <div key={user.user_id} className="user-item">
                          <strong>{user.full_name}</strong> (@{user.username}) - {user.email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No users assigned to this role</p>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {editMode && (
                  <button type="submit" className="btn-submit">
                    {formData.id ? 'Update' : 'Create'} Role
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

export default RolesList;