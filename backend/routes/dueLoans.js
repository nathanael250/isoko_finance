const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getDueLoansWithoutDateRange,
    getDueLoansWithDateRange,
    getDueLoansSummary,
    updateOverdueLoans,
    exportDueLoans,
    getDashboardStats
} = require('../controllers/dueLoanController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
    validateDueLoansQuery,
    validateTodayDueLoansQuery,
    validateDateRangeDueLoansQuery
} = require('../middleware/dueLoanValidation');

// Test router
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Due loans routes working',
        timestamp: new Date().toISOString()
    });
});

// @route   GET /api/due-loans/today
// @desc    Get due loans for today (loan-level data)
// @access  Private
router.get('/today', protect, validateTodayDueLoansQuery, getDueLoansWithoutDateRange);

// @route   GET /api/due-loans/date-range
// @desc    Get due loans within specific date range (loan-level data)
// @access  Private
router.get('/date-range', protect, validateDateRangeDueLoansQuery, getDueLoansWithDateRange);

// @route   GET /api/due-loans/summary
// @desc    Get due loans summary and statistics
// @access  Private
router.get('/summary', protect, validateDueLoansQuery, getDueLoansSummary);

// @route   PUT /api/due-loans/update-overdue
// @desc    Update overdue loan statuses (system/admin function)
// @access  Private (Admin/System)
router.put('/update-overdue', protect, updateOverdueLoans);

// @route   GET /api/due-loans/export
// @desc    Export due loans data (JSON or CSV)
// @access  Private
router.get('/export', protect, validateDueLoansQuery, exportDueLoans);

// @route   GET /api/due-loans/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, getDashboardStats);

// @route   GET /api/due-loans/:loanId/schedules
// @desc    Get individual loan schedules (if needed)
// @access  Private
router.get('/:loanId/schedules', protect, async (req, res) => {
    try {
        const { loanId } = req.params;
        const { sequelize } = require('../config/database');
        
        const schedulesQuery = `
            SELECT 
                ls.*,
                l.loan_number,
                l.loan_account,
                CONCAT(c.first_name, ' ', c.last_name) as client_name,
                CASE WHEN ls.due_date < CURDATE() THEN DATEDIFF(CURDATE(), ls.due_date) ELSE 0 END as days_overdue,
                CASE 
                    WHEN ls.due_date < CURDATE() AND ls.status IN ('pending', 'partial') THEN 'Overdue' 
                    WHEN ls.due_date = CURDATE() AND ls.status IN ('pending', 'partial') THEN 'Due Today' 
                    WHEN ls.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ls.status IN ('pending', 'partial') THEN 'Due Soon' 
                    ELSE 'Future' 
                END as due_status
            FROM loan_schedules ls
            JOIN loans l ON ls.loan_id = l.id
            JOIN clients c ON l.client_id = c.id
            WHERE ls.loan_id = ?
            ORDER BY ls.installment_number ASC
        `;
        
        const schedules = await sequelize.query(schedulesQuery, {
            replacements: [loanId],
            type: sequelize.QueryTypes.SELECT
        });
        
        res.json({
            success: true,
            data: {
                loan_id: loanId,
                schedules: schedules
            }
        });
    } catch (error) {
        console.error('Get loan schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan schedules',
            error: error.message
        });
    }
});

module.exports = router;
