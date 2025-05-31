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
    XCircle
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

    // Use the calculated values from backend
    const principal = parseFloat(loan.principal || 0);
    const totalDue = parseFloat(loan.total_due || 0);
    const totalPaid = parseFloat(loan.total_paid || 0);
    const balance = parseFloat(loan.balance || 0);
    const interestRate = parseFloat(loan.nominal_interest_rate || 0);

    return (
        <tr className="hover:bg-gray-50 border-b border-gray-200">
            {/* Loan Number */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {loan.loan_number}
                        </div>
                        <div className="text-xs text-gray-500">
                            {loan.loan_account}
                        </div>
                    </div>
                </div>
            </td>

            {/* Client Name */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {loan.client_name ||
                        `${loan.client_first_name || ''} ${loan.client_last_name || ''}`.trim() ||
                        'N/A'
                    }
                </div>
                <div className="text-sm text-gray-500">
                    {loan.client_number}
                </div>
            </td>

            {/* Principal */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(principal)}
                </div>
                <div className="text-xs text-gray-500">
                    Principal Amount
                </div>
            </td>

            {/* Interest Rate */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {interestRate.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">
                    {loan.interest_calculation_method || 'reducing_balance'}
                </div>
            </td>

            {/* Total Due */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalDue)}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.loan_term_months} months
                </div>
            </td>

            {/* Paid */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-600">
                    {formatCurrency(totalPaid)}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.installments_paid || 0}/{loan.total_installments || 0} payments
                </div>
            </td>

            {/* Balance */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(balance)}
                </div>
                <div className="text-xs text-gray-500">
                    Outstanding
                </div>
            </td>

            {/* Last Payment */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {loan.last_payment_date ? formatDate(loan.last_payment_date) : 'No payments'}
                </div>
                <div className="text-xs text-gray-500">
                    {loan.last_payment_amount ? formatCurrency(loan.last_payment_amount) : '-'}
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                        {loan.status}
                    </span>
                    {loan.performance_class && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(loan.performance_class)}`}>
                            {loan.performance_class}
                        </span>
                    )}
                    {loan.days_in_arrears > 0 && (
                        <span className="text-xs text-red-600">
                            {loan.days_in_arrears} days overdue
                        </span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => onView(loan)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(loan)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Edit Loan"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(loan)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Loan"
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
        totalPrincipal: loans.reduce((sum, loan) => sum + (loan.principal || loan.disbursed_amount || 0), 0),
        totalPaid: loans.reduce((sum, loan) => sum + (loan.total_paid || 0), 0),
        totalBalance: loans.reduce((sum, loan) => sum + (loan.balance || 0), 0),
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        defaultedLoans: loans.filter(loan => loan.status === 'defaulted').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading loans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Loans</h1>
                        <p className="text-gray-600 mt-2">Manage and monitor all loan applications</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <Link
                            to="/dashboard/admin/loans/add"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Loan
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                                <p className="text-2xl font-semibold text-gray-900">{summaryStats.totalLoans}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Principal</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    ${summaryStats.totalPrincipal.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    ${summaryStats.totalPaid.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    ${summaryStats.totalBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-6 border-b border-gray-200">
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
                                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>

                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loans Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Principal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Due
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
                                                <p className="text-gray-500 mb-4">
                                                    {searchTerm || statusFilter || performanceFilter || branchFilter
                                                        ? 'Try adjusting your search criteria'
                                                        : 'Get started by creating your first loan application'
                                                    }
                                                </p>
                                                {!searchTerm && !statusFilter && !performanceFilter && !branchFilter && (
                                                    <Link
                                                        to="/dashboard/admin/loans/add"
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
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
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Performance Summary */}
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {loans.filter(l => l.performance_class === 'performing').length}
                            </div>
                            <div className="text-sm text-gray-500">Performing</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {loans.filter(l => l.performance_class === 'watch').length}
                            </div>
                            <div className="text-sm text-gray-500">Watch</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {loans.filter(l => l.performance_class === 'substandard').length}
                            </div>
                            <div className="text-sm text-gray-500">Substandard</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {loans.filter(l => l.performance_class === 'doubtful').length}
                            </div>
                            <div className="text-sm text-gray-500">Doubtful</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-800">
                                {loans.filter(l => l.performance_class === 'loss').length}
                            </div>
                            <div className="text-sm text-gray-500">Loss</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAllLoans;
