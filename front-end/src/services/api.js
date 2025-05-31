import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// Users API
export const usersAPI = {
    getUsers: (params) => api.get('/users', { params }),
    createUser: (userData) => api.post('/users', userData),
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// Clients API
export const clientsAPI = {
    getClients: (params) => api.get('/clients', { params }),
    createClient: (clientData) => api.post('/clients', clientData),
    getClient: (id) => api.get(`/clients/${id}`),
    updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
    deleteClient: (id) => api.delete(`/clients/${id}`),
};

// Loans API
export const loansAPI = {
    getLoans: (params) => api.get('/loans', { params }),
    createLoan: (loanData) => api.post('/loans', loanData),
    getLoan: (id) => api.get(`/loans/${id}`),
    updateLoan: (id, loanData) => api.put(`/loans/${id}`, loanData),
    updateLoanStatus: (id, statusData) => api.put(`/loans/${id}/status`, statusData),
    deleteLoan: (id) => api.delete(`/loans/${id}`),
    getLoansByClient: (clientId) => api.get(`/loans/client/${clientId}`),
    calculateLoanDetails: (data) => api.post('/loans/calculate', data),
    getAll: (params) => api.get('/loans', { params }),
    getById: (id) => api.get(`/loans/${id}`),
    create: (data) => api.post('/loans', data),
    update: (id, data) => api.put(`/loans/${id}`, data),
    updateStatus: (id, data) => api.put(`/loans/${id}/status`, data),
    
    // Schedule and repayment methods
    getDueLoans: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/loans/due?${queryString}`);
    },
    exportDueLoans: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/loans/due/export?${queryString}`, {
            responseType: 'blob'
        });
    },
    
    // New methods for loan details tabs
    getRepayments: (loanId) => api.get(`/loans/${loanId}/repayments`),
    getSchedule: (loanId) => api.get(`/loans/${loanId}/schedule`),
    getDocuments: (loanId) => api.get(`/loans/${loanId}/documents`),
    uploadDocument: (formData) => api.post('/loans/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
};

// Due Loans API
export const dueLoansAPI = {
    getDueLoans: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/due-loans?${queryString}`);
    },
    getDueLoansSummary: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/due-loans/summary?${queryString}`);
    },
    exportDueLoans: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/due-loans/export?${queryString}`, {
            responseType: 'blob'
        });
    },
    updateOverdueLoans: () => {
        return api.put('/due-loans/update-overdue');
    },
    getDashboardStats: () => {
        return api.get('/due-loans/dashboard');
    }
};

// ADD THIS: Missed Repayments API
export const missedRepaymentsAPI = {
    getMissedRepayments: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/missed-repayments?${queryString}`);
    },
    getMissedRepaymentsSummary: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/missed-repayments/summary?${queryString}`);
    },
    getMissedRepaymentsAnalytics: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/missed-repayments/analytics?${queryString}`);
    },
    markForFollowUp: (scheduleId, data) => {
        return api.post(`/missed-repayments/${scheduleId}/follow-up`, data);
    },
    getFollowUpActions: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/missed-repayments/follow-ups?${queryString}`);
    },
    updateFollowUpStatus: (followupId, data) => {
        return api.put(`/missed-repayments/follow-ups/${followupId}`, data);
    },
    generateReport: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/missed-repayments/report?${queryString}`, {
            responseType: params.format === 'csv' ? 'blob' : 'json'
        });
    }
};

// Repayments API
export const repaymentsAPI = {
    getRepayments: (params) => api.get('/repayments', { params }),
    processRepayment: (data) => api.post('/repayments', data),
    getRepayment: (id) => api.get(`/repayments/${id}`),
    getLoanRepayments: (loanId) => api.get(`/repayments/loan/${loanId}`),
};

// Loan Types API
export const loanTypesAPI = {
    getLoanTypes: (params) => api.get('/loan-types', { params }),
    createLoanType: (data) => api.post('/loan-types', data),
    getLoanType: (id) => api.get(`/loan-types/${id}`),
    updateLoanType: (id, data) => api.put(`/loan-types/${id}`, data),
    deleteLoanType: (id) => api.delete(`/loan-types/${id}`),
};

export default api;
