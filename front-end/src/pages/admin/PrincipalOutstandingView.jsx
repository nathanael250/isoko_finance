import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Calendar,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Filter,
    Download,
    Eye,
    Search,
    RefreshCw,
    Users,
    Building
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorBoundary';

const PrincipalOutstandingView = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loans, setLoans] = useState([]);
    const [dashboardSummary, setDashboardSummary] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const [filters, setFilters] = useState({
        status: '',
        riskCategory: '',
        performanceStatus: '',
        branch: '',
        officer: '',
        minAmount: '',
        maxAmount: '',
        search: '',
        limit: 50,
        offset: 0,
        sortBy: 'principal_balance',
        sortOrder: 'DESC'
    });
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
        pages: 1
    });

    // Fetch dashboard summary
    const fetchDashboardSummary = async () => {
        try {
            const response = await fetch('/api/principal-outstanding/dashboard-summary', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard summary');
            }

            const data = await response.json();
            if (data.success) {
                setDashboardSummary(data.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard summary:', err);
        }
    };

    // Fetch filter options
    const fetchFilterOptions = async () => {
        try {
            const response = await fetch('/api/principal-outstanding/filter-options', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch filter options');
            }

            const data = await response.json();
            if (data.success) {
                setFilterOptions(data.data);
            }
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    };

    // Fetch principal outstanding data
    const fetchPrincipalData = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(`/api/principal-outstanding?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch principal outstanding data');
            }

            const data = await response.json();

            if (data.success) {
                setLoans(data.data.loans);
                setPagination(data.data.pagination);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching principal data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardSummary();
        fetchFilterOptions();
        fetchPrincipalData();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            offset: 0 // Reset to first page when filters change
        }));
    };

    const handleSearch = () => {
        fetchPrincipalData();
    };

    const handlePageChange = (newOffset) => {
        setFilters(prev => ({ ...prev, offset: newOffset }));
        setTimeout(() => fetchPrincipalData(), 100);
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined && key !== 'limit' && key !== 'offset') {
                queryParams.append(key, value);
            }
        });
        queryParams.append('format', 'csv');

        window.open(`/api/principal-outstanding/export?${queryParams}`, '_blank');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'disbursed': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'defaulted': return 'bg-red-100 text-red-800';
            case 'past_maturity': return 'bg-orange-100 text-orange-800';
            case 'in_arrears': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getRiskCategoryColor = (riskCategory) => {
        switch (riskCategory?.toLowerCase()) {
            case 'low_risk': return 'bg-green-100 text-green-800';
            case 'medium_risk': return 'bg-yellow-100 text-yellow-800';
            case 'high_risk': return 'bg-orange-100 text-orange-800';
            case 'critical_risk': return 'bg-red-100 text-red-800';
            case 'fully_paid': return 'bg-blue-100 text-blue-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPerformanceStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'on_track': return 'bg-green-100 text-green-800';
            case 'slightly_behind': return 'bg-yellow-100 text-yellow-800';
            case 'moderately_behind': return 'bg-orange-100 text-orange-800';
            case 'significantly_behind': return 'bg-red-100 text-red-800';
            case 'critically_behind': return 'bg-red-200 text-red-900';
            case 'no_payment_due': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Principal Outstanding</h2>
                    <p className="text-gray-600">Monitor loan principal balances and payment performance</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchPrincipalData}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Dashboard Summary Cards */}
            {dashboardSummary.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(dashboardSummary.summary.total_principal_outstanding || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(dashboardSummary.summary.total_principal_paid || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Due Till Today</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(dashboardSummary.summary.total_due_till_today || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(dashboardSummary.summary.total_overdue || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Category Summary */}
            {dashboardSummary.riskBreakdown && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Category Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {Object.entries(dashboardSummary.riskBreakdown).map(([risk, data]) => (
                            <div key={risk} className="text-center">
                                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskCategoryColor(risk)}`}>
                                    {risk.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="mt-2">
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(data.amount)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {data.count} loans
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Loan number, client name..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            {filterOptions.statuses?.map(status => (
                                <option key={status} value={status}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Risk Category
                        </label>
                        <select
                            value={filters.riskCategory}
                            onChange={(e) => handleFilterChange('riskCategory', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Risk Categories</option>
                            {filterOptions.riskCategories?.map(risk => (
                                <option key={risk} value={risk}>
                                    {risk.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Performance Status
                        </label>
                        <select
                            value={filters.performanceStatus}
                            onChange={(e) => handleFilterChange('performanceStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Performance</option>
                            {filterOptions.performanceStatuses?.map(status => (
                                <option key={status} value={status}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Second row of filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Branch
                        </label>
                        <select
                            value={filters.branch}
                            onChange={(e) => handleFilterChange('branch', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Branches</option>
                            {filterOptions.branches?.map(branch => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Officer
                        </label>
                        <select
                            value={filters.officer}
                            onChange={(e) => handleFilterChange('officer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Officers</option>
                            {filterOptions.officers?.map(officer => (
                                <option key={officer.id} value={officer.id}>
                                    {officer.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Amount
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.minAmount}
                            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Amount
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.maxAmount}
                            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Principal Outstanding Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Principal Outstanding Details ({pagination.total?.toLocaleString() || 0} loans)
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    View/Name/Loan#
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Released/Maturity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Paid
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Due Till Today
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Paid Till Today
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Balance Till Today
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try adjusting your search criteria.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                loans.map((loan) => (
                                    <tr key={loan.loan_id} className="hover:bg-gray-50">
                                        {/* View/Name/Loan# */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleViewLoan(loan.loan_id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {loan.client_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {loan.loan_number}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {loan.loan_account}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Released/Maturity */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="text-gray-900">
                                                    <span className="font-medium">Released:</span>
                                                    <br />
                                                    {formatDate(loan.disbursement_date)}
                                                </div>
                                                <div className="text-gray-900 mt-1">
                                                    <span className="font-medium">Maturity:</span>
                                                    <br />
                                                    {formatDate(loan.maturity_date)}
                                                </div>
                                                {loan.days_to_maturity !== undefined && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {loan.days_to_maturity > 0
                                                            ? `${loan.days_to_maturity} days to maturity`
                                                            : `${Math.abs(loan.days_to_maturity)} days overdue`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Principal */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(loan.disbursed_amount)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Original Amount
                                            </div>
                                        </td>

                                        {/* Principal Paid */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">
                                                {formatCurrency(loan.principal_paid)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {loan.disbursed_amount > 0 ?
                                                    `${((loan.principal_paid / loan.disbursed_amount) * 100).toFixed(1)}%` :
                                                    '0%'
                                                }
                                            </div>
                                        </td>

                                        {/* Principal Balance */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-blue-600">
                                                {formatCurrency(loan.principal_balance)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Remaining
                                            </div>
                                        </td>

                                        {/* Principal Due Till Today */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-orange-600">
                                                {formatCurrency(loan.principal_due_till_today)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Expected
                                            </div>
                                        </td>

                                        {/* Principal Paid Till Today */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">
                                                {formatCurrency(loan.principal_paid_till_today)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Actual
                                            </div>
                                        </td>

                                        {/* Principal Balance Till Today */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${loan.principal_balance_till_today > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {formatCurrency(loan.principal_balance_till_today)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {loan.principal_balance_till_today > 0 ? 'Overdue' : 'Current'}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                                                    {loan.status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                                {loan.risk_category && (
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskCategoryColor(loan.risk_category)}`}>
                                                        {loan.risk_category?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                                {loan.performance_status && (
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceStatusColor(loan.performance_status)}`}>
                                                        {loan.performance_status?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > filters.limit && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                                disabled={filters.offset <= 0}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(filters.offset + filters.limit)}
                                disabled={filters.offset + filters.limit >= pagination.total}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{filters.offset + 1}</span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(filters.offset + filters.limit, pagination.total)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{pagination.total}</span>{' '}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                                        disabled={filters.offset <= 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, Math.ceil(pagination.total / filters.limit)) }, (_, i) => {
                                        const pageOffset = Math.max(0, Math.floor(filters.offset / filters.limit) - 2) * filters.limit + i * filters.limit;
                                        const pageNumber = Math.floor(pageOffset / filters.limit) + 1;
                                        const totalPages = Math.ceil(pagination.total / filters.limit);

                                        if (pageNumber <= totalPages) {
                                            return (
                                                <button
                                                    key={pageOffset}
                                                    onClick={() => handlePageChange(pageOffset)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageOffset === filters.offset
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(filters.offset + filters.limit)}
                                        disabled={filters.offset + filters.limit >= pagination.total}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Additional Analytics Section */}
            {dashboardSummary.performanceBreakdown && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Status Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {Object.entries(dashboardSummary.performanceBreakdown).map(([status, data]) => (
                            <div key={status} className="text-center">
                                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPerformanceStatusColor(status)}`}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="mt-2">
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(data.amount)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {data.count} loans
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Helper functions
    function handleViewLoan(loanId) {
        // Navigate to loan details
        window.open(`/dashboard/loans/${loanId}`, '_blank');
    }
};

export default PrincipalOutstandingView;
