const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

const getDueLoans = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        console.log('📅 Fetching due loans for date range');
        console.log('Query params:', req.query);

        const {
            start_date,
            end_date,
            page = 1,
            limit = 20,
            status = 'all',
            loan_officer_id,
            branch,
            performance_class,
            search,
            sort_by = 'due_date',
            sort_order = 'ASC'
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];
        let summaryReplacements = []; // Separate array for summary query
        const conditions = [];

        // Date range filter
        if (start_date && end_date) {
            conditions.push('ls.due_date BETWEEN ? AND ?');
            replacements.push(start_date, end_date);
            summaryReplacements.push(start_date, end_date);
        } else if (start_date) {
            conditions.push('ls.due_date >= ?');
            replacements.push(start_date);
            summaryReplacements.push(start_date);
        } else if (end_date) {
            conditions.push('ls.due_date <= ?');
            replacements.push(end_date);
            summaryReplacements.push(end_date);
        }

        // Status filters
        if (status === 'overdue') {
            conditions.push('ls.due_date < CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else if (status === 'due_today') {
            conditions.push('ls.due_date = CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else if (status === 'due_soon') {
            conditions.push('ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else if (status !== 'all' && status !== '') {
            conditions.push('ls.status = ?');
            replacements.push(status);
            summaryReplacements.push(status);
        }

        // Only include active loans
        conditions.push('l.status IN (?, ?)');
        replacements.push('active', 'disbursed');
        summaryReplacements.push('active', 'disbursed');

        // Additional filters
        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
            summaryReplacements.push(loan_officer_id);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
            summaryReplacements.push(branch);
        }

        if (performance_class) {
            conditions.push('l.performance_class = ?');
            replacements.push(performance_class);
            summaryReplacements.push(performance_class);
        }

        if (search) {
            conditions.push('(l.loan_number LIKE ? OR l.loan_account LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.client_number LIKE ?)');
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            summaryReplacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        // Validate sort parameters
        const allowedSortFields = ['due_date', 'loan_number', 'client_name', 'total_due', 'days_overdue', 'performance_class'];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'due_date';
        const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total 
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements: summaryReplacements });

        const total = countResult[0].total;

        // Build the main query
        let orderByClause = '';
        if (sortField === 'client_name') {
            orderByClause = `ORDER BY c.first_name ${sortDirection}, c.last_name ${sortDirection}`;
        } else if (sortField === 'days_overdue') {
            orderByClause = `ORDER BY CASE 
                WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date) 
                ELSE 0 
            END ${sortDirection}`;
        } else {
            orderByClause = `ORDER BY ${sortField === 'total_due' ? 'ls.total_due' : `ls.${sortField}`} ${sortDirection}`;
        }

        // Add pagination parameters to main query replacements
        const mainQueryReplacements = [...replacements, parseInt(limit), parseInt(offset)];

        // Get due loans with comprehensive details
        const [dueLoans] = await sequelize.query(`
            SELECT 
                ls.id as schedule_id,
                ls.installment_number,
                ls.due_date,
                ls.principal_due,
                ls.interest_due,
                ls.total_due,
                ls.principal_paid,
                ls.interest_paid,
                ls.total_paid,
                ls.penalty_amount,
                ls.status as schedule_status,
                (ls.total_due - ls.total_paid) as outstanding_amount,
                CASE 
                    WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date)
                    ELSE 0 
                END as days_overdue,
                CASE 
                    WHEN ls.due_date < CURDATE() THEN 'Overdue'
                    WHEN ls.due_date = CURDATE() THEN 'Due Today'
                    WHEN ls.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due Soon'
                    ELSE 'Future'
                END as due_status,
                
                -- Loan details
                l.id as loan_id,
                l.loan_number,
                l.loan_account,
                l.applied_amount,
                l.disbursed_amount,
                l.loan_balance,
                l.performance_class,
                l.branch,
                l.disbursement_date,
                
                -- Client details
                c.id as client_id,
                c.client_number,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.mobile as client_mobile,
                c.email as client_email,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                
                -- Loan officer details
                u.first_name as officer_first_name,
                u.last_name as officer_last_name,
                u.employee_id as officer_employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as officer_name
                
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            ${whereClause}
            ${orderByClause}
            LIMIT ? OFFSET ?
        `, {
            replacements: mainQueryReplacements
        });

        // Calculate summary statistics using the same where clause but different replacements
        const [summaryResult] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_schedules,
                SUM(ls.total_due - ls.total_paid) as total_outstanding,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as overdue_amount,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as due_today_count,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_today_amount,
                SUM(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as due_soon_count,
                SUM(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_soon_amount
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements: summaryReplacements });

        const summary = summaryResult[0];

        console.log(`📊 Found ${dueLoans.length} due loan schedules`);

        res.status(200).json({
            success: true,
            data: {
                due_loans: dueLoans,
                summary: {
                    total_schedules: parseInt(summary.total_schedules),
                    total_outstanding: parseFloat(summary.total_outstanding || 0),
                    overdue: {
                        count: parseInt(summary.overdue_count),
                        amount: parseFloat(summary.overdue_amount || 0)
                    },
                    due_today: {
                        count: parseInt(summary.due_today_count),
                        amount: parseFloat(summary.due_today_amount || 0)
                    },
                    due_soon: {
                        count: parseInt(summary.due_soon_count),
                        amount: parseFloat(summary.due_soon_amount || 0)
                    }
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters_applied: {
                    start_date,
                    end_date,
                    status,
                    loan_officer_id,
                    branch,
                    performance_class,
                    search
                }
            }
        });

    } catch (error) {
        console.error('Get due loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching due loans',
            error: error.message
        });
    }
};

