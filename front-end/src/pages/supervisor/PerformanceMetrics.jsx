import React, { useState, useEffect } from 'react';
import { supervisorAPI } from '../../services/api';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const PerformanceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    overall: {
      totalLoans: 0,
      activeLoans: 0,
      totalPortfolio: 0,
      collectionRate: 0,
    },
    trends: {
      loanGrowth: 0,
      portfolioGrowth: 0,
      collectionRateChange: 0,
    },
    teamPerformance: [],
    monthlyStats: [],
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overallResponse, trendsResponse, teamResponse, monthlyResponse] = await Promise.all([
        supervisorAPI.getOverallMetrics(),
        supervisorAPI.getPerformanceTrends(),
        supervisorAPI.getTeamPerformance(),
        supervisorAPI.getMonthlyStats()
      ]);

      if (overallResponse.data.success) {
        setMetrics(prev => ({
          ...prev,
          overall: overallResponse.data.data
        }));
      }

      if (trendsResponse.data.success) {
        setMetrics(prev => ({
          ...prev,
          trends: trendsResponse.data.data
        }));
      }

      if (teamResponse.data.success) {
        setMetrics(prev => ({
          ...prev,
          teamPerformance: teamResponse.data.data
        }));
      }

      if (monthlyResponse.data.success) {
        setMetrics(prev => ({
          ...prev,
          monthlyStats: monthlyResponse.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch performance data');
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

  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
  };

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
          <div className="flex-shrink-0">
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchPerformanceData}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
        <p className="mt-2 text-gray-600">Detailed analytics and performance indicators</p>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{metrics.overall.totalLoans}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{metrics.overall.activeLoans}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Portfolio</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(metrics.overall.totalPortfolio)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Collection Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatPercentage(metrics.overall.collectionRate)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Performance Trends</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Key performance indicators and their trends
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Loan Growth</dt>
              <dd className="mt-1 flex items-baseline">
                <div className="flex items-baseline">
                  {metrics.trends.loanGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`ml-2 text-2xl font-semibold ${
                    metrics.trends.loanGrowth > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(Math.abs(metrics.trends.loanGrowth))}
                  </span>
                </div>
              </dd>
            </div>

            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Portfolio Growth</dt>
              <dd className="mt-1 flex items-baseline">
                <div className="flex items-baseline">
                  {metrics.trends.portfolioGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`ml-2 text-2xl font-semibold ${
                    metrics.trends.portfolioGrowth > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(Math.abs(metrics.trends.portfolioGrowth))}
                  </span>
                </div>
              </dd>
            </div>

            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Collection Rate Change</dt>
              <dd className="mt-1 flex items-baseline">
                <div className="flex items-baseline">
                  {metrics.trends.collectionRateChange > 0 ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`ml-2 text-2xl font-semibold ${
                    metrics.trends.collectionRateChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(Math.abs(metrics.trends.collectionRateChange))}
                  </span>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Statistics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Performance metrics by month
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Loans
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Portfolio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.monthlyStats.map((stat) => (
                <tr key={stat.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.newLoans}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(stat.totalPortfolio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(stat.collections)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercentage(stat.collectionRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
