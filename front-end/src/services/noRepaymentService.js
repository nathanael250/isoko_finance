import api from './api';

export const noRepaymentAPI = {
    getLoansWithNoRepayment: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return api.get('/no-repayment', { params: cleanParams });
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
        return api.get('/no-repayment/analytics', { params: cleanParams });
    },
    
    createRecoveryAction: (loanId, actionData) => {
        return api.post(`/no-repayment/${loanId}/recovery-action`, actionData);
    },
    
    flagAsFraud: (loanId, fraudData) => {
        return api.post(`/no-repayment/${loanId}/flag-fraud`, fraudData);
    },
    
    generateReport: (params) => {
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        
        if (params.format === 'csv' || params.format === 'excel') {
            return api.get('/no-repayment/report', { 
                params: cleanParams,
                responseType: 'blob'
            });
        }
        
        return api.get('/no-repayment/report', { params: cleanParams });
    }
};
