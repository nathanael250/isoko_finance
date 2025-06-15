import React, { useState, useEffect } from 'react';
import { Calendar, Search, RotateCcw, Download, Eye, Settings, AlertTriangle, Clock } from 'lucide-react';
import { dueLoansAPI } from '../../services/api';

const DueLoans = () => {
    const [dueLoans, setDueLoans] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Updated filter states to match backend expectations
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0], // Today
        endDate: new Date().toISOString().split('T')[0], // Today
        includeZeroDue: false,
        includePenaltyPeriod: false,
        status: '', // Remove 'all' as it might not be expected
        loanOfficerId: '',
        branch: '',
        performanceClass: '',
        search: '',
        sortBy: 'due_date',
        sortOrder: 'ASC',
        page: 1,
        limit: 20
    });
    
    // Table display states remain the same
    const [visibleColumns, setVisibleColumns] = useState({
        view: true,
        name: true,
        loanNumber: true,
        principal: true,
        totalDue: true,
        paid: true,
        pastDue: true,
        amortization: true,
        pendingDue: true,
        nextDue: true,
        lastPayment: true,
        status: true
    });
    
    const [showColumnSettings, setShowColumnSettings] = useState(false);

    useEffect(() => {
        fetchDueLoans();
    }, [filters.page, filters.limit]);

    const fetchDueLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            // Format parameters to match backend expectations
            const params = {
                start_date: filters.startDate,
                end_date: filters.endDate,
                include_zero_due: filters.includeZeroDue,
                include_penalty_period: filters.includePenaltyPeriod,
                ...(filters.status && { status: filters.status }), // Only include if not empty
                ...(filters.loanOfficerId && { loan_officer_id: filters.loanOfficerId }),
                ...(filters.branch && { branch: filters.branch }),
                ...(filters.performanceClass && { performance_class: filters.performanceClass }),
                ...(filters.search && { search: filters.search }),
                sort_by: filters.sortBy,
                sort_order: filters.sortOrder,
                page: filters.page,
                limit: filters.limit
            };

            console.log('Sending params:', params); // Debug log

            const response = await dueLoansAPI.getDueLoans(params);
            
            if (response.data.success) {
                setDueLoans(response.data.data.due_loans || response.data.data || []);
                setSummary(response.data.data.summary || null);
            } else {
                setError(response.data.message || 'Failed to fetch due loans');
            }
        } catch (err) {
            console.error('Error fetching due loans:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(`Validation errors: ${err.response.data.errors.map(e => e.msg).join(', ')}`);
            } else {
                setError('Failed to load due loans. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
    };

    const handleSearch = () => {
        fetchDueLoans();
    };

    const handleReset = () => {
        setFilters({
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            includeZeroDue: false,
            includePenaltyPeriod: false,
            status: '',
            loanOfficerId: '',
            branch: '',
            performanceClass: '',
            search: '',
            sortBy: 'due_date',
            sortOrder: 'ASC',
            page: 1,
            limit: 20
        });
        // Fetch after reset
        setTimeout(() => fetchDueLoans(), 100);
    };

    const handleExport = async () => {
        try {
            const exportParams = {
                start_date: filters.startDate,
                end_date: filters.endDate,
                include_zero_due: filters.includeZeroDue,
                include_penalty_period: filters.includePenaltyPeriod,
                ...(filters.status && { status: filters.status }),
                ...(filters.loanOfficerId && { loan_officer_id: filters.loanOfficerId }),
                ...(filters.branch && { branch: filters.branch }),
                ...(filters.performanceClass && { performance_class: filters.performanceClass }),
                ...(filters.search && { search: filters.search }),
                format: 'csv'
            };
            
            const response = await dueLoansAPI.exportDueLoans(exportParams);
            
            // Create and download file
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `due-loans-${filters.startDate}-to-${filters.endDate}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export data');
        }
    };

    // Rest of your component functions remain the same...
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return 'RWF 0.00';
        return `RWF ${parseFloat(amount).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'partial': 'bg-orange-100 text-orange-800',
            'paid': 'bg-green-100 text-green-800',
            'overdue': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getDueStatusIcon = (loan) => {
        if (loan.due_status === 'Overdue' || loan.days_overdue > 0) {
            return <AlertTriangle className="w-4 h-4 text-red-500" title="Overdue" />;
        } else if (loan.due_status === 'Due Today' || loan.days_until_due === 0) {
            return <Clock className="w-4 h-4 text-orange-500" title="Due Today" />;
        } else if (loan.due_status === 'Due Soon' || (loan.days_until_due > 0 && loan.days_until_due <= 7)) {
            return <Clock className="w-4 h-4 text-yellow-500" title="Due Soon" />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Due Loans</h1>
                    <p className="text-gray-600">
                        Open loans that have due schedule dates between selected dates. 
                        You can use this page to see loans due today.
                    </p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Overdue</p>
                                    <p className="text-lg font-semibold text-gray-900">{summary.overdue?.count || 0}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(summary.overdue?.amount || 0)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Due Today</p>
                                    <p className="text-lg font-semibold text-gray-900">{summary.due_today?.count || 0}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(summary.due_today?.amount || 0)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Due Soon</p>
                                    <p className="text-lg font-semibold text-gray-900">{summary.due_soon?.count || 0}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(summary.due_soon?.amount || 0)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                                    <p className="text-lg font-semibold text-gray-900">{summary.total_schedules || 0}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(summary.total_outstanding || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Range
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                    <span className="self-center text-gray-500">to</span>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="due_today">Due Today</option>
                                    <option value="due_soon">Due Soon</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Client name, loan number..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            {/* Entries per page */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Show entries
                                </label>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={250}>250</option>
                                    <option value={500}>500</option>
                                </select>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Performance Class
                                </label>
                                <select
                                    value={filters.performanceClass}
                                    onChange={(e) => handleFilterChange('performanceClass', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Classes</option>
                                    <option value="performing">Performing</option>
                                    <option value="watch">Watch</option>
                                    <option value="substandard">Substandard</option>
                                    <option value="doubtful">Doubtful</option>
                                    <option value="loss">Loss</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch
                                </label>
                                <input
                                    type="text"
                                    placeholder="Branch name..."
                                    value={filters.branch}
                                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                >
                                    <option value="due_date">Due Date</option>
                                    <option value="client_name">Client Name</option>
                                    <option value="loan_number">Loan Number</option>
                                    <option value="amount_due">Amount Due</option>
                                    <option value="days_overdue">Days Overdue</option>
                                </select>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.includeZeroDue}
                                    onChange={(e) => handleFilterChange('includeZeroDue', e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Include zero due amounts</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.includePenaltyPeriod}
                                    onChange={(e) => handleFilterChange('includePenaltyPeriod', e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Include penalty period</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Search!
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset!
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Show/Hide Columns
                                </button>
                                
                                {/* Column Settings Dropdown */}
                                {showColumnSettings && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                        <div className="p-3">
                                            <h4 className="font-medium text-gray-900 mb-2">Visible Columns</h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {Object.entries(visibleColumns).map(([key, value]) => (
                                                    <label key={key} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={value}
                                                            onChange={(e) => setVisibleColumns(prev => ({
                                                                ...prev,
                                                                [key]: e.target.checked
                                                            }))}
                                                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {visibleColumns.view && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            View
                                        </th>
                                    )}
                                    {visibleColumns.name && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                    )}
                                    {visibleColumns.loanNumber && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan#
                                        </th>
                                    )}
                                    {visibleColumns.principal && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal
                                        </th>
                                    )}
                                    {visibleColumns.totalDue && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Due
                                        </th>
                                    )}
                                    {visibleColumns.paid && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paid
                                        </th>
                                    )}
                                    {visibleColumns.pastDue && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Past Due
                                        </th>
                                    )}
                                    {visibleColumns.amortization && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amortization
                                        </th>
                                    )}
                                    {visibleColumns.pendingDue && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pending Due
                                        </th>
                                    )}
                                    {visibleColumns.nextDue && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Next Due
                                        </th>
                                    )}
                                    {visibleColumns.lastPayment && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Payment
                                        </th>
                                    )}
                                    {visibleColumns.status && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Loading due loans...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-8 text-center text-red-600">
                                            <div className="flex flex-col items-center">
                                                <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                                                <p className="font-medium">Error Loading Data</p>
                                                <p className="text-sm">{error}</p>
                                                <button 
                                                    onClick={fetchDueLoans}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dueLoans.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-lg font-medium">No data found.</p>
                                                <p className="text-sm">No loans found for the selected criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    dueLoans.map((loan, index) => (
                                        <tr key={loan.loan_id || loan.id || index} className="hover:bg-gray-50">
                                            {visibleColumns.view && (
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => window.open(`/dashboard/admin/loans/${loan.loan_id || loan.id}`, '_blank')}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View Loan Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                            {visibleColumns.name && (
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getDueStatusIcon(loan)}
                                                        <div className="ml-2">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                                                                                {loan.client_name || `${loan.client_first_name || ''} ${loan.client_last_name || ''}`.trim()}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {loan.client_number}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.loanNumber && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {loan.loan_number}
                                                </td>
                                            )}
                                            {visibleColumns.principal && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(loan.principal_amount || loan.principal)}
                                                </td>
                                            )}
                                            {visibleColumns.totalDue && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(loan.total_due_amount || loan.total_due)}
                                                </td>
                                            )}
                                            {visibleColumns.paid && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(loan.total_paid)}
                                                </td>
                                            )}
                                            {visibleColumns.pastDue && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`${(loan.overdue_amount || loan.past_due || 0) > 0 ? 'text-red-600 font-medium' : ''}`}>
                                                        {formatCurrency(loan.overdue_amount || loan.past_due)}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.amortization && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(loan.installment_amount)}
                                                </td>
                                            )}
                                            {visibleColumns.pendingDue && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`${(loan.pending_amount || loan.pending_due || 0) > 0 ? 'text-orange-600 font-medium' : ''}`}>
                                                        {formatCurrency(loan.pending_amount || loan.pending_due)}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.nextDue && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(loan.due_date || loan.next_due_date)}
                                                </td>
                                            )}
                                            {visibleColumns.lastPayment && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div>{formatDate(loan.last_payment_date)}</div>
                                                        {loan.last_payment_amount && (
                                                            <div className="text-xs text-gray-500">
                                                                {formatCurrency(loan.last_payment_amount)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.payment_status || loan.status)}`}>
                                                        {(loan.payment_status || loan.status || 'N/A').toUpperCase()}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {dueLoans.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                        disabled={filters.page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('page', filters.page + 1)}
                                        disabled={dueLoans.length < filters.limit}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">
                                                {((filters.page - 1) * filters.limit) + 1}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {Math.min(filters.page * filters.limit, ((filters.page - 1) * filters.limit) + dueLoans.length)}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium">
                                                {summary?.total_schedules || dueLoans.length}
                                            </span>{' '}
                                            entries
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                                disabled={filters.page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                Page {filters.page}
                                            </span>
                                            <button
                                                onClick={() => handleFilterChange('page', filters.page + 1)}
                                                disabled={dueLoans.length < filters.limit}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DueLoans;
