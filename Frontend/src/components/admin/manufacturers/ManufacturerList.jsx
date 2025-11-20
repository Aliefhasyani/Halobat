import React, { useState, useEffect } from 'react';
import { manufacturerAPI } from '../../../services/api';
import './Manufacturers.css';

const ManufacturerList = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
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
      console.log('🔄 Fetching manufacturers...');
      const response = await manufacturerAPI.getAll();
      console.log('✅ Response:', response.data);
      
      if (response.data.success) {
        let fetchedManufacturers = response.data.data || [];
        
        if (searchTerm) {
          fetchedManufacturers = fetchedManufacturers.filter(manufacturer =>
            manufacturer.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        console.log('✅ Manufacturers loaded:', fetchedManufacturers.length);
        setManufacturers(fetchedManufacturers);
      }
    } catch (error) {
      console.error('❌ Failed to fetch manufacturers:', error);
      
      let errorMsg = '⚠️ Failed to load manufacturers.\n\n';
      if (error.code === 'ERR_NETWORK') {
        errorMsg += '🔌 Network Error: Cannot connect to backend.\n';
        errorMsg += '➡️ Make sure backend is running at: http://localhost:8000';
      } else {
        errorMsg += error.response?.data?.message || error.message;
      }
      alert(errorMsg);
      
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    
    if (!trimmedName) {
      alert('❌ Manufacturer name cannot be empty');
      return;
    }
    
    console.log('📤 Submitting manufacturer:', formData);
    
    try {
      const payload = { name: trimmedName };
      
      if (editMode && formData.id) {
        await manufacturerAPI.update(formData.id, payload);
        alert('✅ Manufacturer updated successfully!');
      } else {
        await manufacturerAPI.create(payload);
        alert('✅ Manufacturer created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchManufacturers();
    } catch (error) {
      console.error('❌ Failed to save manufacturer:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = '❌ Failed to save manufacturer';
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.name) {
          errorMessage = `❌ Name: ${errors.name[0]}`;
        } else if (error.response.data.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (manufacturer) => {
    console.log('✏️ Editing manufacturer:', manufacturer);
    
    setFormData({
      id: manufacturer.manufacturer_id,
      name: manufacturer.manufacturer_name,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const manufacturer = manufacturers.find(m => m.manufacturer_id === id);
    
    if (manufacturer && manufacturer.related_drugs && manufacturer.related_drugs.length > 0) {
      alert(`❌ Cannot delete manufacturer "${manufacturer.manufacturer_name}"\n\n${manufacturer.related_drugs.length} drug(s) are still using this manufacturer.`);
      return;
    }
    
    if (window.confirm(`⚠️ Are you sure you want to delete "${manufacturer?.manufacturer_name}"?\n\nThis action cannot be undone.`)) {
      try {
        await manufacturerAPI.delete(id);
        alert('✅ Manufacturer deleted successfully!');
        fetchManufacturers();
      } catch (error) {
        console.error('❌ Delete failed:', error);
        alert(error.response?.data?.message || '❌ Failed to delete manufacturer');
      }
    }
  };

  const handleView = (manufacturer) => {
    console.log('👁️ Viewing manufacturer:', manufacturer);
    setSelectedManufacturer(manufacturer);
    setFormData({
      id: manufacturer.manufacturer_id,
      name: manufacturer.manufacturer_name,
    });
    setEditMode(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ id: null, name: '' });
    setSelectedManufacturer(null);
    setEditMode(false);
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(true);
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
                  <span>{searchTerm ? 'Try adjusting your search' : 'Click "Add New Manufacturer" to create your first manufacturer'}</span>
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
                      <button 
                        className="action-btn view" 
                        onClick={() => handleView(manufacturer)} 
                        title="View"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(manufacturer)} 
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(manufacturer.manufacturer_id)} 
                        title={manufacturer.related_drugs?.length > 0 ? `Cannot delete - ${manufacturer.related_drugs.length} drugs using this` : 'Delete'}
                        disabled={manufacturer.related_drugs?.length > 0}
                        style={{ 
                          opacity: manufacturer.related_drugs?.length > 0 ? 0.5 : 1,
                          cursor: manufacturer.related_drugs?.length > 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
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
              <h3>
                {editMode ? (formData.id ? 'Edit Manufacturer' : 'Add New Manufacturer') : 'View Manufacturer Details'}
              </h3>
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
                  disabled={!editMode}
                  placeholder="Enter manufacturer name"
                />
              </div>

              {!editMode && selectedManufacturer && selectedManufacturer.related_drugs && (
                <div className="form-group">
                  <label>Related Drugs ({selectedManufacturer.related_drugs.length})</label>
                  {selectedManufacturer.related_drugs.length > 0 ? (
                    <div style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      padding: '12px' 
                    }}>
                      {selectedManufacturer.related_drugs.map(drug => (
                        <div 
                          key={drug.drug_id} 
                          style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: '14px'
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                            {drug.generic_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {drug.description || 'No description'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '600', marginTop: '4px' }}>
                            Rp {(drug.price || 0).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                      No drugs using this manufacturer
                    </p>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {editMode && (
                  <button type="submit" className="btn-submit">
                    {formData.id ? 'Update' : 'Create'} Manufacturer
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

export default ManufacturerList;