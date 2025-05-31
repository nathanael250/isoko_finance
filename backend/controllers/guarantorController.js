const { sequelize } = require('../config/database');
const { validationResult } = require('express-validator');
const defineGuarantorModel = require('../models/Guarantor');
const defineGuarantorFileModel = require('../models/GuarantorFile');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

let Guarantor, GuarantorFile;

const getModels = () => {
    if (!Guarantor) {
        Guarantor = defineGuarantorModel(sequelize);
    }
    if (!GuarantorFile) {
        GuarantorFile = defineGuarantorFileModel(sequelize);
    }
    return { Guarantor, GuarantorFile };
};

// Configure multer for file uploads (same as before)
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/guarantors');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `guarantor-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG) and documents (PDF, DOC, DOCX) are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// @desc    Create new guarantor for a specific loan
// @route   POST /api/guarantors
// @access  Private
const createGuarantor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        console.log('👤 Creating new guarantor with loan relationship');

        const { Guarantor } = getModels();

        const {
            // Personal info
            country, first_name, middle_name, last_name, title, gender, date_of_birth,
            business_name, unique_name, unique_number, email, phone, phone_secondary,
            address, city, province, zipcode, working_status, occupation, employer_name,
            employer_address, monthly_income, income_source, net_worth, bank_name,
            bank_account_number, bank_branch, description,
            
            // Loan relationship fields
            loan_id, client_id, relationship_to_borrower, relationship_duration,
            relationship_description, guarantee_amount, guarantee_percentage,
            guarantee_type, liability_type, guarantee_conditions, collateral_provided,
            collateral_description, collateral_value, maximum_guarantee_amount
        } = req.body;

        // Validate loan exists if loan_id provided
        if (loan_id) {
            const [loans] = await sequelize.query(
                'SELECT id, applied_amount, status, client_id FROM loans WHERE id = ?',
                { replacements: [loan_id] }
            );

            if (loans.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Loan not found'
                });
            }

            const loan = loans[0];
            
            // Validate loan status
            if (!['pending', 'under_review', 'approved'].includes(loan.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add guarantor to loan with current status'
                });
            }

            // Auto-set client_id from loan if not provided
            if (!client_id && loan.client_id) {
                req.body.client_id = loan.client_id;
            }
        }

        // Validate client exists if client_id provided
        if (client_id || req.body.client_id) {
            const clientIdToCheck = client_id || req.body.client_id;
            const [clients] = await sequelize.query(
                'SELECT id, first_name, last_name, status FROM clients WHERE id = ?',
                { replacements: [clientIdToCheck] }
            );

            if (clients.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
        }

        // Check for existing guarantor with same unique_number
        const existingGuarantor = await Guarantor.findByUniqueNumber(unique_number);
        if (existingGuarantor) {
            return res.status(400).json({
                success: false,
                message: 'Guarantor with this unique number already exists',
                data: {
                    existing_guarantor_id: existingGuarantor.id,
                    existing_guarantor_name: existingGuarantor.getFullName()
                }
            });
        }

        // Check for existing guarantor with same phone
        const existingPhone = await Guarantor.findByPhone(phone);
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Guarantor with this phone number already exists'
            });
        }

        // Generate guarantor number
        const guarantor_number = await Guarantor.generateGuarantorNumber();

        // Calculate guarantee amount if percentage provided
        let finalGuaranteeAmount = guarantee_amount;
        if (!finalGuaranteeAmount && guarantee_percentage && loan_id) {
            const [loans] = await sequelize.query(
                'SELECT applied_amount FROM loans WHERE id = ?',
                { replacements: [loan_id] }
            );
            if (loans.length > 0) {
                finalGuaranteeAmount = (loans[0].applied_amount * guarantee_percentage) / 100;
            }
        }

        // Calculate available guarantee capacity
        const maxGuaranteeAmount = maximum_guarantee_amount || finalGuaranteeAmount || 0;
        const availableCapacity = maxGuaranteeAmount - (finalGuaranteeAmount || 0);

        // Prepare guarantor data
        const guarantorData = {
            guarantor_number,
            country: country || 'Rwanda',
            first_name,
            middle_name,
            last_name,
            title,
            gender,
            date_of_birth,
            business_name,
            unique_name,
            unique_number,
            email,
            phone,
            phone_secondary,
            address,
            city,
            province,
            zipcode,
            working_status: working_status || 'employed',
            occupation,
            employer_name,
            employer_address,
            monthly_income: monthly_income ? parseFloat(monthly_income) : null,
            income_source,
            net_worth: net_worth ? parseFloat(net_worth) : null,
            bank_name,
            bank_account_number,
            bank_branch,
            description,
            
            // Loan relationship fields
            loan_id: loan_id || null,
            client_id: client_id || req.body.client_id || null,
            relationship_to_borrower,
            relationship_duration,
            relationship_description,
            guarantee_amount: finalGuaranteeAmount ? parseFloat(finalGuaranteeAmount) : null,
            guarantee_percentage: guarantee_percentage ? parseFloat(guarantee_percentage) : null,
            guarantee_type: guarantee_type || 'partial',
            liability_type: liability_type || 'primary',
            guarantee_conditions,
            collateral_provided: collateral_provided || false,
            collateral_description,
            collateral_value: collateral_value ? parseFloat(collateral_value) : null,
            
            // Capacity management
            maximum_guarantee_amount: maxGuaranteeAmount ? parseFloat(maxGuaranteeAmount) : null,
            current_total_guarantee_amount: finalGuaranteeAmount ? parseFloat(finalGuaranteeAmount) : 0,
            available_guarantee_capacity: availableCapacity,
            
            // Status fields
            status: 'pending',
            verification_status: 'not_verified',
            guarantee_status: 'pending',
            guarantor_consent: false,
            
            // Staff assignment
            loan_officer_id: req.user?.userId || null,
            created_by: req.user?.userId || null
        };

        // Create guarantor
        const newGuarantor = await Guarantor.create(guarantorData);

        console.log('✅ Guarantor created successfully:', guarantor_number);

        // Get complete guarantor data with relationships
        const [guarantorWithRelations] = await sequelize.query(`
            SELECT 
                g.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                l.loan_number,
                l.applied_amount as loan_amount,
                l.status as loan_status,
                u.first_name as officer_first_name,
                u.last_name as officer_last_name
            FROM guarantors g
            LEFT JOIN clients c ON g.client_id = c.id
            LEFT JOIN loans l ON g.loan_id = l.id
            LEFT JOIN users u ON g.loan_officer_id = u.id
            WHERE g.id = ?
        `, { replacements: [newGuarantor.id] });

        res.status(201).json({
            success: true,
            message: 'Guarantor created successfully',
            data: {
                guarantor: guarantorWithRelations[0]
            }
        });

    } catch (error) {
        console.error('Create guarantor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating guarantor',
            error: error.message
        });
    }
};

