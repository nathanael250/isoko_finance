const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

// Get loans in arrears with comprehensive filtering
const getLoansInArrears = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            min_days_arrears = 1,
            max_days_arrears,
            min_arrears_amount,
            max_arrears_amount,
            performance_class,
            branch,
            loan_officer_id,
            arrears_category,
            sort_by = 'days_in_arrears',
            sort_order = 'DESC',
            search
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = 'WHERE l.status IN (?, ?) AND l.days_in_arrears >= ?';
        let replacements = ['active', 'disbursed', min_days_arrears];
        const conditions = [];

        // Build dynamic filters
        if (max_days_arrears) {
            conditions.push('l.days_in_arrears <= ?');
            replacements.push(max_days_arrears);
        }

        if (min_arrears_amount) {
            conditions.push('(l.arrears_principal + l.arrears_interest) >= ?');
            replacements.push(min_arrears_amount);
        }

        if (max_arrears_amount) {
            conditions.push('(l.arrears_principal + l.arrears_interest) <= ?');
            replacements.push(max_arrears_amount);
        }

        if (performance_class) {
            conditions.push('l.performance_class = ?');
            replacements.push(performance_class);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (arrears_category) {
            switch (arrears_category) {
                case 'early_arrears':
                    conditions.push('l.days_in_arrears BETWEEN 1 AND 30');
                    break;
                case 'moderate_arrears':
                    conditions.push('l.days_in_arrears BETWEEN 31 AND 90');
                    break;
                case 'serious_arrears':
                    conditions.push('l.days_in_arrears BETWEEN 91 AND 180');
                    break;
                case 'critical_arrears':
                    conditions.push('l.days_in_arrears > 180');
                    break;
            }
        }

        if (search) {
            conditions.push('(l.loan_number LIKE ? OR l.loan_account LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.client_number LIKE ?)');
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            whereClause += ' AND ' + conditions.join(' AND ');
        }

        // Validate sort field
        const allowedSortFields = [
            'days_in_arrears', 'arrears_amount', 'loan_balance', 'disbursed_amount',
            'loan_number', 'client_name', 'performance_class', 'arrears_start_date'
        ];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'days_in_arrears';
        const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total 
            FROM loans l 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `, { replacements });

        const total = countResult[0].total;

        // Get loans in arrears with comprehensive details
        const [loansInArrears] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                l.client_id,
                l.loan_type_id,
                l.disbursed_amount,
                l.loan_balance,
                l.principal_balance,
                l.interest_balance,
                l.arrears_principal,
                l.arrears_interest,
                (l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                l.days_in_arrears,
                l.arrears_start_date,
                l.performance_class,
                l.status,
                l.branch,
                l.disbursement_date,
                l.maturity_date,
                l.nominal_interest_rate,
                l.repayment_frequency,
                
                -- Client details
                c.client_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.first_name,
                c.last_name,
                c.mobile as client_mobile,
                c.email as client_email,
                c.address as client_address,
                c.city as client_city,
                c.working_status,
                c.monthly_income,
                
                -- Loan type details
                lt.name as loan_type_name,
                lt.category as loan_category,
                
                -- Staff details
                CONCAT(u1.first_name, ' ', u1.last_name) as loan_officer_name,
                u1.email as loan_officer_email,
                u1.phone_number as loan_officer_phone,
                
                -- Calculate arrears category
                CASE 
                    WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 'early_arrears'
                    WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 'moderate_arrears'
                    WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 'serious_arrears'
                    WHEN l.days_in_arrears > 180 THEN 'critical_arrears'
                    ELSE 'unknown'
                END as arrears_category,
                
                -- Calculate risk score (0-100)
                LEAST(100, GREATEST(0, 
                    (l.days_in_arrears * 0.3) + 
                    (((l.arrears_principal + l.arrears_interest) / l.disbursed_amount) * 50) +
                    (CASE l.performance_class 
                        WHEN 'loss' THEN 30
                        WHEN 'doubtful' THEN 20
                        WHEN 'substandard' THEN 10
                        WHEN 'watch' THEN 5
                        ELSE 0
                    END)
                )) as risk_score,
                
                -- Calculate penalty (5% per month on arrears amount)
                ROUND(
                    (l.arrears_principal + l.arrears_interest) * 0.05 * 
                    (l.days_in_arrears / 30), 2
                ) as calculated_penalty,
                
                -- Recovery priority
                CASE 
                    WHEN l.days_in_arrears > 180 OR (l.arrears_principal + l.arrears_interest) > 1000000 THEN 'urgent'
                    WHEN l.days_in_arrears > 90 OR (l.arrears_principal + l.arrears_interest) > 500000 THEN 'high'
                    WHEN l.days_in_arrears > 30 OR (l.arrears_principal + l.arrears_interest) > 100000 THEN 'medium'
                    ELSE 'low'
                END as recovery_priority,
                
                -- Last payment information
                (SELECT MAX(payment_date) 
                 FROM loan_payments lp 
                 WHERE lp.loan_id = l.id) as last_payment_date,
                 
                (SELECT SUM(amount) 
                 FROM loan_payments lp 
                 WHERE lp.loan_id = l.id 
                 AND lp.payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as payments_last_30_days,
                
                -- Outstanding installments
                (SELECT COUNT(*) 
                 FROM loan_schedules ls 
                 WHERE ls.loan_id = l.id 
                 AND ls.due_date <= CURDATE() 
                 AND ls.status IN ('pending', 'partial', 'overdue')) as overdue_installments,
                
                -- Next due installment
                (SELECT MIN(ls.due_date) 
                 FROM loan_schedules ls 
                 WHERE ls.loan_id = l.id 
                 AND ls.status = 'pending') as next_due_date,
                 
                (SELECT ls.total_due 
                 FROM loan_schedules ls 
                 WHERE ls.loan_id = l.id 
                 AND ls.due_date = (
                     SELECT MIN(ls2.due_date) 
                     FROM loan_schedules ls2 
                     WHERE ls2.loan_id = l.id 
                     AND ls2.status = 'pending'
                 )) as next_due_amount
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            ${whereClause}
            ORDER BY 
                ${sortField === 'client_name' ? 'CONCAT(c.first_name, " ", c.last_name)' : 
                  sortField === 'arrears_amount' ? '(l.arrears_principal + l.arrears_interest)' : 
                  'l.' + sortField} ${sortDirection}
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, parseInt(limit), parseInt(offset)]
        });

        // Get summary statistics
        const [summaryResult] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans_in_arrears,
                COUNT(DISTINCT l.client_id) as affected_clients,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                SUM(l.loan_balance) as total_outstanding_balance,
                AVG(l.days_in_arrears) as avg_days_in_arrears,
                
                -- Arrears category breakdown
                SUM(CASE WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 1 ELSE 0 END) as early_arrears_count,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 1 ELSE 0 END) as moderate_arrears_count,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 1 ELSE 0 END) as serious_arrears_count,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN 1 ELSE 0 END) as critical_arrears_count,
                
                -- Amount breakdown by category
                SUM(CASE WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as early_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as moderate_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as serious_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as critical_arrears_amount,
                
                -- Performance class breakdown
                SUM(CASE WHEN l.performance_class = 'watch' THEN 1 ELSE 0 END) as watch_loans,
                SUM(CASE WHEN l.performance_class = 'substandard' THEN 1 ELSE 0 END) as substandard_loans,
                SUM(CASE WHEN l.performance_class = 'doubtful' THEN 1 ELSE 0 END) as doubtful_loans,
                SUM(CASE WHEN l.performance_class = 'loss' THEN 1 ELSE 0 END) as loss_loans,
                
                -- Recovery priority breakdown
                SUM(CASE 
                    WHEN l.days_in_arrears > 180 OR (l.arrears_principal + l.arrears_interest) > 1000000 THEN 1 
                    ELSE 0 
                END) as urgent_priority_count,
                SUM(CASE 
                    WHEN l.days_in_arrears > 90 OR (l.arrears_principal + l.arrears_interest) > 500000 THEN 1 
                    ELSE 0 
                END) as high_priority_count,
                
                -- Calculate total penalties
                SUM(ROUND(
                    (l.arrears_principal + l.arrears_interest) * 0.05 * 
                    (l.days_in_arrears / 30), 2
                )) as total_calculated_penalties
                
            FROM loans l 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `, { replacements: replacements.slice(0, -2) }); // Remove limit and offset

        res.status(200).json({
            success: true,
            data: {
                loans_in_arrears: loansInArrears,
                summary: summaryResult[0],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters_applied: {
                    min_days_arrears,
                    max_days_arrears,
                    min_arrears_amount,
                    max_arrears_amount,
                    performance_class,
                    branch,
                    loan_officer_id,
                    arrears_category,
                    search
                }
            }
        });

    } catch (error) {
        console.error('Get loans in arrears error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans in arrears',
            error: error.message
        });
    }
};

