const { body } = require('express-validator');

const processRepaymentValidation = [
    body('loan_id')
        .isInt({ min: 1 })
        .withMessage('Valid loan ID is required'),

    body('amount_paid')
        .isFloat({ min: 0.01 })
        .withMessage('Amount paid must be greater than 0'),

    body('payment_date')
        .isISO8601()
        .withMessage('Valid payment date is required'),

    body('payment_method')
        .optional()
        .isIn(['cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'])
        .withMessage('Invalid payment method'),

    body('reference_number')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Reference number must not exceed 100 characters'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
];

module.exports = {
    processRepaymentValidation
};
