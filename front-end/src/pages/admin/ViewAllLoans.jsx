import { React, useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, ArrowDownWideNarrow, Eye, Pencil, MessageCircle } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { loanService } from '../../services/loanService';
import { Link, useLocation } from 'react-router-dom';
import Modal from 'react-modal';

const ViewAllLoans = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // Backend data states
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const location = useLocation();

    // Parse client_id from query string
    const clientId = (() => {
        const params = new URLSearchParams(location.search);
        return params.get('client_id');
    })();

    // Fetch loans on component mount or when clientId changes
    useEffect(() => {
        fetchLoans();
    }, [clientId]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            let response;
            if (clientId) {
                response = await loanService.getLoansByClient(clientId);
                if (response.success) {
                    setLoans(response.data.loans || []);
                } else {
                    setError('Failed to fetch client loans');
                }
            } else {
                response = await loanService.getAllLoans();
                if (response.success) {
                    setLoans(response.data.loans || []);
                } else {
                    setError('Failed to fetch loans');
                }
            }
        } catch (err) {
            setError('Error fetching loans: ' + err.message);
            console.error('Fetch loans error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter loans based on search term (no need to filter by client_id here anymore)
    const filteredLoans = loans.filter(loan => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            loan.loan_number?.toLowerCase().includes(searchLower) ||
            loan.client_first_name?.toLowerCase().includes(searchLower) ||
            loan.client_last_name?.toLowerCase().includes(searchLower) ||
            loan.client_email?.toLowerCase().includes(searchLower) ||
            loan.loan_type_name?.toLowerCase().includes(searchLower)
        );
    });

    // Pagination
    const indexOfLastLoan = currentPage * entriesPerPage;
    const indexOfFirstLoan = indexOfLastLoan - entriesPerPage;
    const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
    const totalPages = Math.ceil(filteredLoans.length / entriesPerPage);

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-RW').format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    // Get status display
    const getStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'Current';
            case 'pending':
                return 'pending';
            case 'completed':
                return 'Fully Paid';
            case 'defaulted':
                return 'Defaulted';
            default:
                return status || 'Unknown';
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-[#075d8e]';
            case 'pending':
                return 'bg-yellow-600';
            case 'completed':
                return 'bg-green-600';
            case 'defaulted':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    };

    const days = Array.from({ length: 365 }, (_, i) => i + 1);
    const columns = [
        { key: 'view', label: 'View', sortable: false, width: 'w-12' },
        { key: 'Released', label: 'Released', sortable: false, width: 'w-24' },
        { key: 'name', label: 'Name', sortable: true, width: 'auto' },
        { key: 'loan', label: 'Loan#', sortable: true, width: 'w-24' },
        { key: 'principal', label: 'Principal', sortable: true, width: 'w-24' },
        { key: 'InterestRate', label: 'Interest Rate', sortable: true, width: 'w-24' },
        { key: 'TotalDue', label: 'Total Due', sortable: true, width: 'w-24' },
        { key: 'Paid', label: 'Paid', sortable: false, width: 'w-24' },
        { key: 'Balance', label: 'Balance', sortable: false, width: 'w-28' },
        { key: 'LastPayment', label: 'Last Payment', sortable: false, width: 'w-28' },
        { key: 'status', label: 'Status', sortable: false, width: 'w-24' }
    ];

    const AllLoansStatus = [
        { value: 'Processing', label: 'Processing' },
        { value: 'Open', label: 'Open' },
        { value: 'Current', label: 'Current' },
        { value: 'Due Today', label: 'Due Today' },
        { value: 'Missed Repayment', label: 'Missed Repayment' },
        { value: 'Arrears', label: 'Arrears' },
        { value: 'Past Maturity', label: 'Past Maturity' },
        { value: 'Restructed', label: 'Restructed' },
        { value: 'Defaulted', label: 'Defaulted' },
        { value: 'Fully Paid', label: 'Fully Paid' }];

    const AllRepaymentsMethods = [
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Biweekly', label: 'Biweekly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Bimonthly', label: 'Bimonthly' },
        { value: 'Quarterly', label: 'Quarterly' },
        { value: 'Every 4 months', label: 'Every 4 months' },
        { value: 'Semi-Annual', label: 'Semi-Annual' },
        { value: 'Every 4 months', label: 'Every 4 months' },
        { value: 'Yearly', label: 'Yearly' },
        { value: 'Lump Sum', label: 'Lump Sum' }
    ]

    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(!showAdvancedSearch);
    }

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

    // Comment modal open handler
    const handleOpenCommentModal = (loan) => {
        setSelectedLoan(loan);
        setShowCommentModal(true);
    };
    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
        setSelectedLoan(null);
    };

    return (
        <div className='min-h-screen bg-gray-200'>
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">View All Loans</h1>
                </div>
                <div className='space-x-1 text-sm'>
                    <span className='font-semibold'>Advanced Search:</span>
                    <span
                        className='text-blue-500 font-semibold cursor-pointer hover:text-blue-700 transition-colors duration-200 inline-flex items-center gap-1'
                        onClick={toggleAdvancedSearch}
                    >
                        {showAdvancedSearch ? 'Click here to Hide' : 'Click here to Show'}
                    </span>
                </div>

                <AnimatePresence>
                    {showAdvancedSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                exit={{ y: -20 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className='bg-white px-2 py-4 border-t-2 border-green-500'
                            >
                                <form action="" className='text-sm space-y-2'>
                                    <span className='text-xs text-slate-600 pb-2'>All fields are optional. You can type or select as many fields as you like.</span>
                                    <div className='flex justify-between gap-8'>
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllLoansStatus}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Loans Status"
                                        />
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllRepaymentsMethods}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Repayment Methods"
                                        />
                                    </div>
                                    <div className='flex justify-between gap-8'>
                                        <input type="text" className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' placeholder='Borrower Name or Business Name' />
                                        <input type="text" className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' placeholder='Loan #' />
                                    </div>
                                    <div className='flex justify-between gap-8'>
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllLoansStatus}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Loans Status"
                                        />
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllRepaymentsMethods}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Repayment Methods"
                                        />
                                    </div>
                                    <div className='flex justify-between gap-8'>
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllLoansStatus}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Loans Status"
                                        />
                                        <Select
                                            isMulti
                                            name="colors"
                                            options={AllRepaymentsMethods}
                                            className="basic-multi-select flex-1"
                                            classNamePrefix="All Repayment Methods"
                                        />
                                    </div>
                                    <div className='flex justify-between gap-8'>
                                        <div className='flex gap-2 flex-1 justify-between'>
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
                                        </div>
                                        <select name="" id="" className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2'>
                                            <option value="">Select Early Settlement</option>
                                            <option value="">Loans with Early Settlement</option>
                                            <option value="">Loans with No Early Settlement</option>
                                        </select>
                                    </div>
                                    <div className='flex gap-2'>
                                        <div>
                                            <input type="radio" /> <span className='text-sm font-semibold'>Released</span>
                                        </div>
                                        <div>
                                            <input type="radio" /> <span className='text-sm font-semibold'>Released</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <label htmlFor="" className='text-sm font-semibold'>Bank Accounts:</label>
                                        <input type="text" className='flex-1 focus:outline-none border border-slate-300 rounded-sm px-2 py-2' placeholder='Borrower Name or Business Name' />
                                    </div>
                                    <div className='flex justify-between'>
                                        <button className='bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-sm cursor-pointer'>Search!</button>
                                        <button className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-sm cursor-pointer'>Reset!</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                <tr className="border-b font-semibold">
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
                                        <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-xs">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                                Loading loans...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-8 text-center text-red-500 text-xs">
                                            <div className="flex items-center justify-center">
                                                <span className="mr-2">⚠️</span>
                                                {error}
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentLoans.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-2 text-center text-gray-500 text-xs">
                                            No data found. No loans found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentLoans.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-gray-50">
                                            {/* View Actions */}
                                            <td className="px-2 py-1">
                                                <div className="flex items-center">
                                                    <Link to={`/dashboard/admin/loans/${loan.id}`}>
                                                        <Pencil className="w-5 h-5 border border-slate-400 bg-gray-200 p-1 cursor-pointer hover:bg-gray-300 rounded-sm" />
                                                    </Link>
                                                    <MessageCircle
                                                        className="w-5 h-5 border border-slate-400 bg-gray-200 cursor-pointer hover:bg-gray-300 p-1 rounded-sm ml-1"
                                                        onClick={() => handleOpenCommentModal(loan)}
                                                    />
                                                </div>
                                            </td>

                                            {/* Released Date */}
                                            <td className='px-2 py-1 text-xs'>
                                                {formatDate(loan.disbursement_date || loan.application_date)}
                                            </td>

                                            {/* Client Name */}
                                            <td className='px-2 py-1 text-xs font-medium'>
                                                {loan.client_first_name} {loan.client_last_name}
                                            </td>

                                            {/* Loan Number */}
                                            <td className='px-2 py-1 text-xs'>
                                                {loan.loan_number}
                                            </td>

                                            {/* Principal Amount */}
                                            <td className='px-2 py-1 text-xs text-right'>
                                                {formatCurrency(loan.applied_amount)}
                                            </td>

                                            {/* Interest Rate */}
                                            <td className='px-2 py-1 text-xs'>
                                                {loan.interest_rate}%/{loan.repayment_frequency}
                                            </td>

                                            {/* Total Due */}
                                            <td className='px-2 py-1 text-xs text-right'>
                                                {formatCurrency(loan.total_due)}
                                            </td>

                                            {/* Paid Amount */}
                                            <td className='px-2 py-1 text-xs text-right'>
                                                {formatCurrency(loan.total_paid)}
                                            </td>

                                            {/* Balance */}
                                            <td className='px-2 py-1 text-xs text-right font-medium'>
                                                {formatCurrency(loan.balance)}
                                            </td>

                                            {/* Last Payment */}
                                            <td className='px-2 py-1 text-xs'>
                                                {formatDate(loan.last_payment_date)}
                                            </td>

                                            {/* Status */}
                                            <td className='px-2 py-1 text-xs'>
                                                <span className={`text-xs ${getStatusColor(loan.status)} px-2 py-0.5 rounded-sm text-white font-semibold`}>
                                                    {getStatusDisplay(loan.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Summary Row */}
                                {!loading && !error && currentLoans.length > 0 && (
                                    <tr className="text-sm font-medium text-gray-900 bg-gray-300">
                                        <td className="px-3 py-1 w-12"></td>
                                        <td className="px-3 py-1 w-24"></td>
                                        <td className="px-3 py-1"></td>
                                        <td className="px-3 py-1 w-24"></td>
                                        <td className="px-3 py-1 text-center w-24">
                                            {formatCurrency(currentLoans.reduce((sum, loan) => sum + parseFloat(loan.applied_amount || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-24"></td>
                                        <td className="px-3 py-1 text-center w-24">
                                            {formatCurrency(currentLoans.reduce((sum, loan) => sum + parseFloat(loan.total_due || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-24">
                                            {formatCurrency(currentLoans.reduce((sum, loan) => sum + parseFloat(loan.total_paid || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 text-center w-28">
                                            {formatCurrency(currentLoans.reduce((sum, loan) => sum + parseFloat(loan.balance || 0), 0))}
                                        </td>
                                        <td className="px-3 py-1 w-28"></td>
                                        <td className="px-3 py-1 w-24"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-1 bg-white pb-2">
                        <div className="text-xs text-gray-700">
                            Showing {filteredLoans.length > 0 ? indexOfFirstLoan + 1 : 0} to {Math.min(indexOfLastLoan, filteredLoans.length)} of {filteredLoans.length} entries
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 border border-gray-300 text-xs ${currentPage === 1
                                        ? 'text-gray-500 bg-gray-50 cursor-not-allowed'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else {
                                    if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-2 py-1 border border-gray-300 text-xs ${currentPage === pageNum
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-700 bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`px-2 py-1 border border-gray-300 text-xs ${currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-500 bg-gray-50 cursor-not-allowed'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment Modal */}
            {showCommentModal && (
                <CommentModal
                    isOpen={showCommentModal}
                    onRequestClose={handleCloseCommentModal}
                    loan={selectedLoan}
                />
            )}
        </div>
    )
}

export default ViewAllLoans

// CommentModal component
const CommentModal = ({ isOpen, onRequestClose, loan }) => {
    const [comments, setComments]= useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loan) fetchComments();
        // eslint-disable-next-line
    }, [loan]);

    const fetchComments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Replace with your API call to fetch comments for the loan
            const response = await loanService.getLoanComments(loan.id);
            setComments(response.data?.comments?.slice(0, 10) || []);
        } catch (err) {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Replace with your API call to add a comment
            await loanService.addLoanComment(loan.id, { comment: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            setError('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black/40 bg-opacity-40 z-40"
        >
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 p-6 relative">
                <button onClick={onRequestClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                <h2 className="text-lg font-semibold mb-4">Last 10 Comments</h2>
                {loading ? (
                    <div className="text-gray-500 py-4">Loading...</div>
                ) : comments.length === 0 ? (
                    <div className="text-gray-500 py-4">No Comments added.</div>
                ) : (
                    <ul className="mb-4 max-h-40 overflow-y-auto">
                        {comments.map((c, idx) => (
                            <li key={c.id || idx} className="border-b py-2 text-sm">
                                <span className="font-semibold">{c.created_by_name || 'User'}:</span> {c.comment}
                            </li>
                        ))}
                    </ul>
                )}
                <form onSubmit={handleSubmit} className="border-t border-slate-400 pt-4 mt-4">
                    <h3 className="font-bold text-base mb-2">Add Comment</h3>
                    <div className="mb-2 flex items-center">
                        <span className="font-semibold mr-2">By</span>
                        <span>{loan?.client_first_name} {loan?.client_last_name}</span>
                    </div>
                    <div className="mb-2">
                        <label className="font-semibold block mb-1">Comments</label>
                        <textarea
                            className="w-full border border-slate-400 rounded p-2"
                            rows={3}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-between gap-2 mt-2">
                        <button type="button" onClick={onRequestClose} className="px-4 py-2 border border-slate-300 rounded bg-gray-100">Close</button>
                        <button type="submit" className="px-4 py-2 rounded bg-[#00509E] text-white" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                    </div>
                    {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
                </form>
            </div>
        </Modal>
    );
};
