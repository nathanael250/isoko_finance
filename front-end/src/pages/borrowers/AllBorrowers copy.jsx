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
  XCircleIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon
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
      <div className="min-h-screen bg-gray-200">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
              <span className="text-gray-600 font-medium">Loading borrowers...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Advanced Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Borrowers Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage and track all your borrowers in one centralized location
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/borrowers/add')}
                className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
              >
                <PlusIcon className="w-5 h-5" />
                Add New Borrower
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">Error Loading Borrowers</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchBorrowers}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-lg hover:shadow-red-500/25"
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
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-blue-200/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Total Borrowers</p>
                  <p className="text-3xl font-bold text-gray-900">{borrowers.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{width: '100%'}}></div>
                </div>
                <span className="text-xs font-medium text-blue-600">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/30 to-green-200/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Active Borrowers</p>
                  <p className="text-3xl font-bold text-green-600">
                    {borrowers.filter(b => (b.status || 'active') === 'active').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full" 
                    style={{width: `${borrowers.length > 0 ? (borrowers.filter(b => (b.status || 'active') === 'active').length / borrowers.length) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-xs font-medium text-green-600">
                  {borrowers.length > 0 ? Math.round((borrowers.filter(b => (b.status || 'active') === 'active').length / borrowers.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100/30 to-red-200/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25">
                  <XCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Inactive Borrowers</p>
                  <p className="text-3xl font-bold text-red-600">
                    {borrowers.filter(b => b.status === 'inactive').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div 
                    className="h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full" 
                    style={{width: `${borrowers.length > 0 ? (borrowers.filter(b => b.status === 'inactive').length / borrowers.length) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-xs font-medium text-red-600">
                  {borrowers.length > 0 ? Math.round((borrowers.filter(b => b.status === 'inactive').length / borrowers.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/30 to-purple-200/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {borrowers.filter(b => {
                      const createdDate = new Date(b.created_at || b.createdAt);
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
                    }).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{width: '75%'}}></div>
                </div>
                <span className="text-xs font-medium text-purple-600">New</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters & Search */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/20 to-blue-100/20 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredBorrowers.length}</span> of{' '}
            <span className="font-bold text-gray-900">{borrowers.length}</span> borrowers
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Borrowers Content */}
        {filteredBorrowers.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl inline-block mb-6">
                <UsersIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No borrowers found' : 'No borrowers yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first borrower to the system.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/dashboard/borrowers/add')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add First Borrower
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBorrowers.map((borrower, index) => {
                    const name = getBorrowerName(borrower);
                    const { email, phone } = getBorrowerContact(borrower);
                    const borrowerId = getBorrowerId(borrower);
                    const status = borrower.status || 'active';

                    return (
                      <tr key={borrower.id || index} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                              <span className="text-white font-bold text-sm">
                                {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{name}</div>
                              <div className="text-sm text-gray-500">ID: {borrowerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                {email}
                              </div>
                            )}
                            {phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                {phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {borrower.national_id || borrower.id_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {borrower.created_at || borrower.createdAt
                            ? format(new Date(borrower.created_at || borrower.createdAt), 'MMM dd, yyyy')
                            : 'N/A'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/borrowers/${borrower.id || borrower.client_id}`)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/borrowers/${borrower.id || borrower.client_id}/edit`)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Edit Borrower"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBorrowers.map((borrower, index) => {
              const name = getBorrowerName(borrower);
              const { email, phone } = getBorrowerContact(borrower);
              const borrowerId = getBorrowerId(borrower);
              const status = borrower.status || 'active';

              return (
                <div
                  key={borrower.id || index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/20 to-indigo-200/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <span className="text-white font-bold text-sm">
                          {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>

                    {/* Borrower Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
                      <p className="text-sm text-gray-500">ID: {borrowerId}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-6">
                      {email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="p-1 bg-blue-100 rounded">
                            <EnvelopeIcon className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="truncate">{email}</span>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="p-1 bg-green-100 rounded">
                            <PhoneIcon className="h-3 w-3 text-green-600" />
                          </div>
                          <span>{phone}</span>
                        </div>
                      )}
                      {(borrower.created_at || borrower.createdAt) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="p-1 bg-purple-100 rounded">
                            <CalendarIcon className="h-3 w-3 text-purple-600" />
                          </div>
                          <span>
                            Joined {format(new Date(borrower.created_at || borrower.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/borrowers/${borrower.id || borrower.client_id}`)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/borrowers/${borrower.id || borrower.client_id}/edit`)}
                        className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 flex items-center justify-center"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions Panel */}
        {/* <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Manage borrowers efficiently</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/dashboard/borrowers/add')}
                className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg group-hover:bg-indigo-600 transition-colors duration-200">
                    <PlusIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-indigo-900">Add Borrower</p>
                    <p className="text-sm text-indigo-600">Create new profile</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/dashboard/loans')}
                className="p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors duration-200">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-900">View Loans</p>
                    <p className="text-sm text-green-600">Manage loan portfolio</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/dashboard/reports')}
                className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors duration-200">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-purple-900">Reports</p>
                    <p className="text-sm text-purple-600">Generate insights</p>
                  </div>
                </div>
              </button>

              <button
                onClick={fetchBorrowers}
                className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors duration-200">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-orange-900">Refresh</p>
                    <p className="text-sm text-orange-600">Update data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div> */}

        {/* Export & Bulk Actions */}
        {filteredBorrowers.length > 0 && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/30 to-gray-200/30 rounded-full -translate-y-12 translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bulk Actions</h3>
                  <p className="text-gray-600">Export data or perform bulk operations</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H10" />
                    </svg>
                    Print List
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

export default AllBorrowers;
