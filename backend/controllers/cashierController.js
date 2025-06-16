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
            FROM repayments r
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

const getDueThisWeekLoans = async (req, res) => {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
        const startOfWeek = new Date(today.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
        const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

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
            WHERE DATE(ls.due_date) >= ? AND DATE(ls.due_date) <= ?
            AND ls.status IN ('pending', 'partial')
            AND l.status = 'active'
            ORDER BY ls.due_date ASC, c.first_name ASC
        `, {
            replacements: [startOfWeekStr, endOfWeekStr]
        });

        res.status(200).json({
            success: true,
            data: dueLoans
        });

    } catch (error) {
        console.error('Get due this week loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching due this week loans',
            error: error.message
        });
    }
};

const getOverdueLoans = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, minDaysOverdue, maxDaysOverdue } = req.query;
        const offset = (page - 1) * limit;
        const today = new Date().toISOString().split('T')[0];

        let whereClause = `WHERE ls.status IN ('pending', 'partial', 'overdue') AND DATE(ls.due_date) < '${today}'`;
        let replacements = {};
        let queryParams = [limit, offset];

        if (search) {
            whereClause += ` AND (l.loan_number LIKE :search OR CONCAT(c.first_name, ' ', c.last_name) LIKE :search)`;
            replacements.search = `%${search}%`;
        }
        if (minDaysOverdue) {
            whereClause += ` AND DATEDIFF('${today}', ls.due_date) >= :minDaysOverdue`;
            replacements.minDaysOverdue = parseInt(minDaysOverdue);
        }
        if (maxDaysOverdue) {
            whereClause += ` AND DATEDIFF('${today}', ls.due_date) <= :maxDaysOverdue`;
            replacements.maxDaysOverdue = parseInt(maxDaysOverdue);
        }

        const [totalResult] = await sequelize.query(`
            SELECT COUNT(DISTINCT ls.id) as total
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        const total = totalResult[0]?.total || 0;
        const pages = Math.ceil(total / limit);

        const [overdueLoans] = await sequelize.query(`
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
                c.mobile as client_mobile,
                DATEDIFF('${today}', ls.due_date) as days_overdue,
                l.status as loan_status
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
            ORDER BY ls.due_date ASC, c.first_name ASC
            LIMIT :limit OFFSET :offset
        `, {
            replacements: {
                ...replacements,
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: {
                loans: overdueLoans,
                pagination: {
                    total,
                    pages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get overdue loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue loans',
            error: error.message
        });
    }
};

// NEW FUNCTION: Get overdue loans for cashier
const getCashierOverdueLoans = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            minDaysOverdue = '',
            maxDaysOverdue = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        let whereClause = `
            WHERE ls.due_date < ? 
            AND ls.status IN ('pending', 'partial')
            AND l.status = 'active'
        `;
        let replacements = [todayStr];

        if (search) {
            whereClause += ` AND (l.loan_number LIKE ? OR CONCAT(c.first_name, ' ', c.last_name) LIKE ?)`;
            replacements.push(`%${search}%`, `%${search}%`);
        }

        if (minDaysOverdue) {
            whereClause += ` AND DATEDIFF(?, ls.due_date) >= ?`;
            replacements.push(todayStr, parseInt(minDaysOverdue));
        }

        if (maxDaysOverdue) {
            whereClause += ` AND DATEDIFF(?, ls.due_date) <= ?`;
            replacements.push(todayStr, parseInt(maxDaysOverdue));
        }

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements });

        const total = countResult[0].total;

        // Get overdue loans
        const [overdueLoans] = await sequelize.query(`
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
                c.mobile as client_mobile,
                DATEDIFF(?, ls.due_date) as days_overdue
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
            ORDER BY ls.due_date ASC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, todayStr, parseInt(limit), parseInt(offset)]
        });

        res.status(200).json({
            success: true,
            data: {
                loans: overdueLoans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total),
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get cashier overdue loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue loans',
            error: error.message
        });
    }
};

const getRecentPayments = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const [payments] = await sequelize.query(`
            SELECT 
                r.id,
                r.loan_id,
                r.amount_paid,
                r.payment_method,
                r.payment_date,
                r.receipt_number,
                r.notes,
                r.received_by,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                CONCAT(u.first_name, ' ', u.last_name) as received_by_name
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON r.received_by = u.id
            ORDER BY r.payment_date DESC, r.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [parseInt(limit), parseInt(offset)]
        });

        res.status(200).json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error('Get recent payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent payments',
            error: error.message
        });
    }
};

