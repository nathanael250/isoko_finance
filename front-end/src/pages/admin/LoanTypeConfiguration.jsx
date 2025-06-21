import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, TagIcon, Cog6ToothIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { loanTypesAPI } from '../../services/api';

const LoanTypeConfiguration = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: 'loan',
        interest_rate: '',
        min_amount: '',
        max_amount: '',
        min_term: '',
        max_term: '',
        processing_fee_percentage: '',
        processing_fee_fixed: '',
        late_payment_penalty: '',
        early_payment_penalty: '',
        collateral_required: false,
        guarantor_required: false,
        min_credit_score: '',
        max_debt_to_income_ratio: '',
        is_active: true,
        is_visible_to_clients: true,
        terms_and_conditions: '',
        eligibility_criteria: '',
        required_documents: ''
    });

    useEffect(() => {
        if (id) {
            fetchLoanType();
        } else {
            setFetchLoading(false);
        }
    }, [id]);

    const fetchLoanType = async () => {
        try {
            setFetchLoading(true);
            const response = await loanTypesAPI.getLoanType(id);

            if (response.data.success) {
                const loanType = response.data.data;
                setFormData({
                    name: loanType.name || '',
                    code: loanType.code || '',
                    description: loanType.description || '',
                    category: loanType.category || 'loan',
                    interest_rate: loanType.interest_rate || '',
                    min_amount: loanType.min_amount || '',
                    max_amount: loanType.max_amount || '',
                    min_term: loanType.min_term || '',
                    max_term: loanType.max_term || '',
                    processing_fee_percentage: loanType.processing_fee_percentage || '',
                    processing_fee_fixed: loanType.processing_fee_fixed || '',
                    late_payment_penalty: loanType.late_payment_penalty || '',
                    early_payment_penalty: loanType.early_payment_penalty || '',
                    collateral_required: loanType.collateral_required || false,
                    guarantor_required: loanType.guarantor_required || false,
                    min_credit_score: loanType.min_credit_score || '',
                    max_debt_to_income_ratio: loanType.max_debt_to_income_ratio || '',
                    is_active: loanType.is_active !== undefined ? loanType.is_active : true,
                    is_visible_to_clients: loanType.is_visible_to_clients !== undefined ? loanType.is_visible_to_clients : true,
                    terms_and_conditions: loanType.terms_and_conditions || '',
                    eligibility_criteria: loanType.eligibility_criteria || '',
                    required_documents: loanType.required_documents || ''
                });
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching loan type:', err);
            setError('Failed to fetch loan type configuration');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.name.trim()) errors.push('Loan type name is required');
        if (!formData.category) errors.push('Category is required');
        if (!formData.interest_rate || parseFloat(formData.interest_rate) <= 0) {
            errors.push('Valid interest rate is required');
        }
        if (!formData.min_amount || parseFloat(formData.min_amount) <= 0) {
            errors.push('Valid minimum amount is required');
        }
        if (!formData.max_amount || parseFloat(formData.max_amount) <= 0) {
            errors.push('Valid maximum amount is required');
        }
        if (parseFloat(formData.min_amount) >= parseFloat(formData.max_amount)) {
            errors.push('Maximum amount must be greater than minimum amount');
        }
        if (!formData.min_term || parseInt(formData.min_term) <= 0) {
            errors.push('Valid minimum term is required');
        }
        if (!formData.max_term || parseInt(formData.max_term) <= 0) {
            errors.push('Valid maximum term is required');
        }
        if (parseInt(formData.min_term) >= parseInt(formData.max_term)) {
            errors.push('Maximum term must be greater than minimum term');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Prepare data according to backend validation schema
            const processedData = {
                name: formData.name.trim(),
                code: formData.code.trim() || undefined,
                description: formData.description.trim() || undefined,
                category: formData.category,
                
                // Interest rate components (backend expects these as decimals, not percentages)
                cost_of_funds: 0.01, // Default 1%
                operating_cost: 0.0083, // Default 0.83%
                risk_percentage: 0.0083, // Default 0.83%
                profit_margin: 0.0123, // Default 1.23%
                
                // Convert to proper types for backend validation
                nominal_interest_rate: parseFloat(formData.interest_rate),
                min_amount: parseFloat(formData.min_amount),
                max_amount: parseFloat(formData.max_amount),
                min_term_months: parseInt(formData.min_term),
                max_term_months: parseInt(formData.max_term),
                
                // Fee configuration
                application_fee_type: formData.processing_fee_percentage ? 'percentage' : 'fixed_amount',
                application_fee_rate: formData.processing_fee_percentage ? parseFloat(formData.processing_fee_percentage) / 100 : undefined,
                application_fee_fixed: formData.processing_fee_fixed ? parseFloat(formData.processing_fee_fixed) : undefined,
                
                // Late payment fee
                late_payment_fee_rate: formData.late_payment_penalty ? parseFloat(formData.late_payment_penalty) / 100 : undefined,
                
                // Requirements
                requires_collateral: formData.collateral_required,
                requires_guarantor: formData.guarantor_required,
                min_collateral_ratio: formData.collateral_required ? 1.0 : undefined,
                
                // Status
                is_active: formData.is_active,
                is_visible_to_clients: formData.is_visible_to_clients,
                
                // Documentation
                special_conditions: formData.terms_and_conditions.trim() || undefined,
                documentation_required: formData.required_documents.trim() ? [formData.required_documents.trim()] : undefined
            };

            // Remove undefined values
            Object.keys(processedData).forEach(key => {
                if (processedData[key] === undefined) {
                    delete processedData[key];
                }
            });

            console.log('Sending data to backend:', processedData);

            let response;
            if (id) {
                response = await loanTypesAPI.updateLoanType(id, processedData);
            } else {
                response = await loanTypesAPI.createLoanType(processedData);
            }

            if (response.data.success) {
                setSuccess(id ? 'Loan type updated successfully!' : 'Loan type created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/admin/loan-types');
                }, 2000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error saving loan type configuration:', err);
            setError(err.response?.data?.message || 'Failed to save loan type configuration');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount || 0);
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/dashboard/admin/loan-types')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Cog6ToothIcon className="w-8 h-8 text-indigo-600" />
                                {id ? 'Configure Loan Product' : 'Create New Loan Product'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {id ? 'Update loan product settings and terms' : 'Set up a new loan product with custom terms and conditions'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error {id ? 'updating' : 'creating'} loan type
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Configuration Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                <TagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Basic Configuration
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Configure the basic information for this loan product
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Loan Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., Personal Loan, Business Loan"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This name will be displayed to clients and staff</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Code
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., PL001, BL001"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique identifier for internal use</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="loan">Loan Products</option>
                                    <option value="guarantee">Guarantee Products</option>
                                    <option value="finance">Finance Products</option>
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Categorizes the loan for reporting and filtering</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Describe the loan product and its purpose"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Brief description of the loan product for marketing and documentation</p>
                            </div>
                        </div>
                    </div>

                    {/* Interest Rate Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Interest Rate Configuration
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Set the interest rate and calculation method
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Annual Interest Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    name="interest_rate"
                                    value={formData.interest_rate}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 12.5"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual percentage rate charged on the loan</p>
                            </div>

                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Interest Rate Information</h4>
                                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                    <p>• Interest is calculated annually and applied to monthly payments</p>
                                    <p>• Rate applies to the outstanding principal balance</p>
                                    <p>• Changes to this rate will only affect new loans</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Amount Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Loan Amount Configuration
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Define the minimum and maximum loan amounts
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Loan Amount (RWF) *
                                </label>
                                <input
                                    type="number"
                                    name="min_amount"
                                    value={formData.min_amount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 100000"
                                />
                                {formData.min_amount && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {formatCurrency(formData.min_amount)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Maximum Loan Amount (RWF) *
                                </label>
                                <input
                                    type="number"
                                    name="max_amount"
                                    value={formData.max_amount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 5000000"
                                />
                                {formData.max_amount && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {formatCurrency(formData.max_amount)}
                                    </p>
                                )}
                            </div>

                            {(formData.min_amount && formData.max_amount) && (
                                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Amount Range Summary</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Clients can apply for loans between <span className="font-semibold">{formatCurrency(formData.min_amount)}</span> and <span className="font-semibold">{formatCurrency(formData.max_amount)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Loan Term Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Loan Term Configuration
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Set the repayment period options
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Term (Months) *
                                </label>
                                <input
                                    type="number"
                                    name="min_term"
                                    value={formData.min_term}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 6"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shortest repayment period allowed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Maximum Term (Months) *
                                </label>
                                <input
                                    type="number"
                                    name="max_term"
                                    value={formData.max_term}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 60"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Longest repayment period allowed</p>
                            </div>

                            {(formData.min_term && formData.max_term) && (
                                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Term Range Summary</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Repayment period: <span className="font-semibold">{formData.min_term} to {formData.max_term} months</span>
                                        {formData.min_term && formData.max_term && (
                                            <span className="ml-2 text-gray-500">
                                                ({Math.round(formData.min_term / 12 * 10) / 10} - {Math.round(formData.max_term / 12 * 10) / 10} years)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fees Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Fees & Penalties Configuration
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Configure processing fees and penalty charges
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Processing Fee (%)
                                </label>
                                <input
                                    type="number"
                                    name="processing_fee_percentage"
                                    value={formData.processing_fee_percentage}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 2.5"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Percentage of loan amount charged as processing fee</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Processing Fee (Fixed Amount)
                                </label>
                                <input
                                    type="number"
                                    name="processing_fee_fixed"
                                    value={formData.processing_fee_fixed}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 50000"
                                />
                                {formData.processing_fee_fixed && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {formatCurrency(formData.processing_fee_fixed)}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fixed amount charged regardless of loan size</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Late Payment Penalty (%)
                                </label>
                                <input
                                    type="number"
                                    name="late_payment_penalty"
                                    value={formData.late_payment_penalty}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 5.0"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Penalty rate for overdue payments</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Early Payment Penalty (%)
                                </label>
                                <input
                                    type="number"
                                    name="early_payment_penalty"
                                    value={formData.early_payment_penalty}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 1.0"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Penalty for paying off loan early</p>
                            </div>

                            <div className="md:col-span-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">Fee Configuration Notes</h4>
                                <div className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                                    <p>• If both percentage and fixed processing fees are set, the higher amount will be applied</p>
                                    <p>• Late payment penalties are calculated on overdue amounts</p>
                                    <p>• Early payment penalties help recover lost interest income</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Requirements */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Eligibility Requirements
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Set qualification criteria and security requirements
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Credit Score
                                </label>
                                <input
                                    type="number"
                                    name="min_credit_score"
                                    value={formData.min_credit_score}
                                    onChange={handleInputChange}
                                    min="300"
                                    max="850"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 650"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum credit score required for approval</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Max Debt-to-Income Ratio (%)
                                </label>
                                <input
                                    type="number"
                                    name="max_debt_to_income_ratio"
                                    value={formData.max_debt_to_income_ratio}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., 40"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum allowed debt-to-income ratio</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="collateral_required"
                                        checked={formData.collateral_required}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Collateral Required</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Borrower must provide collateral security</p>
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="guarantor_required"
                                        checked={formData.guarantor_required}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Guarantor Required</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Borrower must provide a guarantor</p>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Security Requirements</h4>
                                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    {formData.collateral_required && <p>✓ Collateral security required</p>}
                                    {formData.guarantor_required && <p>✓ Guarantor required</p>}
                                    {formData.min_credit_score && <p>✓ Minimum credit score: {formData.min_credit_score}</p>}
                                    {formData.max_debt_to_income_ratio && <p>✓ Max debt-to-income: {formData.max_debt_to_income_ratio}%</p>}
                                    {!formData.collateral_required && !formData.guarantor_required && !formData.min_credit_score && !formData.max_debt_to_income_ratio && (
                                        <p className="text-gray-500">No specific requirements set</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Product Settings
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Configure availability and visibility settings
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Product Status
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Enable or disable this loan product
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {formData.is_active ? 'Active' : 'Inactive'}
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Client Visibility
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Show this product to clients
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_visible_to_clients"
                                            checked={formData.is_visible_to_clients}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {formData.is_visible_to_clients ? 'Visible' : 'Hidden'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Status Information</h4>
                                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Product is {formData.is_active ? 'active and available for new loans' : 'inactive and not available'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.is_visible_to_clients ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                        <span>Product is {formData.is_visible_to_clients ? 'visible to clients' : 'hidden from clients'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Documentation & Requirements
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Define eligibility criteria, required documents, and terms
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Eligibility Criteria
                                </label>
                                <textarea
                                    name="eligibility_criteria"
                                    value={formData.eligibility_criteria}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="List the eligibility criteria for this loan product (e.g., minimum age, employment status, income requirements, etc.)"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Detailed eligibility requirements for loan officers and clients</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Required Documents
                                </label>
                                <textarea
                                    name="required_documents"
                                    value={formData.required_documents}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="List all required documents (e.g., National ID, Proof of income, Bank statements, etc.)"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Documents that must be submitted with loan applications</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Terms and Conditions
                                </label>
                                <textarea
                                    name="terms_and_conditions"
                                    value={formData.terms_and_conditions}
                                    onChange={handleInputChange}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter the detailed terms and conditions for this loan product..."
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Legal terms and conditions that apply to this loan product</p>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Summary */}
                    {(formData.name && formData.interest_rate && formData.min_amount && formData.max_amount) && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                                    Configuration Preview
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
                                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                                        <p><span className="font-medium">Name:</span> {formData.name}</p>
                                        {formData.code && <p><span className="font-medium">Code:</span> {formData.code}</p>}
                                        {formData.category && <p><span className="font-medium">Category:</span> {formData.category}</p>}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Financial Terms</h4>
                                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                                        <p><span className="font-medium">Interest Rate:</span> {formData.interest_rate}%</p>
                                        <p><span className="font-medium">Amount:</span> {formatCurrency(formData.min_amount)} - {formatCurrency(formData.max_amount)}</p>
                                        <p><span className="font-medium">Term:</span> {formData.min_term} - {formData.max_term} months</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status & Requirements</h4>
                                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                                        <p><span className="font-medium">Status:</span> {formData.is_active ? 'Active' : 'Inactive'}</p>
                                        <p><span className="font-medium">Visibility:</span> {formData.is_visible_to_clients ? 'Visible' : 'Hidden'}</p>
                                        {(formData.collateral_required || formData.guarantor_required) && (
                                            <p><span className="font-medium">Security:</span>
                                                {formData.collateral_required && ' Collateral'}
                                                {formData.collateral_required && formData.guarantor_required && ','}
                                                {formData.guarantor_required && ' Guarantor'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/admin/loan-types')}
                            disabled={loading}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {id ? 'Updating Configuration...' : 'Creating Loan Product...'}
                                </>
                            ) : (
                                <>
                                    <Cog6ToothIcon className="w-4 h-4" />
                                    {id ? 'Update Configuration' : 'Create Loan Product'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanTypeConfiguration;
