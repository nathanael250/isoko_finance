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
            'personal': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25',
            'business': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25',
            'mortgage': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25',
            'vehicle': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25',
            'education': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25',
            'emergency': 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
        };
        return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <span className="text-gray-600 font-medium">Loading loan types...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 border border-gray-100 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Loan Types Management
                                </h1>
                                <p className="text-gray-600">
                                    Configure and manage different loan products and their terms
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/admin/loan-types/add')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add New Loan Type
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-lg">
                        <div className="flex">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-bold text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={fetchLoanTypes}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Loan Types */}
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                                    <TagIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{pagination.total_records}</p>
                                    <p className="text-sm text-gray-600 font-medium">Total Types</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Types */}
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/30 to-green-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                                    <CheckCircleIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">{loanTypes.filter(lt => lt.is_active).length}</p>
                                    <p className="text-sm text-gray-600 font-medium">Active Types</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inactive Types */}
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100/30 to-red-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25">
                                    <XCircleIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-red-600">{loanTypes.filter(lt => !lt.is_active).length}</p>
                                    <p className="text-sm text-gray-600 font-medium">Inactive Types</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Visible */}
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/30 to-purple-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                                    <EyeIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-600">{loanTypes.filter(lt => lt.is_visible_to_clients).length}</p>
                                    <p className="text-sm text-gray-600 font-medium">Client Visible</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Search and Filters */}
                <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 border border-gray-100">
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
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all duration-200"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
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
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        {/* Visibility Filter */}
                        <select
                            value={filters.is_visible_to_clients}
                            onChange={(e) => handleFilterChange('is_visible_to_clients', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                        >
                            <option value="">All Visibility</option>
                            <option value="true">Client Visible</option>
                            <option value="false">Internal Only</option>
                        </select>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600 font-medium">
                        Showing {loanTypes.length} of {pagination.total_records} loan types
                    </div>
                </div>

                {/* Advanced Loan Types Table */}
                <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Loan Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Interest Rate
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Amount Range
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Term Range
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Visibility
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loanTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <TagIcon className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                    No loan types found
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-6">
                                                    {searchTerm || Object.values(filters).some(f => f)
                                                        ? 'No loan types match your search criteria'
                                                        : 'Get started by creating your first loan type'}
                                                </p>
                                                {user?.role === 'admin' && (
                                                    <Link
                                                        to="/dashboard/admin/loan-types/add"
                                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
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
                                        <tr key={loanType.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mr-3">
                                                        <TagIcon className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {loanType.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-medium">
                                                            {loanType.code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-lg ${getCategoryBadgeColor(loanType.category)}`}>
                                                    {loanType.category?.charAt(0).toUpperCase() + loanType.category?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                                                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="font-bold text-green-700">{formatPercentage(loanType.nominal_interest_rate)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <div className="font-bold text-blue-700">
                                                        {formatCurrency(loanType.min_amount)} - {formatCurrency(loanType.max_amount)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                                                    <CalendarIcon className="h-4 w-4 text-purple-600 mr-2" />
                                                    <span className="font-bold text-purple-700">
                                                        {loanType.min_term} - {loanType.max_term} months
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(loanType.id, loanType.is_active)}
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer transition-all duration-200 shadow-lg ${
                                                        loanType.is_active
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-500/25'
                                                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/25'
                                                    }`}
                                                >
                                                    {loanType.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-lg ${
                                                    loanType.is_visible_to_clients
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
                                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25'
                                                }`}>
                                                    {loanType.is_visible_to_clients ? 'Public' : 'Internal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/admin/loan-types/${loanType.id}`)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    {user?.role === 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/dashboard/admin/loan-types/${loanType.id}/edit`)}
                                                                className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setLoanTypeToDelete(loanType);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
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

                {/* Advanced Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="bg-gradient-to-br from-white to-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 shadow-lg rounded-xl">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                                disabled={pagination.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
                                disabled={pagination.current_page === pagination.total_pages}
                                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 font-medium">
                                    Showing{' '}
                                    <span className="font-bold text-blue-600">
                                        {((pagination.current_page - 1) * pagination.per_page) + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-bold text-blue-600">
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-bold text-blue-600">{pagination.total_records}</span>{' '}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-xl shadow-lg -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                                        disabled={pagination.current_page === 1}
                                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                                                    pagination.current_page === pageNum
                                                        ? 'z-10 bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.total_pages, prev.current_page + 1) }))}
                                        disabled={pagination.current_page === pagination.total_pages}
                                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Delete Confirmation Modal */}
                {showDeleteModal && loanTypeToDelete && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all border border-gray-200">
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-100 to-red-200 mb-4 shadow-lg shadow-red-500/25">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Delete Loan Type
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Are you sure you want to delete{' '}
                                    <span className="font-bold text-gray-900">"{loanTypeToDelete.name}"</span>?
                                    This action cannot be undone and may affect existing loans.
                                </p>
                                <div className="flex space-x-3 justify-center">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setLoanTypeToDelete(null);
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(loanTypeToDelete.id)}
                                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                                    >
                                        Delete Loan Type
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanTypesManagement;
