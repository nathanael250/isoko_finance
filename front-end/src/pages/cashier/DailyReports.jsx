import React, { useState, useEffect } from 'react';
import { cashierAPI } from '../../services/api';

const DailyReports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({
        totalCollections: 0,
        transactionCount: 0,
        cashAmount: 0,
        mobileAmount: 0,
        bankAmount: 0,
        lastTransaction: null
    });
    const [transactions, setTransactions] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchDailyReport = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching daily report for date:', date);

            // Use Promise.allSettled to handle partial failures
            const [summaryResult, transactionsResult] = await Promise.allSettled([
                cashierAPI.getTodaySummary({ date }),
                cashierAPI.getRecentTransactions({ date, limit: 20 })
            ]);

            // Handle summary response
            if (summaryResult.status === 'fulfilled' && summaryResult.value.data.success) {
                setSummary(summaryResult.value.data.data);
            } else {
                console.error('Summary fetch failed:', summaryResult.reason || summaryResult.value);
                setSummary({
                    totalCollections: 0,
                    transactionCount: 0,
                    cashAmount: 0,
                    mobileAmount: 0,
                    bankAmount: 0,
                    lastTransaction: null
                });
            }

            // Handle transactions response
            if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data.success) {
                setTransactions(transactionsResult.value.data.data);
            } else {
                console.error('Transactions fetch failed:', transactionsResult.reason || transactionsResult.value);
                setTransactions([]);
            }

            // Only set error if both requests failed
            if (summaryResult.status === 'rejected' && transactionsResult.status === 'rejected') {
                throw new Error('Failed to fetch daily report data');
            }

        } catch (err) {
            console.error('Error fetching daily report:', err);
            setError(err.response?.data?.message || err.message || 'Error fetching daily report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyReport();
    }, [date]);

    // Format currency helper
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return 'RWF 0.00';
        return `RWF ${parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Rest of your component...
    if (loading) {
  return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchDailyReport}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
    </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Reports</h1>

            {/* Date Selector */}
            <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                </label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">Total Collections</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalCollections)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                    <p className="text-3xl font-bold text-blue-600">{summary.transactionCount}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">Cash Collections</h3>
                    <p className="text-3xl font-bold text-yellow-600">{formatCurrency(summary.cashAmount)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">Mobile Money</h3>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(summary.mobileAmount)}</p>
                </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Payment Method Breakdown</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.cashAmount)}</div>
                            <div className="text-sm text-gray-500">Cash Payments</div>
                            <div className="text-xs text-gray-400">
                                {summary.totalCollections > 0 ?
                                    `${((summary.cashAmount / summary.totalCollections) * 100).toFixed(1)}%` :
                                    '0%'
                                }
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.mobileAmount)}</div>
                            <div className="text-sm text-gray-500">Mobile Money</div>
                            <div className="text-xs text-gray-400">
                                {summary.totalCollections > 0 ?
                                    `${((summary.mobileAmount / summary.totalCollections) * 100).toFixed(1)}%` :
                                    '0%'
                                }
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.bankAmount)}</div>
                            <div className="text-sm text-gray-500">Bank Transfers</div>
                            <div className="text-xs text-gray-400">
                                {summary.totalCollections > 0 ?
                                    `${((summary.bankAmount / summary.totalCollections) * 100).toFixed(1)}%` :
                                    '0%'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Receipt #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Received By
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No transactions found for {date}
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transaction.receipt_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.client_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.loan_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(transaction.amount_paid)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                                                    transaction.payment_method === 'mobile_money' ? 'bg-blue-100 text-blue-800' :
                                                        transaction.payment_method === 'bank_transfer' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {transaction.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transaction.payment_date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.received_by_name || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export and Print Actions */}
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                </button>

                <button
                    onClick={() => {
                        // Export to CSV functionality
                        const csvContent = [
                            ['Receipt #', 'Client', 'Loan #', 'Amount', 'Method', 'Time', 'Received By'],
                            ...transactions.map(t => [
                                t.receipt_number || 'N/A',
                                t.client_name,
                                t.loan_number,
                                t.amount_paid,
                                t.payment_method,
                                new Date(t.payment_date).toLocaleString(),
                                t.received_by_name || 'N/A'
                            ])
                        ].map(row => row.join(',')).join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `daily-report-${date}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                </button>
            </div>
        </div>
    );
};

export default DailyReports;
