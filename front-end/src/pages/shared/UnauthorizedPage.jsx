import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page.
                    </p>
                    {user && (
                        <p className="text-sm text-gray-500 mb-6">
                            Current role: <span className="font-semibold">{user.role}</span>
                        </p>
                    )}
                </div>

                <div className="space-x-4">
                    <Link
                        to={`/dashboard/${user?.role}`}
                        className="inline-block px-6 py-3 bg-[#00509E] text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
