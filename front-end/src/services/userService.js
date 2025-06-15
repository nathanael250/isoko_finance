import api from './api';

export const userService = {
    // Get all users with pagination and filters
    getUsers: async (params = {}) => {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get single user by ID
    getUser: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create new user
    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Toggle user status
    toggleUserStatus: async (id, isActive) => {
        try {
            const response = await api.patch(`/users/${id}/status`, { is_active: isActive });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Reset user password
    resetPassword: async (id, newPassword) => {
        try {
            const response = await api.patch(`/users/${id}/password`, { password: newPassword });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get user statistics
    getUserStats: async () => {
        try {
            const response = await api.get('/users/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
