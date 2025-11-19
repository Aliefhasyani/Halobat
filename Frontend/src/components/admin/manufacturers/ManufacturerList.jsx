import React, { useState, useEffect } from 'react';
import { manufacturerAPI } from '../../../services/api';
import './Manufacturers.css';

const ManufacturerList = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
  });

  useEffect(() => {
    fetchManufacturers();
  }, [searchTerm]);

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const response = await manufacturerAPI.getAll();
      if (response.data.success) {
        let fetchedManufacturers = response.data.data || [];
        
        if (searchTerm) {
          fetchedManufacturers = fetchedManufacturers.filter(manufacturer =>
            manufacturer.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setManufacturers(fetchedManufacturers);
      }
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await manufacturerAPI.update(formData.id, { name: formData.name });
        alert('Manufacturer updated successfully');
      } else {
        await manufacturerAPI.create({ name: formData.name });
        alert('Manufacturer created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchManufacturers();
    } catch (error) {
      console.error('Failed to save manufacturer:', error);
      alert('Failed to save manufacturer');
    }
  };

  const handleEdit = (manufacturer) => {
    setFormData({
      id: manufacturer.manufacturer_id,
      name: manufacturer.manufacturer_name,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this manufacturer?')) {
      try {
        await manufacturerAPI.delete(id);
        alert('Manufacturer deleted successfully');
        fetchManufacturers();
      } catch (error) {
        console.error('Failed to delete manufacturer:', error);
        alert('Failed to delete manufacturer');
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '' });
    setEditMode(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading manufacturers...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Manufacturers Management</h2>
          <p className="table-subtitle">Manage pharmaceutical manufacturers</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add" onClick={handleAddNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Manufacturer
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
            placeholder="Search manufacturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>MANUFACTURER NAME</th>
              <th>TOTAL DRUGS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>No manufacturers found</p>
                  <span>Try adjusting your search</span>
                </td>
              </tr>
            ) : (
              manufacturers.map((manufacturer) => (
                <tr key={manufacturer.manufacturer_id}>
                  <td>
                    <span className="manufacturer-name">{manufacturer.manufacturer_name}</span>
                  </td>
                  <td>
                    <span className="drug-count">{manufacturer.related_drugs?.length || 0} drugs</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEdit(manufacturer)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(manufacturer.manufacturer_id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Manufacturer' : 'Add New Manufacturer'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Manufacturer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update' : 'Create'} Manufacturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturerList;