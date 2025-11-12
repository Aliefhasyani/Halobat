import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../../services/api';
import './Reports.css';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        created_at: '2024-12-27',
        type: 'user',
        title: 'Monthly User Registration Report',
        description: 'Comprehensive analysis of new user registrations for December 2024',
        generated_by: 'System Admin',
        status: 'completed',
        file_size: '2.5 MB',
        format: 'PDF',
        downloads: 15
      },
      {
        id: 2,
        created_at: '2024-12-26',
        type: 'obat',
        title: 'Drug Inventory Summary',
        description: 'Complete inventory status report including stock levels and expiry dates',
        generated_by: 'Pharmacy Manager',
        status: 'completed',
        file_size: '3.8 MB',
        format: 'XLSX',
        downloads: 32
      },
      {
        id: 3,
        created_at: '2024-12-25',
        type: 'transaction',
        title: 'Sales Transaction Report',
        description: 'Detailed sales transactions and revenue analysis for Q4 2024',
        generated_by: 'Finance Team',
        status: 'completed',
        file_size: '5.2 MB',
        format: 'PDF',
        downloads: 48
      },
      {
        id: 4,
        created_at: '2024-12-24',
        type: 'system',
        title: 'System Performance Metrics',
        description: 'Server performance, uptime, and response time analysis',
        generated_by: 'IT Department',
        status: 'completed',
        file_size: '1.8 MB',
        format: 'PDF',
        downloads: 8
      },
      {
        id: 5,
        created_at: '2024-12-23',
        type: 'user',
        title: 'User Activity Analysis',
        description: 'User engagement patterns and activity metrics for December',
        generated_by: 'Analytics Team',
        status: 'completed',
        file_size: '4.1 MB',
        format: 'XLSX',
        downloads: 22
      },
      {
        id: 6,
        created_at: '2024-12-22',
        type: 'obat',
        title: 'Medicine Expiry Alert Report',
        description: 'List of medicines expiring within the next 90 days',
        generated_by: 'Pharmacy Manager',
        status: 'completed',
        file_size: '890 KB',
        format: 'PDF',
        downloads: 41
      },
      {
        id: 7,
        created_at: '2024-12-21',
        type: 'transaction',
        title: 'Revenue Forecast 2025',
        description: 'Projected revenue analysis and growth forecasts for next year',
        generated_by: 'Finance Team',
        status: 'processing',
        file_size: '-',
        format: 'PDF',
        downloads: 0
      },
    ];
    
    console.log('Bypass: Loading mock reports data');
    
    let filteredReports = mockReports;
    
    if (searchTerm) {
      filteredReports = filteredReports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.generated_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filteredReports = filteredReports.filter(report => report.type === filterType);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      filteredReports = filteredReports.filter(report => {
        const reportDate = new Date(report.created_at);
        const diffDays = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
        
        if (filterPeriod === 'today') return diffDays === 0;
        if (filterPeriod === 'week') return diffDays <= 7;
        if (filterPeriod === 'month') return diffDays <= 30;
        return true;
      });
    }
    
    setReports(filteredReports);
    setLoading(false);
  }, [currentPage, searchTerm, filterType, filterPeriod]);

  const handleDownload = (id) => {
    alert(`Download report ID: ${id} - Coming soon`);
  };

  const handleView = (id) => {
    alert(`View report ID: ${id} - Coming soon`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      alert('Bypass Mode: Delete functionality disabled');
    }
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

  const getTypeBadge = (type) => {
    const badges = {
      'user': 'type-user',
      'obat': 'type-obat',
      'transaction': 'type-transaction',
      'system': 'type-system',
    };
    return badges[type] || 'type-system';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'user': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      'obat': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 13.5L15.5 8.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      'transaction': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      'system': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    };
    return icons[type] || icons['system'];
  };

  const getTypeText = (type) => {
    const texts = {
      'user': 'User Report',
      'obat': 'Medicine Report',
      'transaction': 'Transaction Report',
      'system': 'System Report',
    };
    return texts[type] || 'System Report';
  };

  const getStatusBadge = (status) => {
    return status === 'completed' ? 'status-completed' : 'status-processing';
  };

  const getStatusText = (status) => {
    return status === 'completed' ? 'Completed' : 'Processing';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Reports & Analytics</h2>
          <p className="table-subtitle">View and download system reports</p>
        </div>
        
        <div className="header-right">
          <button className="btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Generate Report
          </button>
          
          <button className="btn-export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Bulk Export
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
            placeholder="Search reports by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="filter-select" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="user">User Reports</option>
            <option value="obat">Medicine Reports</option>
            <option value="transaction">Transaction Reports</option>
            <option value="system">System Reports</option>
          </select>

          <select 
            className="filter-select" 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <button className="btn-filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            More Filters
          </button>
        </div>
      </div>

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="empty-state-list">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>No reports found</p>
            <span>Try adjusting your search or filter</span>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-item">
              <div className="report-item-left">
                <div className={`report-type-icon ${getTypeBadge(report.type)}`}>
                  {getTypeIcon(report.type)}
                </div>
                
                <div className="report-info">
                  <div className="report-header-row">
                    <h3 className="report-title">{report.title}</h3>
                    <span className={`status-badge ${getStatusBadge(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </div>
                  
                  <p className="report-description">{report.description}</p>
                  
                  <div className="report-meta">
                    <span className={`report-type-badge ${getTypeBadge(report.type)}`}>
                      {getTypeText(report.type)}
                    </span>
                    
                    <span className="report-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {report.generated_by}
                    </span>
                    
                    <span className="report-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {formatDate(report.created_at)}
                    </span>

                    {report.status === 'completed' && (
                      <>
                        <span className="report-meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {report.file_size} ({report.format})
                        </span>
                        
                        <span className="report-meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {report.downloads} downloads
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="report-item-right">
                {report.status === 'completed' ? (
                  <>
                    <button 
                      className="report-action-btn primary" 
                      onClick={() => handleDownload(report.id)}
                      title="Download"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Download
                    </button>
                    
                    <button 
                      className="report-action-btn secondary" 
                      onClick={() => handleView(report.id)}
                      title="View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>

                    <button 
                      className="report-action-btn danger" 
                      onClick={() => handleDelete(report.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="processing-indicator">
                    <div className="processing-spinner"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <div className="pagination-info">
          Showing <strong>{reports.length}</strong> of <strong>87</strong> reports
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
            <button className="page-number" onClick={() => setCurrentPage(9)}>
              9
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

export default ReportsList;