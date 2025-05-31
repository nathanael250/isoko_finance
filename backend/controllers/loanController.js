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
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        console.log('💰 Loan application request received');
        console.log('Request body:', req.body);
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
        const [result, metadata] = await sequelize.query(`
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

        // Get the loan ID - FIXED: Use result directly for INSERT queries
        const loanId = result;
        console.log('✅ Loan created with ID:', loanId);

        // Alternative method if above doesn't work - get the loan by loan_number
        if (!loanId) {
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

            const actualLoanId = createdLoan[0].id;
            console.log('✅ Retrieved loan ID:', actualLoanId);

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
                        actualLoanId,
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
        } else {
            // Save loan schedule using the direct ID
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

        // Use the existing repayments table structure from your repaymentController
        const [repayments] = await sequelize.query(`
            SELECT 
                r.*,
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
            limit = 10,
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

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total FROM loans l JOIN clients c ON l.client_id = c.id${whereClause}`,
            { replacements }
        );

        const total = countResult[0].total;

        // Get loans with comprehensive details and calculations
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
                u.last_name as officer_last_name,
                u.employee_id as officer_employee_id,
                u2.first_name as approved_by_first_name,
                u2.last_name as approved_by_last_name,
                
                -- Calculate principal (use disbursed_amount, then approved_amount, then applied_amount)
                COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount, 0) as principal,
                
                -- Calculate total due based on interest calculation method
                CASE 
                    WHEN l.interest_rate_method = 'flat' THEN 
                        COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount, 0) + 
                        (COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount, 0) * l.interest_rate * l.loan_term_months / 100 / 12)
                    ELSE 
                        -- For reducing balance, use installment_amount * total_installments if available
                        COALESCE(l.installment_amount * l.total_installments, 
                                COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount, 0))
                END as total_due,
                
                -- Calculate amount paid (total_installments - installments_outstanding) * installment_amount
                COALESCE(
                    (l.total_installments - l.installments_outstanding) * l.installment_amount,
                    0
                ) as total_paid,
                
                -- Calculate balance
                COALESCE(l.loan_balance, l.principal_balance, 
                    COALESCE(l.disbursed_amount, l.approved_amount, l.applied_amount, 0)
                ) as balance,
                
                -- Last payment info (you might need to join with payments table if you have one)
                l.last_payment_date,
                l.installment_amount as last_payment_amount,
                
                -- Payment progress
                COALESCE(l.total_installments - l.installments_outstanding, 0) as installments_paid,
                l.total_installments,
                l.installments_outstanding,
                
                -- Interest rate
                l.interest_rate as nominal_interest_rate,
                l.interest_rate_method as interest_calculation_method
                
            FROM loans l
            JOIN clients c ON l.client_id = c.id
            LEFT JOIN users u ON l.loan_officer_id = u.id
            LEFT JOIN users u2 ON l.approved_by = u2.id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, parseInt(limit), parseInt(offset)]
        });

        // Process loans to ensure proper data types and add calculated fields
        const processedLoans = loans.map(loan => {
            const principal = parseFloat(loan.principal || 0);
            const interestRate = parseFloat(loan.nominal_interest_rate || 0);
            const termMonths = parseInt(loan.loan_term_months || 0);
            const installmentAmount = parseFloat(loan.installment_amount || 0);
            const totalInstallments = parseInt(loan.total_installments || 0);
            const installmentsPaid = parseInt(loan.installments_paid || 0);

            // Recalculate total_due if needed
            let totalDue = parseFloat(loan.total_due || 0);
            if (totalDue === 0 && principal > 0 && interestRate > 0 && termMonths > 0) {
                if (loan.interest_calculation_method === 'flat') {
                    const totalInterest = (principal * interestRate * termMonths) / (100 * 12);
                    totalDue = principal + totalInterest;
                } else {
                    // Reducing balance
                    const monthlyRate = interestRate / 100 / 12;
                    if (monthlyRate > 0) {
                        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                            (Math.pow(1 + monthlyRate, termMonths) - 1);
                        totalDue = monthlyPayment * termMonths;
                    }
                }
            }

            // Calculate total paid
            let totalPaid = parseFloat(loan.total_paid || 0);
            if (totalPaid === 0 && installmentAmount > 0 && installmentsPaid > 0) {
                totalPaid = installmentAmount * installmentsPaid;
            }

            // Calculate balance
            let balance = parseFloat(loan.balance || 0);
            if (balance === 0 || balance === principal) {
                balance = totalDue - totalPaid;
            }

            return {
                ...loan,
                id: parseInt(loan.id),
                principal: principal,
                total_due: totalDue,
                total_paid: totalPaid,
                balance: Math.max(0, balance), // Ensure balance is not negative
                nominal_interest_rate: interestRate,
                loan_term_months: termMonths,
                installment_amount: installmentAmount,
                total_installments: totalInstallments,
                installments_paid: installmentsPaid,
                installments_outstanding: parseInt(loan.installments_outstanding || 0),
                days_in_arrears: parseInt(loan.days_in_arrears || 0),
                // Format client name
                client_name: `${loan.client_first_name || ''} ${loan.client_last_name || ''}`.trim(),
                // Format dates
                last_payment_date: loan.last_payment_date,
                disbursement_date: loan.disbursement_date,
                application_date: loan.application_date,
                maturity_date: loan.maturity_date
            };
        });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                loans: processedLoans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: totalPages
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

        const [loans] = await sequelize.query(`
            SELECT 
                l.*,
                u1.first_name as officer_first_name,
                u1.last_name as officer_last_name,
                u2.first_name as approved_by_first_name,
                u2.last_name as approved_by_last_name
            FROM loans l
            LEFT JOIN users u1 ON l.loan_officer_id = u1.id
            LEFT JOIN users u2 ON l.approved_by = u2.id
            WHERE l.client_id = ?
            ORDER BY l.created_at DESC
        `, { replacements: [clientId] });

        res.status(200).json({
            success: true,
            data: { loans }
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

        // Get current loan details
        const [loans] = await sequelize.query(
            'SELECT * FROM loans WHERE id = ? AND status IN (?, ?)',
            { replacements: [id, 'active', 'disbursed'] }
        );

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Active loan not found'
            });
        }

        const loan = loans[0];
        const today = new Date();
        const maturityDate = new Date(loan.maturity_date);

        // Calculate days in arrears
        let daysInArrears = 0;
        let performanceClass = 'performing';

        if (today > maturityDate) {
            daysInArrears = Math.floor((today - maturityDate) / (1000 * 60 * 60 * 24));
        }

        // Determine performance classification based on days in arrears
        if (daysInArrears === 0) {
            performanceClass = 'performing';
        } else if (daysInArrears <= 30) {
            performanceClass = 'watch';
        } else if (daysInArrears <= 90) {
            performanceClass = 'substandard';
        } else if (daysInArrears <= 180) {
            performanceClass = 'doubtful';
        } else {
            performanceClass = 'loss';
        }

        // Update loan performance
        const updateFields = [
            'days_in_arrears = ?',
            'performance_class = ?',
            'updated_at = NOW()'
        ];
        const replacements = [daysInArrears, performanceClass];

        // Set arrears start date if not already set and loan is in arrears
        if (daysInArrears > 0 && !loan.arrears_start_date) {
            updateFields.push('arrears_start_date = ?');
            const arrearsStartDate = new Date(maturityDate);
            arrearsStartDate.setDate(arrearsStartDate.getDate() + 1);
            replacements.push(arrearsStartDate.toISOString().split('T')[0]);
        }

        replacements.push(id);

        await sequelize.query(
            `UPDATE loans SET ${updateFields.join(', ')} WHERE id = ?`,
            { replacements }
        );

        res.status(200).json({
            success: true,
            message: 'Loan performance updated successfully',
            data: {
                loan_id: id,
                days_in_arrears: daysInArrears,
                performance_class: performanceClass
            }
        });

    } catch (error) {
        console.error('Update loan performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating loan performance',
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
    getLoanSchedule,
    getLoanRepayments,
    getLoanDocuments,
    uploadLoanDocument
};
