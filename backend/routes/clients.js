const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { 
  validateClientRegistration, 
  validateClientUpdate,
  validateFileUpload
} = require('../middleware/validation');
const { 
  uploadClientData, 
  uploadClientFiles, 
  handleUploadError 
} = require('../middleware/uploads');

// Import controller functions
const {
  registerClient,
  getClients,
  getClient,
  updateClient,
  assignOfficer,
  deleteClient,
  approveClient,
  getClientFiles,
  deleteClientFile,
  getClientStats,
  searchClients,
  getClientWithLoans
} = require('../controllers/clientController');

// Apply authentication to all routes
router.use(authenticateToken);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Client routes working',
    user: req.user
  });
});

// Client statistics (for dashboard)
router.get('/stats', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  getClientStats
);

// Search clients
router.get('/search', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  searchClients
);

// Get all clients with filtering and pagination
router.get('/', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  getClients
);

// Register new client with file uploads
router.post('/', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  uploadClientData,
  handleUploadError,
  validateClientRegistration,
  registerClient
);

// Get single client by ID
router.get('/:id', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  getClient
);

// Update client information
router.put('/:id', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  validateClientUpdate,
  updateClient
);

// Delete client (admin only)
router.delete('/:id', 
  authorizeRoles(['admin']),
  deleteClient
);

// Approve client (admin and supervisor only)
router.patch('/:id/assign', 
  authorizeRoles(['admin', 'supervisor']),
  assignOfficer
);

// Upload additional files for client
router.post('/:id/files', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  uploadClientFiles,
  handleUploadError,
  validateFileUpload,
  uploadClientFiles
);

// Get client files
router.get('/:id/files', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  getClientFiles
);

// Delete client file
router.delete('/:id/files/:fileId', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  deleteClientFile
);

// Assign loan officer to client
router.patch('/:id/assign-officer', 
  authorizeRoles(['admin', 'supervisor', 'loan-officer']),
  assignOfficer
);

router.get('/:id/loans', protect, getClientWithLoans);

module.exports = router;
