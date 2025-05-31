import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Users } from 'lucide-react';

const MissedRepaymentsSummary = ({ summary, formatCurrency }) => {
    if (!summary) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const summaryCards = [
        {
            title: 'Total Missed Repayments',
            value: summary.total_missed_count || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            change: summary.missed_count_change || 0,
            changeType: (summary.missed_count_change || 0) > 0 ? 'increase' : 'decrease'
        },
        {
            title: 'Outstanding Amount',
            value: formatCurrency(summary.total_outstanding_amount || 0),
            icon: DollarSign,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            change: summary.outstanding_amount_change || 0,
            changeType: (summary.outstanding_amount_change || 0) > 0 ? 'increase' : 'decrease'
        },
        {
            title: 'Affected Clients',
            value: summary.affected_clients_count || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: summary.affected_clients_change || 0,
            changeType: (summary.affected_clients_change || 0) > 0 ? 'increase' : 'decrease'
        },
        {
            title: 'Average Days Overdue',
            value: Math.round(summary.average_days_overdue || 0),
            icon: Clock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            suffix: ' days',
            change: summary.avg_days_change || 0,
            changeType: (summary.avg_days_change || 0) > 0 ? 'increase' : 'decrease'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((card, index) => {
                const Icon = card.icon;
                const isIncrease = card.changeType === 'increase';
                const TrendIcon = isIncrease ? TrendingUp : TrendingDown;
                
                return (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                                <Icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-500 truncate">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {card.value}{card.suffix || ''}
                                </p>
                            </div>
                        </div>
                        
                        {card.change !== undefined && card.change !== 0 && (
                            <div className="mt-4 flex items-center">
                                <TrendIcon 
                                    className={`h-4 w-4 ${
                                        isIncrease ? 'text-red-500' : 'text-green-500'
                                    }`} 
                                />
                                <span 
                                    className={`ml-1 text-sm font-medium ${
                                        isIncrease ? 'text-red-600' : 'text-green-600'
                                    }`}
                                >
                                    {Math.abs(card.change)}%
                                </span>
                                <span className="ml-1 text-sm text-gray-500">
                                    vs last month
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MissedRepaymentsSummary;
