const { sequelize } = require('../config/database');
const defineClientModel = require('../models/Client');

// Initialize Client model
let Client;

const getClientModel = () => {
    if (!Client) {
        Client = defineClientModel(sequelize);
    }
    return Client;
};

const registerClient = async (req, res) => {
    try {
        console.log('📝 Client registration request received');
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files);

        const {
            title,
            first_name,
            middle_name,
            last_name,
            gender,
            date_of_birth,
            unique_number,
            mobile,
            email,
            address,
            city,
            province_state,
            country,
            zipcode,
            business_name,
            working_status,
            occupation,
            monthly_income,
            employer_name,
            employer_address,
            description
        } = req.body;

        // Get Client model
        const ClientModel = getClientModel();

        // Check for duplicate unique_number if provided
        if (unique_number) {
            try {
                const existingByUniqueNumber = await ClientModel.findByUniqueNumber(unique_number);
                if (existingByUniqueNumber) {
                    return res.status(400).json({
                        success: false,
                        message: 'A client with this unique number already exists',
                        field: 'unique_number'
                    });
                }
            } catch (error) {
                console.log('Error checking unique number:', error.message);
            }
        }

        // Check for duplicate email if provided
        if (email) {
            try {
                const existingByEmail = await ClientModel.findByEmail(email);
                if (existingByEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'A client with this email already exists',
                        field: 'email'
                    });
                }
            } catch (error) {
                console.log('Error checking email:', error.message);
            }
        }

        // Check for duplicate mobile
        try {
            const existingByMobile = await ClientModel.findByMobile(mobile);
            if (existingByMobile) {
                return res.status(400).json({
                    success: false,
                    message: 'A client with this mobile number already exists',
                    field: 'mobile'
                });
            }
        } catch (error) {
            console.log('Error checking mobile:', error.message);
        }

        // Generate client number
        let client_number;
        try {
            client_number = await ClientModel.generateClientNumber();
        } catch (error) {
            console.log('Error generating client number:', error.message);
            // Fallback to timestamp-based number
            client_number = `CLT${Date.now().toString().slice(-6)}`;
        }

        // Create client using raw query
        const [result] = await sequelize.query(`
      INSERT INTO clients (
        client_number, title, first_name, middle_name, last_name, gender,
        date_of_birth, unique_number, mobile, email, address, city,
        province_state, country, zipcode, business_name, working_status,
        occupation, monthly_income, employer_name, employer_address,
        description, assigned_officer, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
            replacements: [
                client_number,
                title || null,
                first_name,
                middle_name || null,
                last_name,
                gender,
                date_of_birth || null,
                unique_number || null,
                mobile,
                email || null,
                address || null,
                city || null,
                province_state || null,
                country || 'Nigeria',
                zipcode || null,
                business_name || null,
                working_status || null,
                occupation || null,
                monthly_income || null,
                employer_name || null,
                employer_address || null,
                description || null,
                req.body.assigned_officer || null,
                req.user?.userId || null
            ]
        });

        // Get the created client
        const [clients] = await sequelize.query(
            'SELECT * FROM clients WHERE client_number = ?',
            { replacements: [client_number] }
        );

        const newClient = clients[0];

        console.log('✅ Client registered successfully:', client_number);

        res.status(201).json({
            success: true,
            message: 'Client registered successfully',
            data: {
                client: newClient,
                files: req.files || []
            }
        });

    } catch (error) {
        console.error('Client registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering client',
            error: error.message
        });
    }
};


const getClients = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];

        if (status) {
            whereClause += ' WHERE status = ?';
            replacements.push(status);
        }

        if (search) {
            const searchClause = whereClause ? ' AND' : ' WHERE';
            whereClause += `${searchClause} (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ?)`;
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

const getClient = async (req, res) => {
    try {
        const { id } = req.params;

        const [clients] = await sequelize.query(
            'SELECT * FROM clients WHERE id = ?',
            { replacements: [id] }
        );

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { client: clients[0] }
        });

    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching client',
            error: error.message
        });
    }
};


const getClientWithLoans = async (req, res) => {
    try {
        const { id } = req.params;

        // Get comprehensive client details
        const [clients] = await sequelize.query(`
      SELECT 
        c.*,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        u.employee_id as officer_employee_id
      FROM clients c
      LEFT JOIN users u ON c.assigned_officer = u.id
      WHERE c.id = ?
    `, { replacements: [id] });

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const client = clients[0];

        // Get client's comprehensive loan details
        const [loans] = await sequelize.query(`
      SELECT 
        l.*,
        u1.first_name as officer_first_name,
        u1.last_name as officer_last_name,
        u1.employee_id as officer_employee_id,
        u2.first_name as approved_by_first_name,
        u2.last_name as approved_by_last_name,
        u3.first_name as disbursed_by_first_name,
        u3.last_name as disbursed_by_last_name
      FROM loans l
      LEFT JOIN users u1 ON l.loan_officer_id = u1.id
      LEFT JOIN users u2 ON l.approved_by = u2.id
      LEFT JOIN users u3 ON l.disbursed_by = u3.id
      WHERE l.client_id = ?
      ORDER BY l.created_at DESC
    `, { replacements: [id] });

        // Get comprehensive loan statistics
        const [loanStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_loans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_loans,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_loans,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(disbursed_amount, approved_amount, 0) ELSE 0 END) as total_disbursed,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(loan_balance, 0) ELSE 0 END) as total_outstanding,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(principal_balance, 0) ELSE 0 END) as total_principal_outstanding,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(interest_balance, 0) ELSE 0 END) as total_interest_outstanding,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(arrears_principal, 0) ELSE 0 END) as total_arrears_principal,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(arrears_interest, 0) ELSE 0 END) as total_arrears_interest,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(installments_paid, 0) ELSE 0 END) as total_installments_paid,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(installments_outstanding, 0) ELSE 0 END) as total_installments_outstanding,
        SUM(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(installments_in_arrears, 0) ELSE 0 END) as total_installments_in_arrears,
        MAX(CASE WHEN status IN ('disbursed', 'active') THEN COALESCE(days_in_arrears, 0) ELSE 0 END) as max_days_in_arrears
      FROM loans 
      WHERE client_id = ?
    `, { replacements: [id] });

        // Get performance classification summary
        const [performanceStats] = await sequelize.query(`
      SELECT 
        performance_class,
        COUNT(*) as count,
        SUM(COALESCE(loan_balance, 0)) as total_balance
      FROM loans 
      WHERE client_id = ? AND status IN ('disbursed', 'active')
      GROUP BY performance_class
    `, { replacements: [id] });

        res.status(200).json({
            success: true,
            data: {
                client,
                loans,
                loan_statistics: loanStats[0] || {
                    total_loans: 0,
                    active_loans: 0,
                    pending_loans: 0,
                    completed_loans: 0,
                    defaulted_loans: 0,
                    rejected_loans: 0,
                    total_disbursed: 0,
                    total_outstanding: 0,
                    total_principal_outstanding: 0,
                    total_interest_outstanding: 0,
                    total_arrears_principal: 0,
                    total_arrears_interest: 0,
                    total_installments_paid: 0,
                    total_installments_outstanding: 0,
                    total_installments_in_arrears: 0,
                    max_days_in_arrears: 0
                },
                performance_summary: performanceStats
            }
        });

    } catch (error) {
        console.error('Get client with loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching client details',
            error: error.message
        });
    }
};
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const updateFields = [];
        const replacements = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== 'id') {
                updateFields.push(`${key} = ?`);
                replacements.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateFields.push('updated_at = NOW()');
        replacements.push(id);

        await sequelize.query(
            `UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?`,
            { replacements }
        );

        // Get updated client
        const [clients] = await sequelize.query(
            'SELECT * FROM clients WHERE id = ?',
            { replacements: [id] }
        );

        res.status(200).json({
            success: true,
            message: 'Client updated successfully',
            data: { client: clients[0] }
        });

    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating client',
            error: error.message
        });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        await sequelize.query(
            'DELETE FROM clients WHERE id = ?',
            { replacements: [id] }
        );

        res.status(200).json({
            success: true,
            message: 'Client deleted successfully'
        });

    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting client',
            error: error.message
        });
    }
};

