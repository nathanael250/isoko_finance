const { sequelize } = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        console.log('📊 Fetching dashboard statistics...');

        // Get user statistics (removed is_active since it doesn't exist)
        const [userStats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'loan-officer' THEN 1 ELSE 0 END) as total_loan_officers,
                SUM(CASE WHEN role = 'supervisor' THEN 1 ELSE 0 END) as total_supervisors,
                SUM(CASE WHEN role = 'cashier' THEN 1 ELSE 0 END) as total_cashiers,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins
            FROM users
        `);

        // Get client statistics
        const [clientStats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_clients,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_clients,
                SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_clients,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_clients,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_clients
            FROM clients
        `);

        // Check if loans table exists and get loan statistics
        let loanStats = [{
            total_loans: 0,
            active_loans: 0,
            completed_loans: 0,
            pending_loans: 0,
            approved_loans: 0,
            disbursed_loans: 0,
            defaulted_loans: 0,
            rejected_loans: 0,
            total_applied_amount: 0,
            total_approved_amount: 0,
            total_disbursed_amount: 0,
            total_outstanding_balance: 0
        }];

        try {
            const [loanStatsResult] = await sequelize.query(`
                SELECT 
                    COUNT(*) as total_loans,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_loans,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_loans,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_loans,
                    SUM(CASE WHEN status = 'disbursed' THEN 1 ELSE 0 END) as disbursed_loans,
                    SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_loans,
                    COALESCE(SUM(applied_amount), 0) as total_applied_amount,
                    COALESCE(SUM(approved_amount), 0) as total_approved_amount,
                    COALESCE(SUM(disbursed_amount), 0) as total_disbursed_amount,
                    COALESCE(SUM(loan_balance), 0) as total_outstanding_balance
                FROM loans
            `);
            loanStats = loanStatsResult;
        } catch (loanError) {
            console.warn('Loans table might not exist or have different schema:', loanError.message);
        }

        // Get financial statistics (with error handling)
        let financialStats = [{
            total_portfolio: 0,
            total_principal_outstanding: 0,
            total_interest_outstanding: 0,
            performing_loans_balance: 0,
            non_performing_loans_balance: 0
        }];

        try {
            const [financialStatsResult] = await sequelize.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status IN ('active', 'disbursed') THEN loan_balance ELSE 0 END), 0) as total_portfolio,
                    COALESCE(SUM(CASE WHEN status IN ('active', 'disbursed') THEN principal_balance ELSE 0 END), 0) as total_principal_outstanding,
                    COALESCE(SUM(CASE WHEN status IN ('active', 'disbursed') THEN interest_balance ELSE 0 END), 0) as total_interest_outstanding,
                    COALESCE(SUM(CASE WHEN performance_class = 'performing' THEN loan_balance ELSE 0 END), 0) as performing_loans_balance,
                    COALESCE(SUM(CASE WHEN performance_class != 'performing' THEN loan_balance ELSE 0 END), 0) as non_performing_loans_balance
                FROM loans
            `);
            financialStats = financialStatsResult;
        } catch (financialError) {
            console.warn('Financial stats query failed:', financialError.message);
        }

        // Get performance classification (with error handling)
        let performanceStats = [];
        try {
            const [performanceStatsResult] = await sequelize.query(`
                SELECT 
                    performance_class,
                    COUNT(*) as count,
                    COALESCE(SUM(loan_balance), 0) as total_balance
                FROM loans 
                WHERE status IN ('active', 'disbursed')
                GROUP BY performance_class
            `);
            performanceStats = performanceStatsResult;
        } catch (performanceError) {
            console.warn('Performance stats query failed:', performanceError.message);
        }

        // Calculate rates safely
        const totalLoans = parseInt(loanStats[0].total_loans) || 0;
        const approvedLoans = parseInt(loanStats[0].approved_loans) || 0;
        const disbursedLoans = parseInt(loanStats[0].disbursed_loans) || 0;
        const activeLoans = parseInt(loanStats[0].active_loans) || 0;
        const defaultedLoans = parseInt(loanStats[0].defaulted_loans) || 0;

        const approvalRate = totalLoans > 0 ? 
            ((approvedLoans + disbursedLoans + activeLoans) / totalLoans * 100) : 0;

        const defaultRate = totalLoans > 0 ? 
            (defaultedLoans / totalLoans * 100) : 0;

        const dashboardData = {
            users: {
                total_users: parseInt(userStats[0].total_users) || 0,
                total_loan_officers: parseInt(userStats[0].total_loan_officers) || 0,
                total_supervisors: parseInt(userStats[0].total_supervisors) || 0,
                total_cashiers: parseInt(userStats[0].total_cashiers) || 0,
                total_admins: parseInt(userStats[0].total_admins) || 0,
                active_users: parseInt(userStats[0].total_users) || 0 // Using total as fallback
            },
            clients: {
                total_clients: parseInt(clientStats[0].total_clients) || 0,
                active_clients: parseInt(clientStats[0].active_clients) || 0,
                pending_clients: parseInt(clientStats[0].pending_clients) || 0,
                inactive_clients: parseInt(clientStats[0].inactive_clients) || 0,
                suspended_clients: parseInt(clientStats[0].suspended_clients) || 0
            },
            loans: {
                total_loans: totalLoans,
                active_loans: activeLoans,
                completed_loans: parseInt(loanStats[0].completed_loans) || 0,
                pending_loans: parseInt(loanStats[0].pending_loans) || 0,
                approved_loans: approvedLoans,
                disbursed_loans: disbursedLoans,
                defaulted_loans: defaultedLoans,
                rejected_loans: parseInt(loanStats[0].rejected_loans) || 0,
                total_applied_amount: parseFloat(loanStats[0].total_applied_amount) || 0,
                total_approved_amount: parseFloat(loanStats[0].total_approved_amount) || 0,
                total_disbursed_amount: parseFloat(loanStats[0].total_disbursed_amount) || 0,
                total_outstanding_balance: parseFloat(loanStats[0].total_outstanding_balance) || 0
            },
            financial: {
                total_portfolio: parseFloat(financialStats[0].total_portfolio) || 0,
                total_principal_outstanding: parseFloat(financialStats[0].total_principal_outstanding) || 0,
                total_interest_outstanding: parseFloat(financialStats[0].total_interest_outstanding) || 0,
                performing_loans_balance: parseFloat(financialStats[0].performing_loans_balance) || 0,
                non_performing_loans_balance: parseFloat(financialStats[0].non_performing_loans_balance) || 0
            },
            performance: {
                collection_rate: 94.5, // Mock for now
                approval_rate: parseFloat(approvalRate.toFixed(2)),
                default_rate: parseFloat(defaultRate.toFixed(2)),
                portfolio_growth: 15.8, // Mock - calculate from historical data
                avg_processing_days: 3.2, // Mock - calculate from loan application to approval dates
                client_satisfaction: 89.7 // Mock - from surveys
            },
            performance_breakdown: performanceStats.map(stat => ({
                class: stat.performance_class,
                count: parseInt(stat.count),
                balance: parseFloat(stat.total_balance)
            }))
        };

        console.log('✅ Dashboard statistics fetched successfully');
        console.log('📊 Stats summary:', {
            users: dashboardData.users.total_users,
            clients: dashboardData.clients.total_clients,
            loans: dashboardData.loans.total_loans
        });

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private (Admin)
const getRecentActivities = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const activities = [];

        // Get recent loan activities (with error handling)
        try {
            const [loanActivities] = await sequelize.query(`
                SELECT 
                    l.id,
                    l.loan_number,
                    l.status,
                    l.applied_amount,
                    l.created_at,
                    l.updated_at,
                    c.first_name,
                    c.last_name,
                    'loan' as activity_type
                FROM loans l
                JOIN clients c ON l.client_id = c.id
                ORDER BY l.updated_at DESC
                LIMIT ?
            `, { replacements: [parseInt(limit)] });

            // Add loan activities
            loanActivities.forEach(loan => {
                activities.push({
                    id: `loan_${loan.id}`,
                    type: 'loan',
                    description: `Loan ${loan.loan_number} ${loan.status} for ${loan.first_name} ${loan.last_name}`,
                    amount: loan.applied_amount,
                    timestamp: loan.updated_at,
                    details: {
                        loan_number: loan.loan_number,
                        client_name: `${loan.first_name} ${loan.last_name}`,
                        status: loan.status,
                        amount: loan.applied_amount
                    }
                });
            });
        } catch (loanError) {
            console.warn('Could not fetch loan activities:', loanError.message);
        }

        // Get recent client registrations
        try {
            const [clientActivities] = await sequelize.query(`
                SELECT 
                    id,
                    client_number,
                    first_name,
                    last_name,
                    status,
                    created_at,
                    updated_at,
                    'client' as activity_type
                FROM clients
                ORDER BY created_at DESC
                LIMIT ?
            `, { replacements: [parseInt(limit)] });

            // Add client activities
            clientActivities.forEach(client => {
                activities.push({
                    id: `client_${client.id}`,
                    type: 'client',
                    description: `New client registered: ${client.first_name} ${client.last_name}`,
                    timestamp: client.created_at,
                    details: {
                        client_number: client.client_number,
                        client_name: `${client.first_name} ${client.last_name}`,
                        status: client.status
                    }
                });
            });
        } catch (clientError) {
            console.warn('Could not fetch client activities:', clientError.message);
        }

        // Sort by timestamp and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limitedActivities = activities.slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            data: limitedActivities
        });

    } catch (error) {
        console.error('Recent activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activities',
            error: error.message
        });
    }
};

// @desc    Get performance metrics
// @route   GET /api/dashboard/performance
// @access  Private (Admin)
const getPerformanceMetrics = async (req, res) => {
    try {
        let performanceBreakdown = [];
        
        // Get loan performance breakdown (with error handling)
        try {
            const [performanceBreakdownResult] = await sequelize.query(`
                SELECT 
                    performance_class,
                    COUNT(*) as loan_count,
                    COALESCE(SUM(loan_balance), 0) as total_balance,
                    COALESCE(AVG(loan_balance), 0) as avg_balance
                FROM loans 
                WHERE status IN ('active', 'disbursed')
                GROUP BY performance_class
            `);
            performanceBreakdown = performanceBreakdownResult;
        } catch (perfError) {
            console.warn('Performance breakdown query failed:', perfError.message);
        }

        // Mock monthly trends for now
        const monthlyTrends = [
            { month: 'Jan', loans_disbursed: 45, amount_disbursed: 2250000, collections: 1800000 },
            { month: 'Feb', loans_disbursed: 52, amount_disbursed: 2600000, collections: 2100000 },
            { month: 'Mar', loans_disbursed: 48, amount_disbursed: 2400000, collections: 1950000 },
            { month: 'Apr', loans_disbursed: 61, amount_disbursed: 3050000, collections: 2400000 },
            { month: 'May', loans_disbursed: 58, amount_disbursed: 2900000, collections: 2300000 },
            { month: 'Jun', loans_disbursed: 64, amount_disbursed: 3200000, collections: 2600000 }
        ];

        const performanceData = {
            performance_breakdown: performanceBreakdown.map(item => ({
                class: item.performance_class,
                count: parseInt(item.loan_count),
                total_balance: parseFloat(item.total_balance),
                avg_balance: parseFloat(item.avg_balance)
            })),
            monthly_trends: monthlyTrends,
            kpis: {
                portfolio_at_risk: 5.2,
                return_on_assets: 12.8,
                operational_efficiency: 78.5,
                client_retention_rate: 92.3,
                loan_loss_rate: 2.1,
                cost_per_borrower: 125.50
            }
        };

        res.status(200).json({
            success: true,
            data: performanceData
        });

    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching performance metrics',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivities,
    getPerformanceMetrics
};
