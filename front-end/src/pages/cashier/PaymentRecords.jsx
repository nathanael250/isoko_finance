import React, { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { cashierAPI } from '../../services/api';

const PaymentRecords = () => {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        payment_method: 'cash',
        receipt_number: '',
        notes: '',
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await cashierAPI.getRecentPayments({ limit: 50 });

            if (response.data.success) {
                setPayments(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch payments');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const searchLoans = async (term) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await cashierAPI.searchLoans({ q: term });
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (err) {
            console.error('Error searching loans:', err);
            setSearchResults([]);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Debounce search
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }

        window.searchTimeout = setTimeout(() => {
            searchLoans(value);
        }, 300);
    };

    const handleLoanSelect = (loan) => {
        setSelectedLoan(loan);
        setSearchTerm(`${loan.client_name} - ${loan.loan_number}`);
        setSearchResults([]);
        setShowPaymentForm(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedLoan) {
            setError('Please select a loan first');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const paymentData = {
                loan_id: selectedLoan.id,
                amount: parseFloat(formData.amount),
                payment_method: formData.payment_method,
                receipt_number: formData.receipt_number,
                notes: formData.notes
            };

            const response = await cashierAPI.recordPayment(paymentData);

            if (response.data.success) {
                setSuccess('Payment recorded successfully!');
                setShowPaymentForm(false);
                setSelectedLoan(null);
                setFormData({
                    amount: '',
                    payment_method: 'cash',
                    receipt_number: '',
                    notes: '',
                });
                setSearchTerm('');
                fetchPayments(); // Refresh the payments list
            } else {
                throw new Error(response.data.message || 'Failed to record payment');
            }
        } catch (err) {
            console.error('Error recording payment:', err);
            setError(err.response?.data?.message || err.message || 'Failed to record payment');
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment Records</h1>
                <p className="mt-2 text-gray-600">Record and manage loan repayments</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by client name, loan number, or mobile..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {searchResults.map((loan) => (
                                <div
                                    key={loan.id}
                                    onClick={() => handleLoanSelect(loan)}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {loan.client_name}
                                            </span>
                                            <span className="ml-2 text-gray-500">
                                                {loan.loan_number}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                Balance: {formatCurrency(loan.loan_balance)}
                                            </div>
                                            {loan.amount_due > 0 && (
                                                <div className="text-xs text-red-600">
                                                    Due: {formatCurrency(loan.amount_due)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        setShowPaymentForm(true);
                        clearMessages();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Record Payment
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                        <button
                            onClick={clearMessages}
                            className="ml-auto text-green-400 hover:text-green-600"
                        >
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                        <button
                            onClick={clearMessages}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Form Modal */}
            {showPaymentForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Record Payment
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowPaymentForm(false);
                                        setSelectedLoan(null);
                                        setSearchTerm('');
                                        clearMessages();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {selectedLoan && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedLoan.client_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Loan: {selectedLoan.loan_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Balance: {formatCurrency(selectedLoan.loan_balance)}
                                    </p>
                                    {selectedLoan.amount_due > 0 && (
                                        <p className="text-sm text-red-600">
                                            Amount Due: {formatCurrency(selectedLoan.amount_due)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        max={selectedLoan?.loan_balance || undefined}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter payment amount"
                                    />
                                    {selectedLoan?.amount_due > 0 && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Suggested: {formatCurrency(selectedLoan.amount_due)} (amount due)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Payment Method *
                                    </label>
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Receipt Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="receipt_number"
                                        value={formData.receipt_number}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter receipt number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add any additional notes..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentForm(false);
                                            setSelectedLoan(null);
                                            setFormData({
                                                amount: '',
                                                payment_method: 'cash',
                                                receipt_number: '',
                                                notes: '',
                                            });
                                            setSearchTerm('');
                                            clearMessages();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedLoan}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Recording...' : 'Record Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Payments Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Recent Payments
                        </h3>
                        <button
                            onClick={fetchPayments}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {loading && payments.length === 0 ? (
                    <div className="text-center py-12">
                        <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Loading payments...</h3>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by recording your first payment.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <li key={payment.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {payment.client_name}
                                                    </p>
                                                    <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                                        {payment.loan_number}
                                                    </p>
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <p>
                                                        Receipt: {payment.receipt_number}
                                                    </p>
                                                    <span className="mx-2">•</span>
                                                    <p>
                                                        {payment.payment_method.replace('_', ' ').toUpperCase()}
                                                    </p>
                                                    {payment.received_by_name && (
                                                        <>
                                                            <span className="mx-2">•</span>
                                                            <p>by {payment.received_by_name}</p>
                                                        </>
                                                    )}
                                                </div>
                                                {payment.notes && (
                                                    <p className="mt-1 text-xs text-gray-400 italic">
                                                        {payment.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-green-600">
                                                    {formatCurrency(payment.amount_paid)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(payment.payment_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PaymentRecords;
