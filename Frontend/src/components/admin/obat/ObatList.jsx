import React, { useState, useEffect } from 'react';
import { drugAPI } from '../../../services/api'; // ← GANTI INI (obatAPI → drugAPI)
import './Obat.css';

const ObatList = () => {
  const [obatList, setObatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchObat = async () => {
      setLoading(true);
      try {
        const response = await drugAPI.getAll(); // ← GANTI INI (obatAPI → drugAPI)
        
        if (response.data.success) {
          let fetchedDrugs = response.data.data || [];
          
          // Map backend drug data to frontend obat format
          fetchedDrugs = fetchedDrugs.map(drug => ({
            id: drug.drug_id,
            name: drug.generic_name,
            category: drug.dosage_form_data?.name || 'N/A',
            manufacturer: drug.manufacturer_data?.name || 'N/A',
            price: drug.price,
            description: drug.description,
            picture: drug.picture,
            // Note: Backend doesn't have stock, status, sku, expiry_date yet
            stock: 0,
            status: 'available',
            sku: `MED-${drug.drug_id}`,
            expiry_date: null,
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

          if (filterStatus !== 'all') {
            fetchedDrugs = fetchedDrugs.filter(obat => obat.status === filterStatus);
          }
          
          setObatList(fetchedDrugs);
        }
      } catch (error) {
        console.error('Failed to fetch drugs:', error);
        setObatList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchObat();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await drugAPI.delete(id); // ← GANTI INI (obatAPI → drugAPI)
        setObatList(obatList.filter(obat => obat.id !== id));
        alert('Medicine deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete medicine');
      }
    }
  };

  const handleEdit = (id) => {
    alert(`Edit medicine ID: ${id} - Coming soon`);
  };

  const handleView = (id) => {
    alert(`View medicine ID: ${id} - Coming soon`);
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

  const getStatusBadge = (status) => {
    const badges = {
      'available': 'status-available',
      'out_of_stock': 'status-out-of-stock',
      'low_stock': 'status-low-stock',
      'discontinued': 'status-discontinued',
    };
    return badges[status] || 'status-available';
  };

  const getStatusText = (status) => {
    const texts = {
      'available': 'Available',
      'out_of_stock': 'Out of Stock',
      'low_stock': 'Low Stock',
      'discontinued': 'Discontinued',
    };
    return texts[status] || 'Available';
  };

  const getStockLevel = (stock) => {
    if (stock === 0) return 'critical';
    if (stock < 100) return 'low';
    if (stock < 500) return 'medium';
    return 'high';
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
          <p className="table-subtitle">Manage medicine inventory and stock levels</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Medicine
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
            <option value="all">All Categories</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Cream">Cream</option>
          </select>

          <select 
            className="filter-select" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
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
              <th>MEDICINE INFO</th>
              <th>DOSAGE FORM</th>
              <th>MANUFACTURER</th>
              <th>STOCK</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>DESCRIPTION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {obatList.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
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
              obatList.map((obat) => (
                <tr key={obat.id}>
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
                    <div className="stock-cell">
                      <span className={`stock-number stock-${getStockLevel(obat.stock)}`}>
                        {obat.stock || 0}
                      </span>
                      <span className="stock-label">units</span>
                    </div>
                  </td>
                  <td>
                    <span className="price-text">Rp {(obat.price || 0).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(obat.status)}`}>
                      {getStatusText(obat.status)}
                    </span>
                  </td>
                  <td>
                    <span className="description-text">{obat.description?.substring(0, 50) || '-'}...</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleView(obat.id)} title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button className="action-btn edit" onClick={() => handleEdit(obat.id)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(obat.id)} title="Delete">
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
          Showing <strong>{obatList.length}</strong> medicines
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

export default ObatList;