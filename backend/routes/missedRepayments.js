const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getMissedRepayments,
    getMissedRepaymentsSummary,
    markForFollowUp,
    getFollowUpActions,
    updateFollowUpStatus,
    generateMissedRepaymentsReport,
    getMissedRepaymentsAnalytics
} = require('../controllers/missedRepaymentController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
    validateMissedRepaymentsQuery,
    validateFollowUpCreation,
    validateFollowUpUpdate,
    validateReportGeneration,
    validateSummaryQuery,
    validateAnalyticsQuery
} = require('../middleware/missedRepaymentValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Missed repayment routes working'
    });
});

// @route   GET /api/missed-repayments
// @desc    Get missed repayments with filters and pagination
// @access  Private
router.get('/', protect, validateMissedRepaymentsQuery, getMissedRepayments);

// @route   GET /api/missed-repayments/summary
// @desc    Get missed repayments summary grouped by different criteria
// @access  Private
router.get('/summary', protect, validateSummaryQuery, getMissedRepaymentsSummary);

// @route   GET /api/missed-repayments/analytics
// @desc    Get missed repayments analytics and dashboard data
// @access  Private
router.get('/analytics', protect, validateAnalyticsQuery, getMissedRepaymentsAnalytics);

// @route   POST /api/missed-repayments/:schedule_id/follow-up
// @desc    Mark missed repayment for follow-up action
// @access  Private (Loan Officers, Supervisors, Admins)
router.post('/:schedule_id/follow-up', protect, validateFollowUpCreation, markForFollowUp);

// @route   GET /api/missed-repayments/follow-ups
// @desc    Get follow-up actions for missed repayments
// @access  Private
router.get('/follow-ups', protect, getFollowUpActions);

// @route   PUT /api/missed-repayments/follow-ups/:followup_id
// @desc    Update follow-up action status
// @access  Private
router.put('/follow-ups/:followup_id', protect, validateFollowUpUpdate, updateFollowUpStatus);

// @route   GET /api/missed-repayments/report
// @desc    Generate missed repayments report (JSON or CSV)
// @access  Private
router.get('/report', protect, validateReportGeneration, generateMissedRepaymentsReport);

module.exports = router;
