const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sanitizeFilename, getFileExtension } = require('../utils/helpers');

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/clients',
        'uploads/clients/photos',
        'uploads/clients/documents',
        'uploads/users',
        'uploads/loans',
        'uploads/temp'
    ];

    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
};

// Initialize upload directories
ensureUploadDirs();

// Storage configuration for client data (photo + documents)
const clientDataStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/clients/documents';

        if (file.fieldname === 'photo') {
            uploadPath = 'uploads/clients/photos';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedName = sanitizeFilename(file.originalname);
        const ext = getFileExtension(file.originalname);
        const filename = `${timestamp}_${sanitizedName}`;

        cb(null, filename);
    }
});

// Storage configuration for additional client files
const clientFilesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/clients/documents');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedName = sanitizeFilename(file.originalname);
        const filename = `${timestamp}_${sanitizedName}`;

        cb(null, filename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        document: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ]
    };

    let isAllowed = false;

    if (file.fieldname === 'photo') {
        isAllowed = allowedTypes.photo.includes(file.mimetype);
    } else {
        isAllowed = allowedTypes.document.includes(file.mimetype);
    }

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${file.fieldname === 'photo' ? 'JPEG, PNG, GIF' : 'PDF, DOC, DOCX, JPEG, PNG, GIF'
            }`), false);
    }
};

// Multer configuration for client registration (photo + documents)
const uploadClientData = multer({
    storage: clientDataStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'id_document', maxCount: 1 },
    { name: 'proof_of_address', maxCount: 1 },
    { name: 'business_document', maxCount: 1 },
    { name: 'additional_documents', maxCount: 5 }
]);

// Multer configuration for additional client files
const uploadClientFiles = multer({
    storage: clientFilesStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 5 // Maximum 5 files at once
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPEG, PNG, GIF'), false);
        }
    }
}).array('files', 5);

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB per file.',
                    error_code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum allowed varies by upload type.',
                    error_code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Please check the field names.',
                    error_code: 'UNEXPECTED_FIELD'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'File upload error: ' + err.message,
                    error_code: 'UPLOAD_ERROR'
                });
        }
    } else if (err) {
        // Custom file filter errors
        return res.status(400).json({
            success: false,
            message: err.message,
            error_code: 'INVALID_FILE_TYPE'
        });
    }

    next();
};

// Helper function to delete uploaded files (cleanup on error)
const deleteUploadedFiles = (files) => {
    if (!files) return;

    const filesToDelete = [];

    // Handle different file structures
    if (Array.isArray(files)) {
        filesToDelete.push(...files);
    } else if (typeof files === 'object') {
        Object.values(files).forEach(fileArray => {
            if (Array.isArray(fileArray)) {
                filesToDelete.push(...fileArray);
            } else {
                filesToDelete.push(fileArray);
            }
        });
    }

    // Delete each file
    filesToDelete.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
                console.log(`Deleted file: ${file.path}`);
            } catch (error) {
                console.error(`Error deleting file ${file.path}:`, error);
            }
        }
    });
};

// Middleware to process uploaded files and add to request
const processUploadedFiles = (req, res, next) => {
    if (req.files) {
        req.uploadedFiles = {};

        // Process different field types
        Object.keys(req.files).forEach(fieldName => {
            const files = req.files[fieldName];

            if (Array.isArray(files)) {
                req.uploadedFiles[fieldName] = files.map(file => ({
                    original_name: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                }));
            } else {
                req.uploadedFiles[fieldName] = {
                    original_name: files.originalname,
                    filename: files.filename,
                    path: files.path,
                    size: files.size,
                    mimetype: files.mimetype
                };
            }
        });
    }

    next();
};

module.exports = {
    uploadClientData,
    uploadClientFiles,
    handleUploadError,
    deleteUploadedFiles,
    processUploadedFiles,
    ensureUploadDirs
};
