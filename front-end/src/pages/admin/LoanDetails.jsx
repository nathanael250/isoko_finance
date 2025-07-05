import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    CreditCard,
    User,
    Phone,
    Mail,
    MapPin,
    Building,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Upload,
    Eye
} from 'lucide-react';
import { loansAPI } from '../../services/api';

const LoanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('schedule');
    const [isEditing, setIsEditing] = useState(false);
    const [editedLoan, setEditedLoan] = useState({});
    const [client, setClient] = useState(null);
    const [comments, setComments] = useState([]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedLoan({});
        } else {
            setEditedLoan({ ...loan });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field, value) => {
        setEditedLoan(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Add your save logic here
            console.log('Saving loan data:', editedLoan);
            // await loansAPI.update(id, editedLoan);
            setLoan(editedLoan);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving loan:', error);
        }
    };

    useEffect(() => {
        fetchLoanDetails();
    }, [id]);

    const fetchLoanDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching loan with ID:', id);

            const response = await loansAPI.getLoan(id);
            console.log('API Response:', response.data);

            if (response.data.success) {
                const responseData = response.data.data;
                const loanData = responseData.loan;
                console.log('Loan data received:', loanData);
                console.log('Documents received:', responseData.documents?.length || 0);
                console.log('Comments received:', responseData.comments?.length || 0);

                setLoan({...loanData, documents: responseData.documents || []});
                setComments(responseData.comments || []);

                // Set client data from the same response
                const clientData = {
                    id: loanData.client_id,
                    first_name: loanData.client_first_name,
                    last_name: loanData.client_last_name,
                    client_number: loanData.client_number,
                    gender: loanData.client_gender,
                    mobile: loanData.client_mobile,
                    email: loanData.client_email,
                    address: loanData.client_address,
                    city: loanData.client_city,
                    province_state: loanData.client_state
                };
                setClient(clientData);

            } else {
                setError(response.data.message || 'Failed to fetch loan details');
            }
        } catch (err) {
            console.error('Error fetching loan:', err);
            if (err.response?.status === 404) {
                setError('Loan not found');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load loan details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };


    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return 'RWF 0.00';
        return `RWF ${parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };


    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'under_review': 'bg-blue-100 text-blue-800',
            'approved': 'bg-green-100 text-green-800',
            'disbursed': 'bg-purple-100 text-purple-800',
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800',
            'defaulted': 'bg-red-100 text-red-800',
            'rejected': 'bg-red-100 text-red-800',
            'written_off': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const tabs = [
        { id: 'schedule', label: 'Repayment Schedule', icon: Calendar },
        { id: 'repayments', label: 'Payment History', icon: CreditCard },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'comments', label: 'Comments', icon: FileText }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading loan details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white shadow-sm rounded-lg p-8 max-w-md mx-auto text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Loan</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <div className="space-x-3">
                                <button
                                    onClick={fetchLoanDetails}
                                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/admin/loans')}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200"
                                >
                                    Back to Loans
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!loan) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white shadow-sm rounded-lg p-8 max-w-md mx-auto text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Loan Data</h3>
                            <p className="text-gray-600 mb-6">Loan data could not be loaded.</p>
                            <button
                                onClick={() => navigate('/dashboard/admin/loans')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                            >
                                Back to Loans
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header Section - Matching Admin Dashboard Style */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-4 mb-2">
                            <button
                                onClick={() => navigate('/dashboard/admin/loans')}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Loans
                            </button>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Loan Details - {loan.loan_number}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Account: {loan.loan_account}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                            {loan.status?.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
                {/* Client Information Section - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <User className="bg-blue-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Client Information</h2>
                            </div>
                            <p className="text-gray-600 text-xs">Borrower details and contact information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Client Name</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {loan?.client_first_name && loan?.client_last_name
                                        ? `${loan.client_first_name} ${loan.client_last_name}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Client Number</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">{loan?.client_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">{loan?.client_mobile || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">{loan?.client_email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Address</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {loan?.client_address
                                        ? `${loan.client_address}${loan.client_city ? ', ' + loan.client_city : ''}${loan.client_state ? ', ' + loan.client_state : ''}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Loan Officer</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {loan?.officer_first_name && loan?.officer_last_name
                                        ? `${loan.officer_first_name} ${loan.officer_last_name}`
                                        : 'Not assigned'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loan Summary Section - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <DollarSign className="bg-green-500 p-1.5 rounded text-white w-7 h-7" />
                                    <h2 className="text-gray-900 text-lg font-semibold">Loan Summary</h2>
                                </div>
                                <p className="text-gray-600 text-xs">Detailed loan information and balances</p>
                            </div>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={handleEditToggle}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEditToggle}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan#</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Released</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {loan?.loan_number || 'N/A'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editedLoan.disbursement_date ? new Date(editedLoan.disbursement_date).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleInputChange('disbursement_date', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                loan?.application_date ? formatDate(loan.application_date) : 'Not Released'
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editedLoan.maturity_date ? new Date(editedLoan.maturity_date).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleInputChange('maturity_date', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                loan?.maturity_date ? formatDate(loan.maturity_date) : 'N/A'
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editedLoan.approved_amount || editedLoan.applied_amount || ''}
                                                    onChange={(e) => handleInputChange('approved_amount', e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                formatCurrency(loan?.approved_amount || loan?.applied_amount || 0)
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <div className="flex items-center space-x-1">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editedLoan.interest_rate || ''}
                                                        onChange={(e) => handleInputChange('interest_rate', e.target.value)}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-500">%</span>
                                                </div>
                                            ) : (
                                                loan?.interest_rate ? `${parseFloat(loan.interest_rate).toFixed(2)}%` : 'N/A'
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(loan?.interest_balance || 0)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(loan?.total_fees_including_vat || loan?.total_fees_before_vat || 0)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency((loan?.arrears_principal || 0) + (loan?.arrears_interest || 0))}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(
                                                (loan?.approved_amount || loan?.applied_amount || 0) +
                                                (loan?.interest_balance || 0) +
                                                (loan?.total_fees_including_vat || loan?.total_fees_before_vat || 0)
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(
                                                (loan?.approved_amount || loan?.applied_amount || 0) -
                                                (loan?.principal_balance || 0)
                                            )}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(loan?.loan_balance || loan?.principal_balance || (loan?.approved_amount || loan?.applied_amount || 0))}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {isEditing ? (
                                                <select
                                                    value={editedLoan.status || loan?.status || ''}
                                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="under_review">Under Review</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="disbursed">Disbursed</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="defaulted">Defaulted</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan?.status)}`}>
                                                    {loan?.status ? loan.status.replace('_', ' ').toUpperCase() : 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>


                            </table>
                        </div>
                    </div>
                </div>


                {/* Balance Information - Dashboard Style */}
                {(loan.status === 'active' || loan.status === 'disbursed' || loan.status === 'completed') && (
                    <div className="mb-6">
                        <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <CreditCard className="bg-purple-500 p-1.5 rounded text-white w-7 h-7" />
                                    <h2 className="text-gray-900 text-lg font-semibold">Current Balance</h2>
                                </div>
                                <p className="text-gray-600 text-xs">Outstanding balances and payment status</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                                    <h3 className="text-gray-200 text-sm font-medium mb-3">Outstanding Balance</h3>
                                    <span className="text-2xl font-bold text-white">
                                        {formatCurrency(loan.loan_balance)}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 shadow-sm rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                                    <h3 className="text-gray-200 text-sm font-medium mb-3">Principal Balance</h3>
                                    <span className="text-2xl font-bold text-white">
                                        {formatCurrency(loan.principal_balance)}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-sm rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                                    <h3 className="text-gray-200 text-sm font-medium mb-3">Interest Balance</h3>
                                    <span className="text-2xl font-bold text-white">
                                        {formatCurrency(loan.interest_balance)}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                                    <h3 className="text-gray-200 text-sm font-medium mb-3">Installments Paid</h3>
                                    <span className="text-2xl font-bold text-white">
                                        {loan.installments_paid || 0} / {loan.total_installments || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Arrears Information */}
                            {(loan.arrears_principal > 0 || loan.arrears_interest > 0 || loan.days_in_arrears > 0) && (
                                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Arrears Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-red-700">Principal Arrears</label>
                                            <p className="text-lg font-semibold text-red-600">
                                                {formatCurrency(loan.arrears_principal)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-red-700">Interest Arrears</label>
                                            <p className="text-lg font-semibold text-red-600">
                                                {formatCurrency(loan.arrears_interest)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-red-700">Days in Arrears</label>
                                            <p className="text-lg font-semibold text-red-600">
                                                {loan.days_in_arrears || 0} days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs Section - Dashboard Style */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg relative overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <nav className="flex space-x-8 px-4 py-2" aria-label="Tabs">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600 bg-white'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center rounded-t-lg transition-all duration-200`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                            <div className="p-4">
                                {activeTab === 'schedule' && <ScheduleTab loanId={id} />}
                                {activeTab === 'repayments' && <RepaymentsTab loanId={id} />}
                                {activeTab === 'documents' && <DocumentsTab loanId={id} initialDocuments={loan?.documents || []} />}
                                {activeTab === 'comments' && <CommentsTab loanId={id} comments={comments} fetchLoanDetails={fetchLoanDetails} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
    );
};

// Schedule Tab Component (keep your existing implementation)
const ScheduleTab = ({ loanId }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasSchedule, setHasSchedule] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, [loanId]);

    const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await loansAPI.getSchedule(loanId);

            if (response.data.success) {
                const scheduleData = response.data.data?.schedule || [];
                setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
                setHasSchedule(true);
                setError(null);
            } else {
                setSchedule([]);
                setHasSchedule(false);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);

            if (err.response?.status === 404) {
                setError('Loan not found');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load schedule. Please try again.');
            }
            setSchedule([]);
            setHasSchedule(false);
        } finally {
            setLoading(false);
        }
    };

    const generateSchedule = async () => {
        try {
            setLoading(true);
            await fetchSchedule();
        } catch (err) {
            console.error('Error generating schedule:', err);
            setError('Failed to generate schedule');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount) || amount === null || amount === undefined) {
            return 'RWF 0.00';
        }
        const numAmount = parseFloat(amount);
        return `RWF ${numAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };


    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInstallmentStatusColor = (status) => {
        const colors = {
            'paid': 'bg-green-100 text-green-800',
            'partial': 'bg-yellow-100 text-yellow-800',
            'overdue': 'bg-red-100 text-red-800',
            'pending': 'bg-gray-100 text-gray-800',
            'upcoming': 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading repayment schedule...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Repayment Schedule</h3>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchSchedule}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    {!hasSchedule && (
                        <button
                            onClick={generateSchedule}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Generate Schedule
                        </button>
                    )}
                    {hasSchedule && (
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download className="w-4 h-4 mr-2" />
                            Export Schedule
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <div>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={fetchSchedule}
                                className="text-red-800 underline text-sm mt-1"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!hasSchedule && !error ? (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Repayment Schedule</h4>
                    <p className="text-gray-600 mb-4">
                        This loan doesn't have a repayment schedule yet.
                    </p>
                    <button
                        onClick={generateSchedule}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Generate Schedule
                    </button>
                </div>
            ) : hasSchedule && schedule.length > 0 ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900">Total Installments</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {schedule.length}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-900">Paid Installments</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {schedule.filter(s => s.status === 'paid').length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-yellow-900">Pending Installments</h4>
                            <p className="text-2xl font-bold text-yellow-600">
                                {schedule.filter(s => s.status === 'pending').length}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-purple-900">Total Amount</h4>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(schedule.reduce((sum, s) => sum + parseFloat(s.total_due || 0), 0))}
                            </p>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fees
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Due
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Paid
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {schedule.map((installment, index) => (
                                        <tr key={installment.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {installment.installment_number || index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(installment.due_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(installment.principal_due)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(installment.interest_due)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(installment.fees_due)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(installment.total_due)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="space-y-1">
                                                    <div>{formatCurrency(installment.total_paid)}</div>
                                                    {installment.payment_date && (
                                                        <div className="text-xs text-gray-500">
                                                            Paid: {formatDate(installment.payment_date)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(installment.balance_after)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInstallmentStatusColor(installment.status)}`}>
                                                    {installment.status || 'pending'}
                                                </span>
                                                {installment.days_overdue > 0 && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {installment.days_overdue} days overdue
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

// Repayments Tab Component
const RepaymentsTab = ({ loanId }) => {
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRepayments();
    }, [loanId]);

    const fetchRepayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await loansAPI.getRepayments(loanId);
            if (response.data.success) {
                setRepayments(response.data.data || []);
            } else {
                setRepayments([]);
            }
        } catch (err) {
            console.error('Error fetching repayments:', err);
            setError('Failed to load repayment history');
            setRepayments([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return 'RWF 0.00';
        return `RWF ${parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPaymentMethodColor = (method) => {
        const colors = {
            'cash': 'bg-green-100 text-green-800',
            'bank_transfer': 'bg-blue-100 text-blue-800',
            'mobile_money': 'bg-purple-100 text-purple-800',
            'check': 'bg-yellow-100 text-yellow-800'
        };
        return colors[method] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchRepayments}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Record Payment
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <div>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={fetchRepayments}
                                className="text-red-800 underline text-sm mt-1"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {repayments.length === 0 && !error ? (
                <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h4>
                    <p className="text-gray-600 mb-4">
                        No payments have been recorded for this loan yet.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Record First Payment
                    </button>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-900">Total Payments</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {repayments.length}
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900">Total Amount Paid</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(repayments.reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0))}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-purple-900">Last Payment</h4>
                            <p className="text-2xl font-bold text-purple-600">
                                {repayments.length > 0 ? formatDate(repayments[0].payment_date) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount Paid
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fees
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Received By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {repayments.map((payment, index) => (
                                        <tr key={payment.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(payment.payment_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(payment.amount_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(payment.principal_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(payment.interest_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(payment.fees_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(payment.payment_method)}`}>
                                                    {payment.payment_method?.replace('_', ' ') || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.received_by_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Documents Tab Component
const DocumentsTab = ({ loanId, initialDocuments = [] }) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        console.log('DocumentsTab useEffect - initialDocuments:', initialDocuments.length);
        if (initialDocuments.length > 0) {
            console.log('Using initial documents:', initialDocuments);
            setDocuments(initialDocuments);
            setLoading(false);
        } else {
            console.log('Fetching documents via API...');
            fetchDocuments();
        }
    }, [loanId, initialDocuments]);

    const fetchDocuments = async () => {
        console.log('fetchDocuments called for loanId:', loanId);
        setLoading(true);
        setError(null);
        try {
            const response = await loansAPI.getDocuments(loanId);
            console.log('Documents API response:', response.data);
            if (response.data.success) {
                console.log('Documents fetched:', response.data.data?.length || 0);
                setDocuments(response.data.data || []);
            } else {
                console.log('Documents API returned success:false');
                setDocuments([]);
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
            console.error('Error details:', err.response?.data);
            setError('Failed to load documents');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (formData) => {
        setUploading(true);
        try {
            const response = await loansAPI.uploadDocument(loanId, formData);
            if (response.data.success) {
                alert('Document uploaded successfully!');
                fetchDocuments(); // Refresh documents list
                setShowUploadModal(false);
            } else {
                alert('Failed to upload document: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error uploading document:', err);
            alert('Error uploading document: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await loansAPI.downloadDocument(loanId, doc.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.file_name || 'document');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading document:', err);
            alert('Error downloading document');
        }
    };

    const handleDelete = async (doc) => {
        if (!window.confirm(`Are you sure you want to delete "${doc.file_name}"?`)) return;
        
        try {
            await loansAPI.deleteDocument(loanId, doc.id);
            alert('Document deleted successfully!');
            fetchDocuments(); // Refresh documents list
        } catch (err) {
            console.error('Error deleting document:', err);
            alert('Error deleting document: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleStatusUpdate = async (documentId, newStatus) => {
        try {
            await loansAPI.updateDocumentStatus(loanId, documentId, { status: newStatus });
            alert(`Document ${newStatus} successfully!`);
            fetchDocuments(); // Refresh documents list
        } catch (err) {
            console.error('Error updating document status:', err);
            alert('Error updating document status: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDocumentTypeColor = (type) => {
        const colors = {
            'application': 'bg-blue-100 text-blue-800',
            'id_copy': 'bg-green-100 text-green-800',
            'income_proof': 'bg-yellow-100 text-yellow-800',
            'bank_statement': 'bg-purple-100 text-purple-800',
            'business_license': 'bg-indigo-100 text-indigo-800',
            'collateral_document': 'bg-red-100 text-red-800',
            'other': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Loan Documents</h3>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchDocuments}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <div>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={fetchDocuments}
                                className="text-red-800 underline text-sm mt-1"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {documents.length === 0 && !error ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h4>
                    <p className="text-gray-600 mb-4">
                        No documents have been uploaded for this loan yet.
                    </p>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First Document
                    </button>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900">Total Documents</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {documents.length}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-900">Verified Documents</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {documents.filter(d => d.is_verified).length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-yellow-900">Pending Verification</h4>
                            <p className="text-2xl font-bold text-yellow-600">
                                {documents.filter(d => !d.is_verified).length}
                            </p>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((document, index) => (
                            <div key={document.id || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <FileText className="w-8 h-8 text-gray-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {document.file_name || 'Untitled Document'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(document.file_size)}
                                            </p>
                                        </div>
                                    </div>
                                    {document.status === 'approved' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : document.status === 'rejected' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDocumentTypeColor(document.file_type)}`}>
                                            {document.file_type?.replace('_', ' ') || 'Unknown'}
                                        </span>
                                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            document.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {document.status || 'pending_review'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {document.description || 'No description provided'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Uploaded: {formatDate(document.created_at)}
                                    </p>
                                    {document.uploaded_by_name && (
                                        <p className="text-xs text-gray-500">
                                            By: {document.uploaded_by_name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleDownload(document)}
                                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </button>
                                    <button 
                                        onClick={() => handleDownload(document)}
                                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(document)}
                                        className="flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {document.status === 'pending_review' && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleStatusUpdate(document.id, 'approved')}
                                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(document.id, 'rejected')}
                                                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadDocumentModal 
                    loanId={loanId}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleFileUpload}
                    uploading={uploading}
                />
            )}
        </div>
    );
};

// Upload Document Modal Component
const UploadDocumentModal = ({ loanId, onClose, onUpload, uploading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('other');
    const [description, setDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('document_type', documentType);
        formData.append('description', description);

        onUpload(formData);
    };

    const documentTypes = [
        { value: 'application', label: 'Application' },
        { value: 'id_copy', label: 'ID Copy' },
        { value: 'income_proof', label: 'Income Proof' },
        { value: 'collateral_document', label: 'Collateral Document' },
        { value: 'bank_statement', label: 'Bank Statement' },
        { value: 'business_license', label: 'Business License' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Document File</label>
                        <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center ${
                                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-8 h-8 text-green-500 mx-auto" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-600 text-sm hover:text-red-800"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                    <p className="text-sm text-gray-600">
                                        Drag and drop a file here, or 
                                        <label className="text-blue-600 hover:text-blue-800 cursor-pointer ml-1">
                                            browse
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            />
                                        </label>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, JPG, PNG up to 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Type
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {documentTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Optional description for this document..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// New CommentsTab component
const CommentsTab = ({ loanId, comments, fetchLoanDetails }) => {
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState('general');
    const [isInternal, setIsInternal] = useState(true);
    const [priority, setPriority] = useState('medium');
    const [addingComment, setAddingComment] = useState(false);

    const handleAddComment = async (e) => {
        e.preventDefault();
        setAddingComment(true);
        try {
            await loansAPI.addComment(loanId, {
                comment: newComment,
                comment_type: commentType,
                is_internal: isInternal,
                priority: priority
            });
            setNewComment('');
            setCommentType('general');
            setIsInternal(true);
            setPriority('medium');
            fetchLoanDetails(); // Refresh comments after adding
            alert('Comment added successfully!');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment.');
        } finally {
            setAddingComment(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            return 'N/A';
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Comment Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Comment</h3>
                <form onSubmit={handleAddComment} className="space-y-4">
                    <div>
                        <label htmlFor="newComment" className="block text-sm font-medium text-gray-700">Comment</label>
                        <textarea
                            id="newComment"
                            rows="3"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="commentType" className="block text-sm font-medium text-gray-700">Comment Type</label>
                            <select
                                id="commentType"
                                value={commentType}
                                onChange={(e) => setCommentType(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="general">General</option>
                                <option value="loan_officer_note">Loan Officer Note</option>
                                <option value="client_interaction">Client Interaction</option>
                                <option value="approval_decision">Approval Decision</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="isInternal"
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isInternal" className="ml-2 block text-sm text-gray-900">Internal Comment (not visible to client)</label>
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={addingComment}
                    >
                        {addingComment ? 'Adding...' : 'Add Comment'}
                    </button>
                </form>
            </div>

            {/* Existing Comments List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments History</h3>
                {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                        {comment.created_by_name} {comment.created_by_lastname} • {formatDate(comment.created_at)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${comment.is_internal ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {comment.is_internal ? 'Internal' : 'Public'}
                                    </span>
                                </div>
                                <p className="mt-2 text-gray-800 text-sm">{comment.comment}</p>
                                <div className="flex text-xs text-gray-600 mt-1 space-x-2">
                                    <span>Type: {comment.comment_type}</span>
                                    <span>Priority: {comment.priority}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanDetails;