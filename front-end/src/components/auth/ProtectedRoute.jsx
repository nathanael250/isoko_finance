import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, loading } = useAuth();

    console.log('=== PROTECTED ROUTE DEBUG ===');
    console.log('ProtectedRoute - loading:', loading);
    console.log('ProtectedRoute - user:', user);
    console.log('ProtectedRoute - user role:', user?.role);
    console.log('ProtectedRoute - allowedRoles:', allowedRoles);
    console.log('ProtectedRoute - has children:', !!children);
    console.log('ProtectedRoute - current path:', window.location.pathname);

    if (loading) {
        console.log('ProtectedRoute: Showing loading spinner');
        return <LoadingSpinner />;
    }

    if (!user) {
        console.log('ProtectedRoute: No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log('ProtectedRoute: Access denied for role:', user.role);
        return <Navigate to="/unauthorized" replace />;
    }

    console.log('ProtectedRoute: Access granted, rendering content');

    // Add visual debug info
    return (
        <div style={{ minHeight: '100vh' }}>
            
            {children ? children : <Outlet />}
        </div>
    );
};

export default ProtectedRoute;
