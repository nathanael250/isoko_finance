import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

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

// Supervisor Pages
const TeamOverview = React.lazy(() => import('./pages/supervisor/TeamOverview'));
// const LoanApprovals = React.lazy(() => import('./pages/supervisor/LoanApprovals'));
const PerformanceMetrics = React.lazy(() => import('./pages/supervisor/PerformanceMetrics'));

// Loan Officer Pages
const LoanApplications = React.lazy(() => import('./pages/loan-officer/LoanApplications'));
const ClientManagement = React.lazy(() => import('./pages/loan-officer/ClientManagement'));
const DocumentProcessing = React.lazy(() => import('./pages/loan-officer/DocumentProcessing'));

// Cashier Pages
const Transactions = React.lazy(() => import('./pages/cashier/Transactions'));
const PaymentRecords = React.lazy(() => import('./pages/cashier/PaymentRecords'));
const DailyReports = React.lazy(() => import('./pages/cashier/DailyReports'));

// Shared Pages
const ProfilePage = React.lazy(() => import('./pages/shared/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/shared/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('./pages/shared/UnauthorizedPage'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
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
                      <ProtectedRoute allowedRoles={['admin', 'loan-officer', 'supervisor']}>
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
                    path="loan-officer/clients"
                    element={
                      <ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']}>
                        <React.Suspense fallback={<LoadingSpinner />}>
                          <ClientManagement />
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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
