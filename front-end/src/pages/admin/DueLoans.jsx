import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ArrowDownWideNarrow, Eye, Search, Download, Calendar, User, CreditCard } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DueLoans = () => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('due_date');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data states
    const [dueLoans, setDueLoans] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    // Your existing columns
    const columns = [
        { key: 'view', label: 'View', sortable: false, width: 'w-12' },
        { key: 'client_name', label: 'Client', sortable: true, width: 'w-40' },
        { key: 'loan_number', label: 'Loan#', sortable: true, width: 'w-24' },
        { key: 'loan_balance', label: 'Balance', sortable: true, width: 'w-28' },
        { key: 'total_outstanding', label: 'Outstanding', sortable: true, width: 'w-28' },
        { key: 'next_due_date', label: 'Next Due', sortable: true, width: 'w-28' },
        { key: 'next_due_amount', label: 'Due Amount', sortable: true, width: 'w-28' },
        { key: 'overdue_amount', label: 'Overdue', sortable: true, width: 'w-28' },
        { key: 'days_overdue', label: 'Days Past', sortable: true, width: 'w-24' },
        { key: 'due_status', label: 'Status', sortable: false, width: 'w-24' }
    ];

    // Fetch due loans data

// At the top of your component, add this function to get the auth token
const getAuthToken = () => {
    // Check if you're storing the token in localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
    return token;
};

