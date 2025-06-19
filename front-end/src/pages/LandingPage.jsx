import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-indigo-600">Isoko Finance</h1>
                        </div>
                        <div className="flex space-x-4">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-md transition duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Welcome to <span className="text-indigo-600">Isoko Finance</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Your trusted partner in financial management. We provide comprehensive
                        loan management solutions to help you achieve your financial goals.
                    </p>
                    {!user && (
                        <Link
                            to="/login"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-200 inline-block"
                        >
                            Get Started Today
                        </Link>
                    )}
                </div>
            </div>

            {/* Features Section */}
            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Isoko Finance?</h2>
                    <p className="text-lg text-gray-600">Comprehensive financial solutions tailored to your needs</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loan Management</h3>
                        <p className="text-gray-600">Comprehensive loan tracking and management system for all your financial needs.</p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                        <p className="text-gray-600">Detailed analytics and reporting to help you make informed financial decisions.</p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
                        <p className="text-gray-600">Efficient client and borrower management system with comprehensive profiles.</p>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Isoko Finance</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                Isoko Finance is a leading financial technology company dedicated to providing
                                innovative loan management solutions. We understand the complexities of financial
                                management and strive to simplify the process for our clients.
                            </p>
                            <p className="text-lg text-gray-600 mb-6">
                                Our platform offers comprehensive tools for loan officers, supervisors, administrators,
                                and cashiers to efficiently manage loans, track payments, and generate detailed reports.
                            </p>
                            <div className="flex space-x-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">1000+</div>
                                    <div className="text-gray-600">Active Loans</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">500+</div>
                                    <div className="text-gray-600">Happy Clients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">99%</div>
                                    <div className="text-gray-600">Success Rate</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                            <p className="mb-6">
                                Join thousands of satisfied customers who trust Isoko Finance
                                for their loan management needs.
                            </p>
                            {!user && (
                                <Link
                                    to="/login"
                                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 inline-block"
                                >
                                    Start Your Journey
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Isoko Finance</h3>
                            <p className="text-gray-400">
                                Your trusted partner in financial management and loan solutions.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Services</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Loan Management</li>
                                <li>Payment Processing</li>
                                <li>Financial Analytics</li>
                                <li>Client Management</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>About Us</li>
                                <li>Contact</li>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <div className="space-y-2 text-gray-400">
                                <p>Email: info@isokofinance.com</p>
                                <p>Phone: +250 XXX XXX XXX</p>
                                <p>Address: Kigali, Rwanda</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Isoko Finance. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;