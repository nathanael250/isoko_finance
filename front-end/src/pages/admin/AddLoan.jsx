import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Search,
    User,
    DollarSign,
    Calendar,
    FileText,
    Shield,
    Plus,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';
import { borrowerService } from '../../services/borrowerService';
import { loanTypeService } from '../../services/loanTypeService';

const AddLoan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [errors, setErrors] = useState({});
    const [loanTypes, setLoanTypes] = useState([]);
    const [loanCalculation, setLoanCalculation] = useState(null);
    const [selectedLoanType, setSelectedLoanType] = useState(null);

    // Loan data state
    const [loanData, setLoanData] = useState({
        loan_type_id: '',
        loan_amount: '',
        loan_term: '',
        interest_rate: '',
        repayment_frequency: 'monthly',
        loan_purpose: '',
        collateral_type: 'none',
        collateral_value: '',
        collateral_description: '',
        guarantor_name: '',
        guarantor_phone: '',
        guarantor_address: '',
        notes: ''
    });

    // New client data state
    const [newClientData, setNewClientData] = useState({
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

    // Sample data for development
    const sampleClients = [
        { id: 1, client_number: 'CLT001', first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', mobile: '+250788123456', status: 'active' },
        { id: 2, client_number: 'CLT002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', mobile: '+250788654321', status: 'active' }
    ];

    const sampleLoanTypes = [
        { id: 1, name: 'Personal Loan', code: 'PERSONAL', nominal_interest_rate: 15.0, min_amount: 50000, max_amount: 5000000, min_term_months: 3, max_term_months: 36, allowed_frequencies: ['monthly', 'bi_weekly'], default_frequency: 'monthly' },
        { id: 2, name: 'Business Loan', code: 'BUSINESS', nominal_interest_rate: 12.0, min_amount: 100000, max_amount: 10000000, min_term_months: 6, max_term_months: 60, allowed_frequencies: ['monthly', 'quarterly'], default_frequency: 'monthly' }
    ];

    // Options for selects
    const AllLoansStatus = [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'disbursed', label: 'Disbursed' }
    ];

    const AllRepaymentsMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'mobile_money', label: 'Mobile Money' },
        { value: 'check', label: 'Check' }
    ];

    // Fetch functions
    const fetchLoanTypes = async () => {
        try {
            const response = await loanTypeService.getActiveLoanTypes();
            if (response.success) {
                setLoanTypes(response.data.loan_types);
            } else {
                setLoanTypes(sampleLoanTypes);
                console.error('Error fetching loan types:', response.message);
            }
        } catch (error) {
            console.error('Error fetching loan types:', error);
            setLoanTypes(sampleLoanTypes);
        }
    };

    const fetchClients = async (search = '') => {
        try {
            setLoading(true);
            const response = await borrowerService.getBorrowers({
                search: search,
                limit: 100
            });

            if (response.success) {
                setClients(response.data.clients || []);
            } else {
                setClients(sampleClients);
                console.error('Error fetching clients:', response.message);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClients(sampleClients);
        } finally {
            setLoading(false);
        }
    };

    const calculateLoanPreview = async () => {
        if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term) {
            setLoanCalculation(null);
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
                setLoanCalculation(null);
                setErrors({ general: response.message || 'Failed to calculate loan preview' });
            }
        } catch (error) {
            console.error('Error calculating loan preview:', error);
            setLoanCalculation(null);
            setErrors({ general: error.response?.data?.message || 'Failed to calculate loan preview' });
        } finally {
            setLoading(false);
        }
    };

    const createNewClient = async () => {
        try {
            setLoading(true);
            setErrors({});

            if (!newClientData.first_name || !newClientData.last_name ||
                !newClientData.email || !newClientData.phone_number) {
                setErrors({ newClient: 'Please fill in all required fields: First Name, Last Name, Email, Phone Number.' });
                return;
            }

            const response = await api.post('/clients', newClientData);

            if (response.data.success) {
                alert('New client created successfully!');
                setSelectedClient(response.data.client || response.data.data.client);
                setShowNewClientForm(false);
                setNewClientData({
                    first_name: '', last_name: '', email: '', phone_number: '',
                    date_of_birth: '', gender: '', national_id: '', address: '',
                    occupation: '', employer: '', monthly_income: ''
                });
                fetchClients();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setErrors({});

            if (!selectedClient) {
                setErrors({ general: 'Please select a client to proceed.' });
                return;
            }
            if (!loanData.loan_type_id || !loanData.loan_amount || !loanData.loan_term || !loanData.loan_purpose) {
                setErrors({ general: 'Please ensure all required loan details are filled.' });
                return;
            }

            const loanPayload = {
                client_id: selectedClient.id,
                loan_type: parseInt(loanData.loan_type_id),
                applied_amount: parseFloat(loanData.loan_amount),
                interest_rate: parseFloat(loanData.interest_rate),
                interest_rate_method: selectedLoanType.interest_calculation_method || 'reducing_balance',
                loan_term_months: parseInt(loanData.loan_term),
                repayment_frequency: loanData.repayment_frequency || selectedLoanType.default_frequency || 'monthly',
                loan_purpose: loanData.loan_purpose || '',
                economic_sector: 'other',
                collateral_type: loanData.collateral_type || 'none',
                collateral_value: loanData.collateral_type !== 'none' ? parseFloat(loanData.collateral_value || 0) : 0,
                collateral_description: loanData.collateral_description || null,
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
                navigate('/dashboard/admin/loans');
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

    // Event handlers
    const handleClientSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            fetchClients(value);
        }, 300);
    };

    const handleLoanDataChange = (e) => {
        const { name, value } = e.target;
        setLoanData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (['loan_amount', 'loan_term', 'repayment_frequency', 'loan_type_id', 'collateral_value'].includes(name)) {
            clearTimeout(window.calculationTimeout);
            window.calculationTimeout = setTimeout(() => {
                if (loanData.loan_type_id && loanData.loan_amount && loanData.loan_term) {
                    calculateLoanPreview();
                } else {
                    setLoanCalculation(null);
                }
            }, 500);
        }
    };

    const handleNewClientDataChange = (e) => {
        const { name, value } = e.target;
        setNewClientData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors.newClient) {
            setErrors(prev => ({ ...prev, newClient: '' }));
        }
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        setLoanData(prev => ({ ...prev, client_id: client.id }));
    };

    const selectLoanType = (loanType) => {
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

    const handleLoanTypeChange = (e) => {
        const loanTypeId = e.target.value;
        const selectedType = loanTypes.find(type => type.id === parseInt(loanTypeId));
        if (selectedType) {
            selectLoanType(selectedType);
        }
    };

    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(!showAdvancedSearch);
    };

    // Initial data fetch
    useEffect(() => {
        fetchClients();
        fetchLoanTypes();
    }, []);

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center mb-2">
                        <button
                            onClick={() => navigate('/dashboard/admin/loans')}
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900">Add New Loan</h1>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Create a new loan application by selecting a client and filling in the loan details.
                    </p>
                </div>

                {/* Error Display */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-red-800 text-sm">{errors.general}</div>
                    </div>
                )}

                {/* Advanced Search Toggle */}
                <div className='space-x-1 text-sm'>
                    <span className='font-semibold'>Advanced Search:</span>
                    <span 
                        className='text-blue-500 font-semibold cursor-pointer hover:text-blue-700 transition-colors duration-200 inline-flex items-center gap-1'
                                                onClick={toggleAdvancedSearch}
                    >
                        {showAdvancedSearch ? 'Click here to Hide' : 'Click here to Show'}
                        {showAdvancedSearch ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </span>
                </div>

                {/* Animated Advanced Search Form */}
                <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        showAdvancedSearch 
                            ? 'max-h-[600px] opacity-100' 
                            : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className='bg-white px-2 py-4 border-t-2 border-green-500'>
                        <form className='text-sm space-y-2'>
                            <span className='text-xs text-slate-600 pb-2'>All fields are optional. You can type or select as many fields as you like.</span>
                            
                            <div className='flex justify-between gap-8'>
                                <Select
                                    isMulti
                                    name="loan_status"
                                    options={AllLoansStatus}
                                    className="basic-multi-select flex-1"
                                    classNamePrefix="select"
                                    placeholder="Select Loan Status"
                                />
                                <Select
                                    isMulti
                                    name="repayment_methods"
                                    options={AllRepaymentsMethods}
                                    className="basic-multi-select flex-1"
                                    classNamePrefix="select"
                                    placeholder="Select Repayment Methods"
                                />
                            </div>
                            
                            <div className='flex justify-between gap-8'>
                                <input 
                                    type="text" 
                                    className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' 
                                    placeholder='Borrower Name or Business Name' 
                                />
                                <input 
                                    type="text" 
                                    className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' 
                                    placeholder='Loan #' 
                                />
                            </div>
                            
                            <div className='flex justify-between gap-8'>
                                <select className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2'>
                                    <option value="">Select Loan Officer</option>
                                    <option value="1">John Smith</option>
                                    <option value="2">Jane Doe</option>
                                </select>
                                <select className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2'>
                                    <option value="">Select Branch</option>
                                    <option value="main">Main Branch</option>
                                    <option value="downtown">Downtown Branch</option>
                                </select>
                            </div>
                            
                            <div className='flex justify-between gap-8'>
                                <input 
                                    type="number" 
                                    className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' 
                                    placeholder='Min Amount' 
                                />
                                <input 
                                    type="number" 
                                    className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' 
                                    placeholder='Max Amount' 
                                />
                            </div>
                            
                            <div className='flex justify-between gap-8'>
                                <div className='flex gap-2 flex-1 justify-between'>
                                    <div className='flex-grow'>
                                        <DatePicker
                                            selected={null}
                                            onChange={(date) => {}}
                                            placeholderText='From date'
                                            wrapperClassName='w-full'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                                            dateFormat="dd/MM/yyyy"
                                        />
                                    </div>
                                    <div className='flex-grow'>
                                        <DatePicker
                                            selected={null}
                                            onChange={(date) => {}}
                                            placeholderText='To date'
                                            wrapperClassName='w-full'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                                            dateFormat="dd/MM/yyyy"
                                        />
                                    </div>
                                </div>
                                <select className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2'>
                                    <option value="">Select Early Settlement</option>
                                    <option value="yes">Loans with Early Settlement</option>
                                    <option value="no">Loans with No Early Settlement</option>
                                </select>
                            </div>
                            
                            <div className='flex gap-2'>
                                <div>
                                    <input type="radio" name="status" id="released" /> 
                                    <label htmlFor="released" className='text-sm font-semibold ml-1'>Released</label>
                                </div>
                                <div>
                                    <input type="radio" name="status" id="pending" /> 
                                    <label htmlFor="pending" className='text-sm font-semibold ml-1'>Pending</label>
                                </div>
                            </div>
                            
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-semibold'>Bank Accounts:</label>
                                <input 
                                    type="text" 
                                    className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' 
                                    placeholder='Bank Account Number' 
                                />
                            </div>
                            
                            <div className='flex justify-between'>
                                <button 
                                    type="button"
                                    className='bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-sm cursor-pointer transition-colors duration-200'
                                >
                                    Search!
                                </button>
                                <button 
                                    type="button"
                                    className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-sm cursor-pointer transition-colors duration-200'
                                >
                                    Reset!
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Selection Section */}
                    <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                        <div className="flex items-center mb-4">
                            <User className="h-5 w-5 text-gray-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Client Selection</h2>
                        </div>

                        {/* Client Search */}
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search clients by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={handleClientSearch}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Client
                                </button>
                            </div>
                        </div>

                        {/* Selected Client Display */}
                        {selectedClient && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-blue-900">
                                            {selectedClient.first_name} {selectedClient.last_name}
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            {selectedClient.email} • {selectedClient.mobile}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClient(null)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Client List */}
                        {!selectedClient && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-500">Loading clients...</div>
                                ) : clients.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No clients found</div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {clients.map((client) => (
                                            <div
                                                key={client.id}
                                                onClick={() => selectClient(client)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {client.first_name} {client.last_name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {client.email} • {client.mobile}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        client.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {client.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New Client Form */}
                        {showNewClientForm && (
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">Add New Client</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClientForm(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {errors.newClient && (
                                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                                        {errors.newClient}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="First Name *"
                                        value={newClientData.first_name}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last Name *"
                                        value={newClientData.last_name}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email *"
                                        value={newClientData.email}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        placeholder="Phone Number *"
                                        value={newClientData.phone_number}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="national_id"
                                        placeholder="National ID"
                                        value={newClientData.national_id}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <select
                                        name="gender"
                                        value={newClientData.gender}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">Select Gender</option>
                                                                                <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="occupation"
                                        placeholder="Occupation"
                                        value={newClientData.occupation}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="employer"
                                        placeholder="Employer"
                                        value={newClientData.employer}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <input
                                        type="number"
                                        name="monthly_income"
                                        placeholder="Monthly Income"
                                        value={newClientData.monthly_income}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <DatePicker
                                        selected={newClientData.date_of_birth ? new Date(newClientData.date_of_birth) : null}
                                        onChange={(date) => setNewClientData(prev => ({
                                            ...prev,
                                            date_of_birth: date ? date.toISOString().split('T')[0] : ''
                                        }))}
                                        placeholderText="Date of Birth"
                                        wrapperClassName="w-full"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        yearDropdownItemNumber={50}
                                        scrollableYearDropdown
                                    />
                                    <textarea
                                        name="address"
                                        placeholder="Address"
                                        value={newClientData.address}
                                        onChange={handleNewClientDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        rows="2"
                                    />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={createNewClient}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200 text-sm"
                                    >
                                        {loading ? 'Creating...' : 'Create Client'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loan Details Section */}
                    <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                        <div className="flex items-center mb-4">
                            <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Loan Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Type *
                                </label>
                                <select
                                    name="loan_type_id"
                                    value={loanData.loan_type_id}
                                    onChange={handleLoanTypeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                >
                                    <option value="">Select Loan Type</option>
                                    {loanTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} ({type.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Loan Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Amount *
                                    {selectedLoanType && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            (Min: {selectedLoanType.min_amount?.toLocaleString()} - Max: {selectedLoanType.max_amount?.toLocaleString()})
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    name="loan_amount"
                                    value={loanData.loan_amount}
                                    onChange={handleLoanDataChange}
                                    min={selectedLoanType?.min_amount || 0}
                                    max={selectedLoanType?.max_amount || 1000000}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter loan amount"
                                    required
                                />
                            </div>

                            {/* Loan Term */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Term (Months) *
                                    {selectedLoanType && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            (Min: {selectedLoanType.min_term_months} - Max: {selectedLoanType.max_term_months})
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    name="loan_term"
                                    value={loanData.loan_term}
                                    onChange={handleLoanDataChange}
                                    min={selectedLoanType?.min_term_months || 1}
                                    max={selectedLoanType?.max_term_months || 60}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter loan term in months"
                                    required
                                />
                            </div>

                            {/* Interest Rate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Interest Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    name="interest_rate"
                                    value={loanData.interest_rate}
                                    onChange={handleLoanDataChange}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter interest rate"
                                    required
                                />
                            </div>

                            {/* Repayment Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Repayment Frequency *
                                </label>
                                <select
                                    name="repayment_frequency"
                                    value={loanData.repayment_frequency}
                                    onChange={handleLoanDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="bi_weekly">Bi-Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                </select>
                            </div>

                            {/* Loan Purpose */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Purpose *
                                </label>
                                <textarea
                                    name="loan_purpose"
                                    value={loanData.loan_purpose}
                                    onChange={handleLoanDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows="3"
                                    placeholder="Describe the purpose of this loan"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collateral Section */}
                    <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                        <div className="flex items-center mb-4">
                            <Shield className="h-5 w-5 text-gray-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Collateral & Security</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Collateral Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Collateral Type
                                </label>
                                <select
                                    name="collateral_type"
                                    value={loanData.collateral_type}
                                    onChange={handleLoanDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="none">No Collateral</option>
                                    <option value="immovable_assets">Immovable Assets</option>
                                    <option value="movable_assets">Movable Assets</option>
                                    <option value="guarantor">Guarantor</option>
                                </select>
                            </div>

                            {/* Collateral Value */}
                            {loanData.collateral_type !== 'none' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Collateral Value
                                    </label>
                                    <input
                                        type="number"
                                        name="collateral_value"
                                        value={loanData.collateral_value}
                                        onChange={handleLoanDataChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Enter collateral value"
                                    />
                                </div>
                            )}

                            {/* Collateral Description */}
                            {loanData.collateral_type !== 'none' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Collateral Description
                                    </label>
                                    <textarea
                                        name="collateral_description"
                                        value={loanData.collateral_description}
                                        onChange={handleLoanDataChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        rows="3"
                                        placeholder="Describe the collateral in detail"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Guarantor Information */}
                        {loanData.collateral_type === 'guarantor' && (
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <h3 className="font-semibold text-gray-900 mb-3">Guarantor Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        name="guarantor_name"
                                        value={loanData.guarantor_name}
                                        onChange={handleLoanDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Guarantor Name"
                                    />
                                    <input
                                        type="tel"
                                        name="guarantor_phone"
                                        value={loanData.guarantor_phone}
                                        onChange={handleLoanDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Guarantor Phone"
                                    />
                                    <input
                                        type="text"
                                        name="guarantor_address"
                                        value={loanData.guarantor_address}
                                        onChange={handleLoanDataChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Guarantor Address"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loan Calculation Preview */}
                    {loanCalculation && (
                        <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                            <div className="flex items-center mb-4">
                                <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Loan Calculation Preview</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                                <div className="bg-blue-50 p-3 rounded-md">
                                    <div className="text-sm text-blue-600 font-medium">Monthly Payment</div>
                                    <div className="text-lg font-bold text-blue-900">
                                        {loanCalculation.installment_amount?.toLocaleString()} RWF
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-md">
                                    <div className="text-sm text-green-600 font-medium">Total Interest</div>
                                    <div className="text-lg font-bold text-green-900">
                                        {loanCalculation.total_interest?.toLocaleString()} RWF
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-md">
                                    <div className="text-sm text-yellow-600 font-medium">Total Amount</div>
                                    <div className="text-lg font-bold text-yellow-900">
                                        {loanCalculation.total_amount?.toLocaleString()} RWF
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-md">
                                    <div className="text-sm text-purple-600 font-medium">Maturity Date</div>
                                    <div className="text-lg font-bold text-purple-900">
                                        {loanCalculation.maturity_date ? new Date(loanCalculation.maturity_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Schedule Preview */}
                            {loanCalculation.schedule && loanCalculation.schedule.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Payment Schedule (First 5 Payments)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Payment #
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Due Date
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Principal
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Interest
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Total Payment
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                                        Balance
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loanCalculation.schedule.slice(0, 5).map((payment, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {payment.installment_number}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {new Date(payment.due_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {payment.principal_due?.toLocaleString()} RWF
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {payment.interest_due?.toLocaleString()} RWF
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {payment.total_due?.toLocaleString()} RWF
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                            {payment.balance_after?.toLocaleString()} RWF
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {loanCalculation.schedule.length > 5 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Showing first 5 of {loanCalculation.schedule.length} payments
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Notes Section */}
                    <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                        <div className="flex items-center mb-4">
                            <FileText className="h-5 w-5 text-gray-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={loanData.notes}
                                onChange={handleLoanDataChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows="4"
                                placeholder="Add any additional notes or comments about this loan application"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white px-4 py-4 border-t-2 border-green-500">
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/admin/loans')}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm"
                            >
                                Cancel
                            </button>
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Save as draft functionality
                                        console.log('Save as draft');
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center gap-1"
                                >
                                    <FileText className="h-4 w-4" />
                                    Save as Draft
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={loading || !selectedClient}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center gap-1"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? 'Creating...' : 'Create Loan Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Export and Column Controls */}
                <div className='flex justify-between items-center'>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors duration-200">
                        Export Data
                    </button>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors duration-200">
                        Show/Hide Columns
                    </button>
                </div>

                {/* Summary Section */}
                <div className='bg-gray-50 border-t-2 border-green-500'>
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Search applications"
                                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-700">Show</label>
                            <select className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <label className="text-sm text-gray-700">entries</label>
                        </div>
                    </div>

                    {/* Data Table Placeholder */}
                    <div className="overflow-x-auto px-4 py-2">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-12">View</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-32">Client Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-24">Loan Type</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-24">Amount</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-24">Term</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-24">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 w-32">Created Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-12 w-12 text-gray-300 mb-2" />
                                            <p>No loan applications found.</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Create your first loan application using the form above.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-1 bg-white pb-2">
                        <div className="text-xs text-gray-700">
                            Showing 0 to 0 of 0 entries
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                                Previous
                            </button>
                            <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLoan;
