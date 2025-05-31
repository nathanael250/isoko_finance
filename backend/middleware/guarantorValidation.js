const { body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const createGuarantorValidation = [
    // Personal Information
    body('first_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('middle_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Middle name must not exceed 100 characters')
        .matches(/^[a-zA-Z\s'-]*$/)
        .withMessage('Middle name can only contain letters, spaces, hyphens, and apostrophes'),

    body('last_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('title')
        .optional()
        .isIn(['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Chief', 'Alhaji', 'Alhaja', 'Rev', 'Pastor', 'Imam'])
        .withMessage('Invalid title'),

    body('gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('date_of_birth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date')
        .custom((value) => {
            if (value) {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();

                if (age < 18) {
                    throw new Error('Guarantor must be at least 18 years old');
                }
                if (age > 100) {
                    throw new Error('Invalid date of birth');
                }
            }
            return true;
        }),

    body('unique_number')
        .trim()
        .isLength({ min: 10, max: 50 })
        .withMessage('Unique number (ID/BVN/NIN) must be between 10 and 50 characters')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Unique number can only contain letters and numbers'),

    // Contact Information
    body('phone')
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters')
        .matches(/^[\+]?[0-9\s\-\(\)]+$/)
        .withMessage('Phone number format is invalid'),

    body('phone_secondary')
        .optional()
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Secondary phone number must be between 10 and 20 characters')
        .matches(/^[\+]?[0-9\s\-\(\)]+$/)
        .withMessage('Secondary phone number format is invalid'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),

    // Address Information
    body('address')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Address must be between 10 and 500 characters'),

    body('city')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('City must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

    body('province')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Province must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Province can only contain letters, spaces, hyphens, and apostrophes'),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country must not exceed 100 characters'),

    body('zipcode')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Zipcode must not exceed 20 characters'),

    // Employment Information
    body('working_status')
        .isIn(['employed', 'self_employed', 'unemployed', 'student', 'retired', 'business_owner'])
        .withMessage('Invalid working status'),

    body('occupation')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Occupation must not exceed 100 characters'),

    body('monthly_income')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Monthly income must be a positive number'),

    body('employer_name')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Employer name must not exceed 200 characters'),

    body('net_worth')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Net worth must be a positive number'),

    // Loan Relationship Validations
    body('loan_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan ID must be a valid integer'),

    body('client_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Client ID must be a valid integer'),

    body('relationship_to_borrower')
        .optional()
        .isIn(['family', 'friend', 'colleague', 'business_partner', 'spouse', 'parent', 'sibling', 'child', 'relative', 'other'])
        .withMessage('Invalid relationship to borrower'),

    body('relationship_duration')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Relationship duration must not exceed 50 characters'),

    body('guarantee_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Guarantee amount must be a positive number'),

    body('guarantee_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Guarantee percentage must be between 0 and 100'),

    body('guarantee_type')
        .optional()
        .isIn(['full', 'partial', 'joint', 'several'])
        .withMessage('Invalid guarantee type'),

    body('liability_type')
        .optional()
        .isIn(['primary', 'secondary', 'joint_and_several'])
        .withMessage('Invalid liability type'),

    body('maximum_guarantee_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum guarantee amount must be a positive number'),

    body('collateral_value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Collateral value must be a positive number'),

    // Custom validation for guarantee amount vs percentage
    body().custom((value) => {
        if (value.guarantee_amount && value.guarantee_percentage) {
            throw new Error('Provide either guarantee_amount or guarantee_percentage, not both');
        }
        if (!value.guarantee_amount && !value.guarantee_percentage) {
            throw new Error('Either guarantee_amount or guarantee_percentage is required');
        }
        return true;
    }),

    // Custom validation for maximum guarantee amount
    body().custom((value) => {
        if (value.guarantee_amount && value.maximum_guarantee_amount) {
            if (parseFloat(value.guarantee_amount) > parseFloat(value.maximum_guarantee_amount)) {
                throw new Error('Guarantee amount cannot exceed maximum guarantee amount');
            }
        }
        return true;
    }),

    handleValidationErrors
];

const updateGuarantorValidation = [
    // Make all fields optional for updates
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('middle_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Middle name must not exceed 100 characters'),

    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('title')
        .optional()
        .isIn(['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Chief', 'Alhaji', 'Alhaja', 'Rev', 'Pastor', 'Imam'])
        .withMessage('Invalid title'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('phone')
        .optional()
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),

    body('working_status')
        .optional()
        .isIn(['employed', 'self_employed', 'unemployed', 'student', 'retired', 'business_owner'])
        .withMessage('Invalid working status'),

    body('monthly_income')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Monthly income must be a positive number'),

    body('status')
        .optional()
        .isIn(['pending', 'verified', 'approved', 'rejected', 'suspended', 'blacklisted'])
        .withMessage('Invalid status'),

    body('verification_status')
        .optional()
        .isIn(['not_verified', 'documents_submitted', 'under_review', 'verified', 'rejected'])
        .withMessage('Invalid verification status'),

    body('guarantee_status')
        .optional()
        .isIn(['pending', 'active', 'released', 'defaulted', 'cancelled'])
        .withMessage('Invalid guarantee status'),

    handleValidationErrors
];

const updateGuarantorStatusValidation = [
    body('status')
        .isIn(['pending', 'verified', 'approved', 'rejected', 'suspended', 'blacklisted'])
        .withMessage('Invalid status'),

    body('verification_status')
        .optional()
        .isIn(['not_verified', 'documents_submitted', 'under_review', 'verified', 'rejected'])
        .withMessage('Invalid verification status'),

    body('verification_notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Verification notes must not exceed 1000 characters'),

    body('internal_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Internal notes must not exceed 2000 characters'),

    handleValidationErrors
];

const guaranteeUpdateValidation = [
    body('guarantee_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Guarantee amount must be a positive number'),

    body('guarantee_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Guarantee percentage must be between 0 and 100'),

    body('guarantee_type')
        .optional()
        .isIn(['full', 'partial', 'joint', 'several'])
        .withMessage('Invalid guarantee type'),

    body('liability_type')
        .optional()
        .isIn(['primary', 'secondary', 'joint_and_several'])
        .withMessage('Invalid liability type'),

    body('guarantee_conditions')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Guarantee conditions must not exceed 2000 characters'),

    body('collateral_value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Collateral value must be a positive number'),

    body('maximum_guarantee_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum guarantee amount must be a positive number'),

    handleValidationErrors
];

const guaranteeActivationValidation = [
    body('consent_method')
        .optional()
        .isIn(['in_person', 'digital', 'phone', 'email', 'written'])
        .withMessage('Invalid consent method'),

    body('consent_notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Consent notes must not exceed 1000 characters'),

    handleValidationErrors
];

const guaranteeReleaseValidation = [
    body('release_reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Release reason must not exceed 500 characters'),

    body('mark_as_successful')
        .optional()
        .isBoolean()
        .withMessage('mark_as_successful must be a boolean'),

    handleValidationErrors
];

const guaranteeDefaultValidation = [
    body('default_reason')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Default reason must be between 10 and 500 characters'),

    body('default_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Default amount must be a positive number'),

    handleValidationErrors
];

const bulkUpdateValidation = [
    body('guarantor_ids')
        .isArray({ min: 1 })
        .withMessage('guarantor_ids must be a non-empty array'),

    body('guarantor_ids.*')
        .isInt({ min: 1 })
        .withMessage('Each guarantor ID must be a valid integer'),

    body('update_data')
        .isObject()
        .withMessage('update_data must be an object'),

    body('update_data.status')
        .optional()
        .isIn(['pending', 'verified', 'approved', 'rejected', 'suspended', 'blacklisted'])
        .withMessage('Invalid status'),

    body('update_data.verification_status')
        .optional()
        .isIn(['not_verified', 'documents_submitted', 'under_review', 'verified', 'rejected'])
        .withMessage('Invalid verification status'),

    body('update_data.guarantee_status')
        .optional()
        .isIn(['pending', 'active', 'released', 'defaulted', 'cancelled'])
        .withMessage('Invalid guarantee status'),

    handleValidationErrors
];

module.exports = {
    createGuarantorValidation,
    updateGuarantorValidation,
    updateGuarantorStatusValidation,
    guaranteeUpdateValidation,
    guaranteeActivationValidation,
    guaranteeReleaseValidation,
    guaranteeDefaultValidation,
    bulkUpdateValidation
};
