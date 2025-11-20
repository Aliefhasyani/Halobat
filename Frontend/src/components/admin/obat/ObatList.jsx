import React, { useState, useEffect } from 'react';
import { drugAPI, manufacturerAPI, dosageFormAPI, activeIngredientAPI } from '../../../services/api';
import './Obat.css';

const ObatList = () => {
  const [obatList, setObatList] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    id: null,
    generic_name: '',
    description: '',
    picture: '',
    price: '',
    manufacturer_id: '',
    dosage_form_id: '',
    active_ingredient_ids: [],
  });

  useEffect(() => {
    fetchObat();
    fetchManufacturers();
    fetchDosageForms();
    fetchActiveIngredients();
  }, [searchTerm, filterCategory]);

  const fetchObat = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching drugs...');
      const response = await drugAPI.getAll();
      
      if (response.data.success) {
        let fetchedDrugs = response.data.data || [];
        console.log('✅ Fetched drugs:', fetchedDrugs);
        
        // Map backend drug data to frontend format
        fetchedDrugs = fetchedDrugs.map(drug => ({
          id: drug.drug_id,
          drug_id: drug.drug_id,
          name: drug.generic_name,
          generic_name: drug.generic_name,
          category: drug.dosage_form_data?.name || 'N/A',
          manufacturer: drug.manufacturer_data?.name || 'N/A',
          manufacturer_id: drug.manufacturer_data?.id,
          dosage_form_id: drug.dosage_form_data?.id,
          price: drug.price,
          description: drug.description || '',
          picture: drug.picture || '',
          sku: `MED-${drug.drug_id}`,
        }));
        
        // Apply filters
        if (searchTerm) {
          fetchedDrugs = fetchedDrugs.filter(obat =>
            obat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obat.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obat.sku?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (filterCategory !== 'all') {
          fetchedDrugs = fetchedDrugs.filter(obat => obat.category === filterCategory);
        }
        
        setObatList(fetchedDrugs);
      }
    } catch (error) {
      console.error('❌ Failed to fetch drugs:', error);
      setObatList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await manufacturerAPI.getAll();
      if (response.data.success) {
        const mapped = response.data.data.map(m => ({
          manufacturer_id: m.manufacturer_id,
          name: m.manufacturer_name
        }));
        setManufacturers(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    }
  };

  const fetchDosageForms = async () => {
    try {
      const response = await dosageFormAPI.getAll();
      if (response.data.success) {
        const mapped = response.data.data.map(d => ({
          dosage_id: d.dosage_id,
          name: d.dosage_name
        }));
        setDosageForms(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch dosage forms:', error);
    }
  };

  const fetchActiveIngredients = async () => {
    try {
      const response = await activeIngredientAPI.getAll();
      if (response.data.success) {
        const mapped = response.data.data.map(a => ({
          id: a.id,
          name: a.ingredient_name
        }));
        setActiveIngredients(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch active ingredients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting drug data:', formData);
    
    try {
      const payload = {
        generic_name: formData.generic_name,
        description: formData.description || null,
        picture: formData.picture || null,
        price: parseFloat(formData.price),
        manufacturer_id: parseInt(formData.manufacturer_id),
        dosage_form_id: parseInt(formData.dosage_form_id),
        active_ingredient_ids: formData.active_ingredient_ids.map(id => parseInt(id)),
      };

      console.log('📦 Payload:', payload);

      if (editMode && formData.id) {
        await drugAPI.update(formData.id, payload);
        alert('✅ Drug updated successfully!');
      } else {
        await drugAPI.create(payload);
        alert('✅ Drug created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchObat();
    } catch (error) {
      console.error('❌ Failed to save drug:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.generic_name?.[0] ||
                      'Failed to save drug';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleEdit = (drug) => {
    console.log('✏️ Editing drug:', drug);
    
    setFormData({
      id: drug.drug_id,
      generic_name: drug.generic_name,
      description: drug.description || '',
      picture: drug.picture || '',
      price: drug.price.toString(),
      manufacturer_id: drug.manufacturer_id.toString(),
      dosage_form_id: drug.dosage_form_id.toString(),
      active_ingredient_ids: [],
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Are you sure you want to delete this medicine?\n\nThis action cannot be undone.')) {
      try {
        await drugAPI.delete(id);
        setObatList(obatList.filter(obat => obat.drug_id !== id));
        alert('✅ Medicine deleted successfully!');
      } catch (error) {
        console.error('❌ Delete failed:', error);
        alert('❌ Failed to delete medicine');
      }
    }
  };

  const handleView = (drug) => {
    setFormData({
      id: drug.drug_id,
      generic_name: drug.generic_name,
      description: drug.description || '',
      picture: drug.picture || '',
      price: drug.price.toString(),
      manufacturer_id: drug.manufacturer_id.toString(),
      dosage_form_id: drug.dosage_form_id.toString(),
      active_ingredient_ids: [],
    });
    setEditMode(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      generic_name: '',
      description: '',
      picture: '',
      price: '',
      manufacturer_id: '',
      dosage_form_id: '',
      active_ingredient_ids: [],
    });
    setEditMode(false);
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(true);
    setShowModal(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentObat = obatList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(obatList.length / itemsPerPage);

  // Generate page numbers dynamically
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
        <p>Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Drugs Management</h2>
          <p className="table-subtitle">Manage medicine inventory and information</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add" onClick={handleAddNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Medicine
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
            placeholder="Search by name, SKU, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="filter-select" 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Dosage Forms</option>
            {dosageForms.map(form => (
              <option key={form.dosage_id} value={form.name}>
                {form.name}
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
              <th>MEDICINE INFO</th>
              <th>DOSAGE FORM</th>
              <th>MANUFACTURER</th>
              <th>PRICE</th>
              <th>DESCRIPTION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentObat.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>No medicines found</p>
                  <span>Try adjusting your search or filter</span>
                </td>
              </tr>
            ) : (
              currentObat.map((obat) => (
                <tr key={obat.drug_id}>
                  <td>
                    <input type="checkbox" className="checkbox" />
                  </td>
                  <td>
                    <div className="medicine-cell">
                      <div className="medicine-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M10.5 13.5L8.5 15.5M10.5 13.5L15.5 8.5M10.5 13.5L8.5 11.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5M15.5 8.5L13.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="medicine-details">
                        <span className="medicine-name">{obat.name || '-'}</span>
                        <span className="medicine-sku">SKU: {obat.sku || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{obat.category || '-'}</span>
                  </td>
                  <td>
                    <span className="manufacturer-text">{obat.manufacturer || '-'}</span>
                  </td>
                  <td>
                    <span className="price-text">Rp {(obat.price || 0).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="description-text">{obat.description?.substring(0, 50) || '-'}{obat.description?.length > 50 ? '...' : ''}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleView(obat)} title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="action-btn edit" onClick={() => handleEdit(obat)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(obat.drug_id)} title="Delete">
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

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, obatList.length)}</strong> of <strong>{obatList.length}</strong> medicines
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              <h3>{editMode ? (formData.id ? 'Edit Medicine' : 'Add New Medicine') : 'View Medicine Details'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Generic Name *</label>
                <input
                  type="text"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter generic name"
                />
              </div>

              <div className="form-group">
                <label>Manufacturer *</label>
                <select
                  value={formData.manufacturer_id}
                  onChange={(e) => setFormData({ ...formData, manufacturer_id: e.target.value })}
                  required
                  disabled={!editMode}
                >
                  <option value="">Select manufacturer</option>
                  {manufacturers.map((mfr) => (
                    <option key={mfr.manufacturer_id} value={mfr.manufacturer_id}>
                      {mfr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Dosage Form *</label>
                <select
                  value={formData.dosage_form_id}
                  onChange={(e) => setFormData({ ...formData, dosage_form_id: e.target.value })}
                  required
                  disabled={!editMode}
                >
                  <option value="">Select dosage form</option>
                  {dosageForms.map((form) => (
                    <option key={form.dosage_id} value={form.dosage_id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price (Rp) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  disabled={!editMode}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!editMode}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Picture URL</label>
                <input
                  type="text"
                  value={formData.picture}
                  onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                  disabled={!editMode}
                  placeholder="Enter picture URL (optional)"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {editMode && (
                  <button type="submit" className="btn-submit">
                    {formData.id ? 'Update' : 'Create'} Medicine
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

export default ObatList;