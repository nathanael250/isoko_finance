import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Plus,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    FileText,
    DollarSign,
    Calendar,
    User,
    Building,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { loansAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Status badge component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye },
        approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        disbursed: { color: 'bg-purple-100 text-purple-800', icon: DollarSign },
        active: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
        completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
        defaulted: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
        rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
        written_off: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {status.replace('_', ' ').toUpperCase()}
        </span>
    );
};

// Performance class badge
const PerformanceBadge = ({ performanceClass }) => {
    const performanceConfig = {
        performing: { color: 'bg-green-100 text-green-800' },
        watch: { color: 'bg-yellow-100 text-yellow-800' },
        substandard: { color: 'bg-orange-100 text-orange-800' },
        doubtful: { color: 'bg-red-100 text-red-800' },
        loss: { color: 'bg-red-200 text-red-900' }
    };

    const config = performanceConfig[performanceClass] || performanceConfig.performing;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {performanceClass?.toUpperCase() || 'PERFORMING'}
        </span>
    );
};


const LoanRow = ({ loan, onView, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return '$0';
        return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Fix: Use the correct property names from your backend response
    const appliedAmount = parseFloat(loan.applied_amount || 0);
    const approvedAmount = parseFloat(loan.approved_amount || 0);
    const principalBalance = parseFloat(loan.principal_balance || 0);
    const interestBalance = parseFloat(loan.interest_balance || 0);
    const loanBalance = parseFloat(loan.loan_balance || 0);
    const interestRate = parseFloat(loan.interest_rate || 0);

    // Calculate total due (principal + interest)
    const totalDue = principalBalance + interestBalance;

    // For now, we'll assume total paid = applied/approved - current balance
    const totalPaid = (approvedAmount || appliedAmount) - loanBalance;

    return (
        <tr className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
            {/* Loan Number - Simplified */}
            <td className="px-2 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {loan.loan_number}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.loan_account}
                </div>
            </td>

            {/* Client Name - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm font-medium text-gray-900 truncate">
                    {loan.client_name ||
                        `${loan.client_first_name || ''} ${loan.client_last_name || ''}`.trim() ||
                        'N/A'
                    }
                </div>
                <div className="text-xs text-gray-500">
                    {loan.client_number}
                </div>
            </td>

            {/* Amount - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm font-medium text-gray-900">
                    ${(approvedAmount || appliedAmount).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.status === 'pending' ? 'Applied' : 'Principal'}
                </div>
            </td>

            {/* Interest Rate - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm font-medium text-gray-900">
                    {interestRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                    {loan.loan_term_months}m
                </div>
            </td>

            {/* Total Due - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm font-medium text-gray-900">
                    ${totalDue.toLocaleString()}
                </div>
            </td>

            {/* Paid - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm font-medium text-green-600">
                    ${Math.max(0, totalPaid).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.installments_paid || 0}/{loan.total_installments || 0}
                </div>
            </td>

            {/* Balance - Compact */}
            <td className="px-2 py-3">
                <div className={`text-sm font-medium ${loanBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${loanBalance.toLocaleString()}
                </div>
            </td>

            {/* Last Payment - Compact */}
            <td className="px-2 py-3">
                <div className="text-sm text-gray-900">
                    {loan.last_payment_date ? new Date(loan.last_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.last_payment_amount ? `$${loan.last_payment_amount.toLocaleString()}` : '-'}
                </div>
            </td>

            {/* Status - Compact */}
            <td className="px-2 py-3">
                <div className="flex flex-col space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                    {loan.performance_class && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(loan.performance_class)}`}>
                            {loan.performance_class.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            </td>

            {/* Actions - Compact */}
            <td className="px-2 py-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                    <button
                        onClick={() => onView(loan)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(loan)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(loan)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};



// Helper functions for status colors
const getStatusColor = (status) => {
    const colors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'under_review': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'disbursed': 'bg-purple-100 text-purple-800',
        'active': 'bg-emerald-100 text-emerald-800',
        'completed': 'bg-gray-100 text-gray-800',
        'defaulted': 'bg-red-100 text-red-800',
        'rejected': 'bg-red-100 text-red-800',
        'written_off': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPerformanceColor = (performance) => {
    const colors = {
        'performing': 'bg-green-100 text-green-800',
        'watch': 'bg-yellow-100 text-yellow-800',
        'substandard': 'bg-orange-100 text-orange-800',
        'doubtful': 'bg-red-100 text-red-800',
        'loss': 'bg-red-200 text-red-900'
    };
    return colors[performance] || 'bg-gray-100 text-gray-800';
};



// Main component
const ViewAllLoans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLoans, setTotalLoans] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [performanceFilter, setPerformanceFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const handleView = (loan) => {
        navigate(`/dashboard/admin/loans/${loan.id}`);
    };

    // Fetch loans
    // Update the fetchLoans function in your ViewAllLoans component

    const fetchLoans = async (page = 1, filters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit: pageSize,
                search: searchTerm,
                status: statusFilter,
                performance_class: performanceFilter,
                branch: branchFilter,
                ...filters
            };

            // Remove empty parameters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await loansAPI.getLoans(params);

            if (response.data.success) {
                const { loans, pagination } = response.data.data;
                setLoans(loans);
                setTotalLoans(pagination.total);
                setTotalPages(pagination.pages);
            } else {
                throw new Error(response.data.message || 'Failed to fetch loans');
            }
        } catch (err) {
            console.error('Error fetching loans:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch loans');
            setLoans([]);
            setTotalLoans(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // Initial load
    useEffect(() => {
        fetchLoans(1);
    }, [pageSize]);

    // Handle search and filters
    const handleSearch = () => {
        setCurrentPage(1);
        fetchLoans(1);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLoans(currentPage);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchLoans(page);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPerformanceFilter('');
        setBranchFilter('');
        setCurrentPage(1);
        fetchLoans(1, {});
    };

    // Action handlers


    const handleEditLoan = (loan) => {
        console.log('Edit loan:', loan);
        // Navigate to edit loan page
        // navigate(`/dashboard/admin/loans/${loan.id}/edit`);
    };

    const handleDeleteLoan = (loan) => {
        if (window.confirm(`Are you sure you want to delete loan ${loan.loan_number}?`)) {
            console.log('Delete loan:', loan);
            // Implement delete functionality
        }
    };

    const handleExport = () => {
        console.log('Export loans data');
        // Implement export functionality
    };

    // Calculate summary statistics
    const summaryStats = {
        totalLoans: loans.length,
        totalPrincipal: loans.reduce((sum, loan) => sum + (parseFloat(loan.approved_amount) || parseFloat(loan.applied_amount) || 0), 0),
        totalPaid: loans.reduce((sum, loan) => {
            const appliedOrApproved = parseFloat(loan.approved_amount) || parseFloat(loan.applied_amount) || 0;
            const balance = parseFloat(loan.loan_balance) || 0;
            return sum + Math.max(0, appliedOrApproved - balance);
        }, 0),
        totalBalance: loans.reduce((sum, loan) => sum + (parseFloat(loan.loan_balance) || 0), 0),
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        defaultedLoans: loans.filter(loan => loan.status === 'defaulted').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading loans...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header - Matching Admin Dashboard Style */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Loans</h1>
                        <p className="text-gray-600 text-sm mt-1">Manage and monitor all loan applications</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <Link
                            to="/dashboard/admin/loans/add"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Loan
                        </Link>
                    </div>
                </div>

                {/* Summary Cards - Dashboard Style */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-gray-200 text-sm font-medium">Total Loans</h2>
                                <FileText className="p-1.5 rounded text-white w-10 h-10" />
                            </div>
                            <span className="text-2xl font-bold text-white">{summaryStats.totalLoans}</span>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-gray-200 text-sm font-medium">Total Principal</h2>
                                <DollarSign className="p-1.5 rounded text-white w-10 h-10" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                ${summaryStats.totalPrincipal.toLocaleString()}
                            </span>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-gray-200 text-sm font-medium">Total Paid</h2>
                                <CheckCircle className="p-1.5 rounded text-white w-10 h-10" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                ${summaryStats.totalPaid.toLocaleString()}
                            </span>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-red-600 shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-gray-200 text-sm font-medium">Outstanding</h2>
                                <AlertCircle className="p-1.5 rounded text-white w-10 h-10" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                ${summaryStats.totalBalance.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Search className="bg-indigo-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Search & Filters</h2>
                            </div>
                            <p className="text-gray-600 text-xs">Find and filter loans by various criteria</p>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by loan number, client name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="flex gap-3">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="disbursed">Disbursed</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="defaulted">Defaulted</option>
                                </select>

                                <select
                                    value={performanceFilter}
                                    onChange={(e) => setPerformanceFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Performance</option>
                                    <option value="performing">Performing</option>
                                    <option value="watch">Watch</option>
                                    <option value="substandard">Substandard</option>
                                    <option value="doubtful">Doubtful</option>
                                    <option value="loss">Loss</option>
                                </select>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>

                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Extended Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Branch
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter branch name"
                                            value={branchFilter}
                                            onChange={(e) => setBranchFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message - Dashboard Style */}
                {error && (
                    <div className="mb-6">
                        <div className="bg-white shadow-sm rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loans Table - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg relative overflow-hidden">
                        <div className="mb-4 p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3 mb-1">
                                <FileText className="bg-purple-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Loans List</h2>
                            </div>
                            <p className="text-gray-600 text-xs">All loan applications and their current status</p>
                        </div>
                        <div>
                            <table className="w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Loan #
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Client
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Amount
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                        Rate
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Due
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Paid
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Balance
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Last Pay
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Status
                                    </th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                    <FileText className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans found</h3>
                                                <p className="text-gray-600 mb-6 max-w-sm">
                                                    {searchTerm || statusFilter || performanceFilter || branchFilter
                                                        ? 'Try adjusting your search criteria or clear the filters'
                                                        : 'Get started by creating your first loan application'
                                                    }
                                                </p>
                                                {!searchTerm && !statusFilter && !performanceFilter && !branchFilter && (
                                                    <Link
                                                        to="/dashboard/admin/loans/add"
                                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add First Loan
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    loans.map((loan) => (
                                        <LoanRow
                                            key={loan.id}
                                            loan={loan}
                                            onView={handleView}
                                            onEdit={handleEditLoan}
                                            onDelete={handleDeleteLoan}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                        {/* Pagination - Dashboard Style */}
                        {totalPages > 1 && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {(currentPage - 1) * pageSize + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * pageSize, totalLoans)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">{totalLoans}</span>{' '}
                                        results
                                    </p>
                                    <div className="ml-4">
                                        <select
                                            value={pageSize}
                                            onChange={(e) => setPageSize(parseInt(e.target.value))}
                                            className="text-sm border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value={10}>10 per page</option>
                                            <option value={25}>25 per page</option>
                                            <option value={50}>50 per page</option>
                                            <option value={100}>100 per page</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Summary - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Target className="bg-orange-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Portfolio Performance</h2>
                            </div>
                            <p className="text-gray-600 text-xs">Loan performance classification breakdown</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {loans.filter(l => l.performance_class === 'performing').length}
                                </div>
                                <div className="text-xs text-gray-500">Performing</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {loans.filter(l => l.performance_class === 'watch').length}
                                </div>
                                <div className="text-xs text-gray-500">Watch</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {loans.filter(l => l.performance_class === 'substandard').length}
                                </div>
                                <div className="text-xs text-gray-500">Substandard</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {loans.filter(l => l.performance_class === 'doubtful').length}
                                </div>
                                <div className="text-xs text-gray-500">Doubtful</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-800">
                                    {loans.filter(l => l.performance_class === 'loss').length}
                                </div>
                                <div className="text-xs text-gray-500">Loss</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAllLoans;
