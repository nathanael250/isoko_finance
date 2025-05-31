const express = require('express');
const router = express.Router();
const PrincipalOutstandingController = require('../controllers/principalOutstandingController');
const { protect } = require('../middleware/auth');

// Test route
router.get('/test', PrincipalOutstandingController.test);

// @route   GET /api/principal-outstanding
// @desc    Get all principal outstanding loans with filters
// @access  Private
router.get('/', protect, PrincipalOutstandingController.getPrincipalOutstanding);

// @route   GET /api/principal-outstanding/dashboard
// @desc    Get dashboard summary
// @access  Private
router.get('/dashboard', protect, PrincipalOutstandingController.getDashboardSummary);

// @route   GET /api/principal-outstanding/branches
// @desc    Get branch-wise summary
// @access  Private
router.get('/branches', protect, PrincipalOutstandingController.getBranchSummary);

// @route   GET /api/principal-outstanding/officers
// @desc    Get officer-wise summary
// @access  Private
router.get('/officers', protect, PrincipalOutstandingController.getOfficerSummary);

// @route   GET /api/principal-outstanding/risk/:risk
// @desc    Get loans by risk category
// @access  Private
router.get('/risk', protect, PrincipalOutstandingController.getLoansByRisk);

// @route   GET /api/principal-outstanding/loan/:loanId/payments
// @desc    Get payment history for specific loan
// @access  Private
router.get('/loan/:loanId/payments', protect, PrincipalOutstandingController.getLoanPaymentHistory);

// @route   GET /api/principal-outstanding/filters
// @desc    Get filter options
// @access  Private
router.get('/filters', protect, PrincipalOutstandingController.getFilterOptions);

// @route   GET /api/principal-outstanding/export
// @desc    Export principal outstanding data
// @access  Private
router.get('/export', protect, PrincipalOutstandingController.exportData);

module.exports = router;
