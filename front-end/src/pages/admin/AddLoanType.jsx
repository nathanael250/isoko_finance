import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TagIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { loanTypesAPI } from '../../services/api';

const AddLoanType = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: '',
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
        setError(null);
        setSuccess(null);

        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);

        try {
            // Convert string numbers to actual numbers
            const processedData = {
                ...formData,
                interest_rate: parseFloat(formData.interest_rate),
                min_amount: parseFloat(formData.min_amount),
                max_amount: parseFloat(formData.max_amount),
                min_term: parseInt(formData.min_term),
                max_term: parseInt(formData.max_term),
                processing_fee_percentage: formData.processing_fee_percentage ? parseFloat(formData.processing_fee_percentage) : null,
                processing_fee_fixed: formData.processing_fee_fixed ? parseFloat(formData.processing_fee_fixed) : null,
                late_payment_penalty: formData.late_payment_penalty ? parseFloat(formData.late_payment_penalty) : null,
                early_payment_penalty: formData.early_payment_penalty ? parseFloat(formData.early_payment_penalty) : null,
                min_credit_score: formData.min_credit_score ? parseInt(formData.min_credit_score) : null,
                max_debt_to_income_ratio: formData.max_debt_to_income_ratio ? parseFloat(formData.max_debt_to_income_ratio) : null
            };

            console.log('Submitting loan type data:', processedData);
            const response = await loanTypesAPI.createLoanType(processedData);

            if (response.data.success) {
                setSuccess('Loan type created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/admin/loan-types');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to create loan type');
            }
        } catch (err) {
            console.error('Error creating loan type:', err);
            setError(err.response?.data?.message || 'Failed to create loan type. Please try again.');
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <TagIcon className="w-8 h-8 text-indigo-600" />
                                Add New Loan Type
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Configure a new loan product with specific terms and conditions
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
                                    Error creating loan type
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <TagIcon className="w-5 h-5 text-indigo-600" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Loan Type Name *
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Loan Type Code
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., PL001, BL001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Category</option>
                                    <option value="personal">Personal</option>
                                    <option value="business">Business</option>
                                    <option value="mortgage">Mortgage</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="education">Education</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Describe the loan type and its purpose"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Terms */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Financial Terms
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Interest Rate (%) *
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Amount (RWF) *
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(formData.min_amount)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Maximum Amount (RWF) *
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(formData.max_amount)}
                                    </p>
                                )}
                            </div>

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
                            </div>
                        </div>
                    </div>

                    {/* Fees and Penalties */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Fees and Penalties
                        </h2>

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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(formData.processing_fee_fixed)}
                                    </p>
                                )}
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
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Requirements & Eligibility
                        </h2>

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
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="collateral_required"
                                    checked={formData.collateral_required}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Collateral Required
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
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Guarantor Required
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Active (Available for new loans)
                                </label>
                            </div>

                            <div className="flex items-center">
                                                                <input
                                    type="checkbox"
                                    name="is_visible_to_clients"
                                    checked={formData.is_visible_to_clients}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Visible to Clients (Show in client portal)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Additional Information
                        </h2>

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
                                    placeholder="List the eligibility criteria for this loan type..."
                                />
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
                                    placeholder="List the required documents for this loan type..."
                                />
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
                                    placeholder="Enter the terms and conditions for this loan type..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {(formData.name || formData.interest_rate || formData.min_amount || formData.max_amount) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                {formData.name && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Name:</span>
                                        <p className="text-blue-700 dark:text-blue-300">{formData.name}</p>
                                    </div>
                                )}
                                {formData.category && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Category:</span>
                                        <p className="text-blue-700 dark:text-blue-300 capitalize">{formData.category}</p>
                                    </div>
                                )}
                                {formData.interest_rate && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Interest Rate:</span>
                                        <p className="text-blue-700 dark:text-blue-300">{formData.interest_rate}%</p>
                                    </div>
                                )}
                                {(formData.min_amount && formData.max_amount) && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Amount Range:</span>
                                        <p className="text-blue-700 dark:text-blue-300">
                                            {formatCurrency(formData.min_amount)} - {formatCurrency(formData.max_amount)}
                                        </p>
                                    </div>
                                )}
                                {(formData.min_term && formData.max_term) && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Term Range:</span>
                                        <p className="text-blue-700 dark:text-blue-300">
                                            {formData.min_term} - {formData.max_term} months
                                        </p>
                                    </div>
                                )}
                                {formData.processing_fee_percentage && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Processing Fee:</span>
                                        <p className="text-blue-700 dark:text-blue-300">{formData.processing_fee_percentage}%</p>
                                    </div>
                                )}
                                {formData.collateral_required && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Collateral:</span>
                                        <p className="text-blue-700 dark:text-blue-300">Required</p>
                                    </div>
                                )}
                                {formData.guarantor_required && (
                                    <div>
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Guarantor:</span>
                                        <p className="text-blue-700 dark:text-blue-300">Required</p>
                                    </div>
                                )}
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
                                    Creating Loan Type...
                                </>
                            ) : (
                                <>
                                    <TagIcon className="w-4 h-4" />
                                    Create Loan Type
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoanType;
