import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Users,
    Building,
    Phone,
    Mail,
    Eye,
    Download,
    RefreshCw,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    Target,
    Flag,
    FileText,
    BarChart3
} from 'lucide-react';
import { pastMaturityAPI } from '../../services/api';
import ContactClientModal from '../../components/modals/ContactClientModal';
import EscalationModal from '../../components/modals/EscalationModal';




const PastMaturityDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Data states
    const [dashboardData, setDashboardData] = useState(null);
    const [loans, setLoans] = useState([]);
    const [branchSummary, setBranchSummary] = useState([]);
    const [officerSummary, setOfficerSummary] = useState([]);
    const [commonFilters, setCommonFilters] = useState([]);
    const [dayBreakdown, setDayBreakdown] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showEscalationModal, setShowEscalationModal] = useState(false);


    // Filter states
    const [filters, setFilters] = useState({
        days: '',
        operator: '>=',
        limit: 20,
        offset: 0,
        sortBy: 'recovery_priority_score',
        sortOrder: 'DESC'
    });

    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        pages: 0
    });

    // UI states
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('all');

    // Fetch dashboard summary
    const fetchDashboardSummary = async () => {
        try {
            const response = await pastMaturityAPI.getDashboardSummary();
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
        }
    };

    // Fetch loans by days
    const fetchLoansByDays = async () => {
        try {
            const response = await pastMaturityAPI.getLoansByDays(filters);
            if (response.data.success) {
                setLoans(response.data.data.loans);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    // Fetch branch summary
    const fetchBranchSummary = async () => {
        try {
            const response = await pastMaturityAPI.getBranchSummary();
            if (response.data.success) {
                setBranchSummary(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching branch summary:', error);
        }
    };

    // Fetch officer summary
    const fetchOfficerSummary = async () => {
        try {
            const response = await pastMaturityAPI.getOfficerSummary({ branch: selectedBranch });
            if (response.data.success) {
                setOfficerSummary(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching officer summary:', error);
        }
    };

    // Fetch common filters
    const fetchCommonFilters = async () => {
        try {
            const response = await pastMaturityAPI.getCommonFilters();
            if (response.data.success) {
                setCommonFilters(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching common filters:', error);
        }
    };

    // Fetch day breakdown
    const fetchDayBreakdown = async () => {
        try {
            const response = await pastMaturityAPI.getDayBreakdown({ maxDays: 90 });
            if (response.data.success) {
                setDayBreakdown(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching day breakdown:', error);
        }
    };

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDashboardSummary(),
                    fetchBranchSummary(),
                    fetchCommonFilters(),
                    fetchDayBreakdown()
                ]);
            } catch (error) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Load loans when filters change
    useEffect(() => {
        if (activeTab === 'loans' && filters.days) {
            fetchLoansByDays();
        }
    }, [filters, activeTab]);

    // Load officer summary when branch changes
    useEffect(() => {
        if (activeTab === 'officers') {
            fetchOfficerSummary();
        }
    }, [selectedBranch, activeTab]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'dashboard') {
                await fetchDashboardSummary();
            } else if (activeTab === 'loans') {
                await fetchLoansByDays();
            } else if (activeTab === 'branches') {
                await fetchBranchSummary();
            } else if (activeTab === 'officers') {
                await fetchOfficerSummary();
            }
        } finally {
            setRefreshing(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            offset: key !== 'offset' ? 0 : value // Reset offset when other filters change
        }));
    };

    // Handle common filter click
    const handleCommonFilterClick = (filterData) => {
        setFilters(prev => ({
            ...prev,
            days: filterData.days,
            operator: filterData.operator,
            offset: 0
        }));
        setActiveTab('loans');
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'RWF 0';
        return `RWF ${amount.toLocaleString()}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Get urgency color
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'IMMEDIATE': return 'bg-red-100 text-red-800';
            case 'URGENT': return 'bg-orange-100 text-orange-800';
            case 'HIGH': return 'bg-yellow-100 text-yellow-800';
            case 'MEDIUM': return 'bg-blue-100 text-blue-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get overdue category color
    const getOverdueCategoryColor = (category) => {
        switch (category) {
            case 'EXTREMELY_OVERDUE': return 'bg-red-100 text-red-800';
            case 'CRITICALLY_OVERDUE': return 'bg-orange-100 text-orange-800';
            case 'SEVERELY_OVERDUE': return 'bg-yellow-100 text-yellow-800';
            case 'MODERATELY_OVERDUE': return 'bg-blue-100 text-blue-800';
            case 'RECENTLY_OVERDUE': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading past maturity dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Past Maturity Analysis</h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Monitor and analyze loans that have passed their maturity date
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                            { id: 'loans', label: 'Loans Analysis', icon: FileText },
                            { id: 'branches', label: 'Branch Summary', icon: Building },
                            { id: 'officers', label: 'Officer Summary', icon: Users }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Past Maturity</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {dashboardData.total_past_maturity_loans}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Outstanding Amount</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatCurrency(dashboardData.total_outstanding_amount)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Critical Cases 90 days</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {dashboardData.critical_cases}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">No Action Taken</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {dashboardData.no_action_taken}
                                    </p>
                                </div>
                                <Flag className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Urgency Breakdown */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Level Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {dashboardData.immediate_cases}
                                </div>
                                <div className="text-sm text-gray-500">Immediate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {dashboardData.urgent_cases}
                                </div>
                                <div className="text-sm text-gray-500">Urgent</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {dashboardData.high_cases}
                                </div>
                                <div className="text-sm text-gray-500">High</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {dashboardData.medium_cases}
                                </div>
                                <div className="text-sm text-gray-500">Medium</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {dashboardData.low_cases}
                                </div>
                                <div className="text-sm text-gray-500">Low</div>
                            </div>
                        </div>
                    </div>

                    {/* Common Filters */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {commonFilters.map((filter, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCommonFilterClick(filter)}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{filter.label}</h4>
                                        <span className="text-2xl font-bold text-red-600">
                                            {filter.count}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{filter.description}</p>
                                    <p className="text-sm font-medium text-green-600 mt-1">
                                        {formatCurrency(filter.total_amount)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Day Breakdown Chart */}
                    {dayBreakdown.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Days Past Maturity Breakdown</h3>
                            <div className="space-y-3">
                                {dayBreakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-medium text-gray-900">{item.range}</span>
                                            <span className="text-sm text-gray-500 ml-2">({item.count} loans)</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900">
                                                {formatCurrency(item.total_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Avg: {Math.round(item.avg_days)} days
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loans Analysis Tab */}
            {activeTab === 'loans' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Filter Loans</h3>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                                <Filter className="w-4 h-4" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Days Past Maturity
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={filters.operator}
                                            onChange={(e) => handleFilterChange('operator', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value=">=">&gt;=</option>
                                            <option value="<=">&lt;=</option>
                                            <option value="=">=</option>
                                            <option value=">">&gt;</option>
                                            <option value="<">&lt;</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={filters.days}
                                            onChange={(e) => handleFilterChange('days', e.target.value)}
                                            placeholder="Days"
                                            min="0"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="recovery_priority_score">Priority Score</option>
                                        <option value="days_past_maturity">Days Past Maturity</option>
                                        <option value="outstanding_amount">Outstanding Amount</option>
                                        <option value="maturity_date">Maturity Date</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort Order
                                    </label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="DESC">Descending</option>
                                        <option value="ASC">Ascending</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Results Per Page
                                    </label>
                                    <select
                                        value={filters.limit}
                                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loans Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maturity Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loans.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {loan.loan_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {loan.loan_type_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Branch: {loan.branch}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {loan.client_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {loan.client_number}
                                                    </div>
                                                    {loan.client_mobile && (
                                                        <div className="text-xs text-gray-400">
                                                            📞 {loan.client_mobile}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(loan.maturity_date)}
                                                    </div>
                                                    <div className="text-sm font-medium text-red-600">
                                                        {loan.days_past_maturity} days overdue
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOverdueCategoryColor(loan.overdue_category)}`}>
                                                        {loan.overdue_category?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(loan.outstanding_amount)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Principal: {formatCurrency(loan.principal_outstanding)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Interest: {formatCurrency(loan.interest_outstanding)}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(loan.urgency_level)}`}>
                                                        {loan.urgency_level}
                                                    </span>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Score: {loan.recovery_priority_score}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => handleViewLoan(loan.id)}
                                                        className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        View Details
                                                    </button>

                                                    <button
                                                        onClick={() => handleContactClient(loan)}
                                                        className="text-green-600 hover:text-green-900 text-xs flex items-center gap-1"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        Contact
                                                    </button>

                                                    {loan.urgency_level === 'IMMEDIATE' && (
                                                        <button
                                                            onClick={() => handleEscalate(loan.id)}
                                                            className="text-red-600 hover:text-red-900 text-xs flex items-center gap-1"
                                                        >
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Escalate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handleFilterChange('offset', Math.max(0, pagination.offset - pagination.limit))}
                                        disabled={pagination.offset === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('offset', Math.min(pagination.total - pagination.limit, pagination.offset + pagination.limit))}
                                        disabled={pagination.offset + pagination.limit >= pagination.total}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">{pagination.offset + 1}</span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.offset + pagination.limit, pagination.total)}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium">{pagination.total}</span>{' '}
                                            results
                                        </p>
                                    </div>

                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => handleFilterChange('offset', Math.max(0, pagination.offset - pagination.limit))}
                                                disabled={pagination.offset === 0}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                onClick={() => handleFilterChange('offset', Math.min(pagination.total - pagination.limit, pagination.offset + pagination.limit))}
                                                disabled={pagination.offset + pagination.limit >= pagination.total}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {!loading && loans.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
                            <p className="text-gray-600 mb-4">
                                No loans match your current filter criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setFilters({
                                        days: '',
                                        operator: '>=',
                                        limit: 20,
                                        offset: 0,
                                        sortBy: 'recovery_priority_score',
                                        sortOrder: 'DESC'
                                    });
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Branch Summary Tab */}
            {activeTab === 'branches' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Branch Performance Summary</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Past Maturity Loans
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Days Overdue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Critical Cases
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Performance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {branchSummary.map((branch, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {branch.branch}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {branch.past_maturity_count}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(branch.total_outstanding)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {Math.round(branch.avg_days_past_maturity)} days
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-red-600">
                                                    {branch.critical_cases}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${branch.avg_days_past_maturity <= 30 ? 'bg-green-400' :
                                                        branch.avg_days_past_maturity <= 60 ? 'bg-yellow-400' :
                                                            branch.avg_days_past_maturity <= 90 ? 'bg-orange-400' : 'bg-red-400'
                                                        }`}></div>
                                                    <span className={`text-sm ${branch.avg_days_past_maturity <= 30 ? 'text-green-600' :
                                                        branch.avg_days_past_maturity <= 60 ? 'text-yellow-600' :
                                                            branch.avg_days_past_maturity <= 90 ? 'text-orange-600' : 'text-red-600'
                                                        }`}>
                                                        {branch.avg_days_past_maturity <= 30 ? 'Good' :
                                                            branch.avg_days_past_maturity <= 60 ? 'Fair' :
                                                                branch.avg_days_past_maturity <= 90 ? 'Poor' : 'Critical'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Officer Summary Tab */}
            {activeTab === 'officers' && (
                <div className="space-y-6">
                    {/* Branch Filter */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Filter by Branch:</label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Branches</option>
                                {branchSummary.map((branch, index) => (
                                    <option key={index} value={branch.branch}>
                                        {branch.branch}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Loan Officer Performance</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Officer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Past Maturity Loans
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Days Overdue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions Taken
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {officerSummary.map((officer, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {officer.loan_officer_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {officer.loan_officer_id}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {officer.branch}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {officer.past_maturity_count}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(officer.total_outstanding)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {Math.round(officer.avg_days_past_maturity)} days
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {officer.actions_taken || 0}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Action handlers
    const handleViewLoan = (loanId) => {
        console.log('View loan details:', loanId);
        // Navigate to loan details or open modal
    };

    const handleContactClient = (loan) => {
        setSelectedLoan(loan);
        setShowContactModal(true);
    };

    const handleEscalate = (loanId) => {
        const loan = loans.find(l => l.id === loanId);
        setSelectedLoan(loan);
        setShowEscalationModal(true);
    };
};

export default PastMaturityDashboard;
