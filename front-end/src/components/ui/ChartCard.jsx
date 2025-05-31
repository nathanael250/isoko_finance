import React from 'react';

const ChartCard = ({
    title,
    icon: Icon,
    color,
    children,
    loading = false,
    error = null,
    onRefresh
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

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
                <div className={`w-1 h-full absolute left-0 top-0 ${color}`}></div>
                <div className="flex items-center gap-2 mb-3">
                    <Icon className={`p-1 rounded text-white w-6 h-6 ${color.replace('bg-', 'bg-')}`} />
                    <h3 className="text-gray-900 font-medium text-sm">{title}</h3>
                </div>
                <div className="h-32 bg-red-50 rounded flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 text-xs mb-2">Failed to load chart</div>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="text-xs text-red-600 hover:text-red-700 underline"
                            >
                                Try again
                            </button>
                        )}
                    </div>
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
                {children || <span className="text-gray-500 text-xs">Chart Placeholder</span>}
            </div>
        </div>
    );
};

export default ChartCard;
