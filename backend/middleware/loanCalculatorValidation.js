const { body } = require('express-validator');

const calculateLoanValidation = [
    body('principal_amount')
        .isFloat({ min: 1 })
        .withMessage('Principal amount must be a positive number'),

    body('loan_release_date')
        .isISO8601()
        .withMessage('Loan release date must be a valid date'),

    body('interest_method')
        .isIn(['flat', 'reducing_balance', 'compound', 'simple'])
        .withMessage('Invalid interest method'),

    body('interest_type')
        .optional()
        .isIn(['fixed', 'variable', 'stepped'])
        .withMessage('Invalid interest type'),

    body('primary_rate_period')
        .isIn(['daily', 'weekly', 'monthly', 'yearly', 'per_loan'])
        .withMessage('Invalid primary rate period'),

    body('primary_duration_unit')
        .isIn(['days', 'weeks', 'months', 'years'])
        .withMessage('Invalid primary duration unit'),

    body('repayment_cycle')
        .isIn(['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'bullet'])
        .withMessage('Invalid repayment cycle'),

    body('number_of_repayments')
        .isInt({ min: 1 })
        .withMessage('Number of repayments must be a positive integer'),

    // Interest rate validations (at least one must be provided)
    body('interest_rate_per_day')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Daily interest rate must be between 0 and 1'),

    body('interest_rate_per_week')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Weekly interest rate must be between 0 and 1'),

    body('interest_rate_per_month')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Monthly interest rate must be between 0 and 1'),

    body('interest_rate_per_year')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Annual interest rate must be between 0 and 5'),

    body('effective_rate_per_loan')
        .optional()
        .isFloat({ min: 0, max: 2 })
        .withMessage('Effective rate per loan must be between 0 and 2'),

        // Duration validations (at least one must be provided)
    body('loan_duration_days')
        .optional()
        .isInt({ min: 1, max: 3650 })
        .withMessage('Loan duration in days must be between 1 and 3650'),

    body('loan_duration_weeks')
        .optional()
        .isInt({ min: 1, max: 520 })
        .withMessage('Loan duration in weeks must be between 1 and 520'),

    body('loan_duration_months')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Loan duration in months must be between 1 and 120'),

    body('loan_duration_years')
        .optional()
        .isFloat({ min: 0.1, max: 10 })
        .withMessage('Loan duration in years must be between 0.1 and 10'),

    body('loan_product_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Loan product ID must be a positive integer'),

    // Custom validation to ensure required rate and duration are provided
    body().custom((value, { req }) => {
        const { primary_rate_period, primary_duration_unit } = req.body;
        
        // Check if the corresponding interest rate is provided
        let rateProvided = false;
        switch (primary_rate_period) {
            case 'daily':
                rateProvided = !!req.body.interest_rate_per_day;
                break;
            case 'weekly':
                rateProvided = !!req.body.interest_rate_per_week;
                break;
            case 'monthly':
                rateProvided = !!req.body.interest_rate_per_month;
                break;
            case 'yearly':
                rateProvided = !!req.body.interest_rate_per_year;
                break;
            case 'per_loan':
                rateProvided = !!req.body.effective_rate_per_loan;
                break;
        }

        if (!rateProvided) {
            throw new Error(`Interest rate for ${primary_rate_period} is required`);
        }

        // Check if the corresponding duration is provided
        let durationProvided = false;
        switch (primary_duration_unit) {
            case 'days':
                durationProvided = !!req.body.loan_duration_days;
                break;
            case 'weeks':
                durationProvided = !!req.body.loan_duration_weeks;
                break;
            case 'months':
                durationProvided = !!req.body.loan_duration_months;
                break;
            case 'years':
                durationProvided = !!req.body.loan_duration_years;
                break;
        }

        if (!durationProvided) {
            throw new Error(`Loan duration in ${primary_duration_unit} is required`);
        }

        return true;
    })
];

const quickCalculateValidation = [
    body('preset_name')
        .notEmpty()
        .withMessage('Preset name is required'),

    body('principal_amount')
        .isFloat({ min: 1 })
        .withMessage('Principal amount must be a positive number'),

    body('custom_rate')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Custom rate must be between 0 and 5')
];

const compareScenariosValidation = [
    body('scenarios')
        .isArray({ min: 2, max: 5 })
        .withMessage('Must provide between 2 and 5 scenarios'),

    body('scenarios.*.scenario_name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Scenario name must not exceed 100 characters'),

    body('scenarios.*.principal_amount')
        .isFloat({ min: 1 })
        .withMessage('Principal amount must be a positive number'),

    body('scenarios.*.interest_method')
        .isIn(['flat', 'reducing_balance', 'compound', 'simple'])
        .withMessage('Invalid interest method'),

    body('scenarios.*.primary_interest_rate')
        .isFloat({ min: 0 })
        .withMessage('Primary interest rate must be a positive number'),

    body('scenarios.*.primary_rate_period')
        .isIn(['daily', 'weekly', 'monthly', 'yearly', 'per_loan'])
        .withMessage('Invalid primary rate period'),

    body('scenarios.*.primary_duration')
        .isFloat({ min: 0.1 })
        .withMessage('Primary duration must be a positive number'),

    body('scenarios.*.primary_duration_unit')
        .isIn(['days', 'weeks', 'months', 'years'])
        .withMessage('Invalid primary duration unit'),

    body('scenarios.*.repayment_cycle')
        .isIn(['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'bullet'])
        .withMessage('Invalid repayment cycle'),

    body('scenarios.*.number_of_repayments')
        .isInt({ min: 1 })
        .withMessage('Number of repayments must be a positive integer')
];

const paymentScheduleValidation = [
    body('principal_amount')
        .isFloat({ min: 1 })
        .withMessage('Principal amount must be a positive number'),

    body('installment_amount')
        .isFloat({ min: 0 })
        .withMessage('Installment amount must be a positive number'),

    body('number_of_repayments')
        .isInt({ min: 1 })
        .withMessage('Number of repayments must be a positive integer'),

    body('first_payment_date')
        .isISO8601()
        .withMessage('First payment date must be a valid date'),

    body('repayment_cycle')
        .isIn(['daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'bullet'])
        .withMessage('Invalid repayment cycle'),

    body('total_interest')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total interest must be a positive number'),

    body('interest_method')
        .optional()
        .isIn(['flat', 'reducing_balance', 'compound', 'simple'])
        .withMessage('Invalid interest method')
];

const effectiveRatesValidation = [
    body('nominal_rate')
        .isFloat({ min: 0 })
        .withMessage('Nominal rate must be a positive number'),

    body('rate_period')
        .isIn(['daily', 'weekly', 'monthly', 'yearly'])
        .withMessage('Invalid rate period'),

    body('compounding_frequency')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually'])
        .withMessage('Invalid compounding frequency'),

    body('loan_duration')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Loan duration must be a positive number'),

    body('duration_unit')
        .optional()
        .isIn(['days', 'weeks', 'months', 'years'])
        .withMessage('Invalid duration unit')
];

module.exports = {
    calculateLoanValidation,
    quickCalculateValidation,
    compareScenariosValidation,
    paymentScheduleValidation,
    effectiveRatesValidation
};
