import axios from 'axios';
import { API_BASE_URL } from './config';

const loanAPI = {
  getAllLoans: () => {
    return axios.get(`${API_BASE_URL}/api/loans`);
  },

  getLoanById: (id) => {
    return axios.get(`${API_BASE_URL}/api/loans/${id}`);
  },

  createLoan: (data) => {
    return axios.post(`${API_BASE_URL}/api/loans`, data);
  },

  updateLoan: (id, data) => {
    return axios.put(`${API_BASE_URL}/api/loans/${id}`, data);
  },

  deleteLoan: (id) => {
    return axios.delete(`${API_BASE_URL}/api/loans/${id}`);
  },
};

export default loanAPI; 