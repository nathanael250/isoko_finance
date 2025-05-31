const { sequelize } = require('../config/database');

class PastMaturityController {
    // Get loans past maturity by specific days
    static async getLoansByDays(req, res) {
        try {
            const { 
                days, 
                operator = '=', 
                limit = 50, 
                offset = 0,
                sortBy = 'recovery_priority_score',
                sortOrder = 'DESC'
            } = req.query;

            // Validate days parameter
            const daysNum = parseInt(days);
            if (!daysNum || daysNum < 1 || daysNum > 366) {
                return res.status(400).json({
                    success: false,
                    message: 'Days parameter must be between 1 and 366'
                });
            }

            // Validate operator
            const validOperators = ['=', '>', '<', '>=', '<='];
            if (!validOperators.includes(operator)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid operator. Use: =, >, <, >=, <='
                });
            }

            // Validate sort fields
            const validSortFields = [
                'recovery_priority_score', 'current_outstanding_balance', 'days_past_maturity',
                'estimated_penalty_interest', 'collection_rate_percentage', 'loan_number'
            ];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'recovery_priority_score';
            const sortDirection = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

            // Build WHERE clause
            const whereClause = `days_past_maturity ${operator} ${daysNum}`;

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    loan_account,
                    CONCAT(first_name, ' ', last_name) as client_name,
                    mobile as client_mobile,
                    email as client_email,
                    disbursed_amount,
                                        current_outstanding_balance,
                    maturity_date,
                    days_past_maturity,
                    overdue_category,
                    estimated_penalty_interest,
                    collection_rate_percentage,
                    total_payments_made,
                    amount_paid_after_maturity,
                    last_payment_date,
                    recovery_actions_count,
                    post_maturity_actions_count,
                    latest_recovery_action,
                    latest_recovery_action_date,
                    loan_officer_name,
                    loan_officer_phone,
                    branch,
                    loan_type_name,
                    performance_class,
                    recovery_priority_score,
                    urgency_level,
                    weeks_past_maturity,
                    months_past_maturity_approx
                FROM v_past_maturity_day_analysis 
                WHERE ${whereClause}
                ORDER BY ${sortField} ${sortDirection}
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [results] = await sequelize.query(query);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM v_past_maturity_day_analysis 
                WHERE ${whereClause}
            `;
            const [countResult] = await sequelize.query(countQuery);
            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: {
                    loans: results,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        pages: Math.ceil(total / limit)
                    },
                    filters: {
                        days: daysNum,
                        operator,
                        sortBy: sortField,
                        sortOrder: sortDirection
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching past maturity loans by days:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching past maturity loans',
                error: error.message
            });
        }
    }

    // Get statistics for specific day range
    static async getStatsByDayRange(req, res) {
        try {
            const { minDays = 1, maxDays = 366 } = req.query;

            const minDaysNum = parseInt(minDays);
            const maxDaysNum = parseInt(maxDays);

            if (minDaysNum < 1 || maxDaysNum > 366 || minDaysNum > maxDaysNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid day range. Must be between 1-366 and minDays <= maxDays'
                });
            }

            const query = `
                SELECT 
                    ${minDaysNum} as from_days,
                    ${maxDaysNum} as to_days,
                    COUNT(*) as loans_count,
                    SUM(current_outstanding_balance) as total_outstanding,
                    AVG(current_outstanding_balance) as avg_outstanding,
                    AVG(days_past_maturity) as avg_days_past_maturity,
                    SUM(estimated_penalty_interest) as total_penalty_interest,
                    AVG(collection_rate_percentage) as avg_collection_rate,
                    SUM(CASE WHEN post_maturity_actions_count = 0 THEN 1 ELSE 0 END) as loans_without_actions,
                    SUM(CASE WHEN overdue_category IN ('CRITICALLY_OVERDUE', 'EXTREMELY_OVERDUE') THEN 1 ELSE 0 END) as critical_loans,
                    COUNT(DISTINCT branch) as affected_branches,
                    COUNT(DISTINCT loan_officer_id) as affected_officers,
                    