// Get single loan in arrears with detailed information
const getLoanInArrearsDetails = async (req, res) => {
    try {
        const { loan_id } = req.params;

        // Get comprehensive loan details
        const [loanDetails] = await sequelize.query(`
            SELECT 
                l.*,
                (l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                
                -- Client details
                c.client_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.first_name,
                c.last_name,
                c.mobile as client_mobile,
                c.email as client_email,
                c.address as client_address,
                c.city,
                c.province_state,
                c.working_status,
                c.monthly_income,
                c.employer_name,
                
                -- Loan type details
                lt.name as loan_type_name,
                lt.category as loan_category,
                lt.late_payment_fee_rate,
                
                -- Staff details
                CONCAT(u1.first_name, ' ', u1.last_name) as loan_officer_name,
                u1.email as loan_officer_email,
                u1.phone_number as loan_officer_phone,
                
                -- Calculate metrics
                CASE 
                    WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 'early_arrears'
                    WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 'moderate_arrears'
                    WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 'serious_arrears'
                    WHEN l.days_in_arrears > 180 THEN 'critical_arrears'
                    ELSE 'unknown'
                END as arrears_category,
                
                ROUND(
                    (l.arrears_principal + l.arrears_interest) * 0.05 * 
                    (l.days_in_arrears / 30), 2
                ) as calculated_penalty,
                
                -- Recovery metrics
                ((l.arrears_principal + l.arrears_interest) / l.disbursed_amount) * 100 as arrears_percentage,
                
                CASE 
                    WHEN l.days_in_arrears > 180 OR (l.arrears_principal + l.arrears_interest) > 1000000 THEN 'urgent'
                    WHEN l.days_in_arrears > 90 OR (l.arrears_principal + l.arrears_interest) > 500000 THEN 'high'
                    WHEN l.days_in_arrears > 30 OR (l.arrears_principal + l.arrears_interest) > 100000 THEN 'medium'
                    ELSE 'low'
                END as recovery_priority
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            WHERE l.id = ? AND l.days_in_arrears > 0
        `, { replacements: [loan_id] });

        if (loanDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan in arrears not found'
            });
        }

        // Get overdue installments
        const [overdueInstallments] = await sequelize.query(`
            SELECT 
                ls.*,
                (ls.total_due - ls.total_paid) as outstanding_amount,
                DATEDIFF(CURDATE(), ls.due_date) as days_overdue
            FROM loan_schedules ls
            WHERE ls.loan_id = ?
            AND ls.due_date <= CURDATE()
            AND ls.status IN ('pending', 'partial', 'overdue')
            ORDER BY ls.due_date ASC
        `, { replacements: [loan_id] });

        // Get payment history (last 6 months)
        const [paymentHistory] = await sequelize.query(`
            SELECT 
                lp.*,
                CONCAT(u.first_name, ' ', u.last_name) as processed_by_name
            FROM loan_payments lp
            LEFT JOIN users u ON lp.processed_by = u.id
            WHERE lp.loan_id = ?
            AND lp.payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ORDER BY lp.payment_date DESC
            LIMIT 20
        `, { replacements: [loan_id] });

        // Get follow-up actions
        const [followUpActions] = await sequelize.query(`
            SELECT 
                f.*,
                CONCAT(u1.first_name, ' ', u1.last_name) as assigned_to_name,
                CONCAT(u2.first_name, ' ', u2.last_name) as created_by_name
            FROM missed_repayment_followups f
            LEFT JOIN users u1 ON f.assigned_to = u1.id
            LEFT JOIN users u2 ON f.created_by = u2.id
            WHERE f.loan_id = ?
            ORDER BY f.created_at DESC
            LIMIT 10
        `, { replacements: [loan_id] });

        // Get restructuring history if any
        const [restructuringHistory] = await sequelize.query(`
            SELECT 
                lr.*,
                CONCAT(u.first_name, ' ', u.last_name) as approved_by_name
            FROM loan_restructures lr
            LEFT JOIN users u ON lr.approved_by = u.id
            WHERE lr.loan_id = ?
            ORDER BY lr.created_at DESC
        `, { replacements: [loan_id] });

        res.status(200).json({
            success: true,
            data: {
                loan_details: loanDetails[0],
                overdue_installments: overdueInstallments,
                payment_history: paymentHistory,
                follow_up_actions: followUpActions,
                restructuring_history: restructuringHistory,
                summary: {
                    total_overdue_installments: overdueInstallments.length,
                    total_overdue_amount: overdueInstallments.reduce((sum, inst) => sum + parseFloat(inst.outstanding_amount), 0),
                    recent_payments_count: paymentHistory.length,
                    active_follow_ups: followUpActions.filter(f => f.status === 'pending' || f.status === 'in_progress').length
                }
            }
        });

    } catch (error) {
        console.error('Get loan in arrears details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan in arrears details',
            error: error.message
        });
    }
};

