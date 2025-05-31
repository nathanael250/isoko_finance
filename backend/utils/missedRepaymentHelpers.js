const { sequelize } = require('../config/database');

// Calculate penalty for missed repayment
const calculatePenalty = (outstandingAmount, daysOverdue, penaltyRate = 0.05) => {
    if (daysOverdue <= 0) return 0;
    return Math.round(outstandingAmount * penaltyRate * daysOverdue * 100) / 100;
};

// Get risk level based on days overdue
const getRiskLevel = (daysOverdue) => {
    if (daysOverdue <= 30) return 'Low Risk';
    if (daysOverdue <= 90) return 'Medium Risk';
    if (daysOverdue <= 180) return 'High Risk';
    return 'Critical Risk';
};

// Get priority level for follow-up based on amount and days overdue
const getFollowUpPriority = (outstandingAmount, daysOverdue) => {
    if (daysOverdue > 180 || outstandingAmount > 1000000) return 'urgent';
    if (daysOverdue > 90 || outstandingAmount > 500000) return 'high';
    if (daysOverdue > 30 || outstandingAmount > 100000) return 'medium';
    return 'low';
};

// Generate SMS reminder text
const generateSMSReminder = (clientName, loanNumber, outstandingAmount, daysOverdue) => {
    const currency = 'RWF';
    
    if (daysOverdue === 0) {
        return `Dear ${clientName}, your loan payment of ${currency} ${outstandingAmount.toLocaleString()} for loan ${loanNumber} is due today. Please make payment to avoid penalties. Thank you.`;
    } else if (daysOverdue <= 7) {
        return `Dear ${clientName}, your loan payment of ${currency} ${outstandingAmount.toLocaleString()} for loan ${loanNumber} is ${daysOverdue} day(s) overdue. Please pay immediately to avoid additional charges.`;
    } else {
        return `URGENT: Dear ${clientName}, your loan payment of ${currency} ${outstandingAmount.toLocaleString()} for loan ${loanNumber} is ${daysOverdue} days overdue. Contact us immediately at [PHONE] to avoid further action.`;
    }
};

// Generate email reminder content
const generateEmailReminder = (clientName, loanNumber, outstandingAmount, daysOverdue, dueDate) => {
    const currency = 'RWF';
    
    return {
        subject: `Payment Reminder - Loan ${loanNumber}`,
        body: `
Dear ${clientName},

This is a reminder regarding your loan payment for loan number ${loanNumber}.

Payment Details:
- Outstanding Amount: ${currency} ${outstandingAmount.toLocaleString()}
- Original Due Date: ${dueDate}
- Days Overdue: ${daysOverdue} days

${daysOverdue > 30 ? 
    'This payment is significantly overdue. Please contact us immediately to discuss payment arrangements.' :
    'Please make your payment as soon as possible to keep your account in good standing.'
}

You can make payments through:
- Mobile Money: [MOBILE_MONEY_NUMBER]
- Bank Transfer: [BANK_DETAILS]
- Visit our office: [OFFICE_ADDRESS]

If you have any questions or need to discuss payment arrangements, please contact us at [PHONE] or reply to this email.

Thank you for your cooperation.

Best regards,
Isoko Finance Team
        `
    };
};

// Bulk update overdue status
const bulkUpdateOverdueStatus = async () => {
    try {
        console.log('🔄 Starting bulk update of overdue status...');

        // Update loan schedules that are overdue
        const [scheduleResult] = await sequelize.query(`
            UPDATE loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            SET 
                ls.status = CASE 
                    WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 'overdue'
                    ELSE ls.status
                END,
                ls.days_overdue = CASE 
                    WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date)
                    ELSE 0
                END,
                ls.updated_at = NOW()
            WHERE l.status IN ('active', 'disbursed')
        `);

        // Update loan performance classifications
        const [loanResult] = await sequelize.query(`
            UPDATE loans l
            SET 
                l.days_in_arrears = COALESCE((
                    SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                    FROM loan_schedules ls 
                    WHERE ls.loan_id = l.id 
                    AND ls.due_date < CURDATE() 
                    AND ls.status IN ('pending', 'partial', 'overdue')
                ), 0),
                l.performance_class = CASE 
                    WHEN COALESCE((
                        SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                        FROM loan_schedules ls 
                        WHERE ls.loan_id = l.id 
                        AND ls.due_date < CURDATE() 
                        AND ls.status IN ('pending', 'partial', 'overdue')
                    ), 0) = 0 THEN 'performing'
                    WHEN COALESCE((
                        SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                        FROM loan_schedules ls 
                        WHERE ls.loan_id = l.id 
                        AND ls.due_date < CURDATE() 
                        AND ls.status IN ('pending', 'partial', 'overdue')
                    ), 0) <= 30 THEN 'watch'
                    WHEN COALESCE((
                        SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                        FROM loan_schedules ls 
                        WHERE ls.loan_id = l.id 
                        AND ls.due_date < CURDATE() 
                        AND ls.status IN ('pending', 'partial', 'overdue')
                    ), 0) <= 90 THEN 'substandard'
                    WHEN COALESCE((
                        SELECT MAX(DATEDIFF(CURDATE(), ls.due_date))
                        FROM loan_schedules ls 
                        WHERE ls.loan_id = l.id 
                        AND ls.due_date < CURDATE() 
                        AND ls.status IN ('pending', 'partial', 'overdue')
                    ), 0) <= 180 THEN 'doubtful'
                    ELSE 'loss'
                END,
                l.updated_at = NOW()
            WHERE l.status IN ('active', 'disbursed')
        `);

        console.log(`✅ Bulk update completed: ${scheduleResult.affectedRows} schedules, ${loanResult.affectedRows} loans updated`);

        return {
            success: true,
            updated_schedules: scheduleResult.affectedRows,
            updated_loans: loanResult.affectedRows
        };

    } catch (error) {
        console.error('❌ Bulk update failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get clients requiring urgent follow-up
const getUrgentFollowUpClients = async () => {
    try {
        const [clients] = await sequelize.query(`
            SELECT DISTINCT
                c.id as client_id,
                c.client_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile,
                c.email,
                COUNT(ls.id) as overdue_payments,
                SUM(ls.total_due - ls.total_paid) as total_outstanding,
                MAX(DATEDIFF(CURDATE(), ls.due_date)) as max_days_overdue,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer
            FROM clients c
            JOIN loans l ON c.id = l.client_id
            JOIN loan_schedules ls ON l.id = ls.loan_id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE ls.due_date < CURDATE()
            AND ls.status IN ('pending', 'partial', 'overdue')
            AND l.status IN ('active', 'disbursed')
            AND DATEDIFF(CURDATE(), ls.due_date) > 30
            GROUP BY c.id, c.client_number, c.first_name, c.last_name, c.mobile, c.email, u.first_name, u.last_name
            HAVING total_outstanding > 50000 OR max_days_overdue > 90
            ORDER BY max_days_overdue DESC, total_outstanding DESC
        `);

        return clients;

    } catch (error) {
        console.error('Error getting urgent follow-up clients:', error);
        return [];
    }
};

module.exports = {
    calculatePenalty,
    getRiskLevel,
    getFollowUpPriority,
    generateSMSReminder,
    generateEmailReminder,
    bulkUpdateOverdueStatus,
    getUrgentFollowUpClients
};