const approveClient = async (req, res) => {
    try {
        const { id } = req.params;

        await sequelize.query(
            'UPDATE clients SET status = ?, updated_at = NOW() WHERE id = ?',
            { replacements: ['active', id] }
        );

        res.status(200).json({
            success: true,
            message: 'Client approved successfully'
        });

    } catch (error) {
        console.error('Approve client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving client',
            error: error.message
        });
    }
};

// Placeholder implementations for file operations
const uploadClientFiles = (req, res) => {
    res.status(501).json({
        success: false,
        message: 'File upload not yet implemented'
    });
};

const getClientFiles = (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Get files not yet implemented'
    });
};

const deleteClientFile = (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Delete file not yet implemented'
    });
};

const getClientStats = async (req, res) => {
    try {
        const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_clients,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_clients
      FROM clients
    `);

        res.status(200).json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Get client stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching client statistics',
            error: error.message
        });
    }
};

const searchClients = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${q}%`;
        const [clients] = await sequelize.query(`
      SELECT id, client_number, first_name, last_name, email, mobile, status
      FROM clients 
      WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR client_number LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `, {
            replacements: [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
        });

        res.status(200).json({
            success: true,
            data: { clients }
        });

    } catch (error) {
        console.error('Search clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching clients',
            error: error.message
        });
    }
};

module.exports = {
    registerClient,
    getClients,
    getClient,
    updateClient,
    deleteClient,
    approveClient,
    uploadClientFiles,
    getClientFiles,
    deleteClientFile,
    getClientStats,
    searchClients,
    getClientWithLoans
};
