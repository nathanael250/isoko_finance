import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, getDashboardRoute } = useAuth();
    const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    const result = await login({ email, password });
    
    console.log('=== LOGIN RESULT ANALYSIS ===');
    console.log('Result type:', typeof result);
    console.log('Result is null:', result === null);
    console.log('Result is undefined:', result === undefined);
    console.log('Full result:', result);
    
    if (result) {
      console.log('Result keys:', Object.keys(result));
      console.log('result.success:', result.success);
      console.log('result.user:', result.user);
      console.log('result.message:', result.message);
      
      if (result.user) {
        console.log('User type:', typeof result.user);
        console.log('User keys:', Object.keys(result.user));
        console.log('User role:', result.user.role);
      } else {
        console.log('result.user is:', result.user);
      }
    } else {
      console.log('Result is falsy');
    }
    console.log('=== END ANALYSIS ===');
    
    // Safe navigation with multiple checks
    if (result && result.success === true) {
      console.log('Login was successful');
      
      // For now, just navigate to admin dashboard regardless of role
      console.log('Navigating to /dashboard/admin');
      navigate('/dashboard/admin');
      
    } else {
      console.log('Login failed');
      const errorMsg = (result && result.message) ? result.message : 'Login failed';
      setError(errorMsg);
    }
    
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error type:', typeof err);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    console.error('=== END ERROR ===');
    setError('Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-indigo-600 mb-2">Isoko Finance</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            }`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-800 text-sm">
                        Forgot your password?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
