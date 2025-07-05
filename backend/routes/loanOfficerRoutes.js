const express = require('express');
const router = express.Router();
const { getDashboardStats, getAssignedLoans, getAssignedBorrowers } = require('../controllers/loanOfficerController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/loan-officer/stats
// @desc    Get loan officer dashboard statistics
// @access  Private
router.get('/stats', getDashboardStats);

// @route   GET /api/loan-officer/loans
// @desc    Get loan officer's assigned loans
// @access  Private
router.get('/loans', getAssignedLoans);

// @route   GET /api/loan-officer/borrowers
// @desc    Get loan officer's assigned borrowers
// @access  Private
router.get('/borrowers', getAssignedBorrowers);

router.get('/stats/:officerId', getDashboardStats);
router.get('/loans/:officerId', getAssignedLoans);
router.get('/borrowers/:officerId', getAssignedBorrowers);

module.exports = router;
