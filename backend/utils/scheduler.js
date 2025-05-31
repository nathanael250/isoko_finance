const cron = require('node-cron');
const { sequelize } = require('../config/database');

// Function to update overdue loans automatically
const updateOverdueLoansScheduled = async () => {
    try {
        console.log('🔄 Running scheduled overdue loans update...');

        // Update loan schedules that are overdue
        const [updatedSchedules] = await sequelize.query(`
            UPDATE loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            SET ls.status = 'overdue',
                ls.days_overdue = DATEDIFF(CURDATE(), ls.due_date),
                ls.updated_at = NOW()
            WHERE ls.due_date < CURDATE() 
            AND ls.status IN ('pending', 'partial')
            AND l.status IN ('active', 'disbursed')
        `);

        // Update loan performance classifications
        const [updatedLoans] = await sequelize.query(`
            UPDATE loans l
            SET 
                l.performance_class = CASE 
                    WHEN l.days_in_arrears = 0 THEN 'performing'
                    WHEN l.days_in_arrears <= 30 THEN 'watch'
                    WHEN l.days_in_arrears <= 90 THEN 'substandard'
                    WHEN l.days_in_arrears <= 180 THEN 'doubtful'
                    ELSE 'loss'
                END,
                l.days_in_arrears = COALESCE((
                    SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                    FROM loan_schedules ls 
                    WHERE ls.loan_id = l.id 
                    AND ls.due_date < CURDATE() 
                    AND ls.status IN ('pending', 'partial', 'overdue')
                ), 0),
                l.updated_at = NOW()
            WHERE l.status IN ('active', 'disbursed')
        `);

        console.log(`✅ Scheduled update completed: ${updatedSchedules.affectedRows} schedules, ${updatedLoans.affectedRows} loans updated`);

        return {
            success: true,
            updated_schedules: updatedSchedules.affectedRows,
            updated_loans: updatedLoans.affectedRows
        };

    } catch (error) {
        console.error('❌ Scheduled overdue update failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Schedule to run every day at 1:00 AM
const startScheduler = () => {
    // Run every day at 1:00 AM
    cron.schedule('0 1 * * *', updateOverdueLoansScheduled, {
        scheduled: true,
        timezone: "Africa/Kigali" // Adjust to your timezone
    });

    // Also run every hour during business hours (8 AM to 6 PM)
    cron.schedule('0 8-18 * * *', updateOverdueLoansScheduled, {
        scheduled: true,
        timezone: "Africa/Kigali"
    });

    console.log('📅 Overdue loans scheduler started');
};



module.exports = {
    updateOverdueLoansScheduled,
    startScheduler
};
