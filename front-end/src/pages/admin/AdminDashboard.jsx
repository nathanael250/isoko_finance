import React, { useState, useEffect } from 'react';
import {
    Users,
    UserCheck,
    Scale,
    PiggyBank,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    DollarSign,
    Target,
    RefreshCw,
    Activity
} from 'lucide-react';

import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Import your existing chart components
import {
    MonthlyLoanReleasesChart,
    LoanStatusPieChart,
    MonthlyCollectionsChart,
    OutstandingTrendsChart,
    CollectionVsReleasedChart,
    PrincipalOutstandingChart,
    InterestOutstandingChart,
    TotalOutstandingChart
} from '../../components/LoanCharts';

// Import your existing APIs
import { dashboardAPI, chartAPI, api } from '../../services/api';

// StatCard component (keep the same)
const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    loading = false
}) => {
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

    const formatValue = (val) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            } else if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString();
        }
        return val;
    };

    const formatCurrency = (val) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            } else if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return `${val.toLocaleString()}`;
        }
        return val;
    };

    const shouldFormatAsCurrency = title.toLowerCase().includes('savings') ||
        title.toLowerCase().includes('collections') ||
        title.toLowerCase().includes('portfolio');

    const displayValue = shouldFormatAsCurrency ? formatCurrency(value) : formatValue(value);

    const colorMap = {
        'bg-blue-900': 'from-blue-500 to-blue-600',
        'bg-green-600': 'from-green-500 to-green-600',
        'bg-purple-600': 'from-purple-500 to-purple-600',
        'bg-yellow-500': 'from-yellow-400 to-yellow-500',
        'bg-indigo-600': 'from-indigo-500 to-indigo-600',
        'bg-emerald-600': 'from-emerald-500 to-emerald-600',
        'bg-orange-500': 'from-orange-400 to-orange-500',
        'bg-red-600': 'from-red-500 to-red-600',
        'bg-teal-600': 'from-teal-500 to-teal-600'
    };
    const gradientColor = colorMap[color] || 'from-gray-500 to-gray-600';

    return (
        <div className={`bg-gradient-to-r ${gradientColor} shadow-sm rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md`}>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-gray-600 text-sm font-medium">{title}</h2>
                <Icon className={`p-1.5 rounded text-white w-10 h-10 `} />
            </div>
            <span className="text-2xl font-bold text-white">{displayValue}</span>
        </div>
    );
};

