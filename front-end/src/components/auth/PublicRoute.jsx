import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    console.log('PublicRoute - isAuthenticated:', isAuthenticated(), 'user:', user, 'loading:', loading);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated()) {
        console.log('User is authenticated, redirecting to dashboard');
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    return children;
};

export default PublicRoute;
