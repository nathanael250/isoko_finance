import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    Users,
    Calendar,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ArrearsAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({});
    const [timeRange, setTimeRange] = useState('30'); // days

    // Fetch analytics data
    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/loans-in-arrears/analytics?time_range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Arrears Analytics</h2>
                    <p className="text-gray-600">Monitor arrears trends and performance metrics</p>
                </div>
                <div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="180">Last 6 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Arrears</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(analytics.total_arrears_amount || 0)}
                            </p>
                            {analytics.arrears_trend && (
                                <div className={`flex items-center text-sm ${analytics.arrears_trend > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {analytics.arrears_trend > 0 ? (
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 mr-1" />
                                    )}
                                    {Math.abs(analytics.arrears_trend)}% vs last period
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Loans in Arrears</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analytics.total_loans_in_arrears?.toLocaleString() || 0}
                            </p>
                            {analytics.loans_trend && (
                                <div className={`flex items-center text-sm ${analytics.loans_trend > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {analytics.loans_trend > 0 ? (
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 mr-1" />
                                    )}
                                    {Math.abs(analytics.loans_trend)}% vs last period
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Arrears Rate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analytics.arrears_rate?.toFixed(2) || 0}%
                            </p>
                            <p className="text-sm text-gray-500">
                                of total loan portfolio
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Days in Arrears</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Math.round(analytics.avg_days_in_arrears || 0)}
                            </p>
                            <p className="text-sm text-gray-500">days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Arrears by Category */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Arrears by Category</h3>
                    {analytics.arrears_by_category ? (
                        <div className="space-y-4">
                            {Object.entries(analytics.arrears_by_category).map(([category, data]) => (
                                <div key={category} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded mr-3 ${getCategoryColor(category)}`}></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {category.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(data.amount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {data.count} loans
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                </div>

                {/* Performance Class Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Class Distribution</h3>
                    {analytics.performance_class_distribution ? (
                        <div className="space-y-4">
                            {Object.entries(analytics.performance_class_distribution).map(([performanceClass, data]) => (
                                <div key={performanceClass} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded mr-3 ${getPerformanceClassColor(performanceClass)}`}></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {performanceClass.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(data.amount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {data.count} loans ({data.percentage?.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                </div>
            </div>

            {/* Branch Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Performance</h3>
                {analytics.branch_performance ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Branch
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loans in Arrears
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Arrears Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Arrears Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg Days
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.branch_performance.map((branch) => (
                                    <tr key={branch.branch_name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {branch.branch_name || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {branch.loans_in_arrears}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(branch.arrears_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${branch.arrears_rate > 10 ? 'bg-red-100 text-red-800' :
                                                    branch.arrears_rate > 5 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {branch.arrears_rate?.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {Math.round(branch.avg_days_in_arrears)} days
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No branch data available</div>
                )}
            </div>

            {/* Recovery Actions Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recovery Actions Summary</h3>
                {analytics.recovery_actions_summary ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {analytics.recovery_actions_summary.total_actions || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Actions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {analytics.recovery_actions_summary.completed_actions || 0}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {analytics.recovery_actions_summary.pending_actions || 0}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {analytics.recovery_actions_summary.success_rate?.toFixed(1) || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No recovery actions data available</div>
                )}
            </div>

            {/* Trend Analysis */}
            {analytics.trend_data && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Arrears Trend Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                                {analytics.trend_data.new_arrears || 0}
                            </div>
                            <div className="text-sm text-gray-600">New Arrears This Period</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                                {analytics.trend_data.resolved_arrears || 0}
                            </div>
                            <div className="text-sm text-gray-600">Resolved Arrears</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                                {analytics.trend_data.deteriorated_loans || 0}
                            </div>
                            <div className="text-sm text-gray-600">Deteriorated Loans</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Helper functions for styling
    function getCategoryColor(category) {
        switch (category) {
            case 'early_arrears': return 'bg-yellow-400';
            case 'moderate_arrears': return 'bg-orange-400';
            case 'serious_arrears': return 'bg-red-400';
            case 'critical_arrears': return 'bg-red-600';
            default: return 'bg-gray-400';
        }
    }

    function getPerformanceClassColor(performanceClass) {
        switch (performanceClass) {
            case 'performing': return 'bg-green-400';
            case 'watch': return 'bg-yellow-400';
            case 'substandard': return 'bg-orange-400';
            case 'doubtful': return 'bg-red-400';
            case 'loss': return 'bg-red-600';
            default: return 'bg-gray-400';
        }
    }
};

export default ArrearsAnalytics;
