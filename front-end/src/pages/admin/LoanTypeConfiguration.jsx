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
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <span className="text-gray-600 font-medium">Loading configuration...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Advanced Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 border border-gray-100 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard/admin/loan-types')}
                                className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 bg-white border border-gray-200"
                                disabled={loading}
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
                                        <Cog6ToothIcon className="w-8 h-8 text-white" />
                                    </div>
                                    {id ? 'Configure Loan Product' : 'Create New Loan Product'}
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    {id ? 'Update loan product settings and terms' : 'Set up a new loan product with custom terms and conditions'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-lg">
                        <div className="flex">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-bold text-green-800">
                                    {success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-lg">
                        <div className="flex">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-bold text-red-800">
                                    Error {id ? 'updating' : 'creating'} loan type
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Configuration Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/20 to-indigo-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
                                    <TagIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Basic Configuration
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Configure the basic information for this loan product
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Loan Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., Personal Loan, Business Loan"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Product Code
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., PL001, BL001"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Describe the loan product and its purpose"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="personal">Personal Loan</option>
                                        <option value="business">Business Loan</option>
                                        <option value="mortgage">Mortgage</option>
                                        <option value="vehicle">Vehicle Loan</option>
                                        <option value="education">Education Loan</option>
                                        <option value="emergency">Emergency Loan</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interest Rate & Terms Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/20 to-green-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Interest Rate & Terms
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Set the interest rates and loan terms
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Annual Interest Rate (%) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="interest_rate"
                                            value={formData.interest_rate}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            placeholder="15.50"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Minimum Amount (RWF) *
                                    </label>
                                    <input
                                        type="number"
                                        name="min_amount"
                                        value={formData.min_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="100000"
                                        required
                                    />
                                    {formData.min_amount && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatCurrency(formData.min_amount)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Maximum Amount (RWF) *
                                    </label>
                                    <input
                                        type="number"
                                        name="max_amount"
                                        value={formData.max_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="5000000"
                                        required
                                    />
                                    {formData.max_amount && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatCurrency(formData.max_amount)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Minimum Term (Months) *
                                    </label>
                                    <input
                                        type="number"
                                        name="min_term"
                                        value={formData.min_term}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="6"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Maximum Term (Months) *
                                    </label>
                                    <input
                                        type="number"
                                        name="max_term"
                                        value={formData.max_term}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="60"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fees & Penalties Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-100/20 to-yellow-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Fees & Penalties
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Configure processing fees and penalty charges
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Processing Fee (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="processing_fee_percentage"
                                            value={formData.processing_fee_percentage}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                            placeholder="2.5"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Processing Fee (Fixed Amount)
                                    </label>
                                    <input
                                        type="number"
                                        name="processing_fee_fixed"
                                        value={formData.processing_fee_fixed}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                        placeholder="50000"
                                    />
                                    {formData.processing_fee_fixed && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatCurrency(formData.processing_fee_fixed)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Late Payment Penalty (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="late_payment_penalty"
                                            value={formData.late_payment_penalty}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                            placeholder="5.0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Early Payment Penalty (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="early_payment_penalty"
                                            value={formData.early_payment_penalty}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                            placeholder="1.0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/20 to-purple-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Loan Requirements
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Set eligibility criteria and requirements
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Minimum Credit Score
                                    </label>
                                    <input
                                        type="number"
                                        name="min_credit_score"
                                        value={formData.min_credit_score}
                                        onChange={handleInputChange}
                                        min="300"
                                        max="850"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="650"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Max Debt-to-Income Ratio (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="max_debt_to_income_ratio"
                                            value={formData.max_debt_to_income_ratio}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                            placeholder="40"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                            <input
                                                type="checkbox"
                                                name="collateral_required"
                                                id="collateral_required"
                                                checked={formData.collateral_required}
                                                onChange={handleInputChange}
                                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="collateral_required" className="ml-3 text-sm font-bold text-blue-800">
                                                Collateral Required
                                            </label>
                                        </div>

                                        <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                            <input
                                                type="checkbox"
                                                name="guarantor_required"
                                                id="guarantor_required"
                                                checked={formData.guarantor_required}
                                                onChange={handleInputChange}
                                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="guarantor_required" className="ml-3 text-sm font-bold text-green-800">
                                                Guarantor Required
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Visibility Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Status & Visibility
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Control product availability and visibility
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-3 text-sm font-bold text-green-800">
                                        Product is Active
                                    </label>
                                </div>

                                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                    <input
                                        type="checkbox"
                                        name="is_visible_to_clients"
                                        id="is_visible_to_clients"
                                        checked={formData.is_visible_to_clients}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_visible_to_clients" className="ml-3 text-sm font-bold text-blue-800">
                                        Visible to Clients
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documentation Configuration */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/20 to-orange-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Documentation & Terms
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Define terms, conditions, and required documents
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Terms and Conditions
                                    </label>
                                    <textarea
                                        name="terms_and_conditions"
                                        value={formData.terms_and_conditions}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter the terms and conditions for this loan product..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Eligibility Criteria
                                    </label>
                                    <textarea
                                        name="eligibility_criteria"
                                        value={formData.eligibility_criteria}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Define who is eligible for this loan product..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Required Documents
                                    </label>
                                    <textarea
                                        name="required_documents"
                                        value={formData.required_documents}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        placeholder="List the documents required for loan application..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/admin/loan-types')}
                                                                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        {id ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {id ? 'Update Loan Product' : 'Create Loan Product'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Configuration Preview */}
                {(formData.name || formData.interest_rate || formData.min_amount || formData.max_amount) && (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/20 to-indigo-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Configuration Preview
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Preview of your loan product configuration
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {formData.name && (
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <TagIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Product Name</p>
                                                <p className="text-sm font-bold text-blue-800">{formData.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.interest_rate && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500 rounded-lg">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Interest Rate</p>
                                                <p className="text-sm font-bold text-green-800">{formData.interest_rate}% per annum</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(formData.min_amount || formData.max_amount) && (
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-lg">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Amount Range</p>
                                                <p className="text-sm font-bold text-purple-800">
                                                    {formData.min_amount ? formatCurrency(formData.min_amount) : 'Min not set'} - {formData.max_amount ? formatCurrency(formData.max_amount) : 'Max not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(formData.min_term || formData.max_term) && (
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500 rounded-lg">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Term Range</p>
                                                <p className="text-sm font-bold text-orange-800">
                                                    {formData.min_term || 'Min not set'} - {formData.max_term || 'Max not set'} months
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.category && (
                                    <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-pink-500 rounded-lg">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-pink-600 uppercase tracking-wide">Category</p>
                                                <p className="text-sm font-bold text-pink-800 capitalize">{formData.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-500 rounded-lg">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${formData.is_active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                    {formData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${formData.is_visible_to_clients ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                                                    {formData.is_visible_to_clients ? 'Public' : 'Internal'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanTypeConfiguration;
