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
    AlertCircle,
    X, // Keeping X just in case for internal form resets if needed, though not directly for modal close
    Plus,
    Info
} from 'lucide-react';
import api from '../../services/api';
import { borrowerService } from '../../services/borrowerService'; // Use borrowerService for clients
import { loanTypeService } from '../../services/loanTypeService'; // Use loanTypeService for loan types

const AddLoan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]); // Renamed from borrowers to clients
    const [selectedClient, setSelectedClient] = useState(null); // Renamed from selectedBorrower
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false); // Renamed from showNewBorrowerForm
    const [errors, setErrors] = useState({});
    const [loanTypes, setLoanTypes] = useState([]);
    const [loanCalculation, setLoanCalculation] = useState(null);
    const [selectedLoanType, setSelectedLoanType] = useState(null);

    // Loan data state - directly from NewLoanApplicationModal.jsx
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

    // New client data state - directly from NewLoanApplicationModal.jsx's newBorrowerData
    const [newClientData, setNewClientData] = useState({ // Renamed from newBorrowerData
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

    // Sample data for development (keeping as fallback if needed)
    const sampleClients = [
        { id: 1, client_number: 'CLT001', first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', mobile: '+250788123456', status: 'active' },
        { id: 2, client_number: 'CLT002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', mobile: '+250788654321', status: 'active' }
    ];

    const sampleLoanTypes = [
        { id: 1, name: 'Personal Loan', code: 'PERSONAL', nominal_interest_rate: 15.0, min_amount: 50000, max_amount: 5000000, min_term_months: 3, max_term_months: 36, allowed_frequencies: ['monthly', 'bi_weekly'], default_frequency: 'monthly' },
        { id: 2, name: 'Business Loan', code: 'BUSINESS', nominal_interest_rate: 12.0, min_amount: 100000, max_amount: 10000000, min_term_months: 6, max_term_months: 60, allowed_frequencies: ['monthly', 'quarterly'], default_frequency: 'monthly' }
    ];


    // Fetch loan types - adapted from NewLoanApplicationModal.jsx
    const fetchLoanTypes = async () => {
        try {
            const response = await loanTypeService.getActiveLoanTypes();
            if (response.success) {
                setLoanTypes(response.data.loan_types);
            } else {
                setLoanTypes(sampleLoanTypes); // Fallback
                console.error('Error fetching loan types:', response.message);
                setErrors({ general: 'Failed to fetch loan types. Using sample data.' });
            }
        } catch (error) {
            console.error('Error fetching loan types:', error);
            setLoanTypes(sampleLoanTypes); // Fallback
            setErrors({ general: 'Failed to fetch loan types. Using sample data.' });
        }
    };

    // Calculate loan preview - adapted from NewLoanApplicationModal.jsx
    const calculateLoanPreview = async () => {
        if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term) {
            setLoanCalculation(null); // Clear calculation if inputs are incomplete
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
            } else {
                setLoanCalculation(null); // Clear calculation on error
                setErrors({ general: response.message || 'Failed to calculate loan preview' });
            }
        } catch (error) {
            console.error('Error calculating loan preview:', error);
            setLoanCalculation(null); // Clear calculation on error
            setErrors({ general: error.response?.data?.message || 'Failed to calculate loan preview' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch clients function - adapted from NewLoanApplicationModal.jsx's fetchBorrowers
    const fetchClients = async (search = '') => { // Renamed from fetchBorrowers
        try {
            setLoading(true);
            const response = await borrowerService.getBorrowers({ // Using borrowerService
                search: search,
                limit: 100 // Increased limit to fetch more clients by default for a page
            });

            if (response.success) {
                setClients(response.data.clients || []); // Expecting response.data.clients
            } else {
                setClients(sampleClients); // Fallback
                console.error('Error fetching clients:', response.message);
                setErrors({ general: 'Failed to fetch clients. Using sample data.' });
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClients(sampleClients); // Fallback
            setErrors({ general: 'Failed to fetch clients. Using sample data.' });
        } finally {
            setLoading(false);
        }
    };

    // Create new client function - adapted from NewLoanApplicationModal.jsx's createNewBorrower
    const createNewClient = async () => { // Renamed from createNewBorrower
        try {
            setLoading(true);
            setErrors({});

            // Validate required fields
            if (!newClientData.first_name || !newClientData.last_name ||
                !newClientData.email || !newClientData.phone_number) {
                setErrors({ newClient: 'Please fill in all required fields: First Name, Last Name, Email, Phone Number.' });
                return;
            }

            const response = await api.post('/clients', newClientData); // Using api.post directly

            if (response.data.success) {
                alert('New client created successfully!');
                // Assuming response.data.client or response.data.data.client based on backend
                setSelectedClient(response.data.client || response.data.data.client);
                setShowNewClientForm(false);
                setNewClientData({ // Reset new client form
                    first_name: '', last_name: '', email: '', phone_number: '',
                    date_of_birth: '', gender: '', national_id: '', address: '',
                    occupation: '', employer: '', monthly_income: ''
                });

                fetchClients(); // Refresh client list with new client
                setStep(2); // Move to Loan Details step
            } else {
                setErrors({ newClient: response.data.message || 'Failed to create client' });
            }
        } catch (error) {
            console.error('Error creating new client:', error);
            setErrors({
                newClient: error.response?.data?.message || 'Failed to create client'
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit loan application - adapted from NewLoanApplicationModal.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate the current step (Review & Submit, which is step 4 now) before attempting to submit
        if (!validateStep(step)) return;

        try {
            setLoading(true);
            setErrors({});

            // Comprehensive validation for final submission
            if (!selectedClient) {
                setErrors({ general: 'Please select a client to proceed.' });
                return;
            }
            if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term || !loanData.loan_purpose) {
                setErrors({ general: 'Please ensure all required loan details are filled.' });
                return;
            }
            if (!selectedLoanType) {
                setErrors({ general: 'Invalid loan type selected. Please re-select.' });
                return;
            }

            // If security is required, ensure collateral details are present
            if (selectedLoanType.requires_collateral) {
                if (loanData.collateral_type === 'none' || !loanData.collateral_value || parseFloat(loanData.collateral_value) <= 0) {
                    setErrors({ general: 'This loan type requires collateral. Please provide valid collateral details.' });
                    return;
                }
            }
            if (selectedLoanType.requires_guarantor) {
                if (!loanData.guarantor_name || !loanData.guarantor_phone) {
                    setErrors({ general: 'This loan type requires a guarantor. Please provide guarantor name and phone.' });
                    return;
                }
            }

            // Prepare loan data matching your backend expectations
            const loanPayload = {
                client_id: selectedClient.id,
                loan_type: parseInt(loanData.loan_type_id),
                applied_amount: parseFloat(loanData.loan_amount),
                interest_rate: parseFloat(loanData.interest_rate),
                interest_rate_method: selectedLoanType.interest_calculation_method || 'reducing_balance',
                loan_term_months: parseInt(loanData.loan_term),
                repayment_frequency: loanData.repayment_frequency || selectedLoanType.default_frequency || 'monthly',
                loan_purpose: loanData.loan_purpose || '',
                economic_sector: 'other', // Default sector, adjust if needed
                collateral_type: loanData.collateral_type || 'none',
                collateral_value: loanData.collateral_type !== 'none' ? parseFloat(loanData.collateral_value || 0) : 0,
                collateral_description: (loanData.collateral_type === 'guarantor' && loanData.guarantor_name) ?
                    `Guarantor: ${loanData.guarantor_name}, Phone: ${loanData.guarantor_phone || ''}, Address: ${loanData.guarantor_address || ''}` : loanData.collateral_description || null,
                guarantor_name: loanData.guarantor_name || null,
                guarantor_phone: loanData.guarantor_phone || null,
                guarantor_address: loanData.guarantor_address || null,
                notes: loanData.notes || null
            };

            console.log('Submitting loan application:', loanPayload);

            const response = await api.post('/loans', loanPayload);

            if (response.data.success) {
                console.log('Loan application created successfully:', response.data);
                alert('Loan application created successfully!');
                // After successful creation, redirect to the loans list
                navigate('/loans');
            } else {
                setErrors({ general: response.data.message || 'Failed to create loan application' });
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

    // Handle client search - adapted from NewLoanApplicationModal.jsx's handleBorrowerSearch
    const handleClientSearch = (e) => { // Renamed from handleBorrowerSearch
        const value = e.target.value;
        setSearchTerm(value);

        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            fetchClients(value); // Calls the adapted fetchClients
        }, 300);
    };

    // Handle loan data change - adapted from NewLoanApplicationModal.jsx
    const handleLoanDataChange = (e) => {
        const { name, value } = e.target;
        setLoanData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (errors.general) { // Also clear general errors that might be related to input
            setErrors(prev => ({ ...prev, general: '' }));
        }

        // Recalculate loan preview when relevant fields change
        if (['loan_amount', 'loan_term', 'repayment_frequency', 'loan_type_id', 'collateral_value'].includes(name)) {
            clearTimeout(window.calculationTimeout);
            window.calculationTimeout = setTimeout(() => {
                // Ensure all required fields for calculation are present
                if (loanData.loan_type_id && loanData.loan_amount && loanData.loan_term) {
                    calculateLoanPreview(); // Call the adapted calculateLoanPreview
                } else {
                    setLoanCalculation(null);
                }
            }, 500);
        }
    };

    // Handle new client data change - adapted from NewLoanApplicationModal.jsx's handleNewBorrowerDataChange
    const handleNewClientDataChange = (e) => { // Renamed from handleNewBorrowerDataChange
        const { name, value } = e.target;
        setNewClientData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors.newClient) { // Clear new client errors on input
            setErrors(prev => ({ ...prev, newClient: '' }));
        }
    };

    // Reset form - adapted from NewLoanApplicationModal.jsx (simplified for page)
    const resetForm = () => {
        setStep(1);
        setSelectedClient(null);
        setSearchTerm('');
        setShowNewClientForm(false);
        setLoanData({
            loan_type_id: '', loan_amount: '', loan_term: '', interest_rate: '',
            repayment_frequency: 'monthly', loan_purpose: '', collateral_type: '',
            collateral_value: '', guarantor_name: '', guarantor_phone: '',
            guarantor_address: '', notes: ''
        });
        setNewClientData({
            first_name: '', last_name: '', email: '', phone_number: '',
            date_of_birth: '', gender: '', national_id: '', address: '',
            occupation: '', employer: '', monthly_income: ''
        });
        setErrors({});
        setLoanCalculation(null);
    };

    // Navigation functions - adapted for 4 steps
    const handleNext = async () => { // Renamed from nextStep
        if (validateStep(step)) {
            if (step === 2) { // After Loan Details, calculate before moving to Security
                await calculateLoanPreview(); // Call the adapted calculateLoanPreview
            }
            setStep(prev => prev + 1);
            setErrors({}); // Clear errors on step change
        }
    };

    const handlePrevious = () => { // Renamed from prevStep
        setStep(prev => prev - 1);
        setErrors({}); // Clear errors on step change
    };

    // Validation for each step - adapted for 4 steps
    const validateStep = (currentStep) => {
        const newErrors = {};

        switch (currentStep) {
            case 1: // Client Selection
                if (!selectedClient && !showNewClientForm) { // If no client selected and not creating new
                    newErrors.general = 'Please select an existing client or add a new one to proceed.';
                } else if (showNewClientForm) { // If creating new, validate new client form
                    if (!newClientData.first_name || !newClientData.last_name ||
                        !newClientData.email || !newClientData.phone_number) {
                        newErrors.newClient = 'Please fill in all required fields for the new client.';
                    }
                }
                break;

            case 2: // Loan Details
                if (!loanData.loan_type_id) {
                    newErrors.loan_type_id = 'Please select a loan type.';
                } else if (!selectedLoanType) { // Ensure selectedLoanType is set
                    newErrors.loan_type_id = 'Invalid loan type selected. Please re-select.';
                }

                if (!loanData.loan_amount) {
                    newErrors.loan_amount = 'Please enter loan amount.';
                } else if (selectedLoanType) {
                    const amount = parseFloat(loanData.loan_amount);
                    if (isNaN(amount) || amount < selectedLoanType.min_amount || amount > selectedLoanType.max_amount) {
                        newErrors.loan_amount = `Amount must be between ${selectedLoanType.min_amount?.toLocaleString()} and ${selectedLoanType.max_amount?.toLocaleString()}.`;
                    }
                }
                if (!loanData.loan_term) {
                    newErrors.loan_term = 'Please enter loan term.';
                } else if (selectedLoanType) {
                    const term = parseInt(loanData.loan_term);
                    if (isNaN(term) || term < selectedLoanType.min_term_months || term > selectedLoanType.max_term_months) {
                        newErrors.loan_term = `Term must be between ${selectedLoanType.min_term_months} and ${selectedLoanType.max_term_months} months.`;
                    }
                }
                if (!loanData.loan_purpose) {
                    newErrors.loan_purpose = 'Please describe the loan purpose.';
                }
                break;

            case 3: // Security & Collateral
                if (loanData.collateral_type !== 'none') {
                    if (!loanData.collateral_description) {
                        newErrors.collateral_description = 'Please describe the collateral.';
                    }
                    if (!loanData.collateral_value || parseFloat(loanData.collateral_value) <= 0) {
                        newErrors.collateral_value = 'Please enter a valid collateral value.';
                    }
                }
                if (loanData.collateral_type === 'guarantor') {
                    if (!loanData.guarantor_name) {
                        newErrors.guarantor_name = 'Please enter guarantor name.';
                    }
                    if (!loanData.guarantor_phone) {
                        newErrors.guarantor_phone = 'Please enter guarantor phone number.';
                    }
                }
                // Check if loan type requires collateral/guarantor but not provided
                if (selectedLoanType) {
                    if (selectedLoanType.requires_collateral && loanData.collateral_type === 'none') {
                        newErrors.collateral_type = 'This loan type requires security. Please select a security type other than "None".';
                    }
                    if (selectedLoanType.requires_guarantor && loanData.collateral_type !== 'guarantor') { // Assuming guarantor is a type of collateral
                        newErrors.collateral_type = 'This loan type requires a guarantor.';
                    }
                }
                break;

            case 4: // Review & Submit (final validation before submission)
                // This step relies on previous validations, but a final check for critical fields
                if (!selectedClient || !loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term) {
                    newErrors.general = 'Please complete all required fields in previous steps before submitting.';
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle client selection - adapted from NewLoanApplicationModal.jsx's selectBorrower
    const selectClient = (client) => { // Renamed from selectBorrower
        setSelectedClient(client);
        setLoanData(prev => ({ ...prev, client_id: client.id })); // Set client_id in loanData
    };

    // Handle loan type selection - adapted from NewLoanApplicationModal.jsx
    const selectLoanType = (loanType) => {
        // Ensure we have all required properties with fallback values
        const processedLoanType = {
            ...loanType,
            min_term_months: loanType.min_term_months || 1,
            max_term_months: loanType.max_term_months || 60,
            min_amount: loanType.min_amount || 0,
            max_amount: loanType.max_amount || 1000000,
            nominal_interest_rate: loanType.nominal_interest_rate || 0,
            default_frequency: loanType.default_frequency || 'monthly'
        };
        
        setSelectedLoanType(processedLoanType);
        setLoanData(prev => ({
            ...prev,
            loan_type_id: loanType.id,
            interest_rate: processedLoanType.nominal_interest_rate,
            repayment_frequency: processedLoanType.default_frequency
        }));
    };

    // Handle loan type change in select dropdown
    const handleLoanTypeChange = (e) => {
        const loanTypeId = e.target.value;
        const selectedType = loanTypes.find(type => type.id === parseInt(loanTypeId));
        if (selectedType) {
            selectLoanType(selectedType);
        }
    };


    // Initial data fetch on component mount
    useEffect(() => {
        fetchClients(); // Initial fetch for clients
        fetchLoanTypes(); // Initial fetch for loan types
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                        <button
                        onClick={() => navigate('/loans')}
                        className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                        <ArrowLeft className="h-6 w-6" />
                        </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Loan</h1>
                    </div>

                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-200">{errors.general}</p>
                </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {/* Progress Steps */}
                    <div className="mb-8">
                    <div className="flex items-center justify-between">
                            {[1, 2, 3, 4].map((stepNumber) => (
                                <React.Fragment key={stepNumber}>
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= stepNumber
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {stepNumber}
                                        </div>
                                    {stepNumber < 4 && (
                                        <div
                                            className={`w-full h-1 mx-2 ${step > stepNumber ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                                </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Client</span>
                            <span>Loan Details</span>
                            <span>Security</span>
                            <span>Review</span>
                    </div>
                </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">
                    {/* Step 1: Client Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-primary" />
                                        Select Client
                                    </h2>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Existing Clients</h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClientForm(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Client
                                    </button>
                                </div>

                                {!showNewClientForm ? (
                                    <>
                                <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                                value={searchTerm}
                                                onChange={handleClientSearch}
                                                placeholder="Search clients by name, email, or phone..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                            </div>

                                        <div className="max-h-80 overflow-y-auto border rounded-lg border-gray-200 dark:border-gray-700">
                                            {loading ? (
                                                <div className="p-8 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading clients...</p>
                                                </div>
                                            ) : clients.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                                    <p>No clients found</p>
                                                    <p className="text-sm">Try adjusting your search or create a new client</p>
                                                </div>
                                            ) : (
                                                clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => selectClient(client)}
                                                        className={`p-4 border-b cursor-pointer transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedClient?.id === client.id ? 'bg-primary/5 dark:bg-primary/10 border-primary' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    {client.first_name} {client.last_name}
                                                                </h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone_number || client.mobile}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {client.occupation}
                                                                </p>
                                                                {client.monthly_income && (
                                                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                        ${parseFloat(client.monthly_income).toLocaleString()}/month
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
                                            <h5 className="font-medium text-gray-900 dark:text-white">Add New Client</h5>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewClientForm(false)}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <X className="w-5 h-5 inline mr-1" /> Cancel
                                            </button>
                            </div>
                                        {errors.newClient && (
                                            <p className="text-red-500 text-sm mt-1">{errors.newClient}</p>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={newClientData.first_name}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                        </div>

                        <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={newClientData.last_name}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={newClientData.email}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Phone Number *
                                    </label>
                                                <input
                                                    type="tel"
                                                    name="phone_number"
                                                    value={newClientData.phone_number}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                </div>

                                <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Date of Birth
                                    </label>
                                        <input
                                                    type="date"
                                                    name="date_of_birth"
                                                    value={newClientData.date_of_birth}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                </div>

                                <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Gender
                                    </label>
                                    <select
                                                    name="gender"
                                                    value={newClientData.gender}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    National ID
                                                </label>
                                                <input
                                                    type="text"
                                                    name="national_id"
                                                    value={newClientData.national_id}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Occupation
                                                </label>
                                                <input
                                                    type="text"
                                                    name="occupation"
                                                    value={newClientData.occupation}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Address
                                    </label>
                                    <textarea
                                                    name="address"
                                                    value={newClientData.address}
                                                    onChange={handleNewClientDataChange}
                                                    rows="2"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Employer
                                                </label>
                                                <input
                                                    type="text"
                                                    name="employer"
                                                    value={newClientData.employer}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Monthly Income
                                                </label>
                                                <input
                                                    type="number"
                                                    name="monthly_income"
                                                    value={newClientData.monthly_income}
                                                    onChange={handleNewClientDataChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={createNewClient}
                                                disabled={loading}
                                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-primary" />
                                    Loan Details
                                </h2>

                                {selectedClient && (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-900 dark:text-white">Selected Client:</h5>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {selectedClient.first_name} {selectedClient.last_name} - {selectedClient.email}
                                        </p>
                                    </div>
                                )}
                                {errors.loan_type_id && <p className="text-red-500 text-sm mt-1">{errors.loan_type_id}</p>}
                                {errors.loan_amount && <p className="text-red-500 text-sm mt-1">{errors.loan_amount}</p>}
                                {errors.loan_term && <p className="text-red-500 text-sm mt-1">{errors.loan_term}</p>}
                                {errors.loan_purpose && <p className="text-red-500 text-sm mt-1">{errors.loan_purpose}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Loan Type *
                                        </label>
                                        <select
                                            name="loan_type_id"
                                            value={loanData.loan_type_id}
                                            onChange={handleLoanTypeChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
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

                                    {loanData.loan_type_id && selectedLoanType && (
                                        <div className="md:col-span-2 bg-primary/5 dark:bg-primary/10 p-4 rounded-lg">
                                            <h5 className="font-medium text-primary-dark dark:text-primary-light mb-2">Loan Type Details:</h5>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-primary-dark dark:text-primary-light">Interest Rate:</span>
                                                    <span className="ml-2 font-medium">
                                                        {selectedLoanType.nominal_interest_rate}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-primary-dark dark:text-primary-light">Term Range:</span>
                                                    <span className="ml-2">
                                                        {selectedLoanType.min_term_months} -
                                                        {selectedLoanType.max_term_months} months
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-primary-dark dark:text-primary-light">Amount Range:</span>
                                                    <span className="ml-2">
                                                        ${selectedLoanType.min_amount?.toLocaleString()} -
                                                        ${selectedLoanType.max_amount?.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-primary-dark dark:text-primary-light">Collateral Required:</span>
                                                    <span className="ml-2">
                                                        {selectedLoanType.requires_collateral ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                            </div>
                        </div>
                    )}

                        <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Loan Amount *
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="number"
                                                name="loan_amount"
                                                value={loanData.loan_amount}
                                                onChange={handleLoanDataChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                min={selectedLoanType?.min_amount || 0}
                                                max={selectedLoanType?.max_amount || undefined}
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        {selectedLoanType && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Range: ${selectedLoanType.min_amount?.toLocaleString()} - ${selectedLoanType.max_amount?.toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Loan Term (Months) *
                                    </label>
                                    <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="number"
                                                name="loan_term"
                                                value={loanData.loan_term}
                                                onChange={handleLoanDataChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                min={selectedLoanType?.min_term_months || 1}
                                                max={selectedLoanType?.max_term_months || undefined}
                                                required
                                        />
                                    </div>
                                    {selectedLoanType && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Range: {selectedLoanType.min_term_months} - {selectedLoanType.max_term_months} months
                                        </p>
                                    )}
                                </div>

                                <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Interest Rate (%) *
                                        </label>
                                        <input
                                            type="number"
                                            name="interest_rate"
                                            value={loanData.interest_rate}
                                            onChange={handleLoanDataChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Repayment Frequency
                                    </label>
                                    <select
                                            name="repayment_frequency"
                                            value={loanData.repayment_frequency}
                                            onChange={handleLoanDataChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Loan Purpose *
                                        </label>
                                        <textarea
                                            name="loan_purpose"
                                            value={loanData.loan_purpose}
                                            onChange={handleLoanDataChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                            </div>

                                    {/* Loan Calculation Preview */}
                                    {loanCalculation && (
                                        <div className="md:col-span-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-2">Loan Calculation Preview:</h5>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                                    <span className="text-green-600 dark:text-green-400">Monthly Payment:</span>
                                                    <span className="ml-2 font-medium">
                                                        ${loanCalculation.loan_details.installment_amount.toLocaleString()}
                                                    </span>
                                        </div>
                                        <div>
                                                    <span className="text-green-600 dark:text-green-400">Total Interest:</span>
                                                    <span className="ml-2">
                                                        ${loanCalculation.loan_details.total_interest.toLocaleString()}
                                                    </span>
                                        </div>
                                        <div>
                                                    <span className="text-green-600 dark:text-green-400">Total Repayment:</span>
                                                    <span className="ml-2 font-medium">
                                                        ${loanCalculation.loan_details.total_repayment.toLocaleString()}
                                                    </span>
                                        </div>
                                        <div>
                                                    <span className="text-green-600 dark:text-green-400">Maturity Date:</span>
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

                        {/* Step 3: Security & Collateral */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-primary" />
                                    Security & Collateral
                                </h2>

                                {errors.collateral_type && <p className="text-red-500 text-sm mt-1">{errors.collateral_type}</p>}
                                {errors.collateral_description && <p className="text-red-500 text-sm mt-1">{errors.collateral_description}</p>}
                                {errors.collateral_value && <p className="text-red-500 text-sm mt-1">{errors.collateral_value}</p>}
                                {errors.guarantor_name && <p className="text-red-500 text-sm mt-1">{errors.guarantor_name}</p>}
                                {errors.guarantor_phone && <p className="text-red-500 text-sm mt-1">{errors.guarantor_phone}</p>}


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Security Type *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                                { value: 'none', label: 'No Security', icon: <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" /> },
                                                { value: 'property', label: 'Property', icon: <img src="/icons/property-icon.svg" alt="Property Icon" className="w-6 h-6 mx-auto mb-2" /> }, // Placeholder icon
                                                { value: 'vehicle', label: 'Vehicle', icon: <img src="/icons/vehicle-icon.svg" alt="Vehicle Icon" className="w-6 h-6 mx-auto mb-2" /> }, // Placeholder icon
                                                { value: 'guarantor', label: 'Guarantor', icon: <User className="w-6 h-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" /> }
                                        ].map((option) => (
                                            <label
                                                key={option.value}
                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${loanData.collateral_type === option.value
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                        name="collateral_type"
                                                    value={option.value}
                                                        checked={loanData.collateral_type === option.value}
                                                        onChange={handleLoanDataChange}
                                                    className="sr-only"
                                                />
                                                <div className="text-center w-full">
                                                        {option.icon}
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                    {loanData.collateral_type !== 'none' && (
                                    <>
                                        <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Collateral Description *
                                            </label>
                                            <textarea
                                                    name="collateral_description"
                                                    value={loanData.collateral_description}
                                                    onChange={handleLoanDataChange}
                                                    rows="3"
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                        </div>

                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Collateral Value *
                                            </label>
                                            <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    type="number"
                                                        name="collateral_value"
                                                        value={loanData.collateral_value}
                                                        onChange={handleLoanDataChange}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                                {loanData.collateral_type === 'guarantor' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Info className="w-5 h-5 text-gray-400" />
                                            Guarantor Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Guarantor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="guarantor_name"
                                                    value={loanData.guarantor_name}
                                                    onChange={handleLoanDataChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                        </div>

                        <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Guarantor Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="guarantor_phone"
                                                    value={loanData.guarantor_phone}
                                                    onChange={handleLoanDataChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Guarantor Address
                                                </label>
                                                <textarea
                                                    name="guarantor_address"
                                                    value={loanData.guarantor_address}
                                                    onChange={handleLoanDataChange}
                                                    rows="2"
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                                    Review & Submit
                                </h2>

                                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
                                {/* Client Information */}
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            Client Information
                                        </h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                    {selectedClient?.first_name} {selectedClient?.last_name}
                                                </span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{selectedClient?.email}</span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{selectedClient?.phone_number || selectedClient?.mobile}</span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Occupation:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{selectedClient?.occupation || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                    <hr className="border-gray-200 dark:border-gray-600" />

                                {/* Loan Details */}
                                        <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            Loan Details
                                        </h5>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Loan Type:</span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedLoanType?.name}</span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                    ${parseFloat(loanData.loan_amount || 0).toLocaleString()}
                                                </span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Term:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{loanData.loan_term} months</span>
                                        </div>
                                        <div>
                                                <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{loanData.interest_rate}%</span>
                                        </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600 dark:text-gray-400">Purpose:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">{loanData.loan_purpose}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                    {loanCalculation && (
                                        <>
                                            <hr className="border-gray-200 dark:border-gray-600" />
                                            <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-primary" />
                                                    Payment Details
                                                </h5>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Monthly Payment:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                            ${loanCalculation.loan_details.installment_amount?.toLocaleString()}
                                                        </span>
                                            </div>
                                            <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">
                                                            ${loanCalculation.loan_details.total_interest?.toLocaleString()}
                                                        </span>
                                            </div>
                                            <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Total Repayment:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                            ${loanCalculation.loan_details.total_repayment?.toLocaleString()}
                                                        </span>
                                            </div>
                                            <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Maturity Date:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">
                                                            {new Date(loanCalculation.loan_details.maturity_date).toLocaleDateString()}
                                                        </span>
                                            </div>
                                        </div>
                                    </div>
                                        </>
                                )}

                                {/* Security Information */}
                                    {loanData.collateral_type !== 'none' && (
                                        <>
                                            <hr className="border-gray-200 dark:border-gray-600" />
                                        <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-primary" />
                                                    Security Information
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Security Type:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{loanData.collateral_type.replace('_', ' ')}</span>
                                        </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Collateral Value:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">${loanData.collateral_value?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="text-gray-600 dark:text-gray-400">Collateral Description:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{loanData.collateral_description}</span>
                                                    </div>
                                                    {loanData.collateral_type === 'guarantor' && (
                                            <>
                                                <div>
                                                                <span className="text-gray-600 dark:text-gray-400">Guarantor Name:</span>
                                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{loanData.guarantor_name}</span>
                                                </div>
                                                            <div>
                                                                <span className="text-gray-600 dark:text-gray-400">Guarantor Phone:</span>
                                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{loanData.guarantor_phone}</span>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <span className="text-gray-600 dark:text-gray-400">Guarantor Address:</span>
                                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{loanData.guarantor_address}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                        </>
                                    )}

                                    {loanData.notes && (
                                        <>
                                            <hr className="border-gray-200 dark:border-gray-600" />
                                        <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-primary" />
                                                    Additional Notes
                                                </h5>
                                                <p className="text-gray-900 dark:text-white text-sm">{loanData.notes}</p>
                                        </div>
                                        </>
                                )}
                            </div>
                        </div>
                    )}
                    </div>

                    {/* Form Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            {step > 1 && (
                        <button
                                    type="button"
                            onClick={handlePrevious}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                                    <ArrowLeft className="inline-block w-4 h-4 mr-2" /> Previous
                        </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                                <button
                                type="button"
                                onClick={() => navigate('/loans')} // Direct navigate to cancel
                                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>

                            {step < 4 ? ( // Next button for steps 1, 2, 3
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {loading && step === 2 ? ( // Only show loading spinner on step 2 for calculation
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            Next <ArrowRight className="inline-block w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            ) : ( // Submit button for step 4
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="inline-block w-4 h-4 mr-2" /> Submit Application
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoan;