// @desc    Get guarantors with loan relationships
// @route   GET /api/guarantors
// @access  Private
const getGuarantors = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            verification_status,
            guarantee_status,
            loan_id,
            client_id,
            loan_officer_id,
            working_status,
            relationship_to_borrower,
            country,
            province,
            search
        } = req.query;

        const offset = (page - 1) * limit;

        let whereClause = '';
        let replacements = [];
        const conditions = [];

        // Build WHERE conditions
        if (status) {
            conditions.push('g.status = ?');
            replacements.push(status);
        }

        if (verification_status) {
            conditions.push('g.verification_status = ?');
            replacements.push(verification_status);
        }

        if (guarantee_status) {
            conditions.push('g.guarantee_status = ?');
            replacements.push(guarantee_status);
        }

        if (loan_id) {
            conditions.push('g.loan_id = ?');
            replacements.push(loan_id);
        }

        if (client_id) {
            conditions.push('g.client_id = ?');
            replacements.push(client_id);
        }

        if (loan_officer_id) {
            conditions.push('g.loan_officer_id = ?');
            replacements.push(loan_officer_id);
        }

        if (working_status) {
            conditions.push('g.working_status = ?');
            replacements.push(working_status);
        }

        if (relationship_to_borrower) {
            conditions.push('g.relationship_to_borrower = ?');
            replacements.push(relationship_to_borrower);
        }

        if (country) {
            conditions.push('g.country = ?');
            replacements.push(country);
        }

        if (province) {
            conditions.push('g.province = ?');
            replacements.push(province);
        }

        if (search) {
            conditions.push(`(
                g.guarantor_number LIKE ? OR 
                g.first_name LIKE ? OR 
                g.last_name LIKE ? OR 
                g.unique_number LIKE ? OR 
                g.phone LIKE ? OR 
                g.email LIKE ?
            )`);
            const searchTerm = `%${search}%`;
            replacements.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Role-based access control
        if (req.user.role === 'loan-officer') {
            conditions.push('g.loan_officer_id = ?');
            replacements.push(req.user.userId);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        // Get total count
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as total FROM guarantors g${whereClause}`,
            { replacements }
        );

        const total = countResult[0].total;

        // Get guarantors with relationships
        const [guarantors] = await sequelize.query(`
            SELECT 
                g.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                c.status as client_status,
                l.loan_number,
                l.applied_amount as loan_amount,
                l.approved_amount,
                l.status as loan_status,
                u1.first_name as officer_first_name,
                u1.last_name as officer_last_name,
                u2.first_name as created_by_first_name,
                u2.last_name as created_by_last_name,
                u3.first_name as verified_by_first_name,
                u3.last_name as verified_by_last_name,
                COUNT(gf.id) as total_files,
                COUNT(CASE WHEN gf.is_verified = 1 THEN 1 END) as verified_files
            FROM guarantors g
            LEFT JOIN clients c ON g.client_id = c.id
            LEFT JOIN loans l ON g.loan_id = l.id
            LEFT JOIN users u1 ON g.loan_officer_id = u1.id
            LEFT JOIN users u2 ON g.created_by = u2.id
            LEFT JOIN users u3 ON g.verified_by = u3.id
            LEFT JOIN guarantor_files gf ON g.id = gf.guarantor_id
            ${whereClause}
            GROUP BY g.id
            ORDER BY g.created_at DESC
            LIMIT ? OFFSET ?
        `, {
            replacements: [...replacements, parseInt(limit), parseInt(offset)]
        });

        res.status(200).json({
            success: true,
            data: {
                guarantors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get guarantors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching guarantors',
            error: error.message
        });
    }
};

// @desc    Get guarantors for a specific loan
// @route   GET /api/guarantors/loan/:loanId
// @access  Private
const getGuarantorsByLoan = async (req, res) => {
    try {
        const { loanId } = req.params;

        // Verify loan exists
        const [loans] = await sequelize.query(
            'SELECT id, loan_number, applied_amount, status FROM loans WHERE id = ?',
            { replacements: [loanId] }
        );

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const loan = loans[0];

        // Get guarantors for this loan
        const [guarantors] = await sequelize.query(`
            SELECT 
                g.*,
                c.first_name as client_first_name,
                c.last_name as client_last_name,
                c.client_number,
                u.first_name as officer_first_name,
                u.last_name as officer_last_name
            FROM guarantors g
            LEFT JOIN clients c ON g.client_id = c.id
            LEFT JOIN users u ON g.loan_officer_id = u.id
            WHERE g.loan_id = ?
            ORDER BY g.created_at DESC
        `, { replacements: [loanId] });

        // Calculate guarantee summary
        const totalGuaranteeAmount = guarantors.reduce((sum, g) => sum + (parseFloat(g.guarantee_amount) || 0), 0);
        const totalGuaranteePercentage = guarantors.reduce((sum, g) => sum + (parseFloat(g.guarantee_percentage) || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                loan: loan,
                guarantors: guarantors,
                summary: {
                    total_guarantors: guarantors.length,
                    active_guarantors: guarantors.filter(g => g.guarantee_status === 'active').length,
                    pending_guarantors: guarantors.filter(g => g.guarantee_status === 'pending').length,
                    total_guarantee_amount: totalGuaranteeAmount,
                    total_guarantee_percentage: totalGuaranteePercentage,
                    loan_coverage: loan.applied_amount > 0 ? (totalGuaranteeAmount / loan.applied_amount * 100) : 0
                }
            }
        });

    } catch (error) {
        console.error('Get guarantors by loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan guarantors',
            error: error.message
        });
    }
};

// @desc    Get guarantors for a specific client
// @route   GET /api/guarantors/client/:clientId
// @access  Private
const getGuarantorsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Verify client exists
        const [clients] = await sequelize.query(
            'SELECT id, client_number, first_name, last_name FROM clients WHERE id = ?',
            { replacements: [clientId] }
        );

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const client = clients[0];

        // Get guarantors for this client
        const [guarantors] = await sequelize.query(`
            SELECT 
                g.*,
                l.loan_number,
                l.applied_amount as loan_amount,
                l.status as loan_status,
                u.first_name as officer_first_name,
                u.last_name as officer_last_name
            FROM guarantors g
            LEFT JOIN loans l ON g.loan_id = l.id
            LEFT JOIN users u ON g.loan_officer_id = u.id
            WHERE g.client_id = ?
            ORDER BY g.created_at DESC
        `, { replacements: [clientId] });

        res.status(200).json({
            success: true,
            data: {
                client: client,
                guarantors: guarantors,
                summary: {
                    total_guarantors: guarantors.length,
                    active_guarantors: guarantors.filter(g => g.guarantee_status === 'active').length,
                    total_guarantee_amount: guarantors.reduce((sum, g) => sum + (parseFloat(g.guarantee_amount) || 0), 0)
                }
            }
        });

    } catch (error) {
        console.error('Get guarantors by client error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching client guarantors',
            error: error.message
        });
    }
};

// @desc    Update guarantor guarantee details
// @route   PUT /api/guarantors/:id/guarantee
// @access  Private
const updateGuarantorGuarantee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            guarantee_amount,
            guarantee_percentage,
            guarantee_type,
            liability_type,
            guarantee_conditions,
            collateral_provided,
            collateral_description,
            collateral_value,
            maximum_guarantee_amount
        } = req.body;

        const { Guarantor } = getModels();

        const guarantor = await Guarantor.findByPk(id);
        if (!guarantor) {
            return res.status(404).json({
                success: false,
                message: 'Guarantor not found'
            });
        }

        // Role-based access control
        if (req.user.role === 'loan-officer' && guarantor.loan_officer_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Calculate new guarantee amount if percentage provided
        let finalGuaranteeAmount = guarantee_amount;
        if (!finalGuaranteeAmount && guarantee_percentage && guarantor.loan_id) {
            const [loans] = await sequelize.query(
                'SELECT applied_amount FROM loans WHERE id = ?',
                { replacements: [guarantor.loan_id] }
            );
            if (loans.length > 0) {
                finalGuaranteeAmount = (loans[0].applied_amount * guarantee_percentage) / 100;
            }
        }

        // Update guarantee details
        const updateData = {
            last_updated_by: req.user.userId
        };

        if (finalGuaranteeAmount !== undefined) {
            updateData.guarantee_amount = parseFloat(finalGuaranteeAmount);
            updateData.current_total_guarantee_amount = parseFloat(finalGuaranteeAmount);
        }
        if (guarantee_percentage !== undefined) updateData.guarantee_percentage = parseFloat(guarantee_percentage);
        if (guarantee_type) updateData.guarantee_type = guarantee_type;
        if (liability_type) updateData.liability_type = liability_type;
        if (guarantee_conditions) updateData.guarantee_conditions = guarantee_conditions;
        if (collateral_provided !== undefined) updateData.collateral_provided = collateral_provided;
        if (collateral_description) updateData.collateral_description = collateral_description;
        if (collateral_value !== undefined) updateData.collateral_value = parseFloat(collateral_value);
        
        if (maximum_guarantee_amount !== undefined) {
            updateData.maximum_guarantee_amount = parseFloat(maximum_guarantee_amount);
            updateData.available_guarantee_capacity = parseFloat(maximum_guarantee_amount) - (updateData.current_total_guarantee_amount || guarantor.current_total_guarantee_amount);
        }

        await guarantor.update(updateData);

        console.log(`💰 Guarantor guarantee updated - ID: ${id}, Amount: ${finalGuaranteeAmount}`);

        res.status(200).json({
            success: true,
            message: 'Guarantor guarantee details updated successfully',
            data: {
                guarantor: await Guarantor.findByPk(id)
            }
        });

    } catch (error) {
        console.error('Update guarantor guarantee error:', error);
        res.status(500).json({
            success: false,
                        message: 'Error updating guarantor guarantee details',
            error: error.message
        });
    }
};

// @desc    Activate guarantor guarantee
// @route   PUT /api/guarantors/:id/activate
// @access  Private
const activateGuarantorGuarantee = async (req, res) => {
    try {
        const { id } = req.params;
        const { consent_method, consent_notes } = req.body;

        const { Guarantor } = getModels();

        const guarantor = await Guarantor.findByPk(id);
        if (!guarantor) {
            return res.status(404).json({
                success: false,
                message: 'Guarantor not found'
            });
        }

        // Check if guarantor can be activated
        if (guarantor.status !== 'approved' || guarantor.verification_status !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Guarantor must be approved and verified before activation'
            });
        }

        if (guarantor.guarantee_status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Guarantor guarantee is already active'
            });
        }

        // Activate the guarantee
        await guarantor.update({
            guarantee_status: 'active',
            guarantee_start_date: new Date(),
            guarantor_consent: true,
            consent_date: new Date(),
            consent_method: consent_method || 'in_person',
            verification_notes: consent_notes || null,
            last_updated_by: req.user.userId
        });

        // Update performance tracking
        await guarantor.update({
            total_loans_guaranteed: guarantor.total_loans_guaranteed + 1
        });

        console.log(`✅ Guarantor guarantee activated - ID: ${id}`);

        res.status(200).json({
            success: true,
            message: 'Guarantor guarantee activated successfully',
            data: {
                guarantor: await Guarantor.findByPk(id)
            }
        });

    } catch (error) {
        console.error('Activate guarantor guarantee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating guarantor guarantee',
            error: error.message
        });
    }
};

// @desc    Release guarantor guarantee
// @route   PUT /api/guarantors/:id/release
// @access  Private
const releaseGuarantorGuarantee = async (req, res) => {
    try {
        const { id } = req.params;
        const { release_reason, mark_as_successful } = req.body;

        const { Guarantor } = getModels();

        const guarantor = await Guarantor.findByPk(id);
        if (!guarantor) {
            return res.status(404).json({
                success: false,
                message: 'Guarantor not found'
            });
        }

        if (guarantor.guarantee_status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Only active guarantees can be released'
            });
        }

        // Release the guarantee
        await guarantor.update({
            guarantee_status: 'released',
            guarantee_release_date: new Date(),
            guarantee_release_reason: release_reason || 'Loan completed successfully',
            current_total_guarantee_amount: Math.max(0, guarantor.current_total_guarantee_amount - (guarantor.guarantee_amount || 0)),
            last_updated_by: req.user.userId
        });

        // Update performance tracking
        if (mark_as_successful !== false) {
            await guarantor.update({
                successful_guarantees: guarantor.successful_guarantees + 1
            });
        }

        // Recalculate available capacity
        guarantor.updateGuaranteeCapacity();
        await guarantor.save();

        // Update performance rating
        guarantor.updatePerformanceRating();
        await guarantor.save();

        console.log(`🔓 Guarantor guarantee released - ID: ${id}, Reason: ${release_reason}`);

        res.status(200).json({
            success: true,
            message: 'Guarantor guarantee released successfully',
            data: {
                guarantor: await Guarantor.findByPk(id)
            }
        });

    } catch (error) {
        console.error('Release guarantor guarantee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error releasing guarantor guarantee',
            error: error.message
        });
    }
};

// @desc    Mark guarantor guarantee as defaulted
// @route   PUT /api/guarantors/:id/default
// @access  Private
const markGuarantorDefault = async (req, res) => {
    try {
        const { id } = req.params;
        const { default_reason, default_amount } = req.body;

        const { Guarantor } = getModels();

        const guarantor = await Guarantor.findByPk(id);
        if (!guarantor) {
            return res.status(404).json({
                success: false,
                message: 'Guarantor not found'
            });
        }

        if (guarantor.guarantee_status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Only active guarantees can be marked as defaulted'
            });
        }

        // Mark as defaulted
        await guarantor.update({
            guarantee_status: 'defaulted',
            guarantee_release_date: new Date(),
            guarantee_release_reason: default_reason || 'Loan defaulted',
            defaulted_guarantees: guarantor.defaulted_guarantees + 1,
            last_updated_by: req.user.userId
        });

        // Update performance rating
        guarantor.updatePerformanceRating();
        await guarantor.save();

        console.log(`❌ Guarantor marked as defaulted - ID: ${id}, Reason: ${default_reason}`);

        res.status(200).json({
            success: true,
            message: 'Guarantor marked as defaulted',
            data: {
                guarantor: await Guarantor.findByPk(id)
            }
        });

    } catch (error) {
        console.error('Mark guarantor default error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking guarantor as defaulted',
            error: error.message
        });
    }
};

// @desc    Get available guarantors for a loan amount
// @route   GET /api/guarantors/available
// @access  Private
const getAvailableGuarantors = async (req, res) => {
    try {
        const { amount, loan_officer_id } = req.query;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount parameter is required'
            });
        }

        const { Guarantor } = getModels();

        const requiredAmount = parseFloat(amount);
        const officerId = loan_officer_id || (req.user.role === 'loan-officer' ? req.user.userId : null);

        const availableGuarantors = await Guarantor.findAvailableGuarantors(requiredAmount, officerId);

        // Get detailed information for each guarantor
        const guarantorIds = availableGuarantors.map(g => g.id);
        
        if (guarantorIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    guarantors: [],
                    summary: {
                        total_available: 0,
                        total_capacity: 0
                    }
                }
            });
        }

        const [detailedGuarantors] = await sequelize.query(`
            SELECT 
                g.*,
                COUNT(CASE WHEN g2.guarantee_status = 'active' THEN 1 END) as active_guarantees_count,
                u.first_name as officer_first_name,
                u.last_name as officer_last_name
            FROM guarantors g
            LEFT JOIN guarantors g2 ON g.id = g2.id AND g2.guarantee_status = 'active'
            LEFT JOIN users u ON g.loan_officer_id = u.id
            WHERE g.id IN (${guarantorIds.map(() => '?').join(',')})
            GROUP BY g.id
            ORDER BY g.available_guarantee_capacity DESC, g.guarantee_performance_rating DESC
        `, { replacements: guarantorIds });

        const totalCapacity = detailedGuarantors.reduce((sum, g) => sum + (parseFloat(g.available_guarantee_capacity) || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                guarantors: detailedGuarantors,
                summary: {
                    total_available: detailedGuarantors.length,
                    total_capacity: totalCapacity,
                    required_amount: requiredAmount,
                    coverage_possible: totalCapacity >= requiredAmount
                }
            }
        });

    } catch (error) {
        console.error('Get available guarantors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available guarantors',
            error: error.message
        });
    }
};

// @desc    Get guarantor performance report
// @route   GET /api/guarantors/:id/performance
// @access  Private
const getGuarantorPerformance = async (req, res) => {
    try {
        const { id } = req.params;

        const { Guarantor } = getModels();

        const guarantor = await Guarantor.findByPk(id);
        if (!guarantor) {
            return res.status(404).json({
                success: false,
                message: 'Guarantor not found'
            });
        }

        // Get guarantor's loan history
        const [loanHistory] = await sequelize.query(`
            SELECT 
                l.loan_number,
                l.applied_amount,
                l.status as loan_status,
                g.guarantee_amount,
                g.guarantee_status,
                g.guarantee_start_date,
                g.guarantee_release_date,
                c.first_name as client_first_name,
                c.last_name as client_last_name
            FROM guarantors g
            JOIN loans l ON g.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE g.id = ? OR (g.unique_number = ? AND g.id != ?)
            ORDER BY g.guarantee_start_date DESC
        `, { replacements: [id, guarantor.unique_number, id] });

        // Calculate performance metrics
        const totalGuarantees = loanHistory.length;
        const successfulGuarantees = loanHistory.filter(h => h.guarantee_status === 'released').length;
        const defaultedGuarantees = loanHistory.filter(h => h.guarantee_status === 'defaulted').length;
        const activeGuarantees = loanHistory.filter(h => h.guarantee_status === 'active').length;
        const totalGuaranteedAmount = loanHistory.reduce((sum, h) => sum + (parseFloat(h.guarantee_amount) || 0), 0);

        const successRate = totalGuarantees > 0 ? (successfulGuarantees / totalGuarantees * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                guarantor: guarantor,
                performance: {
                    total_guarantees: totalGuarantees,
                    successful_guarantees: successfulGuarantees,
                    defaulted_guarantees: defaultedGuarantees,
                    active_guarantees: activeGuarantees,
                    success_rate: Math.round(successRate * 100) / 100,
                    total_guaranteed_amount: totalGuaranteedAmount,
                    performance_rating: guarantor.guarantee_performance_rating,
                    current_capacity_utilization: guarantor.maximum_guarantee_amount > 0 
                        ? (guarantor.current_total_guarantee_amount / guarantor.maximum_guarantee_amount * 100) 
                        : 0
                },
                loan_history: loanHistory
            }
        });

    } catch (error) {
        console.error('Get guarantor performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching guarantor performance',
            error: error.message
        });
    }
};

// @desc    Bulk update guarantor statuses
// @route   PUT /api/guarantors/bulk-update
// @access  Private (Supervisors, Admins)
const bulkUpdateGuarantors = async (req, res) => {
    try {
        const { guarantor_ids, update_data } = req.body;

        if (!guarantor_ids || !Array.isArray(guarantor_ids) || guarantor_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'guarantor_ids array is required'
            });
        }

        if (!update_data || Object.keys(update_data).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'update_data is required'
            });
        }

        // Role-based access control
        if (!['admin', 'supervisor'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or supervisor role required.'
            });
        }

        const { Guarantor } = getModels();

        // Add audit fields
        update_data.last_updated_by = req.user.userId;
        if (update_data.status === 'verified' || update_data.verification_status === 'verified') {
            update_data.verified_by = req.user.userId;
            update_data.verification_date = new Date();
        }

        // Perform bulk update
        const [updatedCount] = await sequelize.query(`
            UPDATE guarantors 
            SET ${Object.keys(update_data).map(key => `${key} = ?`).join(', ')}, updated_at = NOW()
            WHERE id IN (${guarantor_ids.map(() => '?').join(',')})
        `, {
            replacements: [...Object.values(update_data), ...guarantor_ids]
        });

        console.log(`📊 Bulk updated ${updatedCount} guarantors`);

        res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedCount} guarantors`,
            data: {
                updated_count: updatedCount,
                guarantor_ids: guarantor_ids
            }
        });

    } catch (error) {
        console.error('Bulk update guarantors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk update',
            error: error.message
        });
    }
};

