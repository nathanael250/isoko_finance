import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link 
          to="/login"
          className="inline-block px-6 py-3 bg-[#00509E] text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
