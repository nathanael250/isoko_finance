import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import { getStatusColor } from '../../utils/loanUtils'; // Assuming getStatusColor is defined here or imported

const LoanSchedule = () => {
    const { loanId } = useParams();
    const [loan, setLoan] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loanId) {
            fetchLoanSchedule();
        }
    }, [loanId]);

    const fetchLoanSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/loans/${loanId}/schedule`);
            if (response.data.success) {
                setLoan(response.data.data.loan);
                setSchedule(response.data.data.schedule);
            }
        } catch (err) {
            console.error('Error fetching loan schedule:', err);
            setError('Failed to load loan schedule.');
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
        return <div className="text-center p-6">Loading loan schedule...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-600">Error: {error}</div>;
    }

    if (!loan) {
        return <div className="text-center p-6">Loan not found or invalid ID.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Loan Schedule for {loan.loan_number}</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Loan Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                        <div><strong>Client Name:</strong> {loan.client_name}</div>
                        <div><strong>Principal Amount:</strong> {formatCurrency(loan.principal_amount)}</div>
                        <div><strong>Interest Rate:</strong> {loan.interest_rate}%</div>
                        <div><strong>Term:</strong> {loan.loan_term} {loan.repayment_cycle_type}</div>
                        <div><strong>Loan Status:</strong> 
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                                {loan.status}
                            </span>
                        </div>
                        <div><strong>Disbursement Date:</strong> {formatDate(loan.disbursement_date)}</div>
                        <div><strong>Maturity Date:</strong> {formatDate(loan.maturity_date)}</div>
                        {/* Add more loan details as needed */}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedule.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No schedule found for this loan.
                                    </td>
                                </tr>
                            ) : (
                                schedule.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.installment_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.due_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.principal_due)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.interest_due)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.total_due)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.outstanding_balance)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
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

export default LoanSchedule; 