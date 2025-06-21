import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clientsAPI } from '../../services/api';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const AllBorrowers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsAPI.getClients();
      
      let borrowersData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          if (response.data.data.clients && Array.isArray(response.data.data.clients)) {
            borrowersData = response.data.data.clients;
          } else if (Array.isArray(response.data.data)) {
            borrowersData = response.data.data;
          }
        } else if (Array.isArray(response.data)) {
          borrowersData = response.data;
        }
      }
      
      setBorrowers(Array.isArray(borrowersData) ? borrowersData : []);
      
    } catch (err) {
      console.error('Error fetching borrowers:', err);
      setError(`Failed to fetch borrowers: ${err.response?.data?.message || err.message}`);
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getBorrowerName = (borrower) => {
    if (borrower.name) return borrower.name;
    if (borrower.first_name || borrower.last_name) {
      return `${borrower.first_name || ''} ${borrower.last_name || ''}`.trim();
    }
    if (borrower.full_name) return borrower.full_name;
    return 'N/A';
  };

  const getBorrowerContact = (borrower) => {
    const email = borrower.email || borrower.email_address || '';
    const phone = borrower.phone_number || borrower.phone || borrower.mobile || borrower.contact_number || '';
    return { email, phone };
  };

  const getBorrowerId = (borrower) => {
    return borrower.client_number || borrower.id || borrower.client_id || 'N/A';
  };

  // Filter borrowers
  const filteredBorrowers = Array.isArray(borrowers) ? borrowers.filter(borrower => {
    const name = getBorrowerName(borrower).toLowerCase();
    const id = getBorrowerId(borrower).toString().toLowerCase();
    const { email } = getBorrowerContact(borrower);
    
    const matchesSearch = 
      name.includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || borrower.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

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
                Borrowers Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track all your borrowers in one place
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/borrowers/add')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Borrower
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
                  onClick={fetchBorrowers}
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
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Borrowers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {borrowers.length}
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
                    Active Borrowers
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    {borrowers.filter(b => (b.status || 'active') === 'active').length}
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
                    Inactive Borrowers
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {borrowers.filter(b => b.status === 'inactive').length}
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
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Showing Results
                  </dt>
                  <dd className="text-lg font-medium text-blue-600">
                    {filteredBorrowers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search borrowers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredBorrowers.length} of {borrowers.length} borrowers
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Loans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBorrowers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No borrowers found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {borrowers.length === 0 
                            ? 'Get started by adding your first borrower.' 
                            : 'Try adjusting your search or filter criteria.'
                          }
                        </p>
                        {borrowers.length === 0 && (
                          <button
                            onClick={() => navigate('/dashboard/borrowers/add')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Add Borrower
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBorrowers.map((borrower) => {
                    const { email, phone } = getBorrowerContact(borrower);
                    return (
                      <tr key={borrower.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                  {getBorrowerName(borrower).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {getBorrowerName(borrower)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {getBorrowerId(borrower)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {email && (
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="truncate max-w-xs">{email}</span>
                              </div>
                            )}
                            {phone && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                                {phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (borrower.status || 'active') === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : (borrower.status || 'active') === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {((borrower.status || 'active').charAt(0).toUpperCase() + (borrower.status || 'active').slice(1))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">
                              {borrower.active_loans_count || borrower.loans_count || 0} Active
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {borrower.total_loans_count || 0} Total
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {borrower.updated_at ? format(new Date(borrower.updated_at), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/dashboard/borrowers/${borrower.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/borrowers/${borrower.id}/edit`)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Edit Borrower"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBorrowers.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No borrowers found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {borrowers.length === 0 
                    ? 'Get started by adding your first borrower.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {borrowers.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/dashboard/borrowers/add')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add First Borrower
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            filteredBorrowers.map((borrower) => {
              const { email, phone } = getBorrowerContact(borrower);
              return (
                <div key={borrower.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-lg font-medium text-indigo-600 dark:text-indigo-300">
                            {getBorrowerName(borrower).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {getBorrowerName(borrower)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {getBorrowerId(borrower)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (borrower.status || 'active') === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : (borrower.status || 'active') === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {((borrower.status || 'active').charAt(0).toUpperCase() + (borrower.status || 'active').slice(1))}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{email}</span>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Loan Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Active Loans</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {borrower.active_loans_count || borrower.loans_count || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Loans</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {borrower.total_loans_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Updated {borrower.updated_at ? format(new Date(borrower.updated_at), 'MMM d, yyyy') : 'N/A'}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/borrowers/${borrower.id}`)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/borrowers/${borrower.id}/edit`)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AllBorrowers;
