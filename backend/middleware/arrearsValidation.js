const { body, query } = require('express-validator');

const validateArrearsFilters = [
    query('min_days_arrears')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum days in arrears must be a non-negative integer'),

    query('max_days_arrears')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum days in arrears must be a positive integer'),

    query('min_arrears_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum arrears amount must be a positive number'),

    query('max_arrears_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum arrears amount must be a positive number'),

    query('performance_class')
        .optional()
        .isIn(['performing', 'watch', 'substandard', 'doubtful', 'loss'])
        .withMessage('Invalid performance class'),

    query('arrears_category')
        .optional()
        .isIn(['early_arrears', 'moderate_arrears', 'serious_arrears', 'critical_arrears'])
        .withMessage('Invalid arrears category'),

    query('sort_by')
        .optional()
        .isIn(['days_in_arrears', 'arrears_amount', 'loan_balance', 'disbursed_amount', 'loan_number', 'client_name', 'performance_class', 'arrears_start_date'])
        .withMessage('Invalid sort field'),

    query('sort_order')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Sort order must be ASC or DESC'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

const validateRecoveryAction = [
    body('action_type')
        .isIn(['phone_call', 'sms', 'email', 'field_visit', 'demand_letter', 'legal_notice', 'restructure', 'write_off'])
        .withMessage('Invalid action type'),

    body('action_date')
        .isISO8601()
        .withMessage('Action date must be a valid date')
        .custom((value) => {
            const actionDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (actionDate < today) {
                throw new Error('Action date cannot be in the past');
            }
            return true;
        }),

    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),

    body('assigned_to')
        .isInt({ min: 1 })
        .withMessage('Assigned to must be a valid user ID'),

    body('priority')
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),

    body('expected_outcome')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Expected outcome must not exceed 500 characters'),

    body('target_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Target amount must be a positive number'),

    body('target_date')
        .optional()
        .isISO8601()
        .withMessage('Target date must be a valid date'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Notes must not exceed 2000 characters')
];

const validateRecoveryActionUpdate = [
    body('status')
        .isIn(['planned', 'in_progress', 'completed', 'cancelled', 'postponed'])
        .withMessage('Invalid status'),

    body('outcome_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Outcome notes must not exceed 2000 characters'),

    body('actual_amount_recovered')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Actual amount recovered must be a positive number'),

    body('next_action_type')
        .optional()
        .isIn(['phone_call', 'sms', 'email', 'field_visit', 'demand_letter', 'legal_notice', 'restructure', 'write_off'])
        .withMessage('Invalid next action type'),

    body('next_action_date')
        .optional()
        .isISO8601()
        .withMessage('Next action date must be a valid date'),

    body('completion_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Completion notes must not exceed 2000 characters')
];

const validateReportGeneration = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            if (req.query.start_date && value) {
                const startDate = new Date(req.query.start_date);
                const endDate = new Date(value);
                
                if (endDate <= startDate) {
                    throw new Error('End date must be after start date');
                }
            }
            return true;
        }),

    query('format')
        .optional()
        .isIn(['json', 'csv'])
        .withMessage('Format must be json or csv'),

    query('include_details')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Include details must be true or false'),

    query('group_by')
        .optional()
        .isIn(['none', 'branch', 'officer', 'performance_class', 'arrears_category'])
        .withMessage('Invalid group by option'),

    query('min_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum amount must be a positive number')
];

module.exports = {
    validateArrearsFilters,
    validateRecoveryAction,
    validateRecoveryActionUpdate,
    validateReportGeneration
};
