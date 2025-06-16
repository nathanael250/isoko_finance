const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Record a new payment
const recordPayment = async (req, res) => {
    const { loanId, amount, paymentMethod, notes } = req.body;

    if (!loanId || !amount || !paymentMethod) {
        return res.status(400).json({ success: false, message: 'Loan ID, amount, and payment method are required.' });
    }

    try {
        // Start a transaction
        const t = await sequelize.transaction();

        // 1. Fetch loan details and schedule
        const [loan] = await sequelize.query(`
            SELECT 
                l.id, l.loan_number, l.client_id, l.total_loan_amount, l.total_interest, l.principal_amount,
                l.interest_amount_accrued, l.total_paid_amount, l.total_due_amount
            FROM loans l
            WHERE l.id = ?
            FOR UPDATE
        `, { replacements: [loanId], type: QueryTypes.SELECT, transaction: t });

        if (!loan) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Loan not found.' });
        }

        // 2. Determine which installment(s) to apply payment to
        // For simplicity, let's apply to the earliest pending installment first
        const [pendingInstallments] = await sequelize.query(`
            SELECT id, installment_number, principal_due, interest_due, penalty_due, total_due
            FROM loan_schedules
            WHERE loan_id = ? AND status = 'pending'
            ORDER BY due_date ASC
            FOR UPDATE
        `, { replacements: [loanId], type: QueryTypes.SELECT, transaction: t });

        let remainingAmount = parseFloat(amount);
        let installmentsPaid = [];
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;
        let totalPenaltyPaid = 0;

        for (const installment of pendingInstallments) {
            if (remainingAmount <= 0) break;

            let paymentAppliedToInstallment = 0;
            const installmentRemainingDue = parseFloat(installment.total_due);

            if (remainingAmount >= installmentRemainingDue) {
                // Pay off this installment completely
                paymentAppliedToInstallment = installmentRemainingDue;
                remainingAmount -= installmentRemainingDue;

                totalPrincipalPaid += parseFloat(installment.principal_due);
                totalInterestPaid += parseFloat(installment.interest_due);
                totalPenaltyPaid += parseFloat(installment.penalty_due);

                await sequelize.query(`
                    UPDATE loan_schedules
                    SET 
                        principal_paid = principal_due,
                        interest_paid = interest_due,
                        penalty_paid = penalty_due,
                        total_paid = total_due,
                        status = 'paid'
                    WHERE id = ?
                `, { replacements: [installment.id], type: QueryTypes.UPDATE, transaction: t });
                installmentsPaid.push({ id: installment.id, amount_paid: installmentRemainingDue, status: 'paid' });
            } else {
                // Partially pay this installment
                paymentAppliedToInstallment = remainingAmount;

                const principalRatio = parseFloat(installment.principal_due) / installmentRemainingDue;
                const interestRatio = parseFloat(installment.interest_due) / installmentRemainingDue;
                const penaltyRatio = parseFloat(installment.penalty_due) / installmentRemainingDue;

                const partialPrincipal = paymentAppliedToInstallment * principalRatio;
                const partialInterest = paymentAppliedToInstallment * interestRatio;
                const partialPenalty = paymentAppliedToInstallment * penaltyRatio;

                totalPrincipalPaid += partialPrincipal;
                totalInterestPaid += partialInterest;
                totalPenaltyPaid += partialPenalty;

            await sequelize.query(`
                UPDATE loan_schedules 
                SET 
                        principal_paid = principal_paid + ?,
                        interest_paid = interest_paid + ?,
                        penalty_paid = penalty_paid + ?,
                        total_paid = total_paid + ?,
                        status = CASE WHEN (principal_paid + ?) >= principal_due AND (interest_paid + ?) >= interest_due AND (penalty_paid + ?) >= penalty_due THEN 'paid' ELSE 'pending' END
                WHERE id = ?
                `, { replacements: [partialPrincipal, partialInterest, partialPenalty, paymentAppliedToInstallment, partialPrincipal, partialInterest, partialPenalty, installment.id], type: QueryTypes.UPDATE, transaction: t });
                installmentsPaid.push({ id: installment.id, amount_paid: paymentAppliedToInstallment, status: 'partially_paid' });
                remainingAmount = 0;
            }
        }

        // 3. Update loan summary (total_paid_amount, total_due_amount, status)
        const newTotalPaidAmount = parseFloat(loan.total_paid_amount || 0) + parseFloat(amount);
        const newTotalDueAmount = parseFloat(loan.total_due_amount || 0) - parseFloat(amount);

        let loanStatus = loan.status; // Keep current status unless fully paid

        // Check if all installments are paid
        const [unpaidInstallmentsCount] = await sequelize.query(`
            SELECT COUNT(*) as count FROM loan_schedules WHERE loan_id = ? AND status = 'pending'
        `, { replacements: [loanId], type: QueryTypes.SELECT, transaction: t });

        if (unpaidInstallmentsCount[0].count === 0) {
            loanStatus = 'completed';
        }

        await sequelize.query(`
            UPDATE loans 
            SET 
                total_paid_amount = ?,
                total_due_amount = ?,
                status = ?
            WHERE id = ?
        `, { replacements: [newTotalPaidAmount, newTotalDueAmount, loanStatus, loanId], type: QueryTypes.UPDATE, transaction: t });

        // 4. Record the repayment in the repayments table
        const [repaymentResult] = await sequelize.query(`
            INSERT INTO repayments (
                loan_id, amount_paid, payment_method, payment_date, notes, created_at, updated_at, receipt_number,
                principal_paid, interest_paid, penalty_paid
            ) VALUES (?, ?, ?, CURDATE(), ?, NOW(), NOW(), ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, parseFloat(amount), paymentMethod, notes,
                `REC-${Date.now()}`,
                totalPrincipalPaid,
                totalInterestPaid,
                totalPenaltyPaid
            ],
            type: QueryTypes.INSERT, transaction: t
        });

        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: { repaymentId: repaymentResult[0], installmentsPaid }
        });

    } catch (error) {
        console.error('Error recording payment:', error);
        if (t) await t.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to record payment',
            error: error.message
        });
    }
};

// Get repayments for a loan
const getLoanRepayments = async (req, res) => {
    try {
        const { loanId } = req.params;
        const [repayments] = await sequelize.query(`
            SELECT * FROM repayments WHERE loan_id = ? ORDER BY payment_date DESC, created_at DESC
        `, { replacements: [loanId], type: QueryTypes.SELECT });

        res.status(200).json({ success: true, data: repayments });
    } catch (error) {
        console.error('Error fetching loan repayments:', error);
        res.status(500).json({ success: false, message: 'Error fetching loan repayments', error: error.message });
    }
};

const getRepayments = async (req, res) => {
    try {
        const { 
            loanId, 
            clientId, 
            method, 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 10,
            search = '',
            paymentMethod = ''
        } = req.query;

        console.log('getRepayments called by user:', req.user);
        console.log('Query params:', req.query);

        let query = `
            SELECT 
                r.id,
                r.loan_id,
                r.receipt_number,
                r.amount_paid,
                r.principal_paid,
                r.interest_paid,
                r.penalty_paid,
                r.payment_method,
                r.payment_date,
                r.status,
                r.notes,
                r.received_by,
                r.created_at,
                r.updated_at,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                c.email as client_email
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            JOIN clients c ON l.client_id = c.id 
            WHERE 1=1
        `;
        
        const replacements = [];

        // Role-based filtering
        if (req.user.role === 'loan-officer' || req.user.role === 'loan_officer') {
            query += ` AND l.loan_officer_id = ?`;
            replacements.push(req.user.userId || req.user.id);
        }

        // Apply filters
        if (loanId) {
            query += ` AND r.loan_id = ?`;
            replacements.push(loanId);
        }
        
        if (clientId) {
            query += ` AND l.client_id = ?`;
            replacements.push(clientId);
        }
        
        if (method || paymentMethod) {
            query += ` AND r.payment_method = ?`;
            replacements.push(method || paymentMethod);
        }
        
        if (status) {
            query += ` AND r.status = ?`;
            replacements.push(status);
        }
        
        if (startDate) {
            query += ` AND DATE(r.payment_date) >= ?`;
            replacements.push(startDate);
        }
        
        if (endDate) {
            query += ` AND DATE(r.payment_date) <= ?`;
            replacements.push(endDate);
        }

        // Search functionality
        if (search) {
            query += ` AND (
                l.loan_number ILIKE ? OR 
                l.loan_account ILIKE ? OR 
                CONCAT(c.first_name, ' ', c.last_name) ILIKE ? OR
                r.receipt_number ILIKE ?
            )`;
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Get total count for pagination
        const countQuery = query.replace(
            /SELECT r\.id,.*?FROM/s, 
            'SELECT COUNT(r.id) as total FROM'
        );
        
        console.log('Count query:', countQuery);
        console.log('Count replacements:', replacements);
        
        const [countResult] = await sequelize.query(countQuery, { 
            replacements,
            type: sequelize.QueryTypes.SELECT 
        });
        
        const total = parseInt(countResult[0]?.total || 0);

        // Add pagination and ordering
        query += ` ORDER BY r.payment_date DESC, r.created_at DESC LIMIT ? OFFSET ?`;
        replacements.push(parseInt(limit));
        replacements.push((parseInt(page) - 1) * parseInt(limit));

        console.log('Final query:', query);
        console.log('Final replacements:', replacements);

        const repayments = await sequelize.query(query, { 
            replacements,
            type: sequelize.QueryTypes.SELECT 
        });

        console.log(`Found ${repayments.length} repayments out of ${total} total`);
        console.log('Sample repayment:', repayments[0]);

        // Ensure we return the correct structure
        const responseData = {
            repayments: Array.isArray(repayments) ? repayments : [],
            pagination: {
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page)
            }
        };

        console.log('Sending response:', responseData);

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error fetching repayments:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching repayments', 
            error: error.message,
            data: {
                repayments: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    pages: 0,
                    currentPage: 1
                }
            }
        });
    }
};



// Get a single repayment by ID (existing function, ensure it's working)
const getRepayment = async (req, res) => {
    try {
        const { id } = req.params;
        const [repayment] = await sequelize.query(`
            SELECT r.*, l.loan_number, c.first_name, c.last_name
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE r.id = ?
        `, { replacements: [id], type: QueryTypes.SELECT });

        if (!repayment || repayment.length === 0) {
            return res.status(404).json({ success: false, message: 'Repayment not found' });
        }

        res.status(200).json({ success: true, data: repayment[0] });
    } catch (error) {
        console.error('Error fetching repayment:', error);
        res.status(500).json({ success: false, message: 'Error fetching repayment', error: error.message });
    }
};

module.exports = {
    recordPayment,
    getLoanRepayments,
    getRepayments,
    getRepayment
};
