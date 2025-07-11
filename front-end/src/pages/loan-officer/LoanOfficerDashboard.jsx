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
    const [borrowerCount, setBorrowerCount] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch loan officer statistics
            const statsResponse = await api.get('/loan-officer/stats');
            const loansResponse = await api.get('/loan-officer/loans');
            // Fetch assigned borrowers count
            let borrowersCount = 0;
            try {
                const borrowersRes = await api.get('/loan-officer/borrowers', { params: { assigned_officer: user?.id } });
                if (borrowersRes.data.success && borrowersRes.data.data && Array.isArray(borrowersRes.data.data.clients)) {
                    borrowersCount = borrowersRes.data.data.clients.length;
                }
            } catch (e) { borrowersCount = 0; }
            setBorrowerCount(borrowersCount);

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

    const StatCard = ({ title, value, icon: Icon, color, loading = false }) => {
        if (loading) {
            return (
                <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden animate-pulse">
                    <div className="flex justify-between items-center mb-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-7 w-7 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
            );
        }
        const colorMap = {
            'bg-blue-500': 'from-blue-500 to-blue-600',
            'bg-yellow-500': 'from-yellow-400 to-yellow-500',
            'bg-green-500': 'from-green-500 to-green-600',
            'bg-red-500': 'from-red-500 to-red-600',
            'bg-purple-500': 'from-purple-500 to-purple-600',
            'bg-indigo-500': 'from-indigo-500 to-indigo-600',
        };
        const gradientColor = colorMap[color] || 'from-gray-500 to-gray-600';
        return (
            <div className={`bg-gradient-to-r ${gradientColor} shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-gray-600 text-sm font-medium">{title}</h2>
                    <Icon className={`p-1.5 rounded text-white w-10 h-10 `} />
                </div>
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
        );
    };

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
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Loan Officer Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-1">Manage your assigned borrowers and applications</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/loan-officer/loans/add')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Loan Application
                    </button>
                </div>
                {/* Main Statistics Grid */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        <StatCard
                            title="Borrowers"
                            value={borrowerCount}
                            icon={Users}
                            color="bg-green-500"
                            loading={loading}
                        />
                        <StatCard
                            title="Total Applications"
                            value={stats.totalApplications}
                            icon={FileText}
                            color="bg-blue-500"
                            loading={loading}
                        />
                        <StatCard
                            title="Pending Review"
                            value={stats.pendingApplications}
                            icon={Clock}
                            color="bg-yellow-500"
                            loading={loading}
                        />
                        <StatCard
                            title="Approved"
                            value={stats.approvedApplications}
                            icon={CheckCircle}
                            color="bg-green-500"
                            loading={loading}
                        />
                        <StatCard
                            title="Rejected"
                            value={stats.rejectedApplications}
                            icon={XCircle}
                            color="bg-red-500"
                            loading={loading}
                        />
                        <StatCard
                            title="Total Amount"
                            value={`$${stats.totalLoanAmount?.toLocaleString()}`}
                            icon={DollarSign}
                            color="bg-purple-500"
                            loading={loading}
                        />
                        <StatCard
                            title="This Month"
                            value={stats.thisMonthApplications}
                            icon={TrendingUp}
                            color="bg-indigo-500"
                            loading={loading}
                        />
                    </div>
                </div>
                {/* Recent Applications Section */}
                <div className="bg-white shadow-sm rounded-lg border">
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
        </div>
    );
};

export default LoanOfficerDashboard;
