const express = require('express');
const router = express.Router();

const {
    getLoanDetails,
    addRepayment,
    addComment,
    generateLoanSchedule,
    addCollateral,
    addExpense,
    addOtherIncome,
    uploadFile,
    calculatePenalties,
    recalculateLoanBalances
} = require('../controllers/loanDetailsController');

const { protect } = require('../middleware/auth');

// Get comprehensive loan details
router.get('/:id/details', protect, getLoanDetails);

// Add repayment
router.post('/:loanId/repayments', protect, addRepayment);

// Add comment
router.post('/:loanId/comments', protect, addComment);

// Generate loan schedule
router.post('/:loanId/generate-schedule', protect, generateLoanSchedule);

// Collateral
router.post('/:loanId/collateral', protect, addCollateral);

// Expenses
router.post('/:loanId/expenses', protect, addExpense);

// Other Income
router.post('/:loanId/other-income', protect, addOtherIncome);

// Files
router.post('/:loanId/files', protect, uploadFile);

// Penalties
router.get('/:loanId/calculate-penalties', protect, calculatePenalties);
router.put('/:loanId/recalculate-balances', protect, recalculateLoanBalances);

module.exports = router;
