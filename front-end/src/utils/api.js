// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create headers with authentication
const createAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: createAuthHeaders(),
        ...options
    };

    console.log(`🔗 API Call: ${config.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid - redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ API Error for ${url}:`, error);
        throw error;
    }
};

// Specific API functions
export const dueLoanAPI = {
    // Get due loans for today
    getTodayDueLoans: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/due-loans/today?${queryString}`);
    },

    // Get due loans with date range
    getDueLoansDateRange: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/due-loans/date-range?${queryString}`);
    },

    // Get due loans summary
    getDueLoansSummary: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/due-loans/summary?${queryString}`);
    },

    // Export due loans
    exportDueLoans: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/due-loans/export?${queryString}`);
    },

    // Get dashboard stats
    getDashboardStats: () => {
        return apiCall('/due-loans/dashboard');
    }
};

export default apiCall;