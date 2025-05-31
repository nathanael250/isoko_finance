const express = require('express');
const router = express.Router();
const PastMaturityController = require('../controllers/pastMaturityController');
const { protect } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Past maturity routes working'
    });
});

// @route   GET /api/past-maturity/loans
// @desc    Get loans past maturity by specific days
// @access  Private
// @params  ?days=30&operator=>&limit=50&offset=0&sortBy=recovery_priority_score&sortOrder=DESC
router.get('/loans', protect, PastMaturityController.getLoansByDays);

// @route   GET /api/past-maturity/stats
// @desc    Get statistics for specific day range
// @access  Private
// @params  ?minDays=1&maxDays=30
router.get('/stats', protect, PastMaturityController.getStatsByDayRange);

// @route   GET /api/past-maturity/day-breakdown
// @desc    Get day-wise breakdown
// @access  Private
// @params  ?maxDays=30
router.get('/day-breakdown', protect, PastMaturityController.getDayWiseBreakdown);

// @route   GET /api/past-maturity/common-filters
// @desc    Get common day filters with counts
// @access  Private
router.get('/common-filters', protect, PastMaturityController.getCommonDayFilters);

// @route   GET /api/past-maturity/dashboard
// @desc    Get dashboard summary for past maturity
// @access  Private
router.get('/dashboard', protect, PastMaturityController.getDashboardSummary);

// @route   GET /api/past-maturity/branches
// @desc    Get branch-wise past maturity summary
// @access  Private
router.get('/branches', protect, PastMaturityController.getBranchSummary);

// @route   GET /api/past-maturity/officers
// @desc    Get officer-wise past maturity summary
// @access  Private
// @params  ?branch=branchName
router.get('/officers', protect, PastMaturityController.getOfficerSummary);

// @route   GET /api/past-maturity/urgency/:urgency
// @desc    Get loans by urgency level
// @access  Private
// @params  ?limit=50&offset=0
router.get('/urgency/:urgency', protect, PastMaturityController.getLoansByUrgency);

// @route   GET /api/past-maturity/high-priority
// @desc    Get high priority loans (top recovery scores)
// @access  Private
// @params  ?limit=20
router.get('/high-priority', protect, PastMaturityController.getHighPriorityLoans);

// @route   GET /api/past-maturity/no-actions
// @desc    Get loans with no recovery actions taken
// @access  Private
// @params  ?minDays=7&limit=50&offset=0
router.get('/no-actions', protect, PastMaturityController.getLoansWithoutActions);

// @route   GET /api/past-maturity/export
// @desc    Export past maturity data
// @access  Private
// @params  ?format=json&days=30&operator=>&urgency=HIGH&branch=Main&officer=123
router.get('/export', protect, PastMaturityController.exportPastMaturityData);

module.exports = router;
