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


        if (response.data.success) {
          const userData = response.data.data?.user || response.data.data;

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


      const response = await authAPI.login(credentials);


      if (response.data && response.data.success) {

        const responseData = response.data.data || {};


        const { token, user } = responseData;


        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);

          const returnValue = {
            success: true,
            user
          };


          if (onSuccess) onSuccess(user);
          return returnValue;
        } else {

          return { success: false, message: response.data.message || 'Login failed' };
        }
      } else {

        return { success: false, message: response.data?.message || 'Login failed' };
      }
    } catch (err) {


      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // UPDATED LOGOUT FUNCTION
  const logout = async () => {
    try {

      
      // Clear local storage first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      setError(null);
      

      
      // Try to call logout API (optional, don't fail if it doesn't work)
      try {
        await authAPI.logout();

      } catch (apiError) {

      }
      
      // Navigate to login page

      navigate('/login', { replace: true });
      

      
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
