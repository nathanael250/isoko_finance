const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getDashboardStats,
    getRecentActivities,
    getPerformanceMetrics
} = require('../controllers/dashboardController');

// Import middleware
const { protect } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard routes working'
    });
});

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', protect, getDashboardStats);

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private (Admin)
router.get('/activities', protect, getRecentActivities);

// @route   GET /api/dashboard/performance
// @desc    Get performance metrics
// @access  Private (Admin)
router.get('/performance', protect, getPerformanceMetrics);

module.exports = router;