// Get arrears analytics and dashboard data
const getArrearsAnalytics = async (req, res) => {
    try {
        const {
            period = '30',
            compare_period = 'false',
            group_by = 'category'
        } = req.query;

        const daysBack = parseInt(period);
        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(currentPeriodStart.getDate() - daysBack);

        // Current period analytics
        const [currentAnalytics] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans_in_arrears,
                COUNT(DISTINCT l.client_id) as affected_clients,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                SUM(l.loan_balance) as total_portfolio_at_risk,
                AVG(l.days_in_arrears) as avg_days_in_arrears,
                
                -- Portfolio at Risk (PAR) calculations
                (SUM(l.loan_balance) / (
                    SELECT SUM(loan_balance) 
                    FROM loans 
                                        WHERE status IN ('active', 'disbursed')
                )) * 100 as portfolio_at_risk_percentage,
                
                -- Arrears rate
                (COUNT(*) / (
                    SELECT COUNT(*) 
                    FROM loans 
                    WHERE status IN ('active', 'disbursed')
                )) * 100 as arrears_rate_percentage,
                
                -- Recovery metrics
                SUM(CASE WHEN l.days_in_arrears <= 30 THEN 1 ELSE 0 END) as recoverable_loans,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN 1 ELSE 0 END) as critical_loans,
                
                -- Amount distributions
                SUM(CASE WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as early_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as moderate_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as serious_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as critical_arrears_amount,
                
                -- Performance class distribution
                SUM(CASE WHEN l.performance_class = 'watch' THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as watch_amount,
                SUM(CASE WHEN l.performance_class = 'substandard' THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as substandard_amount,
                SUM(CASE WHEN l.performance_class = 'doubtful' THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as doubtful_amount,
                SUM(CASE WHEN l.performance_class = 'loss' THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as loss_amount
                
            FROM loans l
            WHERE l.status IN ('active', 'disbursed')
            AND l.days_in_arrears > 0
            AND l.arrears_start_date >= ?
        `, { replacements: [currentPeriodStart.toISOString().split('T')[0]] });

        let previousAnalytics = null;
        let comparison = null;

        if (compare_period === 'true') {
            const previousPeriodStart = new Date();
            previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysBack * 2));
            const previousPeriodEnd = new Date();
            previousPeriodEnd.setDate(previousPeriodEnd.getDate() - daysBack);

            const [prevAnalytics] = await sequelize.query(`
                SELECT 
                    COUNT(*) as total_loans_in_arrears,
                    SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                    AVG(l.days_in_arrears) as avg_days_in_arrears
                FROM loans l
                WHERE l.status IN ('active', 'disbursed')
                AND l.days_in_arrears > 0
                AND l.arrears_start_date BETWEEN ? AND ?
            `, { 
                replacements: [
                    previousPeriodStart.toISOString().split('T')[0],
                    previousPeriodEnd.toISOString().split('T')[0]
                ] 
            });

            previousAnalytics = prevAnalytics[0];

            // Calculate comparison metrics
            comparison = {
                loans_change: currentAnalytics[0].total_loans_in_arrears - previousAnalytics.total_loans_in_arrears,
                loans_change_percentage: previousAnalytics.total_loans_in_arrears > 0 ? 
                    ((currentAnalytics[0].total_loans_in_arrears - previousAnalytics.total_loans_in_arrears) / previousAnalytics.total_loans_in_arrears) * 100 : 0,
                amount_change: currentAnalytics[0].total_arrears_amount - previousAnalytics.total_arrears_amount,
                amount_change_percentage: previousAnalytics.total_arrears_amount > 0 ? 
                    ((currentAnalytics[0].total_arrears_amount - previousAnalytics.total_arrears_amount) / previousAnalytics.total_arrears_amount) * 100 : 0
            };
        }

        // Branch performance analysis
        const [branchPerformance] = await sequelize.query(`
            SELECT 
                l.branch,
                COUNT(*) as loans_in_arrears,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                AVG(l.days_in_arrears) as avg_days_in_arrears,
                (SUM(l.loan_balance) / (
                    SELECT SUM(loan_balance) 
                    FROM loans l2 
                    WHERE l2.branch = l.branch 
                    AND l2.status IN ('active', 'disbursed')
                )) * 100 as branch_par_percentage,
                COUNT(DISTINCT l.client_id) as affected_clients
            FROM loans l
            WHERE l.status IN ('active', 'disbursed')
            AND l.days_in_arrears > 0
            AND l.branch IS NOT NULL
            GROUP BY l.branch
            ORDER BY total_arrears_amount DESC
        `);

        // Loan officer performance analysis
        const [officerPerformance] = await sequelize.query(`
            SELECT 
                l.loan_officer_id,
                CONCAT(u.first_name, ' ', u.last_name) as officer_name,
                u.branch as officer_branch,
                COUNT(*) as loans_in_arrears,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                AVG(l.days_in_arrears) as avg_days_in_arrears,
                (COUNT(*) / (
                    SELECT COUNT(*) 
                    FROM loans l2 
                    WHERE l2.loan_officer_id = l.loan_officer_id 
                    AND l2.status IN ('active', 'disbursed')
                )) * 100 as officer_arrears_rate,
                COUNT(DISTINCT l.client_id) as affected_clients
            FROM loans l
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE l.status IN ('active', 'disbursed')
            AND l.days_in_arrears > 0
            AND l.loan_officer_id IS NOT NULL
            GROUP BY l.loan_officer_id, u.first_name, u.last_name, u.branch
            ORDER BY total_arrears_amount DESC
            LIMIT 20
        `);

        // Arrears aging analysis
        const [agingAnalysis] = await sequelize.query(`
            SELECT 
                CASE 
                    WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN '1-30 days'
                    WHEN l.days_in_arrears BETWEEN 31 AND 60 THEN '31-60 days'
                    WHEN l.days_in_arrears BETWEEN 61 AND 90 THEN '61-90 days'
                    WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN '91-180 days'
                    WHEN l.days_in_arrears BETWEEN 181 AND 365 THEN '181-365 days'
                    WHEN l.days_in_arrears > 365 THEN 'Over 1 year'
                    ELSE 'Unknown'
                END as aging_bucket,
                COUNT(*) as loan_count,
                SUM(l.arrears_principal + l.arrears_interest) as total_amount,
                AVG(l.arrears_principal + l.arrears_interest) as avg_amount,
                SUM(l.loan_balance) as total_balance_at_risk
            FROM loans l
            WHERE l.status IN ('active', 'disbursed')
            AND l.days_in_arrears > 0
            GROUP BY aging_bucket
            ORDER BY MIN(l.days_in_arrears)
        `);

        // Recovery trend analysis (last 6 months)
        const [recoveryTrend] = await sequelize.query(`
            SELECT 
                DATE_FORMAT(lp.payment_date, '%Y-%m') as payment_month,
                COUNT(DISTINCT lp.loan_id) as loans_with_payments,
                SUM(lp.amount) as total_recovered,
                AVG(lp.amount) as avg_payment_amount,
                COUNT(*) as total_payments
            FROM loan_payments lp
            JOIN loans l ON lp.loan_id = l.id
            WHERE lp.payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            AND l.days_in_arrears > 0
            GROUP BY DATE_FORMAT(lp.payment_date, '%Y-%m')
            ORDER BY payment_month DESC
        `);

        // Top clients by arrears amount
        const [topArrearsClients] = await sequelize.query(`
            SELECT 
                c.client_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile,
                COUNT(l.id) as loans_in_arrears,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                MAX(l.days_in_arrears) as max_days_in_arrears,
                SUM(l.loan_balance) as total_balance_at_risk,
                CONCAT(u.first_name, ' ', u.last_name) as primary_loan_officer
            FROM clients c
            JOIN loans l ON c.id = l.client_id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE l.status IN ('active', 'disbursed')
            AND l.days_in_arrears > 0
            GROUP BY c.id, c.client_number, c.first_name, c.last_name, c.mobile, u.first_name, u.last_name
            ORDER BY total_arrears_amount DESC
            LIMIT 15
        `);

        res.status(200).json({
            success: true,
            data: {
                current_period: currentAnalytics[0],
                previous_period: previousAnalytics,
                comparison: comparison,
                branch_performance: branchPerformance,
                officer_performance: officerPerformance,
                aging_analysis: agingAnalysis,
                recovery_trend: recoveryTrend,
                top_arrears_clients: topArrearsClients,
                period_info: {
                    period_days: daysBack,
                    period_start: currentPeriodStart.toISOString().split('T')[0],
                    period_end: new Date().toISOString().split('T')[0],
                    comparison_enabled: compare_period === 'true'
                }
            }
        });

    } catch (error) {
        console.error('Get arrears analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching arrears analytics',
            error: error.message
        });
    }
};

// Create recovery action plan
const createRecoveryAction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { loan_id } = req.params;
        const {
            action_type,
            action_date,
            description,
            assigned_to,
            priority,
            expected_outcome,
            target_amount,
            target_date,
            notes
        } = req.body;

        // Verify loan exists and is in arrears
        const [loan] = await sequelize.query(`
            SELECT id, loan_number, client_id, days_in_arrears, 
                   (arrears_principal + arrears_interest) as total_arrears
            FROM loans 
            WHERE id = ? AND days_in_arrears > 0
        `, { replacements: [loan_id] });

        if (loan.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan in arrears not found'
            });
        }

        // Create recovery action
        const [result] = await sequelize.query(`
            INSERT INTO loan_recovery_actions (
                loan_id, action_type, action_date, description, assigned_to,
                priority, expected_outcome, target_amount, target_date,
                notes, status, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, NOW(), NOW())
        `, {
            replacements: [
                loan_id, action_type, action_date, description, assigned_to,
                priority, expected_outcome, target_amount, target_date,
                notes, req.user.userId
            ]
        });

        // Get the created action with details
        const [createdAction] = await sequelize.query(`
            SELECT 
                ra.*,
                l.loan_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                CONCAT(u1.first_name, ' ', u1.last_name) as assigned_to_name,
                CONCAT(u2.first_name, ' ', u2.last_name) as created_by_name
            FROM loan_recovery_actions ra
            JOIN loans l ON ra.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u1 ON ra.assigned_to = u1.id
            LEFT JOIN users u2 ON ra.created_by = u2.id
            WHERE ra.id = ?
        `, { replacements: [result.insertId] });

        console.log(`📋 Recovery action created - Loan: ${loan[0].loan_number}, Action: ${action_type}`);

        res.status(201).json({
            success: true,
            message: 'Recovery action created successfully',
            data: {
                recovery_action: createdAction[0]
            }
        });

    } catch (error) {
        console.error('Create recovery action error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating recovery action',
            error: error.message
        });
    }
};

// Update recovery action status
const updateRecoveryAction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { action_id } = req.params;
        const {
            status,
            outcome_notes,
            actual_amount_recovered,
            next_action_type,
            next_action_date,
            completion_notes
        } = req.body;

        // Update recovery action
        const updateFields = ['status = ?', 'updated_by = ?', 'updated_at = NOW()'];
        const replacements = [status, req.user.userId];

        if (outcome_notes) {
            updateFields.push('outcome_notes = ?');
            replacements.push(outcome_notes);
        }

        if (actual_amount_recovered) {
            updateFields.push('actual_amount_recovered = ?');
            replacements.push(actual_amount_recovered);
        }

        if (next_action_type) {
            updateFields.push('next_action_type = ?');
            replacements.push(next_action_type);
        }

        if (next_action_date) {
            updateFields.push('next_action_date = ?');
            replacements.push(next_action_date);
        }

        if (completion_notes) {
            updateFields.push('completion_notes = ?');
            replacements.push(completion_notes);
        }

        if (status === 'completed') {
            updateFields.push('completed_at = NOW()');
        }

        replacements.push(action_id);

        await sequelize.query(
            `UPDATE loan_recovery_actions SET ${updateFields.join(', ')} WHERE id = ?`,
            { replacements }
        );

        // Get updated action
        const [updatedAction] = await sequelize.query(`
            SELECT 
                ra.*,
                l.loan_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name
            FROM loan_recovery_actions ra
            JOIN loans l ON ra.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE ra.id = ?
        `, { replacements: [action_id] });

        if (updatedAction.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recovery action not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Recovery action updated successfully',
            data: {
                recovery_action: updatedAction[0]
            }
        });

    } catch (error) {
        console.error('Update recovery action error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating recovery action',
            error: error.message
        });
    }
};

// Generate arrears report
const generateArrearsReport = async (req, res) => {
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
            start_date,
            end_date,
            format = 'json',
            include_details = 'true',
            group_by = 'none',
            performance_class,
            branch,
            min_amount
        } = req.query;

        let whereClause = 'WHERE l.status IN (?, ?) AND l.days_in_arrears > 0';
        let replacements = ['active', 'disbursed'];
        const conditions = [];

        if (start_date && end_date) {
            conditions.push('l.arrears_start_date BETWEEN ? AND ?');
            replacements.push(start_date, end_date);
        }

        if (performance_class) {
            conditions.push('l.performance_class = ?');
            replacements.push(performance_class);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (min_amount) {
            conditions.push('(l.arrears_principal + l.arrears_interest) >= ?');
            replacements.push(min_amount);
        }

        if (conditions.length > 0) {
            whereClause += ' AND ' + conditions.join(' AND ');
        }

        // Get report data
        const [reportData] = await sequelize.query(`
            SELECT 
                l.loan_number,
                l.loan_account,
                c.client_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                l.disbursed_amount,
                l.loan_balance,
                l.arrears_principal,
                l.arrears_interest,
                (l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                l.days_in_arrears,
                l.arrears_start_date,
                l.performance_class,
                l.branch,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer_name,
                
                CASE 
                    WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 'Early Arrears'
                    WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 'Moderate Arrears'
                    WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 'Serious Arrears'
                    WHEN l.days_in_arrears > 180 THEN 'Critical Arrears'
                    ELSE 'Unknown'
                END as arrears_category,
                
                ROUND(
                    (l.arrears_principal + l.arrears_interest) * 0.05 * 
                    (l.days_in_arrears / 30), 2
                ) as calculated_penalty,
                
                ((l.arrears_principal + l.arrears_interest) / l.disbursed_amount) * 100 as arrears_percentage,
                
                (SELECT MAX(payment_date) 
                 FROM loan_payments lp 
                 WHERE lp.loan_id = l.id) as last_payment_date,
                 
                (SELECT SUM(amount) 
                 FROM loan_payments lp 
                 WHERE lp.loan_id = l.id 
                 AND lp.payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as payments_last_30_days
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            ${whereClause}
            ORDER BY l.days_in_arrears DESC, (l.arrears_principal + l.arrears_interest) DESC
        `, { replacements });

        // Get summary statistics
        const [summary] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans_in_arrears,
                COUNT(DISTINCT l.client_id) as affected_clients,
                SUM(l.arrears_principal + l.arrears_interest) as total_arrears_amount,
                SUM(l.loan_balance) as total_portfolio_at_risk,
                AVG(l.days_in_arrears) as avg_days_in_arrears,
                MIN(l.days_in_arrears) as min_days_in_arrears,
                MAX(l.days_in_arrears) as max_days_in_arrears,
                
                SUM(CASE WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 1 ELSE 0 END) as early_arrears_count,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 1 ELSE 0 END) as moderate_arrears_count,
                                SUM(CASE WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 1 ELSE 0 END) as serious_arrears_count,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN 1 ELSE 0 END) as critical_arrears_count,
                
                SUM(CASE WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as early_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as moderate_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as serious_arrears_amount,
                SUM(CASE WHEN l.days_in_arrears > 180 THEN (l.arrears_principal + l.arrears_interest) ELSE 0 END) as critical_arrears_amount
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements });

        if (format === 'csv') {
            // Generate CSV format
            const csvHeaders = [
                'Loan Number', 'Loan Account', 'Client Number', 'Client Name', 'Client Mobile',
                'Disbursed Amount', 'Loan Balance', 'Arrears Principal', 'Arrears Interest',
                'Total Arrears', 'Days in Arrears', 'Arrears Start Date', 'Performance Class',
                'Branch', 'Loan Officer', 'Arrears Category', 'Calculated Penalty',
                'Arrears Percentage', 'Last Payment Date', 'Payments Last 30 Days'
            ].join(',');

            const csvRows = reportData.map(row => [
                row.loan_number,
                row.loan_account,
                row.client_number,
                `"${row.client_name}"`,
                row.client_mobile,
                row.disbursed_amount,
                row.loan_balance,
                row.arrears_principal,
                row.arrears_interest,
                row.total_arrears_amount,
                row.days_in_arrears,
                row.arrears_start_date,
                row.performance_class,
                row.branch || '',
                `"${row.loan_officer_name || ''}"`,
                row.arrears_category,
                row.calculated_penalty,
                row.arrears_percentage.toFixed(2),
                row.last_payment_date || '',
                row.payments_last_30_days || 0
            ].join(','));

            const csvContent = [csvHeaders, ...csvRows].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="loans_in_arrears_${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send(csvContent);
        }

        // JSON format response
        res.status(200).json({
            success: true,
            data: {
                report_period: {
                    start_date: start_date || 'All time',
                    end_date: end_date || new Date().toISOString().split('T')[0],
                    generated_at: new Date().toISOString()
                },
                summary: summary[0],
                loans_in_arrears: include_details === 'true' ? reportData : [],
                total_records: reportData.length,
                filters_applied: {
                    start_date,
                    end_date,
                    performance_class,
                    branch,
                    min_amount
                }
            }
        });

    } catch (error) {
        console.error('Generate arrears report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating arrears report',
            error: error.message
        });
    }
};

// Bulk update arrears performance classification
const bulkUpdatePerformanceClass = async (req, res) => {
    try {
        console.log('🔄 Starting bulk performance class update...');

        // Update performance classification based on days in arrears
        const [updateResult] = await sequelize.query(`
            UPDATE loans 
            SET 
                performance_class = CASE 
                    WHEN days_in_arrears = 0 THEN 'performing'
                    WHEN days_in_arrears BETWEEN 1 AND 30 THEN 'watch'
                    WHEN days_in_arrears BETWEEN 31 AND 90 THEN 'substandard'
                    WHEN days_in_arrears BETWEEN 91 AND 180 THEN 'doubtful'
                    WHEN days_in_arrears > 180 THEN 'loss'
                    ELSE performance_class
                END,
                updated_at = NOW()
            WHERE status IN ('active', 'disbursed')
        `);

        // Get updated statistics
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans_updated,
                SUM(CASE WHEN performance_class = 'performing' THEN 1 ELSE 0 END) as performing_loans,
                SUM(CASE WHEN performance_class = 'watch' THEN 1 ELSE 0 END) as watch_loans,
                SUM(CASE WHEN performance_class = 'substandard' THEN 1 ELSE 0 END) as substandard_loans,
                SUM(CASE WHEN performance_class = 'doubtful' THEN 1 ELSE 0 END) as doubtful_loans,
                SUM(CASE WHEN performance_class = 'loss' THEN 1 ELSE 0 END) as loss_loans
            FROM loans 
            WHERE status IN ('active', 'disbursed')
        `);

        console.log('✅ Bulk performance class update completed');

        res.status(200).json({
            success: true,
            message: 'Performance classification updated successfully',
            data: {
                updated_loans: updateResult.affectedRows,
                classification_summary: stats[0],
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Bulk update performance class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating performance classification',
            error: error.message
        });
    }
};

module.exports = {
    getLoansInArrears,
    getLoanInArrearsDetails,
    getArrearsAnalytics,
    createRecoveryAction,
    updateRecoveryAction,
    generateArrearsReport,
    bulkUpdatePerformanceClass
};
