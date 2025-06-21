import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanTypesAPI } from '../../services/api';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    ClockIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LoanTypeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loanType, setLoanType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchLoanTypeDetails();
        }
    }, [id]);

    const fetchLoanTypeDetails = async () => {
        try {
            setLoading(true);
            const response = await loanTypesAPI.getLoanType(id);
            if (response.data.success) {
                setLoanType(response.data.data.loan_type);
            } else {
                setError('Failed to load loan type details');
            }
        } catch (err) {
            console.error('Error fetching loan type details:', err);
            setError('Failed to load loan type details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            const response = await loanTypesAPI.deleteLoanType(id);
            if (response.data.success) {
                navigate('/dashboard/admin/loan-types');
            } else {
                setError('Failed to delete loan type');
            }
        } catch (err) {
            console.error('Error deleting loan type:', err);
            setError('Failed to delete loan type');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatPercentage = (rate) => {
        if (!rate) return 'N/A';

        // Convert to number if it's a string
        const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;

        // If rate seems to be already in percentage format (typically 0.1 to 100)
        // Most interest rates are between 0.1% and 100%
        if (numRate >= 0.001 && numRate <= 100) {
            return `${numRate.toFixed(2)}%`;
        }
        // If rate seems to be in decimal format (0.0001 to 1.0)
        else if (numRate > 0 && numRate < 1) {
            return `${(numRate * 100).toFixed(2)}%`;
        }
        // For very large numbers, assume it's already been converted incorrectly
        else if (numRate > 100) {
            return `${(numRate / 100).toFixed(2)}%`;
        }

        return `${numRate.toFixed(2)}%`;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !loanType) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                                    Error Loading Loan Type
                                </h3>
                                <p className="text-red-600 dark:text-red-300 mt-1">
                                    {error || 'Loan type not found'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/dashboard/admin/loan-types')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back to Loan Types
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/dashboard/admin/loan-types')}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {loanType.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                {loanType.code && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Code: {loanType.code}
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loanType.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                    {loanType.is_active ? (
                                        <>
                                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="w-3 h-3 mr-1" />
                                            Inactive
                                        </>
                                    )}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loanType.is_visible_to_clients
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                    }`}>
                                    {loanType.is_visible_to_clients ? 'Visible to Clients' : 'Hidden from Clients'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/dashboard/admin/loan-types/${id}/edit`)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Product Information
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Product Name
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">{loanType.name}</p>
                                </div>

                                {loanType.code && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Product Code
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">{loanType.code}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Category
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white capitalize">
                                        {loanType.category?.replace('_', ' ') || 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Currency
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">{loanType.currency || 'RWF'}</p>
                                </div>
                            </div>

                            {loanType.description && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Description
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{loanType.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Financial Terms */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Financial Terms
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Interest Rate
                                    </label>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatPercentage(loanType.nominal_interest_rate)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per annum</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Loan Amount Range
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(loanType.min_amount)} - {formatCurrency(loanType.max_amount)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Term Range
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {loanType.min_term_months} - {loanType.max_term_months} months
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Default Frequency
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                        {loanType.default_frequency?.replace('_', ' ') || 'Monthly'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fees & Charges */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Fees & Charges
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loanType.application_fee_rate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Application Fee (Percentage)
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {formatPercentage(loanType.application_fee_rate)}
                                        </p>
                                    </div>
                                )}

                                {loanType.application_fee_fixed && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Application Fee (Fixed)
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {formatCurrency(loanType.application_fee_fixed)}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Cost of Funds
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">
                                        {formatPercentage(loanType.cost_of_funds)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Operating Cost
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">
                                        {formatPercentage(loanType.operating_cost)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Risk Percentage
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">
                                        {formatPercentage(loanType.risk_percentage)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Profit Margin
                                    </label>
                                    <p className="text-lg text-gray-900 dark:text-white">
                                        {formatPercentage(loanType.profit_margin)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Requirements
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${loanType.requires_collateral
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        {loanType.requires_collateral ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <XCircleIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Collateral Required</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {loanType.requires_collateral ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${loanType.requires_guarantor
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        {loanType.requires_guarantor ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <XCircleIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Guarantor Required</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {loanType.requires_guarantor ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loanType.eligibility_criteria && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Eligibility Criteria
                                    </label>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                            {loanType.eligibility_criteria}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {loanType.required_documents && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Required Documents
                                    </label>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                            {loanType.required_documents}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        {loanType.terms_and_conditions && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                        <DocumentTextIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Terms & Conditions
                                    </h2>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {loanType.terms_and_conditions}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary & Stats */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Quick Summary
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatPercentage(loanType.nominal_interest_rate)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Min Amount</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(loanType.min_amount)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Max Amount</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(loanType.max_amount)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Term Range</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {loanType.min_term_months}-{loanType.max_term_months} months
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loanType.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                        {loanType.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Allowed Frequencies */}
                        {loanType.allowed_frequencies && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Payment Frequencies
                                    </h2>
                                </div>

                                <div className="space-y-2">
                                    {(() => {
                                        // Handle different data types for allowed_frequencies
                                        let frequencies = [];

                                        if (Array.isArray(loanType.allowed_frequencies)) {
                                            frequencies = loanType.allowed_frequencies;
                                        } else if (typeof loanType.allowed_frequencies === 'string') {
                                            try {
                                                // Try to parse if it's a JSON string
                                                frequencies = JSON.parse(loanType.allowed_frequencies);
                                            } catch (e) {
                                                // If not JSON, split by comma
                                                frequencies = loanType.allowed_frequencies.split(',').map(f => f.trim());
                                            }
                                        } else {
                                            // Default frequencies if data is not in expected format
                                            frequencies = ['monthly'];
                                        }

                                        return frequencies.map((frequency, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-900 dark:text-white capitalize">
                                                    {frequency.replace('_', ' ')}
                                                </span>
                                                {frequency === loanType.default_frequency && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}


                        {/* Timestamps */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                System Information
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Created Date
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {loanType.created_at ? new Date(loanType.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Last Updated
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {loanType.updated_at ? new Date(loanType.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </p>
                                </div>

                                {loanType.created_by && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Created By
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {loanType.created_by}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Usage Statistics (if available) */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <UserGroupIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Usage Statistics
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {loanType.total_loans || 0}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Total Loans Created
                                    </div>
                                </div>

                                <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {loanType.active_loans || 0}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Active Loans
                                    </div>
                                </div>

                                <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(loanType.total_disbursed || 0)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Total Disbursed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Loan Type
                            </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{loanType.name}"? This action cannot be undone.
                            {loanType.total_loans > 0 && (
                                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                    Warning: This loan type has {loanType.total_loans} associated loans.
                                </span>
                            )}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Deleting...
                                    </div>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanTypeDetails;
