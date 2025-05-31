const { sequelize } = require('../config/database');

// Get loans due in next N days
const getLoansDeInNextDays = async (days = 7) => {
    try {
        const [loans] = await sequelize.query(`
            SELECT 
                COUNT(DISTINCT l.id) as loan_count,
                COUNT(*) as schedule_count,
                SUM(ls.total_due - ls.total_paid) as total_amount
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            WHERE ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND ls.status IN ('pending', 'partial')
            AND l.status IN ('active', 'disbursed')
        `, { replacements: [days] });

        return loans[0];
    } catch (error) {
        console.error('Error getting loans due in next days:', error);
        return null;
    }
};

// Get overdue loans count and amount
const getOverdueLoansStats = async () => {
    try {
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(DISTINCT l.id) as overdue_loans,
                COUNT(*) as overdue_schedules,
                SUM(ls.total_due - ls.total_paid) as overdue_amount,
                AVG(DATEDIFF(CURDATE(), ls.due_date)) as avg_days_overdue
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            WHERE ls.due_date < CURDATE()
            AND ls.status IN ('pending', 'partial', 'overdue')
            AND l.status IN ('active', 'disbursed')
        `);

        return stats[0];
    } catch (error) {
        console.error('Error getting overdue loans stats:', error);
        return null;
    }
};

// Get performance class breakdown
const getPerformanceClassBreakdown = async () => {
    try {
        const [breakdown] = await sequelize.query(`
            SELECT 
                l.performance_class,
                COUNT(*) as loan_count,
                SUM(l.loan_balance) as total_balance,
                AVG(l.days_in_arrears) as avg_days_in_arrears
            FROM loans l
            WHERE l.status IN ('active', 'disbursed')
            GROUP BY l.performance_class
            ORDER BY 
                CASE l.performance_class
                    WHEN 'performing' THEN 1
                    WHEN 'watch' THEN 2
                    WHEN 'substandard' THEN 3
                    WHEN 'doubtful' THEN 4
                    WHEN 'loss' THEN 5
                END
        `);

        return breakdown;
    } catch (error) {
        console.error('Error getting performance class breakdown:', error);
        return [];
    }
};

// Generate collection report for a date range
const generateCollectionReport = async (startDate, endDate) => {
    try {
        const [report] = await sequelize.query(`
            SELECT 
                DATE(r.payment_date) as payment_date,
                COUNT(*) as payment_count,
                SUM(r.amount_paid) as total_collected,
                SUM(r.principal_paid) as principal_collected,
                SUM(r.interest_paid) as interest_collected,
                COUNT(DISTINCT r.loan_id) as loans_paid
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            WHERE r.payment_date BETWEEN ? AND ?
            AND r.status = 'confirmed'
            GROUP BY DATE(r.payment_date)
            ORDER BY payment_date DESC
        `, { replacements: [startDate, endDate] });

        return report;
    } catch (error) {
        console.error('Error generating collection report:', error);
        return [];
    }
};

module.exports = {
    getLoansDeInNextDays,
    getOverdueLoansStats,
    getPerformanceClassBreakdown,
    generateCollectionReport
};