// ChartCard component using your exact style
const ChartCard = ({
    title,
    loading = false,
    children
}) => {
    if (loading) {
        return (
            <div className="bg-white shadow-sm rounded-lg relative overflow-hidden">
                <div className="bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-white rounded-t-lg">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50">
                        <div className="h-64 w-full bg-gray-100 rounded flex items-center justify-center animate-pulse">
                            <div className="text-gray-400 text-sm">Loading chart...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg relative overflow-hidden">
            <div className="bg-gray-50 rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">{title}</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Chart Container */}
                <div className="p-6 bg-gray-50">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Animated Activity List Component
const AnimatedActivityList = ({ activities }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (activities.length === 0) return;

        const interval = setInterval(() => {
            // Fade out
            setIsVisible(false);

            setTimeout(() => {
                // Change to next activity
                setCurrentIndex((prevIndex) =>
                    prevIndex === activities.length - 1 ? 0 : prevIndex + 1
                );
                // Fade in
                setIsVisible(true);
            }, 300); // 300ms for fade transition

        }, 5000); // 5 seconds per activity

        return () => clearInterval(interval);
    }, [activities.length]);

    if (activities.length === 0) return null;

    const currentActivity = activities[currentIndex];

    return (
        <div className="relative min-h-[80px]">
            {/* Activity Item */}
            <div
                className={`transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
                    }`}
            >
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${currentActivity.type === 'loan' ? 'bg-blue-500' :
                        currentActivity.type === 'client' ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                        {currentActivity.type === 'loan' ? 'L' :
                            currentActivity.type === 'client' ? 'C' : 'A'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {currentActivity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                            {new Date(currentActivity.timestamp).toLocaleString()}
                            {currentActivity.amount && (
                                <span className="ml-2 font-medium">
                                    ${currentActivity.amount.toLocaleString()}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mt-3 space-x-1">
                {activities.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'w-6 bg-indigo-500'
                            : 'w-1.5 bg-gray-300'
                            }`}
                    />
                ))}
            </div>

            {/* Activity Counter */}
            <div className="absolute top-0 right-0 text-xs text-gray-400">
                {currentIndex + 1} of {activities.length}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [activities, setActivities] = useState([]);

    // Chart data states
    const [chartData, setChartData] = useState({
        monthlyReleases: [],
        statusDistribution: [],
        monthlyCollections: [],
        outstandingTrends: []
    });
    const [chartLoading, setChartLoading] = useState(true);

    // Replace your fetchChartData function with this:
    const fetchChartData = async () => {
        try {
            console.log('🔄 Fetching chart data...');
            setChartLoading(true);

            // Use the imported api instance
            const [monthlyReleasesRes, statusDistRes, monthlyCollectionsRes, outstandingTrendsRes] = await Promise.all([
                api.get('/loans/stats/monthly-releases?months=12'),
                api.get('/loans/stats/status-distribution'),
                api.get('/loans/stats/monthly-collections?months=12'),
                api.get('/loans/stats/outstanding-trends?months=12')
            ]);

            console.log('📊 Raw API responses:', {
                monthlyReleases: monthlyReleasesRes.data,
                statusDistribution: statusDistRes.data,
                monthlyCollections: monthlyCollectionsRes.data,
                outstandingTrends: outstandingTrendsRes.data
            });

            setChartData({
                monthlyReleases: monthlyReleasesRes.data?.data || [],
                statusDistribution: statusDistRes.data?.data || [],
                monthlyCollections: monthlyCollectionsRes.data?.data || [],
                outstandingTrends: outstandingTrendsRes.data?.data || []
            });

            console.log('✅ Chart data loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching chart data:', error);
            console.error('Error details:', error.response?.data || error.message);

            // Set empty data on error
            setChartData({
                monthlyReleases: [],
                statusDistribution: [],
                monthlyCollections: [],
                outstandingTrends: []
            });
        } finally {
            setChartLoading(false);
        }
    };

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setError(null);

            // Fetch all dashboard data
            const [statsResponse, activitiesResponse] = await Promise.allSettled([
                dashboardAPI.getStats(),
                dashboardAPI.getActivities(5)
            ]);

            if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
                setDashboardData(statsResponse.value.data.data);
                console.log('✅ Dashboard stats loaded');
            } else {
                throw new Error('Failed to load dashboard stats');
            }

            if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.data.success) {
                setActivities(activitiesResponse.value.data.data);
                console.log('✅ Activities loaded');
            } else {
                console.warn('⚠️ Activities failed to load');
                setActivities([]);
            }

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');

            // Don't set mock data - let the UI handle the error state
            setDashboardData(null);
            setActivities([]);
        }
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchDashboardData(),
                fetchChartData()
            ]);
            setLoading(false);
        };

        loadData();
    }, []);

    // Refresh handler
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchDashboardData(),
            fetchChartData()
        ]);
        setRefreshing(false);
    };

    // Show loading state
    if (loading || !dashboardData) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading dashboard...</p>
                            {error && (
                                <p className="text-red-600 text-sm mt-2">Error: {error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-1">Overview of your loan management system</p>
                        {error && (
                            <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
                                ⚠️ Some data may be unavailable - {error}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Main Statistics Grid */}
                {/* Enhanced Main Statistics Grid */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatCard
                            title="Loan Officers"
                            value={dashboardData.users?.total_loan_officers || 0}
                            icon={Users}
                            color="bg-blue-900"
                            trend={8.2}
                            subtitle="Active staff"
                            loading={loading}
                        />
                        <StatCard
                            title="Borrowers"
                            value={dashboardData.clients?.total_clients || 0}
                            icon={UserCheck}
                            color="bg-green-600"
                            trend={12.5}
                            subtitle="Registered users"
                            loading={loading}
                        />
                        <StatCard
                            title="Loans Released"
                            value={dashboardData.loans?.total_loans || 0}
                            icon={Scale}
                            color="bg-purple-600"
                            trend={-2.1}
                            subtitle="Total released"
                            loading={loading}
                        />
                        <StatCard
                            title="Total Portfolio"
                            value={dashboardData.financial?.total_portfolio || 0}
                            icon={PiggyBank}
                            color="bg-yellow-500"
                            trend={18.7}
                            subtitle="Portfolio value"
                            loading={loading}
                        />
                        <StatCard
                            title="Active Loans"
                            value={dashboardData.loans?.active_loans || 0}
                            icon={FileText}
                            color="bg-indigo-600"
                            trend={5.4}
                            subtitle="Currently active"
                            loading={loading}
                        />
                        <StatCard
                            title="Completed"
                            value={dashboardData.loans?.completed_loans || 0}
                            icon={CheckCircle}
                            color="bg-emerald-600"
                            trend={3.2}
                            subtitle="Finished loans"
                            loading={loading}
                        />
                        <StatCard
                            title="Pending"
                            value={dashboardData.loans?.pending_loans || 0}
                            icon={XCircle}
                            color="bg-orange-500"
                            trend={-1.8}
                            subtitle="Awaiting approval"
                            loading={loading}
                        />
                        <StatCard
                            title="Defaults"
                            value={dashboardData.loans?.defaulted_loans || 0}
                            icon={AlertTriangle}
                            color="bg-red-600"
                            trend={-0.5}
                            subtitle="Non-performing"
                            loading={loading}
                        />
                        <StatCard
                            title="Outstanding"
                            value={dashboardData.loans?.total_outstanding_balance || 0}
                            icon={DollarSign}
                            color="bg-teal-600"
                            trend={-5.3}
                            subtitle="Pending payments"
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Performance Metrics Section */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Target className="bg-purple-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Performance Metrics</h2>
                            </div>
                            <p className="text-gray-600 text-xs">Key performance indicators from your database</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {dashboardData.performance?.collection_rate?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">Collection Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {dashboardData.performance?.approval_rate?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">Approval Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {dashboardData.performance?.default_rate?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">Default Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {dashboardData.performance?.portfolio_growth?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">Portfolio Growth</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {dashboardData.performance?.avg_processing_days?.toFixed(0) || '0'}
                                </div>
                                <div className="text-xs text-gray-500">Avg Processing Days</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-600">
                                    {dashboardData.performance?.client_satisfaction?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">Client Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities Section with Animation */}
                <div className="mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-4 relative overflow-hidden">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Activity className="bg-indigo-500 p-1.5 rounded text-white w-7 h-7" />
                                <h2 className="text-gray-900 text-lg font-semibold">Recent Activities</h2>
                            </div>
                            <p className="text-gray-600 text-xs">Latest system activities and updates</p>
                        </div>
                        {activities.length > 0 ? (
                            <AnimatedActivityList activities={activities} />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No recent activities found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Section - Using your existing LoanCharts components */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
                        <p className="text-gray-600 text-sm mt-1">Detailed insights and performance trends</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly Loan Releases Chart */}
                        <MonthlyLoanReleasesChart
                            data={chartData.monthlyReleases}
                            loading={chartLoading}
                        />

                        {/* Monthly Collections Chart */}
                        <MonthlyCollectionsChart
                            data={chartData.monthlyCollections}
                            loading={chartLoading}
                        />

                        {/* Loan Status Distribution Chart */}
                        <LoanStatusPieChart
                            data={chartData.statusDistribution}
                            loading={chartLoading}
                        />

                        {/* Outstanding Trends Chart */}
                        <OutstandingTrendsChart
                            data={chartData.outstandingTrends}
                            loading={chartLoading}
                        />

                        {/* Collections vs Released Comparison */}
                        <CollectionVsReleasedChart
                            collectionsData={chartData.monthlyCollections}
                            releasesData={chartData.monthlyReleases}
                            loading={chartLoading}
                        />

                        {/* Collection vs Released - Monthly */}
                        <CollectionVsReleasedChart
                            collectionsData={chartData.monthlyCollections}
                            releasesData={chartData.monthlyReleases}
                            loading={chartLoading}
                        />

                        {/* Total Outstanding - Monthly */}
                        <TotalOutstandingChart
                            data={chartData.outstandingTrends}
                            loading={chartLoading}
                        />

                        {/* Principal Outstanding - Monthly */}
                        <PrincipalOutstandingChart
                            data={chartData.outstandingTrends}
                            loading={chartLoading}
                        />

                        {/* Interest Outstanding - Monthly */}
                        <InterestOutstandingChart
                            data={chartData.outstandingTrends}
                            loading={chartLoading}
                        />
                    </div>
                </div>

                
                {/* Advanced Summary Cards */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Financial Summary */}
                        <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/20 to-cyan-100/20 rounded-full translate-y-12 -translate-x-12"></div>

                            {/* Header */}
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
                                        <PiggyBank className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 font-bold text-lg">Financial Summary</h3>
                                        <p className="text-gray-500 text-xs">Portfolio overview</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Total Portfolio:</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        ${(dashboardData.financial?.total_portfolio || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Principal Outstanding:</span>
                                    <span className="text-sm font-bold text-blue-600">
                                        ${(dashboardData.financial?.total_principal_outstanding || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Interest Outstanding:</span>
                                    <span className="text-sm font-bold text-orange-600">
                                        ${(dashboardData.financial?.total_interest_outstanding || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <span className="text-sm text-gray-600 font-medium">Performing Loans:</span>
                                    <span className="text-sm font-bold text-green-600">
                                        ${(dashboardData.financial?.performing_loans_balance || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Loan Status Summary */}
                        <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full translate-y-12 -translate-x-12"></div>

                            {/* Header */}
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 font-bold text-lg">Loan Status</h3>
                                        <p className="text-gray-500 text-xs">Current loan distribution</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Total Loans:</span>
                                    <span className="text-sm font-bold text-gray-900">{dashboardData.loans?.total_loans || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Active:</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">{dashboardData.loans?.active_loans || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Pending:</span>
                                    </div>
                                    <span className="text-sm font-bold text-yellow-600">{dashboardData.loans?.pending_loans || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Completed:</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{dashboardData.loans?.completed_loans || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 font-medium">Defaulted:</span>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">{dashboardData.loans?.defaulted_loans || 0}</span>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Client Summary */}
                        <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/20 to-blue-100/20 rounded-full translate-y-12 -translate-x-12"></div>

                            {/* Header */}
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 font-bold text-lg">Client Summary</h3>
                                        <p className="text-gray-500 text-xs">Client base overview</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Total Clients:</span>
                                    <span className="text-sm font-bold text-gray-900">{dashboardData.clients?.total_clients || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Active:</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">{dashboardData.clients?.active_clients || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Pending Approval:</span>
                                    </div>
                                    <span className="text-sm font-bold text-yellow-600">{dashboardData.clients?.pending_clients || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">Inactive:</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">{dashboardData.clients?.inactive_clients || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 font-medium">Suspended:</span>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">{dashboardData.clients?.suspended_clients || 0}</span>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
