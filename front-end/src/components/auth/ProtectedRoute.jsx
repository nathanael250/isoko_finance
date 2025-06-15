import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required, check if user has permission
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        console.log('Access denied. User role:', user?.role, 'Allowed roles:', allowedRoles);
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
