import { React, useState } from 'react'
import { ChevronUp, ChevronDown, ArrowDownWideNarrow, Eye } from 'lucide-react';


const LoanInArrears = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(20);

    const days = Array.from({ length: 365 }, (_, i) => i + 1);
    const columns = [
        { key: 'view', label: 'View', sortable: false, width: 'w-12' },
        { key: 'name', label: 'Name', sortable: true, width: 'w-32' },
        { key: 'loan', label: 'Loan#', sortable: true, width: 'w-24' },
        { key: 'principal', label: 'Principal', sortable: true, width: 'w-24' },
        { key: 'totalDue', label: 'Total Due', sortable: true, width: 'w-24' },
        { key: 'paid', label: 'Paid', sortable: true, width: 'w-24' },
        { key: 'pastDue', label: 'PastDue', sortable: false, width: 'w-24' },
        { key: 'amortization', label: 'Amortization', sortable: false, width: 'w-28' },
        { key: 'pendingDue', label: 'PendingDue', sortable: false, width: 'w-28' },
        { key: 'daysPast', label: 'DaysPast', sortable: false, width: 'w-24' },
        { key: 'lastPayment', label: 'Last Payment', sortable: false, width: 'w-32' },
        { key: 'status', label: 'Status', sortable: false, width: 'w-24' }
    ];

    const SortableHeader = ({ column, children }) => (
        <th className={`px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 ${column.width}`}>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900">
                <span>{children}</span>
                {column.sortable && (
                    <div className="flex flex-col">
                        <ArrowDownWideNarrow className="w-3 h-3 text-gray-400" />
                    </div>
                )}
            </div>
        </th>
    );
    return (
        <div className='min-h-screen bg-gray-200'>
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Loans in Arrears</h1>
                    <p className="text-gray-600 text-sm">
                        Loans that are overdue but have not missed a repayment. Once a loan becomes overdue, it will be marked as <stong>Missed Repayment</stong> status. If a part-payment has been received for last collection date and loan is overdue and not expired, it will be converted into <strong>Pending</strong> status. If the loan is overdue by more than 30 days, it will be converted into <strong>Arrears</strong> status.
                    </p>
                </div>
                {/* <div className=''>
                    <span>Advanced Search</span>

                </div> */}
                <div className='bg-white px-2 py-4 border-t-2 border-green-500'>
                    <form action="" className='text-sm'>
                        <div className='flex flex-col md:flex-row gap-y-2 gap-x-2 items-center justify-between'>
                            <label htmlFor="" className='font-semibold'>Days between today and last installment that was not partly paid:</label>
                            <select name="" id="" className='flex-1 px-2 py-1 focus:outline-none bg-white border border-gray-300 w-full md:m-auto'>
                                {
                                    days.map((day) => (
                                        <option key={day} value={day}>
                                            {day} {day === 1 ? 'day' : 'days'}
                                        </option>
                                    ))
                                }
                            </select>
                            <div className='flex'>
                                <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-sm cursor-pointer'>Search!</button>
                                <button className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-sm cursor-pointer'>Reset!</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className='flex justify-between items-center'>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Export Data</button>
                    <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Show/Hide Columns</button>
                </div>
                <div className='bg-gray-50 border-t-2 border-green-500'>
                    <div className="flex justify-between items-center p-4 ">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Search loans"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-700">Show</label>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
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
                                {/* Empty State Row */}
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-2 text-center text-gray-500 text-xs">
                                        No data found. No loans found.
                                    </td>
                                </tr>

                                {/* Summary Row */}
                                <tr className="text-sm font-medium text-gray-900 bg-gray-300">
                                    <td className="px-3 py-1 w-12"></td>
                                    <td className="px-3 py-1 w-32"></td>
                                    <td className="px-3 py-1 w-24"></td>
                                    <td className="px-3 py-1 text-center w-24">0,00</td>
                                    <td className="px-3 py-1 text-center w-24">0,00</td>
                                    <td className="px-3 py-1 text-center w-24">0,00</td>
                                    <td className="px-3 py-1 text-center w-24">0,00</td>
                                    <td className="px-3 py-1 text-center w-28">0,00</td>
                                    <td className="px-3 py-1 text-center w-28">0,00</td>
                                    <td className="px-3 py-1 w-24"></td>
                                    <td className="px-3 py-1 w-32"></td>
                                    <td className="px-3 py-1 w-24"></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>


                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-1 bg-white pb-2">
                        <div className="text-xs text-gray-700">
                            Showing 0 to 0 of 0 entries
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                                Previous
                            </button>
                            <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </div>








            </div>
        </div >

    )
}

export default LoanInArrears
