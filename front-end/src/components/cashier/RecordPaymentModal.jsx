import React, { useState, useEffect } from 'react';
import { X, Search, DollarSign } from 'lucide-react';
import api from '../../services/api';

const RecordPaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (searchQuery.length >= 3) {
            searchLoans();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const searchLoans = async () => {
        try {
            const response = await api.get(`/loans/search?query=${searchQuery}`);
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (err) {
            console.error('Error searching loans:', err);
            setError('Failed to search loans');
        }
    };

    const handleLoanSelect = (loan) => {
        setSelectedLoan(loan);
        setPaymentData(prev => ({
            ...prev,
            amount: loan.installment_amount || ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLoan) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/repayments', {
                loanId: selectedLoan.id,
                amount: parseFloat(paymentData.amount),
                paymentMethod: paymentData.paymentMethod,
                notes: paymentData.notes
            });

            if (response.data.success) {
                onSuccess(response.data.data);
                onClose();
            }
        } catch (err) {
            console.error('Error recording payment:', err);
            setError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!selectedLoan ? (
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by loan number, client name, or phone..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mt-4 max-h-60 overflow-y-auto">
                                    {searchResults.map((loan) => (
                                        <div
                                            key={loan.id}
                                            onClick={() => handleLoanSelect(loan)}
                                            className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{loan.client_name}</p>
                                                    <p className="text-sm text-gray-500">Loan #{loan.loan_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">
                                                        RWF {parseFloat(loan.installment_amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Due: {new Date(loan.next_due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedLoan.client_name}</p>
                                            <p className="text-sm text-gray-500">Loan #{selectedLoan.loan_number}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedLoan(null)}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                value={paymentData.amount}
                                                onChange={(e) => setPaymentData(prev => ({
                                                    ...prev,
                                                    amount: e.target.value
                                                }))}
                                                className="pl-10 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            value={paymentData.paymentMethod}
                                            onChange={(e) => setPaymentData(prev => ({
                                                ...prev,
                                                paymentMethod: e.target.value
                                            }))}
                                            className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="mobile_money">Mobile Money</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={paymentData.notes}
                                            onChange={(e) => setPaymentData(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                            className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            placeholder="Optional notes about this payment..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal; 