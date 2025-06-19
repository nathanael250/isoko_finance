import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children || <Outlet />;
};

export default PublicRoute;
