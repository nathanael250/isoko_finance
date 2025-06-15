import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorBoundary';
import { formatCurrency, formatDate } from '../../utils/formatters'; // Assuming these are useful for client data too
import { Eye, Plus, Search } from 'lucide-react'; // Import Eye icon

const ClientManagement = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: ''
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1
    });

    useEffect(() => {
        fetchClients();
    }, [filters]);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await clientsAPI.getClients(filters);
            if (response.data.success) {
                setClients(response.data.data.clients);
                setPagination(response.data.data.pagination);
            } else {
                setError(response.data.message || 'Failed to fetch clients.');
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.response?.data?.message || 'Failed to load clients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (window.clientSearchTimeout) {
            clearTimeout(window.clientSearchTimeout);
        }
        window.clientSearchTimeout = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
        }, 500);
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchClients} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
                {/* Optional: Add button to add new client */}
                {/* <Link
                    to="/loan-officer/clients/add"
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Client
                </Link> */}
            </div>

            {/* Search Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                placeholder="Search by client name, number..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{client.client_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{client.first_name} {client.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{client.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{client.mobile}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* View Loans Button */}
                                            <Link
                                                to={`/loan-officer/clients/${client.id}/loans`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                title="View Loans"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            {/* Add Loan Button */}
                                            <Link
                                                to={`/loan-officer/loans/add?clientId=${client.id}`}
                                                className="text-green-600 hover:text-green-900"
                                                title="Add Loan"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </Link>
                                            {/* Other actions like Edit, View Profile, etc. can go here */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <nav
                        className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6"
                        aria-label="Pagination"
                    >
                        <div className="flex-1 flex justify-between sm:justify-end">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:items-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Page {pagination.currentPage} of {pagination.pages}
                            </p>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default ClientManagement;
