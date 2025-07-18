import {
    Split,
    Contact,
    Scale,
    Banknote,
    List,
    Calendar,
    CreditCard,
    PiggyBank,
    Users,
    DollarSign,
    Receipt,
    TrendingUp,
    Building,
    FileText,
    Calculator,
    LayoutDashboard,
    User,
    StickyNote,
    History,
    Clock,
    Download,
    Boxes,
    Landmark,
    Lock,
    BarChart,
    Search,
    Wallet,
    ClipboardList,
    FileStack,
    Settings,
    Cog,
    Repeat,
    SquareKanban,
    CheckCircle,
    AlertCircle,
    TagIcon,
    HomeIcon
} from 'lucide-react';

const navigationConfig = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: (role) => {
            switch (role) {
                case 'admin':
                    return '/dashboard/admin';
                case 'supervisor':
                    return '/dashboard/supervisor';
                case 'loan-officer':
                    return '/dashboard/loan-officer';
                case 'cashier':
                    return '/dashboard/cashier';
                default:
                    return '/dashboard';
            }
        },
        roles: ['admin', 'supervisor', 'loan-officer', 'cashier']
    },
    {
        id: 'branches',
        title: 'Branches',
        icon: Split,
        path: '/branches',
        roles: ['admin', 'supervisor']
    },
    {
        id: 'users',
        title: 'Users',
        icon: User,
        path: 'admin/users',
        roles: ['admin', 'supervisor']
    },
    // {
    //     id: 'user-details',
    //     title: 'User Details',
    //     icon: User,
    //     path: 'admin/users/:id',
    //     roles: ['admin', 'supervisor']
    // },
    // {
    //     id: 'edit-user',
    //     title: 'Edit User',
    //     icon: User,
    //     path: 'admin/users/:id/edit',
    //     roles: ['admin', 'supervisor']
    // },
    {
        id: 'Loan-types',
        title: 'Loan Types',
        icon: TagIcon,
        path: '/dashboard/admin/loan-types',
        roles: ['admin', 'supervisor']
    },
    {
        id: 'borrowers',
        title: 'Borrowers',
        icon: Contact,
        roles: ['admin', 'supervisor', 'loan-officer'],
        hasDropdown: true,
        children: [
            {
                title: 'All Borrowers',
                path: '/dashboard/admin/borrowers',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'My Assigned Borrowers',
                path: 'loan-officer/borrowers',
                roles: ['loan-officer']
            },
            {
                title: 'Add Borrower',
                path: 'loan-officer/borrowers/add',
                roles: ['loan-officer']
            },
        ]
    },
    {
    id: 'cashier-operations',
    title: 'Cashier Operations',
    icon: Banknote,
    roles: ['cashier'],
    hasDropdown: true,
    children: [
        {
            title: 'Dashboard Overview',
            path: '/dashboard/cashier',
            icon: HomeIcon,
            roles: ['cashier', 'admin', 'supervisor']
        },
        {
            title: 'Transactions',
            path: '/dashboard/cashier/transactions',
            icon: DollarSign,
            roles: ['cashier', 'admin', 'supervisor']
        },
        {
            title: 'Payment Records',
            path: '/dashboard/cashier/payments',
            icon: Receipt,
            roles: ['cashier', 'admin', 'supervisor']
        },
        {
            title: 'Daily Reports',
            path: '/dashboard/cashier/reports',
            icon: FileText,
            roles: ['cashier', 'admin', 'supervisor']
        }
    ]
},

    // {
    //     id: 'cashier-operations',
    //     title: 'Cashier Operations',
    //     icon: Banknote,
    //     roles: ['cashier', 'admin', 'supervisor'],
    //     hasDropdown: true,
    //     children: [
    //         // Dashboard
    //         {
    //             title: 'Dashboard Overview',
    //             path: '/dashboard/cashier',
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Payments & Collections (flattened)
    //         {
    //             title: 'Record Payment',
    //             path: '/dashboard/cashier/record-payment',
    //             icon: DollarSign,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Payment History',
    //             path: '/dashboard/cashier/payment-history',
    //             icon: History,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Due Collections',
    //             path: '/dashboard/cashier/due-collections',
    //             icon: Clock,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Overdue Collections',
    //             path: '/dashboard/cashier/overdue-collections',
    //             icon: AlertCircle,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Payment Receipts',
    //             path: '/dashboard/cashier/payment-receipts',
    //             icon: Receipt,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Bulk Payments',
    //             path: '/dashboard/cashier/bulk-payments',
    //             icon: Boxes,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Cash Management (flattened)
    //         {
    //             title: 'Cash Count',
    //             path: '/dashboard/cashier/cash-count',
    //             icon: Calculator,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Cash Position',
    //             path: '/dashboard/cashier/cash-position',
    //             icon: PiggyBank,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Cash Deposits',
    //             path: '/dashboard/cashier/cash-deposits',
    //             icon: Landmark,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Cash Withdrawals',
    //             path: '/dashboard/cashier/cash-withdrawals',
    //             icon: CreditCard,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Vault Management',
    //             path: '/dashboard/cashier/vault-management',
    //             icon: Lock,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Daily Cash Report',
    //             path: '/dashboard/cashier/daily-cash-report',
    //             icon: FileText,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Loan Disbursements (flattened)
    //         {
    //             title: 'Pending Disbursements',
    //             path: '/dashboard/cashier/pending-disbursements',
    //             icon: SquareKanban,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Process Disbursement',
    //             path: '/dashboard/cashier/process-disbursement',
    //             icon: CheckCircle,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Disbursement History',
    //             path: '/dashboard/cashier/disbursement-history',
    //             icon: History,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Disbursement Reports',
    //             path: '/dashboard/cashier/disbursement-reports',
    //             icon: BarChart,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Reports (flattened)
    //         {
    //             title: 'Daily Collection Report',
    //             path: '/dashboard/cashier/reports/daily-collection',
    //             icon: BarChart,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Cash Flow Report',
    //             path: '/dashboard/cashier/reports/cash-flow',
    //             icon: TrendingUp,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Payment Summary Report',
    //             path: '/dashboard/cashier/reports/payment-summary',
    //             icon: List,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Outstanding Dues Report',
    //             path: '/dashboard/cashier/reports/outstanding-dues',
    //             icon: Clock,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Cashier Performance',
    //             path: '/dashboard/cashier/reports/performance',
    //             icon: User,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Transaction Reports',
    //             path: '/dashboard/cashier/reports/transactions',
    //             icon: Receipt,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Client Services (flattened)
    //         {
    //             title: 'Client Lookup',
    //             path: '/dashboard/cashier/client-lookup',
    //             icon: Search,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Account Balance',
    //             path: '/dashboard/cashier/account-balance',
    //             icon: Wallet,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Payment Schedule',
    //             path: '/dashboard/cashier/payment-schedule',
    //             icon: ClipboardList,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Client Statements',
    //             path: '/dashboard/cashier/client-statements',
    //             icon: FileStack,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },

    //         // Settings & Tools (flattened)
    //         {
    //             title: 'Receipt Settings',
    //             path: '/dashboard/cashier/settings/receipts',
    //             icon: Settings,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Payment Methods',
    //             path: '/dashboard/cashier/settings/payment-methods',
    //             icon: Cog,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Exchange Rates',
    //             path: '/dashboard/cashier/settings/exchange-rates',
    //             icon: Repeat,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Calculator',
    //             path: '/dashboard/cashier/calculator',
    //             icon: Calculator,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         },
    //         {
    //             title: 'Profile Settings',
    //             path: '/dashboard/cashier/settings/profile',
    //             icon: User,
    //             roles: ['cashier', 'admin', 'supervisor']
    //         }
    //     ]
    // },

    {
        id: 'loans',
        title: 'Loans',
        icon: FileText,
        roles: ['admin', 'supervisor', 'loan-officer'],
        hasDropdown: true,
        children: [
            {
                title: 'All Loans',
                path: 'admin/loans',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'My Loans',
                path: 'loan-officer/my-loans',
                roles: ['loan-officer']
            },
            {
                title: 'Add Loans',
                path: 'admin/loans/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Loan',
                path: 'loan-officer/loans/add',
                roles: ['loan-officer']
            },
            {
                title: 'Due Loans',
                path: 'admin/due-loans',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'My Due Loans',
                path: 'loan-officer/due-loans',
                roles: ['loan-officer']
            },
            {
                title: 'Missed Repayments',
                path: 'admin/missed-repayments',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'My Missed Repayments',
                path: 'loan-officer/missed-repayments',
                roles: ['loan-officer']
            },
            {
                title: 'Loans in Arrears',
                path: 'admin/loans-in-arrears',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'My Loans in Arrears',
                path: 'loan-officer/loans-in-arrears',
                roles: ['loan-officer']
            },
            {
                title: 'No Repayments',
                path: 'admin/no-repayment-loans',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Past Maturity Date',
                path: 'admin/past-maturity',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Principal Outstanding',
                path: 'admin/principal-outstanding',
                roles: ['admin', 'supervisor']
            },
            {
                title: '1 Month Late Loans',
                path: 'admin/one-month-late',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Calculator',
                // Use different paths for different roles
                path: 'admin/loan-calculator',
                roles: ['admin', 'supervisor', 'loan-officer']
            },
            {
                title: 'Guarantors',
                path: 'admin/guarantors',
                roles: ['admin', 'supervisor', 'loan-officer']
            },
            {
                title: 'Loan Comments',
                path: 'admin/loan-comments',
                roles: ['admin', 'supervisor', 'loan-officer']
            },
            {
                title: 'Approve Loans',
                path: 'loans/approve',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'repayments',
        title: 'Repayments',
        icon: Banknote,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Repayments',
                path: '/repayments/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Repayments',
                path: '/repayments/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Bulk Repayments Add',
                path: '/repayments/bulk-add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'CSV File Repayments',
                path: '/repayments/csv-file',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Repayments Charts',
                path: '/repayments/charts',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Approve Repayments',
                path: '/repayments/approve',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'collateral-register',
        title: 'Collateral Register',
        icon: List,
        path: '/collateral-register',
        roles: ['admin', 'supervisor']
    },
    {
        id: 'calendar',
        title: 'Calendar',
        icon: Calendar,
        path: '/calendar',
        roles: ['admin', 'supervisor']
    },
    {
        id: 'collection-sheets',
        title: 'Collection Sheets',
        icon: StickyNote,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'Daily Collection Sheet',
                path: '/collection-sheets/daily',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Missed Repayment Sheet',
                path: '/collection-sheets/missed-repayment',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Other Sheet',
                path: '/collection-sheets/other',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Import Collection Sheet',
                path: '/collection-sheets/import',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'savings',
        title: 'Savings',
        icon: PiggyBank,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Savings Account',
                path: '/savings/view-accounts',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Savings Account',
                path: '/savings/add-account',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Savings Charts',
                path: '/savings/charts',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Savings Report',
                path: '/savings/report',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Saving Products Report',
                path: '/savings/products-report',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Saving Fee Report',
                path: '/savings/fee-report',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Cash Safe Management',
                path: '/savings/cash-safe-management',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'savings-transaction',
        title: 'Savings Transaction',
        icon: CreditCard,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Saving Transactions',
                path: '/savings-transaction/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Build Transactions',
                path: '/savings-transaction/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Upload Transactions CSV File',
                path: '/savings-transaction/upload-csv',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Staff Transactions Report',
                path: '/savings-transaction/staff-report',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Approve Transactions',
                path: '/savings-transaction/approve',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'investors',
        title: 'Investors',
        icon: Users,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Investors',
                path: '/investors/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Investors',
                path: '/investors/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'View All Investor Accounts',
                path: '/investors/accounts/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Investor Account',
                path: '/investors/accounts/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'View All Loan Investment',
                path: '/investors/loan-investment/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'View Investor Transactions',
                path: '/investors/transactions/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Approve Loan Investments',
                path: '/investors/loan-investment/approve',
                roles: ['admin']
            }
        ]
    },
    {
        id: 'payroll',
        title: 'Payroll',
        icon: DollarSign,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Payroll',
                path: '/payroll/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Payroll',
                path: '/payroll/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Payroll Report',
                path: '/payroll/report',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'expenses',
        title: 'Expenses',
        icon: Receipt,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Expenses',
                path: '/expenses/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Expenses',
                path: '/expenses/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Upload Expenses CSV File',
                path: '/expenses/upload-csv',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'other-income',
        title: 'Other Income',
        icon: TrendingUp,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Other Income',
                path: '/other-income/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Other Income',
                path: '/other-income/add',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Upload Other Income CSV File',
                path: '/other-income/upload-csv',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'asset-management',
        title: 'Asset Management',
        icon: Building,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'View Asset Management',
                path: '/asset-management/view',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Add Asset Management',
                path: '/asset-management/add',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: FileText,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'Borrowers Report',
                path: '/reports/borrowers',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Report',
                path: '/reports/loan',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Arrears Aging Report',
                path: '/reports/loan-arrears-aging',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Collections Report',
                path: '/reports/collections',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Collector Report (Staff)',
                path: '/reports/collector-staff',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Deferred Income',
                path: '/reports/deferred-income',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Deferred Income Monthly',
                path: '/reports/deferred-income-monthly',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Pro-Rata Collections Monthly',
                path: '/reports/pro-rata-collections-monthly',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Disbursement Report',
                path: '/reports/disbursement',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Fees Report',
                path: '/reports/fees',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Officer Report',
                path: '/reports/loan-officer',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Products Report',
                path: '/reports/loan-products',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'MFRS Ratios',
                path: '/reports/mfrs-ratios',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Daily Report',
                path: '/reports/daily',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Monthly Report',
                path: '/reports/monthly',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Outstanding Report',
                path: '/reports/outstanding',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Portfolio At Risk (PAR)',
                path: '/reports/portfolio-at-risk',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'At a Glance Report',
                path: '/reports/at-a-glance',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'All Entries',
                path: '/reports/all-entries',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'accounting',
        title: 'Accounting',
        icon: Calculator,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'Cash Flow Accumulated',
                path: '/accounting/cash-flow-accumulated',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Cash Flow Monthly',
                path: '/accounting/cash-flow-monthly',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Profit / Loss',
                path: '/accounting/profit-loss',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Balance Sheet',
                path: '/accounting/balance-sheet',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Trial Balance',
                path: '/accounting/trial-balance',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'General Ledger Summary',
                path: '/accounting/general-ledger-summary',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Branch Equity',
                path: '/accounting/branch-equity',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Inter Bank Transfers',
                path: '/accounting/inter-bank-transfers',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Reconcile Entries',
                path: '/accounting/reconcile-entries',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Chart of Accounts',
                path: '/accounting/chart-of-accounts',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Manual Journal',
                path: '/accounting/manual-journal',
                roles: ['admin', 'supervisor']
            }
        ]
    },
    {
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        roles: ['admin', 'supervisor'],
        hasDropdown: true,
        children: [
            {
                title: 'General Settings',
                path: '/settings/general',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Loan Types',
                path: '/admin/loan-types',
                roles: ['admin', 'supervisor']
            },
            {
                title: 'Payment Methods',
                path: '/settings/payment-methods',
                roles: ['admin', 'supervisor']
            }
        ]
    }
];

// Role-based access summary
const roleAccessSummary = {
    admin: {
        description: 'Full access to all features',
        access: 'all'
    },
    supervisor: {
        description: 'Access to all features except some admin-only functions',
        access: 'most'
    },
    'loan-officer': {
        description: 'Limited access - only borrowers and loans assigned to them',
        access: ['dashboard', 'borrowers', 'loans'],
        restrictions: {
            borrowers: 'Only assigned borrowers',
            loans: 'Only assigned loans'
        }
    },
    cashier: {
        description: 'Very limited access - only loan requests',
        access: ['dashboard', 'loans'],
        restrictions: {
            loans: 'Only loan requests for processing'
        }
    }
};

export { navigationConfig, roleAccessSummary };