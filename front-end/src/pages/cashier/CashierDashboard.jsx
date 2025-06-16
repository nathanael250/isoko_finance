import React, { useState, useEffect } from 'react';
import { 
    DollarSign, 
    CreditCard, 
    Receipt, 
    Calculator,
    Search,
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import RecordPaymentModal from '../../components/cashier/RecordPaymentModal';

const CashierDashboard = () => {
    const { user } = useAuth();
    const [todayStats, setTodayStats] = useState({
        totalCollections: 0,
        transactionCount: 0,
        cashAmount: 0,
        mobileAmount: 0,
        bankAmount: 0,
        lastTransaction: null
    });

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [dueTodayLoans, setDueTodayLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch today's summary
            const summaryResponse = await api.get('/cashier/summary/today');
            if (summaryResponse.data.success) {
                setTodayStats(summaryResponse.data.data);
            }

            // Fetch recent transactions
            const transactionsResponse = await api.get('/cashier/transactions/recent');
            if (transactionsResponse.data.success) {
                setRecentTransactions(transactionsResponse.data.data);
            }

            // Fetch loans due today
            const dueLoansResponse = await api.get('/cashier/loans/due-today');
            if (dueLoansResponse.data.success) {
                setDueTodayLoans(dueLoansResponse.data.data);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="mt-4 text-red-600">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cashier Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsRecordPaymentModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <DollarSign className="w-4 h-4" />
                            Record Payment
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Calculator className="w-4 h-4" />
                            Cash Count
                        </button>
                    </div>
                </div>

                {/* Today's Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <SummaryCard 
                        title="Total Collections"
                        value={formatCurrency(todayStats.totalCollections)}
                        icon={DollarSign}
                        color="green"
                    />
                    <SummaryCard 
                        title="Transactions"
                        value={todayStats.transactionCount}
                        icon={Receipt}
                        color="blue"
                    />
                    <SummaryCard 
                        title="Cash Payments"
                        value={formatCurrency(todayStats.cashAmount)}
                        icon={CreditCard}
                        color="purple"
                    />
                    <SummaryCard 
                        title="Due Today"
                        value={dueTodayLoans.length}
                        icon={Clock}
                        color="orange"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Recent Transactions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Receipt
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Client
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
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {transaction.receipt_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.client_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(transaction.amount_paid)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.payment_method}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(transaction.payment_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Due Payments */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Loans Due Today</h2>
                            </div>
                            <div className="p-6">
                                {dueTodayLoans.length === 0 ? (
                                    <p className="text-gray-500 text-center">No loans due today</p>
                                ) : (
                                    <div className="space-y-4">
                                        {dueTodayLoans.map((loan) => (
                                            <div key={loan.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
        <div>
                                                        <p className="font-medium text-gray-900">{loan.client_name}</p>
                                                        <p className="text-sm text-gray-500">{loan.loan_number}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            {formatCurrency(loan.total_due)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Installment #{loan.installment_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordPaymentModal 
                isOpen={isRecordPaymentModalOpen}
                onClose={() => setIsRecordPaymentModalOpen(false)}
                onSuccess={fetchDashboardData} // Refresh data after successful payment
            />
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        green: 'text-green-600 bg-green-100',
        blue: 'text-blue-600 bg-blue-100',
        purple: 'text-purple-600 bg-purple-100',
        orange: 'text-orange-600 bg-orange-100'
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
