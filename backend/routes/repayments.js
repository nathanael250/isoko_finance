const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getRepayments,
    getRepayment,
    getLoanRepayments,
    recordPayment
} = require('../controllers/repaymentController');

// Import middleware
const { authenticateToken, authorize } = require('../middleware/auth');

// Apply authentication for all repayment routes
router.use(authenticateToken);

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Repayment routes working',
        user: req.user
    });
});

// @route   GET /api/repayments
// @desc    Get all repayments with filters
// @access  Private (All authenticated users - filtering handled in controller)
router.get('/', getRepayments);

// @route   POST /api/repayments
// @desc    Record a new loan repayment (used by cashier modal)
// @access  Private (Cashiers, Supervisors, Admins)
router.post('/', authorize('cashier', 'admin', 'supervisor'), recordPayment);

// @route   GET /api/repayments/:id
// @desc    Get single repayment by ID
// @access  Private
router.get('/:id', authorize('cashier', 'admin', 'loan-officer', 'supervisor'), getRepayment);

// @route   GET /api/repayments/loan/:loanId
// @desc    Get all repayments for a specific loan
// @access  Private
router.get('/loan/:loanId', authorize('cashier', 'admin', 'loan-officer', 'supervisor'), getLoanRepayments);

module.exports = router;
