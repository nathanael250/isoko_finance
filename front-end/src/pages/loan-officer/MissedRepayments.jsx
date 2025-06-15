import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    EyeOff,
    RefreshCw,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Phone,
    Mail,
    Calendar,
    DollarSign
} from 'lucide-react';
import MissedRepaymentsTable from '../../components/MissedRepayments/MissedRepaymentsTable';
import MissedRepaymentsSummary from '../../components/MissedRepayments/MissedRepaymentsSummary';
import ContactClientModal from '../../components/MissedRepayments/ContactClientModal';
import api from '../../services/api';

const MissedRepayments = () => {
    const [missedRepayments, setMissedRepayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    // Modal states
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        min_days_overdue: 1,
        max_days_overdue: '',
        loan_officer_id: '',
        branch: '',
        performance_class: '',
        search: '',
        sort_by: 'days_overdue',
        sort_order: 'DESC'
    });

    // UI states
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedColumns, setSelectedColumns] = useState({
        client_name: true,
        loan_number: true,
        principal: true,
        total_due: true,
        paid: true,
        past_due: true,
        days_past: true,
        last_payment: true,
        status: true,
        actions: true
    });

    // Fetch missed repayments
    const fetchMissedRepayments = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };

            console.log('Fetching with params:', params);

            const response = await api.get('/missed-repayments', { params });
            
            console.log('API Response:', response.data);

            if (response.data.success) {
                setMissedRepayments(response.data.data?.missed_repayments || []);
                setSummary(response.data.data?.summary);
            } else {
                throw new Error(response.data.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching missed repayments:', err);
            
            // Handle different types of errors
            if (err.response) {
                // Server responded with error status
                setError(`Server Error: ${err.response.data?.message || err.response.statusText}`);
            } else if (err.request) {
                // Request was made but no response received
                setError('Network Error: Unable to connect to server. Please check if the backend is running.');
            } else {
                // Something else happened
                setError(err.message || 'An unexpected error occurred');
            }
            
            // Set empty data on error
            setMissedRepayments([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissedRepayments();
    }, [currentPage, itemsPerPage]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchMissedRepayments();
    };

    // Reset filters
    const handleReset = () => {
        setFilters({
            start_date: '',
            end_date: '',
            min_days_overdue: 1,
            max_days_overdue: '',
            loan_officer_id: '',
            branch: '',
            performance_class: '',
            search: '',
            sort_by: 'days_overdue',
            sort_order: 'DESC'
        });
        setCurrentPage(1);
        fetchMissedRepayments();
    };

    // Export functionality
    const handleExport = async (format) => {
        try {
            setLoading(true);
            
            const params = {
                format,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };

            const response = await api.get('/missed-repayments/report', { 
                params,
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            if (format === 'csv') {
                // Handle CSV download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `missed-repayments-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Handle JSON download
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `missed-repayments-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Export error:', err);
            setError(`Export failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getRiskLevelColor = (riskLevel) => {
        const colors = {
            'Low Risk': 'bg-yellow-100 text-yellow-800',
            'Medium Risk': 'bg-orange-100 text-orange-800',
            'High Risk': 'bg-red-100 text-red-800',
            'Critical Risk': 'bg-red-200 text-red-900'
        };
        return colors[riskLevel] || 'bg-gray-100 text-gray-800';
    };

    // Action handlers
    const handleContactClient = (repayment) => {
        setSelectedClient(repayment);
        setShowContactModal(true);
    };

    const handleContactSubmit = async (contactData) => {
        try {
            const response = await api.post(`/missed-repayments/${selectedClient.schedule_id}/follow-up`, {
                action_type: contactData.method,
                notes: contactData.notes,
                priority: contactData.priority,
                scheduled_date: contactData.scheduled_date || null
            });

            if (response.data.success) {
                // Show success message
                alert('Follow-up scheduled successfully!');
                // Refresh data
                fetchMissedRepayments();
            }
        } catch (err) {
            console.error('Error scheduling follow-up:', err);
            setError(`Failed to schedule follow-up: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleRecordPayment = (repayment) => {
        // Implement record payment functionality
        console.log('Record payment for:', repayment);
        // You could open a payment modal or redirect to payment page
    };

    const handleViewDetails = (repayment) => {
        // Implement view details functionality
        console.log('View details for:', repayment);
        // You could open a details modal or redirect to loan details page
    };

    const handleMarkForFollowUp = async (repayment) => {
        try {
            const response = await api.post(`/missed-repayments/${repayment.schedule_id}/follow-up`, {
                action_type: 'phone_call',
                notes: 'Marked for follow-up from missed repayments list',
                priority: repayment.days_overdue > 90 ? 'high' : 'medium'
            });

            if (response.data.success) {
                // Refresh the data
                fetchMissedRepayments();
                // Show success message
                alert('Successfully marked for follow-up');
            }
        } catch (err) {
            console.error('Error marking for follow-up:', err);
            setError(`Failed to mark for follow-up: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Missed Repayments</h1>
                    <p className="mt-2 text-gray-600">
                        Track and manage overdue loan repayments across your portfolio
                    </p>
                </div>

                {/* Summary Cards */}
                <MissedRepaymentsSummary summary={summary} formatCurrency={formatCurrency} />

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    {/* Basic Search */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by client name, loan number, or mobile..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                Search
                            </button>

                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Reset
                            </button>

                            <button
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                Advanced
                                {showAdvancedSearch ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Advanced Search */}
                    {showAdvancedSearch && (
                        <div className="border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={filters.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Days Overdue Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Days Overdue</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={filters.min_days_overdue}
                                        onChange={(e) => handleFilterChange('min_days_overdue', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Overdue</label>
                                    <input
                                        type="number"
                                        value={filters.max_days_overdue}
                                                                                onChange={(e) => handleFilterChange('max_days_overdue', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Branch Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                    <select
                                        value={filters.branch}
                                        onChange={(e) => handleFilterChange('branch', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Branches</option>
                                        <option value="Main Branch">Main Branch</option>
                                        <option value="Downtown">Downtown</option>
                                        <option value="Uptown">Uptown</option>
                                        <option value="Suburb">Suburb</option>
                                    </select>
                                </div>

                                {/* Performance Class Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Performance Class</label>
                                    <select
                                        value={filters.performance_class}
                                        onChange={(e) => handleFilterChange('performance_class', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Classes</option>
                                        <option value="performing">Performing</option>
                                        <option value="watch">Watch</option>
                                        <option value="substandard">Substandard</option>
                                        <option value="doubtful">Doubtful</option>
                                        <option value="loss">Loss</option>
                                    </select>
                                </div>

                                {/* Sort Options */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={filters.sort_by}
                                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="days_overdue">Days Overdue</option>
                                        <option value="outstanding_amount">Outstanding Amount</option>
                                        <option value="client_name">Client Name</option>
                                        <option value="loan_number">Loan Number</option>
                                        <option value="last_payment_date">Last Payment Date</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <select
                                        value={filters.sort_order}
                                        onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="DESC">Descending</option>
                                        <option value="ASC">Ascending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => fetchMissedRepayments()}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowColumnSelector(!showColumnSelector)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {showColumnSelector ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                Columns
                            </button>

                            {showColumnSelector && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Show/Hide Columns</h4>
                                    <div className="space-y-2">
                                        {Object.entries(selectedColumns).map(([key, value]) => (
                                            <label key={key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => setSelectedColumns(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">
                                                    {key.replace('_', ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('export-menu').classList.toggle('hidden')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            <div id="export-menu" className="hidden absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => handleExport('json')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    Export as JSON
                                </button>
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    Export as CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading missed repayments...</p>
                    </div>
                )}

                {/* Data Table */}
                {!loading && !error && (
                    <MissedRepaymentsTable
                        data={missedRepayments}
                        selectedColumns={selectedColumns}
                        formatCurrency={formatCurrency}
                        getRiskLevelColor={getRiskLevelColor}
                        onContactClient={handleContactClient}
                        onRecordPayment={handleRecordPayment}
                        onViewDetails={handleViewDetails}
                        onMarkForFollowUp={handleMarkForFollowUp}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                )}

                {/* Empty State */}
                {!loading && !error && missedRepayments.length === 0 && (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No missed repayments found</h3>
                        <p className="text-gray-600">
                            {Object.values(filters).some(v => v !== '' && v !== 1) 
                                ? 'Try adjusting your search criteria or filters.'
                                : 'Great! No missed repayments at the moment.'
                            }
                        </p>
                    </div>
                )}

                {/* Contact Client Modal */}
                {showContactModal && selectedClient && (
                    <ContactClientModal
                        client={selectedClient}
                        onClose={() => {
                            setShowContactModal(false);
                            setSelectedClient(null);
                        }}
                        onSubmit={handleContactSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default MissedRepayments;
