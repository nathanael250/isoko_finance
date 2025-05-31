const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Get missed repayments with filters and pagination
// @route   GET /api/missed-repayments
// @access  Private
const getMissedRepayments = async (req, res) => {
    try {
        console.log('Received query params:', req.query);

        const {
            page = 1,
            limit = 20,
            days_threshold = 336, // Default to 336 days as per your requirement
            client_search,
            loan_officer_id,
            branch,
            risk_level,
            sort_by = 'days_since_last_unpaid',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE conditions
        let whereConditions = [`ls.status IN ('overdue', 'follow_up', 'pending')`];
        
        // Key condition: Days between today and last installment that was not partly paid
        // This finds installments where total_paid < total_due (not fully paid)
        whereConditions.push(`(COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0))`);
        
        // Add the days threshold condition
        whereConditions.push(`DATEDIFF(CURDATE(), ls.due_date) <= ${days_threshold}`);

        if (client_search) {
            whereConditions.push(`(c.first_name LIKE '%${client_search}%' OR c.last_name LIKE '%${client_search}%' OR l.loan_number LIKE '%${client_search}%')`);
        }

        if (loan_officer_id) {
            whereConditions.push(`l.loan_officer_id = ${loan_officer_id}`);
        }

        if (branch) {
            whereConditions.push(`l.branch = '${branch}'`);
        }

        // Build ORDER BY clause
        let orderBy = 'days_since_last_unpaid DESC';
        if (sort_by === 'client_name') {
            orderBy = `c.first_name ${sort_order}`;
        } else if (sort_by === 'loan_number') {
            orderBy = `l.loan_number ${sort_order}`;
        } else if (sort_by === 'due_date') {
            orderBy = `ls.due_date ${sort_order}`;
        } else if (sort_by === 'outstanding_amount') {
            orderBy = `outstanding_amount ${sort_order}`;
        }

        // Updated query to find installments that were not partly paid within the threshold
        const missedRepaymentsQuery = `
            SELECT 
                ls.id as schedule_id,
                COALESCE(l.loan_number, 'N/A') as loan_number,
                COALESCE(l.loan_account, 'N/A') as loan_account,
                COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Unknown Client') as client_name,
                COALESCE(c.mobile, '') as client_mobile,
                COALESCE(c.email, '') as client_email,
                ls.due_date,
                ls.installment_number,
                COALESCE(ls.principal_due, 0) as principal_due,
                COALESCE(ls.interest_due, 0) as interest_due,
                COALESCE(ls.fees_due, 0) as fees_due,
                COALESCE(ls.total_due, 0) as total_due,
                COALESCE(ls.principal_paid, 0) as principal_paid,
                COALESCE(ls.interest_paid, 0) as interest_paid,
                COALESCE(ls.fees_paid, 0) as fees_paid,
                COALESCE(ls.total_paid, 0) as total_paid,
                (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as outstanding_amount,
                (COALESCE(ls.principal_due, 0) - COALESCE(ls.principal_paid, 0)) as outstanding_principal,
                (COALESCE(ls.interest_due, 0) - COALESCE(ls.interest_paid, 0)) as outstanding_interest,
                DATEDIFF(CURDATE(), ls.due_date) as days_since_last_unpaid,
                COALESCE(ls.penalty_amount, 0) as penalty_amount,
                ls.status as payment_status,
                ls.payment_date as last_payment_date,
                ls.balance_after,
                COALESCE(l.performance_class, 'performing') as performance_class,
                COALESCE(l.branch, 'Main') as branch,
                COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Unassigned') as loan_officer,
                CASE 
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN 'Low Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN 'Medium Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN 'High Risk'
                    ELSE 'Critical Risk'
                END as risk_level,
                CASE 
                    WHEN COALESCE(ls.total_paid, 0) = 0 THEN 'Not Paid'
                    WHEN COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 'Partly Paid'
                    ELSE 'Fully Paid'
                END as payment_type,
                ROUND((COALESCE(ls.total_paid, 0) / COALESCE(ls.total_due, 1)) * 100, 2) as payment_percentage,
                ls.notes
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ${orderBy}
            LIMIT ${limit} OFFSET ${offset}
        `;

        console.log('Executing query:', missedRepaymentsQuery);
        const missedRepayments = await sequelize.query(missedRepaymentsQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            WHERE ${whereConditions.join(' AND ')}
        `;

        console.log('Executing count query:', countQuery);
        const countResult = await sequelize.query(countQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        const totalRecords = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalRecords / limit);

        // Apply risk level filter if specified
        let filteredResults = missedRepayments;
        if (risk_level) {
            filteredResults = missedRepayments.filter(item => item.risk_level === risk_level);
        }

        // Calculate additional statistics
        const statistics = {
            total_within_threshold: totalRecords,
            not_paid_count: filteredResults.filter(item => item.payment_type === 'Not Paid').length,
            partly_paid_count: filteredResults.filter(item => item.payment_type === 'Partly Paid').length,
            total_outstanding: filteredResults.reduce((sum, item) => sum + parseFloat(item.outstanding_amount || 0), 0),
            average_days_since_last_unpaid: filteredResults.length > 0 
                ? Math.round(filteredResults.reduce((sum, item) => sum + item.days_since_last_unpaid, 0) / filteredResults.length)
                : 0,
            days_threshold_used: parseInt(days_threshold)
        };

        console.log('Query successful, returning', filteredResults.length, 'records');

        res.status(200).json({
            success: true,
            data: {
                missed_repayments: filteredResults,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_records: totalRecords,
                    per_page: parseInt(limit)
                },
                statistics,
                filters_applied: {
                    days_threshold: parseInt(days_threshold),
                    client_search,
                    loan_officer_id,
                    branch,
                    risk_level
                }
            }
        });

    } catch (error) {
        console.error('Detailed error in getMissedRepayments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching missed repayments',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get missed repayments summary with days threshold
// @route   GET /api/missed-repayments/summary
// @access  Private
const getMissedRepaymentsSummary = async (req, res) => {
    try {
        const {
            days_threshold = 336,
            start_date,
            end_date,
            branch,
            loan_officer_id
        } = req.query;

        let whereConditions = [
            `(COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0))`, // Not fully paid
            `DATEDIFF(CURDATE(), ls.due_date) <= ${days_threshold}` // Within threshold
        ];

        if (start_date) {
            whereConditions.push(`ls.due_date >= '${start_date}'`);
        }

        if (end_date) {
            whereConditions.push(`ls.due_date <= '${end_date}'`);
        }

        if (branch) {
            whereConditions.push(`l.branch = '${branch}'`);
        }

        if (loan_officer_id) {
            whereConditions.push(`l.loan_officer_id = ${loan_officer_id}`);
        }

        const summaryQuery = `
            SELECT 
                COUNT(*) as total_installments_within_threshold,
                SUM(CASE WHEN COALESCE(ls.total_paid, 0) = 0 THEN 1 ELSE 0 END) as not_paid_count,
                SUM(CASE WHEN COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 1 ELSE 0 END) as partly_paid_count,
                SUM(COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as total_outstanding_amount,
                AVG(DATEDIFF(CURDATE(), ls.due_date)) as average_days_since_due,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN 1 ELSE 0 END) as within_30_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) ELSE 0 END) as amount_within_30_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) BETWEEN 31 AND 90 THEN 1 ELSE 0 END) as within_31_90_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) BETWEEN 31 AND 90 THEN (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) ELSE 0 END) as amount_within_31_90_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) BETWEEN 91 AND 180 THEN 1 ELSE 0 END) as within_91_180_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) BETWEEN 91 AND 180 THEN (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) ELSE 0 END) as amount_within_91_180_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) > 180 THEN 1 ELSE 0 END) as over_180_days,
                SUM(CASE WHEN DATEDIFF(CURDATE(), ls.due_date) > 180 THEN (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) ELSE 0 END) as amount_over_180_days,
                MIN(DATEDIFF(CURDATE(), ls.due_date)) as min_days_overdue,
                MAX(DATEDIFF(CURDATE(), ls.due_date)) as max_days_overdue
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            WHERE ${whereConditions.join(' AND ')}
        `;

        const summaryResult = await sequelize.query(summaryQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        const summary = summaryResult[0] || {};

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    days_threshold: parseInt(days_threshold),
                    total_installments_within_threshold: summary.total_installments_within_threshold || 0,
                    payment_status_breakdown: {
                        not_paid: {
                            count: summary.not_paid_count || 0
                        },
                        partly_paid: {
                            count: summary.partly_paid_count || 0
                        }
                    },
                    total_outstanding_amount: parseFloat(summary.total_outstanding_amount || 0),
                    average_days_since_due: Math.round(summary.average_days_since_due || 0),
                    aging_analysis: {
                        within_30_days: {
                            count: summary.within_30_days || 0,
                            amount: parseFloat(summary.amount_within_30_days || 0)
                        },
                        within_31_90_days: {
                            count: summary.within_31_90_days || 0,
                            amount: parseFloat(summary.amount_within_31_90_days || 0)
                        },
                        within_91_180_days: {
                            count: summary.within_91_180_days || 0,
                            amount: parseFloat(summary.amount_within_91_180_days || 0)
                        },
                                                over_180_days: {
                            count: summary.over_180_days || 0,
                            amount: parseFloat(summary.amount_over_180_days || 0)
                        }
                    },
                    days_range: {
                        min_days_overdue: summary.min_days_overdue || 0,
                        max_days_overdue: summary.max_days_overdue || 0
                    }
                },
                generated_at: new Date().toISOString(),
                filters_applied: {
                    days_threshold: parseInt(days_threshold),
                    start_date,
                    end_date,
                    branch,
                    loan_officer_id
                }
            }
        });

    } catch (error) {
        console.error('Error in getMissedRepaymentsSummary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching missed repayments summary',
            error: error.message
        });
    }
};

// @desc    Mark installment for follow-up action
// @route   POST /api/missed-repayments/:schedule_id/follow-up
// @access  Private
const markForFollowUp = async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const { action_type, notes, scheduled_date, priority = 'medium' } = req.body;

        // First, check if the installment exists and is within our criteria
        const checkQuery = `
            SELECT 
                ls.id,
                ls.due_date,
                ls.total_due,
                ls.total_paid,
                DATEDIFF(CURDATE(), ls.due_date) as days_since_due,
                l.loan_number,
                CONCAT(c.first_name, ' ', c.last_name) as client_name
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            WHERE ls.id = ${schedule_id}
        `;

        const installmentResult = await sequelize.query(checkQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        if (!installmentResult.length) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        const installment = installmentResult[0];

        // Update the installment with follow-up information
        const updateQuery = `
            UPDATE loan_schedules 
            SET status = 'follow_up', 
                notes = CONCAT(
                    COALESCE(notes, ''), 
                    '\n[${new Date().toISOString()}] Follow-up Action: ${action_type}',
                    '\nPriority: ${priority}',
                    '\nNotes: ${notes || 'No additional notes'}',
                    '\nScheduled for: ${scheduled_date || 'Not specified'}',
                    '\nDays since due: ${installment.days_since_due}',
                    '\nOutstanding: ${parseFloat(installment.total_due || 0) - parseFloat(installment.total_paid || 0)}'
                ),
                updated_at = NOW()
            WHERE id = ${schedule_id}
        `;

        await sequelize.query(updateQuery, { type: sequelize.QueryTypes.UPDATE });

        res.status(200).json({
            success: true,
            message: 'Follow-up action created successfully',
            data: {
                schedule_id,
                loan_number: installment.loan_number,
                client_name: installment.client_name,
                action_type,
                priority,
                notes,
                scheduled_date,
                days_since_due: installment.days_since_due,
                outstanding_amount: parseFloat(installment.total_due || 0) - parseFloat(installment.total_paid || 0),
                created_by: req.user?.id || 1,
                created_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in markForFollowUp:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating follow-up action',
            error: error.message
        });
    }
};

// @desc    Get follow-up actions for missed repayments
// @route   GET /api/missed-repayments/follow-ups
// @access  Private
const getFollowUpActions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'follow_up',
            loan_officer_id,
            branch,
            priority,
            days_threshold = 336,
            start_date,
            end_date
        } = req.query;

        const offset = (page - 1) * limit;

        let whereConditions = [`ls.status = '${status}'`];
        whereConditions.push(`DATEDIFF(CURDATE(), ls.due_date) <= ${days_threshold}`);

        if (loan_officer_id) {
            whereConditions.push(`l.loan_officer_id = ${loan_officer_id}`);
        }

        if (branch) {
            whereConditions.push(`l.branch = '${branch}'`);
        }

        if (start_date) {
            whereConditions.push(`ls.due_date >= '${start_date}'`);
        }

        if (end_date) {
            whereConditions.push(`ls.due_date <= '${end_date}'`);
        }

        if (priority) {
            whereConditions.push(`ls.notes LIKE '%Priority: ${priority}%'`);
        }

        const followUpQuery = `
            SELECT 
                ls.id as schedule_id,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                c.email as client_email,
                ls.due_date,
                ls.installment_number,
                (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as outstanding_amount,
                DATEDIFF(CURDATE(), ls.due_date) as days_since_due,
                CASE 
                    WHEN COALESCE(ls.total_paid, 0) = 0 THEN 'Not Paid'
                    WHEN COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 'Partly Paid'
                    ELSE 'Fully Paid'
                END as payment_status,
                ROUND((COALESCE(ls.total_paid, 0) / COALESCE(ls.total_due, 1)) * 100, 2) as payment_percentage,
                ls.status,
                ls.notes,
                ls.updated_at as last_action_date,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                l.branch,
                CASE 
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN 'Low Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN 'Medium Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN 'High Risk'
                    ELSE 'Critical Risk'
                END as risk_level
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ls.updated_at DESC, DATEDIFF(CURDATE(), ls.due_date) DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const followUps = await sequelize.query(followUpQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            WHERE ${whereConditions.join(' AND ')}
        `;

        const countResult = await sequelize.query(countQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        const totalRecords = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: {
                follow_ups: followUps,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_records: totalRecords,
                    per_page: parseInt(limit)
                },
                filters_applied: {
                    days_threshold: parseInt(days_threshold),
                    status,
                    loan_officer_id,
                    branch,
                    priority
                }
            }
        });

    } catch (error) {
        console.error('Error in getFollowUpActions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching follow-up actions',
            error: error.message
        });
    }
};

// @desc    Update follow-up action status
// @route   PUT /api/missed-repayments/follow-ups/:followup_id
// @access  Private
const updateFollowUpStatus = async (req, res) => {
    try {
        const { followup_id } = req.params;
        const { status, notes, action_taken, next_action_date } = req.body;

        const updateQuery = `
            UPDATE loan_schedules 
            SET status = '${status}',
                notes = CONCAT(
                    COALESCE(notes, ''), 
                    '\n[${new Date().toISOString()}] Status Update: ${status}',
                    '\nAction Taken: ${action_taken || 'Not specified'}',
                    '\nNotes: ${notes || 'No additional notes'}',
                    '\nNext Action Date: ${next_action_date || 'Not specified'}',
                    '\nUpdated by: User ID ${req.user?.id || 1}'
                ),
                updated_at = NOW()
            WHERE id = ${followup_id}
        `;

        await sequelize.query(updateQuery, { type: sequelize.QueryTypes.UPDATE });

        res.status(200).json({
            success: true,
            message: 'Follow-up action updated successfully',
            data: {
                followup_id,
                status,
                action_taken,
                notes,
                next_action_date,
                updated_by: req.user?.id || 1,
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in updateFollowUpStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating follow-up action',
            error: error.message
        });
    }
};

// @desc    Generate missed repayments report with days threshold
// @route   GET /api/missed-repayments/report
// @access  Private
const generateMissedRepaymentsReport = async (req, res) => {
    try {
        const {
            format = 'json',
            days_threshold = 336,
            start_date,
            end_date,
            branch,
            loan_officer_id,
            risk_level,
            payment_status // 'not_paid', 'partly_paid', 'all'
        } = req.query;

        let whereConditions = [
            `(COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0))`, // Not fully paid
            `DATEDIFF(CURDATE(), ls.due_date) <= ${days_threshold}` // Within threshold
        ];

        if (start_date) {
            whereConditions.push(`ls.due_date >= '${start_date}'`);
        }

        if (end_date) {
            whereConditions.push(`ls.due_date <= '${end_date}'`);
        }

        if (branch) {
            whereConditions.push(`l.branch = '${branch}'`);
        }

        if (loan_officer_id) {
            whereConditions.push(`l.loan_officer_id = ${loan_officer_id}`);
        }

        if (payment_status === 'not_paid') {
            whereConditions.push(`COALESCE(ls.total_paid, 0) = 0`);
        } else if (payment_status === 'partly_paid') {
            whereConditions.push(`COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0)`);
        }

        const reportQuery = `
            SELECT 
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.mobile as client_mobile,
                c.email as client_email,
                ls.due_date,
                ls.installment_number,
                ls.total_due,
                ls.total_paid,
                (COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as outstanding_amount,
                DATEDIFF(CURDATE(), ls.due_date) as days_since_due,
                ls.penalty_amount,
                ls.status as payment_status_db,
                CASE 
                    WHEN COALESCE(ls.total_paid, 0) = 0 THEN 'Not Paid'
                    WHEN COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 'Partly Paid'
                    ELSE 'Fully Paid'
                END as payment_type,
                ROUND((COALESCE(ls.total_paid, 0) / COALESCE(ls.total_due, 1)) * 100, 2) as payment_percentage,
                CASE 
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN 'Low Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN 'Medium Risk'
                    WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN 'High Risk'
                    ELSE 'Critical Risk'
                END as risk_level,
                l.branch,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                l.performance_class,
                ls.notes,
                '${days_threshold}' as days_threshold_used
            FROM loan_schedules ls
            LEFT JOIN loans l ON ls.loan_id = l.id
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY DATEDIFF(CURDATE(), ls.due_date) DESC, outstanding_amount DESC
        `;

        const reportData = await sequelize.query(reportQuery, { 
            type: sequelize.QueryTypes.SELECT 
        });

        // Apply risk level
                // Apply risk level filter if specified
        let filteredData = reportData;
        if (risk_level) {
            filteredData = reportData.filter(item => item.risk_level === risk_level);
        }

        if (format === 'csv') {
            // Generate CSV
            const csv = convertToCSV(filteredData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=missed-repayments-${days_threshold}days-${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csv);
        } else {
            // Return JSON with comprehensive statistics
            const statistics = {
                total_records: filteredData.length,
                days_threshold_used: parseInt(days_threshold),
                payment_breakdown: {
                    not_paid: filteredData.filter(item => item.payment_type === 'Not Paid').length,
                    partly_paid: filteredData.filter(item => item.payment_type === 'Partly Paid').length
                },
                risk_breakdown: {
                    low_risk: filteredData.filter(item => item.risk_level === 'Low Risk').length,
                    medium_risk: filteredData.filter(item => item.risk_level === 'Medium Risk').length,
                    high_risk: filteredData.filter(item => item.risk_level === 'High Risk').length,
                    critical_risk: filteredData.filter(item => item.risk_level === 'Critical Risk').length
                },
                financial_summary: {
                    total_outstanding: filteredData.reduce((sum, item) => sum + parseFloat(item.outstanding_amount || 0), 0),
                    total_penalties: filteredData.reduce((sum, item) => sum + parseFloat(item.penalty_amount || 0), 0),
                    average_outstanding: filteredData.length > 0 
                        ? filteredData.reduce((sum, item) => sum + parseFloat(item.outstanding_amount || 0), 0) / filteredData.length 
                        : 0
                },
                aging_summary: {
                    average_days_since_due: filteredData.length > 0 
                        ? Math.round(filteredData.reduce((sum, item) => sum + item.days_since_due, 0) / filteredData.length)
                        : 0,
                    min_days_since_due: filteredData.length > 0 
                        ? Math.min(...filteredData.map(item => item.days_since_due))
                        : 0,
                    max_days_since_due: filteredData.length > 0 
                        ? Math.max(...filteredData.map(item => item.days_since_due))
                        : 0
                }
            };

            res.status(200).json({
                success: true,
                data: {
                    report: filteredData,
                    statistics,
                    generated_at: new Date().toISOString(),
                    filters_applied: {
                        days_threshold: parseInt(days_threshold),
                        start_date,
                        end_date,
                        branch,
                        loan_officer_id,
                        risk_level,
                        payment_status,
                        format
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error in generateMissedRepaymentsReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
};

// @desc    Get missed repayments analytics with days threshold
// @route   GET /api/missed-repayments/analytics
// @access  Private
const getMissedRepaymentsAnalytics = async (req, res) => {
    try {
        const {
            days_threshold = 336,
            start_date,
            end_date,
            branch,
            loan_officer_id
        } = req.query;

        let whereConditions = [
            `(COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0))`, // Not fully paid
            `DATEDIFF(CURDATE(), ls.due_date) <= ${days_threshold}` // Within threshold
        ];

        if (start_date) {
            whereConditions.push(`ls.due_date >= '${start_date}'`);
        }

        if (end_date) {
            whereConditions.push(`ls.due_date <= '${end_date}'`);
        }

        if (branch) {
            whereConditions.push(`l.branch = '${branch}'`);
        }

        if (loan_officer_id) {
            whereConditions.push(`l.loan_officer_id = ${loan_officer_id}`);
        }

        // Analytics queries
        const analyticsQueries = {
            // Trend analysis by month
            trend: `
                SELECT 
                    DATE_FORMAT(ls.due_date, '%Y-%m') as month,
                    COUNT(*) as missed_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) = 0 THEN 1 ELSE 0 END) as not_paid_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 1 ELSE 0 END) as partly_paid_count,
                    SUM(COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as missed_amount,
                    AVG(DATEDIFF(CURDATE(), ls.due_date)) as avg_days_since_due
                FROM loan_schedules ls
                LEFT JOIN loans l ON ls.loan_id = l.id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY DATE_FORMAT(ls.due_date, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `,
            
            // Branch analysis
            branch_analysis: `
                SELECT 
                    COALESCE(l.branch, 'Unknown') as branch,
                    COUNT(*) as missed_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) = 0 THEN 1 ELSE 0 END) as not_paid_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 1 ELSE 0 END) as partly_paid_count,
                    SUM(COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as missed_amount,
                    AVG(DATEDIFF(CURDATE(), ls.due_date)) as avg_days_since_due,
                    ROUND(AVG((COALESCE(ls.total_paid, 0) / COALESCE(ls.total_due, 1)) * 100), 2) as avg_payment_percentage
                FROM loan_schedules ls
                LEFT JOIN loans l ON ls.loan_id = l.id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY l.branch
                ORDER BY missed_amount DESC
            `,
            
            // Loan officer performance
            officer_performance: `
                SELECT 
                    COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Unassigned') as loan_officer,
                    l.loan_officer_id,
                    COUNT(*) as missed_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) = 0 THEN 1 ELSE 0 END) as not_paid_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 1 ELSE 0 END) as partly_paid_count,
                    SUM(COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as missed_amount,
                    AVG(DATEDIFF(CURDATE(), ls.due_date)) as avg_days_since_due,
                    ROUND(AVG((COALESCE(ls.total_paid, 0) / COALESCE(ls.total_due, 1)) * 100), 2) as avg_payment_percentage
                FROM loan_schedules ls
                LEFT JOIN loans l ON ls.loan_id = l.id
                LEFT JOIN users u ON l.loan_officer_id = u.id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY l.loan_officer_id, u.first_name, u.last_name
                ORDER BY missed_amount DESC
                LIMIT 10
            `,

            // Days threshold analysis
            threshold_analysis: `
                SELECT 
                    CASE 
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 7 THEN '0-7 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN '8-30 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN '31-90 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN '91-180 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 365 THEN '181-365 days'
                        ELSE 'Over 1 year'
                    END as days_range,
                    COUNT(*) as count,
                    SUM(COALESCE(ls.total_due, 0) - COALESCE(ls.total_paid, 0)) as outstanding_amount,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) = 0 THEN 1 ELSE 0 END) as not_paid_count,
                    SUM(CASE WHEN COALESCE(ls.total_paid, 0) > 0 AND COALESCE(ls.total_paid, 0) < COALESCE(ls.total_due, 0) THEN 1 ELSE 0 END) as partly_paid_count
                FROM loan_schedules ls
                LEFT JOIN loans l ON ls.loan_id = l.id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY 
                    CASE 
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 7 THEN '0-7 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN '8-30 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN '31-90 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN '91-180 days'
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 365 THEN '181-365 days'
                        ELSE 'Over 1 year'
                    END
                ORDER BY 
                    CASE 
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 7 THEN 1
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 30 THEN 2
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 90 THEN 3
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 180 THEN 4
                        WHEN DATEDIFF(CURDATE(), ls.due_date) <= 365 THEN 5
                        ELSE 6
                    END
            `
        };

        const [trendData, branchData, officerData, thresholdData] = await Promise.all([
            sequelize.query(analyticsQueries.trend, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(analyticsQueries.branch_analysis, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(analyticsQueries.officer_performance, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(analyticsQueries.threshold_analysis, { type: sequelize.QueryTypes.SELECT })
        ]);

        res.status(200).json({
            success: true,
            data: {
                analytics: {
                    trend_analysis: trendData,
                    branch_analysis: branchData,
                    officer_performance: officerData,
                    threshold_analysis: thresholdData
                },
                configuration: {
                    days_threshold_used: parseInt(days_threshold),
                    total_installments_analyzed: trendData.reduce((sum, item) => sum + item.missed_count, 0)
                },
                generated_at: new Date().toISOString(),
                filters_applied: {
                    days_threshold: parseInt(days_threshold),
                    start_date,
                    end_date,
                    branch,
                    loan_officer_id
                }
            }
        });

    } catch (error) {
        console.error('Error in getMissedRepaymentsAnalytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

module.exports = {
    getMissedRepayments,
    getMissedRepaymentsSummary,
    markForFollowUp,
    getFollowUpActions,
    updateFollowUpStatus,
    generateMissedRepaymentsReport,
    getMissedRepaymentsAnalytics
};

