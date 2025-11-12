import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // ← Set false biar langsung load
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  // ==================== 🔓 BYPASS: AUTO LOGIN ====================
  useEffect(() => {
    // Set mock user automatically (bypass authentication)
    const mockUser = {
      id: 1,
      full_name: 'Reynaldy Alnah',
      username: 'reynaldyAlnah',
      email: 'reynaldy@halobat.com',
      role_id: 1, // Admin role
      role: 'SUPER ADMIN',
    };
    
    console.log('🔓 Bypass Auth: Auto login as', mockUser.full_name);
    setUser(mockUser);
    setLoading(false);
  }, []);

  /* 
  ==================== ❌ DISABLED: REAL AUTH CHECK ====================
  // Comment out real authentication check
  
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);
  */

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('auth_token', token);
        setToken(token);
        setUser(user);
        
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('auth_token', token);
        setToken(token);
        setUser(user);
        
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      
      // Reload to re-trigger auto login
      window.location.href = '/admin/users';
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: true, // ← Always true (bypass)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ==================== CODE FOR : REAL AUTH CHECK ====================
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { authAPI } from '../services/api';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('auth_token'));

//   // ==================== ✅ REAL AUTHENTICATION ====================
//   useEffect(() => {
//     const checkAuth = async () => {
//       if (token) {
//         try {
//           const response = await authAPI.getCurrentUser();
//           setUser(response.data.user || response.data);
//         } catch (error) {
//           console.error('Auth check failed:', error);
//           localStorage.removeItem('auth_token');
//           setToken(null);
//         }
//       }
//       setLoading(false);
//     };

//     checkAuth();
//   }, [token]);

//   const login = async (credentials) => {
//     try {
//       const response = await authAPI.login(credentials);
      
//       if (response.data.success) {
//         const { token, user } = response.data;
        
//         localStorage.setItem('auth_token', token);
//         setToken(token);
//         setUser(user);
        
//         return { success: true, data: response.data };
//       }
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.message || 'Login failed' 
//       };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await authAPI.register(userData);
      
//       if (response.data.success) {
//         const { token, user } = response.data;
        
//         localStorage.setItem('auth_token', token);
//         setToken(token);
//         setUser(user);
        
//         return { success: true, data: response.data };
//       }
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.message || 'Registration failed' 
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('auth_token');
//       setToken(null);
//       setUser(null);
//     }
//   };

//   const value = {
//     user,
//     token,
//     login,
//     register,
//     logout,
//     loading,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
