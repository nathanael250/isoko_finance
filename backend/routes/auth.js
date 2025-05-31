const express = require('express');
const router = express.Router();

// Import controller functions
const {
    login,
    getMe,
    logout,
    changePassword
} = require('../controllers/authController');

// Import middleware - make sure these exist
const { authenticateToken } = require('../middleware/auth');
const { 
    loginValidation, 
    changePasswordValidation 
} = require('../middleware/validation');

// Test route - simple route without middleware
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes working'
    });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);

module.exports = router;
