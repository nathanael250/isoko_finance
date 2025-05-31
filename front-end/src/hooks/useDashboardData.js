import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboardData = () => {
    const [data, setData] = useState({
        stats: null,
        chartData: {},
        activities: [],
        performance: null,
        loading: true,
        error: null
    });

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setData(prev => ({ ...prev, loading: true, error: null }));

                // Fetch all dashboard data in parallel
                const [
                    statsResponse,
                    activitiesResponse,
                    performanceResponse
                ] = await Promise.allSettled([
                    dashboardService.getDashboardStats(),
                    dashboardService.getRecentActivities(10),
                    dashboardService.getPerformanceMetrics()
                ]);

                // Process successful responses
                const stats = statsResponse.status === 'fulfilled' ? statsResponse.value.data : null;
                const activities = activitiesResponse.status === 'fulfilled' ? activitiesResponse.value.data : [];
                const performance = performanceResponse.status === 'fulfilled' ? performanceResponse.value.data : null;

                setData({
                    stats,
                    activities,
                    performance,
                    chartData: {},
                    loading: false,
                    error: null
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message || 'Failed to fetch dashboard data'
                }));
            }
        };

        fetchDashboardData();
    }, [refreshKey]);

    const refresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return { ...data, refresh };
};

export const useChartData = (chartType, period = 'monthly') => {
    const [chartData, setChartData] = useState({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setChartData(prev => ({ ...prev, loading: true, error: null }));
                const response = await dashboardService.getChartData(chartType, period);
                setChartData({
                    data: response.data,
                    loading: false,
                    error: null
                });
            } catch (error) {
                setChartData({
                    data: null,
                    loading: false,
                    error: error.message || 'Failed to fetch chart data'
                });
            }
        };

        if (chartType) {
            fetchChartData();
        }
    }, [chartType, period]);

    return chartData;
};
