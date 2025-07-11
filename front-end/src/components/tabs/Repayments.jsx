import {React, useState} from 'react'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const Repayments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(20);

    const actionButtons = [
        { label: 'Add Repayment', variant: 'primary' },
        { label: 'Show/Hide Columns', variant: 'secondary' },
        { label: 'Bulk Delete', variant: 'secondary' }
    ];


    const repaymnetColumns = [
        { key: 'CollectionDate', label: 'Collection Date', sortable: false, width: 'w-24' },
        { key: 'CollectedBy', label: 'Collected By', sortable: false, width: 'w-24' },
        { key: 'Method', label: 'Method', sortable: false, width: 'w-24' },
        { key: 'Amount', label: 'Amount', sortable: false, width: 'w-24' },
        { key: 'Action', label: 'Action', sortable: false, width: 'w-24' },
        { key: 'Receipt', label: 'Receipt', sortable: false, width: 'w-28' }
    ];

    
    const RepaymenySortableHeader = ({ column, children }) => (
        <th className={`px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 ${column.width}`}>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900">
                <span>{children}</span>
                {repaymnetColumns.sortable && (
                    <div className="flex flex-col">
                        <ArrowDownWideNarrow className="w-3 h-3 text-gray-400" />
                    </div>
                )}
            </div>
        </th>
    );

    return (
        <div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-200">
                {actionButtons.map((button) => (
                    <button
                        key={button.label}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${button.variant === 'primary'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {button.label}
                    </button>
                ))}

                <div className="ml-auto">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search repayments"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b">
                            {repaymnetColumns.map((column) => (
                                <RepaymenySortableHeader key={column.key} column={column}>
                                    {column.label}
                                </RepaymenySortableHeader>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {/* Empty State Row */}
                        <tr>
                            <td colSpan={repaymnetColumns.length} className="px-6 py-2 text-center text-gray-500 text-xs">
                                No data found. No loans found.
                            </td>
                        </tr>


                        <tr className="text-sm font-medium text-gray-900 bg-gray-300">
                            <td className="px-3 py-1 w-24"></td>
                            <td className="px-3 py-1 w-24"></td>
                            <td className="px-3 py-1 w-24"></td>
                            <td className="px-3 py-1 w-24"></td>
                            <td className="px-3 py-1 text-center w-24">0,00</td>
                            <td className="px-3 py-1 w-32"></td>
                        </tr>



                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Showing 0 to 0 of 0 entries
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Previous
                        </button>
                        <button className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Repayments
