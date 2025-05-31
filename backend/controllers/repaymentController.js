const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');
const defineRepaymentModel = require('../models/Repayment');

let Repayment;

const getRepaymentModel = () => {
    if (!Repayment) {
        Repayment = defineRepaymentModel(sequelize);
    }
    return Repayment;
};

const processRepayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        console.log('💰 Processing loan repayment');
        console.log('Request body:', req.body);

        const {
            loan_id,
            amount_paid,
            payment_date,
            payment_method,
            reference_number,
            notes
        } = req.body;

        // Validate loan exists and is active
        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                c.first_name,
                c.last_name,
                c.client_number
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.id = ? AND l.status IN ('active', 'disbursed')
        `, { replacements: [loan_id], transaction });

        if (loans.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Active loan not found'
            });
        }

        const loan = loans[0];

        // Get outstanding schedule items (oldest first)
        const [schedules] = await sequelize.query(`
            SELECT * FROM loan_schedules 
            WHERE loan_id = ? AND status IN ('pending', 'partial', 'overdue')
            ORDER BY installment_number ASC
        `, { replacements: [loan_id], transaction });

        if (schedules.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No outstanding installments found for this loan'
            });
        }

        // Generate receipt number
        const RepaymentModel = getRepaymentModel();
        const receipt_number = await RepaymentModel.generateReceiptNumber();

        let remainingAmount = parseFloat(amount_paid);
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;
        let totalPenaltyPaid = 0;
        const updatedSchedules = [];

        // Process payment against outstanding schedules
        for (const schedule of schedules) {
            if (remainingAmount <= 0) break;

            const outstandingPrincipal = parseFloat(schedule.principal_due) - parseFloat(schedule.principal_paid || 0);
            const outstandingInterest = parseFloat(schedule.interest_due) - parseFloat(schedule.interest_paid || 0);
            const outstandingPenalty = parseFloat(schedule.penalty_amount || 0);
            const totalOutstanding = outstandingPrincipal + outstandingInterest + outstandingPenalty;

            if (totalOutstanding <= 0) continue;

            let principalPayment = 0;
            let interestPayment = 0;
            let penaltyPayment = 0;

            if (remainingAmount >= totalOutstanding) {
                // Full payment of this installment
                principalPayment = outstandingPrincipal;
                interestPayment = outstandingInterest;
                penaltyPayment = outstandingPenalty;
                remainingAmount -= totalOutstanding;
            } else {
                // Partial payment - prioritize penalty, then interest, then principal
                if (outstandingPenalty > 0) {
                    penaltyPayment = Math.min(remainingAmount, outstandingPenalty);
                    remainingAmount -= penaltyPayment;
                }

                if (remainingAmount > 0 && outstandingInterest > 0) {
                    interestPayment = Math.min(remainingAmount, outstandingInterest);
                    remainingAmount -= interestPayment;
                }

                if (remainingAmount > 0 && outstandingPrincipal > 0) {
                    principalPayment = Math.min(remainingAmount, outstandingPrincipal);
                    remainingAmount -= principalPayment;
                }
            }

            // Round to 2 decimal places to prevent truncation
            principalPayment = Math.round(principalPayment * 100) / 100;
            interestPayment = Math.round(interestPayment * 100) / 100;
            penaltyPayment = Math.round(penaltyPayment * 100) / 100;

            // Update schedule
            const newPrincipalPaid = Math.round((parseFloat(schedule.principal_paid || 0) + principalPayment) * 100) / 100;
            const newInterestPaid = Math.round((parseFloat(schedule.interest_paid || 0) + interestPayment) * 100) / 100;
            const newTotalPaid = Math.round((newPrincipalPaid + newInterestPaid + penaltyPayment) * 100) / 100;

            let newStatus = 'pending';
            if (newPrincipalPaid >= parseFloat(schedule.principal_due) && newInterestPaid >= parseFloat(schedule.interest_due)) {
                newStatus = 'paid';
            } else if (newPrincipalPaid > 0 || newInterestPaid > 0) {
                newStatus = 'partial';
            }

            console.log(`Updating schedule ${schedule.id}:`, {
                principalPayment,
                interestPayment,
                newPrincipalPaid,
                newInterestPaid,
                newTotalPaid,
                newStatus
            });

            await sequelize.query(`
                UPDATE loan_schedules 
                SET 
                    principal_paid = ?,
                    interest_paid = ?,
                    total_paid = ?,
                    payment_date = ?,
                    status = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, {
                replacements: [
                    newPrincipalPaid,
                    newInterestPaid,
                    newTotalPaid,
                    payment_date,
                    newStatus,
                    schedule.id
                ],
                transaction
            });

            totalPrincipalPaid += principalPayment;
            totalInterestPaid += interestPayment;
            totalPenaltyPaid += penaltyPayment;

            updatedSchedules.push({
                installment_number: schedule.installment_number,
                principal_paid: principalPayment,
                interest_paid: interestPayment,
                penalty_paid: penaltyPayment,
                status: newStatus
            });
        }

        // Round totals to prevent truncation
        totalPrincipalPaid = Math.round(totalPrincipalPaid * 100) / 100;
        totalInterestPaid = Math.round(totalInterestPaid * 100) / 100;
        totalPenaltyPaid = Math.round(totalPenaltyPaid * 100) / 100;
        const finalAmountPaid = Math.round(parseFloat(amount_paid) * 100) / 100;

        console.log('Creating repayment record:', {
            loan_id,
            receipt_number,
            payment_date,
            finalAmountPaid,
            totalPrincipalPaid,
            totalInterestPaid,
            totalPenaltyPaid
        });

        // Create repayment record
        await sequelize.query(`
            INSERT INTO repayments (
                loan_id,
                receipt_number,
                payment_date,
                amount_paid,
                principal_paid,
                interest_paid,
                penalty_paid,
                payment_method,
                reference_number,
                received_by,
                notes,
                status,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW(), NOW())
        `, {
            replacements: [
                loan_id,
                receipt_number,
                payment_date,
                finalAmountPaid,
                totalPrincipalPaid,
                totalInterestPaid,
                totalPenaltyPaid,
                payment_method || 'cash',
                reference_number || null,
                req.user?.userId || req.user?.id,
                notes || null
            ],
            transaction
        });

        // Update loan balances
        const currentPrincipalBalance = parseFloat(loan.principal_balance || loan.applied_amount);
        const currentInterestBalance = parseFloat(loan.interest_balance || 0);
        
        const newPrincipalBalance = Math.round((currentPrincipalBalance - totalPrincipalPaid) * 100) / 100;
        const newInterestBalance = Math.round((currentInterestBalance - totalInterestPaid) * 100) / 100;
        const newLoanBalance = Math.round((newPrincipalBalance + newInterestBalance) * 100) / 100;

        // Count paid installments
        const [paidCount] = await sequelize.query(`
            SELECT COUNT(*) as paid_count 
            FROM loan_schedules 
            WHERE loan_id = ? AND status = 'paid'
        `, { replacements: [loan_id], transaction });

        const installmentsPaid = parseInt(paidCount[0].paid_count);
        const installmentsOutstanding = parseInt(loan.total_installments) - installmentsPaid;

        // Determine loan status
        let loanStatus = loan.status;
        if (newLoanBalance <= 0 || installmentsOutstanding <= 0) {
            loanStatus = 'completed';
        }

        console.log('Updating loan balances:', {
            newPrincipalBalance,
            newInterestBalance,
            newLoanBalance,
            installmentsPaid,
            installmentsOutstanding,
            loanStatus
        });

        await sequelize.query(`
            UPDATE loans 
            SET 
                principal_balance = ?,
                interest_balance = ?,
                loan_balance = ?,
                installments_paid = ?,
                installments_outstanding = ?,
                last_payment_date = ?,
                status = ?,
                updated_at = NOW()
            WHERE id = ?
        `, {
            replacements: [
                newPrincipalBalance,
                newInterestBalance,
                newLoanBalance,
                installmentsPaid,
                installmentsOutstanding,
                payment_date,
                loanStatus,
                loan_id
            ],
            transaction
        });

        // Get updated loan details
        const [updatedLoan] = await sequelize.query(`
            SELECT 
                l.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.id = ?
        `, { replacements: [loan_id], transaction });

        await transaction.commit();

        console.log('✅ Repayment processed successfully:', receipt_number);

        res.status(201).json({
            success: true,
            message: 'Repayment processed successfully',
            data: {
                receipt_number,
                loan: updatedLoan[0],
                payment_details: {
                    amount_paid: finalAmountPaid,
                    principal_paid: totalPrincipalPaid,
                    interest_paid: totalInterestPaid,
                    penalty_paid: totalPenaltyPaid,
                    excess_amount: Math.round(remainingAmount * 100) / 100
                },
                updated_schedules: updatedSchedules
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Process repayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing repayment',
            error: error.message
        });
    }
};


const getRepayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            loan_id,
            payment_date_from,
            payment_date_to,
            payment_method,
            received_by,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];
        const conditions = [];

        if (loan_id) {
            conditions.push('r.loan_id = ?');
            replacements.push(loan_id);
        }

        if (payment_date_from) {
            conditions.push('r.payment_date >= ?');
            replacements.push(payment_date_from);
        }

        if (payment_date_to) {
            conditions.push('r.payment_date <= ?');
            replacements.push(payment_date_to);
        }

        if (payment_method) {
            conditions.push('r.payment_method = ?');
            replacements.push(payment_method);
        }

        if (received_by) {
            conditions.push('r.received_by = ?');
            replacements.push(received_by);
        }

        if (search) {
            conditions.push('(r.receipt_number LIKE ? OR l.loan_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)');
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total 
             FROM repayments r 
             JOIN loans l ON r.loan_id = l.id 
             JOIN clients c ON l.client_id = c.id${whereClause}`,
            { replacements }
        );

        const total = countResult[0].total;

        // Get repayments
        const [repayments] = await sequelize.query(`
            SELECT 
                r.*,
                l.loan_number,
                l.loan_account,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                u.first_name as received_by_first_name,
                u.last_name as received_by_last_name
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON r.received_by = u.id
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, parseInt(limit), parseInt(offset)]
        });

        res.status(200).json({
            success: true,
            data: {
                repayments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get repayments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching repayments',
            error: error.message
        });
    }
};

