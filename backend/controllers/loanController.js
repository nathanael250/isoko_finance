const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');
const defineLoanModel = require('../models/Loan');
const defineLoanScheduleModel = require('../models/LoanSchedule');

let Loan;
let LoanSchedule;

const getLoanModel = () => {
    if (!Loan) {
        Loan = defineLoanModel(sequelize);
    }
    return Loan;
};

const getLoanScheduleModel = () => {
    if (!LoanSchedule) {
        LoanSchedule = defineLoanScheduleModel(sequelize);
    }
    return LoanSchedule;
};

const createLoan = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
                requestBody: req.body // Log the request body for debugging
            });
        }

        console.log('💰 Loan application request received');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User from req:', req.user);

        const {
            client_id,
            borrower_id,
            loan_type,
            loan_purpose,
            economic_sector,
            applied_amount,
            interest_rate,
            interest_rate_method,
            loan_term_months,
            repayment_frequency,
            collateral_type,
            collateral_description,
            collateral_value,
            branch,
            notes
        } = req.body;

        // Validate required fields
        if (!client_id || !loan_type || !applied_amount || !interest_rate || !loan_term_months) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: client_id, loan_type, applied_amount, interest_rate, loan_term_months'
            });
        }

        // Validate client exists and get client details
        const [clients] = await sequelize.query(`
            SELECT 
                id, client_number, first_name, last_name, 
                gender, mobile, email, status 
            FROM clients 
            WHERE id = ?
        `, { replacements: [client_id], transaction });

        if (clients.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const client = clients[0];

        // Check if client is active
        if (client.status !== 'active' && client.status !== 'pending_approval') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot create loan for inactive client. Client status: ' + client.status
            });
        }

        // Check for existing pending loans
        // const [existingLoans] = await sequelize.query(
        //     'SELECT COUNT(*) as pending_count FROM loans WHERE client_id = ? AND status IN (?, ?)',
        //     { replacements: [client_id, 'pending', 'under_review'], transaction }
        // );

        // if (existingLoans[0].pending_count > 0) {
        //     await transaction.rollback();
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Client already has a pending loan application'
        //     });
        // }

        // Get Loan model
        const LoanModel = getLoanModel();

        // Generate loan number and account
        const loan_number = await LoanModel.generateLoanNumber();
        const loan_account = await LoanModel.generateLoanAccount();

        // Calculate loan details
        const loanDetails = LoanModel.calculateLoanDetails(
            parseFloat(applied_amount),
            parseFloat(interest_rate),
            parseInt(loan_term_months),
            repayment_frequency || 'monthly',
            interest_rate_method || 'reducing_balance'
        );

        // Prepare replacement values with proper defaults
        const loan_officer_id = req.user?.userId || req.user?.id || null;

        console.log('🔍 Debug values before insert:');
        console.log('loan_number:', loan_number);
        console.log('loan_account:', loan_account);
        console.log('client_id:', client_id);
        console.log('borrower_id:', borrower_id || client.client_number);
        console.log('loan_type:', loan_type);
        console.log('loan_officer_id:', loan_officer_id);

        const replacementValues = [
            loan_number,
            loan_account,
            client_id,
            borrower_id || client.client_number || null,
            loan_type,
            loan_purpose || null,
            economic_sector || 'other',
            parseFloat(applied_amount),
            parseFloat(interest_rate),
            interest_rate_method || 'reducing_balance',
            parseInt(loan_term_months),
            repayment_frequency || 'monthly',
            loanDetails.installment_amount,
            loanDetails.total_installments,
            loanDetails.installments_outstanding,
            loanDetails.loan_balance,
            loanDetails.principal_balance,
            loanDetails.interest_balance,
            loanDetails.maturity_date,
            collateral_type || 'none',
            collateral_description || null,
            collateral_value || null,
            loan_officer_id,
            branch || null,
            notes || null,
            'pending'
        ];

        console.log('🔍 All replacement values:', replacementValues);

        // Create loan using raw query - FIXED: Use type: QueryTypes.INSERT
        await sequelize.query(`
            INSERT INTO loans (
                loan_number, 
                loan_account, 
                client_id, 
                borrower_id, 
                loan_type, 
                loan_purpose,
                economic_sector, 
                applied_amount, 
                interest_rate, 
                interest_rate_method,
                loan_term_months, 
                repayment_frequency, 
                installment_amount, 
                total_installments,
                installments_outstanding, 
                loan_balance, 
                principal_balance, 
                interest_balance,
                maturity_date, 
                collateral_type, 
                collateral_description, 
                collateral_value,
                loan_officer_id, 
                branch, 
                notes, 
                status, 
                application_date, 
                created_at, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
        `, {
            replacements: replacementValues,
            transaction,
            type: sequelize.QueryTypes.INSERT
        });

        // Get the loan ID by querying the loan number
        const [createdLoan] = await sequelize.query(`
            SELECT id FROM loans WHERE loan_number = ?
        `, { replacements: [loan_number], transaction });

        if (createdLoan.length === 0) {
            await transaction.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to create loan - could not retrieve loan ID'
            });
        }

        const loanId = createdLoan[0].id;
        console.log('✅ Retrieved loan ID:', loanId);

        // Save loan schedule using the retrieved ID
        console.log('💾 Saving loan schedule...');
        for (const scheduleItem of loanDetails.schedule) {
            await sequelize.query(`
                INSERT INTO loan_schedules (
                    loan_id, 
                    installment_number, 
                    due_date, 
                    principal_due, 
                    interest_due, 
                    total_due, 
                    balance_after,
                    status,
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
            `, {
                replacements: [
                    loanId,
                    scheduleItem.installment_number,
                    scheduleItem.due_date,
                    scheduleItem.principal_due,
                    scheduleItem.interest_due,
                    scheduleItem.total_due,
                    scheduleItem.balance_after
                ],
                transaction
            });
        }

        // Get the created loan with client details
        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                c.gender as client_gender,
                c.mobile as client_mobile,
                c.email as client_email,
                u.first_name as officer_first_name,
                u.last_name as officer_last_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            WHERE l.loan_number = ?
        `, { replacements: [loan_number], transaction });

        const newLoan = loans[0];

        // Commit the transaction
        await transaction.commit();

        console.log('✅ Loan application created successfully:', loan_number);
        console.log('✅ Loan schedule saved successfully');

        res.status(201).json({
            success: true,
            message: 'Loan application created successfully',
            data: {
                loan: newLoan,
                calculated_details: loanDetails,
                schedule_saved: true,
                schedule_count: loanDetails.schedule.length
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Create loan error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating loan application',
            error: error.message
        });
    }
};



// @desc    Get loan repayment history
// @route   GET /api/loans/:id/repayments
// @access  Private
const getLoanRepayments = async (req, res) => {
    try {
        const { id } = req.params;

        const [repayments] = await sequelize.query(`
            SELECT 
                r.id,
                r.loan_id,
                r.schedule_id,
                r.receipt_number,
                r.payment_date,
                r.amount_paid,
                r.principal_paid,
                r.interest_paid,
                r.penalty_paid,
                r.payment_method,
                r.reference_number,
                r.notes,
                r.status,
                r.created_at,
                r.updated_at,
                u.first_name as received_by_first_name,
                u.last_name as received_by_last_name
            FROM repayments r
            LEFT JOIN users u ON r.received_by = u.id
            WHERE r.loan_id = ?
            ORDER BY r.payment_date DESC, r.created_at DESC
        `, { replacements: [id] });

        res.status(200).json({
            success: true,
            message: 'Loan repayments retrieved successfully',
            data: repayments
        });

    } catch (error) {
        console.error('Error fetching loan repayments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan repayments',
            error: error.message
        });
    }
};


// @desc    Get loan repayment schedule
// @route   GET /api/loans/:id/schedule
// @access  Private


// @desc    Get loan documents
// @route   GET /api/loans/:id/documents
// @access  Private
const getLoanDocuments = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if loan_documents table exists
        try {
            const [documents] = await sequelize.query(`
                SELECT 
                    d.*,
                    u.first_name as uploaded_by_first_name,
                    u.last_name as uploaded_by_last_name
                FROM loan_documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                WHERE d.loan_id = ?
                ORDER BY d.created_at DESC
            `, { replacements: [id] });

            res.status(200).json({
                success: true,
                message: 'Loan documents retrieved successfully',
                data: documents
            });
        } catch (tableError) {
            // If table doesn't exist, return empty array
            res.status(200).json({
                success: true,
                message: 'Loan documents retrieved successfully (no documents table)',
                data: []
            });
        }

    } catch (error) {
        console.error('Error fetching loan documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan documents',
            error: error.message
        });
    }
};

// @desc    Upload loan document
// @route   POST /api/loans/documents/upload
// @access  Private
const uploadLoanDocument = async (req, res) => {
    try {
        const { loan_id, document_type, description } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!loan_id) {
            return res.status(400).json({
                success: false,
                message: 'Loan ID is required'
            });
        }

        // Check if loan exists
        const [loans] = await sequelize.query(`
            SELECT id FROM loans WHERE id = ?
        `, { replacements: [loan_id] });

        if (loans.length === 0) {
            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        // Try to insert into loan_documents table
        try {
            await sequelize.query(`
                INSERT INTO loan_documents (
                    loan_id,
                    document_type,
                    original_name,
                    file_name,
                    file_path,
                    file_size,
                    file_type,
                    description,
                    uploaded_by,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', NOW(), NOW())
            `, {
                replacements: [
                    loan_id,
                    document_type || 'loan_document',
                    req.file.originalname,
                    req.file.filename,
                    req.file.path,
                    req.file.size,
                    req.file.mimetype,
                    description || null,
                    req.user?.userId || req.user?.id
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    loan_id,
                    original_name: req.file.originalname,
                    file_name: req.file.filename,
                    file_size: req.file.size,
                    file_type: req.file.mimetype,
                    document_type: document_type || 'loan_document'
                }
            });

        } catch (dbError) {
            // Clean up uploaded file if database insert fails
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (dbError.message.includes('loan_documents')) {
                return res.status(500).json({
                    success: false,
                    message: 'Document upload feature not yet implemented - loan_documents table missing'
                });
            }

            throw dbError;
        }

    } catch (error) {
        console.error('Error uploading document:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    }
};



// Add a new function to get loan schedule
// Add this function to your existing loanController.js

const getLoanSchedule = async (req, res) => {
    try {
        const { loanId } = req.params;
        
        // First check if the loan exists
        const [loanCheck] = await sequelize.query(`
            SELECT id FROM loans WHERE id = ?
        `, { replacements: [loanId] });
        
        if (loanCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }
        
        const [schedules] = await sequelize.query(`
            SELECT 
                ls.*,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE ls.loan_id = ?
            ORDER BY ls.installment_number ASC
        `, { replacements: [loanId] });

        // Instead of returning 404, return 200 with empty schedule
        if (schedules.length === 0) {
            return res.status(200).json({
                success: false, // Keep this false to indicate no schedule found
                message: 'Loan schedule not found',
                data: {
                    loan_id: loanId,
                    schedule: [],
                    total_installments: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                loan_id: loanId,
                schedule: schedules,
                total_installments: schedules.length
            }
        });
    } catch (error) {
        console.error('Get loan schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan schedule',
            error: error.message,
            data: {
                loan_id: req.params.loanId,
                schedule: [],
                total_installments: 0
            }
        });
    }
};



// Keep all your existing functions unchanged...
// Update the getLoans function to handle more filters
// Update the existing getLoans function in your loanController.js

const getLoans = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            client_id,
            loan_officer_id,
            branch,
            loan_type,
            performance_class,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];
        const conditions = [];

        if (status) {
            conditions.push('l.status = ?');
            replacements.push(status);
        }

        if (client_id) {
            conditions.push('l.client_id = ?');
            replacements.push(client_id);
        }

        if (loan_officer_id) {
            conditions.push('l.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (branch) {
            conditions.push('l.branch = ?');
            replacements.push(branch);
        }

        if (loan_type) {
            conditions.push('l.loan_type = ?');
            replacements.push(loan_type);
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

        console.log('getLoans - Final WHERE clause:', whereClause);
        console.log('getLoans - Final REPLACEMENTS:', replacements);

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total FROM loans l LEFT JOIN clients c ON l.client_id = c.id${whereClause}`,
            { replacements }
        );

        const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

        // Get loans data - Using only existing columns
        const loansReplacements = [...replacements];
        const loansResult = await sequelize.query(`
            SELECT 
                l.id, l.loan_number, l.loan_account, l.status, 
                l.applied_amount, l.approved_amount, l.disbursed_amount,
                l.interest_rate, l.interest_rate_method, l.loan_term_months,
                l.repayment_frequency, l.installment_amount, l.total_installments,
                l.installments_outstanding, l.installments_paid, l.installments_in_arrears,
                l.loan_balance, l.principal_balance, l.interest_balance,
                l.arrears_principal, l.arrears_interest,
                l.performance_class, l.days_in_arrears, l.arrears_start_date,
                l.maturity_date, l.created_at, l.updated_at,
                l.last_payment_date, l.first_payment_date,
                l.loan_officer_id, l.branch, l.loan_purpose, l.economic_sector,
                l.collateral_type, l.collateral_description, l.collateral_value,
                l.application_date, l.approval_date, l.disbursement_date,
                l.approved_by, l.disbursed_by, l.notes,
                c.first_name AS client_first_name, c.last_name AS client_last_name, 
                c.client_number, c.gender as client_gender,c.date_of_birth, c.mobile as client_mobile,
                c.email as client_email,
                lt.name AS loan_type_name,
                u1.first_name as officer_first_name, u1.last_name as officer_last_name,
                -- Calculate derived fields
                (COALESCE(l.principal_balance, 0) + COALESCE(l.interest_balance, 0)) as total_due,
                (COALESCE(l.approved_amount, l.applied_amount, 0) - COALESCE(l.loan_balance, 0)) as total_paid,
                l.loan_balance as balance,
                -- Calculate last payment amount (this would need to come from payments table)
                0 as last_payment_amount
            FROM loans l
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN loan_types lt ON l.loan_type = lt.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...loansReplacements, parseInt(limit), parseInt(offset)],
            type: sequelize.QueryTypes.SELECT
        });

        const loans = Array.isArray(loansResult) ? loansResult : [loansResult].filter(Boolean);
        
        console.log('Loans fetched:', loans.length);
        if (loans.length > 0) {
            console.log('Sample loan data:', {
                id: loans[0].id,
                loan_number: loans[0].loan_number,
                interest_rate: loans[0].interest_rate,
                status: loans[0].status,
                client_name: `${loans[0].client_first_name} ${loans[0].client_last_name}`
            });
        }

        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                loans: loans,
                pagination: {
                    total,
                    pages: totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans',
            error: error.message
        });
    }
};

const getLoan = async (req, res) => {
    try {
        const { id } = req.params;

        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                (COALESCE(l.principal_balance, 0) + COALESCE(l.interest_balance, 0)) as total_due,
                (COALESCE(l.approved_amount, l.applied_amount, 0) - COALESCE(l.loan_balance, 0)) as total_paid,
                l.loan_balance as balance,
                l.interest_balance,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                c.gender as client_gender,
                c.mobile as client_mobile,
                c.email as client_email,
                c.address as client_address,
                c.city as client_city,
                c.province_state as client_state,
                u1.first_name as officer_first_name,
                u1.last_name as officer_last_name,
                u1.employee_id as officer_employee_id,
                u2.first_name as approved_by_first_name,
                u2.last_name as approved_by_last_name,
                u3.first_name as disbursed_by_first_name,
                u3.last_name as disbursed_by_last_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            LEFT JOIN users u2 ON l.approved_by = u2.id
            LEFT JOIN users u3 ON l.disbursed_by = u3.id
            WHERE l.id = ?
        `, { replacements: [id] });

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { loan: loans[0] }
        });

    } catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan',
            error: error.message
        });
    }
};

const updateLoanStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { status, approved_amount, disbursed_amount, notes } = req.body;

        // Get current loan
        const [currentLoans] = await sequelize.query(
            'SELECT * FROM loans WHERE id = ?',
            { replacements: [id] }
        );

        if (currentLoans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const currentLoan = currentLoans[0];

        // Prepare update fields
        const updateFields = ['status = ?', 'updated_at = NOW()'];
        const replacements = [status];

        // Add status-specific fields
        if (status === 'approved' && approved_amount) {
            const userId = req.user?.userId || req.user?.id || null;
            updateFields.push('approved_amount = ?', 'approved_by = ?', 'approval_date = NOW()');
            replacements.push(approved_amount, userId);
        }

        if (status === 'disbursed') {
            const userId = req.user?.userId || req.user?.id || null;
            updateFields.push('disbursed_by = ?', 'disbursement_date = NOW()');
            replacements.push(userId);

            if (disbursed_amount) {
                updateFields.push('disbursed_amount = ?');
                replacements.push(disbursed_amount);
            } else {
                updateFields.push('disbursed_amount = approved_amount');
            }

            updateFields[0] = 'status = ?';
            replacements[0] = 'active';
        }

        if (notes) {
            updateFields.push('notes = ?');
            replacements.push(notes);
        }

        replacements.push(id);

        // Update loan
        await sequelize.query(
            `UPDATE loans SET ${updateFields.join(', ')} WHERE id = ?`,
            { replacements }
        );

        // Get updated loan
        const [updatedLoans] = await sequelize.query(`
            SELECT 
                l.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            WHERE l.id = ?
        `, { replacements: [id] });

        const userId = req.user?.userId || req.user?.id || 'unknown';
        console.log(`📊 Loan status updated - ID: ${id}, Status: ${status}, Updated by: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Loan status updated successfully',
            data: { loan: updatedLoans[0] }
        });

    } catch (error) {
        console.error('Update loan status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating loan status',
            error: error.message
        });
    }
};

const getLoansByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            loan_officer_id,
            branch,
            loan_type,
            performance_class,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = ' WHERE l.client_id = ?';
        let replacements = [clientId];
        if (status) {
            whereClause += ' AND l.status = ?';
            replacements.push(status);
        }
        if (loan_officer_id) {
            whereClause += ' AND l.loan_officer_id = ?';
            replacements.push(loan_officer_id);
        }
        if (branch) {
            whereClause += ' AND l.branch = ?';
            replacements.push(branch);
        }
        if (loan_type) {
            whereClause += ' AND l.loan_type = ?';
            replacements.push(loan_type);
        }
        if (performance_class) {
            whereClause += ' AND l.performance_class = ?';
            replacements.push(performance_class);
        }
        if (search) {
            whereClause += ' AND (l.loan_number LIKE ? OR l.loan_account LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.client_number LIKE ?)';
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total FROM loans l LEFT JOIN clients c ON l.client_id = c.id${whereClause}`,
            { replacements }
        );
        const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

        // Get loans data
        const loansReplacements = [...replacements];
        const loansResult = await sequelize.query(`
            SELECT 
                l.id, l.loan_number, l.loan_account, l.status, 
                l.applied_amount, l.approved_amount, l.disbursed_amount,
                l.interest_rate, l.interest_rate_method, l.loan_term_months,
                l.repayment_frequency, l.installment_amount, l.total_installments,
                l.installments_outstanding, l.installments_paid, l.installments_in_arrears,
                l.loan_balance, l.principal_balance, l.interest_balance,
                l.arrears_principal, l.arrears_interest,
                l.performance_class, l.days_in_arrears, l.arrears_start_date,
                l.maturity_date, l.created_at, l.updated_at,
                l.last_payment_date, l.first_payment_date,
                l.loan_officer_id, l.branch, l.loan_purpose, l.economic_sector,
                l.collateral_type, l.collateral_description, l.collateral_value,
                l.application_date, l.approval_date, l.disbursement_date,
                l.approved_by, l.disbursed_by, l.notes,
                c.first_name AS client_first_name, c.last_name AS client_last_name, 
                c.client_number, c.gender as client_gender,c.date_of_birth, c.mobile as client_mobile,
                c.email as client_email,
                lt.name AS loan_type_name,
                u1.first_name as officer_first_name, u1.last_name as officer_last_name,
                -- Calculate derived fields
                (COALESCE(l.principal_balance, 0) + COALESCE(l.interest_balance, 0)) as total_due,
                (COALESCE(l.approved_amount, l.applied_amount, 0) - COALESCE(l.loan_balance, 0)) as total_paid,
                l.loan_balance as balance,
                -- Calculate last payment amount (this would need to come from payments table)
                0 as last_payment_amount
            FROM loans l
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN loan_types lt ON l.loan_type = lt.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...loansReplacements, parseInt(limit), parseInt(offset)],
            type: sequelize.QueryTypes.SELECT
        });
        const loans = Array.isArray(loansResult) ? loansResult : [loansResult].filter(Boolean);
        const totalPages = Math.ceil(total / parseInt(limit));
        res.status(200).json({
            success: true,
            data: {
                loans: loans,
                pagination: {
                    total,
                    pages: totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get loans by client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching client loans',
            error: error.message
        });
    }
};



const calculateLoanDetails = async (req, res) => {
    try {
        const { amount, interest_rate, term_months, frequency, method } = req.body;

        if (!amount || !interest_rate || !term_months) {
            return res.status(400).json({
                success: false,
                message: 'Amount, interest rate, and term months are required'
            });
        }

        const LoanModel = getLoanModel();
        const calculatedDetails = LoanModel.calculateLoanDetails(
            parseFloat(amount),
            parseFloat(interest_rate),
            parseInt(term_months),
            frequency || 'monthly',
            method || 'reducing_balance'
        );

        res.status(200).json({
            success: true,
            data: {
                calculation: calculatedDetails,
                input: {
                    amount: parseFloat(amount),
                    interest_rate: parseFloat(interest_rate),
                    term_months: parseInt(term_months),
                    frequency: frequency || 'monthly',
                    method: method || 'reducing_balance'
                }
            }
        });

    } catch (error) {
        console.error('Calculate loan details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating loan details',
            error: error.message
        });
    }
};

const updateLoanPerformance = async (req, res) => {
    try {
        const { id } = req.params;
        const { performance_class, days_in_arrears, arrears_start_date } = req.body;

        // Basic validation
        if (!performance_class) {
            return res.status(400).json({ success: false, message: 'Performance class is required.' });
        }

        const [result] = await sequelize.query(`
            UPDATE loans SET
                performance_class = ?,
                days_in_arrears = ?,
                arrears_start_date = ?,
                updated_at = NOW()
            WHERE id = ?
        `, {
            replacements: [performance_class, days_in_arrears || null, arrears_start_date || null, id]
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Loan not found or no changes made.' });
        }

        res.status(200).json({ success: true, message: 'Loan performance updated successfully.' });

    } catch (error) {
        console.error('Update loan performance error:', error);
        res.status(500).json({ success: false, message: 'Error updating loan performance.', error: error.message });
    }
};

const getMyLoans = async (req, res) => {
    console.log('getMyLoans function called');
    console.log('Request user:', req.user);
    console.log('Request query:', req.query);
    
    try {
        const { userId } = req.user;
        console.log('User ID from request:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in request'
            });
        }

        const {
            page = 1,
            limit = 20,
            status,
            loan_type_id,
            min_amount,
            max_amount,
            sort_by = 'created_at',
            sort_order = 'DESC',
            search
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = `WHERE l.loan_officer_id = ?`;
        let replacements = [userId];

        // Build dynamic where clause
        if (status) {
            whereClause += ` AND l.status = ?`;
            replacements.push(status);
        }
        if (loan_type_id) {
            whereClause += ` AND l.loan_type = ?`;
            replacements.push(parseInt(loan_type_id));
        }
        if (min_amount) {
            whereClause += ` AND (COALESCE(l.approved_amount, l.applied_amount, 0) >= ?)`;
            replacements.push(parseFloat(min_amount));
        }
        if (max_amount) {
            whereClause += ` AND (COALESCE(l.approved_amount, l.applied_amount, 0) <= ?)`;
            replacements.push(parseFloat(max_amount));
        }
        if (search) {
            whereClause += ` AND (
                c.first_name LIKE ? OR 
                c.last_name LIKE ? OR 
                l.loan_number LIKE ? OR
                l.loan_account LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        console.log('SQL Where clause:', whereClause);
        console.log('SQL Replacements:', replacements);

        // Get total count first
        const countSql = `
            SELECT COUNT(l.id) AS total
            FROM loans l
            LEFT JOIN clients c ON l.client_id = c.id
            ${whereClause}
        `;

        const [countResult] = await sequelize.query(countSql, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        const total = countResult && countResult.length > 0 ? parseInt(countResult[0].total) : 0;
        const totalPages = Math.ceil(total / parseInt(limit));
        
        console.log('Total loans found:', total);
        console.log('Total pages:', totalPages);

        // Validate sort parameters
        const allowedSortFields = [
            'created_at', 'updated_at', 'loan_number', 'applied_amount', 
            'approved_amount', 'status', 'maturity_date'
        ];
        const sortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortOrder = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

        // Main query with correct column name
        const loansSql = `
            SELECT 
                l.id, 
                l.loan_number, 
                l.loan_account, 
                l.status, 
                l.applied_amount, 
                l.approved_amount, 
                l.disbursed_amount,
                l.interest_rate, 
                l.interest_rate_method, 
                l.loan_term_months,
                l.repayment_frequency, 
                l.installment_amount, 
                l.total_installments,
                l.installments_outstanding, 
                COALESCE(l.installments_paid, 0) as installments_paid, 
                COALESCE(l.installments_in_arrears, 0) as installments_in_arrears,
                COALESCE(l.loan_balance, 0) as loan_balance, 
                COALESCE(l.principal_balance, 0) as principal_balance, 
                COALESCE(l.interest_balance, 0) as interest_balance,
                COALESCE(l.arrears_principal, 0) as arrears_principal, 
                COALESCE(l.arrears_interest, 0) as arrears_interest,
                l.performance_class, 
                COALESCE(l.days_in_arrears, 0) as days_in_arrears, 
                l.arrears_start_date,
                l.maturity_date, 
                l.created_at, 
                l.updated_at,
                l.last_payment_date, 
                l.first_payment_date,
                l.loan_officer_id, 
                l.branch, 
                l.loan_purpose, 
                l.economic_sector,
                l.collateral_type, 
                l.collateral_description, 
                l.collateral_value,
                l.application_date, 
                l.approval_date, 
                l.disbursement_date,
                l.approved_by, 
                l.disbursed_by, 
                l.notes,
                -- Client information
                COALESCE(c.first_name, '') AS client_first_name, 
                COALESCE(c.last_name, '') AS client_last_name, 
                c.client_number, 
                c.gender as client_gender, 
                c.mobile as client_mobile,
                c.email as client_email,
                -- Loan type information
                COALESCE(lt.name, 'Unknown') AS loan_type_name,
                -- Officer information
                COALESCE(u1.first_name, '') as officer_first_name, 
                COALESCE(u1.last_name, '') as officer_last_name,
                -- Calculate derived fields safely
                (COALESCE(l.principal_balance, 0) + COALESCE(l.interest_balance, 0)) as total_due,
                (COALESCE(l.applied_amount, 0) - COALESCE(l.loan_balance, 0)) as total_paid,
                COALESCE(l.loan_balance, 0) as balance,
                -- Get last payment amount using correct column name
                (SELECT r.amount_paid FROM repayments r 
                 WHERE r.loan_id = l.id 
                 ORDER BY r.payment_date DESC, r.created_at DESC 
                 LIMIT 1) as last_payment_amount
            FROM loans l
            LEFT JOIN clients c ON l.client_id = c.id
            LEFT JOIN loan_types lt ON l.loan_type = lt.id
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            ${whereClause}
            ORDER BY l.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const finalReplacements = [...replacements, parseInt(limit), offset];
        
        console.log('Executing loans SQL with correct column name');

        const loansResult = await sequelize.query(loansSql, {
            replacements: finalReplacements,
            type: sequelize.QueryTypes.SELECT
        });

        const loans = Array.isArray(loansResult) ? loansResult : [];
        console.log('Loans fetched successfully:', loans.length);

        if (loans.length > 0) {
            console.log('Sample loan data:', {
                id: loans[0].id,
                loan_number: loans[0].loan_number,
                interest_rate: loans[0].interest_rate,
                status: loans[0].status,
                client_name: `${loans[0].client_first_name} ${loans[0].client_last_name}`,
                total_due: loans[0].total_due,
                total_paid: loans[0].total_paid,
                balance: loans[0].balance,
                last_payment_amount: loans[0].last_payment_amount
            });
        }

        res.status(200).json({
            success: true,
            data: {
                loans,
                pagination: {
                    total,
                    pages: totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get my loans error:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error fetching loans for loan officer',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};




// Add these new functions to your existing loanController.js

// @desc    Get loan statistics for charts
// @route   GET /api/loans/stats/monthly-releases
// @access  Private
const getMonthlyLoanReleases = async (req, res) => {
    try {
        const { months = 12 } = req.query;
        
        const [results] = await sequelize.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total_loans,
                COUNT(CASE WHEN status IN ('approved', 'active', 'disbursed') THEN 1 END) as approved_loans,
                SUM(CASE WHEN status IN ('approved', 'active', 'disbursed') THEN COALESCE(applied_amount, 0) ELSE 0 END) as total_amount
            FROM loans 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT ?
        `, { replacements: [parseInt(months), parseInt(months)] });

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Get monthly loan releases error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly loan releases',
            error: error.message
        });
    }
};

