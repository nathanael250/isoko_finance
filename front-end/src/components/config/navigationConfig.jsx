import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  CalendarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const navigationConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: (role) => `/dashboard/${role}`,
    icon: HomeIcon,
    roles: ['admin', 'supervisor', 'loan_officer', 'cashier'],
  },
  {
    id: 'loans',
    title: 'Loans',
    icon: DocumentTextIcon,
    roles: ['admin', 'supervisor', 'loan_officer', 'cashier'],
    hasDropdown: true,
    children: [
      {
        id: 'all-loans',
        title: 'All Loans',
        path: '/dashboard/admin/loans',
        roles: ['admin'],
      },
      {
        id: 'my-loans',
        title: 'My Loans',
        path: '/dashboard/loan-officer/my-loans',
        roles: ['loan_officer'],
      },
      {
        id: 'add-loan',
        title: 'Add Loan',
        path: '/dashboard/admin/loans/add',
        roles: ['admin'],
      },
      {
        id: 'due-loans',
        title: 'Due Loans',
        path: '/dashboard/admin/due-loans',
        roles: ['admin', 'supervisor', 'loan_officer'],
      },
      {
        id: 'missed-repayments',
        title: 'Missed Repayments',
        path: '/dashboard/admin/missed-repayments',
        roles: ['admin', 'supervisor', 'loan_officer'],
      },
      {
        id: 'loans-in-arrears',
        title: 'Loans in Arrears',
        path: '/dashboard/admin/loans-in-arrears',
        roles: ['admin', 'supervisor', 'loan_officer'],
      },
      {
        id: 'no-repayment-loans',
        title: 'No Repayment Loans',
        path: '/dashboard/admin/no-repayment-loans',
        roles: ['admin', 'supervisor', 'loan_officer'],
      },
      {
        id: 'past-maturity',
        title: 'Past Maturity',
        path: '/dashboard/admin/past-maturity',
        roles: ['admin', 'supervisor'],
      },
      {
        id: 'principal-outstanding',
        title: 'Principal Outstanding',
        path: '/dashboard/admin/principal-outstanding',
        roles: ['admin', 'supervisor'],
      },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: CurrencyDollarIcon,
    roles: ['cashier'],
    hasDropdown: true,
    children: [
      {
        id: 'payment-records',
        title: 'Payment Records',
        path: '/dashboard/cashier/payment-records',
        roles: ['cashier'],
      },
      {
        id: 'daily-reports',
        title: 'Daily Reports',
        path: '/dashboard/cashier/daily-reports',
        roles: ['cashier'],
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        path: '/dashboard/cashier/payment-history',
        roles: ['cashier'],
      },
      {
        id: 'due-collections',
        title: 'Due Collections',
        path: '/dashboard/cashier/due-collections',
        roles: ['cashier'],
      },
      {
        id: 'overdue-loans',
        title: 'Overdue Loans',
        path: '/dashboard/cashier/overdue-loans',
        roles: ['cashier'],
      },
    ],
  },
  {
    id: 'loan-officer-tools',
    title: 'Loan Officer Tools',
    icon: CalculatorIcon,
    roles: ['loan_officer'],
    hasDropdown: true,
    children: [
      {
        id: 'applications',
        title: 'Loan Applications',
        path: '/dashboard/loan-officer/applications',
        roles: ['loan_officer'],
      },
      {
        id: 'clients',
        title: 'Client Management',
        path: '/dashboard/loan-officer/clients',
        roles: ['loan_officer'],
      },
      {
        id: 'documents',
        title: 'Document Processing',
        path: '/dashboard/loan-officer/documents',
        roles: ['loan_officer'],
      },
      {
        id: 'calculator',
        title: 'Loan Calculator',
        path: '/dashboard/loan-officer/calculator',
        roles: ['loan_officer'],
      },
    ],
  },
  {
    id: 'admin-tools',
    title: 'Admin Tools',
    icon: CogIcon,
    roles: ['admin'],
    hasDropdown: true,
    children: [
      {
        id: 'users',
        title: 'User Management',
        path: '/dashboard/admin/users',
        roles: ['admin'],
      },
      {
        id: 'reports',
        title: 'Reports',
        path: '/dashboard/admin/reports',
        roles: ['admin'],
      },
      {
        id: 'settings',
        title: 'Settings',
        path: '/dashboard/admin/settings',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'supervisor-tools',
    title: 'Supervisor Tools',
    icon: UserGroupIcon,
    roles: ['supervisor'],
    hasDropdown: true,
    children: [
      {
        id: 'team',
        title: 'Team Overview',
        path: '/dashboard/supervisor/team',
        roles: ['supervisor'],
      },
      {
        id: 'performance',
        title: 'Performance Metrics',
        path: '/dashboard/supervisor/performance',
        roles: ['supervisor'],
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profile',
    path: '/dashboard/profile',
    icon: UserCircleIcon,
    roles: ['admin', 'supervisor', 'loan_officer', 'cashier'],
  },
];

export const getNavigationForRole = (role) => {
  return navigationConfig.filter(item => item.roles.includes(role));
};

export const getAllNavigationItems = () => {
  return navigationConfig.flat();
}; 