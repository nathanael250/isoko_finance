const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No user information found.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required_roles: allowedRoles,
                user_role: req.user.role
            });
        }

        next();
    };
};

// Specific role checks
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

const requireSupervisorOrAdmin = (req, res, next) => {
    if (!req.user || !['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Supervisor or Admin privileges required.'
        });
    }
    next();
};

const requireLoanOfficerOrAbove = (req, res, next) => {
    if (!req.user || !['admin', 'supervisor', 'loan-officer'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Loan Officer privileges or above required.'
        });
    }
    next();
};

module.exports = {
    authorizeRoles,
    requireAdmin,
    requireSupervisorOrAdmin,
    requireLoanOfficerOrAbove
};
