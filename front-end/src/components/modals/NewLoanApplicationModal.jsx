import React, { useState, useEffect } from 'react';
import { X, Search, Plus, User } from 'lucide-react';
import api from '../../services/api';
import { borrowerService } from '../../services/borrowerService';
import { loanTypeService } from '../../services/loanTypeService';

const NewLoanApplicationModal = ({ isOpen, onClose, onApplicationCreated }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [borrowers, setBorrowers] = useState([]);
    const [selectedBorrower, setSelectedBorrower] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewBorrowerForm, setShowNewBorrowerForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loanTypes, setLoanTypes] = useState([]);
    const [loanCalculation, setLoanCalculation] = useState(null);

    // Loan data state
    const [loanData, setLoanData] = useState({
        loan_type_id: '',
        loan_amount: '',
        loan_term: '',
        interest_rate: '',
        repayment_frequency: 'monthly',
        loan_purpose: '',
        collateral_type: '',
        collateral_value: '',
        guarantor_name: '',
        guarantor_phone: '',
        guarantor_address: '',
        notes: ''
    });

    // New borrower data state
    const [newBorrowerData, setNewBorrowerData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        national_id: '',
        address: '',
        occupation: '',
        employer: '',
        monthly_income: ''
    });

    // Fetch loan types
    const fetchLoanTypes = async () => {
        try {
            const response = await loanTypeService.getActiveLoanTypes();
            if (response.success) {
                setLoanTypes(response.data.loan_types);
            }
        } catch (error) {
            console.error('Error fetching loan types:', error);
            setErrors({ general: 'Failed to fetch loan types' });
        }
    };

    // Calculate loan preview
    const calculateLoanPreview = async () => {
        if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term) {
            return;
        }

        try {
            setLoading(true);
            const response = await loanTypeService.calculateLoanPreview(
                loanData.loan_type_id,
                {
                    amount: parseFloat(loanData.loan_amount),
                    term_months: parseInt(loanData.loan_term),
                    frequency: loanData.repayment_frequency,
                    collateral_value: loanData.collateral_value ? parseFloat(loanData.collateral_value) : null
                }
            );

            if (response.success) {
                setLoanCalculation(response.data.calculations);
            }
        } catch (error) {
            console.error('Error calculating loan preview:', error);
            setErrors({ general: error.response?.data?.message || 'Failed to calculate loan preview' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch borrowers function
    const fetchBorrowers = async (search = '') => {
        try {
            setLoading(true);
            const response = await borrowerService.getBorrowers({
                search: search,
                limit: 50
            });

            if (response.success) {
                setBorrowers(response.data.clients || response.data.borrowers || response.data);
            }
        } catch (error) {
            console.error('Error fetching borrowers:', error);
            setErrors({ general: 'Failed to fetch clients' });
        } finally {
            setLoading(false);
        }
    };

    // Create new borrower function
    const createNewBorrower = async () => {
        try {
            setLoading(true);
            setErrors({});

            // Validate required fields
            if (!newBorrowerData.first_name || !newBorrowerData.last_name ||
                !newBorrowerData.email || !newBorrowerData.phone_number) {
                setErrors({ general: 'Please fill in all required fields' });
                return;
            }

            const response = await borrowerService.createBorrower(newBorrowerData);

            if (response.success) {
                setSelectedBorrower(response.data.client || response.data.borrower || response.data);
                setShowNewBorrowerForm(false);
                setNewBorrowerData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone_number: '',
                    date_of_birth: '',
                    gender: '',
                    national_id: '',
                    address: '',
                    occupation: '',
                    employer: '',
                    monthly_income: ''
                });

                fetchBorrowers();
                setStep(2);
            }
        } catch (error) {
            console.error('Error creating borrower:', error);
            setErrors({
                general: error.message || 'Failed to create client'
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit loan application
    const submitLoanApplication = async () => {
        try {
            setLoading(true);
            setErrors({});

            // Validate required fields
            if (!selectedBorrower) {
                setErrors({ general: 'Please select a client' });
                return;
            }

            if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term) {
                setErrors({ general: 'Please fill in all required loan details' });
                return;
            }

            // Get the selected loan type
            const selectedLoanType = loanTypes.find(type => type.id === parseInt(loanData.loan_type_id));
            if (!selectedLoanType) {
                setErrors({ general: 'Invalid loan type selected' });
                return;
            }

            // Prepare loan data matching your backend expectations
            const loanPayload = {
                client_id: selectedBorrower.id,
                loan_type: parseInt(loanData.loan_type_id),
                applied_amount: parseFloat(loanData.loan_amount),
                interest_rate: parseFloat(loanData.interest_rate),
                interest_rate_method: selectedLoanType.interest_calculation_method || 'reducing_balance',
                loan_term_months: parseInt(loanData.loan_term),
                repayment_frequency: loanData.repayment_frequency || selectedLoanType.default_frequency || 'monthly',
                loan_purpose: loanData.loan_purpose || '',
                economic_sector: 'other', // Default sector
                // Optional fields
                collateral_type: loanData.collateral_type || 'none',
                collateral_value: loanData.collateral_type !== 'none' ? parseFloat(loanData.collateral_value || 0) : 0,
                collateral_description: loanData.guarantor_name ? 
                    `Guarantor: ${loanData.guarantor_name}, Phone: ${loanData.guarantor_phone}, Address: ${loanData.guarantor_address}` : null,
                notes: loanData.notes || null
            };

            // Validate required fields before submission
            if (!loanPayload.client_id || !loanPayload.loan_type || !loanPayload.applied_amount || 
                !loanPayload.interest_rate || !loanPayload.loan_term_months) {
                setErrors({ general: 'Please fill in all required fields' });
                return;
            }

            // Validate amount range
            if (loanPayload.applied_amount < 1000 || loanPayload.applied_amount > 10000000) {
                setErrors({ general: 'Loan amount must be between 1,000 and 10,000,000' });
                return;
            }

            // Validate interest rate range
            if (loanPayload.interest_rate < 0.1 || loanPayload.interest_rate > 50) {
                setErrors({ general: 'Interest rate must be between 0.1% and 50%' });
                return;
            }

            // Validate loan term range
            if (loanPayload.loan_term_months < 1 || loanPayload.loan_term_months > 120) {
                setErrors({ general: 'Loan term must be between 1 and 120 months' });
                return;
            }

            // Validate repayment frequency
            const validFrequencies = ['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'lump_sum'];
            if (!validFrequencies.includes(loanPayload.repayment_frequency)) {
                setErrors({ general: 'Invalid repayment frequency. Must be one of: daily, weekly, bi_weekly, monthly, quarterly, lump_sum' });
                return;
            }

            // Validate collateral value if collateral type is not 'none'
            if (loanPayload.collateral_type !== 'none' && (!loanPayload.collateral_value || loanPayload.collateral_value <= 0)) {
                setErrors({ general: 'Collateral value must be a positive number when collateral type is specified' });
                return;
            }

            console.log('Submitting loan application:', loanPayload);

            // Use /api/loans endpoint
            const response = await api.post('/loans', loanPayload);

            if (response.data.success) {
                console.log('Loan application created successfully:', response.data);

                if (onApplicationCreated) {
                    onApplicationCreated(response.data.data.loan);
                }

                // Reset form and close modal
                resetForm();
                onClose();

                // Show success message
                alert('Loan application created successfully!');
            }
        } catch (error) {
            console.error('Error creating loan application:', error);
            setErrors({
                general: error.response?.data?.message || 'Failed to create loan application'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle borrower search
    const handleBorrowerSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            fetchBorrowers(value);
        }, 300);
    };

    // Handle loan data change
    const handleLoanDataChange = (e) => {
        const { name, value } = e.target;
        setLoanData(prev => ({
            ...prev,
            [name]: value
        }));

        // Recalculate loan preview when relevant fields change
        if (['loan_amount', 'loan_term', 'repayment_frequency'].includes(name)) {
            // Debounce calculation
            clearTimeout(window.calculationTimeout);
            window.calculationTimeout = setTimeout(() => {
                calculateLoanPreview();
            }, 500);
        }
    };

    // Handle new borrower data change
    const handleNewBorrowerDataChange = (e) => {
        const { name, value } = e.target;
        setNewBorrowerData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setStep(1);
        setSelectedBorrower(null);
        setSearchTerm('');
        setShowNewBorrowerForm(false);
        setLoanData({
            loan_type_id: '',
            loan_amount: '',
            loan_term: '',
            interest_rate: '',
            repayment_frequency: 'monthly',
            loan_purpose: '',
            collateral_type: '',
            collateral_value: '',
            guarantor_name: '',
            guarantor_phone: '',
            guarantor_address: '',
            notes: ''
        });
        setNewBorrowerData({
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            date_of_birth: '',
            gender: '',
            national_id: '',
            address: '',
            occupation: '',
            employer: '',
            monthly_income: ''
        });
        setErrors({});
    };

    // Navigation functions
    const nextStep = () => {
        if (step === 1 && !selectedBorrower) {
            setErrors({ general: 'Please select a client' });
            return;
        }
        setStep(step + 1);
        setErrors({});
    };

    const prevStep = () => {
        setStep(step - 1);
        setErrors({});
    };

    // Load borrowers and loan types when modal opens
    useEffect(() => {
        if (isOpen && step === 1) {
            fetchBorrowers();
            fetchLoanTypes();
        }
    }, [isOpen, step]);

    // Handle loan type change
    const handleLoanTypeChange = (e) => {
        const selectedTypeId = e.target.value;
        const selectedType = loanTypes.find(type => type.id === parseInt(selectedTypeId));
        
        if (selectedType) {
            setLoanData(prev => ({
                ...prev,
                loan_type_id: selectedTypeId,
                interest_rate: selectedType.nominal_interest_rate,
                repayment_frequency: 'monthly', // Set static default frequency
                collateral_type: selectedType.requires_collateral ? 'property' : 'none'
            }));

            // Clear previous calculations
            setLoanCalculation(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop with reduced opacity */}
            <div
                className="fixed inset-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-200">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">
                            New Loan Application
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center">
                                {[1, 2, 3].map((stepNumber) => (
                                    <React.Fragment key={stepNumber}>
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= stepNumber
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            {stepNumber}
                                        </div>
                                        {stepNumber < 3 && (
                                            <div className={`w-16 h-1 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span>Select Client</span>
                                <span>Loan Details</span>
                                <span>Review & Submit</span>
                            </div>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {/* Step 1: Select Client */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-medium">Select Client</h4>
                                        <button
                                            onClick={() => setShowNewBorrowerForm(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            New Client
                                        </button>
                                    </div>

                                    {!showNewBorrowerForm ? (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search clients by name, email, or phone..."
                                                    value={searchTerm}
                                                    onChange={handleBorrowerSearch}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="max-h-80 overflow-y-auto border rounded-lg">
                                                {loading ? (
                                                    <div className="p-8 text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                        <p className="mt-2 text-gray-500">Loading clients...</p>
                                                    </div>
                                                ) : borrowers.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500">
                                                        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                        <p>No clients found</p>
                                                        <p className="text-sm">Try adjusting your search or create a new client</p>
                                                    </div>
                                                ) : (
                                                    borrowers.map((borrower) => (
                                                        <div
                                                            key={borrower.id}
                                                            onClick={() => setSelectedBorrower(borrower)}
                                                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedBorrower?.id === borrower.id ? 'bg-blue-50 border-blue-200' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h5 className="font-medium text-gray-900">
                                                                        {borrower.first_name} {borrower.last_name}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600">{borrower.email}</p>
                                                                    <p className="text-sm text-gray-600">{borrower.phone_number || borrower.mobile}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-600">
                                                                        {borrower.occupation}
                                                                    </p>
                                                                    {borrower.monthly_income && (
                                                                        <p className="text-sm font-medium text-green-600">
                                                                            ${parseFloat(borrower.monthly_income).toLocaleString()}/month
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        /* New Client Form */
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h5 className="font-medium">Add New Client</h5>
                                                <button
                                                    onClick={() => setShowNewBorrowerForm(false)}
                                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={newBorrowerData.first_name}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={newBorrowerData.last_name}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={newBorrowerData.email}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phone Number *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phone_number"
                                                        value={newBorrowerData.phone_number}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Date of Birth
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={newBorrowerData.date_of_birth}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Gender
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        value={newBorrowerData.gender}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        National ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="national_id"
                                                        value={newBorrowerData.national_id}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Occupation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="occupation"
                                                        value={newBorrowerData.occupation}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Address
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        value={newBorrowerData.address}
                                                        onChange={handleNewBorrowerDataChange}
                                                        rows="2"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Employer
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="employer"
                                                        value={newBorrowerData.employer}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Monthly Income
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="monthly_income"
                                                        value={newBorrowerData.monthly_income}
                                                        onChange={handleNewBorrowerDataChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={createNewBorrower}
                                                    disabled={loading}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loading ? 'Creating...' : 'Create Client'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Loan Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-medium">Loan Details</h4>

                                    {selectedBorrower && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-gray-900">Selected Client:</h5>
                                            <p className="text-gray-600">
                                                {selectedBorrower.first_name} {selectedBorrower.last_name} - {selectedBorrower.email}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loan Type *
                                            </label>
                                            <select
                                                name="loan_type_id"
                                                value={loanData.loan_type_id}
                                                onChange={handleLoanTypeChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Loan Type</option>
                                                {loanTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name} - {type.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {loanData.loan_type_id && (
                                            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-blue-900 mb-2">Loan Type Details:</h5>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-blue-600">Interest Rate:</span>
                                                        <span className="ml-2 font-medium">
                                                            {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.nominal_interest_rate}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-blue-600">Term Range:</span>
                                                        <span className="ml-2">
                                                            {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_term_months} - 
                                                            {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_term_months} months
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-blue-600">Amount Range:</span>
                                                        <span className="ml-2">
                                                            ${loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_amount?.toLocaleString()} - 
                                                            ${loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_amount?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-blue-600">Collateral Required:</span>
                                                        <span className="ml-2">
                                                            {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.requires_collateral ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loan Amount *
                                            </label>
                                            <input
                                                type="number"
                                                name="loan_amount"
                                                value={loanData.loan_amount}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min={loanData.loan_type_id ? loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_amount : 0}
                                                max={loanData.loan_type_id ? loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_amount : undefined}
                                                step="0.01"
                                                required
                                            />
                                            {loanData.loan_type_id && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Min: ${loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_amount?.toLocaleString()}, 
                                                    Max: ${loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_amount?.toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loan Term (Months) *
                                            </label>
                                            <input
                                                type="number"
                                                name="loan_term"
                                                value={loanData.loan_term}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min={loanData.loan_type_id ? loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_term_months : 1}
                                                max={loanData.loan_type_id ? loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_term_months : undefined}
                                                required
                                            />
                                            {loanData.loan_type_id && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Min: {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.min_term_months} months, 
                                                    Max: {loanTypes.find(t => t.id === parseInt(loanData.loan_type_id))?.max_term_months} months
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Interest Rate (%) *
                                            </label>
                                            <input
                                                type="number"
                                                name="interest_rate"
                                                value={loanData.interest_rate}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Repayment Frequency
                                            </label>
                                            <select
                                                name="repayment_frequency"
                                                value={loanData.repayment_frequency}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="bi_weekly">Bi-Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="lump_sum">Lump Sum</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Loan Purpose *
                                            </label>
                                            <textarea
                                                name="loan_purpose"
                                                value={loanData.loan_purpose}
                                                onChange={handleLoanDataChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Collateral Type
                                            </label>
                                            <select
                                                name="collateral_type"
                                                value={loanData.collateral_type}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Collateral Type</option>
                                                <option value="none">None</option>
                                                <option value="property">Property</option>
                                                <option value="vehicle">Vehicle</option>
                                                <option value="equipment">Equipment</option>
                                                <option value="savings">Savings</option>
                                                <option value="guarantor">Guarantor</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Collateral Value
                                            </label>
                                            <input
                                                type="number"
                                                name="collateral_value"
                                                value={loanData.collateral_value}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Guarantor Name
                                            </label>
                                            <input
                                                type="text"
                                                name="guarantor_name"
                                                value={loanData.guarantor_name}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Guarantor Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="guarantor_phone"
                                                value={loanData.guarantor_phone}
                                                onChange={handleLoanDataChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Guarantor Address
                                            </label>
                                            <textarea
                                                name="guarantor_address"
                                                value={loanData.guarantor_address}
                                                onChange={handleLoanDataChange}
                                                rows="2"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Additional Notes
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={loanData.notes}
                                                onChange={handleLoanDataChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Loan Calculation Preview */}
                                        {loanCalculation && (
                                            <div className="md:col-span-2 bg-green-50 p-4 rounded-lg">
                                                <h5 className="font-medium text-green-900 mb-2">Loan Calculation Preview:</h5>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-green-600">Monthly Payment:</span>
                                                        <span className="ml-2 font-medium">
                                                            ${loanCalculation.loan_details.installment_amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-green-600">Total Interest:</span>
                                                        <span className="ml-2">
                                                            ${loanCalculation.loan_details.total_interest.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-green-600">Total Repayment:</span>
                                                        <span className="ml-2 font-medium">
                                                            ${loanCalculation.loan_details.total_repayment.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-green-600">Maturity Date:</span>
                                                        <span className="ml-2">
                                                            {new Date(loanCalculation.loan_details.maturity_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review & Submit */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-medium">Review & Submit</h4>

                                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-2">Client Information</h5>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Name:</span>
                                                    <span className="ml-2 font-medium">
                                                        {selectedBorrower?.first_name} {selectedBorrower?.last_name}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="ml-2">{selectedBorrower?.email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="ml-2">{selectedBorrower?.phone_number || selectedBorrower?.mobile}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Occupation:</span>
                                                    <span className="ml-2">{selectedBorrower?.occupation || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-200" />

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-2">Loan Details</h5>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Loan Amount:</span>
                                                    <span className="ml-2 font-medium">
                                                        ${parseFloat(loanData.loan_amount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Term:</span>
                                                    <span className="ml-2">{loanData.loan_term} months</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Interest Rate:</span>
                                                    <span className="ml-2">{loanData.interest_rate}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Repayment:</span>
                                                    <span className="ml-2 capitalize">{loanData.repayment_frequency}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-600">Purpose:</span>
                                                    <span className="ml-2">{loanData.loan_purpose}</span>
                                                </div>
                                                {loanData.collateral_type && (
                                                    <>
                                                        <div>
                                                            <span className="text-gray-600">Collateral Type:</span>
                                                            <span className="ml-2 capitalize">{loanData.collateral_type}</span>
                                                        </div>
                                                        {loanData.collateral_value && (
                                                            <div>
                                                                <span className="text-gray-600">Collateral Value:</span>
                                                                <span className="ml-2">
                                                                    ${parseFloat(loanData.collateral_value).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {loanData.guarantor_name && (
                                                    <>
                                                        <div>
                                                            <span className="text-gray-600">Guarantor:</span>
                                                            <span className="ml-2">{loanData.guarantor_name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Guarantor Phone:</span>
                                                            <span className="ml-2">{loanData.guarantor_phone}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {loanData.notes && (
                                                    <div className="col-span-2">
                                                        <span className="text-gray-600">Notes:</span>
                                                        <span className="ml-2">{loanData.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-between items-center p-6 border-t border-gray-200">
                        <div>
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    ← Previous
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    onClick={submitLoanApplication}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
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

export default NewLoanApplicationModal;
