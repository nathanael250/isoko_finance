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
// const { processRepaymentValidation } = require('../middleware/repaymentValidation'); // No longer needed for this route

// Apply authentication and authorization for all repayment routes
router.use(authenticateToken);
router.use(authorize(['cashier', 'admin', 'loan-officer', 'supervisor']));

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Repayment routes working'
    });
});

// @route   POST /api/repayments
// @desc    Record a new loan repayment (used by cashier modal)
// @access  Private (Cashiers, Supervisors, Admins)
router.post('/', recordPayment);

// @route   GET /api/repayments
// @desc    Get all repayments with filters
// @access  Private
router.get('/', getRepayments);

// @route   GET /api/repayments/:id
// @desc    Get single repayment by ID
// @access  Private
router.get('/:id', getRepayment);

// @route   GET /api/repayments/loan/:loanId
// @desc    Get all repayments for a specific loan
// @access  Private
router.get('/loan/:loanId', getLoanRepayments);

// The following route is now redundant as / is used for recordPayment
// router.post('/record', recordPayment);

module.exports = router;
