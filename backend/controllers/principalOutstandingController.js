const { sequelize } = require('../config/database');

class PrincipalOutstandingController {
    // Get all principal outstanding loans with filters
    static async getPrincipalOutstanding(req, res) {
        try {
            const {
                status,
                riskCategory,
                performanceStatus,
                branch,
                officer,
                minAmount,
                maxAmount,
                search,
                limit = 50,
                offset = 0,
                sortBy = 'principal_balance',
                sortOrder = 'DESC'
            } = req.query;

            let whereConditions = [];

            // Build WHERE conditions
            if (status && status !== 'all') {
                whereConditions.push(`status_category = '${status}'`);
            }

            if (riskCategory && riskCategory !== 'all') {
                whereConditions.push(`risk_category = '${riskCategory}'`);
            }

            if (performanceStatus && performanceStatus !== 'all') {
                whereConditions.push(`principal_performance_status = '${performanceStatus}'`);
            }

            if (branch && branch !== 'all') {
                whereConditions.push(`branch = '${branch}'`);
            }

            if (officer) {
                whereConditions.push(`loan_officer_id = ${parseInt(officer)}`);
            }

            if (minAmount) {
                whereConditions.push(`principal_balance >= ${parseFloat(minAmount)}`);
            }

            if (maxAmount) {
                whereConditions.push(`principal_balance <= ${parseFloat(maxAmount)}`);
            }

            if (search) {
                whereConditions.push(`(
                    loan_number LIKE '%${search}%' OR 
                    client_name LIKE '%${search}%' OR 
                    client_mobile LIKE '%${search}%' OR
                    loan_account LIKE '%${search}%'
                )`);
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            // Validate sort column
            const allowedSortColumns = [
                'loan_number', 'client_name', 'principal_balance', 'principal_paid',
                'principal_due_till_today', 'principal_variance', 'payment_compliance_percentage',
                'days_since_disbursement', 'last_payment_date', 'release_date'
            ];

            const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'principal_balance';
            const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    loan_account,
                    client_name,
                    client_mobile,
                    released_amount,
                    release_date,
                    maturity_date,
                    principal_amount,
                    principal_paid,
                    principal_balance,
                    principal_due_till_today,
                    principal_paid_till_today,
                    principal_balance_till_today,
                    principal_variance,
                    status_category,
                    risk_category,
                    principal_performance_status,
                    payment_compliance_percentage,
                    total_payments_count,
                    last_payment_date,
                    last_payment_amount,
                    days_since_disbursement,
                    days_from_maturity,
                    loan_officer_name,
                    branch,
                    loan_type_name,
                    performance_class
                FROM v_principal_outstanding_detailed
                ${whereClause}
                ORDER BY ${sortColumn} ${sortDirection}
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [results] = await sequelize.query(query);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM v_principal_outstanding_detailed 
                ${whereClause}
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
                        status,
                        riskCategory,
                        performanceStatus,
                        branch,
                        officer,
                        minAmount,
                        maxAmount,
                        search
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching principal outstanding:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching principal outstanding data',
                error: error.message
            });
        }
    }

    // Get dashboard summary
    static async getDashboardSummary(req, res) {
        try {
            const query = `SELECT * FROM v_principal_outstanding_stats`;
            const [stats] = await sequelize.query(query);

            // Get top 5 highest outstanding loans
            const topLoansQuery = `
                SELECT 
                    loan_number,
                    client_name,
                    principal_balance,
                    principal_variance,
                    risk_category,
                    branch
                FROM v_principal_outstanding_detailed
                WHERE principal_balance > 0
                ORDER BY principal_balance DESC
                LIMIT 5
            `;
            const [topLoans] = await sequelize.query(topLoansQuery);

            // Get performance distribution
            const performanceQuery = `
                SELECT 
                    principal_performance_status,
                    COUNT(*) as count,
                    SUM(principal_balance) as total_amount
                FROM v_principal_outstanding_detailed
                GROUP BY principal_performance_status
                ORDER BY total_amount DESC
            `;
            const [performanceData] = await sequelize.query(performanceQuery);

            // Get risk distribution
            const riskQuery = `
                SELECT 
                    risk_category,
                    COUNT(*) as count,
                    SUM(principal_balance) as total_amount
                FROM v_principal_outstanding_detailed
                GROUP BY risk_category
                ORDER BY total_amount DESC
            `;
            const [riskData] = await sequelize.query(riskQuery);

            res.status(200).json({
                success: true,
                data: {
                    summary: stats[0],
                    topOutstandingLoans: topLoans,
                    performanceDistribution: performanceData,
                    riskDistribution: riskData,
                    timestamp: new Date().toISOString()
                }
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

    // Get branch-wise summary
    static async getBranchSummary(req, res) {
        try {
            const query = `
                SELECT * FROM v_principal_outstanding_by_branch
                ORDER BY total_principal_outstanding DESC
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

    // Get officer-wise summary
    static async getOfficerSummary(req, res) {
        try {
            const { branch } = req.query;
            
            let whereClause = '';
            if (branch && branch !== 'all') {
                whereClause = `WHERE branch = '${branch}'`;
            }

            const query = `
                SELECT * FROM v_principal_outstanding_by_officer
                ${whereClause}
                ORDER BY critically_behind_count DESC, total_principal_outstanding DESC
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

    // Get loans by risk category
    static async getLoansByRisk(req, res) {
        try {
            const { risk, limit = 50, offset = 0 } = req.query;

            const validRiskLevels = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL_RISK', 'FULLY_PAID', 'CLOSED'];
            if (!validRiskLevels.includes(risk)) {
                return res.status(400).json({
                    success: false,
                                        message: 'Invalid risk level. Use: LOW_RISK, MEDIUM_RISK, HIGH_RISK, CRITICAL_RISK, FULLY_PAID, CLOSED'
                });
            }

            const query = `
                SELECT 
                    loan_id,
                    loan_number,
                    client_name,
                    client_mobile,
                    principal_balance,
                    principal_variance,
                    payment_compliance_percentage,
                    days_since_last_payment,
                    loan_officer_name,
                    branch,
                    status_category
                FROM v_principal_outstanding_detailed
                WHERE risk_category = '${risk}'
                ORDER BY principal_balance DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [results] = await sequelize.query(query);

            // Get count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM v_principal_outstanding_detailed 
                WHERE risk_category = '${risk}'
            `;
            const [countResult] = await sequelize.query(countQuery);

            res.status(200).json({
                success: true,
                data: {
                    loans: results,
                    riskLevel: risk,
                    total: countResult[0].total,
                    pagination: {
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching loans by risk:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching loans by risk category',
                error: error.message
            });
        }
    }

    // Get payment history for a specific loan
    static async getLoanPaymentHistory(req, res) {
        try {
            const { loanId } = req.params;

            const query = `
                SELECT 
                    lp.id,
                    lp.payment_number,
                    lp.payment_date,
                    lp.amount,
                    lp.principal_amount,
                    lp.interest_amount,
                    lp.fees_amount,
                    lp.penalty_amount,
                    lp.payment_method,
                    lp.payment_reference,
                    lp.receipt_number,
                    lp.payment_status,
                    lp.loan_balance_after,
                    lp.principal_balance_after,
                    lp.interest_balance_after,
                    lp.days_late,
                    lp.late_fee_charged,
                    CONCAT(u.first_name, ' ', u.last_name) as received_by_name
                FROM loan_payments lp
                LEFT JOIN users u ON lp.received_by = u.id
                WHERE lp.loan_id = ${parseInt(loanId)}
                ORDER BY lp.payment_date DESC, lp.created_at DESC
            `;

            const [payments] = await sequelize.query(query);

            // Get loan summary
            const loanQuery = `
                SELECT 
                    loan_number,
                    client_name,
                    principal_amount,
                    principal_paid,
                    principal_balance,
                    total_payments_count,
                    total_amount_paid
                FROM v_principal_outstanding_detailed
                WHERE loan_id = ${parseInt(loanId)}
            `;

            const [loanInfo] = await sequelize.query(loanQuery);

            res.status(200).json({
                success: true,
                data: {
                    loanInfo: loanInfo[0] || null,
                    payments,
                    totalPayments: payments.length
                }
            });

        } catch (error) {
            console.error('Error fetching payment history:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payment history',
                error: error.message
            });
        }
    }

    // Get filter options
    static async getFilterOptions(req, res) {
        try {
            // Get unique branches
            const branchQuery = `
                SELECT DISTINCT branch 
                FROM v_principal_outstanding_detailed 
                WHERE branch IS NOT NULL 
                ORDER BY branch
            `;
            const [branches] = await sequelize.query(branchQuery);

            // Get unique loan officers
            const officerQuery = `
                SELECT DISTINCT 
                    loan_officer_id,
                    loan_officer_name,
                    branch
                FROM v_principal_outstanding_detailed 
                WHERE loan_officer_id IS NOT NULL 
                ORDER BY loan_officer_name
            `;
            const [officers] = await sequelize.query(officerQuery);

            // Get status options
            const statusOptions = [
                'ACTIVE', 'DISBURSED', 'PAST_MATURITY', 'IN_ARREARS', 
                'COMPLETED', 'DEFAULTED', 'WRITTEN_OFF'
            ];

            // Get risk category options
            const riskOptions = [
                'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL_RISK', 
                'FULLY_PAID', 'CLOSED'
            ];

            // Get performance status options
            const performanceOptions = [
                'ON_TRACK', 'SLIGHTLY_BEHIND', 'MODERATELY_BEHIND', 
                'SIGNIFICANTLY_BEHIND', 'CRITICALLY_BEHIND', 'NO_PAYMENT_DUE'
            ];

            res.status(200).json({
                success: true,
                data: {
                    branches: branches.map(b => b.branch),
                    officers,
                    statusOptions,
                    riskOptions,
                    performanceOptions
                }
            });

        } catch (error) {
            console.error('Error fetching filter options:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching filter options',
                error: error.message
            });
        }
    }

    // Export principal outstanding data
    static async exportData(req, res) {
        try {
            const {
                status,
                riskCategory,
                performanceStatus,
                branch,
                format = 'json'
            } = req.query;

            let whereConditions = [];

            if (status && status !== 'all') {
                whereConditions.push(`status_category = '${status}'`);
            }

            if (riskCategory && riskCategory !== 'all') {
                whereConditions.push(`risk_category = '${riskCategory}'`);
            }

            if (performanceStatus && performanceStatus !== 'all') {
                whereConditions.push(`principal_performance_status = '${performanceStatus}'`);
            }

            if (branch && branch !== 'all') {
                whereConditions.push(`branch = '${branch}'`);
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            const query = `
                SELECT 
                    loan_number as "Loan#",
                    client_name as "Name",
                    released_amount as "Released",
                    maturity_date as "Maturity",
                    principal_amount as "Principal",
                    principal_paid as "Principal Paid",
                    principal_balance as "Principal Balance",
                    principal_due_till_today as "Principal Due Till Today",
                    principal_paid_till_today as "Principal Paid Till Today",
                    principal_balance_till_today as "Principal Balance Till Today",
                    status_category as "Status",
                    risk_category as "Risk Category",
                    principal_performance_status as "Performance Status",
                    payment_compliance_percentage as "Payment Compliance %",
                    branch as "Branch",
                    loan_officer_name as "Loan Officer"
                FROM v_principal_outstanding_detailed
                ${whereClause}
                ORDER BY principal_balance DESC
            `;

            const [results] = await sequelize.query(query);

            if (format === 'csv') {
                // Convert to CSV
                const csv = convertToCSV(results);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=principal_outstanding.csv');
                res.send(csv);
            } else {
                res.status(200).json({
                    success: true,
                    data: results,
                    exportedAt: new Date().toISOString(),
                    totalRecords: results.length
                });
            }

        } catch (error) {
            console.error('Error exporting data:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting data',
                error: error.message
            });
        }
    }

    // Test endpoint
    static async test(req, res) {
        try {
            const testQuery = `SELECT COUNT(*) as count FROM v_principal_outstanding_summary`;
            const [result] = await sequelize.query(testQuery);

            res.status(200).json({
                success: true,
                message: 'Principal Outstanding routes working',
                data: {
                    totalLoans: result[0].count,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Test error:', error);
            res.status(500).json({
                success: false,
                message: 'Error testing principal outstanding routes',
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

module.exports = PrincipalOutstandingController;
