import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, loading } = useAuth();



    if (loading) {

        return <LoadingSpinner />;
    }

    if (!user) {

        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {

        return <Navigate to="/unauthorized" replace />;
    }



    // Add visual debug info
    return (
        <div style={{ minHeight: '100vh' }}>
            
            {children ? children : <Outlet />}
        </div>
    );
};

export default ProtectedRoute;
