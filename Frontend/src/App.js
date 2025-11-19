import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin Layout
import AdminLayout from './components/admin/layout/AdminLayout';

// Admin Pages
import Dashboard from './components/admin/dashboard/Dashboard';
import UserList from './components/admin/users/UserList';
import RolesList from './components/admin/roles/RolesList';
import ObatList from './components/admin/obat/ObatList';
import BrandList from './components/admin/brands/BrandList';
import ManufacturerList from './components/admin/manufacturers/ManufacturerList';
import DosageFormList from './components/admin/dosage-forms/DosageFormList';
import ActiveIngredientList from './components/admin/active-ingredients/ActiveIngredientList';
import DiagnosesList from './components/admin/diagnoses/DiagnosesList';

// ==================== ✅ PROTECTED ROUTE WITH REAL AUTH ====================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
              <path d="M12 8V16M8 12H16" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>Loading HaloBat...</div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ==================== ADMIN PANEL ROUTES (PROTECTED) ==================== */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Main Pages */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="roles" element={<RolesList />} />
            
            {/* Pharmacy Management */}
            <Route path="drugs" element={<ObatList />} />
            <Route path="brands" element={<BrandList />} />
            <Route path="manufacturers" element={<ManufacturerList />} />
            <Route path="dosage-forms" element={<DosageFormList />} />
            <Route path="active-ingredients" element={<ActiveIngredientList />} />
            
            {/* Medical */}
            <Route path="diagnoses" element={<DiagnosesList />} />
          </Route>
          
          {/* ==================== DEFAULT & 404 ROUTES ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;