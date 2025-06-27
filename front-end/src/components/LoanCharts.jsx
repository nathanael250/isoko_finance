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

// Monthly Loan Releases Bar Chart
export const MonthlyLoanReleasesChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-sm">Loading chart...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-400 text-sm">No data available</div>
            </div>
        );
    }

    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            return format(new Date(year, month - 1), 'MMM yyyy');
        } catch {
            return monthStr;
        }
    };

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_amount: parseFloat(item.total_amount) || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                    formatter={(value, name) => [
                        name === 'total_loans' ? value : `$${parseFloat(value).toLocaleString()}`,
                        name === 'total_loans' ? 'Total Loans' : 'Total Amount'
                    ]}
                />
                <Legend />
                <Bar dataKey="total_loans" fill="#3b82f6" name="Total Loans" />
                <Bar dataKey="approved_loans" fill="#10b981" name="Approved Loans" />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Loan Status Distribution Pie Chart
export const LoanStatusPieChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-sm">Loading chart...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-400 text-sm">No data available</div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
        value: parseInt(item.count),
        amount: parseFloat(item.total_amount) || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
    );
};

// Monthly Collections Line Chart
export const MonthlyCollectionsChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-sm">Loading chart...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-400 text-sm">No collection data available</div>
            </div>
        );
    }

    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            return format(new Date(year, month - 1), 'MMM yyyy');
        } catch {
            return monthStr;
        }
    };

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_collected: parseFloat(item.total_collected) || 0,
        principal_collected: parseFloat(item.principal_collected) || 0,
        interest_collected: parseFloat(item.interest_collected) || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="total_collected" stroke="#10b981" name="Total Collections" />
                <Line type="monotone" dataKey="principal_collected" stroke="#3b82f6" name="Principal" />
                <Line type="monotone" dataKey="interest_collected" stroke="#f59e0b" name="Interest" />
            </LineChart>
        </ResponsiveContainer>
    );
};

// Outstanding Trends Area Chart
export const OutstandingTrendsChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-sm">Loading chart...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-400 text-sm">No outstanding data available</div>
            </div>
        );
    }

    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            return format(new Date(year, month - 1), 'MMM yyyy');
        } catch {
            return monthStr;
        }
    };

    const chartData = data.map(item => ({
        ...item,
        month: formatMonth(item.month),
        total_outstanding: parseFloat(item.total_outstanding) || 0,
        principal_outstanding: parseFloat(item.principal_outstanding) || 0,
        interest_outstanding: parseFloat(item.interest_outstanding) || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="total_outstanding"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Total Outstanding"
                />
                <Area
                    type="monotone"
                    dataKey="principal_outstanding"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Principal Outstanding"
                />
                <Area
                    type="monotone"
                    dataKey="interest_outstanding"
                    stackId="3"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Interest Outstanding"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Collection vs Released Comparison Chart
export const CollectionVsReleasedChart = ({ collectionsData, releasesData, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-sm">Loading chart...</div>
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
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-400 text-sm">No comparison data available</div>
            </div>
        );
    }

    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            return format(new Date(year, month - 1), 'MMM yyyy');
        } catch {
            return monthStr;
        }
    };

    const formattedData = chartData.map(item => ({
        ...item,
        month: formatMonth(item.month)
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Bar dataKey="released" fill="#3b82f6" name="Loans Released" />
                <Bar dataKey="collected" fill="#10b981" name="Collections" />
            </BarChart>
        </ResponsiveContainer>
    );
};
