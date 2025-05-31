const express = require('express');
const router = express.Router();
const LoanCalculatorController = require('../controllers/loanCalculatorController');
const { protect } = require('../middleware/auth');
const {
    calculateLoanValidation,
    quickCalculateValidation,
    compareScenariosValidation,
    paymentScheduleValidation,
    effectiveRatesValidation
} = require('../middleware/loanCalculatorValidation');

// Test route
router.get('/test', LoanCalculatorController.test);

// @route   POST /api/loan-calculator/calculate
// @desc    Calculate loan with full parameters (no database storage)
// @access  Private
router.post('/calculate', protect, calculateLoanValidation, LoanCalculatorController.calculateLoan);

// @route   POST /api/loan-calculator/quick-calculate
// @desc    Quick calculation using presets
// @access  Private
router.post('/quick-calculate', protect, quickCalculateValidation, LoanCalculatorController.quickCalculate);

// @route   POST /api/loan-calculator/compare-scenarios
// @desc    Compare multiple loan scenarios
// @access  Private
router.post('/compare-scenarios', protect, compareScenariosValidation, LoanCalculatorController.compareScenarios);

// @route   GET /api/loan-calculator/presets
// @desc    Get calculation presets/templates
// @access  Private
router.get('/presets', protect, LoanCalculatorController.getCalculationPresets);

// @route   GET /api/loan-calculator/loan-products
// @desc    Get available loan products for dropdown
// @access  Private
router.get('/loan-products', protect, LoanCalculatorController.getLoanProducts);

// @route   POST /api/loan-calculator/payment-schedule
// @desc    Generate payment schedule only
// @access  Private
router.post('/payment-schedule', protect, paymentScheduleValidation, LoanCalculatorController.getPaymentSchedule);

// @route   POST /api/loan-calculator/effective-rates
// @desc    Calculate effective interest rates
// @access  Private
router.post('/effective-rates', protect, effectiveRatesValidation, LoanCalculatorController.calculateEffectiveRates);

module.exports = router;
