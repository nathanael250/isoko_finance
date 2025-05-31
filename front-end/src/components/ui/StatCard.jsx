import React from 'react';

const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendValue,
    loading = false,
    onClick
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
                {trend && (
                    <div className="mt-2 h-3 bg-gray-200 rounded w-20"></div>
                )}
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

    return (
        <div
            className={`bg-white shadow rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''
                }`}
            onClick={onClick}
        >
            <span className={`w-1 h-full absolute left-0 top-0 ${color}`}></span>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-gray-600 text-sm font-medium">{title}</h2>
                <Icon className={`p-1.5 rounded text-white w-7 h-7 ${color.replace('bg-', 'bg-')}`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatValue(value)}</span>

            {trend && trendValue && (
                <div className="mt-2 flex items-center">
                    <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
