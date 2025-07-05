const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/loans/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow specific file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and documents are allowed'));
        }
    }
});

const {
    getLoanDetails,
    addRepayment,
    addComment,
    getComments,
    getDocuments,
    deleteDocument,
    downloadDocument,
    updateDocumentStatus,
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

// Comments
router.get('/:loanId/comments', protect, getComments);
router.post('/:loanId/comments', protect, addComment);

// Documents  
router.get('/:loanId/documents', protect, getDocuments);
router.delete('/:loanId/files/:documentId', protect, deleteDocument);
router.get('/:loanId/files/:documentId/download', protect, downloadDocument);
router.put('/:loanId/files/:documentId', protect, updateDocumentStatus);

// Generate loan schedule
router.post('/:loanId/generate-schedule', protect, generateLoanSchedule);

// Collateral
router.post('/:loanId/collateral', protect, addCollateral);

// Expenses
router.post('/:loanId/expenses', protect, addExpense);

// Other Income
router.post('/:loanId/other-income', protect, addOtherIncome);

// Files
router.post('/:loanId/files', protect, upload.single('document'), uploadFile);

// Penalties
router.get('/:loanId/calculate-penalties', protect, calculatePenalties);
router.put('/:loanId/recalculate-balances', protect, recalculateLoanBalances);

module.exports = router;
