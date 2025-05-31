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
                    
