import React, { useState, useEffect } from 'react';
import { diagnosesAPI } from '../../../services/api';
import './Diagnoses.css';

const DiagnosesList = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchDiagnoses();
  }, [searchTerm]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const response = await diagnosesAPI.getAll();
      if (response.data.success) {
        let fetchedDiagnoses = response.data.data || [];
        
        if (searchTerm) {
          fetchedDiagnoses = fetchedDiagnoses.filter(diagnosis =>
            diagnosis.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diagnosis.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diagnosis.users_with_diagnosis?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setDiagnoses(fetchedDiagnoses);
      }
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setShowDetailModal(true);
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
        <p>Loading diagnoses...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="table-title">Diagnoses</h2>
          <p className="table-subtitle">View user diagnoses and symptoms (Read-only)</p>
        </div>
        
        <div className="header-right">
          <button className="btn-export" onClick={() => alert('Export feature - Coming soon')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Export Data
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
            placeholder="Search by symptoms, diagnosis, or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="diagnoses-grid">
        {diagnoses.length === 0 ? (
          <div className="empty-state-grid">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>No diagnoses found</p>
            <span>Try adjusting your search</span>
          </div>
        ) : (
          diagnoses.map((diagnosis) => (
            <div key={diagnosis.diagnose_id} className="diagnosis-card">
              <div className="diagnosis-card-header">
                <div className="diagnosis-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="diagnosis-id">ID: {diagnosis.diagnose_id}</div>
              </div>

              <div className="diagnosis-card-body">
                <div className="diagnosis-section">
                  <h4 className="section-label">Patient</h4>
                  <div className="patient-info">
                    <div className="patient-avatar">
                      {diagnosis.users_with_diagnosis?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="patient-name">{diagnosis.users_with_diagnosis?.full_name || 'Unknown'}</p>
                      <p className="patient-email">{diagnosis.users_with_diagnosis?.email || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="diagnosis-section">
                  <h4 className="section-label">Symptoms</h4>
                  <p className="diagnosis-text">{diagnosis.symptoms || '-'}</p>
                </div>

                <div className="diagnosis-section">
                  <h4 className="section-label">Diagnosis</h4>
                  <p className="diagnosis-text diagnosis-result">{diagnosis.diagnosis || '-'}</p>
                </div>

                <div className="diagnosis-footer">
                  <button className="btn-view-detail" onClick={() => handleViewDetail(diagnosis)}>
                    View Full Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDiagnosis && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Diagnosis Details - ID: {selectedDiagnosis.diagnose_id}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Patient Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{selectedDiagnosis.users_with_diagnosis?.user_id || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedDiagnosis.users_with_diagnosis?.full_name || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedDiagnosis.users_with_diagnosis?.email || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Symptoms Reported</h4>
                <div className="symptoms-box">
                  {selectedDiagnosis.symptoms || 'No symptoms reported'}
                </div>
              </div>

              <div className="detail-section">
                <h4>Diagnosis Result</h4>
                <div className="diagnosis-box">
                  {selectedDiagnosis.diagnosis || 'No diagnosis available'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosesList;