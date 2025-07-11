import api from './api';

export const loanService = {
    // Get loan officer statistics
    getLoanOfficerStats: async () => {
        try {
            const response = await api.get('/loan-officer/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get recent applications for loan officer
    getRecentApplications: async (limit = 10) => {
        try {
            const response = await api.get('/loan-officer/recent-applications', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create new loan application
    createLoanApplication: async (applicationData) => {
        try {
            const response = await api.post('/loan-applications', applicationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all loan applications with filters
    getLoanApplications: async (params = {}) => {
        try {
            const response = await api.get('/loan-applications', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get single loan application
    getLoanApplication: async (id) => {
        try {
            const response = await api.get(`/loan-applications/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update loan application
    updateLoanApplication: async (id, updateData) => {
        try {
            const response = await api.put(`/loan-applications/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Calculate loan details
    calculateLoan: async (amount, rate, term) => {
        try {
            const response = await api.post('/loans/calculate', {
                loan_amount: amount,
                interest_rate: rate,
                loan_term: term
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getAllLoans: async (params = {}) => {
        try {
            const response = await api.get('/loans', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getLoansByClient: async (clientId) => {
        try {
            const response = await api.get(`/loans/client/${clientId}`);
            return response.data;
        } catch (error) {
            return { success: false, error };
        }
    }
};
