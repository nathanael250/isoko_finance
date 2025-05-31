import api from './api';

export const dashboardService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get chart data
    getChartData: async (chartType, period = 'monthly') => {
        try {
            const response = await api.get(`/dashboard/charts/${chartType}?period=${period}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${chartType} chart data:`, error);
            throw error;
        }
    },

    // Get recent activities
    getRecentActivities: async (limit = 10) => {
        try {
            const response = await api.get(`/dashboard/activities?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    },

    // Get performance metrics
    getPerformanceMetrics: async () => {
        try {
            const response = await api.get('/dashboard/performance');
            return response.data;
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            throw error;
        }
    }
};
