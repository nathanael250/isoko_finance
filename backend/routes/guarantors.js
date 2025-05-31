const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createGuarantor,
    getGuarantors,
    getGuarantor,
    updateGuarantor,
    getGuarantorsByLoan,
    getGuarantorsByClient,
    updateGuarantorGuarantee,
    activateGuarantorGuarantee,
    releaseGuarantorGuarantee,
    markGuarantorDefault,
    getAvailableGuarantors,
    getGuarantorPerformance,
    bulkUpdateGuarantors,
    uploadGuarantorPhoto,
    upload
} = require('../controllers/guarantorController');

// Import middleware
const { protect } = require('../middleware/auth');
const {
    createGuarantorValidation,
    updateGuarantorValidation,
    updateGuarantorStatusValidation
} = require('../middleware/guarantorValidation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Guarantor routes working'
    });
});

// @route   GET /api/guarantors/available
// @desc    Get available guarantors for a loan amount
// @access  Private
router.get('/available', protect, getAvailableGuarantors);

// @route   PUT /api/guarantors/bulk-update
// @desc    Bulk update guarantor statuses
// @access  Private (Supervisors, Admins)
router.put('/bulk-update', protect, bulkUpdateGuarantors);

// @route   GET /api/guarantors/loan/:loanId
// @desc    Get guarantors for a specific loan
// @access  Private
router.get('/loan/:loanId', protect, getGuarantorsByLoan);

// @route   GET /api/guarantors/client/:clientId
// @desc    Get guarantors for a specific client
// @access  Private
router.get('/client/:clientId', protect, getGuarantorsByClient);

// @route   POST /api/guarantors
// @desc    Create new guarantor with loan relationship
// @access  Private (Loan Officers, Supervisors, Admins)
router.post('/', protect, createGuarantorValidation, createGuarantor);

// @route   GET /api/guarantors
// @desc    Get all guarantors with filters
// @access  Private
router.get('/', protect, getGuarantors);

// @route   GET /api/guarantors/:id
// @desc    Get single guarantor by ID
// @access  Private
router.get('/:id', protect, getGuarantor);

// @route   PUT /api/guarantors/:id
// @desc    Update guarantor basic information
// @access  Private
router.put('/:id', protect, updateGuarantorValidation, updateGuarantor);

// @route   PUT /api/guarantors/:id/guarantee
// @desc    Update guarantor guarantee details
// @access  Private
router.put('/:id/guarantee', protect, updateGuarantorGuarantee);

// @route   PUT /api/guarantors/:id/activate
// @desc    Activate guarantor guarantee
// @access  Private
router.put('/:id/activate', protect, activateGuarantorGuarantee);

// @route   PUT /api/guarantors/:id/release
// @desc    Release guarantor guarantee
// @access  Private
router.put('/:id/release', protect, releaseGuarantorGuarantee);

// @route   PUT /api/guarantors/:id/default
// @desc    Mark guarantor guarantee as defaulted
// @access  Private
router.put('/:id/default', protect, markGuarantorDefault);

// @route   GET /api/guarantors/:id/performance
// @desc    Get guarantor performance report
// @access  Private
router.get('/:id/performance', protect, getGuarantorPerformance);

// @route   POST /api/guarantors/:id/photo
// @desc    Upload guarantor photo
// @access  Private
router.post('/:id/photo', protect, upload.single('photo'), uploadGuarantorPhoto);

module.exports = router;
