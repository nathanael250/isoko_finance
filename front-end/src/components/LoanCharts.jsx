import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

// Color palette for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

// Common Y-axis formatter
const formatYAxis = (value) => {
    if (value === 0) return '0';
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

// Common month formatter
const formatMonth = (monthStr) => {
    try {
        const [year, month] = monthStr.split('-');
        return format(new Date(year, month - 1), 'MMM yyyy');
    } catch {
        return monthStr;
    }
};

// Monthly Loan Releases Chart
export const MonthlyLoanReleasesChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-blue-600">Monthly Loan Releases</span>
                        <span className="text-gray-600"> - Trend</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-blue-600">Monthly Loan Releases</span>
                        <span className="text-gray-600"> - Trend</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_amount: parseFloat(item.total_amount) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-blue-600">Monthly Loan Releases</span>
                    <span className="text-gray-600"> - Trend</span>
                </h2>
            </div>
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Amount Released']} />
                            <Line 
                                type="monotone" 
                                dataKey="total_amount" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#3b82f6' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Loan Status Distribution Pie Chart
export const LoanStatusPieChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-purple-600">Loan Status Distribution</span>
                        <span className="text-gray-600"> - Overview</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-purple-600">Loan Status Distribution</span>
                        <span className="text-gray-600"> - Overview</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
        value: parseInt(item.count),
        amount: parseFloat(item.total_amount) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-purple-600">Loan Status Distribution</span>
                    <span className="text-gray-600"> - Overview</span>
                </h2>
            </div>
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Count']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Monthly Collections Chart
export const MonthlyCollectionsChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-green-600">Monthly Collections</span>
                        <span className="text-gray-600"> - Trend</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-green-600">Monthly Collections</span>
                        <span className="text-gray-600"> - Trend</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No collection data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_collected: parseFloat(item.total_collected) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-green-600">Monthly Collections</span>
                    <span className="text-gray-600"> - Trend</span>
                </h2>
            </div>
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Collections']} />
                            <Line 
                                type="monotone" 
                                dataKey="total_collected" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#10b981' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Outstanding Trends Chart
export const OutstandingTrendsChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Outstanding Trends</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Outstanding Trends</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No outstanding data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_outstanding: parseFloat(item.total_outstanding) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-red-600">Outstanding Trends</span>
                    <span className="text-gray-600"> - Monthly</span>
                </h2>
            </div>
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Outstanding']} />
                            <Line 
                                type="monotone" 
                                dataKey="total_outstanding" 
                                stroke="#ef4444" 
                                strokeWidth={3} 
                                dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#ef4444' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Collection vs Released Comparison Chart
export const CollectionVsReleasedChart = ({ collectionsData, releasesData, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-indigo-600">Collection vs Released</span>
                        <span className="text-gray-600"> - Comparison</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Merge collections and releases data by month
    const mergedData = [];
    const monthsMap = new Map();

    // Add releases data
    if (releasesData && releasesData.length > 0) {
        releasesData.forEach(item => {
            const month = item.month;
            monthsMap.set(month, {
                month,
                released: parseFloat(item.total_amount) || 0,
                collected: 0
            });
        });
    }

    // Add collections data
    if (collectionsData && collectionsData.length > 0) {
        collectionsData.forEach(item => {
            const month = item.month;
            if (monthsMap.has(month)) {
                monthsMap.get(month).collected = parseFloat(item.total_collected) || 0;
            } else {
                monthsMap.set(month, {
                    month,
                    released: 0,
                    collected: parseFloat(item.total_collected) || 0
                });
            }
        });
    }

    const chartData = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    if (chartData.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-indigo-600">Collection vs Released</span>
                        <span className="text-gray-600"> - Comparison</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No comparison data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const formattedData = chartData.map(item => ({
        ...item,
        month: formatMonth(item.month)
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-indigo-600">Collection vs Released</span>
                    <span className="text-gray-600"> - Comparison</span>
                </h2>
            </div>
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value, name) => [
                                `${parseFloat(value).toLocaleString()}`, 
                                name === 'released' ? 'Loans Released' : 'Collections'
                            ]} />
                            <Line 
                                type="monotone" 
                                dataKey="released" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#3b82f6' }} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="collected" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#10b981' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Principal Outstanding Chart
export const PrincipalOutstandingChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Total Principal Outstanding Open Loans</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Total Principal Outstanding Open Loans</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No principal outstanding data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        principal_outstanding: parseFloat(item.principal_outstanding) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-red-600">Total Principal Outstanding Open Loans</span>
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
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Principal Outstanding']} />
                            <Line 
                                type="monotone" 
                                dataKey="principal_outstanding" 
                                stroke="#dc2626" 
                                strokeWidth={3} 
                                dot={{ fill: '#dc2626', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#dc2626' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Interest Outstanding Chart
export const InterestOutstandingChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-orange-600">Total Interest Outstanding</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-orange-600">Total Interest Outstanding</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No interest outstanding data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        interest_outstanding: parseFloat(item.interest_outstanding) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-orange-600">Total Interest Outstanding</span>
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
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Interest Outstanding']} />
                            <Line 
                                type="monotone" 
                                dataKey="interest_outstanding" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#f59e0b' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Open Loans Chart
export const OpenLoansChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-teal-600">Open Loans</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-teal-600">Open Loans</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No open loans data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        active_loans: parseInt(item.active_loans) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-teal-600">Open Loans</span>
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
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [value, 'Open Loans']} />
                            <Line 
                                type="monotone" 
                                dataKey="active_loans" 
                                stroke="#14b8a6" 
                                strokeWidth={3} 
                                dot={{ fill: '#14b8a6', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#14b8a6' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Total Outstanding Chart
export const TotalOutstandingChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Total Outstanding</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center animate-pulse">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                        <span className="text-red-600">Total Outstanding</span>
                        <span className="text-gray-600"> - Monthly</span>
                    </h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <div className="h-96 w-full flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No total outstanding data available</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_outstanding: parseFloat(item.total_outstanding) || 0
    }));

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-red-600">Total Outstanding</span>
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
            <div className="p-6 bg-gray-50">
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                            <CartesianGrid 
                                strokeDasharray="none" 
                                stroke="#d1d5db" 
                                strokeWidth={1} 
                                horizontal={true} 
                                vertical={true} 
                            />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={formatYAxis}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                            />
                            <Tooltip formatter={(value) => [`${parseFloat(value).toLocaleString()}`, 'Total Outstanding']} />
                            <Line 
                                type="monotone" 
                                dataKey="total_outstanding" 
                                stroke="#dc2626" 
                                strokeWidth={3} 
                                dot={{ fill: '#dc2626', strokeWidth: 0, r: 4 }} 
                                activeDot={{ r: 6, fill: '#dc2626' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
