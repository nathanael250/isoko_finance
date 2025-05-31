import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Calendar,
    DollarSign,
    Phone,
    Mail,
    User,
    Building,
    Clock,
    TrendingDown,
    FileText,
    Plus,
    Edit,
    CheckCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const LoanArrearsDetails = ({ loanId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loanDetails, setLoanDetails] = useState(null);
    const [recoveryActions, setRecoveryActions] = useState([]);
    const [showCreateAction, setShowCreateAction] = useState(false);

    // Fetch loan arrears details
    const fetchLoanDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/loans-in-arrears/${loanId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch loan details');
            }

            const data = await response.json();

            if (data.success) {
                setLoanDetails(data.data.loan_details);
                setRecoveryActions(data.data.recovery_actions || []);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching loan details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loanId) {
            fetchLoanDetails();
        }
    }, [loanId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!loanDetails) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Loan Arrears Details - {loanDetails.loan_number}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {loanDetails.days_in_arrears} days in arrears
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">Total Arrears</p>
                                    <p className="text-2xl font-bold text-red-900">
                                        {formatCurrency(loanDetails.total_arrears_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center">
                                <Clock className="w-8 h-8 text-orange-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-orange-800">Days Overdue</p>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {loanDetails.days_in_arrears}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center">
                                <DollarSign className="w-8 h-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-800">Loan Balance</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {formatCurrency(loanDetails.loan_balance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Loan Information */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Loan Number:</span>
                                    <span className="text-sm font-medium">{loanDetails.loan_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Account:</span>
                                    <span className="text-sm font-medium">{loanDetails.loan_account}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Disbursed Amount:</span>
                                    <span className="text-sm font-medium">{formatCurrency(loanDetails.disbursed_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Interest Rate:</span>
                                    <span className="text-sm font-medium">{loanDetails.nominal_interest_rate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Maturity Date:</span>
                                    <span className="text-sm font-medium">{formatDate(loanDetails.maturity_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Performance Class:</span>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPerformanceClassColor(loanDetails.performance_class)}`}>
                                        {loanDetails.performance_class?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Branch:</span>
                                    <span className="text-sm font-medium">{loanDetails.branch || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm font-medium">{loanDetails.client_name}</span>
                                </div>
                                {loanDetails.client_mobile && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm">{loanDetails.client_mobile}</span>
                                    </div>
                                )}
                                {loanDetails.client_email && (
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm">{loanDetails.client_email}</span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm">Loan Officer: {loanDetails.loan_officer || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arrears Breakdown */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Arrears Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-600">Principal Arrears</p>
                                <p className="text-xl font-bold text-red-600">
                                    {formatCurrency(loanDetails.arrears_principal)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">Interest Arrears</p>
                                <p className="text-xl font-bold text-orange-600">
                                    {formatCurrency(loanDetails.arrears_interest)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-600">Penalty Amount</p>
                                <p className="text-xl font-bold text-yellow-600">
                                    {formatCurrency(loanDetails.penalty_amount)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Outstanding</p>
                                <p className="text-xl font-bold text-purple-600">
                                    {formatCurrency(loanDetails.total_arrears_amount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Actions */}
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Recovery Actions</h3>
                            <button
                                onClick={() => setShowCreateAction(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Action
                            </button>
                        </div>

                        {recoveryActions.length > 0 ? (
                            <div className="space-y-4">
                                {recoveryActions.map((action) => (
                                    <div key={action.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(action.action_type)}`}>
                                                        {action.action_type?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionStatusColor(action.status)}`}>
                                                        {action.status?.toUpperCase()}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(action.priority)}`}>
                                                        {action.priority?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 mb-2">{action.notes}</p>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <div>Created: {formatDate(action.created_at)} by {action.created_by_name}</div>
                                                    {action.scheduled_date && (
                                                        <div>Scheduled: {formatDate(action.scheduled_date)}</div>
                                                    )}
                                                    {action.completed_date && (
                                                        <div>Completed: {formatDate(action.completed_date)}</div>
                                                    )}
                                                    {action.next_action_date && (
                                                        <div>Next Action: {formatDate(action.next_action_date)}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditAction(action.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {action.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleCompleteAction(action.id)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No recovery actions</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Start by creating a recovery action for this loan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Recovery Action Modal */}
                {showCreateAction && (
                    <CreateRecoveryActionModal
                        loanId={loanId}
                        onClose={() => setShowCreateAction(false)}
                        onSuccess={() => {
                            setShowCreateAction(false);
                            fetchLoanDetails();
                        }}
                    />
                )}
            </div>
        </div>
    );

    // Helper functions for styling
    function getPerformanceClassColor(performanceClass) {
        switch (performanceClass) {
            case 'performing': return 'text-green-600 bg-green-100';
            case 'watch': return 'text-yellow-600 bg-yellow-100';
            case 'substandard': return 'text-orange-600 bg-orange-100';
            case 'doubtful': return 'text-red-600 bg-red-100';
            case 'loss': return 'text-red-800 bg-red-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    function getActionTypeColor(actionType) {
        switch (actionType) {
            case 'phone_call': return 'text-blue-600 bg-blue-100';
            case 'sms': return 'text-green-600 bg-green-100';
            case 'email': return 'text-purple-600 bg-purple-100';
            case 'visit': return 'text-orange-600 bg-orange-100';
            case 'letter': return 'text-gray-600 bg-gray-100';
            case 'legal_notice': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    function getActionStatusColor(status) {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    function getPriorityColor(priority) {
        switch (priority) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'urgent': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    // Handler functions
    function handleEditAction(actionId) {
        console.log('Edit action:', actionId);
        // Implement edit action functionality
    }

    function handleCompleteAction(actionId) {
        console.log('Complete action:', actionId);
        // Implement complete action functionality
    }
};

export default LoanArrearsDetails;