// @desc    Get loan status distribution for pie chart
// @route   GET /api/loans/stats/status-distribution
// @access  Private
const getLoanStatusDistribution = async (req, res) => {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(COALESCE(applied_amount, 0)) as total_amount
            FROM loans 
            GROUP BY status
            ORDER BY count DESC
        `);

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Get loan status distribution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan status distribution',
            error: error.message
        });
    }
};


// @desc    Get monthly collection data
// @route   GET /api/loans/stats/monthly-collections
// @access  Private
const getMonthlyCollections = async (req, res) => {
    try {
        const { months = 12 } = req.query;
        
        // Check if repayments table exists
        try {
            const [results] = await sequelize.query(`
                SELECT 
                    DATE_FORMAT(r.payment_date, '%Y-%m') as month,
                    SUM(COALESCE(r.amount_paid, 0)) as total_collected,
                    SUM(COALESCE(r.principal_paid, 0)) as principal_collected,
                    SUM(COALESCE(r.interest_paid, 0)) as interest_collected,
                    COUNT(*) as payment_count
                FROM repayments r
                WHERE r.payment_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
                    AND r.status = 'completed'
                GROUP BY DATE_FORMAT(r.payment_date, '%Y-%m')
                ORDER BY month DESC
                LIMIT ?
            `, { replacements: [parseInt(months), parseInt(months)] });

            res.status(200).json({
                success: true,
                data: results
            });

        } catch (tableError) {
            // If repayments table doesn't exist, return mock data
            const mockData = [];
            const currentDate = new Date();
            
            for (let i = 0; i < parseInt(months); i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthStr = date.toISOString().slice(0, 7);
                
                mockData.push({
                    month: monthStr,
                    total_collected: Math.random() * 50000 + 10000,
                    principal_collected: Math.random() * 30000 + 5000,
                    interest_collected: Math.random() * 20000 + 5000,
                    payment_count: Math.floor(Math.random() * 20) + 5
                });
            }

            res.status(200).json({
                success: true,
                data: mockData.reverse()
            });
        }

    } catch (error) {
        console.error('Get monthly collections error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly collections',
            error: error.message
        });
    }
};

// @desc    Get outstanding amounts over time
// @route   GET /api/loans/stats/outstanding-trends
// @access  Private
const getOutstandingTrends = async (req, res) => {
    try {
        const { months = 12 } = req.query;
        
        const [results] = await sequelize.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(COALESCE(loan_balance, 0)) as total_outstanding,
                SUM(COALESCE(principal_balance, 0)) as principal_outstanding,
                SUM(COALESCE(interest_balance, 0)) as interest_outstanding,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans
            FROM loans 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT ?
        `, { replacements: [parseInt(months), parseInt(months)] });

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Get outstanding trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching outstanding trends',
            error: error.message
        });
    }
};



