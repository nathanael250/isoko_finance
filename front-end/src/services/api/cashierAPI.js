import axios from 'axios';
import { API_BASE_URL } from './config';

const cashierAPI = {
  getPaymentRecords: () => {
    return axios.get(`${API_BASE_URL}/api/cashier/payments`);
  },

  recordPayment: (data) => {
    return axios.post(`${API_BASE_URL}/api/cashier/payments`, data);
  },

  getDailyReports: () => {
    return axios.get(`${API_BASE_URL}/api/cashier/reports/daily`);
  },

  getPaymentHistory: () => {
    return axios.get(`${API_BASE_URL}/api/cashier/payments/history`);
  },

  getDueCollections: () => {
    return axios.get(`${API_BASE_URL}/api/cashier/collections/due`);
  },

  getOverdueLoans: () => {
    return axios.get(`${API_BASE_URL}/api/cashier/loans/overdue`);
  },
};

export default cashierAPI; 