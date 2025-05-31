import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    AlertTriangle,
    Phone,
    Mail,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    User,
    FileText,
    TrendingDown,
    RefreshCw,
    Eye,
    Flag
} from 'lucide-react';
import { noRepaymentAPI } from '../../services/api';
import RecoveryActionModal from '../../components/modals/RecoveryActionModal';
import FraudFlagModal from '../../components/modals/FraudFlagModal';

const NoRepaymentLoans = () => {
    const [loans, setLoans] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        sort_by: 'disbursement_date',
        sort_order: 'DESC',
        criteria: 'no_payments_ever',
        expected_payment_days: 30,
        include_non_disbursed: 'true', // Add this parameter
        search: '',
        min_amount: '',
        max_amount: '',
        min_days_since_disbursement: '',
        max_days_since_disbursement: '',
        branch: '',
        loan_officer_id: '',
        loan_type_id: '',
        client_status: '',
        risk_category: '',
        disbursement_start: '',
        disbursement_end: '',
        check_period_start: '',
        check_period_end: ''
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // Action handlers state
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showFraudModal, setShowFraudModal] = useState(false);

    // Fetch loans with no repayment
    const fetchLoans = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError(null);

            const response = await noRepaymentAPI.getLoansWithNoRepayment(filters);

            if (response.data.success) {
                setLoans(response.data.data.loans);
                setSummary(response.data.data.summary);
                setPagination(response.data.data.pagination);

                console.log('✅ No repayment loans loaded:', {
                    count: response.data.data.loans.length,
                    total: response.data.data.pagination.total
                });
            }
        } catch (error) {
            console.error('❌ Error fetching no repayment loans:', error);
            setError(error.response?.data?.message || 'Failed to fetch loans');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchLoans();
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
        fetchLoans();
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchLoans(false);
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'RWF 0';
        return `RWF ${amount.toLocaleString()}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Get risk badge color
    const getRiskBadgeColor = (riskCategory) => {
        switch (riskCategory) {
            case 'LOW': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'NOT_DISBURSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'OVERDUE': return 'text-red-600';
            case 'DUE_TODAY': return 'text-orange-600';
            case 'NOT_YET_DUE': return 'text-green-600';
            case 'NOT_DISBURSED': return 'text-gray-600';
            case 'NO_SCHEDULE': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    // Get criteria options
    const criteriaOptions = [
        { value: 'no_payments_ever', label: 'No Payments Ever' },
        { value: 'no_payments_in_period', label: 'No Payments in Period' },
        { value: 'missed_expected_payments', label: 'Missed Expected Payments' },
        { value: 'no_payments_since_date', label: 'No Payments Since Date' },
        { value: 'payment_gap_exceeded', label: 'Payment Gap Exceeded' },
        { value: 'overdue_installments', label: 'Overdue Installments' }
    ];

    // Action handlers
    const handleViewLoan = (loanId) => {
        console.log('View loan:', loanId);
        // You can implement navigation here
        // navigate(`/loans/${loanId}`);
    };

    const handleCreateRecoveryAction = (loanId) => {
        setSelectedLoanId(loanId);
        setShowRecoveryModal(true);
    };

    const handleFlagFraud = (loanId) => {
        setSelectedLoanId(loanId);
        setShowFraudModal(true);
    };

    if (loading && loans.length === 0) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading loans with no repayment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Loans with No Repayment</h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Monitor and manage loans that haven't received any payments
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Loans</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {summary.total_loans_no_repayment}
                                    </p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Amount at Risk</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(summary.total_amount_at_risk)}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Days Since Disbursement</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {Math.round(summary.avg_days_since_disbursement || 0)}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Critical Risk</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {summary.critical_risk_count || 0}
                                    </p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Not Disbursed</p>
                                    <p className="text-2xl font-bold text-gray-600">
                                        {summary.not_disbursed_count || 0}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-gray-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Risk Distribution */}
                {summary && (
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">
                                    {summary.not_disbursed_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">Not Disbursed</div>
                                <div className="text-xs text-gray-400">
                                    {formatCurrency(summary.not_disbursed_amount || 0)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {summary.low_risk_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">Low Risk</div>
                                <div className="text-xs text-gray-400">
                                    {formatCurrency(summary.low_risk_amount || 0)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {summary.medium_risk_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">Medium Risk</div>
                                <div className="text-xs text-gray-400">
                                    {formatCurrency(summary.medium_risk_amount || 0)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {summary.high_risk_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">High Risk</div>
                                <div className="text-xs text-gray-400">
                                    {formatCurrency(summary.high_risk_amount || 0)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {summary.critical_risk_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">Critical Risk</div>
                                <div className="text-xs text-gray-400">
                                    {formatCurrency(summary.critical_risk_amount || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Criteria Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Criteria
                        </label>
                        <select
                            value={filters.criteria}
                            onChange={(e) => handleFilterChange('criteria', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {criteriaOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Loan number, client name..."
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Amount
                        </label>
                        <input
                            type="number"
                            value={filters.min_amount}
                            onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Amount
                        </label>
                        <input
                            type="number"
                            value={filters.max_amount}
                            onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                            placeholder="No limit"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Include Non-Disbursed Toggle */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeNonDisbursed"
                            checked={filters.include_non_disbursed === 'true'}
                            onChange={(e) => handleFilterChange('include_non_disbursed', e.target.checked.toString())}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="includeNonDisbursed" className="text-sm text-gray-700">
                            Include non-disbursed loans
                        </label>
                    </div>
                </div>

                {/* Date Range Filters (conditional based on criteria) */}
                {(filters.criteria === 'no_payments_in_period' || filters.criteria === 'no_payments_since_date') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Check Period Start
                            </label>
                            <input
                                type="date"
                                value={filters.check_period_start}
                                onChange={(e) => handleFilterChange('check_period_start', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {filters.criteria === 'no_payments_in_period' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Check Period End
                                </label>
                                <input
                                    type="date"
                                    value={filters.check_period_end}
                                    onChange={(e) => handleFilterChange('check_period_end', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Expected Payment Days for certain criteria */}
                {(filters.criteria === 'missed_expected_payments' || filters.criteria === 'payment_gap_exceeded') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expected Payment Days
                            </label>
                            <input
                                type="number"
                                value={filters.expected_payment_days}
                                onChange={(e) => handleFilterChange('expected_payment_days', e.target.value)}
                                placeholder="30"
                                min="1"
                                max="365"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Enhanced Loans Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Disbursement Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount & Risk
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-gray-50">
                                    {/* Loan Details */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.loan_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {loan.loan_account || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Status: <span className={`font-medium ${loan.status === 'active' ? 'text-green-600' :
                                                    loan.status === 'disbursed' ? 'text-blue-600' :
                                                        'text-yellow-600'
                                                    }`}>
                                                    {loan.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            {loan.loan_type_name && (
                                                <div className="text-xs text-gray-400">
                                                    Type: {loan.loan_type_name}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Client */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.first_name} {loan.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {loan.client_number}
                                            </div>
                                            {loan.mobile && (
                                                <div className="text-xs text-gray-400">
                                                    📞 {loan.mobile}
                                                </div>
                                            )}
                                            {loan.loan_officer_name && loan.loan_officer_name.trim() && (
                                                <div className="text-xs text-gray-400">
                                                    Officer: {loan.loan_officer_name}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Disbursement Info - Enhanced */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            {loan.disbursement_date ? (
                                                <>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        📅 {formatDate(loan.disbursement_date)}
                                                    </div>
                                                    <div className="text-sm text-blue-600">
                                                        {loan.days_since_disbursement} days ago
                                                    </div>
                                                    {loan.first_payment_date && (
                                                        <div className="text-xs text-gray-500">
                                                            First Payment: {formatDate(loan.first_payment_date)}
                                                        </div>
                                                    )}
                                                    {loan.maturity_date && (
                                                        <div className="text-xs text-gray-500">
                                                            Maturity: {formatDate(loan.maturity_date)}
                                                        </div>
                                                    )}
                                                    {loan.repayment_frequency && (
                                                        <div className="text-xs text-gray-400">
                                                            Frequency: {loan.repayment_frequency.replace('_', ' ')}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-400">
                                                    <div className="font-medium text-orange-600">⏳ Not Disbursed</div>
                                                    <div className="text-xs">Pending disbursement</div>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Amount & Risk */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.disbursed_amount ?
                                                    formatCurrency(loan.disbursed_amount) :
                                                    'Not disbursed'
                                                }
                                            </div>
                                            {loan.loan_balance && (
                                                <div className="text-sm text-gray-500">
                                                    Balance: {formatCurrency(loan.loan_balance)}
                                                </div>
                                            )}
                                            <div className="mt-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(loan.risk_category)}`}>
                                                    {loan.risk_category === 'NOT_DISBURSED' ? 'Not Disbursed' : loan.risk_category}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Payment Status - Enhanced */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className={`text-sm font-medium ${getPaymentStatusColor(loan.payment_status)}`}>
                                                {loan.payment_status?.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Payments: {loan.total_payments_made || 0}
                                            </div>
                                            {loan.total_amount_paid > 0 && (
                                                <div className="text-xs text-green-600">
                                                    Paid: {formatCurrency(loan.total_amount_paid)}
                                                </div>
                                            )}
                                            {loan.last_payment_date && (
                                                <div className="text-xs text-gray-400">
                                                    Last: {formatDate(loan.last_payment_date)}
                                                </div>
                                            )}
                                            {loan.days_past_first_payment !== null && loan.days_past_first_payment > 0 && (
                                                <div className="text-xs text-red-500">
                                                    ⚠️ {loan.days_past_first_payment} days overdue
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleViewLoan(loan.id)}
                                                className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1"
                                                title="View Details"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View Details
                                            </button>

                                            <button
                                                onClick={() => handleCreateRecoveryAction(loan.id)}
                                                className="text-green-600 hover:text-green-900 text-xs flex items-center gap-1"
                                                title="Create Recovery Action"
                                            >
                                                <Phone className="w-3 h-3" />
                                                Recovery Action
                                            </button>

                                            {loan.recovery_actions_count > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    📋 {loan.recovery_actions_count} actions
                                                </span>
                                            )}

                                            {loan.last_contact_date && (
                                                <span className="text-xs text-gray-400">
                                                    Last contact: {formatDate(loan.last_contact_date)}
                                                </span>
                                            )}

                                            {(loan.risk_category === 'CRITICAL' ||
                                                (loan.disbursement_date && loan.days_since_disbursement > 180)) && (
                                                    <button
                                                        onClick={() => handleFlagFraud(loan.id)}
                                                        className="text-red-600 hover:text-red-900 text-xs flex items-center gap-1"
                                                        title="Flag as Potential Fraud"
                                                    >
                                                        <Flag className="w-3 h-3" />
                                                        Flag Fraud
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                                disabled={pagination.page === pagination.pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>

                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(pagination.page - 1) * pagination.limit + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{pagination.total}</span>{' '}
                                    results
                                </p>
                            </div>

                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        const pageNum = Math.max(1, pagination.page - 2) + i;
                                        if (pageNum > pagination.pages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handleFilterChange('page', pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === pagination.page
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                                        disabled={pagination.page === pagination.pages}
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

            {/* Empty State */}
            {!loading && loans.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
                    <p className="text-gray-600 mb-4">
                        No loans match your current filter criteria.
                    </p>
                    <button
                        onClick={() => {
                            setFilters({
                                ...filters,
                                search: '',
                                min_amount: '',
                                max_amount: '',
                                criteria: 'no_payments_ever',
                                include_non_disbursed: 'true',
                                page: 1
                            });
                            fetchLoans();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Recovery Action Modal Placeholder */}
            {showRecoveryModal && (
                <RecoveryActionModal
                    loanId={selectedLoanId}
                    onClose={() => {
                        setShowRecoveryModal(false);
                        setSelectedLoanId(null);
                    }}
                    onSuccess={() => {
                        setShowRecoveryModal(false);
                        setSelectedLoanId(null);
                        fetchLoans(false); // Refresh data
                    }}
                />
            )}

            {/* Fraud Flag Modal Placeholder */}
            {showFraudModal && (
                <FraudFlagModal
                    loanId={selectedLoanId}
                    onClose={() => {
                        setShowFraudModal(false);
                        setSelectedLoanId(null);
                    }}
                    onSuccess={() => {
                        setShowFraudModal(false);
                        setSelectedLoanId(null);
                        fetchLoans(false); // Refresh data
                    }}
                />
            )}
        </div>
    );
};

export default NoRepaymentLoans;
