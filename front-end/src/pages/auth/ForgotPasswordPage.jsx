import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate password reset
        setMessage('Password reset instructions have been sent to your email.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

                {message ? (
                    <div className="text-center">
                        <p className="text-green-600 mb-4">{message}</p>
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                        >
                            Reset Password
                        </button>
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
