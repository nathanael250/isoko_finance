import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        console.log('Auth check response:', response);

        if (response.data.success) {
          const userData = response.data.data?.user || response.data.data;
          console.log('Setting user data:', userData);
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, onSuccess) => {
    try {
      setError(null);
      console.log('=== AUTHCONTEXT LOGIN START ===');
      console.log('Credentials:', credentials);

      const response = await authAPI.login(credentials);
      console.log('=== API RESPONSE ===');
      console.log('Response type:', typeof response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data && response.data.success) {
        console.log('=== SUCCESS BRANCH ===');
        const responseData = response.data.data || {};
        console.log('Response data.data:', responseData);

        const { token, user } = responseData;

        console.log('Extracted token:', token);
        console.log('Extracted userData:', user);
        console.log('UserData type:', typeof user);

        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);

          const returnValue = {
            success: true,
            user
          };
          console.log('=== RETURNING ===');
          console.log('Return value:', returnValue);
          console.log('=== END AUTHCONTEXT ===');

          if (onSuccess) onSuccess(user);
          return returnValue;
        } else {
          console.error('Missing token or user data');
          console.log('Token exists:', !!token);
          console.log('UserData exists:', !!user);
          return { success: false, message: response.data.message || 'Login failed' };
        }
      } else {
        console.log('=== FAILURE BRANCH ===');
        console.log('Response.data.success:', response.data?.success);
        return { success: false, message: response.data?.message || 'Login failed' };
      }
    } catch (err) {
      console.error('=== AUTHCONTEXT ERROR ===');
      console.error('Error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);

      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // UPDATED LOGOUT FUNCTION
  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===');
      
      // Clear local storage first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      setError(null);
      
      console.log('Local storage cleared, user state cleared');
      
      // Try to call logout API (optional, don't fail if it doesn't work)
      try {
        await authAPI.logout();
        console.log('API logout successful');
      } catch (apiError) {
        console.log('API logout failed (but continuing):', apiError);
      }
      
      // Navigate to login page
      console.log('Navigating to login...');
      navigate('/login', { replace: true });
      
      console.log('=== LOGOUT COMPLETE ===');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear everything and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  // Helper function to get dashboard route based on role
  const getDashboardRoute = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'supervisor':
        return '/dashboard/supervisor';
      case 'loan-officer':
        return '/dashboard/loan-officer';
      case 'cashier':
        return '/dashboard/cashier';
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    getDashboardRoute,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
