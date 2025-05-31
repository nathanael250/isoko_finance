const express = require('express');
const router = express.Router();

const {
  getLoanTypes,
  getLoanType,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  calculateLoanPreview,
  getActiveLoanTypes
} = require('../controllers/loanTypeController');

const { protect, authorize } = require('../middleware/auth');
const { validateLoanType, validateLoanTypeUpdate } = require('../middleware/validation');

// Public routes (for active loan types)
router.get('/active', protect, getActiveLoanTypes);

// Calculation route
router.post('/:id/calculate', protect, calculateLoanPreview);

// Admin routes
router.use(protect); // All routes below require authentication

router.route('/')
  .get(getLoanTypes)
  .post(authorize('admin'), validateLoanType, createLoanType);

router.route('/:id')
  .get(getLoanType)
  .put(authorize('admin'), validateLoanTypeUpdate, updateLoanType)
  .delete(authorize('admin'), deleteLoanType);

module.exports = router;
