const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Organize files by type
        if (file.fieldname === 'borrower_photo') {
            uploadPath += 'clients/photos/';
        } else if (file.fieldname === 'client_files') {
            uploadPath += 'clients/documents/';
        } else {
            uploadPath += 'misc/';
        }

        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);

        // Clean filename
        const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanBaseName}_${uniqueSuffix}${extension}`;

        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        'borrower_photo': /jpeg|jpg|png|gif/,
        'client_files': /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/
    };

    const fieldAllowedTypes = allowedTypes[file.fieldname] || allowedTypes['client_files'];
    const extname = fieldAllowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fieldAllowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.source}`));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 10 // Maximum 10 files per request
    },
    fileFilter: fileFilter
});

// Middleware for client registration with photo
const uploadClientPhoto = upload.single('borrower_photo');

// Middleware for multiple client files
const uploadClientFiles = upload.array('client_files', 5);

// Middleware for both photo and files
const uploadClientData = upload.fields([
    { name: 'borrower_photo', maxCount: 1 },
    { name: 'client_files', maxCount: 5 }
]);

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 5 files per upload.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.'
            });
        }
    }

    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

// Helper function to delete uploaded files (for cleanup on error)
const deleteUploadedFiles = (files) => {
    if (!files) return;

    const filesToDelete = Array.isArray(files) ? files : [files];

    filesToDelete.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    });
};

module.exports = {
    uploadClientPhoto,
    uploadClientFiles,
    uploadClientData,
    handleUploadError,
    deleteUploadedFiles
};
