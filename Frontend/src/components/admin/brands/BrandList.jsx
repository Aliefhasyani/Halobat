import React, { useState, useEffect } from 'react';
import { brandAPI, drugAPI } from '../../../services/api';
import './Brands.css';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    picture: '',
    drug_id: '',
  });

  useEffect(() => {
    fetchBrands();
    fetchDrugs();
  }, [searchTerm]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await brandAPI.getAll();
      if (response.data.success) {
        let fetchedBrands = response.data.data || [];
        
        if (searchTerm) {
          fetchedBrands = fetchedBrands.filter(brand =>
            brand.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.drug_data?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setBrands(fetchedBrands);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrugs = async () => {
    try {
      const response = await drugAPI.getAll();
      if (response.data.success) {
        setDrugs(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch drugs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await brandAPI.update(formData.id, {
          name: formData.name,
          picture: formData.picture,
          drug_id: formData.drug_id,
        });
        alert('Brand updated successfully');
      } else {
        await brandAPI.create({
          name: formData.name,
          picture: formData.picture,
          drug_id: formData.drug_id,
        });
        alert('Brand created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Failed to save brand');
    }
  };

  const handleEdit = (brand) => {
    setFormData({
      id: brand.brand_id,
      name: brand.brand_name,
      picture: brand.picture || '',
      drug_id: brand.drug_data?.drug_id || '',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await brandAPI.delete(id);
        alert('Brand deleted successfully');
        fetchBrands();
      } catch (error) {
        console.error('Failed to delete brand:', error);
        alert('Failed to delete brand');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      picture: '',
      drug_id: '',
    });
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
        <p>Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Brands Management</h2>
          <p className="table-subtitle">Manage medicine brands and their relationships</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add" onClick={handleAddNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Brand
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
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>BRAND NAME</th>
              <th>GENERIC DRUG</th>
              <th>PICTURE</th>
              <th>PRICE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>No brands found</p>
                  <span>Try adjusting your search</span>
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.brand_id}>
                  <td>
                    <span className="brand-name">{brand.brand_name}</span>
                  </td>
                  <td>
                    <span className="drug-name">{brand.drug_data?.generic_name || '-'}</span>
                  </td>
                  <td>
                    {brand.picture ? (
                      <span className="has-picture">Yes</span>
                    ) : (
                      <span className="no-picture">No</span>
                    )}
                  </td>
                  <td>
                    <span className="price-text">Rp {(brand.drug_data?.price || 0).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEdit(brand)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(brand.brand_id)} title="Delete">
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
              <h3>{editMode ? 'Edit Brand' : 'Add New Brand'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter brand name"
                />
              </div>

              <div className="form-group">
                <label>Generic Drug *</label>
                <select
                  value={formData.drug_id}
                  onChange={(e) => setFormData({ ...formData, drug_id: e.target.value })}
                  required
                >
                  <option value="">Select drug</option>
                  {drugs.map((drug) => (
                    <option key={drug.drug_id} value={drug.drug_id}>
                      {drug.generic_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Picture URL</label>
                <input
                  type="text"
                  value={formData.picture}
                  onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                  placeholder="Enter picture URL (optional)"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update' : 'Create'} Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandList;