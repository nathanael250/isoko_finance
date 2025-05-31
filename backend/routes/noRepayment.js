const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getLoansWithNoRepayment,
    getLoanNoRepaymentDetails,
    getNoRepaymentAnalytics,
    createImmediateRecoveryAction,
    flagAsPotentialFraud,
    generateNoRepaymentReport
} = require('../controllers/noRepaymentController');

// Import middleware
const { protect } = require('../middleware/auth');
const { createRecoveryActionValidation } = require('../middleware/recoveryValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'No repayment routes working'
    });
});

// @route   GET /api/no-repayment
// @desc    Get all loans with no repayments
// @access  Private (Supervisors, Admins, Recovery Officers)
router.get('/', protect, getLoansWithNoRepayment);

// @route   GET /api/no-repayment/analytics
// @desc    Get no repayment analytics and dashboard data
// @access  Private (Supervisors, Admins)
router.get('/analytics', protect, getNoRepaymentAnalytics);

// @route   GET /api/no-repayment/report
// @desc    Generate comprehensive no repayment report
// @access  Private (Supervisors, Admins)
router.get('/report', protect, generateNoRepaymentReport);

// @route   GET /api/no-repayment/:loan_id
// @desc    Get detailed information for specific loan with no repayment
// @access  Private
router.get('/:loan_id', protect, getLoanNoRepaymentDetails);

// @route   POST /api/no-repayment/:loan_id/recovery-action
// @desc    Create immediate recovery action for no repayment loan
// @access  Private (Recovery Officers, Supervisors, Admins)
router.post('/:loan_id/recovery-action', protect, createRecoveryActionValidation, createImmediateRecoveryAction);

// @route   POST /api/no-repayment/:loan_id/flag-fraud
// @desc    Flag loan as potential fraud
// @access  Private (Supervisors, Admins)
router.post('/:loan_id/flag-fraud', protect, flagAsPotentialFraud);

module.exports = router;
