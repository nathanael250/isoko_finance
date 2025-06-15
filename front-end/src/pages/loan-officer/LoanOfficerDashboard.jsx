import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Users,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    TrendingUp,
    Calendar,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AddBorrowerModal from '../../components/modals/AddBorrowerModal';

const LoanOfficerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalLoanAmount: 0,
        thisMonthApplications: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddBorrowerModal, setShowAddBorrowerModal] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch loan officer statistics
            const statsResponse = await api.get('/loan-officer/stats');
            const loansResponse = await api.get('/loan-officer/loans');

            if (statsResponse.data.success) {
                const statsData = statsResponse.data.data.summary;
                setStats({
                    totalApplications: statsData.total_loans,
                    pendingApplications: statsData.pending_loans,
                    approvedApplications: statsData.active_loans,
                    rejectedApplications: 0, // This data is not available in the current API
                    totalLoanAmount: statsData.total_portfolio,
                    thisMonthApplications: 0 // This data is not available in the current API
                });
            }

            if (loansResponse.data.success) {
                setRecentApplications(loansResponse.data.data.loans.map(loan => ({
                    id: loan.id,
                    borrower: {
                        first_name: loan.client_name.split(' ')[0],
                        last_name: loan.client_name.split(' ')[1],
                        email: loan.client_email
                    },
                    loan_amount: loan.applied_amount,
                    loan_purpose: loan.purpose || 'Not specified',
                    status: loan.status,
                    createdAt: loan.created_at
                })));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, change }) => (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
            disbursed: { color: 'bg-blue-100 text-blue-800', text: 'Disbursed' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.first_name}!
                    </h1>
                    <p className="text-gray-600">Manage loan applications and help customers achieve their goals</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/loan-officer/loans/add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Loan Application
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={FileText}
                    color="bg-blue-500"
                    change={12}
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pendingApplications}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Approved"
                    value={stats.approvedApplications}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejectedApplications}
                    icon={XCircle}
                    color="bg-red-500"
                />
                <StatCard
                    title="Total Amount"
                    value={`$${stats.totalLoanAmount?.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
                <StatCard
                    title="This Month"
                    value={stats.thisMonthApplications}
                    icon={TrendingUp}
                    color="bg-indigo-500"
                    change={8}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard/loan-officer/loans/add')}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">New Loan Application</span>
                            </div>
                        </button>
                        <button 
                            onClick={() => setShowAddBorrowerModal(true)}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Add New Borrower</span>
                            </div>
                        </button>
                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">Search Applications</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Application Status Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pending</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(stats.pendingApplications / stats.totalApplications) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium">{stats.pendingApplications}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Approved</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${(stats.approvedApplications / stats.totalApplications) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium">{stats.approvedApplications}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rejected</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${(stats.rejectedApplications / stats.totalApplications) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium">{stats.rejectedApplications}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Performance */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats.thisMonthApplications}</div>
                            <div className="text-sm text-gray-600">Applications This Month</div>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Target: 25</span>
                                <span className="font-medium">
                                    {Math.round((stats.thisMonthApplications / 25) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((stats.thisMonthApplications / 25) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Borrower
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purpose
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Applied
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2">Loading applications...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : recentApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No recent applications found
                                    </td>
                                </tr>
                            ) : (
                                recentApplications.map((application) => (
                                    <tr key={application.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {application.borrower?.first_name?.charAt(0)}
                                                            {application.borrower?.last_name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.borrower?.first_name} {application.borrower?.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {application.borrower?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${application.loan_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {application.loan_purpose}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(application.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                                                View
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Borrower Modal */}
            {showAddBorrowerModal && (
                <AddBorrowerModal
                    isOpen={showAddBorrowerModal}
                    onClose={() => setShowAddBorrowerModal(false)}
                    onBorrowerAdded={() => {
                        fetchDashboardData();
                        setShowAddBorrowerModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default LoanOfficerDashboard;
