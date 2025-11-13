import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  // ==================== ✅ REAL AUTHENTICATION ====================
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user || response.data);
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

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Handle response - check both response.data.success and fallback to checking message
      const success = response.data?.success !== false; // default true if not explicitly false
      
      if (success && response.data) {
        const { token, user } = response.data;
        
        // Store token if provided
        if (token) {
          localStorage.setItem('auth_token', token);
          setToken(token);
        }
        
        // Store user if provided
        if (user) {
          setUser(user);
        }
        
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
    
    // Fallback if no success response
    return { 
      success: false, 
      error: 'Login failed - no response received' 
    };
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Handle response - check both response.data.success and fallback to checking message
      const success = response.data?.success !== false; // default true if not explicitly false
      
      if (success && response.data) {
        // Backend register doesn't return token, just success message
        // User needs to login after registration
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
    
    // Fallback if no success response
    return { 
      success: false, 
      error: 'Registration failed - no response received' 
    };
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
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
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
