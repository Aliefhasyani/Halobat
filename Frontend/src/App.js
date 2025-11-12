import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';

import AdminLayout from './components/admin/layout/AdminLayout';
import UserList from './components/admin/users/UserList';
import ObatList from './components/admin/obat/ObatList';
import RolesList from './components/admin/roles/RolesList';
import ReportsList from './components/admin/reports/ReportsList';

const ProtectedRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="obat" element={<ObatList />} />
            <Route path="users" element={<UserList />} />
            <Route path="reports" element={<ReportsList />} />
            <Route path="roles" element={<RolesList />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/admin/users" replace />} />
          <Route path="*" element={<Navigate to="/admin/users" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

// =================== CODE FOR REAL AUTH ===================
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';

// import Login from './components/auth/Login';
// import Register from './components/auth/Register';

// import AdminLayout from './components/admin/layout/AdminLayout';
// import UserList from './components/admin/users/UserList';
// import ObatList from './components/admin/obat/ObatList';
// import RolesList from './components/admin/roles/RolesList';
// import ReportsList from './components/admin/reports/ReportsList';

// // ==================== ✅ PROTECTED ROUTE WITH AUTH ====================
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();
  
//   if (loading) {
//     return (
//       <div style={{
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
//         color: 'white',
//         fontSize: '18px',
//         fontWeight: '600'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
//           <div>Loading HaloBat...</div>
//         </div>
//       </div>
//     );
//   }
  
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// // Dashboard Component
// const Dashboard = () => {
//   const { user, logout } = useAuth();
  
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h1>🏥 Dashboard HaloBat</h1>
//       <p>Welcome, {user?.full_name}!</p>
//       <p>Email: {user?.email}</p>
//       <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
//         <button 
//           onClick={() => window.location.href = '/admin/users'}
//           style={{ 
//             padding: '12px 24px',
//             background: '#2e7d32',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '600'
//           }}
//         >
//           Go to Admin Panel
//         </button>
//         <button 
//           onClick={logout} 
//           style={{ 
//             padding: '12px 24px',
//             background: '#dc2626',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '600'
//           }}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
          
//           <Route 
//             path="/dashboard" 
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route 
//             path="/admin" 
//             element={
//               <ProtectedRoute>
//                 <AdminLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<Navigate to="/admin/users" replace />} />
//             <Route path="obat" element={<ObatList />} />
//             <Route path="users" element={<UserList />} />
//             <Route path="reports" element={<ReportsList />} />
//             <Route path="roles" element={<RolesList />} />
//           </Route>
          
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;