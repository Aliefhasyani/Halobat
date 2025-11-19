import React, { useState, useEffect } from 'react';
import { activeIngredientAPI } from '../../../services/api';
import './ActiveIngredients.css';

const ActiveIngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
  });

  useEffect(() => {
    fetchIngredients();
  }, [searchTerm]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await activeIngredientAPI.getAll();
      if (response.data.success) {
        let fetchedIngredients = response.data.data || [];
        
        if (searchTerm) {
          fetchedIngredients = fetchedIngredients.filter(ingredient =>
            ingredient.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setIngredients(fetchedIngredients);
      }
    } catch (error) {
      console.error('Failed to fetch active ingredients:', error);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await activeIngredientAPI.update(formData.id, { name: formData.name });
        alert('Active ingredient updated successfully');
      } else {
        await activeIngredientAPI.create({ name: formData.name });
        alert('Active ingredient created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchIngredients();
    } catch (error) {
      console.error('Failed to save active ingredient:', error);
      alert('Failed to save active ingredient');
    }
  };

  const handleEdit = (ingredient) => {
    setFormData({
      id: ingredient.id,
      name: ingredient.ingredient_name,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this active ingredient?')) {
      try {
        await activeIngredientAPI.delete(id);
        alert('Active ingredient deleted successfully');
        fetchIngredients();
      } catch (error) {
        console.error('Failed to delete active ingredient:', error);
        alert('Failed to delete active ingredient');
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
        <p>Loading active ingredients...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Active Ingredients Management</h2>
          <p className="table-subtitle">Manage active pharmaceutical ingredients</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add" onClick={handleAddNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Ingredient
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
            placeholder="Search active ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>INGREDIENT NAME</th>
              <th>RELATED DRUGS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>No active ingredients found</p>
                  <span>Try adjusting your search</span>
                </td>
              </tr>
            ) : (
              ingredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>
                    <span className="ingredient-name">{ingredient.ingredient_name}</span>
                  </td>
                  <td>
                    <span className="drug-count">{ingredient.related_drugs?.length || 0} drugs</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEdit(ingredient)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(ingredient.id)} title="Delete">
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
              <h3>{editMode ? 'Edit Active Ingredient' : 'Add New Active Ingredient'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Active Ingredient Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Paracetamol, Ibuprofen"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update' : 'Create'} Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveIngredientList;