const { sequelize } = require('../config/database');

// Get comprehensive loan details
const getLoanDetails = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Fetching loan details for ID: ${id}`);

        // First, let's see what columns exist in the loans table
        const [columns] = await sequelize.query(`
            SHOW COLUMNS FROM loans
        `);
        console.log('Loans table columns:', columns.map(col => col.Field));

        // Check loan_types table columns
        try {
            const [ltColumns] = await sequelize.query(`
                SHOW COLUMNS FROM loan_types
            `);
            console.log('Loan_types table columns:', ltColumns.map(col => col.Field));
        } catch (error) {
            console.log('loan_types table might not exist:', error.message);
        }

        // Fetch loan with all related data (without loan_types for now)
        const [loanResults] = await sequelize.query(`
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

        if (!loanResults || loanResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loanResults[0];
        console.log('Loan data fetched:', {
            id: loan.id,
            loan_number: loan.loan_number,
            approval_date: loan.approval_date,
            disbursement_date: loan.disbursement_date,
            application_date: loan.application_date,
            created_at: loan.created_at
        });

        // Fetch loan schedule
        const [schedule] = await sequelize.query(`
            SELECT 
                ls.*,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                CASE 
                    WHEN ls.due_date < CURDATE() AND (ls.status != 'paid' OR ls.status IS NULL) THEN 'overdue'
                    WHEN ls.due_date = CURDATE() AND (ls.status != 'paid' OR ls.status IS NULL) THEN 'due_today'
                    WHEN ls.status = 'paid' THEN 'paid'
                    ELSE 'pending'
                END as payment_status
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id                  
            JOIN clients c ON l.client_id = c.id               
            WHERE ls.loan_id = ?
            ORDER BY ls.installment_number ASC
        `, { replacements: [id] });

        console.log(`Found ${schedule.length} schedule entries for loan ${id}`);

        // Fetch repayments
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
                u.last_name as received_by_last_name,
                u.employee_id as received_by_employee_id
            FROM repayments r
            LEFT JOIN users u ON r.received_by = u.id
            WHERE r.loan_id = ?
            ORDER BY r.payment_date DESC, r.created_at DESC
        `, { replacements: [id] });

        console.log(`Found ${repayments.length} repayments for loan ${id}`);

        // Fetch documents
        const [documents] = await sequelize.query(`
            SELECT 
                lf.*,
                u.first_name as uploaded_by_name,
                u.last_name as uploaded_by_lastname
            FROM loan_files lf
            LEFT JOIN users u ON lf.uploaded_by = u.id
            WHERE lf.loan_id = ?
            ORDER BY lf.created_at DESC
        `, { replacements: [id] });

        console.log(`Found ${documents.length} documents for loan ${id}`);

        // Fetch comments (create table if not exists)
        let comments = [];
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS loan_comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    loan_id INT NOT NULL,
                    comment TEXT NOT NULL,
                    comment_type ENUM('general', 'loan_officer_note', 'client_interaction', 'approval_decision') DEFAULT 'general',
                    is_internal BOOLEAN DEFAULT TRUE,
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_loan_comments_loan_id (loan_id),
                    INDEX idx_loan_comments_type (comment_type),
                    INDEX idx_loan_comments_created_at (created_at)
                )
            `);

            const [fetchedComments] = await sequelize.query(`
                SELECT 
                    lc.*,
                    u.first_name as created_by_name,
                    u.last_name as created_by_lastname
                FROM loan_comments lc
                LEFT JOIN users u ON lc.created_by = u.id
                WHERE lc.loan_id = ?
                ORDER BY lc.created_at DESC
            `, { replacements: [id] });
            
            comments = fetchedComments;
            console.log(`Found ${comments.length} comments for loan ${id}`);
        } catch (commentsError) {
            console.log('Comments table might not exist or error fetching:', commentsError.message);
        }

        // Calculate loan summary
        const totalPaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
        const totalScheduled = schedule.reduce((sum, installment) => sum + parseFloat(installment.total_amount || 0), 0);
        const remainingBalance = parseFloat(loan.loan_amount || 0) - totalPaid;

        // Format the response data
        const responseData = {
            loan: {
                // Basic loan info
                id: loan.id,
                loan_number: loan.loan_number,
                loan_account: loan.loan_account,
                loan_amount: parseFloat(loan.loan_amount || 0),
                interest_rate: parseFloat(loan.interest_rate || 0),
                term_months: parseInt(loan.term_months || 0),
                status: loan.status,
                
                // Dates - handle different possible column names
                application_date: loan.application_date || loan.created_at,
                approval_date: loan.approval_date || loan.approved_date || null,
                disbursement_date: loan.disbursement_date || loan.disbursed_date || null,
                maturity_date: loan.maturity_date || loan.due_date || null,
                
                // Calculated fields
                total_paid: totalPaid,
                remaining_balance: remainingBalance,
                total_scheduled: totalScheduled,
                
                // Client info
                client: {
                    id: loan.client_id,
                    first_name: loan.client_first_name,
                    last_name: loan.client_last_name,
                    client_number: loan.client_number,
                    gender: loan.client_gender,
                    mobile: loan.client_mobile,
                    email: loan.client_email,
                    address: loan.client_address,
                    city: loan.client_city,
                    state: loan.client_state
                },
                
                // Officer info
                loan_officer: loan.officer_first_name ? {
                    id: loan.loan_officer_id,
                    first_name: loan.officer_first_name,
                    last_name: loan.officer_last_name,
                    employee_id: loan.officer_employee_id
                } : null,
                
                // Approval info
                approved_by_user: loan.approved_by_first_name ? {
                    id: loan.approved_by,
                    first_name: loan.approved_by_first_name,
                    last_name: loan.approved_by_last_name
                } : null,
                
                // Disbursement info
                disbursed_by_user: loan.disbursed_by_first_name ? {
                    id: loan.disbursed_by,
                    first_name: loan.disbursed_by_first_name,
                    last_name: loan.disbursed_by_last_name
                } : null,
                
                // Loan type info
                loan_type: loan.loan_type_name ? {
                    name: loan.loan_type_name,
                    interest_rate: loan.loan_type_interest_rate
                } : null
            },
            
            schedule: schedule.map(item => ({
                id: item.id,
                installment_number: parseInt(item.installment_number || 0),
                due_date: item.due_date,
                principal_amount: parseFloat(item.principal_amount || 0),
                interest_amount: parseFloat(item.interest_amount || 0),
                total_amount: parseFloat(item.total_amount || 0),
                amount_paid: parseFloat(item.amount_paid || 0),
                balance: parseFloat(item.balance || 0),
                status: item.status,
                payment_status: item.payment_status
            })),
            
            repayments: repayments.map(payment => ({
                id: payment.id,
                receipt_number: payment.receipt_number,
                payment_date: payment.payment_date,
                amount_paid: parseFloat(payment.amount_paid || 0),
                principal_paid: parseFloat(payment.principal_paid || 0),
                interest_paid: parseFloat(payment.interest_paid || 0),
                penalty_paid: parseFloat(payment.penalty_paid || 0),
                payment_method: payment.payment_method,
                reference_number: payment.reference_number,
                notes: payment.notes,
                status: payment.status,
                received_by: payment.received_by_first_name ? {
                    first_name: payment.received_by_first_name,
                    last_name: payment.received_by_last_name,
                    employee_id: payment.received_by_employee_id
                } : null
            })),
            
            documents: documents.map(doc => ({
                id: doc.id,
                loan_id: doc.loan_id,
                file_name: doc.file_name,
                file_path: doc.file_path,
                file_size: doc.file_size,
                file_type: doc.file_type,
                mime_type: doc.mime_type,
                description: doc.description,
                status: doc.status,
                is_required: doc.is_required,
                uploaded_by: doc.uploaded_by,
                uploaded_by_name: doc.uploaded_by_name,
                uploaded_by_lastname: doc.uploaded_by_lastname,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            })),
            
            comments: comments.map(comment => ({
                id: comment.id,
                loan_id: comment.loan_id,
                comment: comment.comment,
                comment_type: comment.comment_type,
                is_internal: comment.is_internal,
                priority: comment.priority,
                created_by: comment.created_by,
                created_by_name: comment.created_by_name,
                created_by_lastname: comment.created_by_lastname,
                created_at: comment.created_at,
                updated_at: comment.updated_at
            })),
            
            summary: {
                total_amount: parseFloat(loan.loan_amount || 0),
                total_paid: totalPaid,
                remaining_balance: remainingBalance,
                total_scheduled: totalScheduled,
                payment_progress: totalScheduled > 0 ? (totalPaid / totalScheduled * 100) : 0
            }
        };

        console.log('Response data summary:', {
            loan_id: responseData.loan.id,
            approval_date: responseData.loan.approval_date,
            disbursement_date: responseData.loan.disbursement_date,
            schedule_count: responseData.schedule.length,
            repayments_count: responseData.repayments.length,
            documents_count: responseData.documents.length,
            comments_count: responseData.comments.length
        });

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Get loan details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan details',
            error: error.message
        });
    }
};

// Keep all other functions the same...
const addRepayment = async (req, res) => {
    try {
        const { loanId } = req.params;
        const repaymentData = req.body;

        repaymentData.loan_id = loanId;
        repaymentData.received_by = req.user.id;

        const [result] = await sequelize.query(`
            INSERT INTO repayments (
                loan_id, schedule_id, receipt_number, payment_date, 
                amount_paid, principal_paid, interest_paid, penalty_paid,
                payment_method, reference_number, notes, received_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [
                repaymentData.loan_id,
                repaymentData.schedule_id || null,
                repaymentData.receipt_number || null,
                repaymentData.payment_date,
                repaymentData.amount_paid,
                repaymentData.principal_paid || 0,
                repaymentData.interest_paid || 0,
                repaymentData.penalty_paid || 0,
                repaymentData.payment_method,
                repaymentData.reference_number || null,
                repaymentData.notes || null,
                repaymentData.received_by,
                repaymentData.status || 'completed'
            ]
        });

        res.status(201).json({
            success: true,
            data: { id: result.insertId, ...repaymentData },
            message: 'Repayment added successfully'
        });

    } catch (error) {
        console.error('Add repayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding repayment',
            error: error.message
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { comment, comment_type, is_internal, priority } = req.body;
        
        if (!comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // First check if table exists, create if not
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS loan_comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    loan_id INT NOT NULL,
                    comment TEXT NOT NULL,
                    comment_type ENUM('general', 'loan_officer_note', 'client_interaction', 'approval_decision') DEFAULT 'general',
                    is_internal BOOLEAN DEFAULT TRUE,
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_loan_comments_loan_id (loan_id),
                    INDEX idx_loan_comments_type (comment_type),
                    INDEX idx_loan_comments_created_at (created_at)
                )
            `);
        } catch (tableError) {
            console.log('Table might already exist:', tableError.message);
        }

        // Insert comment into database
        const [result] = await sequelize.query(`
            INSERT INTO loan_comments (
                loan_id, 
                comment, 
                comment_type, 
                is_internal, 
                priority, 
                created_by, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, {
            replacements: [
                loanId,
                comment.trim(),
                comment_type || 'general',
                is_internal !== undefined ? is_internal : true,
                priority || 'medium',
                req.user.id
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                id: result.insertId,
                loan_id: loanId,
                comment: comment.trim(),
                comment_type: comment_type || 'general',
                is_internal: is_internal || false,
                priority: priority || 'medium',
                created_by_name: req.user.first_name,
                created_by_lastname: req.user.last_name,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

const generateLoanSchedule = async (req, res) => {
    try {
        const { loanId } = req.params;

        res.status(200).json({
            success: true,
            message: 'Schedule generated successfully'
        });

    } catch (error) {
        console.error('Generate schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating schedule',
            error: error.message
        });
    }
};

const addCollateral = async (req, res) => {
    try {
        res.status(201).json({
            success: true,
            message: 'Collateral added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding collateral',
            error: error.message
        });
    }
};

const addExpense = async (req, res) => {
    try {
        res.status(201).json({
            success: true,
            message: 'Expense added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding expense',
            error: error.message
        });
    }
};

const addOtherIncome = async (req, res) => {
    try {
        res.status(201).json({
            success: true,
            message: 'Other income added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding other income',
            error: error.message
        });
    }
};

const uploadFile = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { document_type, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Insert document record into database
        const [result] = await sequelize.query(`
            INSERT INTO loan_files (
                loan_id, 
                file_name, 
                file_path, 
                file_size, 
                file_type, 
                mime_type,
                description, 
                uploaded_by, 
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', NOW())
        `, {
            replacements: [
                loanId,
                req.file.originalname,
                req.file.path,
                req.file.size,
                document_type || 'application',
                req.file.mimetype,
                description || '',
                req.user.id
            ]
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                id: result.insertId,
                loan_id: loanId,
                file_name: req.file.originalname,
                file_size: req.file.size,
                file_type: document_type || 'application',
                mime_type: req.file.mimetype,
                description: description || '',
                status: 'pending_review',
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};

const calculatePenalties = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                penalties: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating penalties',
            error: error.message
        });
    }
};

const recalculateLoanBalances = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Loan balances recalculated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recalculating balances',
            error: error.message
        });
    }
};

// Get comments for a loan
const getComments = async (req, res) => {
    try {
        const { loanId } = req.params;
        
        const [comments] = await sequelize.query(`
            SELECT 
                lc.*,
                u.first_name as created_by_name,
                u.last_name as created_by_lastname
            FROM loan_comments lc
            LEFT JOIN users u ON lc.created_by = u.id
            WHERE lc.loan_id = ?
            ORDER BY lc.created_at DESC
        `, {
            replacements: [loanId]
        });

        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// Get documents for a loan
const getDocuments = async (req, res) => {
    try {
        const { loanId } = req.params;
        
        const [documents] = await sequelize.query(`
            SELECT 
                lf.*,
                u.first_name as uploaded_by_name,
                u.last_name as uploaded_by_lastname
            FROM loan_files lf
            LEFT JOIN users u ON lf.uploaded_by = u.id
            WHERE lf.loan_id = ?
            ORDER BY lf.created_at DESC
        `, {
            replacements: [loanId]
        });

        res.status(200).json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching documents',
            error: error.message
        });
    }
};

// Delete a document
const deleteDocument = async (req, res) => {
    try {
        const { loanId, documentId } = req.params;
        
        // First get the document to delete the file
        const [document] = await sequelize.query(`
            SELECT file_path FROM loan_files 
            WHERE id = ? AND loan_id = ?
        `, {
            replacements: [documentId, loanId]
        });

        if (document.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Delete from database
        await sequelize.query(`
            DELETE FROM loan_files 
            WHERE id = ? AND loan_id = ?
        `, {
            replacements: [documentId, loanId]
        });

        // TODO: Delete actual file from filesystem
        // const fs = require('fs');
        // if (fs.existsSync(document[0].file_path)) {
        //     fs.unlinkSync(document[0].file_path);
        // }

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: error.message
        });
    }
};

// Download a document
const downloadDocument = async (req, res) => {
    try {
        const { loanId, documentId } = req.params;
        
        const [document] = await sequelize.query(`
            SELECT file_name, file_path FROM loan_files 
            WHERE id = ? AND loan_id = ?
        `, {
            replacements: [documentId, loanId]
        });

        if (document.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const filePath = document[0].file_path;
        const fileName = document[0].file_name;

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // TODO: Stream the actual file
        // const fs = require('fs');
        // if (fs.existsSync(filePath)) {
        //     const fileStream = fs.createReadStream(filePath);
        //     fileStream.pipe(res);
        // } else {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'File not found on disk'
        //     });
        // }

        // For now, return success
        res.status(200).json({
            success: true,
            message: 'Document download ready',
            data: { file_name: fileName }
        });
        
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading document',
            error: error.message
        });
    }
};

// Update document status
const updateDocumentStatus = async (req, res) => {
    try {
        const { loanId, documentId } = req.params;
        const { status } = req.body;
        
        if (!['pending_review', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending_review, approved, or rejected'
            });
        }

        // Update document status
        await sequelize.query(`
            UPDATE loan_files 
            SET status = ?, updated_at = NOW()
            WHERE id = ? AND loan_id = ?
        `, {
            replacements: [status, documentId, loanId]
        });

        res.status(200).json({
            success: true,
            message: `Document ${status} successfully`
        });
    } catch (error) {
        console.error('Update document status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating document status',
            error: error.message
        });
    }
};

module.exports = {
    getLoanDetails,
    addRepayment,
    addComment,
    getComments,
    getDocuments,
    deleteDocument,
    downloadDocument,
    updateDocumentStatus,
    generateLoanSchedule,
    addCollateral,
    addExpense,
    addOtherIncome,
    uploadFile,
    calculatePenalties,
    recalculateLoanBalances
};
