const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

// Get all loans with no repayments within date range
const getLoansWithNoRepayment = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort_by = 'disbursement_date',
            sort_order = 'DESC',
            
            // Date range parameters
            check_period_start,
            check_period_end,
            disbursement_start,
            disbursement_end,
            
            // No repayment criteria
            criteria = 'no_payments_ever', // 'no_payments_ever', 'no_payments_in_period', 'missed_expected_payments'
            expected_payment_days = 30, // Days after disbursement when first payment was expected
            
            // Existing filters
            min_amount,
            max_amount,
            min_days_since_disbursement,
            max_days_since_disbursement,
            branch,
            loan_officer_id,
            loan_type_id,
            client_status,
            risk_category,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        // Build base where clause
        let whereClause = `WHERE l.status IN ('disbursed', 'active') AND l.disbursement_date IS NOT NULL`;
        let replacements = [];

        // Add disbursement date range filter
        if (disbursement_start) {
            whereClause += ' AND l.disbursement_date >= ?';
            replacements.push(disbursement_start);
        }

        if (disbursement_end) {
            whereClause += ' AND l.disbursement_date <= ?';
            replacements.push(disbursement_end);
        }

        // Build no repayment criteria based on selected criteria
        let noRepaymentCondition = '';
        
        switch (criteria) {
            case 'no_payments_ever':
                // Loans with absolutely no payments since disbursement
                noRepaymentCondition = `
                    AND l.id NOT IN (
                        SELECT DISTINCT loan_id 
                        FROM loan_payments 
                        WHERE loan_id = l.id
                    )
                `;
                break;
                
            case 'no_payments_in_period':
                // Loans with no payments within specified date range
                if (!check_period_start || !check_period_end) {
                    return res.status(400).json({
                        success: false,
                        message: 'check_period_start and check_period_end are required for no_payments_in_period criteria'
                    });
                }
                
                noRepaymentCondition = `
                    AND l.id NOT IN (
                        SELECT DISTINCT loan_id 
                        FROM loan_payments 
                        WHERE loan_id = l.id 
                        AND payment_date BETWEEN ? AND ?
                    )
                `;
                replacements.push(check_period_start, check_period_end);
                break;
                
            case 'missed_expected_payments':
                // Loans that should have had payments by now but don't
                const expectedDays = parseInt(expected_payment_days);
                noRepaymentCondition = `
                    AND DATEDIFF(CURDATE(), l.disbursement_date) >= ?
                    AND l.id NOT IN (
                        SELECT DISTINCT loan_id 
                        FROM loan_payments 
                        WHERE loan_id = l.id
                        AND payment_date <= DATE_ADD(l.disbursement_date, INTERVAL ? DAY)
                    )
                `;
                replacements.push(expectedDays, expectedDays);
                break;
                
            case 'no_payments_since_date':
                // Loans with no payments since a specific date
                if (!check_period_start) {
                    return res.status(400).json({
                        success: false,
                        message: 'check_period_start is required for no_payments_since_date criteria'
                    });
                }
                
                noRepaymentCondition = `
                    AND l.id NOT IN (
                        SELECT DISTINCT loan_id 
                        FROM loan_payments 
                        WHERE loan_id = l.id 
                        AND payment_date >= ?
                    )
                    AND l.disbursement_date < ?
                `;
                replacements.push(check_period_start, check_period_start);
                break;
                
            case 'payment_gap_exceeded':
                // Loans with payment gaps exceeding specified days
                const gapDays = parseInt(expected_payment_days) || 60;
                noRepaymentCondition = `
                    AND (
                        -- No payments at all and gap exceeded
                        (l.id NOT IN (SELECT DISTINCT loan_id FROM loan_payments WHERE loan_id = l.id)
                         AND DATEDIFF(CURDATE(), l.disbursement_date) > ?)
                        OR
                        -- Last payment was too long ago
                        (l.id IN (SELECT DISTINCT loan_id FROM loan_payments WHERE loan_id = l.id)
                         AND DATEDIFF(CURDATE(), (
                             SELECT MAX(payment_date) 
                             FROM loan_payments 
                             WHERE loan_id = l.id
                         )) > ?)
                    )
                `;
                replacements.push(gapDays, gapDays);
                break;
                
            default:
                // Default to no payments ever
                noRepaymentCondition = `
                    AND l.id NOT IN (
                        SELECT DISTINCT loan_id 
                        FROM loan_payments 
                        WHERE loan_id = l.id
                    )
                `;
        }

        whereClause += noRepaymentCondition;

        // Add other filters
        const conditions = [];

        if (min_amount) {
            conditions.push('l.disbursed_amount >= ?');
            replacements.push(min_amount);
        }

        if (max_amount) {
            conditions.push('l.disbursed_amount <= ?');
            replacements.push(max_amount);
        }

        if (min_days_since_disbursement) {
            conditions.push('DATEDIFF(CURDATE(), l.disbursement_date) >= ?');
            replacements.push(min_days_since_disbursement);
        }

        if (max_days_since_disbursement) {
            conditions.push('DATEDIFF(CURDATE(), l.disbursement_date) <= ?');
            replacements.push(max_days_since_disbursement);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (loan_type_id) {
            conditions.push('l.loan_type_id = ?');
            replacements.push(loan_type_id);
        }

        if (client_status) {
            conditions.push('c.status = ?');
            replacements.push(client_status);
        }

        if (search) {
            conditions.push(`(
                l.loan_number LIKE ? OR 
                l.loan_account LIKE ? OR 
                c.first_name LIKE ? OR 
                c.last_name LIKE ? OR
                c.client_number LIKE ? OR
                c.mobile LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            whereClause += ' AND ' + conditions.join(' AND ');
        }

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total 
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements });

        const total = countResult[0].total;

        // Get loans with no repayments
        const [loans] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                l.client_id,
                l.disbursed_amount,
                l.loan_balance,
                l.principal_balance,
                l.interest_balance,
                l.installment_amount,
                l.total_installments,
                l.disbursement_date,
                l.maturity_date,
                l.first_payment_date,
                l.repayment_frequency,
                l.status,
                l.branch,
                l.notes,
                
                -- Client information
                c.client_number,
                c.first_name,
                c.last_name,
                c.mobile,
                c.email,
                c.address,
                c.city,
                c.status as client_status,
                
                -- Loan type information
                lt.name as loan_type_name,
                lt.category as loan_type_category,
                
                -- Loan officer information
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer_name,
                u.employee_id as loan_officer_employee_id,
                u.mobile as loan_officer_mobile,
                
                -- Calculated fields
                DATEDIFF(CURDATE(), l.disbursement_date) as days_since_disbursement,
                DATEDIFF(CURDATE(), l.first_payment_date) as days_past_first_payment,
                
                -- Payment analysis
                (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) as total_payments_made,
                (SELECT SUM(amount) FROM loan_payments lp WHERE lp.loan_id = l.id) as total_amount_paid,
                (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id) as last_payment_date,
                (SELECT MIN(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id) as first_payment_made_date,
                
                -- Date range specific analysis
                ${criteria === 'no_payments_in_period' ? `
                (SELECT COUNT(*) FROM loan_payments lp 
                 WHERE lp.loan_id = l.id 
                 AND lp.payment_date BETWEEN '${check_period_start}' AND '${check_period_end}') as payments_in_check_period,
                (SELECT SUM(amount) FROM loan_payments lp 
                 WHERE lp.loan_id = l.id 
                 AND lp.payment_date BETWEEN '${check_period_start}' AND '${check_period_end}') as amount_paid_in_check_period,
                ` : ''}
                
                -- Expected vs actual payments
                CASE 
                    WHEN l.repayment_frequency = 'monthly' THEN 
                        FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 30)
                    WHEN l.repayment_frequency = 'weekly' THEN 
                        FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 7)
                    WHEN l.repayment_frequency = 'bi_weekly' THEN 
                        FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 14)
                    WHEN l.repayment_frequency = 'quarterly' THEN 
                        FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 90)
                    ELSE 0
                END as expected_payments_count,
                
                -- Payment gap analysis
                CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END as days_since_last_payment,
                
                -- Risk assessment
                CASE 
                    WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 30 THEN 'LOW'
                    WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 90 THEN 'MEDIUM'
                    WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 180 THEN 'HIGH'
                    ELSE 'CRITICAL'
                END as risk_category,
                
                -- Payment status based on criteria
                CASE 
                    WHEN l.first_payment_date < CURDATE() THEN 'OVERDUE'
                    WHEN l.first_payment_date = CURDATE() THEN 'DUE_TODAY'
                    ELSE 'NOT_YET_DUE'
                END as payment_status,
                
                -- Financial impact
                ROUND(
                    (l.disbursed_amount * l.nominal_interest_rate / 100 / 12) * 
                    DATEDIFF(CURDATE(), l.disbursement_date) / 30, 2
                ) as estimated_interest_loss,
                
                -- Recovery actions count
                (SELECT COUNT(*) 
                 FROM loan_recovery_actions lra 
                 WHERE lra.loan_id = l.id) as recovery_actions_count,
                 
                -- Last contact attempt
                (SELECT MAX(action_date) 
                 FROM loan_recovery_actions lra 
                 WHERE lra.loan_id = l.id) as last_contact_date,
                 
                -- Criteria-specific information
                '${criteria}' as no_repayment_criteria,
                ${check_period_start ? `'${check_period_start}'` : 'NULL'} as check_period_start,
                ${check_period_end ? `'${check_period_end}'` : 'NULL'} as check_period_end
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, parseInt(limit), parseInt(offset)]
        });

        // Calculate summary statistics
        const [summary] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans_no_repayment,
                SUM(l.disbursed_amount) as total_amount_at_risk,
                AVG(l.disbursed_amount) as avg_loan_amount,
                SUM(ROUND(
                    (l.disbursed_amount * l.nominal_interest_rate / 100 / 12) * 
                    DATEDIFF(CURDATE(), l.disbursement_date) / 30, 2
                )) as total_estimated_interest_loss,
                AVG(DATEDIFF(CURDATE(), l.disbursement_date)) as avg_days_since_disbursement,
                
                -- Risk distribution
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 30 THEN 1 ELSE 0 END) as low_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 31 AND 90 THEN 1 ELSE 0 END) as medium_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 91 AND 180 THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) > 180 THEN 1 ELSE 0 END) as critical_risk_count,
                
                -- Amount distribution by risk
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 30 THEN l.disbursed_amount ELSE 0 END) as low_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 31 AND 90 THEN l.disbursed_amount ELSE 0 END) as medium_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 91 AND 180 THEN l.disbursed_amount ELSE 0 END) as high_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) > 180 THEN l.disbursed_amount ELSE 0 END) as critical_risk_amount,
                
                -- Payment analysis
                AVG((SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id)) as avg_payments_per_loan,
                SUM((SELECT COALESCE(SUM(amount), 0) FROM loan_payments lp WHERE lp.loan_id = l.id)) as total_amount_ever_paid,
                
                -- Date range specific summary
                ${criteria === 'no_payments_in_period' ? `
                AVG((SELECT COUNT(*) FROM loan_payments lp 
                     WHERE lp.loan_id = l.id 
                     AND lp.payment_date BETWEEN '${check_period_start}' AND '${check_period_end}')) as avg_payments_in_period,
                SUM((SELECT COALESCE(SUM(amount), 0) FROM loan_payments lp 
                     WHERE lp.loan_id = l.id 
                     AND lp.payment_date BETWEEN '${check_period_start}' AND '${check_period_end}')) as total_paid_in_period,
                ` : ''}
                
                -- Payment gap analysis
                AVG(CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END) as avg_days_since_last_payment,
                
                MAX(CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END) as max_days_since_last_payment
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements: replacements.slice(0, -2) }); // Remove limit and offset

        res.status(200).json({
            success: true,
            data: {
                loans: loans,
                summary: summary[0],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                criteria_info: {
                    criteria,
                    check_period_start,
                    check_period_end,
                    disbursement_start,
                    disbursement_end,
                    expected_payment_days,
                    description: getCriteriaDescription(criteria, check_period_start, check_period_end, expected_payment_days)
                },
                filters_applied: {
                    min_amount,
                    max_amount,
                    min_days_since_disbursement,
                    max_days_since_disbursement,
                    branch,
                    loan_officer_id,
                    loan_type_id,
                    client_status,
                    search
                }
            }
        });

    } catch (error) {
        console.error('Get loans with no repayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans with no repayment',
            error: error.message
        });
    }
};

// Get detailed payment timeline analysis for a specific loan
const getLoanPaymentTimelineAnalysis = async (req, res) => {
    try {
        const { loan_id } = req.params;
        const { 
            analysis_start_date,
            analysis_end_date,
            include_expected_schedule = 'true'
        } = req.query;

        // Get loan details
        const [loanDetails] = await sequelize.query(`
            SELECT 
                l.*,
                c.client_number,
                c.first_name,
                c.last_name,
                c.mobile,
                c.email,
                lt.name as loan_type_name,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE l.id = ?
        `, { replacements: [loan_id] });

        if (loanDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loanDetails[0];

        // Build date range for analysis
        const startDate = analysis_start_date || loan.disbursement_date;
        const endDate = analysis_end_date || new Date().toISOString().split('T')[0];

        // Get actual payments within the analysis period
        const [actualPayments] = await sequelize.query(`
            SELECT 
                payment_date,
                amount,
                principal_amount,
                interest_amount,
                fees_amount,
                payment_method,
                reference_number,
                notes,
                created_at
            FROM loan_payments
            WHERE loan_id = ?
            AND payment_date BETWEEN ? AND ?
            ORDER BY payment_date ASC
        `, { replacements: [loan_id, startDate, endDate] });

        // Get expected payment schedule within the analysis period
        let expectedSchedule = [];
        if (include_expected_schedule === 'true') {
            expectedSchedule = generateExpectedPaymentSchedule(loan, startDate, endDate);
        }

        // Analyze payment gaps within the period
        const [paymentGaps] = await sequelize.query(`
            SELECT 
                gap_start,
                gap_end,
                gap_days,
                expected_payments_missed,
                amount_expected
            FROM (
                SELECT 
                    COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?) as gap_start,
                    payment_date as gap_end,
                    DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) as gap_days,
                    CASE 
                        WHEN ? = 'monthly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 30)
                        WHEN ? = 'weekly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 7)
                        WHEN ? = 'bi_weekly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 14)
                        ELSE 0
                    END as expected_payments_missed,
                    ? * CASE 
                        WHEN ? = 'monthly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 30)
                        WHEN ? = 'weekly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 7)
                        WHEN ? = 'bi_weekly' THEN 
                            FLOOR(DATEDIFF(payment_date, COALESCE(LAG(payment_date) OVER (ORDER BY payment_date), ?)) / 14)
                        ELSE 0
                    END as amount_expected
                FROM loan_payments
                WHERE loan_id = ?
                AND payment_date BETWEEN ? AND ?
            ) gaps
            WHERE gap_days > CASE 
                WHEN ? = 'monthly' THEN 35
                WHEN ? = 'weekly' THEN 10
                WHEN ? = 'bi_weekly' THEN 18
                ELSE 35
            END
            ORDER BY gap_start
        `, { 
            replacements: [
                startDate, startDate, 
                loan.repayment_frequency, startDate,
                loan.repayment_frequency, startDate,
                loan.repayment_frequency, startDate,
                loan.installment_amount,
                loan.repayment_frequency, startDate,
                loan.repayment_frequency, startDate,
                loan.repayment_frequency, startDate,
                loan_id, startDate, endDate,
                loan.repayment_frequency,
                loan.repayment_frequency,
                loan.repayment_frequency
            ]
        });

        // Calculate payment performance metrics
        const totalExpectedPayments = expectedSchedule.length;
        const totalActualPayments = actualPayments.length;
        const totalExpectedAmount = expectedSchedule.reduce((sum, payment) => sum + payment.amount_due, 0);
        const totalActualAmount = actualPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Identify missed payments
        const missedPayments = expectedSchedule.filter(expected => {
            return !actualPayments.some(actual => 
                Math.abs(new Date(actual.payment_date) - new Date(expected.due_date)) <= 7 * 24 * 60 * 60 * 1000 // Within 7 days
            );
        });

        // Calculate payment consistency score
        const paymentConsistencyScore = totalExpectedPayments > 0 ? 
            Math.round((totalActualPayments / totalExpectedPayments) * 100) : 0;

        // Analyze payment patterns
        const paymentPatterns = analyzePaymentPatterns(actualPayments, loan.repayment_frequency);

        res.status(200).json({
            success: true,
            data: {
                loan_info: loan,
                analysis_period: {
                    start_date: startDate,
                    end_date: endDate,
                    total_days: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
                },
                payment_summary: {
                    total_expected_payments: totalExpectedPayments,
                    total_actual_payments: totalActualPayments,
                    total_expected_amount: Math.round(totalExpectedAmount * 100) / 100,
                    total_actual_amount: Math.round(totalActualAmount * 100) / 100,
                    payment_consistency_score: paymentConsistencyScore,
                    missed_payments_count: missedPayments.length,
                    payment_gaps_count: paymentGaps.length
                },
                actual_payments: actualPayments,
                expected_schedule: expectedSchedule,
                missed_payments: missedPayments,
                payment_gaps: paymentGaps,
                payment_patterns: paymentPatterns,
                recommendations: generatePaymentRecommendations(
                    paymentConsistencyScore, 
                    missedPayments.length, 
                    paymentGaps.length,
                    loan
                )
            }
        });

    } catch (error) {
        console.error('Get loan payment timeline analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing loan payment timeline',
            error: error.message
        });
    }
};

// Enhanced analytics with date range support
const getNoRepaymentAnalytics = async (req, res) => {
    try {
        const {
            // Date range parameters
            analysis_start_date,
            analysis_end_date,
            disbursement_start,
            disbursement_end,
            
            // Criteria parameters
            criteria = 'no_payments_ever',
            expected_payment_days = 30,
            payment_gap_threshold = 60,
            
            // Comparison parameters
            compare_with_previous_period = 'false',
            
            // Filters
            branch,
            loan_officer_id,
            loan_type_id
        } = req.query;

        // Set default date ranges
        const defaultEndDate = new Date().toISOString().split('T')[0];
        const defaultStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const analysisStart = analysis_start_date || defaultStartDate;
        const analysisEnd = analysis_end_date || defaultEndDate;

        // Build base query conditions
        let whereClause = `WHERE l.status IN ('disbursed', 'active') AND l.disbursement_date IS NOT NULL`;
        let replacements = [];

        if (disbursement_start) {
            whereClause += ' AND l.disbursement_date >= ?';
            replacements.push(disbursement_start);
        }

        if (disbursement_end) {
            whereClause += ' AND l.disbursement_date <= ?';
            replacements.push(disbursement_end);
        }

        if (branch) {
            whereClause += ' AND l.branch = ?';
            replacements.push(branch);
        }

        if (loan_officer_id) {
            whereClause += ' AND l.loan_officer_id = ?';
            replacements.push(loan_officer_id);
        }

        if (loan_type_id) {
            whereClause += ' AND l.loan_type_id = ?';
            replacements.push(loan_type_id);
        }

        // Build no repayment condition based on criteria
        let noRepaymentCondition = buildNoRepaymentCondition(
            criteria, 
            analysisStart, 
            analysisEnd, 
            expected_payment_days, 
            payment_gap_threshold
        );

        whereClause += noRepaymentCondition.condition;
        replacements.push(...noRepaymentCondition.replacements);

        // Get comprehensive analytics
        const [analytics] = await sequelize.query(`
            SELECT 
                -- Basic counts and amounts
                COUNT(*) as total_loans_no_repayment,
                SUM(l.disbursed_amount) as total_amount_at_risk,
                AVG(l.disbursed_amount) as avg_loan_amount,
                MIN(l.disbursed_amount) as min_loan_amount,
                MAX(l.disbursed_amount) as max_loan_amount,
                
                -- Time-based analysis
                AVG(DATEDIFF(CURDATE(), l.disbursement_date)) as avg_days_since_disbursement,
                MIN(DATEDIFF(CURDATE(), l.disbursement_date)) as min_days_since_disbursement,
                MAX(DATEDIFF(CURDATE(), l.disbursement_date)) as max_days_since_disbursement,
                
                -- Risk distribution
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 30 THEN 1 ELSE 0 END) as low_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 31 AND 90 THEN 1 ELSE 0 END) as medium_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 91 AND 180 THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) > 180 THEN 1 ELSE 0 END) as critical_risk_count,
                
                -- Amount distribution by risk
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) <= 30 THEN l.disbursed_amount ELSE 0 END) as low_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 31 AND 90 THEN l.disbursed_amount ELSE 0 END) as medium_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) BETWEEN 91 AND 180 THEN l.disbursed_amount ELSE 0 END) as high_risk_amount,
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) > 180 THEN l.disbursed_amount ELSE 0 END) as critical_risk_amount,
                
                -- Payment gap analysis
                AVG(CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END) as avg_days_since_last_payment,
                
                MAX(CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END) as max_days_since_last_payment,
                
                -- Financial impact
                SUM(ROUND(
                    (l.disbursed_amount * l.nominal_interest_rate / 100 / 12) * 
                    DATEDIFF(CURDATE(), l.disbursement_date) / 30, 2
                )) as total_estimated_interest_loss,
                
                -- Portfolio impact
                COUNT(DISTINCT l.client_id) as affected_clients,
                COUNT(DISTINCT l.loan_officer_id) as affected_officers,
                COUNT(DISTINCT l.branch) as affected_branches,
                
                -- Loan type breakdown
                COUNT(CASE WHEN lt.category = 'personal' THEN 1 END) as personal_loans_count,
                COUNT(CASE WHEN lt.category = 'business' THEN 1 END) as business_loans_count,
                COUNT(CASE WHEN lt.category = 'emergency' THEN 1 END) as emergency_loans_count,
                
                SUM(CASE WHEN lt.category = 'personal' THEN l.disbursed_amount ELSE 0 END) as personal_loans_amount,
                SUM(CASE WHEN lt.category = 'business' THEN l.disbursed_amount ELSE 0 END) as business_loans_amount,
                SUM(CASE WHEN lt.category = 'emergency' THEN l.disbursed_amount ELSE 0 END) as emergency_loans_amount,
                
                -- Recovery actions analysis
                AVG((SELECT COUNT(*) FROM loan_recovery_actions lra WHERE lra.loan_id = l.id)) as avg_recovery_actions_per_loan,
                SUM((SELECT COUNT(*) FROM loan_recovery_actions lra WHERE lra.loan_id = l.id AND lra.status = 'completed')) as total_completed_actions,
                SUM((SELECT COUNT(*) FROM loan_recovery_actions lra WHERE lra.loan_id = l.id AND lra.status = 'planned')) as total_planned_actions,
                
                -- Date range specific metrics
                ${criteria === 'no_payments_in_period' ? `
                AVG((SELECT COUNT(*) FROM loan_payments lp 
                     WHERE lp.loan_id = l.id 
                     AND lp.payment_date BETWEEN '${analysisStart}' AND '${analysisEnd}')) as avg_payments_in_analysis_period,
                SUM((SELECT COALESCE(SUM(amount), 0) FROM loan_payments lp 
                     WHERE lp.loan_id = l.id 
                     AND lp.payment_date BETWEEN '${analysisStart}' AND '${analysisEnd}')) as total_paid_in_analysis_period,
                ` : ''}
                
                -- Expected vs actual payment analysis
                AVG(CASE 
                    WHEN l.repayment_frequency = 'monthly' THEN 
                        FLOOR(DATEDIFF('${analysisEnd}', GREATEST(l.disbursement_date, '${analysisStart}')) / 30)
                    WHEN l.repayment_frequency = 'weekly' THEN 
                        FLOOR(DATEDIFF('${analysisEnd}', GREATEST(l.disbursement_date, '${analysisStart}')) / 7)
                    WHEN l.repayment_frequency = 'bi_weekly' THEN 
                        FLOOR(DATEDIFF('${analysisEnd}', GREATEST(l.disbursement_date, '${analysisStart}')) / 14)
                    ELSE 0
                END) as avg_expected_payments_in_period
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            JOIN loan_types lt ON l.loan_type_id = lt.id
            ${whereClause}
        `, { replacements });

        // Get time series data for trend analysis
        const [timeSeriesData] = await sequelize.query(`
            SELECT 
                DATE_FORMAT(analysis_date, '%Y-%m-%d') as date,
                COUNT(*) as loans_count,
                SUM(amount_at_risk) as total_amount,
                AVG(days_without_payment) as avg_days_without_payment
            FROM (
                SELECT 
                    DATE(GREATEST(l.disbursement_date, ?)) as analysis_date,
                    l.disbursed_amount as amount_at_risk,
                    DATEDIFF(?, l.disbursement_date) as days_without_payment
                FROM loans l
                JOIN clients c ON l.client_id = c.id
                ${whereClause}
            ) daily_data
            GROUP BY analysis_date
            ORDER BY analysis_date
        `, { replacements: [analysisStart, analysisEnd, ...replacements] });

        // Get branch-wise breakdown
        const [branchBreakdown] = await sequelize.query(`
            SELECT 
                l.branch,
                COUNT(*) as loans_count,
                SUM(l.disbursed_amount) as total_amount,
                AVG(DATEDIFF(CURDATE(), l.disbursement_date)) as avg_days_since_disbursement,
                COUNT(DISTINCT l.loan_officer_id) as officers_count,
                COUNT(DISTINCT l.client_id) as clients_count,
                
                -- Payment gap analysis by branch
                AVG(CASE 
                    WHEN (SELECT COUNT(*) FROM loan_payments lp WHERE lp.loan_id = l.id) = 0 THEN 
                        DATEDIFF(CURDATE(), l.disbursement_date)
                    ELSE 
                        DATEDIFF(CURDATE(), (SELECT MAX(payment_date) FROM loan_payments lp WHERE lp.loan_id = l.id))
                END) as avg_days_since_last_payment
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
            GROUP BY l.branch
            ORDER BY total_amount DESC
        `, { replacements });

        // Get officer-wise breakdown
        const [officerBreakdown] = await sequelize.query(`
            SELECT 
                l.loan_officer_id,
                CONCAT(u.first_name, ' ', u.last_name) as officer_name,
                u.employee_id,
                l.branch,
                COUNT(*) as loans_count,
                SUM(l.disbursed_amount) as total_amount,
                AVG(l.disbursed_amount) as avg_loan_amount,
                AVG(DATEDIFF(CURDATE(), l.disbursement_date)) as avg_days_since_disbursement,
                COUNT(DISTINCT l.client_id) as clients_count,
                
                -- Performance indicators
                SUM(CASE WHEN DATEDIFF(CURDATE(), l.disbursement_date) > 90 THEN 1 ELSE 0 END) as high_risk_loans,
                AVG((SELECT COUNT(*) FROM loan_recovery_actions lra WHERE lra.loan_id = l.id)) as avg_recovery_actions
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            ${whereClause}
            GROUP BY l.loan_officer_id, u.first_name, u.last_name, u.employee_id, l.branch
            ORDER BY total_amount DESC
            LIMIT 20
        `, { replacements });

        // Comparison with previous period if requested
        let comparisonData = null;
        if (compare_with_previous_period === 'true') {
            const periodDays = Math.ceil((new Date(analysisEnd) - new Date(analysisStart)) / (1000 * 60 * 60 * 24));
            const previousStart = new Date(new Date(analysisStart) - periodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const previousEnd = new Date(new Date(analysisStart) - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Build previous period condition
            const previousCondition = buildNoRepaymentCondition(
                criteria, 
                previousStart, 
                previousEnd, 
                expected_payment_days, 
                payment_gap_threshold
            );

            let previousWhereClause = whereClause.replace(
                noRepaymentCondition.condition, 
                previousCondition.condition
            );

            const [previousAnalytics] = await sequelize.query(`
                SELECT 
                    COUNT(*) as total_loans_no_repayment,
                    SUM(l.disbursed_amount) as total_amount_at_risk,
                    AVG(l.disbursed_amount) as avg_loan_amount
                FROM loans l
                JOIN clients c ON l.client_id = c.id
                JOIN loan_types lt ON l.loan_type_id = lt.id
                ${previousWhereClause}
            `, { 
                replacements: [
                    ...replacements.slice(0, -noRepaymentCondition.replacements.length),
                    ...previousCondition.replacements
                ]
            });

            const current = analytics[0];
            const previous = previousAnalytics[0];

            comparisonData = {
                previous_period: {
                    start_date: previousStart,
                    end_date: previousEnd,
                    ...previous
                },
                changes: {
                    loans_change: current.total_loans_no_repayment - previous.total_loans_no_repayment,
                    loans_change_percentage: previous.total_loans_no_repayment > 0 ? 
                        ((current.total_loans_no_repayment - previous.total_loans_no_repayment) / previous.total_loans_no_repayment * 100).toFixed(2) : 0,
                    amount_change: current.total_amount_at_risk - previous.total_amount_at_risk,
                    amount_change_percentage: previous.total_amount_at_risk > 0 ? 
                        ((current.total_amount_at_risk - previous.total_amount_at_risk) / previous.total_amount_at_risk * 100).toFixed(2) : 0
                }
            };
        }

        res.status(200).json({
            success: true,
            data: {
                analysis_info: {
                    criteria,
                    analysis_start_date: analysisStart,
                    analysis_end_date: analysisEnd,
                    disbursement_start,
                    disbursement_end,
                    expected_payment_days,
                    payment_gap_threshold,
                    generated_at: new Date().toISOString(),
                    criteria_description: getCriteriaDescription(criteria, analysisStart, analysisEnd, expected_payment_days)
                },
                current_analytics: analytics[0],
                comparison: comparisonData,
                time_series: timeSeriesData,
                branch_breakdown: branchBreakdown,
                officer_breakdown: officerBreakdown,
                recommendations: generateAnalyticsRecommendations(analytics[0], criteria)
            }
        });

    } catch (error) {
        console.error('Get no repayment analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching no repayment analytics',
            error: error.message
        });
    }
};

// Helper function to build no repayment condition based on criteria

const buildNoRepaymentCondition = (criteria, startDate, endDate, expectedDays, gapThreshold) => {
    let condition = '';
    let replacements = [];

    switch (criteria) {
        case 'no_payments_ever':
            condition = `
                AND l.id NOT IN (
                    SELECT DISTINCT loan_id 
                    FROM loan_payments 
                    WHERE loan_id = l.id
                )
            `;
            break;

        case 'no_payments_in_period':
            condition = `
                AND l.id NOT IN (
                    SELECT DISTINCT loan_id 
                    FROM loan_payments 
                    WHERE loan_id = l.id 
                    AND payment_date BETWEEN ? AND ?
                )
            `;
            replacements.push(startDate, endDate);
            break;

        case 'missed_expected_payments':
            condition = `
                AND DATEDIFF(CURDATE(), l.disbursement_date) >= ?
                AND l.id NOT IN (
                    SELECT DISTINCT loan_id 
                    FROM loan_payments 
                    WHERE loan_id = l.id
                    AND payment_date <= DATE_ADD(l.disbursement_date, INTERVAL ? DAY)
                )
            `;
            replacements.push(expectedDays, expectedDays);
            break;

        case 'no_payments_since_date':
            condition = `
                AND l.id NOT IN (
                    SELECT DISTINCT loan_id 
                    FROM loan_payments 
                    WHERE loan_id = l.id 
                    AND payment_date >= ?
                )
                AND l.disbursement_date < ?
            `;
            replacements.push(startDate, startDate);
            break;

        case 'payment_gap_exceeded':
            condition = `
                AND (
                    (l.id NOT IN (SELECT DISTINCT loan_id FROM loan_payments WHERE loan_id = l.id)
                     AND DATEDIFF(CURDATE(), l.disbursement_date) > ?)
                    OR
                    (l.id IN (SELECT DISTINCT loan_id FROM loan_payments WHERE loan_id = l.id)
                     AND DATEDIFF(CURDATE(), (
                         SELECT MAX(payment_date) 
                         FROM loan_payments 
                         WHERE loan_id = l.id
                     )) > ?)
                )
            `;
            replacements.push(gapThreshold, gapThreshold);
            break;

        case 'overdue_installments':
            condition = `
                AND l.first_payment_date < CURDATE()
                AND (
                    SELECT COUNT(*) 
                    FROM loan_payments lp 
                    WHERE lp.loan_id = l.id 
                    AND lp.payment_date <= CURDATE()
                ) < (
                    CASE 
                        WHEN l.repayment_frequency = 'monthly' THEN 
                            FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 30)
                        WHEN l.repayment_frequency = 'weekly' THEN 
                            FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 7)
                        WHEN l.repayment_frequency = 'bi_weekly' THEN 
                            FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 14)
                        WHEN l.repayment_frequency = 'quarterly' THEN 
                            FLOOR(DATEDIFF(CURDATE(), l.disbursement_date) / 90)
                        ELSE 1
                    END
                )
            `;
            break;

        default:
            condition = `
                AND l.id NOT IN (
                    SELECT DISTINCT loan_id 
                    FROM loan_payments 
                    WHERE loan_id = l.id
                )
            `;
    }

    return { condition, replacements };
};

// Helper function to generate expected payment schedule
const generateExpectedPaymentSchedule = (loan, startDate, endDate) => {
    const schedule = [];
    const disbursementDate = new Date(loan.disbursement_date);
    const analysisStart = new Date(startDate);
    const analysisEnd = new Date(endDate);
    
    // Determine payment frequency in days
    let frequencyDays;
    switch (loan.repayment_frequency) {
        case 'daily': frequencyDays = 1; break;
        case 'weekly': frequencyDays = 7; break;
        case 'bi_weekly': frequencyDays = 14; break;
        case 'monthly': frequencyDays = 30; break;
        case 'quarterly': frequencyDays = 90; break;
        default: frequencyDays = 30;
    }

    // Start from first payment date or disbursement date
    let currentDate = loan.first_payment_date ? 
        new Date(loan.first_payment_date) : 
        new Date(disbursementDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);

    let installmentNumber = 1;

    while (currentDate <= analysisEnd && installmentNumber <= loan.total_installments) {
        if (currentDate >= analysisStart) {
            schedule.push({
                installment_number: installmentNumber,
                due_date: currentDate.toISOString().split('T')[0],
                amount_due: loan.installment_amount,
                principal_due: calculatePrincipalPortion(loan, installmentNumber),
                interest_due: calculateInterestPortion(loan, installmentNumber),
                status: currentDate <= new Date() ? 'due' : 'upcoming'
            });
        }

        currentDate = new Date(currentDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
        installmentNumber++;
    }

    return schedule;
};

// Helper function to calculate principal portion of installment
const calculatePrincipalPortion = (loan, installmentNumber) => {
    if (loan.interest_calculation_method === 'flat') {
        return loan.disbursed_amount / loan.total_installments;
    } else {
        // Reducing balance calculation
        const monthlyRate = loan.nominal_interest_rate / 100 / 12;
        const remainingBalance = loan.disbursed_amount * Math.pow(1 + monthlyRate, installmentNumber - 1) - 
            loan.installment_amount * ((Math.pow(1 + monthlyRate, installmentNumber - 1) - 1) / monthlyRate);
        const interestPortion = remainingBalance * monthlyRate;
        return loan.installment_amount - interestPortion;
    }
};

// Helper function to calculate interest portion of installment
const calculateInterestPortion = (loan, installmentNumber) => {
    if (loan.interest_calculation_method === 'flat') {
        return (loan.disbursed_amount * loan.nominal_interest_rate / 100 * loan.loan_term_months / 12) / loan.total_installments;
    } else {
        // Reducing balance calculation
        const monthlyRate = loan.nominal_interest_rate / 100 / 12;
        const remainingBalance = loan.disbursed_amount * Math.pow(1 + monthlyRate, installmentNumber - 1) - 
            loan.installment_amount * ((Math.pow(1 + monthlyRate, installmentNumber - 1) - 1) / monthlyRate);
        return remainingBalance * monthlyRate;
    }
};

// Helper function to analyze payment patterns
const analyzePaymentPatterns = (payments, expectedFrequency) => {
    if (payments.length < 2) {
        return {
            pattern_type: 'insufficient_data',
            regularity_score: 0,
            average_gap_days: 0,
            pattern_description: 'Not enough payments to analyze pattern'
        };
    }

    // Calculate gaps between payments
    const gaps = [];
    for (let i = 1; i < payments.length; i++) {
        const gap = Math.ceil((new Date(payments[i].payment_date) - new Date(payments[i-1].payment_date)) / (1000 * 60 * 60 * 24));
        gaps.push(gap);
    }

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    
    // Expected gap based on frequency
    let expectedGap;
    switch (expectedFrequency) {
        case 'daily': expectedGap = 1; break;
        case 'weekly': expectedGap = 7; break;
        case 'bi_weekly': expectedGap = 14; break;
        case 'monthly': expectedGap = 30; break;
        case 'quarterly': expectedGap = 90; break;
        default: expectedGap = 30;
    }

    // Calculate regularity score (0-100)
    const gapVariance = gaps.reduce((sum, gap) => sum + Math.pow(gap - averageGap, 2), 0) / gaps.length;
    const regularityScore = Math.max(0, 100 - (gapVariance / expectedGap * 10));

    // Determine pattern type
    let patternType;
    if (regularityScore > 80) {
        patternType = 'regular';
    } else if (regularityScore > 60) {
        patternType = 'somewhat_regular';
    } else if (regularityScore > 40) {
        patternType = 'irregular';
    } else {
        patternType = 'very_irregular';
    }

    return {
        pattern_type: patternType,
        regularity_score: Math.round(regularityScore),
        average_gap_days: Math.round(averageGap),
        expected_gap_days: expectedGap,
        gap_variance: Math.round(gapVariance),
        total_payments: payments.length,
        pattern_description: getPatternDescription(patternType, averageGap, expectedGap)
    };
};

// Helper function to get pattern description
const getPatternDescription = (patternType, averageGap, expectedGap) => {
    const gapDifference = averageGap - expectedGap;
    
    switch (patternType) {
        case 'regular':
            return `Payments are made regularly with consistent intervals`;
        case 'somewhat_regular':
            return `Payments are generally consistent with minor variations`;
        case 'irregular':
            return `Payment intervals vary significantly from expected schedule`;
        case 'very_irregular':
            return `Highly unpredictable payment pattern with large gaps`;
        default:
            return 'Payment pattern analysis unavailable';
    }
};

// Helper function to get criteria description
const getCriteriaDescription = (criteria, startDate, endDate, expectedDays) => {
    switch (criteria) {
        case 'no_payments_ever':
            return 'Loans that have never received any payment since disbursement';
        case 'no_payments_in_period':
            return `Loans with no payments between ${startDate} and ${endDate}`;
        case 'missed_expected_payments':
            return `Loans that should have received first payment within ${expectedDays} days but haven't`;
        case 'no_payments_since_date':
            return `Loans with no payments since ${startDate}`;
        case 'payment_gap_exceeded':
            return `Loans with payment gaps exceeding ${expectedDays} days`;
        case 'overdue_installments':
            return 'Loans with missed installments based on repayment schedule';
        default:
            return 'Loans with no repayment activity';
    }
};