// Update your fetchDueLoans function
const fetchDueLoans = async () => {
    setLoading(true);
    setError(null);
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: entriesPerPage,
            sort_by: sortBy,
            sort_order: sortOrder,
            status: statusFilter
        });

        // Add date range if provided
        if (fromDate && toDate) {
            params.append('start_date', fromDate.toISOString().split('T')[0]);
            params.append('end_date', toDate.toISOString().split('T')[0]);
        }

        // Add search term if provided
        if (searchTerm.trim()) {
            params.append('search', searchTerm.trim());
        }

        const baseURL = process.env.NODE_ENV === 'production' 
            ? 'https://your-backend-url.com' 
            : 'http://localhost:5000';

        const endpoint = fromDate && toDate 
            ? `${baseURL}/api/due-loans/date-range?${params}`
            : `${baseURL}/api/due-loans/today?${params}`;

        console.log('Fetching from:', endpoint);

        // Get the auth token
        const token = getAuthToken();
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header - try both formats
                'Authorization': `Bearer ${token}`,
                // Alternative format if your backend expects this:
                // 'x-auth-token': token,
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (data.success) {
            setDueLoans(data.data.due_loans || []);
            setSummary(data.data.summary || {});
            setPagination(data.data.pagination || {});
        } else {
            throw new Error(data.message || 'Failed to fetch due loans');
        }
    } catch (err) {
        console.error('Error fetching due loans:', err);
        setError(err.message || 'Failed to fetch due loans');
        setDueLoans([]);
        setSummary({});
        setPagination({});
    } finally {
        setLoading(false);
    }
};


    // Initial load and when dependencies change
    useEffect(() => {
        fetchDueLoans();
    }, [currentPage, entriesPerPage, sortBy, sortOrder, statusFilter]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchDueLoans();
    };

    // Handle reset
    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        setSearchTerm('');
        setStatusFilter('all');
        setCurrentPage(1);
        setSortBy('next_due_date');
        setSortOrder('ASC');
        fetchDueLoans();
    };

    // Handle sort
    const handleSort = (columnKey) => {
        if (columns.find(col => col.key === columnKey)?.sortable) {
            if (sortBy === columnKey) {
                setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
            } else {
                setSortBy(columnKey);
                setSortOrder('ASC');
            }
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Overdue':
                return 'bg-red-100 text-red-800';
            case 'Due Today':
                return 'bg-yellow-100 text-yellow-800';
            case 'Due Soon':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const SortableHeader = ({ column, children }) => (
        <th className={`px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 ${column.width}`}>
            <div
                className={`flex items-center space-x-1 ${column.sortable ? 'cursor-pointer hover:text-gray-900' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
            >
                <span>{children}</span>
                {column.sortable && (
                    <div className="flex flex-col">
                        <ArrowDownWideNarrow
                            className={`w-3 h-3 ${sortBy === column.key
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                } ${sortBy === column.key && sortOrder === 'DESC'
                                    ? 'transform rotate-180'
                                    : ''
                                }`}
                        />
                    </div>
                )}
            </div>
        </th>
    );

    return (
        <div className='min-h-screen bg-gray-200'>
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Due Loans</h1>
                    <p className="text-gray-600 text-sm">
                        Loans with upcoming or overdue payment schedules. Each row represents a loan with aggregated schedule information.
                    </p>
                </div>

                {/* Enhanced Summary Cards */}
                {/* {summary && Object.keys(summary).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <CreditCard className="h-8 w-8 text-blue-500" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_outstanding)}</p>
                                    <p className="text-sm text-gray-500">{summary.total_loans} loans</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm">!</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.overdue?.amount)}</p>
                                    <p className="text-sm text-gray-500">{summary.overdue?.loans} loans</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-yellow-500" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-500">Due Today</h3>
                                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.due_today?.amount)}</p>
                                    <p className="text-sm text-gray-500">{summary.due_today?.loans} loans</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">7</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-500">Due Soon</h3>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.due_soon?.amount)}</p>
                                    <p className="text-sm text-gray-500">{summary.due_soon?.loans} loans</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Your existing filters */}
                <div className='bg-white px-4 py-4 border-t-2 border-green-500'>
                    <form onSubmit={handleSearch} className='text-sm'>
                        <div className='flex flex-col gap-y-4'>
                            <label className='font-semibold'>Date Range:</label>
                            <div className='flex items-center gap-4'>
                                <div className='flex-grow'>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date) => setFromDate(date)}
                                        placeholderText='From date'
                                        wrapperClassName='w-full'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>
                                <span className='text-gray-500 font-medium'>To:</span>
                                <div className='flex-grow'>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date) => setToDate(date)}
                                        placeholderText='End date'
                                        wrapperClassName='w-full'
                                        className='w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                                        dateFormat="dd/MM/yyyy"
                                        minDate={fromDate}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className='flex items-center gap-4'>
                                <label className='font-semibold'>Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                                >
                                    <option value="all">All Loans</option>
                                    <option value="overdue">Overdue Only</option>
                                    <option value="due_today">Due Today Only</option>
                                    <option value="due_soon">Due Soon Only</option>
                                </select>
                            </div>

                            <div className='flex justify-between'>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className='bg-purple-500 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-2 px-4 text-sm cursor-pointer rounded'
                                >
                                    {loading ? 'Searching...' : 'Search!'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-sm cursor-pointer rounded'                                >
                                    Reset!
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className='flex justify-between items-center'>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Export Data</button>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Show/Hide Columns</button>
                </div>

                <div className='bg-gray-50 border-t-2 border-green-500'>
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search loans..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                    className="pl-8 pr-3 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-700">Show</label>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(parseInt(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <label className="text-sm text-gray-700">entries</label>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="text-red-800 text-sm">{error}</div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="overflow-x-auto px-4 py-2">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    {columns.map((column) => (
                                        <SortableHeader key={column.key} column={column}>
                                            {column.label}
                                        </SortableHeader>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span>Loading due loans...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dueLoans.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-2 text-center text-gray-500 text-xs">
                                            {error ? 'Error loading data. Please try again.' : 'No data found. No loans found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    dueLoans.map((loan, index) => (
                                        <tr key={loan.loan_id || index} className="hover:bg-gray-50 border-b border-gray-100">
                                            <td className="px-3 py-1 w-12">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                            <td className="px-3 py-1 w-40">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {loan.client_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {loan.client_mobile}
                                                </div>
                                            </td>
                                            <td className="px-3 py-1 w-24 text-xs text-gray-900">
                                                {loan.loan_number}
                                            </td>
                                            <td className="px-3 py-1 w-28 text-xs text-gray-900 text-center">
                                                {formatCurrency(loan.loan_balance)}
                                            </td>
                                            <td className="px-3 py-1 w-28 text-xs text-gray-900 text-center">
                                                {formatCurrency(loan.total_outstanding)}
                                            </td>
                                            <td className="px-3 py-1 w-28 text-xs text-gray-900 text-center">
                                                {formatDate(loan.next_due_date)}
                                            </td>
                                            <td className="px-3 py-1 w-28 text-xs text-gray-900 text-center">
                                                {formatCurrency(loan.next_due_amount)}
                                            </td>
                                            <td className="px-3 py-1 w-28 text-xs text-center">
                                                <span className={`${parseFloat(loan.overdue_amount || 0) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    {parseFloat(loan.overdue_amount || 0) > 0 ? formatCurrency(loan.overdue_amount) : '0.00'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1 w-24 text-xs text-center">
                                                <span className={`${parseFloat(loan.days_overdue || 0) > 0 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                    {loan.days_overdue || 0}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1 w-24">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(loan.due_status)}`}>
                                                    {loan.due_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Summary Row */}
                                {dueLoans.length > 0 && (
                                    <tr className="text-sm font-medium text-gray-900 bg-gray-300">
                                        <td className="px-3 py-1 w-12"></td>
                                        <td className="px-3 py-1 w-40 font-bold">TOTALS</td>
                                        <td className="px-3 py-1 w-24"></td>
                                        <td className="px-3 py-1 text-center w-28">
                                            {formatCurrency(dueLoans.reduce((sum, loan) => sum + parseFloat(loan.loan_balance || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-28">
                                            {formatCurrency(dueLoans.reduce((sum, loan) => sum + parseFloat(loan.total_outstanding || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-28"></td>
                                        <td className="px-3 py-1 text-center w-28">
                                            {formatCurrency(dueLoans.reduce((sum, loan) => sum + parseFloat(loan.next_due_amount || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-28">
                                            {formatCurrency(dueLoans.reduce((sum, loan) => sum + parseFloat(loan.overdue_amount || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 w-24"></td>
                                        <td className="px-3 py-1 w-24"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-1 bg-white pb-2">
                        <div className="text-xs text-gray-700">
                            Showing {dueLoans.length > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0} to{' '}
                            {Math.min(currentPage * entriesPerPage, pagination.total || dueLoans.length)} of{' '}
                            {pagination.total || dueLoans.length} entries
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {pagination.pages > 1 && (
                                <div className="flex space-x-1">
                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                disabled={loading}
                                                className={`px-2 py-1 text-xs border ${currentPage === pageNum
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages || 1))}
                                disabled={currentPage === (pagination.pages || 1) || loading}
                                className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DueLoans;

