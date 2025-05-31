import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    AlertTriangle,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Phone,
    Mail,
    MapPin,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorBoundary';
import { formatCurrency, formatDate } from '../../utils/formatters';

const LoansInArrears = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loansInArrears, setLoansInArrears] = useState([]);
    const [summary, setSummary] = useState({});
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        min_days_arrears: 1,
        max_days_arrears: '',
        min_arrears_amount: '',
        max_arrears_amount: '',
        performance_class: '',
        branch: '',
        loan_officer_id: '',
        arrears_category: '',
        sort_by: 'days_in_arrears',
        sort_order: 'DESC',
        search: ''
    });

    // Fetch loans in arrears
    const fetchLoansInArrears = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(`/api/loans-in-arrears?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch loans in arrears');
            }

            const data = await response.json();

            if (data.success) {
                setLoansInArrears(data.data.loans_in_arrears);
                setSummary(data.data.summary);
                setPagination(data.data.pagination);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching loans in arrears:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoansInArrears();
    }, [filters.page, filters.limit, filters.sort_by, filters.sort_order]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
    };

    // Handle search
    const handleSearch = () => {
        fetchLoansInArrears();
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Get risk level color
    const getRiskLevelColor = (category) => {
        switch (category) {
            case 'early_arrears': return 'text-yellow-600 bg-yellow-100';
            case 'moderate_arrears': return 'text-orange-600 bg-orange-100';
            case 'serious_arrears': return 'text-red-600 bg-red-100';
            case 'critical_arrears': return 'text-red-800 bg-red-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Get performance class color
    const getPerformanceClassColor = (performanceClass) => {
        switch (performanceClass) {
            case 'performing': return 'text-green-600 bg-green-100';
            case 'watch': return 'text-yellow-600 bg-yellow-100';
            case 'substandard': return 'text-orange-600 bg-orange-100';
            case 'doubtful': return 'text-red-600 bg-red-100';
            case 'loss': return 'text-red-800 bg-red-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Get recovery priority color
    const getRecoveryPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'urgent': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading && loansInArrears.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Loans in Arrears</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage overdue loan payments</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchLoansInArrears}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Loans in Arrears</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary.total_loans_in_arrears?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Arrears Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(summary.total_arrears_amount || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Affected Clients</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary.affected_clients?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avg Days in Arrears</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round(summary.avg_days_in_arrears || 0)} days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
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
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Arrears Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrears Category
                        </label>
                        <select
                            value={filters.arrears_category}
                            onChange={(e) => handleFilterChange('arrears_category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="early_arrears">Early Arrears (1-30 days)</option>
                            <option value="moderate_arrears">Moderate Arrears (31-90 days)</option>
                            <option value="serious_arrears">Serious Arrears (91-180 days)</option>
                            <option value="critical_arrears">Critical Arrears (180+ days)</option>
                        </select>
                    </div>

                    {/* Performance Class */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Performance Class
                        </label>
                        <select
                            value={filters.performance_class}
                            onChange={(e) => handleFilterChange('performance_class', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Classes</option>
                            <option value="performing">Performing</option>
                            <option value="watch">Watch</option>
                            <option value="substandard">Substandard</option>
                            <option value="doubtful">Doubtful</option>
                            <option value="loss">Loss</option>
                        </select>
                    </div>

                    {/* Branch */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Branch
                        </label>
                        <input
                            type="text"
                            placeholder="Branch name"
                            value={filters.branch}
                            onChange={(e) => handleFilterChange('branch', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Min Days in Arrears */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Days in Arrears
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={filters.min_days_arrears}
                            onChange={(e) => handleFilterChange('min_days_arrears', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Max Days in Arrears */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Days in Arrears
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="No limit"
                            value={filters.max_days_arrears}
                            onChange={(e) => handleFilterChange('max_days_arrears', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Min Arrears Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Arrears Amount
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={filters.min_arrears_amount}
                            onChange={(e) => handleFilterChange('min_arrears_amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Search Button */}
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

            {/* Loans Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Loans in Arrears ({pagination.total_records?.toLocaleString() || 0})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Arrears Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance & Risk
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recovery Actions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loansInArrears.map((loan) => (
                                <tr key={loan.loan_id} className="hover:bg-gray-50">
                                    {/* Loan Details */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.loan_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Account: {loan.loan_account}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Balance: {formatCurrency(loan.loan_balance)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Branch: {loan.branch || 'N/A'}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Client Information */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.client_name}
                                            </div>
                                            {loan.client_mobile && (
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {loan.client_mobile}
                                                </div>
                                            )}
                                            {loan.client_email && (
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {loan.client_email}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                Officer: {loan.loan_officer || 'Unassigned'}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Arrears Information */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-red-600">
                                                {formatCurrency(loan.total_arrears_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Principal: {formatCurrency(loan.arrears_principal)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Interest: {formatCurrency(loan.arrears_interest)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Penalties: {formatCurrency(loan.penalty_amount)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.days_in_arrears} days overdue
                                            </div>
                                            {loan.arrears_start_date && (
                                                <div className="text-sm text-gray-500">
                                                    Since: {formatDate(loan.arrears_start_date)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Performance & Risk */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-2">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceClassColor(loan.performance_class)}`}>
                                                {loan.performance_class?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(loan.arrears_category)}`}>
                                                    {loan.arrears_category?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecoveryPriorityColor(loan.recovery_priority)}`}>
                                                    {loan.recovery_priority?.toUpperCase()} PRIORITY
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Recovery Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">
                                                Actions: {loan.recovery_actions_count || 0}
                                            </div>
                                            {loan.last_recovery_action_date && (
                                                <div className="text-sm text-gray-500">
                                                    Last: {formatDate(loan.last_recovery_action_date)}
                                                </div>
                                            )}
                                            {loan.next_recovery_action_date && (
                                                <div className="text-sm text-blue-600">
                                                    Next: {formatDate(loan.next_recovery_action_date)}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                Status: {loan.recovery_status || 'Pending'}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewLoanDetails(loan.loan_id)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCreateRecoveryAction(loan.loan_id)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Create Recovery Action"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} of{' '}
                                {pagination.total_records} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page <= 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                                    const pageNum = pagination.current_page - 2 + i;
                                    if (pageNum < 1 || pageNum > pagination.total_pages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 border rounded-md text-sm ${pageNum === pagination.current_page
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page >= pagination.total_pages}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {!loading && loansInArrears.length === 0 && (
                <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No loans in arrears found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or check back later.
                    </p>
                </div>
            )}
        </div>
    );

    // Handler functions
    function handleViewLoanDetails(loanId) {
        // Navigate to loan details page or open modal
        window.open(`/dashboard/loans/${loanId}`, '_blank');
    }

    function handleCreateRecoveryAction(loanId) {
        // Open recovery action modal or navigate to recovery action page
        console.log('Create recovery action for loan:', loanId);
        // You can implement a modal or navigate to a dedicated page
    }
};

export default LoansInArrears;