// Export all functions including the existing ones from previous response
module.exports = {
    createGuarantor,
    getGuarantors,
    getGuarantor: async (req, res) => {
        try {
            const { id } = req.params;

            const [guarantors] = await sequelize.query(`
                SELECT 
                    g.*,
                    c.first_name as client_first_name,
                    c.last_name as client_last_name,
                    c.client_number,
                    c.status as client_status,
                    l.loan_number,
                    l.applied_amount as loan_amount,
                    l.approved_amount,
                    l.status as loan_status,
                    u1.first_name as officer_first_name,
                    u1.last_name as officer_last_name,
                    u2.first_name as created_by_first_name,
                    u2.last_name as created_by_last_name,
                    u3.first_name as verified_by_first_name,
                    u3.last_name as verified_by_last_name
                FROM guarantors g
                LEFT JOIN clients c ON g.client_id = c.id
                LEFT JOIN loans l ON g.loan_id = l.id
                LEFT JOIN users u1 ON g.loan_officer_id = u1.id
                LEFT JOIN users u2 ON g.created_by = u2.id
                LEFT JOIN users u3 ON g.verified_by = u3.id
                WHERE g.id = ?
            `, { replacements: [id] });

            if (guarantors.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Guarantor not found'
                });
            }

            res.status(200).json({
                success: true,
                data: { guarantor: guarantors[0] }
            });

        } catch (error) {
            console.error('Get guarantor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching guarantor',
                error: error.message
            });
        }
    },
    updateGuarantor: async (req, res) => {
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
            const { Guarantor } = getModels();

            const guarantor = await Guarantor.findByPk(id);
            if (!guarantor) {
                return res.status(404).json({
                    success: false,
                    message: 'Guarantor not found'
                });
            }

            // Role-based access control
            if (req.user.role === 'loan-officer' && guarantor.loan_officer_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updateData = { ...req.body };
            updateData.last_updated_by = req.user.userId;

            await guarantor.update(updateData);

            res.status(200).json({
                success: true,
                message: 'Guarantor updated successfully',
                data: { guarantor: await Guarantor.findByPk(id) }
            });

        } catch (error) {
            console.error('Update guarantor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating guarantor',
                error: error.message
            });
        }
    },
    
    // New loan relationship methods
    getGuarantorsByLoan,
    getGuarantorsByClient,
    updateGuarantorGuarantee,
    activateGuarantorGuarantee,
    releaseGuarantorGuarantee,
    markGuarantorDefault,
    getAvailableGuarantors,
    getGuarantorPerformance,
    bulkUpdateGuarantors,
    
    // File upload methods (from previous response)
    uploadGuarantorPhoto: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No photo file uploaded'
                });
            }

            const { Guarantor } = getModels();
            const guarantor = await Guarantor.findByPk(id);
            
            if (!guarantor) {
                return res.status(404).json({
                    success: false,
                    message: 'Guarantor not found'
                });
            }

            const photoPath = `/uploads/guarantors/${req.file.filename}`;
            
            await guarantor.update({
                guarantor_photo: photoPath,
                photo_uploaded_at: new Date(),
                last_updated_by: req.user.userId
            });

            res.status(200).json({
                success: true,
                message: 'Guarantor photo uploaded successfully',
                data: {
                    photo_path: photoPath,
                    guarantor: guarantor
                }
            });

        } catch (error) {
            console.error('Upload guarantor photo error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading guarantor photo',
                error: error.message
            });
        }
    },
    
    // Export upload middleware
    upload
};