// Search loans for payment
const searchLoans = async (req, res) => {
    try {
        const { q: searchTerm, limit = 10 } = req.query;

        if (!searchTerm || searchTerm.trim().length < 2) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const [loans] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                l.loan_balance,
                l.principal_balance,
                l.interest_balance,
                l.status,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                c.client_number,
                -- Calculate amount due today
                COALESCE(
                    (SELECT SUM(ls.total_due) 
                     FROM loan_schedules ls 
                     WHERE ls.loan_id = l.id 
                     AND ls.status IN ('pending', 'partial')
                     AND DATE(ls.due_date) <= CURDATE()
                    ), 0
                ) as amount_due
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.status = 'active'
            AND l.loan_balance > 0
            AND (
                l.loan_number LIKE ? OR
                l.loan_account LIKE ? OR
                c.first_name LIKE ? OR
                c.last_name LIKE ? OR
                c.mobile LIKE ? OR
                c.client_number LIKE ?
            )
            ORDER BY c.first_name, c.last_name
            LIMIT ?
        `, {
            replacements: [
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                parseInt(limit)
            ]
        });

        res.status(200).json({
            success: true,
            data: loans
        });

    } catch (error) {
        console.error('Search loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching loans',
            error: error.message
        });
    }
};

// Record payment
const recordPayment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            loan_id,
            amount,
            payment_method,
            receipt_number,
            notes
        } = req.body;

        // Validate required fields
        if (!loan_id || !amount || !payment_method || !receipt_number) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: loan_id, amount, payment_method, receipt_number'
            });
        }

        // Validate amount is positive
        if (parseFloat(amount) <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Payment amount must be greater than 0'
            });
        }

        // Validate loan exists and is active
        const [loans] = await sequelize.query(`
            SELECT id, loan_balance, principal_balance, interest_balance, status 
            FROM loans WHERE id = ?
        `, { replacements: [loan_id], transaction });

        if (loans.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];
        if (loan.status !== 'active') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot record payment for inactive loan'
            });
        }

        // Validate payment amount doesn't exceed loan balance
        if (parseFloat(amount) > parseFloat(loan.loan_balance)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Payment amount cannot exceed loan balance'
            });
        }

        // Check if receipt number already exists
        const [existingReceipts] = await sequelize.query(`
            SELECT id FROM repayments WHERE receipt_number = ?
        `, { replacements: [receipt_number], transaction });

        if (existingReceipts.length > 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Receipt number already exists'
            });
        }

        // Insert payment record
        await sequelize.query(`
            INSERT INTO repayments (
                loan_id,
                amount_paid,
                payment_method,
                payment_date,
                receipt_number,
                notes,
                received_by,
                status,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, NOW(), ?, ?, ?, 'completed', NOW(), NOW())
        `, {
            replacements: [
                loan_id,
                parseFloat(amount),
                payment_method,
                receipt_number,
                notes || null,
                req.user?.userId || req.user?.id
            ],
            transaction
        });

        // Calculate new balances
        const paymentAmount = parseFloat(amount);
        const currentLoanBalance = parseFloat(loan.loan_balance);
        const currentPrincipalBalance = parseFloat(loan.principal_balance);
        const currentInterestBalance = parseFloat(loan.interest_balance);

        // Simple allocation: pay interest first, then principal
        let remainingPayment = paymentAmount;
        let newInterestBalance = currentInterestBalance;
        let newPrincipalBalance = currentPrincipalBalance;

        if (remainingPayment > 0 && newInterestBalance > 0) {
            const interestPayment = Math.min(remainingPayment, newInterestBalance);
            newInterestBalance -= interestPayment;
            remainingPayment -= interestPayment;
        }

        if (remainingPayment > 0 && newPrincipalBalance > 0) {
            const principalPayment = Math.min(remainingPayment, newPrincipalBalance);
            newPrincipalBalance -= principalPayment;
        }

        const newLoanBalance = newPrincipalBalance + newInterestBalance;

        // Update loan balances
        await sequelize.query(`
            UPDATE loans SET 
                loan_balance = ?,
                principal_balance = ?,
                interest_balance = ?,
                last_payment_date = NOW(),
                last_payment_amount = ?,
                updated_at = NOW()
            WHERE id = ?
        `, {
            replacements: [
                newLoanBalance,
                newPrincipalBalance,
                newInterestBalance,
                paymentAmount,
                loan_id
            ],
            transaction
        });

        // Update loan schedules (mark as paid/partial)
        await sequelize.query(`
            UPDATE loan_schedules ls
            SET 
                amount_paid = LEAST(ls.total_due, ls.amount_paid + ?),
                status = CASE 
                    WHEN (ls.amount_paid + ?) >= ls.total_due THEN 'paid'
                    WHEN (ls.amount_paid + ?) > 0 THEN 'partial'
                    ELSE ls.status
                END,
                updated_at = NOW()
            WHERE ls.loan_id = ? 
            AND ls.status IN ('pending', 'partial')
            AND ls.due_date <= CURDATE()
            ORDER BY ls.due_date ASC, ls.installment_number ASC
        `, {
            replacements: [paymentAmount, paymentAmount, paymentAmount, loan_id],
            transaction
        });

        await transaction.commit();

        console.log(`✅ Payment recorded successfully - Loan: ${loan_id}, Amount: ${paymentAmount}, Receipt: ${receipt_number}`);

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                loan_id,
                amount_paid: paymentAmount,
                receipt_number,
                new_balance: newLoanBalance,
                new_principal_balance: newPrincipalBalance,
                new_interest_balance: newInterestBalance
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording payment',
            error: error.message
        });
    }
};

module.exports = {
    getTodaySummary,
    getRecentTransactions,
    getDueTodayLoans,
    getDueThisWeekLoans,
    getOverdueLoans,
    getCashierOverdueLoans,
    getRecentPayments,
    searchLoans,
    recordPayment
};
