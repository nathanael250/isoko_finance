const { body, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User validation
const createUserValidation = [
    body('first_name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('last_name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('phone_number')
        .optional()
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters'),

    body('date_of_birth')
        .optional()
        .isDate()
        .withMessage('Please provide a valid date of birth'),

    body('branch')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Branch must be between 2 and 100 characters'),

    body('role')
        .isIn(['admin', 'supervisor', 'loan-officer', 'cashier'])
        .withMessage('Role must be one of: admin, supervisor, loan-officer, cashier'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be one of: male, female, other'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('employee_id')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Employee ID must be between 3 and 20 characters'),

    handleValidationErrors
];

const updateUserValidation = [
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('phone_number')
        .optional()
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters'),

    body('role')
        .optional()
        .isIn(['admin', 'supervisor', 'loan-officer', 'cashier'])
        .withMessage('Role must be one of: admin, supervisor, loan-officer, cashier'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be one of: male, female, other'),

    handleValidationErrors
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),

    body('confirmPassword')
        .optional()
        .custom((value, { req }) => {
            if (value && value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match new password');
            }
            return true;
        }),

    handleValidationErrors
];

// Client validation
const validateClientRegistration = [
    body('first_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),

    body('last_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),

    body('mobile')
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage('Mobile number must be between 10 and 15 characters'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address must not exceed 500 characters'),

    body('date_of_birth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('working_status')
        .optional()
        .isIn(['employed', 'self_employed', 'unemployed', 'student', 'retired'])
        .withMessage('Invalid working status'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended', 'pending_approval'])
        .withMessage('Invalid status'),

    handleValidationErrors
];

const validateClientUpdate = [
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),

    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),

    body('mobile')
        .optional()
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage('Mobile number must be between 10 and 15 characters'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended', 'pending_approval'])
        .withMessage('Invalid status'),

    handleValidationErrors
];

const validateFileUpload = [
    body('file_type')
        .optional()
        .isIn(['id_card', 'passport', 'utility_bill', 'bank_statement', 'other'])
        .withMessage('Invalid file type'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Description must not exceed 255 characters'),

    handleValidationErrors
];

const validateSearchFilters = [
    body('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must not exceed 100 characters'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended', 'pending_approval'])
        .withMessage('Invalid status filter'),

    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    body('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative number'),

    handleValidationErrors
];

// LOAN VALIDATIONS - ADD THESE
const validateLoanApplication = [
    body('client_id')
        .isInt({ min: 1 })
        .withMessage('Valid client ID is required'),

    body('loan_type')
        .isInt({ min: 1 })
        .withMessage('Valid loan type ID is required'),

    body('applied_amount')
        .isFloat({ min: 1 })
        .withMessage('Applied amount must be greater than 0'),

    body('loan_purpose')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Loan purpose must not exceed 1000 characters'),

    body('economic_sector')
        .optional()
        .isIn(['agriculture', 'manufacturing', 'trade', 'services', 'transport', 'construction', 'education', 'health', 'other'])
        .withMessage('Invalid economic sector'),

    body('interest_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Interest rate must be between 0 and 100'),

    body('interest_rate_method')
        .optional()
        .isIn(['flat', 'reducing_balance', 'compound'])
        .withMessage('Invalid interest rate method'),

    body('loan_term_months')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Loan term must be between 1 and 120 months'),

    body('repayment_frequency')
        .optional()
        .isIn(['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly'])
        .withMessage('Invalid repayment frequency'),

    body('collateral_type')
        .optional()
        .isIn(['immovable_assets', 'movable_assets', 'guarantor', 'none'])
        .withMessage('Invalid collateral type'),

    body('collateral_value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Collateral value must be a positive number'),

    body('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid loan officer ID is required'),

    handleValidationErrors
];

const validateLoanUpdate = [
    body('applied_amount')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Applied amount must be greater than 0'),

    body('approved_amount')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Approved amount must be greater than 0'),

    body('disbursed_amount')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Disbursed amount must be greater than 0'),

    body('status')
        .optional()
        .isIn(['pending', 'under_review', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'rejected', 'written_off'])
        .withMessage('Invalid loan status'),

    body('performance_class')
        .optional()
        .isIn(['performing', 'watch', 'substandard', 'doubtful', 'loss'])
        .withMessage('Invalid performance class'),

    handleValidationErrors
];

const validateLoanType = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('code')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Code must be between 2 and 20 characters')
        .matches(/^[A-Z0-9_]+$/)
        .withMessage('Code can only contain uppercase letters, numbers, and underscores'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),

    body('category')
        .isIn(['loan', 'guarantee', 'finance'])
        .withMessage('Category must be loan, guarantee, or finance'),

    body('cost_of_funds')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Cost of funds must be between 0 and 1 (0% to 100%)'),

    body('operating_cost')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Operating cost must be between 0 and 1 (0% to 100%)'),

    body('risk_percentage')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Risk percentage must be between 0 and 1 (0% to 100%)'),

    body('profit_margin')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Profit margin must be between 0 and 1 (0% to 100%)'),

    body('nominal_interest_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Nominal interest rate must be between 0 and 100'),

    body('min_interest_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Minimum interest rate must be between 0 and 100'),

    body('max_interest_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Maximum interest rate must be between 0 and 100'),

    body('application_fee_type')
        .optional()
        .isIn(['percentage', 'fixed_amount'])
        .withMessage('Application fee type must be percentage or fixed_amount'),

    body('application_fee_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Application fee rate must be between 0 and 1'),

    body('application_fee_fixed')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Application fee fixed amount must be positive'),

    body('disbursement_fee_type')
        .optional()
        .isIn(['percentage', 'fixed_amount', 'tiered'])
        .withMessage('Disbursement fee type must be percentage, fixed_amount, or tiered'),

    body('disbursement_fee_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Disbursement fee rate must be between 0 and 1'),

    body('disbursement_fee_fixed')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Disbursement fee fixed amount must be positive'),

    body('disbursement_fee_tiers')
        .optional()
        .isArray()
        .withMessage('Disbursement fee tiers must be an array')
        .custom((value) => {
            if (value && Array.isArray(value)) {
                for (const tier of value) {
                    if (!tier.min_amount || !tier.max_amount || !tier.fee) {
                        throw new Error('Each tier must have min_amount, max_amount, and fee');
                    }
                    if (tier.min_amount >= tier.max_amount) {
                        throw new Error('min_amount must be less than max_amount in tiers');
                    }
                }
            }
            return true;
        }),

    body('management_fee_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Management fee rate must be between 0 and 1'),

    body('risk_premium_fee_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Risk premium fee rate must be between 0 and 1'),

    body('late_payment_fee_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Late payment fee rate must be between 0 and 1'),

    body('late_payment_fee_type')
        .optional()
        .isIn(['daily', 'monthly', 'fixed'])
        .withMessage('Late payment fee type must be daily, monthly, or fixed'),

    body('vat_rate')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('VAT rate must be between 0 and 1'),

    body('min_term_days')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Minimum term days must be positive'),

    body('max_term_days')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum term days must be positive'),

    body('min_term_months')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Minimum term months must be positive'),

    body('max_term_months')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum term months must be positive'),

    body('fixed_term_days')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Fixed term days must be positive'),

    body('min_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum amount must be positive'),

    body('max_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum amount must be positive'),

    body('allowed_frequencies')
        .optional()
        .isArray()
        .withMessage('Allowed frequencies must be an array')
        .custom((value) => {
            const validFrequencies = ['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly'];
            if (value && Array.isArray(value)) {
                for (const freq of value) {
                    if (!validFrequencies.includes(freq)) {
                        throw new Error(`Invalid frequency: ${freq}`);
                    }
                }
            }
            return true;
        }),

    body('default_frequency')
        .optional()
        .isIn(['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly'])
        .withMessage('Default frequency must be valid'),

    body('allowed_collateral_types')
        .optional()
        .isArray()
        .withMessage('Allowed collateral types must be an array'),

    body('min_collateral_ratio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum collateral ratio must be positive'),

    body('auto_approve_limit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Auto approve limit must be positive'),

    body('max_loans_per_client')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum loans per client must be positive'),

    body('min_guarantor_income')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum guarantor income must be positive'),

    body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be 3 characters'),

    body('documentation_required')
        .optional()
        .isArray()
        .withMessage('Documentation required must be an array'),

    // Custom validation for term consistency
    body().custom((value) => {
        if (value.min_term_days && value.max_term_days && value.min_term_days >= value.max_term_days) {
            throw new Error('Minimum term days must be less than maximum term days');
        }
        if (value.min_term_months && value.max_term_months && value.min_term_months >= value.max_term_months) {
            throw new Error('Minimum term months must be less than maximum term months');
        }
        if (value.min_amount && value.max_amount && value.min_amount >= value.max_amount) {
            throw new Error('Minimum amount must be less than maximum amount');
        }
        if (value.min_interest_rate && value.max_interest_rate && value.min_interest_rate >= value.max_interest_rate) {
            throw new Error('Minimum interest rate must be less than maximum interest rate');
        }
        return true;
    })
];

const validateLoanTypeUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('code')
        .optional()
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Code must be between 2 and 20 characters')
        .matches(/^[A-Z0-9_]+$/)
        .withMessage('Code can only contain uppercase letters, numbers, and underscores'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),

    body('category')
        .optional()
        .isIn(['loan', 'guarantee', 'finance'])
        .withMessage('Category must be loan, guarantee, or finance'),

    // Include all the same validations as create but make them optional
    body('cost_of_funds')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Cost of funds must be between 0 and 1'),

    body('operating_cost')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Operating cost must be between 0 and 1'),

    body('risk_percentage')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Risk percentage must be between 0 and 1'),

    body('profit_margin')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Profit margin must be between 0 and 1'),

    body('nominal_interest_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Nominal interest rate must be between 0 and 100'),

    // Add other optional validations...
    body().custom((value) => {
        if (value.min_term_days && value.max_term_days && value.min_term_days >= value.max_term_days) {
            throw new Error('Minimum term days must be less than maximum term days');
        }
        if (value.min_amount && value.max_amount && value.min_amount >= value.max_amount) {
            throw new Error('Minimum amount must be less than maximum amount');
        }
        return true;
    })
];

module.exports = {
    // User validations
    createUserValidation,
    updateUserValidation,
    loginValidation,
    changePasswordValidation,

    // Client validations
    validateClientRegistration,
    validateClientUpdate,
    validateFileUpload,
    validateSearchFilters,
    
    // Loan validations
    validateLoanApplication,
    validateLoanUpdate,
    
    // Loan type validations
    validateLoanType,
    validateLoanTypeUpdate,

    // Helper
    handleValidationErrors
};
