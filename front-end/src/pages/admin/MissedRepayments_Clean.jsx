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

            const response = await api.get('/missed-repayments', { params });
            
            if (response.data.success) {
                setMissedRepayments(response.data.data?.missed_repayments || []);
                setSummary(response.data.data?.summary);
            } else {
                throw new Error(response.data.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching missed repayments:', err);
            
            if (err.response) {
                setError(`Server Error: ${err.response.data?.message || err.response.statusText}`);
            } else if (err.request) {
                setError('Network Error: Unable to connect to server. Please check if the backend is running.');
            } else {
                setError(err.message || 'An unexpected error occurred');
            }
            
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
                alert('Follow-up scheduled successfully!');
                fetchMissedRepayments();
            }
        } catch (err) {
            console.error('Error scheduling follow-up:', err);
            setError(`Failed to schedule follow-up: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleViewDetails = (repayment) => {
        console.log('View details for:', repayment);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Missed Repayments</h1>
                    <p className="text-gray-600 text-sm">
                        Loans that are overdue and have not received any payment for the last collection date. If you enter a part-payment for the last collection date for a loan, it will be marked as <strong>Arrears</strong> status instead.
                    </p>
                </div>

                {/* Advanced Search Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-700">Advanced Search:</span>
                        <button
                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {showAdvancedSearch ? 'Hide' : 'Click here to Show'}
                        </button>
                    </div>

                    {showAdvancedSearch && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Days between today and last installment that was not partly paid
                                    </label>
                                    <select
                                        value={filters.min_days_overdue}
                                        onChange={(e) => handleFilterChange('min_days_overdue', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={1}>1 day</option>
                                        <option value={7}>7 days</option>
                                        <option value={14}>14 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={60}>60 days</option>
                                        <option value={90}>90 days</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                    >
                                        Search!
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                    >
                                        Reset!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Export Data Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Export Data</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowColumnSelector(!showColumnSelector)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Show/Hide Columns
                            </button>
                            
                            {/* Column Selector */}
                            {showColumnSelector && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <div className="p-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Select Columns</h4>
                                        <div className="space-y-2">
                                            {Object.entries(selectedColumns).map(([key, selected]) => (
                                                <label key={key} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={(e) => setSelectedColumns(prev => ({
                                                            ...prev,
                                                            [key]: e.target.checked
                                                        }))}
                                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 capitalize">
                                                        {key.replace(/_/g, ' ')}
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

                {/* Search Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-sm">
                            <input
                                type="text"
                                placeholder="Search loans"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-700">entries</span>
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
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {selectedColumns.actions && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            View
                                        </th>
                                    )}
                                    {selectedColumns.client_name && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Name
                                        </th>
                                    )}
                                    {selectedColumns.loan_number && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Loan#
                                        </th>
                                    )}
                                    {selectedColumns.principal && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Principal
                                        </th>
                                    )}
                                    {selectedColumns.total_due && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Total Due
                                        </th>
                                    )}
                                    {selectedColumns.paid && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Paid
                                        </th>
                                    )}
                                    {selectedColumns.past_due && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            PastDue
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        Amortization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        PendingDue
                                    </th>
                                    {selectedColumns.days_past && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            DaysPast
                                        </th>
                                    )}
                                    {selectedColumns.last_payment && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Last Payment
                                        </th>
                                    )}
                                    {selectedColumns.status && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            Status
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {missedRepayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                            No data found. No loans found.
                                        </td>
                                    </tr>
                                ) : (
                                    missedRepayments.map((repayment, index) => (
                                        <tr key={repayment.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {selectedColumns.actions && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleViewDetails(repayment)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                            {selectedColumns.client_name && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {repayment.client_name || 'N/A'}
                                                </td>
                                            )}
                                            {selectedColumns.loan_number && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {repayment.loan_number || 'N/A'}
                                                </td>
                                            )}
                                            {selectedColumns.principal && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(repayment.principal)}
                                                </td>
                                            )}
                                            {selectedColumns.total_due && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(repayment.total_due)}
                                                </td>
                                            )}
                                            {selectedColumns.paid && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(repayment.paid)}
                                                </td>
                                            )}
                                            {selectedColumns.past_due && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(repayment.past_due)}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(repayment.amortization)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(repayment.pending_due)}
                                            </td>
                                            {selectedColumns.days_past && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {repayment.days_past || 0}
                                                </td>
                                            )}
                                            {selectedColumns.last_payment && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {repayment.last_payment || 'N/A'}
                                                </td>
                                            )}
                                            {selectedColumns.status && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(repayment.status)}`}>
                                                        {repayment.status || 'N/A'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            
                            {/* Totals Row */}
                            {missedRepayments.length > 0 && (
                                <tfoot className="bg-gray-200">
                                    <tr>
                                        {selectedColumns.actions && <td className="px-6 py-3"></td>}
                                        {selectedColumns.client_name && <td className="px-6 py-3"></td>}
                                        {selectedColumns.loan_number && <td className="px-6 py-3"></td>}
                                        {selectedColumns.principal && (
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                0,00
                                            </td>
                                        )}
                                        {selectedColumns.total_due && (
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                0,00
                                            </td>
                                        )}
                                        {selectedColumns.paid && (
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                0,00
                                            </td>
                                        )}
                                        {selectedColumns.past_due && (
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                0,00
                                            </td>
                                        )}
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            0,00
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            0,00
                                        </td>
                                        {selectedColumns.days_past && <td className="px-6 py-3"></td>}
                                        {selectedColumns.last_payment && <td className="px-6 py-3"></td>}
                                        {selectedColumns.status && <td className="px-6 py-3"></td>}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        
                        {/* Summary Row */}
                        <div className="bg-gray-100 px-6 py-3 border-t">
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span>
                                    Showing {missedRepayments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, missedRepayments.length)} of {missedRepayments.length} entries
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={currentPage * itemsPerPage >= missedRepayments.length}
                                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                {showContactModal && (
                    <ContactClientModal
                        isOpen={showContactModal}
                        onClose={() => setShowContactModal(false)}
                        client={selectedClient}
                        onSubmit={handleContactSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default MissedRepayments;