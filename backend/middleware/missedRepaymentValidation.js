const { query, body, param } = require('express-validator');

const validateMissedRepaymentsQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('days_threshold')
        .optional()
        .isInt({ min: 1, max: 3650 }) // Max 10 years
        .withMessage('Days threshold must be between 1 and 3650 days'),

    query('client_search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Client search must not exceed 100 characters'),

    query('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan officer ID must be a positive integer'),

    query('branch')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name must not exceed 100 characters'),

    query('risk_level')
        .optional()
        .isIn(['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'])
        .withMessage('Risk level must be one of: Low Risk, Medium Risk, High Risk, Critical Risk'),

    query('sort_by')
        .optional()
        .isIn(['days_since_last_unpaid', 'client_name', 'loan_number', 'due_date', 'outstanding_amount'])
        .withMessage('Sort by must be one of: days_since_last_unpaid, client_name, loan_number, due_date, outstanding_amount'),

    query('sort_order')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Sort order must be ASC or DESC')
];

const validateSummaryQuery = [
    query('days_threshold')
        .optional()
        .isInt({ min: 1, max: 3650 })
        .withMessage('Days threshold must be between 1 and 3650 days'),

    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),

    query('branch')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name must not exceed 100 characters'),

    query('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan officer ID must be a positive integer'),

    // Custom validation to ensure end_date is after start_date
    query().custom((value, { req }) => {
        if (req.query.start_date && req.query.end_date) {
            const startDate = new Date(req.query.start_date);
            const endDate = new Date(req.query.end_date);
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
        }
        return true;
    })
];

const validateAnalyticsQuery = [
    query('days_threshold')
        .optional()
        .isInt({ min: 1, max: 3650 })
        .withMessage('Days threshold must be between 1 and 3650 days'),

    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),

    query('branch')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name must not exceed 100 characters'),

    query('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan officer ID must be a positive integer'),

    query().custom((value, { req }) => {
        if (req.query.start_date && req.query.end_date) {
            const startDate = new Date(req.query.start_date);
            const endDate = new Date(req.query.end_date);
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
        }
        return true;
    })
];

const validateFollowUpCreation = [
    param('schedule_id')
        .isInt({ min: 1 })
        .withMessage('Schedule ID must be a positive integer'),

    body('action_type')
        .isIn(['phone_call', 'sms', 'email', 'visit', 'letter', 'legal_notice', 'other'])
        .withMessage('Action type must be one of: phone_call, sms, email, visit, letter, legal_notice, other'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),

    body('scheduled_date')
        .optional()
        .isISO8601()
        .withMessage('Scheduled date must be a valid date'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),

    // Custom validation to ensure scheduled_date is not in the past
    body('scheduled_date').custom((value) => {
        if (value) {
            const scheduledDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            if (scheduledDate < today) {
                throw new Error('Scheduled date cannot be in the past');
            }
        }
        return true;
    })
];

const validateFollowUpUpdate = [
    param('followup_id')
        .isInt({ min: 1 })
        .withMessage('Follow-up ID must be a positive integer'),

    body('status')
        .isIn(['follow_up', 'contacted', 'resolved', 'escalated', 'closed'])
        .withMessage('Status must be one of: follow_up, contacted, resolved, escalated, closed'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),

    body('action_taken')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Action taken must not exceed 500 characters'),

    body('next_action_date')
        .optional()
        .isISO8601()
        .withMessage('Next action date must be a valid date'),

    // Custom validation for next_action_date
    body('next_action_date').custom((value, { req }) => {
        if (value && req.body.status !== 'closed') {
            const nextActionDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (nextActionDate < today) {
                throw new Error('Next action date cannot be in the past');
            }
        }
        return true;
    })
];

const validateReportGeneration = [
    query('format')
        .optional()
        .isIn(['json', 'csv'])
        .withMessage('Format must be json or csv'),

    query('days_threshold')
        .optional()
        .isInt({ min: 1, max: 3650 })
        .withMessage('Days threshold must be between 1 and 3650 days'),

    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),

    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),

    query('branch')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name must not exceed 100 characters'),

    query('loan_officer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan officer ID must be a positive integer'),

    query('risk_level')
        .optional()
        .isIn(['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'])
        .withMessage('Risk level must be one of: Low Risk, Medium Risk, High Risk, Critical Risk'),

    query('payment_status')
        .optional()
        .isIn(['not_paid', 'partly_paid', 'all'])
        .withMessage('Payment status must be one of: not_paid, partly_paid, all'),

    query().custom((value, { req }) => {
        if (req.query.start_date && req.query.end_date) {
            const startDate = new Date(req.query.start_date);
            const endDate = new Date(req.query.end_date);
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
        }
        return true;
    })
];

module.exports = {
    validateMissedRepaymentsQuery,
    validateSummaryQuery,
    validateAnalyticsQuery,
    validateFollowUpCreation,
    validateFollowUpUpdate,
    validateReportGeneration
};
