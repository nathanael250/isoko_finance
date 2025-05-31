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
    BarChart3,
    TrendingUp,
    PieChart,
    RefreshCw,
    Activity
} from 'lucide-react';

import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { dashboardAPI } from '../../services/api';

// StatCard component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden animate-pulse">
        <div className="h-1 bg-gray-200 absolute left-0 top-0 w-full"></div>
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
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      }
      return `$${val.toLocaleString()}`;
    }
    return val;
  };

  // Use currency formatting for certain titles
  const shouldFormatAsCurrency = title.toLowerCase().includes('savings') || 
                                 title.toLowerCase().includes('collections') ||
                                 title.toLowerCase().includes('portfolio');

  const displayValue = shouldFormatAsCurrency ? formatCurrency(value) : formatValue(value);

  return (
    <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <span className={`w-1 h-full absolute left-0 top-0 ${color}`}></span>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-gray-600 text-sm font-medium">{title}</h2>
        <Icon className={`p-1.5 rounded text-white w-7 h-7 ${color.replace('bg-', 'bg-')}`} />
      </div>
      <span className="text-2xl font-bold text-gray-900">{displayValue}</span>
    </div>
  );
};

// ChartCard component
const ChartCard = ({ 
  title, 
  icon: Icon, 
  color, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
        <div className={`w-1 h-full absolute left-0 top-0 ${color}`}></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-32 bg-gray-50 rounded flex items-center justify-center animate-pulse">
          <div className="text-gray-400 text-xs">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
      <div className={`w-1 h-full absolute left-0 top-0 ${color}`}></div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`p-1 rounded text-white w-6 h-6 ${color.replace('bg-', 'bg-')}`} />
        <h3 className="text-gray-900 font-medium text-sm">{title}</h3>
      </div>
      <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
        <span className="text-gray-500 text-xs">Chart Placeholder</span>
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
    const [performance, setPerformance] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setError(null);
            
            // Fetch all dashboard data
            const [statsResponse, activitiesResponse, performanceResponse] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getActivities(5),
                dashboardAPI.getPerformance()
            ]);

            setDashboardData(statsResponse.data.data);
            setActivities(activitiesResponse.data.data);
            setPerformance(performanceResponse.data.data);

            console.log('✅ Dashboard data loaded:', {
                users: statsResponse.data.data.users.total_users,
                clients: statsResponse.data.data.clients.total_clients,
                loans: statsResponse.data.data.loans.total_loans
            });

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data');
            
            // Fallback to mock data if API fails
            setDashboardData({
                users: {
                    total_users: 6,
                    total_loan_officers: 3,
                    total_supervisors: 1,
                    total_cashiers: 1,
                    total_admins: 1,
                    active_users: 6
                },
                clients: {
                    total_clients: 3,
                    active_clients: 0,
                    pending_clients: 3,
                    inactive_clients: 0,
                    suspended_clients: 0
                },
                loans: {
                    total_loans: 7,
                    active_loans: 1,
                    completed_loans: 1,
                    pending_loans: 5,
                    approved_loans: 0,
                    disbursed_loans: 0,
                    defaulted_loans: 0,
                    rejected_loans: 0,
                    total_applied_amount: 11000000,
                    total_approved_amount: 0,
                    total_disbursed_amount: 0,
                    total_outstanding_balance: 7939927.25
                },
                financial: {
                    total_portfolio: 1531793.78,
                    total_principal_outstanding: 1500000,
                    total_interest_outstanding: 31793.78,
                    performing_loans_balance: 7939927.25,
                    non_performing_loans_balance: 0
                },
                performance: {
                    collection_rate: 94.5,
                    approval_rate: 14.29,
                    default_rate: 0,
                    portfolio_growth: 15.8,
                    avg_processing_days: 3.2,
                    client_satisfaction: 89.7
                }
            });
            
            setActivities([
                {
                    id: 'mock_1',
                    type: 'loan',
                    description: 'New loan application submitted',
                    timestamp: new Date().toISOString()
                }
            ]);
        }
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchDashboardData();
            setLoading(false);
        };

        loadData();
    }, []);

    // Refresh handler
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    // Calculate goals (mock for now)
    const weeklyPercentage = 78;
    const monthlyPercentage = 66;
    const yearlyPercentage = 45;

    if (!dashboardData) {
        return (
            <div className="p-5 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 text-sm mt-1">Overview of your loan management system</p>
                    {error && (
                        <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
                            ⚠️ Using cached data - {error}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                <StatCard
                    title="Loan Officers"
                    value={dashboardData.users.total_loan_officers}
                    icon={Users}
                    color="bg-blue-900"
                    loading={loading}
                />

                <StatCard
                    title="Borrowers"
                    value={dashboardData.clients.total_clients}
                    icon={UserCheck}
                    color="bg-green-600"
                    loading={loading}
                />

                <StatCard
                    title="Loans Released"
                    value={dashboardData.loans.total_loans}
                    icon={Scale}
                    color="bg-purple-600"
                    loading={loading}
                />

                <StatCard
                    title="Total Portfolio"
                    value={dashboardData.financial.total_portfolio}
                    icon={PiggyBank}
                    color="bg-yellow-500"
                    loading={loading}
                />

                <StatCard
                    title="Active Loans"
                    value={dashboardData.loans.active_loans}
                    icon={FileText}
                    color="bg-indigo-600"
                    loading={loading}
                />

                <StatCard
                    title="Completed"
                    value={dashboardData.loans.completed_loans}
                    icon={CheckCircle}
                    color="bg-emerald-600"
                    loading={loading}
                />

                <StatCard
                    title="Pending"
                    value={dashboardData.loans.pending_loans}
                    icon={XCircle}
                    color="bg-orange-500"
                    loading={loading}
                />

                <StatCard
                    title="Defaults"
                    value={dashboardData.loans.defaulted_loans}
                    icon={AlertTriangle}
                    color="bg-red-600"
                    loading={loading}
                />

                <StatCard
                    title="Outstanding"
                    value={dashboardData.loans.total_outstanding_balance}
                    icon={DollarSign}
                    color="bg-teal-600"
                    loading={loading}
                />
            </div>

            {/* Performance Metrics Section */}
            <div className="mb-6">
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-purple-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Target className="bg-purple-500 p-1.5 rounded text-white w-7 h-7" />
                            <h2 className="text-gray-900 text-lg font-semibold">Performance Metrics</h2>
                        </div>
                        <p className="text-gray-600 text-xs">Key performance indicators from your database</p>
                    </div>
                    
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="text-center animate-pulse">
                                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {dashboardData.performance.collection_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Collection Rate</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {dashboardData.performance.approval_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Approval Rate</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {dashboardData.performance.default_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Default Rate</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {dashboardData.performance.portfolio_growth.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Portfolio Growth</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {dashboardData.performance.avg_processing_days.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-500">Avg Processing Days</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-600">
                                    {dashboardData.performance.client_satisfaction.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Client Satisfaction</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Goals Completion Section */}
            <div className="mb-6">
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-green-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Target className="bg-green-500 p-1.5 rounded text-white w-7 h-7" />
                            <h2 className="text-gray-900 text-lg font-semibold">Goals Completion</h2>
                        </div>
                        <p className="text-gray-600 text-xs">Track your progress across different time periods</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Weekly Goal */}
                        <div className="flex flex-col items-center">
                            {loading ? (
                                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                            ) : (
                                <CircularProgressbar 
                                    value={weeklyPercentage} 
                                    text={`${weeklyPercentage}%`} 
                                    className='w-16 h-16 mb-2'
                                    styles={buildStyles({
                                        textSize: '18px',
                                        textColor: '#374151',
                                        pathColor: '#10b981',
                                        trailColor: '#e5e7eb',
                                        strokeLinecap: 'round',
                                        pathTransitionDuration: 0.5,
                                        pathTransition: 'none',
                                        strokeWidth: 12,
                                        trailWidth: 12
                                    })}
                                />
                            )}
                            <h3 className="text-gray-900 font-medium text-sm">Weekly</h3>
                            <p className="text-gray-500 text-xs">78 of 100 loans</p>
                        </div>

                        {/* Monthly Goal */}
                        <div className="flex flex-col items-center">
                            {loading ? (
                                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                            ) : (
                                <CircularProgressbar 
                                    value={monthlyPercentage} 
                                    text={`${monthlyPercentage}%`} 
                                    className='w-16 h-16 mb-2'
                                    styles={buildStyles({
                                        textSize: '18px',
                                        textColor: '#374151',
                                        pathColor: '#3b82f6',
                                        trailColor: '#e5e7eb',
                                        strokeLinecap: 'round',
                                        pathTransitionDuration: 0.5,
                                        pathTransition: 'none',
                                        strokeWidth: 12,
                                        trailWidth: 12
                                    })}
                                />
                            )}
                            <h3 className="text-gray-900 font-medium text-sm">Monthly</h3>
                            <p className="text-gray-500 text-xs">264 of 400 loans</p>
                        </div>

                        {/* Yearly Goal */}
                        <div className="flex flex-col items-center">
                            {loading ? (
                                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                            ) : (
                                <CircularProgressbar 
                                    value={yearlyPercentage} 
                                    text={`${yearlyPercentage}%`} 
                                    className='w-16 h-16 mb-2'
                                    styles={buildStyles({
                                        textSize: '18px',
                                        textColor: '#374151',
                                        pathColor: '#f59e0b',
                                        trailColor: '#e5e7eb',
                                        strokeLinecap: 'round',
                                        pathTransitionDuration: 0.5,
                                        pathTransition: 'none',
                                        strokeWidth: 12,
                                        trailWidth: 12
                                    })}
                                />
                            )}
                            <h3 className="text-gray-900 font-medium text-sm">Yearly</h3>
                                                        <p className="text-gray-500 text-xs">2,250 of 5,000 loans</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities Section */}
            <div className="mb-6">
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-indigo-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Activity className="bg-indigo-500 p-1.5 rounded text-white w-7 h-7" />
                            <h2 className="text-gray-900 text-lg font-semibold">Recent Activities</h2>
                        </div>
                        <p className="text-gray-600 text-xs">Latest system activities and updates</p>
                    </div>
                    
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded animate-pulse">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                                        activity.type === 'loan' ? 'bg-blue-500' : 
                                        activity.type === 'client' ? 'bg-green-500' : 'bg-gray-500'
                                    }`}>
                                        {activity.type === 'loan' ? 'L' : 
                                         activity.type === 'client' ? 'C' : 'A'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                            {activity.amount && (
                                                <span className="ml-2 font-medium">
                                                    ${activity.amount.toLocaleString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No recent activities found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="mb-6">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
                    <p className="text-gray-600 text-sm mt-1">Detailed insights and performance metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ChartCard
                        title="Loans Released - Monthly"
                        icon={BarChart3}
                        color="bg-blue-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Loan Collection - Monthly"
                        icon={TrendingUp}
                        color="bg-green-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Collection vs Due Loans"
                        icon={PieChart}
                        color="bg-purple-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Open Loans - Monthly"
                        icon={BarChart3}
                        color="bg-indigo-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Collections vs Due (Cumulative)"
                        icon={TrendingUp}
                        color="bg-yellow-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Collection vs Released - Monthly"
                        icon={BarChart3}
                        color="bg-teal-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Total Outstanding - Monthly"
                        icon={TrendingUp}
                        color="bg-red-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Principal Outstanding - Monthly"
                        icon={BarChart3}
                        color="bg-orange-600"
                        loading={loading}
                    />

                    <ChartCard
                        title="Interest Outstanding - Monthly"
                        icon={TrendingUp}
                        color="bg-pink-600"
                        loading={loading}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Financial Summary */}
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-green-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-3">
                        <h3 className="text-gray-900 font-semibold">Financial Summary</h3>
                        <p className="text-gray-600 text-xs">Portfolio overview</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Portfolio:</span>
                            <span className="text-sm font-medium">${dashboardData.financial.total_portfolio.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Principal Outstanding:</span>
                            <span className="text-sm font-medium">${dashboardData.financial.total_principal_outstanding.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Interest Outstanding:</span>
                            <span className="text-sm font-medium">${dashboardData.financial.total_interest_outstanding.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Performing Loans:</span>
                            <span className="text-sm font-medium text-green-600">${dashboardData.financial.performing_loans_balance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Loan Status Summary */}
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-blue-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-3">
                        <h3 className="text-gray-900 font-semibold">Loan Status</h3>
                        <p className="text-gray-600 text-xs">Current loan distribution</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Loans:</span>
                            <span className="text-sm font-medium">{dashboardData.loans.total_loans}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active:</span>
                            <span className="text-sm font-medium text-green-600">{dashboardData.loans.active_loans}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Pending:</span>
                            <span className="text-sm font-medium text-yellow-600">{dashboardData.loans.pending_loans}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Completed:</span>
                            <span className="text-sm font-medium text-blue-600">{dashboardData.loans.completed_loans}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Defaulted:</span>
                            <span className="text-sm font-medium text-red-600">{dashboardData.loans.defaulted_loans}</span>
                        </div>
                    </div>
                </div>

                {/* Client Summary */}
                <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                    <span className="w-1 bg-purple-500 h-full absolute left-0 top-0"></span>
                    <div className="mb-3">
                        <h3 className="text-gray-900 font-semibold">Client Summary</h3>
                        <p className="text-gray-600 text-xs">Client base overview</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Clients:</span>
                            <span className="text-sm font-medium">{dashboardData.clients.total_clients}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active:</span>
                            <span className="text-sm font-medium text-green-600">{dashboardData.clients.active_clients}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Pending Approval:</span>
                            <span className="text-sm font-medium text-yellow-600">{dashboardData.clients.pending_clients}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Inactive:</span>
                            <span className="text-sm font-medium text-gray-600">{dashboardData.clients.inactive_clients}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Suspended:</span>
                            <span className="text-sm font-medium text-red-600">{dashboardData.clients.suspended_clients}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
