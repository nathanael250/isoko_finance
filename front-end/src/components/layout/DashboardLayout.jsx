import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import {
    AlignJustify,
    Split,
    Contact,
    Scale,
    Banknote,
    List,
    Calendar,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { User } from 'lucide-react';
import { StickyNote } from 'lucide-react';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loansDropdownOpen, setLoansDropdownOpen] = useState(false);

    const toggleLoansDropdown = () => {
        setLoansDropdownOpen(!loansDropdownOpen);
    };

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <div className="flex h-screen overflow-hidden">
                <aside className="absolute left-0 top-0 z-9999 flex h-screen w-50 flex-col overflow-y-hidden bg-[#222D32] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0">
                    <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                        <h1 className='text-white font-semibold text-2xl'>ISOKO INV.</h1>
                        <button className="block lg:hidden">
                            <svg
                                className="fill-current"
                                width="20"
                                height="18"
                                viewBox="0 0 20 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                                    fill=""
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="no-scrollbar flex flex-col overflow-y-auto text-sm duration-300 ease-linear">
                        <nav className="mt-5 py-4 px-2 lg:mt-9 lg:px-4">
                            <div>
                                <ul>
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <LayoutDashboard className='w-5 h-5 text-white' />
                                            Dashboard
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/branches"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <Split className='w-5 h-5 text-white' />
                                            Branches
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/users"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <User className='w-5 h-5 text-white' />
                                            Users
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/borrowers"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <Contact className='w-5 h-5 text-white' />
                                            Borrowers
                                        </Link>
                                    </li>
                                </ul>
                                
                                {/* Loans with Dropdown */}
                                <ul>
                                    <li>
                                        <div>
                                            <button
                                                onClick={toggleLoansDropdown}
                                                className="group text-white relative flex items-center justify-between w-full gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                                <div className="flex items-center gap-2.5">
                                                    <Scale className='w-5 h-5 text-white' />
                                                    Loans
                                                </div>
                                                {loansDropdownOpen ? (
                                                    <ChevronDown className='w-4 h-4 text-white' />
                                                ) : (
                                                    <ChevronRight className='w-4 h-4 text-white' />
                                                )}
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {loansDropdownOpen && (
                                                <ul className="mt-2 ml-4 space-y-1">
                                                    <li>
                                                        <Link
                                                            to="admin/loans"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            View All Loans
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/loans/add"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Add Loans
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/due-loans"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Due Loans
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/missed-repayments"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Missed Repayments
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/loans-in-arrears"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Loans in Arrears
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/no-repayment-loans"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            No Repayments
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="admin/past-maturity"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Past Maturity Date
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/principal-outstanding"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Principal Outstanding
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/one-month-late"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            1 Month Late Loans
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/calculator"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Loans Calculator
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/guarantors"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Guarantors
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/comments"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Loans Comments
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/loans/approve"
                                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                                            Approve Loans
                                                        </Link>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                </ul>

                                <ul>
                                    <li>
                                        <Link
                                            to="/repayment"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <Banknote className='w-5 h-5 text-white' />
                                            Repayment
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/collateral-register"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4">
                                            <List className='w-5 h-5 text-white' />
                                            Collateral Register
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/calendar"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <Calendar className='w-5 h-5 text-white' />
                                            Calendar
                                        </Link>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <Link
                                            to="/collection-sheets"
                                            className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4">
                                            <StickyNote className='w-5 h-5 text-white' />
                                            Collection Sheets
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </aside>
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <header className="sticky top-0 z-999 flex w-full bg-[#00509E] drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
                        <div className="flex flex-grow items-center justify-between py-2 px-4 shadow-2 md:px-6 2xl:px-11">
                            <AlignJustify className='text-white w-8 h-8 cursor-pointer' />
                            <div className='flex flex-col justify-center items-center gap'>
                                <CircleUserRound className='w-5 h-5 text-white' />
                                <span className='text-white'>MUHIRE Jean</span>
                            </div>
                        </div>
                    </header>
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-2 md:p-6 2xl:p-2">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
