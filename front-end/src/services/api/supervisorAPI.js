import axios from 'axios';
import { API_BASE_URL } from './config';

const supervisorAPI = {
  // Team Overview
  getTeamMembers: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/team/members`);
  },

  getTeamStats: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/team/stats`);
  },

  // Performance Metrics
  getOverallMetrics: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/metrics/overall`);
  },

  getPerformanceTrends: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/metrics/trends`);
  },

  getTeamPerformance: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/metrics/team-performance`);
  },

  getMonthlyStats: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/metrics/monthly`);
  },

  // Dashboard Data
  getDashboardData: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/dashboard`);
  },

  // Loan Management
  getPendingLoans: () => {
    return axios.get(`${API_BASE_URL}/api/supervisor/loans/pending`);
  },

  approveLoan: (loanId, data) => {
    return axios.post(`${API_BASE_URL}/api/supervisor/loans/${loanId}/approve`, data);
  },

  rejectLoan: (loanId, data) => {
    return axios.post(`${API_BASE_URL}/api/supervisor/loans/${loanId}/reject`, data);
  },

  // Team Management
  assignLoan: (loanId, agentId) => {
    return axios.post(`${API_BASE_URL}/api/supervisor/loans/${loanId}/assign`, { agentId });
  },

  getAgentPerformance: (agentId) => {
    return axios.get(`${API_BASE_URL}/api/supervisor/agents/${agentId}/performance`);
  },

  // Reports
  generateTeamReport: (params) => {
    return axios.get(`${API_BASE_URL}/api/supervisor/reports/team`, { params });
  },

  generatePerformanceReport: (params) => {
    return axios.get(`${API_BASE_URL}/api/supervisor/reports/performance`, { params });
  },
};

export default supervisorAPI; 