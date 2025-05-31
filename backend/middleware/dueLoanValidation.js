const { query } = require('express-validator');

const validateDueLoansQuery = [
    query('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

    query('end_date')
        .isISO8601()
        .withMessage('End date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.query.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),

    query('include_zero_due')
        .optional()
        .isBoolean()
        .withMessage('include_zero_due must be a boolean'),

    query('include_penalty_period')
        .optional()
        .isBoolean()
        .withMessage('include_penalty_period must be a boolean'),

    query('status')
        .optional()
        .isIn(['overdue', 'due_today', 'due_soon', 'pending', 'partial', 'paid'])
        .withMessage('Invalid status filter'),

    query('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan officer ID must be a positive integer'),

    query('branch')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name must not exceed 100 characters'),

    query('performance_class')
        .optional()
        .isIn(['performing', 'watch', 'substandard', 'doubtful', 'loss'])
        .withMessage('Invalid performance class'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must not exceed 100 characters'),

    query('sort_by')
        .optional()
        .isIn(['due_date', 'client_name', 'loan_number', 'amount_due', 'days_overdue'])
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
        .isInt({ min: 1, max: 1000 })
        .withMessage('Limit must be between 1 and 1000'),

    query('format')
        .optional()
        .isIn(['json', 'csv'])
        .withMessage('Format must be json or csv')
];

module.exports = {
    validateDueLoansQuery
};
