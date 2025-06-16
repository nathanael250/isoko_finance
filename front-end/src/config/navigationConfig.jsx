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
  DocumentCheckIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  UserCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentMinusIcon,
  DocumentPlusIcon,
  DocumentXMarkIcon,
} from '@heroicons/react/24/outline';

export const navigationConfig = {
  admin: [
    {
      name: 'Dashboard',
      path: '/dashboard/admin',
      icon: HomeIcon,
    },
    {
      name: 'User Management',
      path: '/dashboard/admin/users',
      icon: UsersIcon,
    },
    {
      name: 'All Loans',
      path: '/dashboard/admin/loans',
      icon: DocumentTextIcon,
    },
    {
      name: 'Add Loan',
      path: '/dashboard/admin/loans/add',
      icon: DocumentPlusIcon,
    },
    {
      name: 'Due Loans',
      path: '/dashboard/admin/due-loans',
      icon: ClockIcon,
    },
    {
      name: 'Missed Repayments',
      path: '/dashboard/admin/missed-repayments',
      icon: ExclamationTriangleIcon,
    },
    {
      name: 'Loans in Arrears',
      path: '/dashboard/admin/loans-in-arrears',
      icon: DocumentXMarkIcon,
    },
    {
      name: 'No Repayment Loans',
      path: '/dashboard/admin/no-repayment-loans',
      icon: DocumentMinusIcon,
    },
    {
      name: 'Past Maturity',
      path: '/dashboard/admin/past-maturity',
      icon: CalendarIcon,
    },
    {
      name: 'Principal Outstanding',
      path: '/dashboard/admin/principal-outstanding',
      icon: BanknotesIcon,
    },
    {
      name: 'Reports',
      path: '/dashboard/admin/reports',
      icon: ChartBarIcon,
    },
    {
      name: 'Settings',
      path: '/dashboard/admin/settings',
      icon: CogIcon,
    },
  ],
  supervisor: [
    {
      name: 'Dashboard',
      path: '/dashboard/supervisor',
      icon: HomeIcon,
    },
    {
      name: 'Team Overview',
      path: '/dashboard/supervisor/team',
      icon: UserGroupIcon,
    },
    {
      name: 'Performance Metrics',
      path: '/dashboard/supervisor/performance',
      icon: ChartBarIcon,
    },
    {
      name: 'Due Loans',
      path: '/dashboard/admin/due-loans',
      icon: ClockIcon,
    },
    {
      name: 'Missed Repayments',
      path: '/dashboard/admin/missed-repayments',
      icon: ExclamationTriangleIcon,
    },
    {
      name: 'Loans in Arrears',
      path: '/dashboard/admin/loans-in-arrears',
      icon: DocumentXMarkIcon,
    },
    {
      name: 'No Repayment Loans',
      path: '/dashboard/admin/no-repayment-loans',
      icon: DocumentMinusIcon,
    },
    {
      name: 'Past Maturity',
      path: '/dashboard/admin/past-maturity',
      icon: CalendarIcon,
    },
    {
      name: 'Principal Outstanding',
      path: '/dashboard/admin/principal-outstanding',
      icon: BanknotesIcon,
    },
  ],
  loan_officer: [
    {
      name: 'Dashboard',
      path: '/dashboard/loan-officer',
      icon: HomeIcon,
    },
    {
      name: 'My Loans',
      path: '/dashboard/loan-officer/my-loans',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Loan Applications',
      path: '/dashboard/loan-officer/applications',
      icon: DocumentTextIcon,
    },
    {
      name: 'Client Management',
      path: '/dashboard/loan-officer/clients',
      icon: UserGroupIcon,
    },
    {
      name: 'Document Processing',
      path: '/dashboard/loan-officer/documents',
      icon: DocumentDuplicateIcon,
    },
    {
      name: 'Loan Calculator',
      path: '/dashboard/loan-officer/calculator',
      icon: CalculatorIcon,
    },
    {
      name: 'Due Loans',
      path: '/dashboard/loan-officer/due-loans',
      icon: ClockIcon,
    },
    {
      name: 'Missed Repayments',
      path: '/dashboard/loan-officer/missed-repayments',
      icon: ExclamationTriangleIcon,
    },
    {
      name: 'Loans in Arrears',
      path: '/dashboard/loan-officer/loans-in-arrears',
      icon: DocumentXMarkIcon,
    },
    {
      name: 'No Repayment Loans',
      path: '/dashboard/loan-officer/no-repayment-loans',
      icon: DocumentMinusIcon,
    },
  ],
  cashier: [
    {
      name: 'Dashboard',
      path: '/dashboard/cashier',
      icon: HomeIcon,
    },
    {
      name: 'Transactions',
      path: '/dashboard/cashier/transactions',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Payment Records',
      path: '/dashboard/cashier/payment-records',
      icon: ReceiptPercentIcon,
    },
    {
      name: 'Daily Reports',
      path: '/dashboard/cashier/daily-reports',
      icon: ChartBarIcon,
    },
    {
      name: 'Payment History',
      path: '/dashboard/cashier/payment-history',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Due Collections',
      path: '/dashboard/cashier/due-collections',
      icon: ClockIcon,
    },
    {
      name: 'Overdue Loans',
      path: '/dashboard/cashier/overdue-loans',
      icon: ExclamationTriangleIcon,
    },
  ],
  shared: [
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: UserCircleIcon,
    },
  ],
};

export const getNavigationForRole = (role) => {
  return navigationConfig[role] || [];
};

export const getAllNavigationItems = () => {
  return Object.values(navigationConfig).flat();
}; 