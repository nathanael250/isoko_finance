import api from './api';

export const borrowerService = {
    // Get all borrowers with pagination and search
    getBorrowers: async (params = {}) => {
        try {
            console.log('Fetching borrowers with params:', params);
            const response = await api.get('/clients', { params });
            console.log('Borrowers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in getBorrowers:', error);
            throw error.response?.data || error;
        }
    },

    // Get single borrower
    getBorrower: async (id) => {
        try {
            const response = await api.get(`/clients/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create new borrower
    createBorrower: async (borrowerData) => {
        try {
            const response = await api.post('/clients', borrowerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update borrower
    updateBorrower: async (id, borrowerData) => {
        try {
            const response = await api.put(`/clients/${id}`, borrowerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete borrower
    deleteBorrower: async (id) => {
        try {
            const response = await api.delete(`/clients/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Search borrowers
    searchBorrowers: async (searchTerm) => {
        try {
            const response = await api.get('/clients/search', {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