// Rest of your controller functions remain the same...
const getDueLoansSummary = async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            loan_officer_id,
            branch
        } = req.query;

        let whereClause = '';
        let replacements = [];
        const conditions = [];

        // Date range filter
        if (start_date && end_date) {
            conditions.push('ls.due_date BETWEEN ? AND ?');
            replacements.push(start_date, end_date);
        }

        // Only include active loans
        conditions.push('l.status IN (?, ?)');
        replacements.push('active', 'disbursed');

        // Additional filters
        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        // Get comprehensive summary
        const [summaryResult] = await sequelize.query(`
            SELECT 
                -- Overall totals
                COUNT(DISTINCT l.id) as total_loans,
                COUNT(*) as total_schedules,
                SUM(ls.total_due) as total_due_amount,
                SUM(ls.total_paid) as total_paid_amount,
                SUM(ls.total_due - ls.total_paid) as total_outstanding,
                
                -- Overdue analysis
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as overdue_amount,
                COUNT(DISTINCT CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as overdue_loans,
                
                -- Due today
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as due_today_schedules,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_today_amount,
                COUNT(DISTINCT CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as due_today_loans,
                
                -- Due this week
                                SUM(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 ELSE 0 END) as due_week_schedules,
                SUM(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_week_amount,
                COUNT(DISTINCT CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN l.id END) as due_week_loans,
                
                -- Performance classification
                SUM(CASE WHEN l.performance_class = 'performing' THEN (ls.total_due - ls.total_paid) ELSE 0 END) as performing_amount,
                SUM(CASE WHEN l.performance_class = 'watch' THEN (ls.total_due - ls.total_paid) ELSE 0 END) as watch_amount,
                SUM(CASE WHEN l.performance_class = 'substandard' THEN (ls.total_due - ls.total_paid) ELSE 0 END) as substandard_amount,
                SUM(CASE WHEN l.performance_class = 'doubtful' THEN (ls.total_due - ls.total_paid) ELSE 0 END) as doubtful_amount,
                SUM(CASE WHEN l.performance_class = 'loss' THEN (ls.total_due - ls.total_paid) ELSE 0 END) as loss_amount
                
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `, { replacements });

        const summary = summaryResult[0];

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    total_loans: parseInt(summary.total_loans),
                    total_schedules: parseInt(summary.total_schedules),
                    total_due_amount: parseFloat(summary.total_due_amount || 0),
                    total_paid_amount: parseFloat(summary.total_paid_amount || 0),
                    total_outstanding: parseFloat(summary.total_outstanding || 0),
                    
                    overdue: {
                        loans: parseInt(summary.overdue_loans),
                        schedules: parseInt(summary.overdue_schedules),
                        amount: parseFloat(summary.overdue_amount || 0)
                    },
                    
                    due_today: {
                        loans: parseInt(summary.due_today_loans),
                        schedules: parseInt(summary.due_today_schedules),
                        amount: parseFloat(summary.due_today_amount || 0)
                    },
                    
                    due_week: {
                        loans: parseInt(summary.due_week_loans),
                        schedules: parseInt(summary.due_week_schedules),
                        amount: parseFloat(summary.due_week_amount || 0)
                    },
                    
                    by_performance: {
                        performing: parseFloat(summary.performing_amount || 0),
                        watch: parseFloat(summary.watch_amount || 0),
                        substandard: parseFloat(summary.substandard_amount || 0),
                        doubtful: parseFloat(summary.doubtful_amount || 0),
                        loss: parseFloat(summary.loss_amount || 0)
                    }
                },
                filters_applied: {
                    start_date,
                    end_date,
                    loan_officer_id,
                    branch
                }
            }
        });

    } catch (error) {
        console.error('Get due loans summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching due loans summary',
            error: error.message
        });
    }
};

