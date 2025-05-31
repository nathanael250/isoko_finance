const express = require('express');
const router = express.Router();

// Import controller functions
const {
    processRepayment,
    getRepayments,
    getRepayment,
    getLoanRepayments
} = require('../controllers/repaymentController');

// Import middleware
const { protect } = require('../middleware/auth');
const { processRepaymentValidation } = require('../middleware/repaymentValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Repayment routes working'
    });
});

// @route   POST /api/repayments
// @desc    Process loan repayment
// @access  Private (Cashiers, Supervisors, Admins)
router.post('/', protect, processRepaymentValidation, processRepayment);

// @route   GET /api/repayments
// @desc    Get all repayments with filters
// @access  Private
router.get('/', protect, getRepayments);

// @route   GET /api/repayments/:id
// @desc    Get single repayment by ID
// @access  Private
router.get('/:id', protect, getRepayment);

// @route   GET /api/repayments/loan/:loanId
// @desc    Get all repayments for a specific loan
// @access  Private
router.get('/loan/:loanId', protect, getLoanRepayments);

module.exports = router;
