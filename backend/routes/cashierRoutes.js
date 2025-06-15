const express = require('express');
const router = express.Router();
const { 
    getTodaySummary, 
    getRecentTransactions, 
    getDueTodayLoans 
} = require('../controllers/cashierController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Test endpoints (you can remove these later)
router.get('/test-auth', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'Authentication successful'
    });
});

router.get('/test-role', authenticateToken, authorize('cashier', 'admin'), (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'Role authorization successful'
    });
});

router.get('/test-simple', (req, res) => {
    res.json({
        success: true,
        message: 'Simple test successful'
    });
});

// Dashboard data endpoints with real controllers
router.get('/summary/today', authenticateToken, authorize('cashier', 'admin'), getTodaySummary);
router.get('/transactions/recent', authenticateToken, authorize('cashier', 'admin'), getRecentTransactions);
router.get('/loans/due-today', authenticateToken, authorize('cashier', 'admin'), getDueTodayLoans);

module.exports = router;