const updateOverdueLoans = async (req, res) => {
    try {
        console.log('🔄 Updating overdue loan performance classifications...');

        // Update loan performance classifications based on days overdue
        const [updateResult] = await sequelize.query(`
            UPDATE loans l
            SET performance_class = CASE 
                WHEN l.days_in_arrears = 0 THEN 'performing'
                WHEN l.days_in_arrears BETWEEN 1 AND 30 THEN 'watch'
                WHEN l.days_in_arrears BETWEEN 31 AND 90 THEN 'substandard'
                WHEN l.days_in_arrears BETWEEN 91 AND 180 THEN 'doubtful'
                WHEN l.days_in_arrears > 180 THEN 'loss'
                ELSE l.performance_class
            END,
            updated_at = NOW()
            WHERE l.status IN ('active', 'disbursed')
        `);

        // Update days in arrears for all active loans
        await sequelize.query(`
            UPDATE loans l
            SET days_in_arrears = COALESCE((
                SELECT MAX(CASE 
                    WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') 
                    THEN DATEDIFF(CURDATE(), ls.due_date)
                    ELSE 0 
                END)
                FROM loan_schedules ls 
                WHERE ls.loan_id = l.id
            ), 0),
            arrears_start_date = CASE 
                WHEN l.days_in_arrears = 0 THEN NULL
                WHEN l.arrears_start_date IS NULL AND l.days_in_arrears > 0 THEN (
                    SELECT MIN(ls.due_date)
                    FROM loan_schedules ls 
                    WHERE ls.loan_id = l.id 
                    AND ls.due_date < CURDATE() 
                    AND ls.status IN ('pending', 'partial')
                )
                ELSE l.arrears_start_date
            END,
            updated_at = NOW()
            WHERE l.status IN ('active', 'disbursed')
        `);

        console.log('✅ Loan performance classifications updated successfully');

        res.status(200).json({
            success: true,
            message: 'Overdue loan statuses updated successfully',
            data: {
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Update overdue loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating overdue loan statuses',
            error: error.message
        });
    }
};

const exportDueLoans = async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            format = 'csv',
            status,
            loan_officer_id,
            branch,
            performance_class,
            search
        } = req.query;

        let whereClause = '';
        let replacements = [];
        const conditions = [];

        // Build the same where clause as getDueLoans
        if (start_date && end_date) {
            conditions.push('ls.due_date BETWEEN ? AND ?');
            replacements.push(start_date, end_date);
        }

        // Status filters
        if (status === 'overdue') {
            conditions.push('ls.due_date < CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
        } else if (status === 'due_today') {
            conditions.push('ls.due_date = CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
        } else if (status === 'due_soon') {
            conditions.push('ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
        } else if (status !== 'all' && status !== '') {
            conditions.push('ls.status = ?');
            replacements.push(status);
        }

        conditions.push('l.status IN (?, ?)');
        replacements.push('active', 'disbursed');

        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (performance_class) {
            conditions.push('l.performance_class = ?');
            replacements.push(performance_class);
        }

        if (search) {
            conditions.push('(l.loan_number LIKE ? OR l.loan_account LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.client_number LIKE ?)');
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        // Get export data
        const [exportData] = await sequelize.query(`
            SELECT 
                l.loan_number as 'Loan Number',
                l.loan_account as 'Loan Account',
                CONCAT(c.first_name, ' ', c.last_name) as 'Client Name',
                c.client_number as 'Client Number',
                c.mobile as 'Client Mobile',
                ls.due_date as 'Due Date',
                ls.installment_number as 'Installment #',
                ls.principal_due as 'Principal Due',
                ls.interest_due as 'Interest Due',
                ls.total_due as 'Total Due',
                ls.principal_paid as 'Principal Paid',
                ls.interest_paid as 'Interest Paid',
                ls.total_paid as 'Total Paid',
                (ls.total_due - ls.total_paid) as 'Outstanding Amount',
                ls.penalty_amount as 'Penalty Amount',
                ls.status as 'Schedule Status',
                CASE 
                    WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date)
                    ELSE 0 
                END as 'Days Overdue',
                CASE 
                    WHEN ls.due_date < CURDATE() THEN 'Overdue'
                    WHEN ls.due_date = CURDATE() THEN 'Due Today'
                    WHEN ls.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due Soon'
                    ELSE 'Future'
                END as 'Due Status',
                l.performance_class as 'Performance Class',
                l.branch as 'Branch',
                CONCAT(u.first_name, ' ', u.last_name) as 'Loan Officer',
                l.disbursement_date as 'Disbursement Date',
                l.loan_balance as 'Loan Balance'
                
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            ${whereClause}
            ORDER BY ls.due_date ASC, c.first_name ASC
        `, { replacements });

        if (format === 'csv') {
            // Convert to CSV
            if (exportData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No data found for export'
                });
            }

            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(','),
                ...exportData.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        // Handle null/undefined values and escape commas
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'string' && value.includes(',')) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    }).join(',')
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="due-loans-${start_date}-to-${end_date}.csv"`);
            res.send(csvContent);
        } else {
            // Return JSON
            res.status(200).json({
                success: true,
                data: exportData,
                export_info: {
                    total_records: exportData.length,
                    exported_at: new Date().toISOString(),
                    filters: {
                        start_date,
                        end_date,
                        status,
                        loan_officer_id,
                        branch,
                        performance_class,
                        search
                    }
                }
            });
        }

    } catch (error) {
        console.error('Export due loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting due loans data',
            error: error.message
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        console.log('📊 Fetching dashboard statistics...');

        // Get current date stats
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [dashboardStats] = await sequelize.query(`
            SELECT 
                -- Today's due loans
                COUNT(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as due_today_count,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_today_amount,
                
                -- Overdue loans
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_count,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as overdue_amount,
                
                -- Due this week
                COUNT(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 END) as due_week_count,
                SUM(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as due_week_amount,
                
                                -- Total active portfolio
                COUNT(DISTINCT l.id) as total_active_loans,
                SUM(l.loan_balance) as total_portfolio_balance,
                
                -- Performance breakdown
                COUNT(CASE WHEN l.performance_class = 'performing' THEN 1 END) as performing_loans,
                COUNT(CASE WHEN l.performance_class = 'watch' THEN 1 END) as watch_loans,
                COUNT(CASE WHEN l.performance_class = 'substandard' THEN 1 END) as substandard_loans,
                COUNT(CASE WHEN l.performance_class = 'doubtful' THEN 1 END) as doubtful_loans,
                COUNT(CASE WHEN l.performance_class = 'loss' THEN 1 END) as loss_loans,
                
                -- Collection efficiency
                SUM(ls.total_paid) as total_collected,
                SUM(ls.total_due) as total_scheduled,
                
                -- Average days in arrears
                AVG(CASE WHEN l.days_in_arrears > 0 THEN l.days_in_arrears ELSE NULL END) as avg_days_in_arrears
                
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE l.status IN ('active', 'disbursed')
        `);

        const stats = dashboardStats[0];

        // Calculate collection rate
        const collectionRate = stats.total_scheduled > 0 
            ? (stats.total_collected / stats.total_scheduled * 100) 
            : 0;

        // Get branch-wise breakdown
        const [branchStats] = await sequelize.query(`
            SELECT 
                l.branch,
                COUNT(DISTINCT l.id) as loan_count,
                SUM(l.loan_balance) as portfolio_balance,
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as overdue_amount
            FROM loans l
            LEFT JOIN loan_schedules ls ON l.id = ls.loan_id
            WHERE l.status IN ('active', 'disbursed')
            GROUP BY l.branch
            ORDER BY portfolio_balance DESC
        `);

        // Get loan officer performance
        const [officerStats] = await sequelize.query(`
            SELECT 
                u.id as officer_id,
                CONCAT(u.first_name, ' ', u.last_name) as officer_name,
                u.employee_id,
                COUNT(DISTINCT l.id) as loan_count,
                SUM(l.loan_balance) as portfolio_balance,
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) ELSE 0 END) as overdue_amount,
                AVG(CASE WHEN l.days_in_arrears > 0 THEN l.days_in_arrears ELSE NULL END) as avg_days_in_arrears
            FROM users u
            JOIN loans l ON u.id = l.loan_officer_id
            LEFT JOIN loan_schedules ls ON l.id = ls.loan_id
            WHERE l.status IN ('active', 'disbursed')
            AND u.role = 'loan-officer'
            GROUP BY u.id, u.first_name, u.last_name, u.employee_id
            ORDER BY portfolio_balance DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    due_today: {
                        count: parseInt(stats.due_today_count || 0),
                        amount: parseFloat(stats.due_today_amount || 0)
                    },
                    overdue: {
                        count: parseInt(stats.overdue_count || 0),
                        amount: parseFloat(stats.overdue_amount || 0)
                    },
                    due_this_week: {
                        count: parseInt(stats.due_week_count || 0),
                        amount: parseFloat(stats.due_week_amount || 0)
                    },
                    portfolio: {
                        total_loans: parseInt(stats.total_active_loans || 0),
                        total_balance: parseFloat(stats.total_portfolio_balance || 0),
                        collection_rate: parseFloat(collectionRate.toFixed(2)),
                        avg_days_in_arrears: parseFloat(stats.avg_days_in_arrears || 0)
                    }
                },
                performance_breakdown: {
                    performing: parseInt(stats.performing_loans || 0),
                    watch: parseInt(stats.watch_loans || 0),
                    substandard: parseInt(stats.substandard_loans || 0),
                    doubtful: parseInt(stats.doubtful_loans || 0),
                    loss: parseInt(stats.loss_loans || 0)
                },
                branch_performance: branchStats.map(branch => ({
                    branch: branch.branch || 'Unknown',
                    loan_count: parseInt(branch.loan_count || 0),
                    portfolio_balance: parseFloat(branch.portfolio_balance || 0),
                    overdue_schedules: parseInt(branch.overdue_schedules || 0),
                    overdue_amount: parseFloat(branch.overdue_amount || 0),
                    overdue_rate: branch.loan_count > 0 
                        ? parseFloat((branch.overdue_schedules / branch.loan_count * 100).toFixed(2))
                        : 0
                })),
                officer_performance: officerStats.map(officer => ({
                    officer_id: officer.officer_id,
                    officer_name: officer.officer_name,
                    employee_id: officer.employee_id,
                    loan_count: parseInt(officer.loan_count || 0),
                    portfolio_balance: parseFloat(officer.portfolio_balance || 0),
                    overdue_schedules: parseInt(officer.overdue_schedules || 0),
                    overdue_amount: parseFloat(officer.overdue_amount || 0),
                    avg_days_in_arrears: parseFloat(officer.avg_days_in_arrears || 0),
                    overdue_rate: officer.loan_count > 0 
                        ? parseFloat((officer.overdue_schedules / officer.loan_count * 100).toFixed(2))
                        : 0
                })),
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

module.exports = {
    getDueLoans,
    getDueLoansSummary,
    updateOverdueLoans,
    exportDueLoans,
    getDashboardStats
};
