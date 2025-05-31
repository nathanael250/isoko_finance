const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

// Get comprehensive loan details with all sections
const getLoanDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Get basic loan information
        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                c.mobile as client_mobile,
                c.email as client_email,
                c.address as client_address,
                u1.first_name as officer_first_name,
                u1.last_name as officer_last_name,
                u2.first_name as approved_by_first_name,
                u2.last_name as approved_by_last_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            LEFT JOIN users u2 ON l.approved_by = u2.id
            WHERE l.id = ?
        `, { replacements: [id] });

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];

        // Get all related data
        const [repayments] = await sequelize.query(`
            SELECT 
                r.*,
                u.first_name as received_by_name,
                u.last_name as received_by_lastname
            FROM loan_repayments r
            LEFT JOIN users u ON r.received_by = u.id
            WHERE r.loan_id = ?
            ORDER BY r.payment_date DESC
        `, { replacements: [id] });

        const [schedule] = await sequelize.query(`
            SELECT * FROM loan_schedule 
            WHERE loan_id = ? 
            ORDER BY installment_number ASC
        `, { replacements: [id] });

        const [pendingDues] = await sequelize.query(`
            SELECT * FROM loan_schedule 
            WHERE loan_id = ? AND status IN ('pending', 'partial', 'overdue')
            ORDER BY due_date ASC
        `, { replacements: [id] });

        const [penaltySettings] = await sequelize.query(`
            SELECT * FROM penalty_settings 
            WHERE loan_type_id = ? AND is_active = TRUE
        `, { replacements: [loan.loan_type] });

        const [collateral] = await sequelize.query(`
            SELECT * FROM loan_collateral 
            WHERE loan_id = ?
            ORDER BY created_at DESC
        `, { replacements: [id] });

        const [expenses] = await sequelize.query(`
            SELECT 
                e.*,
                u.first_name as created_by_name,
                u.last_name as created_by_lastname
            FROM loan_expenses e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE e.loan_id = ?
            ORDER BY e.expense_date DESC
        `, { replacements: [id] });

        const [otherIncome] = await sequelize.query(`
            SELECT 
                oi.*,
                u.first_name as created_by_name,
                u.last_name as created_by_lastname
            FROM loan_other_income oi
            LEFT JOIN users u ON oi.created_by = u.id
            WHERE oi.loan_id = ?
            ORDER BY oi.income_date DESC
        `, { replacements: [id] });

        const [files] = await sequelize.query(`
            SELECT 
                f.*,
                u.first_name as uploaded_by_name,
                u.last_name as uploaded_by_lastname
            FROM loan_files f
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.loan_id = ?
            ORDER BY f.created_at DESC
        `, { replacements: [id] });

        const [comments] = await sequelize.query(`
            SELECT 
                c.*,
                u.first_name as created_by_name,
                u.last_name as created_by_lastname
            FROM loan_comments c
            JOIN users u ON c.created_by = u.id
            WHERE c.loan_id = ?
            ORDER BY c.created_at DESC
        `, { replacements: [id] });

        const [auditLogs] = await sequelize.query(`
            SELECT 
                al.*,
                u.first_name as performed_by_name,
                u.last_name as performed_by_lastname
            FROM loan_audit_logs al
            JOIN users u ON al.performed_by = u.id
            WHERE al.loan_id = ?
            ORDER BY al.performed_at DESC
            LIMIT 50
        `, { replacements: [id] });

        // Calculate summary statistics
        const totalPaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
        const totalPrincipalPaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.principal_paid || 0), 0);
        const totalInterestPaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.interest_paid || 0), 0);
        const totalPenaltyPaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.penalty_paid || 0), 0);

        const overdueDues = pendingDues.filter(due => new Date(due.due_date) < new Date());
        const totalOverdue = overdueDues.reduce((sum, due) => sum + parseFloat(due.total_due - due.total_paid), 0);

        res.status(200).json({
            success: true,
            data: {
                loan: loan,
                repayments: repayments,
                loanTerms: {
                    applied_amount: loan.applied_amount,
                    approved_amount: loan.approved_amount,
                    disbursed_amount: loan.disbursed_amount,
                    interest_rate: loan.interest_rate,
                    loan_term_months: loan.loan_term_months,
                    repayment_frequency: loan.repayment_frequency,
                    installment_amount: loan.installment_amount,
                    total_installments: loan.total_installments
                },
                loanSchedule: schedule,
                pendingDues: pendingDues,
                penaltySettings: penaltySettings,
                collateral: collateral,
                expenses: expenses,
                otherIncome: otherIncome,
                files: files,
                comments: comments,
                auditLogs: auditLogs,
                summary: {
                    total_paid: totalPaid,
                    total_principal_paid: totalPrincipalPaid,
                    total_interest_paid: totalInterestPaid,
                    total_penalty_paid: totalPenaltyPaid,
                    remaining_balance: parseFloat(loan.loan_balance || 0) - totalPrincipalPaid,
                    total_overdue: totalOverdue,
                    overdue_installments: overdueDues.length,
                    next_due_date: pendingDues.length > 0 ? pendingDues[0].due_date : null
                }
            }
        });

    } catch (error) {
        console.error('Get loan details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan details',
            error: error.message
        });
    }
};

// Add repayment
// Updated addRepayment function
const addRepayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { loanId } = req.params;
        const {
            payment_date,
            amount_paid,
            principal_paid,
            interest_paid,
            penalty_paid = 0,
            payment_method,
            reference_number,
            notes
        } = req.body;

        // Validate payment amounts
        const calculatedTotal = parseFloat(principal_paid) + parseFloat(interest_paid) + parseFloat(penalty_paid);
        if (Math.abs(calculatedTotal - parseFloat(amount_paid)) > 0.01) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Payment breakdown does not match total amount paid'
            });
        }

        // Get current loan details
        const [loans] = await sequelize.query(`
            SELECT * FROM loans WHERE id = ?
        `, { replacements: [loanId], transaction });

        if (loans.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];

        // Insert repayment record
        const [repaymentResult] = await sequelize.query(`
            INSERT INTO loan_repayments (
                loan_id, payment_date, amount_paid, principal_paid, 
                interest_paid, penalty_paid, payment_method, 
                reference_number, received_by, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, payment_date, amount_paid, principal_paid,
                interest_paid, penalty_paid, payment_method,
                reference_number, req.user?.userId, notes
            ],
            transaction
        });

        // Calculate new loan balances
        const newPrincipalBalance = parseFloat(loan.principal_balance || loan.disbursed_amount || loan.approved_amount) - parseFloat(principal_paid);
        const newInterestBalance = parseFloat(loan.interest_balance || 0) - parseFloat(interest_paid);
        const newLoanBalance = newPrincipalBalance + Math.max(0, newInterestBalance);
        
        // Calculate installments paid
        const newInstallmentsPaid = parseInt(loan.installments_paid || 0) + 1;
        const newInstallmentsOutstanding = parseInt(loan.total_installments || 0) - newInstallmentsPaid;

        // Determine new loan status
        let newStatus = loan.status;
        if (newLoanBalance <= 0 && newInstallmentsOutstanding <= 0) {
            newStatus = 'completed';
        } else if (loan.status === 'disbursed') {
            newStatus = 'active';
        }

        // Update loan table
        await sequelize.query(`
            UPDATE loans SET 
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
                Math.max(0, newPrincipalBalance),
                Math.max(0, newInterestBalance),
                Math.max(0, newLoanBalance),
                newInstallmentsPaid,
                Math.max(0, newInstallmentsOutstanding),
                payment_date,
                newStatus,
                loanId
            ],
            transaction
        });

        // Update loan schedule - mark installments as paid
        await sequelize.query(`
            UPDATE loan_schedule 
            SET 
                principal_paid = principal_paid + ?,
                interest_paid = interest_paid + ?,
                penalty_paid = penalty_paid + ?,
                total_paid = total_paid + ?,
                status = CASE 
                    WHEN (total_paid + ?) >= total_due THEN 'paid'
                    WHEN (total_paid + ?) > 0 THEN 'partial'
                    ELSE status 
                END,
                updated_at = NOW()
            WHERE loan_id = ? 
            AND status IN ('pending', 'partial', 'overdue')
            ORDER BY installment_number ASC
            LIMIT 1
        `, {
            replacements: [
                principal_paid, interest_paid, penalty_paid, amount_paid,
                amount_paid, amount_paid, loanId
            ],
            transaction
        });

        // Update performance classification
        const today = new Date();
        const [overdueSchedules] = await sequelize.query(`
            SELECT COUNT(*) as overdue_count 
            FROM loan_schedule 
            WHERE loan_id = ? 
            AND status IN ('pending', 'partial') 
            AND due_date < ?
        `, { replacements: [loanId, today.toISOString().split('T')[0]], transaction });

        let performanceClass = 'performing';
        let daysInArrears = 0;

        if (overdueSchedules[0].overdue_count > 0) {
            // Get the oldest overdue installment
            const [oldestOverdue] = await sequelize.query(`
                SELECT due_date FROM loan_schedule 
                WHERE loan_id = ? 
                AND status IN ('pending', 'partial') 
                AND due_date < ?
                ORDER BY due_date ASC 
                LIMIT 1
            `, { replacements: [loanId, today.toISOString().split('T')[0]], transaction });

            if (oldestOverdue.length > 0) {
                const overdueDays = Math.floor((today - new Date(oldestOverdue[0].due_date)) / (1000 * 60 * 60 * 24));
                daysInArrears = overdueDays;

                if (overdueDays <= 30) {
                    performanceClass = 'watch';
                } else if (overdueDays <= 90) {
                    performanceClass = 'substandard';
                } else if (overdueDays <= 180) {
                    performanceClass = 'doubtful';
                } else {
                    performanceClass = 'loss';
                }
            }
        }

        // Update performance classification
        await sequelize.query(`
            UPDATE loans SET 
                performance_class = ?,
                days_in_arrears = ?,
                arrears_start_date = CASE 
                    WHEN ? > 0 AND arrears_start_date IS NULL THEN ?
                    WHEN ? = 0 THEN NULL
                    ELSE arrears_start_date
                END
            WHERE id = ?
        `, {
            replacements: [
                performanceClass, daysInArrears, daysInArrears,
                today.toISOString().split('T')[0], daysInArrears, loanId
            ],
            transaction
        });

        // Log the action
        await sequelize.query(`
            INSERT INTO loan_audit_logs (loan_id, action, description, new_values, performed_by)
            VALUES (?, 'payment_received', ?, ?, ?)
        `, {
            replacements: [
                loanId,
                `Payment of ${amount_paid} received via ${payment_method}. Principal: ${principal_paid}, Interest: ${interest_paid}, Penalty: ${penalty_paid}`,
                JSON.stringify({
                    amount_paid,
                    principal_paid,
                    interest_paid,
                    penalty_paid,
                    new_principal_balance: Math.max(0, newPrincipalBalance),
                    new_loan_balance: Math.max(0, newLoanBalance),
                    new_status: newStatus,
                    performance_class: performanceClass
                }),
                req.user?.userId
            ],
            transaction
        });

        await transaction.commit();

        // Get updated loan details
        const [updatedLoan] = await sequelize.query(`
            SELECT * FROM loans WHERE id = ?
        `, { replacements: [loanId] });

        res.status(201).json({
            success: true,
            message: 'Repayment processed successfully',
            data: {
                repayment_id: repaymentResult.insertId,
                updated_loan: updatedLoan[0],
                calculations: {
                    previous_principal_balance: loan.principal_balance,
                    new_principal_balance: Math.max(0, newPrincipalBalance),
                    previous_loan_balance: loan.loan_balance,
                    new_loan_balance: Math.max(0, newLoanBalance),
                    installments_paid: newInstallmentsPaid,
                    installments_remaining: Math.max(0, newInstallmentsOutstanding),
                    performance_class: performanceClass,
                    days_in_arrears: daysInArrears
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Add repayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing repayment',
            error: error.message
        });
    }
};

// Function to recalculate all loan balances (useful for data integrity)
const recalculateLoanBalances = async (req, res) => {
    try {
        const { loanId } = req.params;

        // Get all repayments for this loan
        const [repayments] = await sequelize.query(`
            SELECT 
                SUM(principal_paid) as total_principal_paid,
                SUM(interest_paid) as total_interest_paid,
                SUM(penalty_paid) as total_penalty_paid,
                SUM(amount_paid) as total_amount_paid,
                COUNT(*) as payment_count,
                MAX(payment_date) as last_payment_date
            FROM loan_repayments 
            WHERE loan_id = ? AND status = 'confirmed'
        `, { replacements: [loanId] });

        // Get original loan details
        const [loans] = await sequelize.query(`
            SELECT * FROM loans WHERE id = ?
        `, { replacements: [loanId] });

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];
        const payment = repayments[0];

        // Calculate correct balances
        const originalPrincipal = parseFloat(loan.disbursed_amount || loan.approved_amount || loan.applied_amount);
        const totalPrincipalPaid = parseFloat(payment.total_principal_paid || 0);
        const totalInterestPaid = parseFloat(payment.total_interest_paid || 0);
        
        const newPrincipalBalance = originalPrincipal - totalPrincipalPaid;
        const newLoanBalance = Math.max(0, newPrincipalBalance);
        const installmentsPaid = parseInt(payment.payment_count || 0);
        const installmentsOutstanding = parseInt(loan.total_installments || 0) - installmentsPaid;

        // Determine status
        let status = loan.status;
        if (newLoanBalance <= 0 && installmentsOutstanding <= 0) {
            status = 'completed';
        } else if (loan.status === 'disbursed' && totalPrincipalPaid > 0) {
            status = 'active';
        }

        // Update loan table
        await sequelize.query(`
            UPDATE loans SET 
                principal_balance = ?,
                loan_balance = ?,
                installments_paid = ?,
                installments_outstanding = ?,
                last_payment_date = ?,
                status = ?,
                updated_at = NOW()
            WHERE id = ?
        `, {
            replacements: [
                Math.max(0, newPrincipalBalance),
                Math.max(0, newLoanBalance),
                installmentsPaid,
                Math.max(0, installmentsOutstanding),
                payment.last_payment_date,
                status,
                loanId
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Loan balances recalculated successfully',
            data: {
                original_principal: originalPrincipal,
                total_principal_paid: totalPrincipalPaid,
                new_principal_balance: Math.max(0, newPrincipalBalance),
                new_loan_balance: Math.max(0, newLoanBalance),
                installments_paid: installmentsPaid,
                installments_outstanding: Math.max(0, installmentsOutstanding),
                status: status
            }
        });

    } catch (error) {
        console.error('Recalculate loan balances error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recalculating loan balances',
            error: error.message
        });
    }
};



// Add comment
const addComment = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { comment, comment_type = 'general', is_internal = true, priority = 'medium' } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO loan_comments (loan_id, comment_type, comment, is_internal, priority, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, {
            replacements: [loanId, comment_type, comment, is_internal, priority, req.user?.userId]
        });

        // Log the action
        await sequelize.query(`
            INSERT INTO loan_audit_logs (loan_id, action, description, performed_by)
            VALUES (?, 'comment_added', ?, ?)
        `, {
            replacements: [loanId, `Comment added: ${comment_type}`, req.user?.userId]
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment_id: result.insertId }
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// Generate loan schedule
// Update this to be a regenerate function instead
const regenerateLoanSchedule = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { loanId } = req.params;

        // Get loan details
        const [loans] = await sequelize.query(
            'SELECT * FROM loans WHERE id = ?',
            { replacements: [loanId], transaction }
        );

        if (loans.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];
        
        // Only allow regeneration for pending or approved loans
        if (!['pending', 'approved'].includes(loan.status)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot regenerate schedule for disbursed or active loans'
            });
        }

        // Clear existing schedule
        await sequelize.query('DELETE FROM loan_schedule WHERE loan_id = ?', { 
            replacements: [loanId], 
            transaction 
        });

        // Get Loan model and recalculate
        const LoanModel = getLoanModel();
        const loanDetails = LoanModel.calculateLoanDetails(
            parseFloat(loan.approved_amount || loan.applied_amount),
            parseFloat(loan.nominal_interest_rate),
            parseInt(loan.loan_term_months),
            loan.repayment_frequency,
            loan.interest_calculation_method
        );

        // Insert new schedule
        const scheduleValues = loanDetails.schedule.map(installment => [
            loanId,
            installment.installment_number,
            installment.due_date,
            installment.principal_due,
            installment.interest_due,
            installment.total_due,
            installment.balance_after
        ]);

        const scheduleQuery = `
            INSERT INTO loan_schedule (
                loan_id, installment_number, due_date, principal_due, 
                interest_due, total_due, balance_after
            ) VALUES ${scheduleValues.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
        `;

        await sequelize.query(scheduleQuery, {
            replacements: scheduleValues.flat(),
            transaction
        });

        // Log the action
        await sequelize.query(`
            INSERT INTO loan_audit_logs (loan_id, action, description, performed_by)
            VALUES (?, 'schedule_regenerated', 'Loan schedule regenerated', ?)
        `, {
            replacements: [loanId, req.user?.userId],
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Loan schedule regenerated successfully',
            data: {
                schedule: loanDetails.schedule,
                loan_details: loanDetails
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Regenerate schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Error regenerating loan schedule',
            error: error.message
        });
    }
};


// Add collateral
const addCollateral = async (req, res) => {
    try {
        const { loanId } = req.params;
        const {
            collateral_type,
            description,
            estimated_value,
            location,
            condition_status = 'good',
            insurance_details,
            valuation_date,
            valuated_by,
            notes
        } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO loan_collateral (
                loan_id, collateral_type, description, estimated_value,
                current_value, location, condition_status, insurance_details,
                valuation_date, valuated_by, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, collateral_type, description, estimated_value,
                estimated_value, location, condition_status, insurance_details,
                valuation_date, valuated_by, notes
            ]
        });

        // Log the action
        await sequelize.query(`
            INSERT INTO loan_audit_logs (loan_id, action, description, performed_by)
            VALUES (?, 'collateral_added', ?, ?)
        `, {
            replacements: [loanId, `Collateral added: ${collateral_type}`, req.user?.userId]
        });

        res.status(201).json({
            success: true,
            message: 'Collateral added successfully',
            data: { collateral_id: result.insertId }
        });

    } catch (error) {
        console.error('Add collateral error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding collateral',
            error: error.message
        });
    }
};

// Add expense
const addExpense = async (req, res) => {
    try {
        const { loanId } = req.params;
        const {
            expense_type,
            description,
            amount,
            expense_date,
            paid_by = 'client',
            payment_status = 'pending',
            notes
        } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO loan_expenses (
                loan_id, expense_type, description, amount,
                expense_date, paid_by, payment_status, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, expense_type, description, amount,
                expense_date, paid_by, payment_status, notes, req.user?.userId
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            data: { expense_id: result.insertId }
        });

    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding expense',
            error: error.message
        });
    }
};

// Add other income
const addOtherIncome = async (req, res) => {
    try {
        const { loanId } = req.params;
        const {
            income_type,
            description,
            amount,
            income_date,
            status = 'pending',
            notes
        } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO loan_other_income (
                loan_id, income_type, description, amount,
                income_date, status, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, income_type, description, amount,
                income_date, status, notes, req.user?.userId
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Other income added successfully',
            data: { income_id: result.insertId }
        });

    } catch (error) {
        console.error('Add other income error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding other income',
            error: error.message
        });
    }
};

// Upload file
const uploadFile = async (req, res) => {
    try {
        const { loanId } = req.params;
        const {
            file_name,
            file_path,
            file_type,
            file_size,
            mime_type,
            description,
            is_required = false
        } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO loan_files (
                loan_id, file_name, file_path, file_type,
                file_size, mime_type, description, uploaded_by, is_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                loanId, file_name, file_path, file_type,
                file_size, mime_type, description, req.user?.userId, is_required
            ]
        });

        // Log the action
        await sequelize.query(`
            INSERT INTO loan_audit_logs (loan_id, action, description, performed_by)
            VALUES (?, 'document_uploaded', ?, ?)
        `, {
            replacements: [loanId, `Document uploaded: ${file_name}`, req.user?.userId]
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: { file_id: result.insertId }
        });

    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};

// Calculate penalties
const calculatePenalties = async (req, res) => {
    try {
        const { loanId } = req.params;

        // Get overdue installments
        const [overdueInstallments] = await sequelize.query(`
            SELECT * FROM loan_schedule 
            WHERE loan_id = ? 
            AND status IN ('pending', 'partial') 
            AND due_date < CURDATE()
            ORDER BY due_date ASC
        `, { replacements: [loanId] });

        // Get penalty settings
        const [penaltySettings] = await sequelize.query(`
            SELECT ps.* FROM penalty_settings ps
            JOIN loans l ON l.loan_type = ps.loan_type_id
            WHERE l.id = ? AND ps.is_active = TRUE
        `, { replacements: [loanId] });

        if (penaltySettings.length === 0) {
            return res.status(200).json({
                success: true,
                data: { total_penalty: 0, installments: [] }
            });
        }

        const penalty = penaltySettings[0];
        let totalPenalty = 0;
        const penaltyDetails = [];

        overdueInstallments.forEach(installment => {
            const dueDate = new Date(installment.due_date);
            const today = new Date();
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - penalty.grace_period_days;

            if (daysOverdue > 0) {
                let penaltyAmount = 0;
                const outstandingAmount = installment.total_due - installment.total_paid;

                if (penalty.penalty_type === 'daily') {
                    penaltyAmount = outstandingAmount * penalty.penalty_rate * daysOverdue;
                } else if (penalty.penalty_type === 'monthly') {
                    const monthsOverdue = Math.ceil(daysOverdue / 30);
                    penaltyAmount = outstandingAmount * penalty.penalty_rate * monthsOverdue;
                } else if (penalty.penalty_type === 'fixed') {
                    penaltyAmount = penalty.penalty_rate;
                }

                // Apply max penalty limit if set
                if (penalty.max_penalty_amount && penaltyAmount > penalty.max_penalty_amount) {
                    penaltyAmount = penalty.max_penalty_amount;
                }

                totalPenalty += penaltyAmount;
                penaltyDetails.push({
                    installment_number: installment.installment_number,
                    due_date: installment.due_date,
                    days_overdue: daysOverdue,
                    outstanding_amount: outstandingAmount,
                    penalty_amount: penaltyAmount
                });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                total_penalty: totalPenalty,
                penalty_settings: penalty,
                installments: penaltyDetails
            }
        });

    } catch (error) {
        console.error('Calculate penalties error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating penalties',
            error: error.message
        });
    }
};

// Export all functions
module.exports = {
    getLoanDetails,
    addRepayment,
    addComment,
    generateLoanSchedule:regenerateLoanSchedule,
    addCollateral,
    addExpense,
    addOtherIncome,
    uploadFile,
    calculatePenalties,
    recalculateLoanBalances
};


