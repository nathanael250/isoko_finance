const { sequelize } = require('../config/database');

const getTodaySummary = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Get today's repayments summary
        const [summaryResult] = await sequelize.query(`
            SELECT 
                COUNT(*) as transaction_count,
                COALESCE(SUM(amount_paid), 0) as total_collections,
                COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount_paid ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_method = 'mobile_money' THEN amount_paid ELSE 0 END), 0) as mobile_amount,
                COALESCE(SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount_paid ELSE 0 END), 0) as bank_amount
            FROM repayments 
            WHERE payment_date >= ? AND payment_date < ?
        `, {
            replacements: [startOfDay, endOfDay]
        });

        // Get last transaction
        const [lastTransactionResult] = await sequelize.query(`
            SELECT 
                r.*,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                l.loan_number
            FROM repayments r
            LEFT JOIN loans l ON r.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            WHERE r.payment_date >= ? AND r.payment_date < ?
            ORDER BY r.payment_date DESC, r.created_at DESC
            LIMIT 1
        `, {
            replacements: [startOfDay, endOfDay]
        });

        const summary = summaryResult[0] || {
            transaction_count: 0,
            total_collections: 0,
            cash_amount: 0,
            mobile_amount: 0,
            bank_amount: 0
        };

        res.status(200).json({
            success: true,
            data: {
                totalCollections: parseFloat(summary.total_collections) || 0,
                transactionCount: parseInt(summary.transaction_count) || 0,
                cashAmount: parseFloat(summary.cash_amount) || 0,
                mobileAmount: parseFloat(summary.mobile_amount) || 0,
                bankAmount: parseFloat(summary.bank_amount) || 0,
                lastTransaction: lastTransactionResult[0] || null
            }
        });

    } catch (error) {
        console.error('Get today summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s summary',
            error: error.message
        });
    }
};

const getRecentTransactions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [transactions] = await sequelize.query(`
            SELECT 
                r.id,
                r.receipt_number,
                r.amount_paid,
                r.payment_method,
                r.payment_date,
                r.notes,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                l.loan_number,
                l.loan_account,
                CONCAT(u.first_name, ' ', u.last_name) as received_by_name
            FROM repayments r
            LEFT JOIN loans l ON r.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON r.received_by = u.id
            ORDER BY r.payment_date DESC, r.created_at DESC
            LIMIT ?
        `, {
            replacements: [limit]
        });

        res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent transactions',
            error: error.message
        });
    }
};

const getDueTodayLoans = async (req, res) => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        const [dueLoans] = await sequelize.query(`
            SELECT 
                ls.id,
                ls.loan_id,
                ls.installment_number,
                ls.due_date,
                ls.principal_due,
                ls.interest_due,
                ls.total_due,
                ls.status,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE DATE(ls.due_date) = ? 
            AND ls.status IN ('pending', 'partial')
            AND l.status = 'active'
            ORDER BY ls.due_date ASC, c.first_name ASC
        `, {
            replacements: [todayStr]
        });

        res.status(200).json({
            success: true,
            data: dueLoans
        });

    } catch (error) {
        console.error('Get due today loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching due today loans',
            error: error.message
        });
    }
};

module.exports = {
    getTodaySummary,
    getRecentTransactions,
    getDueTodayLoans
};