                    -- Urgency breakdown
                    SUM(CASE WHEN urgency_level = 'IMMEDIATE' THEN 1 ELSE 0 END) as immediate_cases,
                    SUM(CASE WHEN urgency_level = 'URGENT' THEN 1 ELSE 0 END) as urgent_cases,
                    SUM(CASE WHEN urgency_level = 'HIGH' THEN 1 ELSE 0 END) as high_cases,
                    SUM(CASE WHEN urgency_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_cases,
                    SUM(CASE WHEN urgency_level = 'LOW' THEN 1 ELSE 0 END) as low_cases
                FROM v_past_maturity_day_analysis
                WHERE days_past_maturity BETWEEN ${minDaysNum} AND ${maxDaysNum}
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results[0]
            });

        } catch (error) {
            console.error('Error fetching past maturity statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    }

    // Get day-wise breakdown
    static async getDayWiseBreakdown(req, res) {
        try {
            const { maxDays = 30 } = req.query;
            const maxDaysNum = parseInt(maxDays);

            if (maxDaysNum < 1 || maxDaysNum > 366) {
                return res.status(400).json({
                    success: false,
                    message: 'maxDays must be between 1 and 366'
                });
            }

            const query = `
                SELECT * FROM v_past_maturity_day_summary
                WHERE days_past_maturity <= ${maxDaysNum}
                ORDER BY days_past_maturity
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('Error fetching day-wise breakdown:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching day-wise breakdown',
                error: error.message
            });
        }
    }

    // Get common day filters with counts
    static async getCommonDayFilters(req, res) {
        try {
            const query = `
                SELECT 
                    'Exactly 1 Day' as filter_name,
                    1 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 1 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 1 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 7 Days' as filter_name,
                    7 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 7 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 7 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 30 Days' as filter_name,
                    30 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 30 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 30 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'More than 30 Days' as filter_name,
                    30 as days,
                    '>' as operator,
                    COUNT(CASE WHEN days_past_maturity > 30 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity > 30 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 60 Days' as filter_name,
                    60 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 60 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 60 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 90 Days' as filter_name,
                    90 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 90 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 90 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'More than 90 Days' as filter_name,
                    90 as days,
                    '>' as operator,
                    COUNT(CASE WHEN days_past_maturity > 90 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity > 90 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 180 Days' as filter_name,
                    180 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 180 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 180 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'Exactly 365 Days' as filter_name,
                    365 as days,
                    '=' as operator,
                    COUNT(CASE WHEN days_past_maturity = 365 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity = 365 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                UNION ALL
                SELECT 
                    'More than 365 Days' as filter_name,
                    365 as days,
                    '>' as operator,
                    COUNT(CASE WHEN days_past_maturity > 365 THEN 1 END) as loans_count,
                    SUM(CASE WHEN days_past_maturity > 365 THEN current_outstanding_balance ELSE 0 END) as total_outstanding
                FROM v_past_maturity_day_analysis
                ORDER BY days, operator
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('Error fetching common day filters:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching common day filters',
                error: error.message
            });
        }
    }

    // Get dashboard summary
    static async getDashboardSummary(req, res) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_past_maturity_loans,
                    SUM(current_outstanding_balance) as total_outstanding_amount,
                    AVG(days_past_maturity) as avg_days_past_maturity,
                    
                    -- Today's new past maturity loans
                    COUNT(CASE WHEN days_past_maturity = 1 THEN 1 END) as new_past_maturity_today,
                    SUM(CASE WHEN days_past_maturity = 1 THEN current_outstanding_balance ELSE 0 END) as new_past_maturity_amount_today,
                    
                    -- Critical cases (over 90 days)
                    COUNT(CASE WHEN days_past_maturity > 90 THEN 1 END) as critical_cases,
                    SUM(CASE WHEN days_past_maturity > 90 THEN current_outstanding_balance ELSE 0 END) as critical_amount,
                    
                    -- No action taken
                    COUNT(CASE WHEN post_maturity_actions_count = 0 THEN 1 END) as no_action_taken,
                    SUM(CASE WHEN post_maturity_actions_count = 0 THEN current_outstanding_balance ELSE 0 END) as no_action_amount,
                    
                    -- High value cases (>100k)
                    COUNT(CASE WHEN current_outstanding_balance > 100000 THEN 1 END) as high_value_cases,
                    SUM(CASE WHEN current_outstanding_balance > 100000 THEN current_outstanding_balance ELSE 0 END) as high_value_amount,
                    
                    -- Urgency breakdown
                    COUNT(CASE WHEN urgency_level = 'IMMEDIATE' THEN 1 END) as immediate_cases,
                    COUNT(CASE WHEN urgency_level = 'URGENT' THEN 1 END) as urgent_cases,
                    COUNT(CASE WHEN urgency_level = 'HIGH' THEN 1 END) as high_cases,
                    COUNT(CASE WHEN urgency_level = 'MEDIUM' THEN 1 END) as medium_cases,
                    COUNT(CASE WHEN urgency_level = 'LOW' THEN 1 END) as low_cases,
                    
                    -- Performance impact
                    SUM(estimated_penalty_interest) as total_penalty_interest,
                    AVG(collection_rate_percentage) as avg_collection_rate,
                    
                    -- Branch and officer impact
                    COUNT(DISTINCT branch) as affected_branches,
                    COUNT(DISTINCT loan_officer_id) as affected_officers,
                    
                    -- Day range breakdown
                    COUNT(CASE WHEN days_past_maturity BETWEEN 1 AND 7 THEN 1 END) as days_1_to_7,
                    COUNT(CASE WHEN days_past_maturity BETWEEN 8 AND 30 THEN 1 END) as days_8_to_30,
                    COUNT(CASE WHEN days_past_maturity BETWEEN 31 AND 90 THEN 1 END) as days_31_to_90,
                    COUNT(CASE WHEN days_past_maturity BETWEEN 91 AND 180 THEN 1 END) as days_91_to_180,
                    COUNT(CASE WHEN days_past_maturity BETWEEN 181 AND 365 THEN 1 END) as days_181_to_365,
                    COUNT(CASE WHEN days_past_maturity > 365 THEN 1 END) as days_over_365
                    
                FROM v_past_maturity_day_analysis
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results[0],
                                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard summary',
                error: error.message
            });
        }
    }

    // Get branch-wise past maturity summary
    static async getBranchSummary(req, res) {
        try {
            const query = `
                SELECT * FROM v_past_maturity_by_branch
                ORDER BY total_outstanding DESC
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('Error fetching branch summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching branch summary',
                error: error.message
            });
        }
    }

    // Get officer-wise past maturity summary
    static async getOfficerSummary(req, res) {
        try {
            const { branch } = req.query;
            
            let whereClause = '';
            if (branch && branch !== 'all') {
                whereClause = `WHERE branch = '${branch}'`;
            }

            const query = `
                SELECT * FROM v_past_maturity_by_officer
                ${whereClause}
                ORDER BY extremely_overdue_count DESC, total_outstanding DESC
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('Error fetching officer summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching officer summary',
                error: error.message
            });
        }
    }

    // Get loans by urgency level
    static async getLoansByUrgency(req, res) {
        try {
            const { urgency, limit = 50, offset = 0 } = req.query;

            const validUrgencyLevels = ['IMMEDIATE', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
            if (!validUrgencyLevels.includes(urgency)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid urgency level. Use: IMMEDIATE, URGENT, HIGH, MEDIUM, LOW'
                });
            }

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    CONCAT(first_name, ' ', last_name) as client_name,
                    mobile as client_mobile,
                    current_outstanding_balance,
                    days_past_maturity,
                    overdue_category,
                    urgency_level,
                    recovery_priority_score,
                    estimated_penalty_interest,
                    post_maturity_actions_count,
                    loan_officer_name,
                    branch
                FROM v_past_maturity_day_analysis
                WHERE urgency_level = '${urgency}'
                ORDER BY recovery_priority_score DESC, current_outstanding_balance DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [results] = await sequelize.query(query);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM v_past_maturity_day_analysis 
                WHERE urgency_level = '${urgency}'
            `;
            const [countResult] = await sequelize.query(countQuery);
            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: {
                    loans: results,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        pages: Math.ceil(total / limit)
                    },
                    filters: {
                        urgency
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching loans by urgency:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching loans by urgency',
                error: error.message
            });
        }
    }

    // Get high priority loans (top recovery priority scores)
    static async getHighPriorityLoans(req, res) {
        try {
            const { limit = 20 } = req.query;

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    CONCAT(first_name, ' ', last_name) as client_name,
                    mobile as client_mobile,
                    email as client_email,
                    current_outstanding_balance,
                    days_past_maturity,
                    overdue_category,
                    urgency_level,
                    recovery_priority_score,
                    estimated_penalty_interest,
                    collection_rate_percentage,
                    post_maturity_actions_count,
                    latest_recovery_action,
                    latest_recovery_action_date,
                    loan_officer_name,
                    loan_officer_phone,
                    branch
                FROM v_past_maturity_day_analysis
                WHERE recovery_priority_score >= 80
                ORDER BY recovery_priority_score DESC, current_outstanding_balance DESC
                LIMIT ${limit}
            `;

            const [results] = await sequelize.query(query);

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('Error fetching high priority loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching high priority loans',
                error: error.message
            });
        }
    }

    // Get loans with no recovery actions
    static async getLoansWithoutActions(req, res) {
        try {
            const { minDays = 7, limit = 50, offset = 0 } = req.query;

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    CONCAT(first_name, ' ', last_name) as client_name,
                    mobile as client_mobile,
                    current_outstanding_balance,
                    days_past_maturity,
                    overdue_category,
                    maturity_date,
                    disbursed_amount,
                    loan_officer_name,
                    loan_officer_phone,
                    branch
                FROM v_past_maturity_day_analysis
                WHERE post_maturity_actions_count = 0
                AND days_past_maturity >= ${parseInt(minDays)}
                ORDER BY days_past_maturity DESC, current_outstanding_balance DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [results] = await sequelize.query(query);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM v_past_maturity_day_analysis 
                WHERE post_maturity_actions_count = 0
                AND days_past_maturity >= ${parseInt(minDays)}
            `;
            const [countResult] = await sequelize.query(countQuery);
            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: {
                    loans: results,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        pages: Math.ceil(total / limit)
                    },
                    filters: {
                        minDays: parseInt(minDays)
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching loans without actions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching loans without actions',
                error: error.message
            });
        }
    }

    // Export data for reporting
    static async exportPastMaturityData(req, res) {
        try {
            const { 
                format = 'json',
                days,
                operator = '>=',
                urgency,
                branch,
                officer
            } = req.query;

            let whereConditions = [];

            if (days) {
                const daysNum = parseInt(days);
                if (daysNum >= 1 && daysNum <= 366) {
                    whereConditions.push(`days_past_maturity ${operator} ${daysNum}`);
                }
            }

            if (urgency && ['IMMEDIATE', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(urgency)) {
                whereConditions.push(`urgency_level = '${urgency}'`);
            }

            if (branch && branch !== 'all') {
                whereConditions.push(`branch = '${branch}'`);
            }

            if (officer) {
                whereConditions.push(`loan_officer_id = ${parseInt(officer)}`);
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            const query = `
                SELECT 
                    loan_number,
                    loan_account,
                    CONCAT(first_name, ' ', last_name) as client_name,
                    mobile as client_mobile,
                    email as client_email,
                    disbursed_amount,
                    current_outstanding_balance,
                    maturity_date,
                    days_past_maturity,
                    overdue_category,
                    urgency_level,
                    estimated_penalty_interest,
                    collection_rate_percentage,
                    total_payments_made,
                    recovery_actions_count,
                    post_maturity_actions_count,
                    latest_recovery_action,
                    latest_recovery_action_date,
                    loan_officer_name,
                    branch,
                    loan_type_name,
                    performance_class,
                    recovery_priority_score
                FROM v_past_maturity_day_analysis
                ${whereClause}
                ORDER BY recovery_priority_score DESC, current_outstanding_balance DESC
            `;

            const [results] = await sequelize.query(query);

            if (format === 'csv') {
                // Convert to CSV format
                const csv = convertToCSV(results);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=past_maturity_loans.csv');
                res.send(csv);
            } else {
                res.status(200).json({
                    success: true,
                    data: results,
                    exportInfo: {
                        totalRecords: results.length,
                        exportDate: new Date().toISOString(),
                        filters: { days, operator, urgency, branch, officer }
                    }
                });
            }

        } catch (error) {
            console.error('Error exporting past maturity data:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting data',
                error: error.message
            });
        }
    }
}

// Helper function to convert JSON to CSV
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

module.exports = PastMaturityController;

