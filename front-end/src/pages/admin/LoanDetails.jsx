import { React, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, ArrowDownWideNarrow, Eye } from 'lucide-react';
import Repayments from '../../components/tabs/Repayments';
import LoanTerms from '../../components/tabs/LoanTerms';
import LoanSchedule from '../../components/tabs/LoanSchedule';
import PendingDues from '../../components/tabs/PendingDues';
import PenaltySettings from '../../components/tabs/PenaritySettings';
import LoanCollateral from '../../components/tabs/LoanCollateral';
import Expenses from '../../components/tabs/Expenses';
import OtherIncome from '../../components/tabs/OtherIncome';
import LoanFiles from '../../components/tabs/LoanFiles';
import LoanComments from '../../components/tabs/LaonComments';
import AuditLogs from '../../components/tabs/AuditLogs';
import { loansAPI } from '../../services/api';



const LoanDetails = () => {
    const { id } = useParams();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Repayments');
    // Optionally, for future use:
    // const [comments, setComments] = useState([]);
    // const [client, setClient] = useState(null);

    useEffect(() => {
        fetchLoanDetails();
        // eslint-disable-next-line
    }, [id]);

    const fetchLoanDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await loansAPI.getLoan(id);
            if (response.data.success) {
                const responseData = response.data.data;
                const loanData = responseData.loan;
                setLoan({ ...loanData, documents: responseData.documents || [] });
                console.log("Loan Data:", loanData);
                // setComments(responseData.comments || []);
                // setClient({ ... }); // if you want to use client info separately
            } else {
                setError(response.data.message || 'Failed to fetch loan details');
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Loan not found');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load loan details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate age from date of birth
    const getAge = (date_of_birth) => {
        if (!date_of_birth) return '-';
        const birthDate = new Date(date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 0) return '-';
        return age + ' years';
    };

    // Helper to format numbers with spaces as thousand separators
    const formatNumberWithSpaces = (value) => {
        if (value === null || value === undefined || value === '-') return '-';
        const num = Number(value);
        if (isNaN(num)) return value;
        return num.toLocaleString('en-US').replace(/,/g, ' ');
    };

    const tabs = [
        'Repayments',
        'Loan Terms',
        'Loan Schedule',
        'Pending Dues',
        'Penalty Settings',
        'Loan Collateral',
        'Expenses',
        'Other Income',
        'Loan Files',
        'Loan Comments',
        'Audit Logs'
    ];


    const columns = [
        { key: 'loan', label: 'Loan#', sortable: false, width: 'w-24' },
        { key: 'Released', label: 'Released', sortable: false, width: 'w-24' },
        { key: 'Maturity', label: 'Maturity', sortable: false, width: 'w-24' },
        { key: 'Principal', label: 'Principal', sortable: false, width: 'w-24' },
        { key: 'InterestRate', label: 'Interest Rate	', sortable: false, width: 'w-24' },
        { key: 'Interest', label: 'Interest', sortable: false, width: 'w-28' },
        { key: 'Fees', label: 'Fees', sortable: false, width: 'w-28' },
        { key: 'Penalty', label: 'Penalty', sortable: false, width: 'w-24' },
        { key: 'Due', label: 'Due', sortable: false, width: 'w-32' },
        { key: 'Paid', label: 'Paid	', sortable: false, width: 'w-24' },
        { key: 'Balance', label: 'Balance	', sortable: false, width: 'w-24' },
        { key: 'Status', label: 'Status	', sortable: false, width: 'w-24' }
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
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">View Loan Details</h1>
                </div>
                {/* Loan header info - show loading/error/loan data */}
                <div className='bg-white px-2 py-4 border-t-2 border-green-500'>
                    {loading ? (
                        <div className="text-gray-500">Loading loan details...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : loan ? (
                        <div className='flex justify-between items-center'>
                            <div className='flex flex-col'>
                                <span className='font-semibold'>
                                    {loan.client_first_name} {loan.client_last_name}
                                </span>
                                <span className='text-xs'>{loan.client_number}</span>
                            </div>
                            <div className='flex gap-1'>
                                <button className='px-2 py-2 bg-green-700 hover:bg-green-900 text-white font-bold text-xs rounded-sm cursor-pointer'>Add Loan</button>
                                <button className='px-2 py-2 bg-blue-400 hover:bg-blue-500 text-white font-bold text-xs rounded-sm cursor-pointer'>View All Loans</button>
                            </div>
                            <div>
                                <button className='py-2 px-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-sm cursor-pointer'>Borrower Loans Statements</button>
                            </div>
                        </div>
                    ) : null}
                    <hr className='text-slate-300 my-2' />
                    <div className='flex justify-between items-center text-sm'>
                        {loan && !loading && !error ? (
                            <>
                                <div className='flex flex-col'>
                                    <span>Created Date: {loan.application_date ? new Date(loan.application_date).toLocaleDateString() : '-'}</span>
                                    <span>Business Name: Isoko Finance</span>
                                    <span>Age: {getAge(loan.date_of_birth)}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span>Address: {loan.client_address || '-'}</span>
                                    <span>City: {loan.client_city || '-'}</span>
                                    <span>Province: {loan.client_state || '-'}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span>Phone Number: {loan.client_mobile || '-'}</span>
                                    <span>Email Address: {loan.client_email || '-'}</span>
                                    <span>National ID Card: {loan.client_number || '-'}</span>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>


                <div className='bg-gray-50 border-t-2 border-green-500'>
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
                                {loan ? (
                                    <tr>
                                        <td className="px-3 py-1 text-xs">{loan.loan_number ?? '-'}</td>
                                        <td className="px-3 py-1 text-xs">{loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : (loan.application_date ? new Date(loan.application_date).toLocaleDateString() : '-')}</td>
                                        <td className="px-3 py-1 text-xs">{loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString() : '-'}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.approved_amount !== null && loan.approved_amount !== undefined ? loan.approved_amount : (loan.applied_amount !== null && loan.applied_amount !== undefined ? loan.applied_amount : '-'))}</td>
                                        <td className="px-3 py-1 text-xs">{loan.interest_rate ? `${loan.interest_rate}%/${loan.repayment_frequency}` : '-'}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.interest_balance !== null && loan.interest_balance !== undefined ? loan.interest_balance : '-')}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.total_fees_including_vat !== null && loan.total_fees_including_vat !== undefined ? loan.total_fees_including_vat : (loan.total_fees_before_vat !== null && loan.total_fees_before_vat !== undefined ? loan.total_fees_before_vat : '-'))}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces((parseFloat(loan.arrears_principal ?? 0) + parseFloat(loan.arrears_interest ?? 0)))}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.total_due !== null && loan.total_due !== undefined ? loan.total_due : '-')}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.total_paid !== null && loan.total_paid !== undefined ? loan.total_paid : '-')}</td>
                                        <td className="px-3 py-1 text-xs text-right">{formatNumberWithSpaces(loan.balance !== null && loan.balance !== undefined ? loan.balance : (loan.loan_balance !== null && loan.loan_balance !== undefined ? loan.loan_balance : '-'))}</td>
                                        <td className="px-3 py-1 text-xs">
                                            <span className="px-2 py-0.5 rounded-sm text-white font-semibold bg-gray-600">
                                                {loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-2 text-center text-gray-500 text-xs">
                                            No data found. No loans found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 cursor-pointer text-xs font-medium transition-colors ${activeTab === tab
                                        ? 'bg-gray-800 text-white border-b-2 border-gray-800'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Render only the active tab's component */}
                    <div className="p-4">
                        {activeTab === 'Repayments' && <Repayments />}
                        {activeTab === 'Loan Terms' && <LoanTerms />}
                        {activeTab === 'Loan Schedule' && <LoanSchedule />}
                        {activeTab === 'Pending Dues' && <PendingDues />}
                        {activeTab === 'Penalty Settings' && <PenaltySettings />}
                        {activeTab === 'Loan Collateral' && <LoanCollateral />}
                        {activeTab === 'Expenses' && <Expenses />}
                        {activeTab === 'Other Income' && <OtherIncome />}
                        {activeTab === 'Loan Files' && <LoanFiles />}
                        {activeTab === 'Loan Comments' && <LoanComments />}
                        {activeTab === 'Audit Logs' && <AuditLogs />}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default LoanDetails
