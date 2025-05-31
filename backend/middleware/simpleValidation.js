// Simple validation without express-validator
const loginValidation = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    if (!email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email'
        });
    }
    
    next();
};

const changePasswordValidation = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required'
        });
    }
    
    next();
};

const createUserValidation = (req, res, next) => {
    const { first_name, last_name, email, password, role } = req.body;
    
    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    next();
};

const updateUserValidation = (req, res, next) => {
    // For updates, we don't require all fields
    next();
};

module.exports = {
    loginValidation,
    changePasswordValidation,
    createUserValidation,
    updateUserValidation
};
