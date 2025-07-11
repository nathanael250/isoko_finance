const { sequelize } = require('../config/database');

const getDashboardStats = async (req, res) => {
    try {
        console.log('=== getDashboardStats Debug ===');
        console.log('req.params:', req.params);
        console.log('req.user:', req.user);
        
        const officerId = req.params.officerId || req.user.id;
        console.log('Using officerId:', officerId);
        
        // Get loan statistics for this specific officer
        const [statsResults] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans,
                COUNT(CASE WHEN status = 'active' OR status = 'disbursed' THEN 1 END) as active_loans,
                COALESCE(SUM(CASE WHEN disbursed_amount IS NOT NULL THEN disbursed_amount ELSE applied_amount END), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN disbursed_amount ELSE 0 END), 0) as collections_total
            FROM loans 
            WHERE loan_officer_id = ?
        `, { 
            replacements: [officerId],
            type: sequelize.QueryTypes.SELECT 
        });

        // Get assigned borrowers count
        const [borrowerCountResult] = await sequelize.query(
            'SELECT COUNT(*) as total FROM clients WHERE assigned_officer = ?',
            { replacements: [officerId] }
        );
        const assigned_borrowers = borrowerCountResult[0]?.total || 0;

        const stats = statsResults || {
            total_loans: 0,
            active_loans: 0,
            total_amount: 0,
            collections_total: 0
        };
        stats.assigned_borrowers = assigned_borrowers;

        console.log('Stats result:', stats);

        res.status(200).json({
            success: true,
            data: stats
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

const getAssignedLoans = async (req, res) => {
    try {
        console.log('getAssignedLoans called with params:', req.params);
        
        const officerId = req.params.officerId || req.user.id;
        const limit = parseInt(req.query.limit) || 5;
        
        console.log('Using officer ID:', officerId, 'Limit:', limit);
        
        // Get loans assigned to this specific officer
        const [loans] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount) as amount,
                l.status,
                l.created_at,
                l.application_date,
                COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Unknown Client') as client_name,
                c.first_name,
                c.last_name,
                c.client_number
            FROM loans l
            LEFT JOIN clients c ON l.client_id = c.id
            WHERE l.loan_officer_id = ?
            ORDER BY l.created_at DESC
            LIMIT ?
        `, { 
            replacements: [officerId, limit],
            type: sequelize.QueryTypes.SELECT 
        });

        console.log('Loans found:', loans.length);

        res.status(200).json({
            success: true,
            data: {
                loans: loans || []
            }
        });
    } catch (error) {
        console.error('Get assigned loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assigned loans',
            error: error.message
        });
    }
};



const getAssignedBorrowers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, assigned_officer } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];

        if (assigned_officer) {
            whereClause += ' WHERE assigned_officer = ?';
            replacements.push(assigned_officer);
        }

        if (status) {
            const clause = whereClause ? ' AND' : ' WHERE';
            whereClause += `${clause} status = ?`;
            replacements.push(status);
        }

        if (search) {
            const clause = whereClause ? ' AND' : ' WHERE';
            whereClause += `${clause} (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ?)`;
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total FROM clients${whereClause}`,
            { replacements }
        );

        const total = countResult[0].total;

        // Get clients
        const [clients] = await sequelize.query(
            `SELECT * FROM clients${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            { replacements: [...replacements, parseInt(limit), parseInt(offset)] }
        );

        res.status(200).json({
            success: true,
            data: {
                clients,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching clients',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAssignedLoans,
    getAssignedBorrowers
};
