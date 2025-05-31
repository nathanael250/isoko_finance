const { body } = require('express-validator');

const createRecoveryActionValidation = [
    body('action_type')
        .isIn(['phone_call', 'sms', 'email', 'field_visit', 'demand_letter', 'legal_notice', 'investigation', 'restructure'])
        .withMessage('Invalid action type'),

    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),

    body('assigned_to')
        .isInt({ min: 1 })
        .withMessage('Valid assigned user ID is required'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level'),

    body('target_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Target amount must be positive'),

    body('target_date')
        .optional()
        .isISO8601()
        .withMessage('Target date must be valid'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Notes must not exceed 2000 characters')
];

const dateRangeValidation = [
    query('check_period_start')
        .optional()
        .isISO8601()
        .withMessage('check_period_start must be a valid date (YYYY-MM-DD)'),

    query('check_period_end')
        .optional()
        .isISO8601()
        .withMessage('check_period_end must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query.check_period_start) {
                const startDate = new Date(req.query.check_period_start);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    throw new Error('check_period_end must be after check_period_start');
                }
                // Check if date range is not too large (max 2 years)
                const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
                if (daysDiff > 730) {
                    throw new Error('Date range cannot exceed 2 years');
                }
            }
            return true;
        }),

    query('disbursement_start')
        .optional()
        .isISO8601()
        .withMessage('disbursement_start must be a valid date (YYYY-MM-DD)'),

    query('disbursement_end')
        .optional()
        .isISO8601()
        .withMessage('disbursement_end must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query.disbursement_start) {
                const startDate = new Date(req.query.disbursement_start);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    throw new Error('disbursement_end must be after disbursement_start');
                }
            }
            return true;
        }),

    query('analysis_start_date')
        .optional()
        .isISO8601()
        .withMessage('analysis_start_date must be a valid date (YYYY-MM-DD)'),

    query('analysis_end_date')
        .optional()
        .isISO8601()
        .withMessage('analysis_end_date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query.analysis_start_date) {
                const startDate = new Date(req.query.analysis_start_date);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    throw new Error('analysis_end_date must be after analysis_start_date');
                }
            }
            return true;
        }),

    query('criteria')
        .optional()
        .isIn([
            'no_payments_ever',
            'no_payments_in_period',
            'missed_expected_payments',
            'no_payments_since_date',
            'payment_gap_exceeded',
            'overdue_installments'
        ])
        .withMessage('Invalid criteria value'),

    query('expected_payment_days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('expected_payment_days must be between 1 and 365'),

    query('payment_gap_threshold')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('payment_gap_threshold must be between 1 and 365'),

    query('compare_with_previous_period')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('compare_with_previous_period must be true or false'),

    // Custom validation for criteria-specific requirements
    query().custom((value, { req }) => {
        const { criteria, check_period_start, check_period_end } = req.query;
        
        if (criteria === 'no_payments_in_period' && (!check_period_start || !check_period_end)) {
            throw new Error('check_period_start and check_period_end are required for no_payments_in_period criteria');
        }
        
        if (criteria === 'no_payments_since_date' && !check_period_start) {
            throw new Error('check_period_start is required for no_payments_since_date criteria');
        }
        
        return true;
    })
];



const bulkRecoveryActionValidation = [
    body('loan_ids')
        .isArray({ min: 1, max: 100 })
        .withMessage('loan_ids must be an array with 1-100 loan IDs'),

    body('loan_ids.*')
        .isInt({ min: 1 })
        .withMessage('Each loan ID must be a positive integer'),

    body('action_type')
        .isIn([
            'phone_call',
            'sms_reminder',
            'email_notice',
            'field_visit',
            'formal_notice',
            'legal_notice',
            'restructure_proposal',
            'settlement_offer',
            'collateral_assessment',
            'guarantor_contact',
            'payment_plan_setup'
        ])
        .withMessage('Invalid action type for bulk operations'),

    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),

    body('assigned_to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('assigned_to must be a valid user ID'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),

    body('target_date')
        .optional()
        .isISO8601()
        .withMessage('target_date must be a valid date')
        .custom((value) => {
            if (value && new Date(value) <= new Date()) {
                throw new Error('target_date must be in the future');
            }
            return true;
        }),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('notes must not exceed 1000 characters')
];

const reportGenerationValidation = [
    query('start_date')
        .isISO8601()
        .withMessage('start_date is required and must be a valid date (YYYY-MM-DD)'),

    query('end_date')
        .isISO8601()
        .withMessage('end_date is required and must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            const startDate = new Date(req.query.start_date);
            const endDate = new Date(value);
            if (endDate <= startDate) {
                throw new Error('end_date must be after start_date');
            }
            // Check if date range is reasonable (max 5 years for reports)
            const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (daysDiff > 1825) {
                throw new Error('Report date range cannot exceed 5 years');
            }
            return true;
        }),

    query('format')
        .optional()
        .isIn(['json', 'csv', 'excel', 'pdf'])
        .withMessage('Format must be json, csv, excel, or pdf'),

    query('group_by')
        .optional()
        .isIn(['branch', 'officer', 'loan_type', 'risk_category', 'month', 'quarter'])
        .withMessage('Invalid group_by value'),

    query('include_details')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('include_details must be true or false'),

    query('criteria')
        .optional()
        .isIn([
            'no_payments_ever',
            'no_payments_in_period',
            'missed_expected_payments',
            'no_payments_since_date',
            'payment_gap_exceeded',
            'overdue_installments'
        ])
        .withMessage('Invalid criteria value')
];

const fraudFlagValidation = [
    body('fraud_indicators')
        .isArray({ min: 1 })
        .withMessage('fraud_indicators must be a non-empty array'),

    body('fraud_indicators.*')
        .isIn([
            'no_contact_response',
            'false_information',
            'suspicious_documents',
            'immediate_default',
            'multiple_applications',
            'identity_theft_suspected',
            'collateral_missing',
            'guarantor_unavailable',
            'address_invalid',
            'employment_false',
            'income_misrepresented',
            'other'
        ])
        .withMessage('Invalid fraud indicator'),

    body('description')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Description must be between 20 and 2000 characters'),

    body('evidence_description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('evidence_description must not exceed 2000 characters'),

    body('severity')
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Severity must be low, medium, high, or critical'),

    body('recommended_action')
        .optional()
        .isIn([
            'investigate_further',
            'contact_authorities',
            'freeze_account',
            'legal_action',
            'write_off',
            'refer_to_fraud_team'
        ])
        .withMessage('Invalid recommended action'),

    body('notify_authorities')
        .optional()
        .isBoolean()
        .withMessage('notify_authorities must be a boolean'),

    body('internal_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('internal_notes must not exceed 2000 characters')
];

module.exports = {
    dateRangeValidation,
    createRecoveryActionValidation,
    bulkRecoveryActionValidation,
    reportGenerationValidation,
    fraudFlagValidation
};

module.exports = {
    createRecoveryActionValidation
};
