import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { getStatusColor } from '../../utils/loanUtils'; // Assuming you have a loanUtils for status color

const DueCollections = () => {
    const [dueLoans, setDueLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('today'); // 'today' or 'this_week'

    useEffect(() => {
        fetchDueLoans();
    }, [filterType]);

    const fetchDueLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '';
            if (filterType === 'today') {
                endpoint = '/cashier/loans/due-today';
            } else if (filterType === 'this_week') {
                // We'll need to create this endpoint later if not already existing
                endpoint = '/cashier/loans/due-this-week'; 
            }
            
            const response = await api.get(endpoint);
            if (response.data.success) {
                setDueLoans(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching due loans:', err);
            setError('Failed to load due collections.');
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
        return format(new Date(dateString), 'PPP');
    };

    if (loading) {
        return <div className="text-center p-6">Loading due collections...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Due Collections</h1>

                {/* Filter buttons */}
                <div className="mb-6 flex space-x-4">
                    <button 
                        onClick={() => setFilterType('today')}
                        className={`px-4 py-2 rounded-lg ${filterType === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Due Today
                    </button>
                    <button 
                        onClick={() => setFilterType('this_week')}
                        className={`px-4 py-2 rounded-lg ${filterType === 'this_week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Due This Week
                    </button>
                </div>

                {/* Due Loans Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dueLoans.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No loans due {filterType === 'today' ? 'today' : 'this week'}.
                                    </td>
                                </tr>
                            ) : (
                                dueLoans.map((loan) => (
                                    <tr key={loan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loan_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.client_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(loan.due_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.installment_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(loan.total_due)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => console.log('View loan details for', loan.id)} // Placeholder for viewing loan details
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DueCollections; 