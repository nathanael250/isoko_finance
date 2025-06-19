import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ThemeProvider from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages - Lazy loaded for performance
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const SupervisorDashboard = React.lazy(() => import('./pages/supervisor/SupervisorDashboard'));
const LoanOfficerDashboard = React.lazy(() => import('./pages/loan-officer/LoanOfficerDashboard'));
const CashierDashboard = React.lazy(() => import('./pages/cashier/CashierDashboard'));

// Admin Pages
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));
const Reports = React.lazy(() => import('./pages/admin/Reports'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const ViewAllLoans = React.lazy(() => import('./pages/admin/ViewAllLoans'));
const AddLoan = React.lazy(() => import('./pages/admin/AddLoan'));
const LoanDetails = React.lazy(() => import('./pages/admin/LoanDetails'));
const DueLoans = React.lazy(() => import('./pages/admin/DueLoans'));
const MissedRepayments = React.lazy(() => import('./pages/admin/MissedRepayments'));
const LoansInArrears = React.lazy(() => import('./pages/admin/LoansInArrears'));
const NoRepaymentLoans = React.lazy(() => import('./pages/admin/NoRepaymentLoans'));
const PastMaturityDashboard = React.lazy(() => import('./pages/admin/PastMaturityDashboard'));
const PrincipalOutstandingView = React.lazy(() => import('./pages/admin/PrincipalOutstandingView'));

// Supervisor Pages
const TeamOverview = React.lazy(() => import('./pages/supervisor/TeamOverview'));
const PerformanceMetrics = React.lazy(() => import('./pages/supervisor/PerformanceMetrics'));

// Loan Officer Pages
const LoanApplications = React.lazy(() => import('./pages/loan-officer/LoanApplications'));
const ClientManagement = React.lazy(() => import('./pages/loan-officer/ClientManagement'));
const DocumentProcessing = React.lazy(() => import('./pages/loan-officer/DocumentProcessing'));
const LoanOfficerBorrowers = React.lazy(() => import('./pages/loan-officer/LoanOfficerBorrowers'));
const LoanOfficerAddLoan = React.lazy(() => import('./pages/loan-officer/AddLoan'));
const LoanOfficerDueLoans = React.lazy(() => import('./pages/loan-officer/DueLoans'));
const LoanOfficerNoRepaymentLoans = React.lazy(() => import('./pages/loan-officer/NoRepaymentLoans'));
const LoanOfficerLoansInArrears = React.lazy(() => import('./pages/loan-officer/LoansInArrears'));
const LoanOfficerMissedRepayments = React.lazy(() => import('./pages/loan-officer/MissedRepayments'));
const LoanCalculator = React.lazy(() => import('./pages/loan-officer/LoanCalculator'));
const MyLoans = React.lazy(() => import('./pages/loan-officer/MyLoans'));
const ClientLoans = React.lazy(() => import('./pages/loan-officer/ClientLoans'));
const BorrowerLoanDetails = React.lazy(() => import('./pages/loan-officer/BorrowerLoanDetails'));

// Cashier Pages
const Transactions = React.lazy(() => import('./pages/cashier/Transactions'));
const PaymentRecords = React.lazy(() => import('./pages/cashier/PaymentRecords'));
const DailyReports = React.lazy(() => import('./pages/cashier/DailyReports'));

// Shared Pages
const ProfilePage = React.lazy(() => import('./pages/shared/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/shared/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('./pages/shared/UnauthorizedPage'));

// Borrowers Pages
const AllBorrowers = React.lazy(() => import('./pages/borrowers/AllBorrowers'));
const AddBorrower = React.lazy(() => import('./pages/borrowers/AddBorrower'));

// New imports
import ReceiptDisplay from './pages/ReceiptDisplay';

// AppContent component that uses useAuth - NO Router here
function AppContent() {
  const { user, loading, error } = useAuth();

  console.log('=== AppComponent Debug ===');
  console.log('loading', loading);
  console.log('user', user);
  console.log('user role:', user?.role);
  console.log('error', error);
  console.log('=========================');

  if (loading) {
    console.log('Showing loading spinner...');
    return <LoadingSpinner />;
  }

  console.log('Rendering routes...');

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <UserManagement />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/loans"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <ViewAllLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/loans/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <AddLoan />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/loans/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanDetails />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/due-loans"
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <DueLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/missed-repayments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <MissedRepayments />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/loans-in-arrears"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoansInArrears />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/no-repayment-loans"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <NoRepaymentLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/past-maturity"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <PastMaturityDashboard />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/principal-outstanding"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <PrincipalOutstandingView />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <SystemSettings />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Reports />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Analytics />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Supervisor Routes */}
          <Route
            path="supervisor"
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <SupervisorDashboard />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="supervisor/team"
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <TeamOverview />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="supervisor/performance"
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <PerformanceMetrics />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Borrowers Routes */}
          <Route
            path="borrowers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <AllBorrowers />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="borrowers/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor', 'loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <AddBorrower />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Loan Officer Routes */}
          <Route
            path="loan-officer"
            element={
              <ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerDashboard />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/applications"
            element={
              <ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanApplications />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/borrowers"
            element={
              <ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerBorrowers />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/clients"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <ClientManagement />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/clients/:clientId/loans"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <ClientLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/documents"
            element={
              <ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <DocumentProcessing />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/loans/add"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerAddLoan />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/due-loans"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerDueLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
                    <Route
            path="loan-officer/no-repayment-loans"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerNoRepaymentLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/loans-in-arrears"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerLoansInArrears />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/missed-repayments"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanOfficerMissedRepayments />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/calculator"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <LoanCalculator />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/my-loans"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <MyLoans />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="loan-officer/borrower-loans/:borrowerId"
            element={
              <ProtectedRoute allowedRoles={['loan-officer']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <BorrowerLoanDetails />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Cashier Routes */}
          <Route
            path="cashier"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <CashierDashboard />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="cashier/transactions"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Transactions />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="cashier/payments"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <PaymentRecords />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="cashier/reports"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <DailyReports />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="profile"
            element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <ProfilePage />
              </React.Suspense>
            }
          />

          {/* Receipt Route */}
          <Route
            path="receipt/:repaymentId"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin']}>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <ReceiptDisplay />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/unauthorized"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <UnauthorizedPage />
            </React.Suspense>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <NotFoundPage />
            </React.Suspense>
          }
        />
      </Routes>
    </div>
  );
}

// Main App component - Router wraps everything now
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
