const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createLoan,
  getLoans,
  getLoan,
  updateLoanStatus,
  getLoansByClient,
  calculateLoanDetails,
  updateLoanPerformance,
  getLoanRepayments,
  getLoanSchedule,
  getLoanDocuments,
  uploadLoanDocument,
  getMyLoans,


  getMonthlyLoanReleases,
  getLoanStatusDistribution,
  getMonthlyCollections,
  getOutstandingTrends,

  getLoanOfficerStats,
  getLoansByOfficer,
  getCollectionsByOfficer
} = require('../controllers/loanController');

// Import middleware
const { protect } = require('../middleware/auth');
const { createLoanValidation, updateLoanStatusValidation } = require('../middleware/loanValidation');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/loan-documents/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Office documents are allowed'));
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Loan routes working'
  });
});

// @route   POST /api/loans
// @desc    Create new loan application
// @access  Private (Loan Officers, Supervisors, Admins)
router.post('/', protect, createLoanValidation, createLoan);

// @route   GET /api/loans
// @desc    Get all loans with filters
// @access  Private
router.get('/', protect, getLoans);

// @route   GET /api/loans/my-loans
// @desc    Get loans assigned to or created by the authenticated loan officer
// @access  Private (Loan Officer)
router.get('/my-loans', protect, getMyLoans);

// @route   GET /api/loans/client/:clientId
// @desc    Get all loans for a specific client
// @access  Private
router.get('/client/:clientId', protect, getLoansByClient);

// @route   GET /api/loans/:id
// @desc    Get single loan by ID
// @access  Private
router.get('/:id', protect, getLoan);

// @route   PUT /api/loans/:id/status
// @desc    Update loan status (approve, reject, disburse, etc.)
// @access  Private (Supervisors, Admins)
router.put('/:id/status', protect, updateLoanStatusValidation, updateLoanStatus);

// @route   POST /api/loans/calculate
// @desc    Calculate loan details (installments, interest, etc.)
// @access  Private
router.post('/calculate', protect, calculateLoanDetails);

// @route   PUT /api/loans/:id/performance
// @desc    Update loan performance classification
// @access  Private (System/Automated)
router.put('/:id/performance', protect, updateLoanPerformance);

// New routes for loan details
// @route   GET /api/loans/:id/repayments
// @desc    Get loan repayment history
// @access  Private
router.get('/:id/repayments', protect, getLoanRepayments);

// @route   GET /api/loans/:id/schedule
// @desc    Get loan repayment schedule
// @access  Private
router.get('/:loanId/schedule', protect, getLoanSchedule);

// @route   GET /api/loans/:id/documents
// @desc    Get loan documents
// @access  Private
router.get('/:id/documents', protect, getLoanDocuments);

// @route   POST /api/loans/documents/upload
// @desc    Upload loan document
// @access  Private
router.post('/documents/upload', protect, upload.single('file'), uploadLoanDocument);


// Chart data routes
// @route   GET /api/loans/stats/monthly-releases
// @desc    Get monthly loan releases data for charts
// @access  Private
router.get('/stats/monthly-releases', protect, getMonthlyLoanReleases);

// @route   GET /api/loans/stats/status-distribution
// @desc    Get loan status distribution for pie chart
// @access  Private
router.get('/stats/status-distribution', protect, getLoanStatusDistribution);

// @route   GET /api/loans/stats/monthly-collections
// @desc    Get monthly collections data for charts
// @access  Private
router.get('/stats/monthly-collections', protect, getMonthlyCollections);

// @route   GET /api/loans/stats/outstanding-trends
// @desc    Get outstanding trends data for charts
// @access  Private
router.get('/stats/outstanding-trends', protect, getOutstandingTrends);

// @route   GET /api/loans/officer/:officerId/stats
// @desc    Get loan officer statistics
router.get('/officer/:officerId/stats', protect, getLoanOfficerStats);
// @route   GET /api/loans/officer/:officerId
// @desc    Get loans assigned to a specific loan officer
router.get('/officer/:officerId', protect, getLoansByOfficer);

module.exports = router;
