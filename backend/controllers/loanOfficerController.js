const { sequelize } = require('../config/database');

// @desc    Get loan officer dashboard statistics
// @route   GET /api/loan-officer/stats
// @access  Private (Loan Officer)
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            console.error('User not authenticated:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        console.log('Fetching stats for user:', userId);

        // Get total loans assigned to this loan officer
        const [totalLoansResult] = await sequelize.query(`
            SELECT COUNT(*) as total_loans
            FROM loans 
            WHERE loan_officer_id = ?
        `, { replacements: [userId] });

        console.log('Total loans result:', totalLoansResult);

        // Get active loans
        const [activeLoansResult] = await sequelize.query(`
            SELECT COUNT(*) as active_loans
            FROM loans 
            WHERE loan_officer_id = ? AND status IN ('active', 'disbursed')
        `, { replacements: [userId] });

        console.log('Active loans result:', activeLoansResult);

        // Get pending loans
        const [pendingLoansResult] = await sequelize.query(`
            SELECT COUNT(*) as pending_loans
            FROM loans 
            WHERE loan_officer_id = ? AND status IN ('pending', 'under_review')
        `, { replacements: [userId] });

        console.log('Pending loans result:', pendingLoansResult);

        // Get overdue loans
        const [overdueLoansResult] = await sequelize.query(`
            SELECT COUNT(*) as overdue_loans
            FROM loans 
            WHERE loan_officer_id = ? 
            AND status = 'active' 
            AND maturity_date < CURDATE()
        `, { replacements: [userId] });

        console.log('Overdue loans result:', overdueLoansResult);

        // Get total portfolio value
        const [portfolioResult] = await sequelize.query(`
            SELECT 
                COALESCE(SUM(COALESCE(disbursed_amount, approved_amount, applied_amount)), 0) as total_portfolio,
                COALESCE(SUM(loan_balance), 0) as outstanding_balance
            FROM loans 
            WHERE loan_officer_id = ? AND status IN ('active', 'disbursed')
        `, { replacements: [userId] });

        console.log('Portfolio result:', portfolioResult);

        // Get recent loans
        const [recentLoans] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                l.applied_amount,
                l.status,
                l.application_date,
                l.maturity_date,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.client_number
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.loan_officer_id = ?
            ORDER BY l.created_at DESC
            LIMIT 10
        `, { replacements: [userId] });

        console.log('Recent loans result:', recentLoans);

        // Get loans by status for chart
        const [loansByStatus] = await sequelize.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM loans 
            WHERE loan_officer_id = ?
            GROUP BY status
        `, { replacements: [userId] });

        console.log('Loans by status result:', loansByStatus);

        const stats = {
            summary: {
                total_loans: parseInt(totalLoansResult[0]?.total_loans || 0),
                active_loans: parseInt(activeLoansResult[0]?.active_loans || 0),
                pending_loans: parseInt(pendingLoansResult[0]?.pending_loans || 0),
                overdue_loans: parseInt(overdueLoansResult[0]?.overdue_loans || 0),
                total_portfolio: parseFloat(portfolioResult[0]?.total_portfolio || 0),
                outstanding_balance: parseFloat(portfolioResult[0]?.outstanding_balance || 0)
            },
            recent_loans: recentLoans,
            loans_by_status: loansByStatus.map(item => ({
                status: item.status,
                count: parseInt(item.count)
            }))
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get loan officer dashboard stats error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get loan officer's assigned loans
// @route   GET /api/loan-officer/loans
// @access  Private (Loan Officer)
const getAssignedLoans = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            console.error('User not authenticated:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        console.log('Fetching loans for user:', userId);
        const { page = 1, limit = 10, status, search } = req.query;
        
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE l.loan_officer_id = ?';
        let replacements = [userId];

        if (status) {
            whereClause += ' AND l.status = ?';
            replacements.push(status);
        }

        if (search) {
            whereClause += ' AND (l.loan_number LIKE ? OR l.loan_account LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)';
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        console.log('Query where clause:', whereClause);
        console.log('Query replacements:', replacements);

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total 
            FROM loans l 
            JOIN clients c ON l.client_id = c.id 
            ${whereClause}
        `, { replacements });

        console.log('Count result:', countResult);

        // Get loans
        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                c.client_number,
                c.mobile as client_phone,
                c.email as client_email
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, { replacements: [...replacements, parseInt(limit), parseInt(offset)] });

        console.log('Loans result:', loans);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                loans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: totalPages
                }
            }
        });

    } catch (error) {
        console.error('Get assigned loans error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching assigned loans',
            error: error.message
        });
    }
};

// @desc    Get loan officer's assigned borrowers
// @route   GET /api/loan-officer/borrowers
// @access  Private (Loan Officer)
const getAssignedBorrowers = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            console.error('User not authenticated:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        console.log('Fetching borrowers for loan officer:', userId);

        // Get all borrowers assigned to this loan officer through loans
        const [borrowers] = await sequelize.query(`
            SELECT DISTINCT 
                c.*,
                COUNT(DISTINCT l.id) as active_loans
            FROM clients c
            JOIN loans l ON c.id = l.client_id
            WHERE l.loan_officer_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `, { replacements: [userId] });

        console.log('Found borrowers:', borrowers.length);

        res.status(200).json({
            success: true,
            data: borrowers
        });

    } catch (error) {
        console.error('Get assigned borrowers error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching assigned borrowers',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAssignedLoans,
    getAssignedBorrowers
};
