import axios from 'axios';
import { API_BASE_URL } from '../config';

const authAPI = {
  login: (credentials) => {
    return axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  },

  register: (userData) => {
    return axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  },

  getCurrentUser: () => {
    return axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  logout: () => {
    return axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  forgotPassword: (email) => {
    return axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
  },

  resetPassword: (token, password) => {
    return axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
      token,
      password,
    });
  },

  changePassword: (data) => {
    return axios.post(`${API_BASE_URL}/api/auth/change-password`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};

export default authAPI; 