const getRepayment = async (req, res) => {
    try {
        const { id } = req.params;

        const [repayments] = await sequelize.query(`
            SELECT 
                r.*,
                l.loan_number,
                l.loan_account,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                u.first_name as received_by_first_name,
                u.last_name as received_by_last_name
            FROM repayments r
            JOIN loans l ON r.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON r.received_by = u.id
            WHERE r.id = ?
        `, { replacements: [id] });

        if (repayments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Repayment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { repayment: repayments[0] }
        });

    } catch (error) {
        console.error('Get repayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching repayment',
            error: error.message
        });
    }
};

const getLoanRepayments = async (req, res) => {
    try {
        const { loanId } = req.params;

        const [repayments] = await sequelize.query(`
            SELECT 
                r.*,
                u.first_name as received_by_first_name,
                u.last_name as received_by_last_name
            FROM repayments r
            LEFT JOIN users u ON r.received_by = u.id
            WHERE r.loan_id = ?
            ORDER BY r.payment_date DESC, r.created_at DESC
        `, { replacements: [loanId] });

        res.status(200).json({
            success: true,
            data: { 
                loan_id: loanId,
                repayments,
                total_repayments: repayments.length
            }
        });

    } catch (error) {
        console.error('Get loan repayments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan repayments',
            error: error.message
        });
    }
};

module.exports = {
    processRepayment,
    getRepayments,
    getRepayment,
    getLoanRepayments
};
