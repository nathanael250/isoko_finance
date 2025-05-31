import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on user role
      navigate(`/dashboard/${result.user.role}`);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Quick login function for testing
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        <div className="bg-[#00509E] flex-1 p-12 flex flex-col justify-center items-center text-white relative rounded-[0px_200px_0px_0px]">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full"></div>

          {/* Main content */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Isoko finance</h1>
            <p className="text-blue-100 text-lg">Login to continue</p>
          </div>

          {/* Decorative curved design */}
          <div className="absolute -right-8 top-0 w-32 h-32 bg-blue-500 rounded-full opacity-30"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 p-12 flex flex-col justify-center relative overflow-hidden">
          <svg className="absolute top-0 right-[-10px] w-100 h-100" viewBox="0 0 1400 1400">
            <path fill="#00509E" d="M953.5,1.5c47.76,10.65,159.86,42.34,262,141c102.16,98.68,137.71,209.64,150,257c0-132.67,0-265.33,0-398
    C1228.17,1.5,1090.83,1.5,953.5,1.5z"/>
          </svg>

          <div className="max-w-sm mx-auto w-full z-100">
            <h2 className="text-4xl text-center font-bold text-[#00509E] mb-2">welcome</h2>
            <p className="text-center mb-8">Log into your account to continue</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email................"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-blue-100 bg-opacity-60 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500 text-gray-700"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password................"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-blue-100 bg-opacity-60 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500 text-gray-700"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00509E] hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-full transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'LOG IN'}
                </button>
              </div>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Do not have account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium underline">
                signin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
