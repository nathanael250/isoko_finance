import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    FileText, Search, Plus, Eye, Edit, Trash2, DollarSign, Calendar, TrendingUp,
    RefreshCw, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { loansAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorBoundary';

// Reuse the same components from ViewAllLoans
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
        if (!amount || isNaN(amount)) return '$0.00';
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

    // Use the correct property names from backend response
    const appliedAmount = parseFloat(loan.applied_amount || 0);
    const approvedAmount = parseFloat(loan.approved_amount || 0);
    const disbursedAmount = parseFloat(loan.disbursed_amount || 0);
    const interestRate = parseFloat(loan.interest_rate || 0);
    
    // Use calculated fields from backend
    const totalDue = parseFloat(loan.total_due || 0);
    const totalPaid = parseFloat(loan.total_paid || 0);
    const balance = parseFloat(loan.balance || loan.loan_balance || 0);
    const lastPaymentAmount = parseFloat(loan.last_payment_amount || 0);

    // Determine which amount to show as principal based on loan status
    const principalAmount = disbursedAmount > 0 ? disbursedAmount : 
                           (approvedAmount > 0 ? approvedAmount : appliedAmount);

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {/* Loan Number */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {loan.loan_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {loan.loan_account}
                        </div>
                    </div>
                </div>
            </td>

            {/* Client Name */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {`${loan.client_first_name || ''} ${loan.client_last_name || ''}`.trim() || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {loan.client_number}
                </div>
            </td>

            {/* Principal Amount */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(principalAmount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {loan.status === 'pending' ? 'Applied' : 
                     loan.status === 'approved' ? 'Approved' :
                     loan.status === 'disbursed' || loan.status === 'active' ? 'Disbursed' : 'Principal'}
                </div>
            </td>

            {/* Interest Rate */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {interestRate > 0 ? `${interestRate.toFixed(2)}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {loan.interest_rate_method?.replace('_', ' ') || 'reducing balance'}
                </div>
            </td>

            {/* Total Due */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totalDue)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                {loan.loan_term_months ? `${loan.loan_term_months} months` : 'N/A'}
                </div>
            </td>

            {/* Total Paid */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-600">
                    {formatCurrency(Math.max(0, totalPaid))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {loan.installments_paid || 0}/{loan.total_installments || 0} payments
                </div>
            </td>

            {/* Outstanding Balance */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(balance)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {loan.days_in_arrears > 0 ? `${loan.days_in_arrears} days overdue` : 'Current'}
                </div>
            </td>

            {/* Last Payment */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                    {loan.last_payment_date ? formatDate(loan.last_payment_date) : 'No payments'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {lastPaymentAmount > 0 ? formatCurrency(lastPaymentAmount) : '-'}
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                    <StatusBadge status={loan.status} />
                    {loan.performance_class && (
                        <PerformanceBadge performanceClass={loan.performance_class} />
                    )}
                    {loan.days_in_arrears > 0 && (
                        <span className="text-xs text-red-600 font-medium">
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
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(loan)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                        title="Edit Loan"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(loan)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Delete Loan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const MyLoans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLoans, setTotalLoans] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const [filters, setFilters] = useState({
        status: '',
        loan_type_id: '',
        min_amount: '',
        max_amount: '',
        sort_by: 'created_at',
        sort_order: 'DESC'
    });

    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        console.log('useEffect triggered, user:', user);
        if (user?.id) {
            console.log('Fetching loans for user ID:', user.id);
            fetchMyLoans();
        } else {
            console.error('No user ID found in user object:', user);
            setError('User ID not found. Please log in again.');
            setLoading(false);
        }
    }, [user, filters, currentPage, pageSize, searchTerm]);

    const fetchMyLoans = async () => {
        console.log('fetchMyLoans called');
        setLoading(true);
        setError(null);
        try {
            const queryParams = {
                ...filters,
                search: searchTerm,
                page: currentPage,
                limit: pageSize
            };
            
            // Remove empty parameters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });
            
            console.log('Making API call with params:', queryParams);

            const response = await loansAPI.getMyLoans(queryParams);
            console.log('API Response:', response);
            
            if (response.data.success) {
                const { loans, pagination } = response.data.data;
                console.log('Loans received:', loans);
                console.log('Pagination received:', pagination);
                
                setLoans(loans || []);
                setTotalLoans(pagination.total);
                setTotalPages(pagination.pages);
            } else {
                setError(response.data.message || 'Failed to fetch loans.');
            }
        } catch (err) {
            console.error('Error in fetchMyLoans:', err);
            setError(err.response?.data?.message || 'Failed to load loans. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('Filter changed:', name, value);
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePageChange = (newPage) => {
        console.log('Page changed to:', newPage);
        setCurrentPage(newPage);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchMyLoans();
    };

    const handleView = (loan) => {
        navigate(`/dashboard/loans/${loan.id}`);
    };

    const handleEdit = (loan) => {
        navigate(`/dashboard/loan-officer/loans/${loan.id}/edit`);
    };

    const handleDelete = (loan) => {
        if (window.confirm(`Are you sure you want to delete loan ${loan.loan_number}?`)) {
            console.log('Delete loan:', loan);
            // Implement delete functionality
        }
    };

    // Calculate summary statistics
    const summaryStats = {
        totalLoans: loans.length,
        totalPrincipal: loans.reduce((sum, loan) => sum + (parseFloat(loan.disbursed_amount || loan.approved_amount || loan.applied_amount) || 0), 0),
        totalPaid: loans.reduce((sum, loan) => sum + (parseFloat(loan.total_paid) || 0), 0),
        totalBalance: loans.reduce((sum, loan) => sum + (parseFloat(loan.balance || loan.loan_balance) || 0), 0),
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        defaultedLoans: loans.filter(loan => loan.status === 'defaulted').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'IN_REVIEW':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchMyLoans} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Loans</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage and monitor your assigned loan applications
                        </p>
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
                        <Link
                            to="/dashboard/loan-officer/loans/add"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Loan
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">My Loans</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summaryStats.totalLoans}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Principal</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    ${summaryStats.totalPrincipal.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Loans</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {summaryStats.activeLoans}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    ${summaryStats.totalBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by loan number, client name..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="flex gap-3">
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>

                                <select
                                    name="sort_by"
                                    value={filters.sort_by}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="created_at">Sort by Date</option>
                                    <option value="loan_number">Loan Number</option>
                                    <option value="applied_amount">Amount</option>
                                    <option value="status">Status</option>
                                </select>

                                <select
                                    name="sort_order"
                                    value={filters.sort_order}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="DESC">Newest First</option>
                                    <option value="ASC">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loans Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Loan #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Client Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Principal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Interest Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total Due
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Last Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No loans found</h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                    {searchTerm || filters.status
                                                        ? 'Try adjusting your search criteria'
                                                        : 'You haven\'t been assigned any loans yet'
                                                    }
                                                </p>
                                                {!searchTerm && !filters.status && (
                                                    <Link
                                                        to="/dashboard/loan-officer/loans/add"
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
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
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
                                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
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
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
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
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Performance Summary for Loan Officer */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">My Portfolio Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {loans.filter(l => l.status === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {loans.filter(l => l.status === 'active').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {loans.filter(l => l.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {loans.filter(l => l.status === 'defaulted' || l.days_in_arrears > 0).length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">At Risk</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLoans;
 