import api from './api';

export const loanTypeService = {
  // Get all loan types with pagination and filters
  getLoanTypes: async (params = {}) => {
    try {
      const response = await api.get('/loan-types', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get active loan types for client applications
  getActiveLoanTypes: async () => {
    try {
      const response = await api.get('/loan-types/active');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single loan type by ID
  getLoanType: async (id) => {
    try {
      const response = await api.get(`/loan-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new loan type
  createLoanType: async (loanTypeData) => {
    try {
      const response = await api.post('/loan-types', loanTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update loan type
  updateLoanType: async (id, loanTypeData) => {
    try {
      const response = await api.put(`/loan-types/${id}`, loanTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete loan type
  deleteLoanType: async (id) => {
    try {
      const response = await api.delete(`/loan-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Calculate loan preview
  calculateLoanPreview: async (loanTypeId, data) => {
    try {
      const response = await api.post(`/loan-types/${loanTypeId}/calculate`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
