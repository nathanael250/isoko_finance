const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { 
    getTodaySummary, 
    getRecentTransactions, 
    getDueTodayLoans,
    getDueThisWeekLoans,
    getCashierOverdueLoans,
    // Add the new controller methods
    getRecentPayments,
    searchLoans,
    recordPayment
} = require('../controllers/cashierController');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorize(['cashier', 'admin', 'supervisor']));

// Existing routes
router.get('/summary/today', getTodaySummary);
router.get('/transactions/recent', getRecentTransactions);
router.get('/loans/due-today', getDueTodayLoans);
router.get('/loans/due-this-week', getDueThisWeekLoans);
router.get('/loans/overdue', getCashierOverdueLoans);

// NEW ROUTES using controller methods
router.get('/payments/recent', getRecentPayments);
router.get('/loans/search', searchLoans);
router.post('/payments/record', recordPayment);

module.exports = router;
