const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getLoansInArrears,
    getLoanInArrearsDetails,
    getArrearsAnalytics,
    createRecoveryAction,
    updateRecoveryAction,
    generateArrearsReport,
    bulkUpdatePerformanceClass
} = require('../controllers/loansInArrearsController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
    validateArrearsFilters,
    validateRecoveryAction,
    validateRecoveryActionUpdate,
    validateReportGeneration
} = require('../middleware/arrearsValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Loans in arrears routes working'
    });
});

// @route   GET /api/loans-in-arrears
// @desc    Get all loans in arrears with filtering and pagination
// @access  Private
router.get('/', protect, validateArrearsFilters, getLoansInArrears);

// @route   GET /api/loans-in-arrears/analytics
// @desc    Get arrears analytics and dashboard data
// @access  Private
router.get('/analytics', protect, getArrearsAnalytics);

// @route   GET /api/loans-in-arrears/report
// @desc    Generate arrears report (JSON/CSV)
// @access  Private
router.get('/report', protect, validateReportGeneration, generateArrearsReport);

// @route   PUT /api/loans-in-arrears/bulk-update-performance
// @desc    Bulk update performance classification
// @access  Private (Admin/Supervisor)
router.put('/bulk-update-performance', protect, bulkUpdatePerformanceClass);

// @route   GET /api/loans-in-arrears/:loan_id
// @desc    Get detailed information for a specific loan in arrears
// @access  Private
router.get('/:loan_id', protect, getLoanInArrearsDetails);

// @route   POST /api/loans-in-arrears/:loan_id/recovery-action
// @desc    Create recovery action for loan in arrears
// @access  Private
router.post('/:loan_id/recovery-action', protect, validateRecoveryAction, createRecoveryAction);

// @route   PUT /api/loans-in-arrears/recovery-actions/:action_id
// @desc    Update recovery action status
// @access  Private
router.put('/recovery-actions/:action_id', protect, validateRecoveryActionUpdate, updateRecoveryAction);

module.exports = router;
