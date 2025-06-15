const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user details - adjust this based on your User model methods
        let user;
        try {
            // Try different methods based on your User model
            if (typeof User.findByPk === 'function') {
                user = await User.findByPk(decoded.userId);
            } else if (typeof User.findById === 'function') {
                user = await User.findById(decoded.userId);
            } else {
                // Fallback - you might need to adjust this
                user = await User.findOne({ where: { id: decoded.userId } });
            }
        } catch (modelError) {
            console.error('User model error:', modelError);
            return res.status(500).json({
                success: false,
                message: 'Error accessing user data.'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        // Check if user is active (adjust field name if different)
        if (user.status && user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Account is not active.'
            });
        }

        // Add user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`,
            status: user.status || 'active'
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};




const authorize = (...roles) =>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};


const authorizeOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    const resourceUserId = req.params.userId || req.params.id;
    
    if (req.user.role === 'admin' || req.user.id.toString() === resourceUserId) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this resource'
        });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        let user;
        try {
            if (typeof User.findByPk === 'function') {
                user = await User.findByPk(decoded.userId);
            } else if (typeof User.findById === 'function') {
                user = await User.findById(decoded.userId);
            } else {
                user = await User.findOne({ where: { id: decoded.userId } });
            }
        } catch (modelError) {
            req.user = null;
            return next();
        }

        if (user && (!user.status || user.status === 'active')) {
            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role,
                name: `${user.first_name} ${user.last_name}`,
                status: user.status || 'active'
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    authorize,
    protect: authenticateToken // Alias for compatibility
};
