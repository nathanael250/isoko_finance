const { body } = require('express-validator');

const createLoanValidation = [
  body('client_id')
    .isInt({ min: 1 })
    .withMessage('Valid client ID is required'),

  body('loan_type')
    .isInt({ min: 1 })
    .withMessage('Valid loan type ID is required'),

  body('economic_sector')
    .optional()
    .isIn(['agriculture', 'manufacturing', 'trade', 'services', 'transport', 'construction', 'education', 'health', 'other'])
    .withMessage('Invalid economic sector'),

  body('applied_amount')
    .isFloat({ min: 1000, max: 10000000 })
    .withMessage('Applied amount must be between 1,000 and 10,000,000'),

  body('interest_rate')
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Interest rate must be between 0.1% and 50%'),

  body('interest_rate_method')
    .optional()
    .isIn(['flat', 'reducing_balance', 'compound'])
    .withMessage('Invalid interest rate method'),

  body('loan_term_months')
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

  body('branch')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Branch name must not exceed 100 characters'),

  body('loan_purpose')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Loan purpose must not exceed 1000 characters')
];

const updateLoanStatusValidation = [
  body('status')
    .isIn(['pending', 'under_review', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'rejected', 'written_off'])
    .withMessage('Invalid loan status'),

  body('approved_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Approved amount must be a positive number'),

  body('disbursed_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Disbursed amount must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters')
];

module.exports = {
  createLoanValidation,
  updateLoanStatusValidation
};
