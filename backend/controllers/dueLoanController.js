const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');

const getDueLoansWithoutDateRange = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        console.log('📅 Fetching due loans (loan-level data)');
        const { page = 1, limit = 20, status = 'all', loan_officer_id, branch, performance_class, search, sort_by = 'due_date', sort_order = 'ASC' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = '';
        let replacements = [];
        let summaryReplacements = [];
        const conditions = [];

        // Modified date filter to include your future dates
        if (status === 'overdue') {
            conditions.push('ls.due_date < CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else if (status === 'due_today') {
            conditions.push('ls.due_date = CURDATE() AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else if (status === 'due_soon') {
            conditions.push('ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        } else {
            // DEFAULT: Show overdue + next 365 days to include your 2025 dates
            conditions.push('(ls.due_date <= DATE_ADD(CURDATE(), INTERVAL 365 DAY) OR ls.due_date < CURDATE()) AND ls.status IN (?, ?)');
            replacements.push('pending', 'partial');
            summaryReplacements.push('pending', 'partial');
        }

        // Include 'pending' loans
        conditions.push('l.status IN (?, ?, ?)');
        replacements.push('pending', 'active', 'disbursed');
        summaryReplacements.push('pending', 'active', 'disbursed');

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

        // Get total count of LOANS (not schedules)
        const countQuery = `
            SELECT COUNT(DISTINCT l.id) as total 
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `;
        const countResult = await sequelize.query(countQuery, { 
            replacements: summaryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });
        const total = countResult[0].total;

        // Build the main query - GROUP BY LOAN
        const mainQuery = `
            SELECT 
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
                l.maturity_date,
                l.status as loan_status,
                
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
                CONCAT(u.first_name, ' ', u.last_name) as officer_name,
                
                -- Aggregated schedule data for this loan
                COUNT(ls.id) as total_schedules,
                SUM(ls.principal_due) as total_principal_due,
                SUM(ls.interest_due) as total_interest_due,
                SUM(ls.total_due) as total_amount_due,
                SUM(ls.principal_paid) as total_principal_paid,
                SUM(ls.interest_paid) as total_interest_paid,
                SUM(ls.total_paid) as total_amount_paid,
                SUM(ls.total_due - ls.total_paid) as total_outstanding,
                
                -- Next due date and amount
                MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END) as next_due_date,
                MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.total_due - ls.total_paid END) as next_due_amount,
                
                -- Overdue information
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as overdue_amount,
                MAX(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END) as days_overdue,
                
                -- Status determination
                CASE 
                    WHEN COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Overdue'
                    WHEN COUNT(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Due Today'
                    WHEN COUNT(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Due Soon'
                    ELSE 'Future'
                END as due_status,
                
                -- Last payment info
                MAX(ls.payment_date) as last_payment_date,
                SUM(CASE WHEN ls.payment_date = (SELECT MAX(payment_date) FROM loan_schedules WHERE loan_id = l.id) THEN ls.total_paid ELSE 0 END) as last_payment_amount
                
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            LEFT JOIN users u ON l.loan_officer_id = u.id 
            ${whereClause} 
            GROUP BY l.id, l.loan_number, l.loan_account, l.applied_amount, l.disbursed_amount, l.loan_balance, 
                     l.performance_class, l.branch, l.disbursement_date, l.maturity_date, l.status,
                     c.id, c.client_number, c.first_name, c.last_name, c.mobile, c.email,
                     u.id, u.first_name, u.last_name, u.employee_id
            ORDER BY 
                CASE 
                    WHEN '${sort_by}' = 'client_name' THEN c.first_name
                    WHEN '${sort_by}' = 'loan_number' THEN l.loan_number
                    WHEN '${sort_by}' = 'next_due_date' THEN MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END)
                    WHEN '${sort_by}' = 'total_outstanding' THEN SUM(ls.total_due - ls.total_paid)
                    WHEN '${sort_by}' = 'days_overdue' THEN MAX(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END)
                    ELSE MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END)
                END ${sort_order}
            LIMIT ? OFFSET ?
        `;

        const mainQueryReplacements = [...replacements, parseInt(limit), parseInt(offset)];
        const dueLoans = await sequelize.query(mainQuery, { 
            replacements: mainQueryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });

        // Calculate summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT l.id) as total_loans,
                COUNT(ls.id) as total_schedules, 
                SUM(ls.total_due - ls.total_paid) as total_outstanding, 
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as overdue_amount, 
                COUNT(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as due_today_schedules,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as due_today_amount, 
                COUNT(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 END) as due_soon_schedules,
                SUM(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as due_soon_amount,
                
                -- Loan-level counts
                COUNT(DISTINCT CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as overdue_loans,
                COUNT(DISTINCT CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as due_today_loans,
                COUNT(DISTINCT CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN l.id END) as due_soon_loans
                
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `;

        const summaryResult = await sequelize.query(summaryQuery, { 
            replacements: summaryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });
        const summary = summaryResult[0];

        console.log(`📊 Found ${dueLoans.length} loans with due schedules`);
        res.status(200).json({
            success: true,
            data: {
                due_loans: dueLoans.map(loan => ({
                    // Loan information
                    loan_id: loan.loan_id,
                    loan_number: loan.loan_number,
                    loan_account: loan.loan_account,
                    loan_status: loan.loan_status,
                    applied_amount: parseFloat(loan.applied_amount || 0),
                    disbursed_amount: parseFloat(loan.disbursed_amount || 0),
                    loan_balance: parseFloat(loan.loan_balance || 0),
                    performance_class: loan.performance_class,
                    branch: loan.branch,
                    disbursement_date: loan.disbursement_date,
                    maturity_date: loan.maturity_date,
                    
                    // Client information
                    client_id: loan.client_id,
                    client_number: loan.client_number,
                    client_name: loan.client_name,
                    client_first_name: loan.client_first_name,
                    client_last_name: loan.client_last_name,
                    client_mobile: loan.client_mobile,
                    client_email: loan.client_email,
                    
                    // Loan officer information
                    officer_name: loan.officer_name,
                    officer_employee_id: loan.officer_employee_id,
                    
                    // Schedule aggregations
                    total_schedules: parseInt(loan.total_schedules || 0),
                    total_principal_due: parseFloat(loan.total_principal_due || 0),
                    total_interest_due: parseFloat(loan.total_interest_due || 0),
                    total_amount_due: parseFloat(loan.total_amount_due || 0),
                    total_principal_paid: parseFloat(loan.total_principal_paid || 0),
                    total_interest_paid: parseFloat(loan.total_interest_paid || 0),
                    total_amount_paid: parseFloat(loan.total_amount_paid || 0),
                    total_outstanding: parseFloat(loan.total_outstanding || 0),
                    
                                        // Next due information
                    next_due_date: loan.next_due_date,
                    next_due_amount: parseFloat(loan.next_due_amount || 0),
                    
                    // Overdue information
                    overdue_schedules: parseInt(loan.overdue_schedules || 0),
                    overdue_amount: parseFloat(loan.overdue_amount || 0),
                    days_overdue: parseInt(loan.days_overdue || 0),
                    due_status: loan.due_status,
                    
                    // Payment information
                    last_payment_date: loan.last_payment_date,
                    last_payment_amount: parseFloat(loan.last_payment_amount || 0)
                })),
                summary: {
                    total_loans: parseInt(summary.total_loans || 0),
                    total_schedules: parseInt(summary.total_schedules || 0),
                    total_outstanding: parseFloat(summary.total_outstanding || 0),
                    overdue: {
                        loans: parseInt(summary.overdue_loans || 0),
                        schedules: parseInt(summary.overdue_schedules || 0),
                        amount: parseFloat(summary.overdue_amount || 0)
                    },
                    due_today: {
                        loans: parseInt(summary.due_today_loans || 0),
                        schedules: parseInt(summary.due_today_schedules || 0),
                        amount: parseFloat(summary.due_today_amount || 0)
                    },
                    due_soon: {
                        loans: parseInt(summary.due_soon_loans || 0),
                        schedules: parseInt(summary.due_soon_schedules || 0),
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
        res.status(500).json({ success: false, message: 'Error fetching due loans', error: error.message });
    }
};





const getDueLoansWithDateRange = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        console.log('📅 Fetching due loans for date range (loan-level data)');
        const { start_date, end_date, page = 1, limit = 20, status = 'all', loan_officer_id, branch, performance_class, search, sort_by = 'next_due_date', sort_order = 'ASC' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = '';
        let replacements = [];
        let summaryReplacements = [];
        const conditions = [];

        // Date range filter
        if (start_date && end_date) {
            conditions.push('ls.due_date BETWEEN ? AND ?');
            replacements.push(start_date, end_date);
            summaryReplacements.push(start_date, end_date);
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
        conditions.push('l.status IN (?, ?, ?)');
        replacements.push('pending', 'active', 'disbursed');
        summaryReplacements.push('pending', 'active', 'disbursed');

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

        // Get total count of LOANS (not schedules)
        const countQuery = `
            SELECT COUNT(DISTINCT l.id) as total 
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `;
        const countResult = await sequelize.query(countQuery, { 
            replacements: summaryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });
        const total = countResult[0].total;

        // Use the same main query as the other function
        const mainQuery = `
            SELECT 
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
                l.maturity_date,
                l.status as loan_status,
                
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
                CONCAT(u.first_name, ' ', u.last_name) as officer_name,
                
                -- Aggregated schedule data for this loan
                COUNT(ls.id) as total_schedules,
                SUM(ls.principal_due) as total_principal_due,
                SUM(ls.interest_due) as total_interest_due,
                SUM(ls.total_due) as total_amount_due,
                SUM(ls.principal_paid) as total_principal_paid,
                SUM(ls.interest_paid) as total_interest_paid,
                SUM(ls.total_paid) as total_amount_paid,
                SUM(ls.total_due - ls.total_paid) as total_outstanding,
                
                -- Next due date and amount
                MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END) as next_due_date,
                MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.total_due - ls.total_paid END) as next_due_amount,
                
                -- Overdue information
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as overdue_amount,
                MAX(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END) as days_overdue,
                
                -- Status determination
                CASE 
                    WHEN COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Overdue'
                    WHEN COUNT(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Due Today'
                    WHEN COUNT(CASE WHEN ls.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 END) > 0 THEN 'Due Soon'
                    ELSE 'Future'
                END as due_status,
                
                -- Last payment info
                MAX(ls.payment_date) as last_payment_date,
                SUM(CASE WHEN ls.payment_date = (SELECT MAX(payment_date) FROM loan_schedules WHERE loan_id = l.id) THEN ls.total_paid ELSE 0 END) as last_payment_amount
                
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            LEFT JOIN users u ON l.loan_officer_id = u.id 
            ${whereClause} 
            GROUP BY l.id, l.loan_number, l.loan_account, l.applied_amount, l.disbursed_amount, l.loan_balance, 
                     l.performance_class, l.branch, l.disbursement_date, l.maturity_date, l.status,
                     c.id, c.client_number, c.first_name, c.last_name, c.mobile, c.email,
                     u.id, u.first_name, u.last_name, u.employee_id
            ORDER BY 
                CASE 
                    WHEN '${sort_by}' = 'client_name' THEN c.first_name
                    WHEN '${sort_by}' = 'loan_number' THEN l.loan_number
                    WHEN '${sort_by}' = 'next_due_date' THEN MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END)
                    WHEN '${sort_by}' = 'total_outstanding' THEN SUM(ls.total_due - ls.total_paid)
                    WHEN '${sort_by}' = 'days_overdue' THEN MAX(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END)
                    ELSE MIN(CASE WHEN ls.status IN ('pending', 'partial') THEN ls.due_date END)
                END ${sort_order}
            LIMIT ? OFFSET ?
        `;

        const mainQueryReplacements = [...replacements, parseInt(limit), parseInt(offset)];
        const dueLoans = await sequelize.query(mainQuery, { 
            replacements: mainQueryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });

        // Same summary query as the other function
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT l.id) as total_loans,
                COUNT(ls.id) as total_schedules, 
                SUM(ls.total_due - ls.total_paid) as total_outstanding, 
                COUNT(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as overdue_schedules,
                SUM(CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as overdue_amount, 
                COUNT(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 1 END) as due_today_schedules,
                SUM(CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as due_today_amount, 
                COUNT(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 1 END) as due_soon_schedules,
                SUM(CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN (ls.total_due - ls.total_paid) END) as due_soon_amount,
                
                -- Loan-level counts
                COUNT(DISTINCT CASE WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as overdue_loans,
                COUNT(DISTINCT CASE WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN l.id END) as due_today_loans,
                COUNT(DISTINCT CASE WHEN ls.due_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN l.id END) as due_soon_loans
                
            FROM loan_schedules ls 
            JOIN loans l ON ls.loan_id = l.id 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `;

        const summaryResult = await sequelize.query(summaryQuery, { 
            replacements: summaryReplacements, 
            type: sequelize.QueryTypes.SELECT 
        });
        const summary = summaryResult[0];

                console.log(`📊 Found ${dueLoans.length} loans with due schedules in date range`);
        
        res.status(200).json({
            success: true,
            data: {
                due_loans: dueLoans.map(loan => ({
                    // Loan information
                    loan_id: loan.loan_id,
                    loan_number: loan.loan_number,
                    loan_account: loan.loan_account,
                    loan_status: loan.loan_status,
                    applied_amount: parseFloat(loan.applied_amount || 0),
                    disbursed_amount: parseFloat(loan.disbursed_amount || 0),
                    loan_balance: parseFloat(loan.loan_balance || 0),
                    performance_class: loan.performance_class,
                    branch: loan.branch,
                    disbursement_date: loan.disbursement_date,
                    maturity_date: loan.maturity_date,
                    
                    // Client information
                    client_id: loan.client_id,
                    client_number: loan.client_number,
                    client_name: loan.client_name,
                    client_first_name: loan.client_first_name,
                    client_last_name: loan.client_last_name,
                    client_mobile: loan.client_mobile,
                    client_email: loan.client_email,
                    
                    // Loan officer information
                    officer_name: loan.officer_name,
                    officer_employee_id: loan.officer_employee_id,
                    
                    // Schedule aggregations
                    total_schedules: parseInt(loan.total_schedules || 0),
                    total_principal_due: parseFloat(loan.total_principal_due || 0),
                    total_interest_due: parseFloat(loan.total_interest_due || 0),
                    total_amount_due: parseFloat(loan.total_amount_due || 0),
                    total_principal_paid: parseFloat(loan.total_principal_paid || 0),
                    total_interest_paid: parseFloat(loan.total_interest_paid || 0),
                    total_amount_paid: parseFloat(loan.total_amount_paid || 0),
                    total_outstanding: parseFloat(loan.total_outstanding || 0),
                    
                    // Next due information
                    next_due_date: loan.next_due_date,
                    next_due_amount: parseFloat(loan.next_due_amount || 0),
                    
                    // Overdue information
                    overdue_schedules: parseInt(loan.overdue_schedules || 0),
                    overdue_amount: parseFloat(loan.overdue_amount || 0),
                    days_overdue: parseInt(loan.days_overdue || 0),
                    due_status: loan.due_status,
                    
                    // Payment information
                    last_payment_date: loan.last_payment_date,
                    last_payment_amount: parseFloat(loan.last_payment_amount || 0)
                })),
                summary: {
                    total_loans: parseInt(summary.total_loans || 0),
                    total_schedules: parseInt(summary.total_schedules || 0),
                    total_outstanding: parseFloat(summary.total_outstanding || 0),
                    overdue: {
                        loans: parseInt(summary.overdue_loans || 0),
                        schedules: parseInt(summary.overdue_schedules || 0),
                        amount: parseFloat(summary.overdue_amount || 0)
                    },
                    due_today: {
                        loans: parseInt(summary.due_today_loans || 0),
                        schedules: parseInt(summary.due_today_schedules || 0),
                        amount: parseFloat(summary.due_today_amount || 0)
                    },
                    due_soon: {
                        loans: parseInt(summary.due_soon_loans || 0),
                        schedules: parseInt(summary.due_soon_schedules || 0),
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
        console.error('Get due loans with date range error:', error);
        res.status(500).json({ success: false, message: 'Error fetching due loans', error: error.message });
    }
};






// Rest of the controller functions remain the same...
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
        const summaryQuery = `
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
        `;

        const [summaryResult] = await sequelize.query(summaryQuery, { replacements, type: sequelize.QueryTypes.SELECT });
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
        const exportQuery = `SELECT 
            l.loan_number,
            l.loan_account,
            c.client_number,
            c.first_name,
            c.last_name,
            c.mobile,
            c.email,
            ls.installment_number,
            ls.due_date,
            ls.principal_due,
            ls.interest_due,
            ls.total_due,
            ls.principal_paid,
            ls.interest_paid,
            ls.total_paid,
            (ls.total_due - ls.total_paid) as outstanding_amount,
            ls.penalty_amount,
            ls.status as schedule_status,
            l.performance_class,
            l.branch,
            l.loan_balance,
            CASE WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END as days_overdue,
            CASE 
                WHEN ls.due_date < CURDATE() THEN 'Overdue' 
                WHEN ls.due_date = CURDATE() THEN 'Due Today' 
                WHEN ls.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due Soon' 
                ELSE 'Future' 
            END as due_status,
            CONCAT(u.first_name, ' ', u.last_name) as loan_officer
        FROM loan_schedules ls
        JOIN loans l ON ls.loan_id = l.id
        JOIN clients c ON l.client_id = c.id
        LEFT JOIN users u ON l.loan_officer_id = u.id
        ${whereClause}
        ORDER BY ls.due_date ASC, c.first_name ASC`;

        const [exportData] = await sequelize.query(exportQuery, { replacements, type: sequelize.QueryTypes.SELECT });

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
            res.setHeader('Content-Disposition', `attachment; filename="due-loans-${start_date || 'today'}-to-${end_date || 'today'}.csv"`);
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

        const dashboardQuery = `
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
        `;

        const [dashboardStats] = await sequelize.query(dashboardQuery, { type: sequelize.QueryTypes.SELECT });
        const stats = dashboardStats[0];

        // Calculate collection rate
        const collectionRate = stats.total_scheduled > 0 
            ? (stats.total_collected / stats.total_scheduled * 100) 
            : 0;

        // Get branch-wise breakdown
        const branchQuery = `
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
        `;

        const [branchStats] = await sequelize.query(branchQuery, { type: sequelize.QueryTypes.SELECT });

        // Get loan officer performance
        const officerQuery = `
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
        `;

        const [officerStats] = await sequelize.query(officerQuery, { type: sequelize.QueryTypes.SELECT });

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
    getDueLoansWithoutDateRange,
    getDueLoansWithDateRange,
    getDueLoansSummary,
    updateOverdueLoans,
    exportDueLoans,
    getDashboardStats
};