import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { Search, Filter, Users, AlertCircle, ArrowLeft, Plus } from 'lucide-react';

const LoanOfficerBorrowers = () => {
    const { user } = useAuth();
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBorrowers();
    }, []);

    const fetchBorrowers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/loan-officer/borrowers');
            // Handle the nested data structure
            const borrowersData = response.data?.data || [];
            setBorrowers(borrowersData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch borrowers. Please try again later.');
            console.error('Error fetching borrowers:', err);
        } finally {
            setLoading(false);
        }
    };

    // Ensure borrowers is always an array before filtering
    const filteredBorrowers = Array.isArray(borrowers) ? borrowers.filter(borrower => {
        if (!borrower) return false;
        
        const matchesSearch = 
            (borrower.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (borrower.client_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || borrower.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }) : [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
            case 'inactive':
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Borrowers</h3>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={fetchBorrowers}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assigned Borrowers</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage and track your assigned borrowers
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard/borrowers/add'}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Borrower
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Borrowers</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                                    {borrowers.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Borrowers</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                                    {borrowers.filter(b => b?.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Borrowers</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                                    {borrowers.filter(b => b?.status === 'pending').length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or client number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none min-w-[200px]"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Borrowers Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Client Number
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Active Loans
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredBorrowers.map((borrower) => (
                                <tr 
                                    key={borrower.id} 
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        {borrower.client_number}
                                    </td>
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        {borrower.name}
                                    </td>
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        <div className="font-medium">{borrower.email}</div>
                                        <div className="text-gray-500 dark:text-gray-400">{borrower.phone_number}</div>
                                    </td>
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(borrower.status)}`}>
                                            {borrower.status?.charAt(0).toUpperCase() + borrower.status?.slice(1)}
                                        </span>
                                    </td>
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                            {borrower.active_loans_count || 0} Loans
                                        </span>
                                    </td>
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/borrowers/${borrower.id}`}
                                    >
                                        {borrower.updated_at ? format(new Date(borrower.updated_at), 'MMM d, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/dashboard/loan-officer/borrower-loans/${borrower.id}`;
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Users className="h-4 w-4 mr-1" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBorrowers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No borrowers found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Start by adding your first borrower'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanOfficerBorrowers; 