// Helper function to generate payment recommendations
const generatePaymentRecommendations = (consistencyScore, missedCount, gapsCount, loan) => {
    const recommendations = [];

    if (consistencyScore < 50) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Payment Behavior',
            action: 'Immediate intervention required - establish payment plan',
            description: 'Very poor payment consistency indicates high risk'
        });
    } else if (consistencyScore < 70) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Payment Monitoring',
            action: 'Increase monitoring frequency and provide payment reminders',
            description: 'Inconsistent payment pattern needs attention'
        });
    }

    if (missedCount > 3) {
        recommendations.push({
            priority: 'URGENT',
            category: 'Recovery Action',
            action: 'Initiate formal recovery process',
            description: `${missedCount} missed payments indicate serious delinquency`
        });
    } else if (missedCount > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Follow-up',
            action: 'Contact borrower to understand payment delays',
            description: `${missedCount} missed payments need follow-up`
        });
    }

    if (gapsCount > 2) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Payment Schedule',
            action: 'Review and possibly restructure payment schedule',
            description: 'Multiple payment gaps suggest schedule mismatch'
        });
    }

    const daysSinceDisbursement = Math.ceil((new Date() - new Date(loan.disbursement_date)) / (1000 * 60 * 60 * 24));
    if (daysSinceDisbursement > 180) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'Legal Action',
            action: 'Consider legal proceedings or write-off',
            description: 'Loan is significantly overdue'
        });
    }

    return recommendations;
};

