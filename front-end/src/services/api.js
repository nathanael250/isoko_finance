import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add default export
export default api;

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
    getCurrentUser: () => api.get('/auth/me'),
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
    assignOfficer: (id, officerId) => api.patch(`/clients/${id}/assign-officer`, { assigned_officer: officerId }),
};
// Add this to your existing api.js file
export const borrowersAPI = {
    getBorrowers: (params) => api.get('/clients', { params }),
    createBorrower: (borrowerData) => api.post('/clients', borrowerData),
    getBorrower: (id) => api.get(`/clients/${id}`),
    updateBorrower: (id, borrowerData) => api.put(`/clients/${id}`, borrowerData),
    deleteBorrower: (id) => api.delete(`/clients/${id}`),
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
    getMyLoans: (params) => api.get('/loans/my-loans', { params }),

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
    uploadDocument: (loanId, formData) => api.post(`/loans/${loanId}/files`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    deleteDocument: (loanId, documentId) => api.delete(`/loans/${loanId}/files/${documentId}`),
    downloadDocument: (loanId, documentId) => api.get(`/loans/${loanId}/files/${documentId}/download`, {
        responseType: 'blob'
    }),
    updateDocumentStatus: (loanId, documentId, statusData) => api.put(`/loans/${loanId}/files/${documentId}`, statusData),
    
    // Comments API - Using loanDetails routes
    getComments: (loanId) => api.get(`/loans/${loanId}/comments`),
    addComment: (loanId, commentData) => api.post(`/loans/${loanId}/comments`, commentData),
    updateComment: (loanId, commentId, commentData) => api.put(`/loans/${loanId}/comments/${commentId}`, commentData),
    deleteComment: (loanId, commentId) => api.delete(`/loans/${loanId}/comments/${commentId}`),
    
    getLoanTypes: (params) => api.get('/loan-types', { params }),
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


export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivities: (limit = 10) => api.get(`/dashboard/activities?limit=${limit}`),
    getPerformance: () => api.get('/dashboard/performance'),
    getChartData: (chartType) => api.get(`/dashboard/charts/${chartType}`),
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


// Add this to your existing API services
export const noRepaymentAPI = {
    getLoansWithNoRepayment: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/no-repayment?${queryString}`);
    },

    getLoanDetails: (loanId) => {
        return api.get(`/no-repayment/${loanId}`);
    },

    getAnalytics: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/no-repayment/analytics?${queryString}`);
    },

    createRecoveryAction: (loanId, data) => {
        return api.post(`/no-repayment/${loanId}/recovery-action`, data);
    },

    flagAsFraud: (loanId, data) => {
        return api.post(`/no-repayment/${loanId}/flag-fraud`, data);
    },

    generateReport: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/no-repayment/report?${queryString}`, {
            responseType: 'blob'
        });
    }
};



export const pastMaturityAPI = {
    // Get dashboard summary
    getDashboardSummary: () => api.get('/past-maturity/dashboard'),

    // Get loans by days past maturity
    getLoansByDays: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/past-maturity/loans?${queryString}`);
    },

    // Get branch summary
    getBranchSummary: () => api.get('/past-maturity/branch-summary'),

    // Get officer summary
    getOfficerSummary: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/past-maturity/officer-summary?${queryString}`);
    },

    // Get common filters
    getCommonFilters: () => api.get('/past-maturity/common-filters'),

    // Get day breakdown
    getDayBreakdown: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/past-maturity/day-breakdown?${queryString}`);
    },

    // Generate report
    generateReport: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/past-maturity/report?${queryString}`, {
            responseType: params.format === 'csv' ? 'blob' : 'json'
        });
    }
};

// Update your existing cashierAPI section (around line 340)
export const cashierAPI = {
    getTodaySummary: (params) => {
        const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/cashier/summary/today?${queryString}`);
    },
    getRecentTransactions: (params) => {
        const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/cashier/transactions/recent?${queryString}`);
    },
    getDueTodayLoans: () => api.get('/cashier/loans/due-today'),

    // ADD THESE MISSING METHODS:
    getRecentPayments: (params) => {
        const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/cashier/payments/recent?${queryString}`);
    },
    searchLoans: (params) => {
        const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = new URLSearchParams(cleanParams).toString();
        return api.get(`/cashier/loans/search?${queryString}`);
    },
    recordPayment: (data) => api.post('/cashier/payments/record', data),

    // Keep your existing methods
    processPayment: (paymentData) => api.post('/cashier/payments', paymentData),
    reversePayment: (paymentId, reason) => api.put(`/cashier/payments/${paymentId}/reverse`, { reason }),
    generateReceipt: (paymentId) => api.get(`/cashier/receipts/${paymentId}`, { responseType: 'blob' }),
    getCashCount: () => api.get('/cashier/cash-count'),
    submitCashCount: (cashCountData) => api.post('/cashier/cash-count', cashCountData),
    getDailyReport: (date) => api.get(`/cashier/reports/daily?date=${date}`),
    searchLoan: (searchTerm) => api.get(`/cashier/loans/search?q=${searchTerm}`)
};



// Loan Types API
export const loanTypesAPI = {
    getLoanTypes: (params = {}) => {


        // Clean params - remove empty strings, null, and undefined values
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});


        return api.get('/loan-types', { params: cleanParams });
    },
    createLoanType: (data) => api.post('/loan-types', data),
    getLoanType: (id) => api.get(`/loan-types/${id}`),
    updateLoanType: (id, data) => api.put(`/loan-types/${id}`, data),
    deleteLoanType: (id) => api.delete(`/loan-types/${id}`),
};


// Add this at the end of your existing api.js file, before the final export or at the very end

// Chart API - Add this section
export const chartAPI = {
    getMonthlyLoanReleases: (months = 12) => 
        api.get(`/loans/stats/monthly-releases?months=${months}`),

    getLoanStatusDistribution: () => 
        api.get('/loans/stats/status-distribution'),

    getMonthlyCollections: (months = 12) => 
        api.get(`/loans/stats/monthly-collections?months=${months}`),

    getOutstandingTrends: (months = 12) => 
        api.get(`/loans/stats/outstanding-trends?months=${months}`)
};



// Add this to your existing loanOfficerAPI section or create it if it doesn't exist
export const loanOfficerAPI = {
    getStats: () => api.get('/loan-officer/stats'),
    getLoans: (params) => api.get('/loan-officer/loans', { params }),
    getBorrowers: (params) => api.get('/loan-officer/borrowers', { params }),
    getCollections: (params) => api.get('/loan-officer/collections', { params })
};