// Add these new functions to your existing loanController.js

// @desc    Get loan officer statistics
// @route   GET /api/loans/officer/:officerId/stats
// @access  Private
const getLoanOfficerStats = async (req, res) => {
    try {
        const { officerId } = req.params;

        // Get loan statistics for the officer
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_loans,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_loans,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_loans,
                COUNT(CASE WHEN status = 'disbursed' THEN 1 END) as disbursed_loans,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_loans,
                SUM(COALESCE(applied_amount, 0)) as total_applied_amount,
                SUM(COALESCE(approved_amount, 0)) as total_approved_amount,
                SUM(COALESCE(disbursed_amount, 0)) as total_disbursed_amount,
                SUM(COALESCE(loan_balance, 0)) as total_outstanding,
                AVG(COALESCE(interest_rate, 0)) as avg_interest_rate
            FROM loans 
            WHERE loan_officer_id = ?
        `, { replacements: [officerId] });

        // Get collections total (if repayments table exists)
        let collectionsTotal = 0;
        try {
            const [collections] = await sequelize.query(`
                SELECT 
                    SUM(COALESCE(r.amount_paid, 0)) as collections_total,
                    COUNT(*) as total_collections
                FROM repayments r
                JOIN loans l ON r.loan_id = l.id
                WHERE l.loan_officer_id = ? AND r.status = 'completed'
            `, { replacements: [officerId] });
            
            collectionsTotal = collections[0]?.collections_total || 0;
        } catch (error) {
            console.log('Repayments table not found, using 0 for collections');
        }

        const result = {
            ...stats[0],
            collections_total: collectionsTotal,
            total_amount: stats[0].total_approved_amount || stats[0].total_applied_amount || 0
        };

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get loan officer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan officer statistics',
            error: error.message
        });
    }
};

// @desc    Get loans assigned to a specific officer
// @route   GET /api/loans/officer/:officerId
// @access  Private
const getLoansByOfficer = async (req, res) => {
    try {
        const { officerId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            sort = 'created_at', 
            order = 'desc' 
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE l.loan_officer_id = ?';
        let replacements = [officerId];

        if (status) {
            whereClause += ' AND l.status = ?';
            replacements.push(status);
        }

        // Validate sort parameters
        const allowedSortFields = ['created_at', 'updated_at', 'loan_number', 'applied_amount', 'status'];
        const sortBy = allowedSortFields.includes(sort) ? sort : 'created_at';
        const sortOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

        // Get total count
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total 
            FROM loans l 
            ${whereClause}
        `, { replacements });

        const total = countResult[0].total;

        // Get loans
        const [loans] = await sequelize.query(`
            SELECT 
                l.id,
                l.loan_number,
                l.loan_account,
                l.status,
                l.applied_amount,
                l.approved_amount,
                l.disbursed_amount,
                l.loan_balance,
                l.interest_rate,
                l.loan_term_months,
                l.created_at,
                l.updated_at,
                l.maturity_date,
                c.first_name,
                c.last_name,
                c.client_number,
                c.mobile as client_mobile,
                c.email as client_email,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                COALESCE(l.approved_amount, l.applied_amount, 0) as amount
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            ${whereClause}
            ORDER BY l.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `, { 
            replacements: [...replacements, parseInt(limit), parseInt(offset)] 
        });

        res.status(200).json({
            success: true,
            data: {
                loans,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get loans by officer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans for officer',
            error: error.message
        });
    }
};

// @desc    Get collections made by a specific officer
// @route   GET /api/collections/officer/:officerId
// @access  Private
const getCollectionsByOfficer = async (req, res) => {
    try {
        const { officerId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sort = 'created_at', 
            order = 'desc' 
        } = req.query;

        const offset = (page - 1) * limit;

        // Check if repayments table exists
        try {
            const [collections] = await sequelize.query(`
                SELECT 
                    r.id,
                    r.loan_id,
                    r.amount_paid as amount,
                    r.payment_date as collection_date,
                    r.payment_method,
                    r.reference_number,
                    r.notes,
                    r.created_at,
                    l.loan_number,
                    l.loan_account,
                    c.first_name,
                    c.last_name,
                    c.client_number,
                    CONCAT(c.first_name, ' ', c.last_name) as client_name
                FROM repayments r
                JOIN loans l ON r.loan_id = l.id
                JOIN clients c ON l.client_id = c.id
                WHERE l.loan_officer_id = ? AND r.status = 'completed'
                ORDER BY r.${sort === 'created_at' ? 'created_at' : 'payment_date'} ${order.toUpperCase()}
                LIMIT ? OFFSET ?
            `, { 
                replacements: [officerId, parseInt(limit), parseInt(offset)] 
            });

            // Get total count
            const [countResult] = await sequelize.query(`
                SELECT COUNT(*) as total 
                FROM repayments r
                JOIN loans l ON r.loan_id = l.id
                WHERE l.loan_officer_id = ? AND r.status = 'completed'
            `, { replacements: [officerId] });

            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: {
                    collections,
                    pagination: {
                        total,
                        pages: Math.ceil(total / limit),
                        currentPage: parseInt(page),
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (tableError) {
            // If repayments table doesn't exist, return empty data
            res.status(200).json({
                success: true,
                data: {
                    collections: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        currentPage: 1,
                        limit: parseInt(limit)
                    }
                }
            });
        }

    } catch (error) {
        console.error('Get collections by officer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collections for officer',
            error: error.message
        });
    }
};






module.exports = {
    createLoan,
    getLoans,
    getLoan,
    updateLoanStatus,
    getLoansByClient,
    calculateLoanDetails,
    updateLoanPerformance,
    getLoanRepayments,
    getLoanSchedule,
    getLoanDocuments,
    uploadLoanDocument,
    getMyLoans,

    getMonthlyLoanReleases,
    getLoanStatusDistribution,
    getMonthlyCollections,
    getOutstandingTrends,


    getLoanOfficerStats,
    getLoansByOfficer,
    getCollectionsByOfficer
};
