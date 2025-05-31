import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Save,
    Search,
    User,
    DollarSign,
    Calendar,
    FileText,
    Calculator,
    Shield,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { loansAPI, clientsAPI } from '../../services/api';

const AddLoan = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [loanTypes, setLoanTypes] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedLoanType, setSelectedLoanType] = useState(null);
    const [calculatedDetails, setCalculatedDetails] = useState(null);
    const [errors, setErrors] = useState({});

    // Form data
    const [formData, setFormData] = useState({
        // Step 1: Client Selection
        client_id: '',

        // Step 2: Loan Details
        loan_type_id: '',
        applied_amount: '',
        loan_purpose: '',
        economic_sector: 'other',

        // Step 3: Terms
        loan_term_months: '',
        repayment_frequency: 'monthly',

        // Step 4: Security/Collateral
        security_type: 'none',
        collateral_description: '',
        collateral_value: '',

        // Step 5: Additional Info
        branch: '',
        notes: ''
    });

    // Sample data for development
    const sampleClients = [
        {
            id: 1,
            client_number: 'CLT001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@email.com',
            mobile: '+250788123456',
            status: 'active'
        },
        {
            id: 2,
            client_number: 'CLT002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@email.com',
            mobile: '+250788654321',
            status: 'active'
        }
    ];

    const sampleLoanTypes = [
        {
            id: 1,
            name: 'Personal Loan',
            code: 'PERSONAL',
            nominal_interest_rate: 15.0,
            min_amount: 50000,
            max_amount: 5000000,
            min_term_months: 3,
            max_term_months: 36,
            allowed_frequencies: ['monthly', 'bi_weekly'],
            default_frequency: 'monthly'
        },
        {
            id: 2,
            name: 'Business Loan',
            code: 'BUSINESS',
            nominal_interest_rate: 12.0,
            min_amount: 100000,
            max_amount: 10000000,
            min_term_months: 6,
            max_term_months: 60,
            allowed_frequencies: ['monthly', 'quarterly'],
            default_frequency: 'monthly'
        }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Try to fetch real data, fallback to sample data
            const [clientsResponse, loanTypesResponse] = await Promise.allSettled([
                clientsAPI.getClients({ status: 'active', limit: 100 }),
                loanTypesAPI.getLoanTypes({ is_active: true })
            ]);

            if (clientsResponse.status === 'fulfilled') {
                setClients(clientsResponse.value.data.clients || clientsResponse.value.data);
            } else {
                setClients(sampleClients);
            }

            if (loanTypesResponse.status === 'fulfilled') {
                setLoanTypes(loanTypesResponse.value.data.loanTypes || loanTypesResponse.value.data);
            } else {
                setLoanTypes(sampleLoanTypes);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setClients(sampleClients);
            setLoanTypes(sampleLoanTypes);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.client_id) {
                    newErrors.client_id = 'Please select a client';
                }
                break;

            case 2:
                if (!formData.loan_type_id) {
                    newErrors.loan_type_id = 'Please select a loan type';
                }
                if (!formData.applied_amount) {
                    newErrors.applied_amount = 'Please enter loan amount';
                } else if (selectedLoanType) {
                    const amount = parseFloat(formData.applied_amount);
                    if (amount < selectedLoanType.min_amount) {
                        newErrors.applied_amount = `Minimum amount is ${selectedLoanType.min_amount.toLocaleString()}`;
                    }
                    if (amount > selectedLoanType.max_amount) {
                        newErrors.applied_amount = `Maximum amount is ${selectedLoanType.max_amount.toLocaleString()}`;
                    }
                }
                if (!formData.loan_purpose) {
                    newErrors.loan_purpose = 'Please describe the loan purpose';
                }
                break;

            case 3:
                if (!formData.loan_term_months) {
                    newErrors.loan_term_months = 'Please enter loan term';
                } else if (selectedLoanType) {
                    const term = parseInt(formData.loan_term_months);
                    if (term < selectedLoanType.min_term_months) {
                        newErrors.loan_term_months = `Minimum term is ${selectedLoanType.min_term_months} months`;
                    }
                    if (term > selectedLoanType.max_term_months) {
                        newErrors.loan_term_months = `Maximum term is ${selectedLoanType.max_term_months} months`;
                    }
                }
                break;

            case 4:
                if (formData.security_type !== 'none' && !formData.collateral_description) {
                    newErrors.collateral_description = 'Please describe the collateral';
                }
                if (formData.security_type !== 'none' && !formData.collateral_value) {
                    newErrors.collateral_value = 'Please enter collateral value';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (validateStep(currentStep)) {
            if (currentStep === 3) {
                // Calculate loan details before moving to step 4
                await calculateLoanDetails();
            }
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const calculateLoanDetails = async () => {
        try {
            setLoading(true);
            const calculationData = {
                loan_type_id: formData.loan_type_id,
                amount: parseFloat(formData.applied_amount),
                term_months: parseInt(formData.loan_term_months),
                frequency: formData.repayment_frequency
            };

            // Try to calculate with API, fallback to manual calculation
            try {
                const response = await loansAPI.calculateLoanDetails(calculationData);
                setCalculatedDetails(response.data);
            } catch (error) {
                // Manual calculation fallback
                const amount = parseFloat(formData.applied_amount);
                const termMonths = parseInt(formData.loan_term_months);
                const interestRate = selectedLoanType.nominal_interest_rate / 100 / 12; // Monthly rate

                // Simple reducing balance calculation
                const monthlyPayment = (amount * interestRate * Math.pow(1 + interestRate, termMonths)) /
                    (Math.pow(1 + interestRate, termMonths) - 1);

                const totalPayment = monthlyPayment * termMonths;
                const totalInterest = totalPayment - amount;

                setCalculatedDetails({
                    monthly_payment: monthlyPayment,
                    total_payment: totalPayment,
                    total_interest: totalInterest,
                    interest_rate: selectedLoanType.nominal_interest_rate
                });
            }
        } catch (error) {
            console.error('Error calculating loan details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(5)) return;

        try {
            setLoading(true);

            const loanData = {
                ...formData,
                applied_amount: parseFloat(formData.applied_amount),
                loan_term_months: parseInt(formData.loan_term_months),
                collateral_value: formData.collateral_value ? parseFloat(formData.collateral_value) : null
            };

            await loansAPI.createLoan(loanData);

            // Success - redirect to loans list
            navigate('/dashboard/admin/loans', {
                state: { message: 'Loan application created successfully!' }
            });
        } catch (error) {
            console.error('Error creating loan:', error);
            setErrors({ submit: 'Failed to create loan application. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        handleInputChange('client_id', client.id);
    };

    const selectLoanType = (loanType) => {
        setSelectedLoanType(loanType);
        handleInputChange('loan_type_id', loanType.id);
        handleInputChange('repayment_frequency', loanType.default_frequency);
    };

    const steps = [
        { number: 1, title: 'Select Client', icon: User },
        { number: 2, title: 'Loan Details', icon: DollarSign },
        { number: 3, title: 'Terms & Schedule', icon: Calendar },
        { number: 4, title: 'Security', icon: Shield },
        { number: 5, title: 'Review & Submit', icon: CheckCircle }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/dashboard/admin/loans')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Loans
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Loan Application</h1>
                    <p className="text-gray-600 mt-2">Follow the steps below to create a new loan application</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="hidden md:block">
                                            <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                Step {step.number}
                                            </p>
                                            <p className={`text-xs ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`hidden md:block flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Step 1: Client Selection */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Client</h2>

                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search clients by name, email, or client number..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Client List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => selectClient(client)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedClient?.id === client.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {client.first_name} {client.last_name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {client.client_number} • {client.email}
                                                </p>
                                                <p className="text-sm text-gray-500">{client.mobile}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {client.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.client_id && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.client_id}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 2: Loan Details */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Details</h2>

                            {/* Selected Client Info */}
                            {selectedClient && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-medium text-blue-900">Selected Client</h3>
                                    <p className="text-blue-700">
                                        {selectedClient.first_name} {selectedClient.last_name} ({selectedClient.client_number})
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Loan Type Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Loan Type *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {loanTypes.map((loanType) => (
                                            <div
                                                key={loanType.id}
                                                onClick={() => selectLoanType(loanType)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedLoanType?.id === loanType.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <h3 className="font-medium text-gray-900">{loanType.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Interest Rate: {loanType.nominal_interest_rate}%
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Amount: {loanType.min_amount?.toLocaleString()} - {loanType.max_amount?.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Term: {loanType.min_term_months} - {loanType.max_term_months} months
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.loan_type_id && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.loan_type_id}
                                        </p>
                                    )}
                                </div>

                                {/* Applied Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Applied Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={formData.applied_amount}
                                            onChange={(e) => handleInputChange('applied_amount', e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {selectedLoanType && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Range: {selectedLoanType.min_amount?.toLocaleString()} - {selectedLoanType.max_amount?.toLocaleString()}
                                        </p>
                                    )}
                                    {errors.applied_amount && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.applied_amount}
                                        </p>
                                    )}
                                </div>

                                {/* Economic Sector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Economic Sector
                                    </label>
                                    <select
                                        value={formData.economic_sector}
                                        onChange={(e) => handleInputChange('economic_sector', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="agriculture">Agriculture</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="trade">Trade</option>
                                        <option value="services">Services</option>
                                        <option value="transport">Transport</option>
                                        <option value="construction">Construction</option>
                                        <option value="education">Education</option>
                                        <option value="health">Health</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Loan Purpose */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Purpose *
                                    </label>
                                    <textarea
                                        value={formData.loan_purpose}
                                        onChange={(e) => handleInputChange('loan_purpose', e.target.value)}
                                        placeholder="Describe the purpose of this loan..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.loan_purpose && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.loan_purpose}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Terms & Schedule */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Repayment Schedule</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Loan Term */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Term (Months) *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={formData.loan_term_months}
                                            onChange={(e) => handleInputChange('loan_term_months', e.target.value)}
                                            placeholder="Enter term in months"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {selectedLoanType && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Range: {selectedLoanType.min_term_months} - {selectedLoanType.max_term_months} months
                                        </p>
                                    )}
                                    {errors.loan_term_months && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.loan_term_months}
                                        </p>
                                    )}
                                </div>

                                {/* Repayment Frequency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Repayment Frequency
                                    </label>
                                    <select
                                        value={formData.repayment_frequency}
                                        onChange={(e) => handleInputChange('repayment_frequency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {selectedLoanType?.allowed_frequencies?.map((freq) => (
                                            <option key={freq} value={freq}>
                                                {freq.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        )) || (
                                                <>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="bi_weekly">Bi-Weekly</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                </>
                                            )}
                                    </select>
                                </div>
                            </div>

                            {/* Loan Summary */}
                            {formData.applied_amount && formData.loan_term_months && selectedLoanType && (
                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Loan Summary</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Loan Amount</p>
                                            <p className="font-medium">${parseFloat(formData.applied_amount || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Interest Rate</p>
                                            <p className="font-medium">{selectedLoanType.nominal_interest_rate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Term</p>
                                            <p className="font-medium">{formData.loan_term_months} months</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Frequency</p>
                                            <p className="font-medium">{formData.repayment_frequency.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Security/Collateral */}
                    {currentStep === 4 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security & Collateral</h2>

                            {/* Calculated Details */}
                            {calculatedDetails && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-medium text-blue-900 mb-3">Calculated Loan Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-blue-700">Monthly Payment</p>
                                            <p className="font-medium text-blue-900">
                                                ${calculatedDetails.monthly_payment?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700">Total Interest</p>
                                            <p className="font-medium text-blue-900">
                                                ${calculatedDetails.total_interest?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700">Total Payment</p>
                                            <p className="font-medium text-blue-900">
                                                ${calculatedDetails.total_payment?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700">Interest Rate</p>
                                            <p className="font-medium text-blue-900">{calculatedDetails.interest_rate}%</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Security Type */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Security Type
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { value: 'none', label: 'No Security' },
                                            { value: 'immovable_assets', label: 'Property' },
                                            { value: 'movable_assets', label: 'Vehicle/Equipment' },
                                            { value: 'guarantor', label: 'Guarantor' }
                                        ].map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.security_type === option.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="security_type"
                                                    value={option.value}
                                                    checked={formData.security_type === option.value}
                                                    onChange={(e) => handleInputChange('security_type', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="text-center w-full">
                                                    <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-sm font-medium">{option.label}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Collateral Description */}
                                {formData.security_type !== 'none' && (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Collateral Description *
                                            </label>
                                            <textarea
                                                value={formData.collateral_description}
                                                onChange={(e) => handleInputChange('collateral_description', e.target.value)}
                                                placeholder="Describe the collateral in detail..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {errors.collateral_description && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.collateral_description}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Collateral Value *
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="number"
                                                    value={formData.collateral_value}
                                                    onChange={(e) => handleInputChange('collateral_value', e.target.value)}
                                                    placeholder="Enter collateral value"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            {errors.collateral_value && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.collateral_value}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>

                            <div className="space-y-6">
                                {/* Client Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Client Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Name</p>
                                            <p className="font-medium">{selectedClient?.first_name} {selectedClient?.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Client Number</p>
                                            <p className="font-medium">{selectedClient?.client_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Email</p>
                                            <p className="font-medium">{selectedClient?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Mobile</p>
                                            <p className="font-medium">{selectedClient?.mobile}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Loan Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Loan Type</p>
                                            <p className="font-medium">{selectedLoanType?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Applied Amount</p>
                                            <p className="font-medium">${parseFloat(formData.applied_amount || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Interest Rate</p>
                                            <p className="font-medium">{selectedLoanType?.nominal_interest_rate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Term</p>
                                            <p className="font-medium">{formData.loan_term_months} months</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Frequency</p>
                                            <p className="font-medium">{formData.repayment_frequency.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Economic Sector</p>
                                            <p className="font-medium">{formData.economic_sector}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-gray-600 text-sm">Purpose</p>
                                        <p className="font-medium">{formData.loan_purpose}</p>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                {calculatedDetails && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-medium text-blue-900 mb-3">Payment Details</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-blue-700">Monthly Payment</p>
                                                <p className="font-medium text-blue-900">
                                                    ${calculatedDetails.monthly_payment?.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-blue-700">Total Interest</p>
                                                <p className="font-medium text-blue-900">
                                                    ${calculatedDetails.total_interest?.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-blue-700">Total Payment</p>
                                                <p className="font-medium text-blue-900">
                                                    ${calculatedDetails.total_payment?.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-blue-700">Total Installments</p>
                                                <p className="font-medium text-blue-900">{formData.loan_term_months}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Security Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Security Type</p>
                                            <p className="font-medium">
                                                {formData.security_type === 'none' ? 'No Security' :
                                                    formData.security_type === 'immovable_assets' ? 'Property' :
                                                        formData.security_type === 'movable_assets' ? 'Vehicle/Equipment' :
                                                            'Guarantor'}
                                            </p>
                                        </div>
                                        {formData.security_type !== 'none' && (
                                            <>
                                                <div>
                                                    <p className="text-gray-600">Collateral Value</p>
                                                    <p className="font-medium">${parseFloat(formData.collateral_value || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <p className="text-gray-600">Description</p>
                                                    <p className="font-medium">{formData.collateral_description}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Additional Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Branch
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.branch}
                                                onChange={(e) => handleInputChange('branch', e.target.value)}
                                                placeholder="Enter branch name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notes
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                                placeholder="Additional notes or comments..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.submit}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            {currentStep < 5 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Create Loan Application
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLoan;
