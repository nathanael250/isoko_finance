const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getDueLoans,
    getDueLoansSummary,
    updateOverdueLoans,
    exportDueLoans,
    getDashboardStats
} = require('../controllers/dueLoanController');

// Import middleware
const { protect } = require('../middleware/auth');
const { validateDueLoansQuery } = require('../middleware/dueLoanValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Due loans routes working'
    });
});

// @route   GET /api/due-loans
// @desc    Get due loans within date range with filters
// @access  Private
router.get('/', protect, validateDueLoansQuery, getDueLoans);

// @route   GET /api/due-loans/summary
// @desc    Get due loans summary and statistics
// @access  Private
router.get('/summary', protect, validateDueLoansQuery, getDueLoansSummary);

// @route   PUT /api/due-loans/update-overdue
// @desc    Update overdue loan statuses (system/admin function)
// @access  Private (Admin/System)
router.put('/update-overdue', protect, updateOverdueLoans);

// @route   GET /api/due-loans/export
// @desc    Export due loans data (JSON or CSV)
// @access  Private
router.get('/export', protect, validateDueLoansQuery, exportDueLoans);



router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