// Helper function to generate analytics recommendations
const generateAnalyticsRecommendations = (analytics, criteria) => {
    const recommendations = [];

    const riskRatio = analytics.total_amount_at_risk / (analytics.total_amount_at_risk + 1000000); // Assuming portfolio size

    if (analytics.critical_risk_count > 0) {
        recommendations.push({
            priority: 'URGENT',
            category: 'Portfolio Risk',
            action: 'Immediate review of critical risk loans',
            description: `${analytics.critical_risk_count} loans require urgent attention`
        });
    }

    if (analytics.avg_days_since_last_payment > 90) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Recovery Strategy',
            action: 'Implement aggressive recovery strategy',
            description: 'Average payment gap is too high'
        });
    }

    if (analytics.affected_officers > 10) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Training',
            action: 'Provide additional training to loan officers',
            description: 'Multiple officers affected suggests systemic issues'
        });
    }

    if (analytics.total_estimated_interest_loss > 100000) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Financial Impact',
            action: 'Review lending policies and risk assessment',
            description: 'Significant interest loss detected'
        });
    }

    return recommendations;
};

// Bulk recovery action creation for multiple loans
const createBulkRecoveryActions = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            loan_ids,
            action_type,
            description,
            assigned_to,
            priority = 'medium',
            target_date,
            notes
        } = req.body;

        if (!Array.isArray(loan_ids) || loan_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'loan_ids must be a non-empty array'
            });
        }

        // Validate all loans exist and have no repayments
        const [validLoans] = await sequelize.query(`
            SELECT l.id, l.loan_number, l.client_id, l.disbursed_amount,
                   c.first_name, c.last_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.id IN (${loan_ids.map(() => '?').join(',')})
            AND l.status IN ('disbursed', 'active')
        `, { replacements: loan_ids });

        if (validLoans.length !== loan_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'Some loan IDs are invalid or loans are not in disbursed/active status'
            });
        }

        // Create recovery actions for all loans
        const recoveryActions = [];
        const actionDate = new Date();

        for (const loan of validLoans) {
            const [result] = await sequelize.query(`
                INSERT INTO loan_recovery_actions (
                    loan_id, action_type, description, assigned_to, priority,
                    target_date, notes, status, created_by, action_date,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?, NOW(), NOW())
            `, {
                replacements: [
                    loan.id,
                    action_type,
                    `${description} - Loan: ${loan.loan_number} (${loan.first_name} ${loan.last_name})`,
                    assigned_to,
                    priority,
                    target_date || null,
                    notes || null,
                    req.user.userId,
                    actionDate
                ]
            });

            recoveryActions.push({
                loan_id: loan.id,
                loan_number: loan.loan_number,
                client_name: `${loan.first_name} ${loan.last_name}`,
                action_id: result.insertId,
                action_type,
                priority
            });
        }

        // Log bulk action creation
        console.log(`📋 Bulk recovery actions created - Count: ${recoveryActions.length}, Type: ${action_type}, Created by: ${req.user.userId}`);

        res.status(201).json({
            success: true,
            message: `${recoveryActions.length} recovery actions created successfully`,
            data: {
                actions_created: recoveryActions,
                summary: {
                    total_actions: recoveryActions.length,
                    action_type,
                    priority,
                    assigned_to,
                    target_date
                }
            }
        });

    } catch (error) {
        console.error('Create bulk recovery actions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating bulk recovery actions',
            error: error.message
        });
    }
};

// Export all functions
module.exports = {
    getLoansWithNoRepayment,
    getLoanNoRepaymentDetails,
    getLoanPaymentTimelineAnalysis,
    getNoRepaymentAnalytics,
    createImmediateRecoveryAction,
    createBulkRecoveryActions,
    flagAsPotentialFraud,
    generateNoRepaymentReport
};
