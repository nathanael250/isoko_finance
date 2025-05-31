import React from 'react';
import { Phone, Mail, Eye, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

const MissedRepaymentsTable = ({
    data,
    selectedColumns,
    formatCurrency,
    getRiskLevelColor,
    onContactClient,
    onRecordPayment,
    onViewDetails,
    onMarkForFollowUp,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysOverdueColor = (days) => {
        if (days <= 30) return 'text-yellow-600 bg-yellow-50';
        if (days <= 90) return 'text-orange-600 bg-orange-50';
        if (days <= 180) return 'text-red-600 bg-red-50';
        return 'text-red-800 bg-red-100';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectedColumns.client_name && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                            )}
                            {selectedColumns.loan_number && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan
                                </th>
                            )}
                            {selectedColumns.principal && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal Due
                                </th>
                            )}
                            {selectedColumns.total_due && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Due
                                </th>
                            )}
                            {selectedColumns.paid && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Paid
                                </th>
                            )}
                            {selectedColumns.past_due && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Outstanding
                                </th>
                            )}
                            {selectedColumns.days_past && (
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Days Overdue
                                </th>
                            )}
                            {selectedColumns.last_payment && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Payment
                                </th>
                            )}
                            {selectedColumns.status && (
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk Level
                                </th>
                            )}
                            {selectedColumns.actions && (
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentData.map((repayment, index) => (
                            <tr key={repayment.schedule_id} className="hover:bg-gray-50">
                                {selectedColumns.client_name && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {repayment.client_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {repayment.client_mobile}
                                            </div>
                                        </div>
                                    </td>
                                )}
                                {selectedColumns.loan_number && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {repayment.loan_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {repayment.loan_account}
                                            </div>
                                        </div>
                                    </td>
                                )}
                                {selectedColumns.principal && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        {formatCurrency(repayment.principal_due)}
                                    </td>
                                )}
                                {selectedColumns.total_due && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        {formatCurrency(repayment.total_due)}
                                    </td>
                                )}
                                {selectedColumns.paid && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        {formatCurrency(repayment.total_paid)}
                                    </td>
                                )}
                                {selectedColumns.past_due && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                                        {formatCurrency(repayment.outstanding_amount)}
                                    </td>
                                )}
                                {selectedColumns.days_past && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDaysOverdueColor(repayment.days_overdue)}`}>
                                            {repayment.days_overdue} days
                                        </span>
                                    </td>
                                )}
                                {selectedColumns.last_payment && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(repayment.last_payment_date)}
                                    </td>
                                )}
                                {selectedColumns.status && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(repayment.risk_level)}`}>
                                            {repayment.risk_level}
                                        </span>
                                    </td>
                                )}
                                {selectedColumns.actions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => onContactClient(repayment)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                title="Contact Client"
                                            >
                                                <Phone className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onRecordPayment(repayment)}
                                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                                title="Record Payment"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onViewDetails(repayment)}
                                                className="text-gray-600 hover:text-gray-900 p-1 rounded"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onMarkForFollowUp(repayment)}
                                                className="text-orange-600 hover:text-orange-900 p-1 rounded"
                                                title="Mark for Follow-up"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">{startIndex + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min(endIndex, data.length)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{data.length}</span>
                            {' '}results
                        </p>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            pageNum === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissedRepaymentsTable;
