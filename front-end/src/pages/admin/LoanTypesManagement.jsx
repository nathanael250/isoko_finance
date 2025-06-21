import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    TagIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { loanTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LoanTypesManagement = () => {
    const [loanTypes, setLoanTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        is_active: '',
        is_visible_to_clients: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        per_page: 10
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loanTypeToDelete, setLoanTypeToDelete] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLoanTypes();
    }, [searchTerm, filters, pagination.current_page]);

    const fetchLoanTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: pagination.current_page || 1,
                limit: pagination.per_page || 10,
                search: searchTerm || '',
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    if (value !== '' && value !== null && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {})
            };

            console.log('Fetching loan types with params:', params);
            const response = await loanTypesAPI.getLoanTypes(params);

            if (response.data && response.data.success) {
                const loanTypesData = response.data.data.loan_types || [];
                const paginationData = response.data.data.pagination || {};

                setLoanTypes(loanTypesData);
                setPagination(paginationData);
            } else {
                setError(response.data?.message || 'Failed to fetch loan types');
            }
        } catch (err) {
            console.error('Error fetching loan types:', err);
            setError(`Failed to fetch loan types: ${err.response?.data?.message || err.message}`);
            setLoanTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await loanTypesAPI.deleteLoanType(id);
            if (response.data.success) {
                setLoanTypes(loanTypes.filter(lt => lt.id !== id));
                setShowDeleteModal(false);
                setLoanTypeToDelete(null);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to delete loan type');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const response = await loanTypesAPI.updateLoanType(id, {
                is_active: !currentStatus
            });

            if (response.data.success) {
                setLoanTypes(loanTypes.map(lt =>
                    lt.id === id ? { ...lt, is_active: !currentStatus } : lt
                ));
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to update loan type status');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const formatPercentage = (rate) => {
        return `${rate}%`;
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'personal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'mortgage': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'vehicle': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            'emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Loan Types Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Configure and manage different loan products and their terms
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/admin/loan-types/add')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add New Loan Type
                        </button>
                    </div>
                </div>
            </div>


            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <p>{error}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={fetchLoanTypes}
                                    className="bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TagIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Total Loan Types
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {pagination.total_records}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Active Types
                                    </dt>
                                    <dd className="text-lg font-medium text-green-600">
                                        {loanTypes.filter(lt => lt.is_active).length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Inactive Types
                                    </dt>
                                    <dd className="text-lg font-medium text-red-600">
                                        {loanTypes.filter(lt => !lt.is_active).length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <EyeIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Client Visible
                                    </dt>
                                    <dd className="text-lg font-medium text-blue-600">
                                        {loanTypes.filter(lt => lt.is_visible_to_clients).length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search loan types..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="">All Categories</option>
                        <option value="personal">Personal</option>
                        <option value="business">Business</option>
                        <option value="mortgage">Mortgage</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="education">Education</option>
                        <option value="emergency">Emergency</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.is_active}
                        onChange={(e) => handleFilterChange('is_active', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {/* Visibility Filter */}
                    <select
                        value={filters.is_visible_to_clients}
                        onChange={(e) => handleFilterChange('is_visible_to_clients', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="">All Visibility</option>
                        <option value="true">Client Visible</option>
                        <option value="false">Internal Only</option>
                    </select>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Showing {loanTypes.length} of {pagination.total_records} loan types
                </div>
            </div>

            {/* Loan Types Table */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Loan Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Interest Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Amount Range
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Term Range
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Visibility
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loanTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <TagIcon className="h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                No loan types found
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                {searchTerm || Object.values(filters).some(f => f)
                                                    ? 'No loan types match your search criteria'
                                                    : 'Get started by creating your first loan type'}
                                            </p>
                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/dashboard/admin/loan-types/add"
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                    <PlusIcon className="w-4 h-4 mr-2" />
                                                    Add Loan Type
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                loanTypes.map((loanType) => (
                                    <tr key={loanType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {loanType.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {loanType.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(loanType.category)}`}>
                                                {loanType.category?.charAt(0).toUpperCase() + loanType.category?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="flex items-center">
                                                <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                                                {formatPercentage(loanType.nominal_interest_rate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <div>{formatCurrency(loanType.min_amount)} - {formatCurrency(loanType.max_amount)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" />
                                                {loanType.min_term} - {loanType.max_term} months
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(loanType.id, loanType.is_active)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${loanType.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                            >
                                                {loanType.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loanType.is_visible_to_clients
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}>
                                                {loanType.is_visible_to_clients ? 'Public' : 'Internal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/admin/loan-types/${loanType.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/dashboard/admin/loan-types/${loanType.id}/edit`)}
                                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setLoanTypeToDelete(loanType);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-lg shadow">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                            disabled={pagination.current_page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
                            disabled={pagination.current_page === pagination.total_pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing{' '}
                                <span className="font-medium">
                                    {((pagination.current_page - 1) * pagination.per_page) + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">{pagination.total_records}</span>{' '}
                                results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                                    disabled={pagination.current_page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, current_page: pageNum }))}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.current_page === pageNum
                                                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
                                    disabled={pagination.current_page === pagination.total_pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && loanTypeToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-4">
                                Delete Loan Type
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete "{loanTypeToDelete.name}"?
                                    This action cannot be undone and may affect existing loans.
                                </p>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setLoanTypeToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(loanTypeToDelete.id)}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanTypesManagement;
