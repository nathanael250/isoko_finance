import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SupervisorDashboard = lazy(() => import('./pages/supervisor/SupervisorDashboard'));
const LoanOfficerDashboard = lazy(() => import('./pages/loan-officer/LoanOfficerDashboard'));
const CashierDashboard = lazy(() => import('./pages/cashier/CashierDashboard'));

// Admin Pages
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const ViewAllLoans = lazy(() => import('./pages/admin/ViewAllLoans'));
const AddLoan = lazy(() => import('./pages/admin/AddLoan'));
const LoanDetails = lazy(() => import('./pages/admin/LoanDetails'));
const DueLoans = lazy(() => import('./pages/admin/DueLoans'));
const MissedRepayments = lazy(() => import('./pages/admin/MissedRepayments'));
const LoansInArrears = lazy(() => import('./pages/admin/LoansInArrears'));
const NoRepaymentLoans = lazy(() => import('./pages/admin/NoRepaymentLoans'));
const PastMaturityDashboard = lazy(() => import('./pages/admin/PastMaturityDashboard'));
const PrincipalOutstandingView = lazy(() => import('./pages/admin/PrincipalOutstandingView'));

// Supervisor Pages
const PerformanceMetrics = lazy(() => import('./pages/supervisor/PerformanceMetrics'));

// Loan Officer Pages
const LoanApplications = lazy(() => import('./pages/loan-officer/LoanApplications'));
const ClientManagement = lazy(() => import('./pages/loan-officer/ClientManagement'));
const DocumentProcessing = lazy(() => import('./pages/loan-officer/DocumentProcessing'));
const LoanOfficerBorrowers = lazy(() => import('./pages/loan-officer/LoanOfficerBorrowers'));
const LoanOfficerAddLoan = lazy(() => import('./pages/loan-officer/AddLoan'));
const LoanOfficerDueLoans = lazy(() => import('./pages/loan-officer/DueLoans'));
const LoanOfficerNoRepaymentLoans = lazy(() => import('./pages/loan-officer/NoRepaymentLoans'));
const LoanOfficerLoansInArrears = lazy(() => import('./pages/loan-officer/LoansInArrears'));
const LoanOfficerMissedRepayments = lazy(() => import('./pages/loan-officer/MissedRepayments'));
const LoanCalculator = lazy(() => import('./pages/loan-officer/LoanCalculator'));
const MyLoans = lazy(() => import('./pages/loan-officer/MyLoans'));
const ClientLoans = lazy(() => import('./pages/loan-officer/ClientLoans'));
const BorrowerLoanDetails = lazy(() => import('./pages/loan-officer/BorrowerLoanDetails'));

// Cashier Pages
const Transactions = lazy(() => import('./pages/cashier/Transactions'));
const PaymentRecords = lazy(() => import('./pages/cashier/PaymentRecords'));
const DailyReports = lazy(() => import('./pages/cashier/DailyReports'));
const PaymentHistory = lazy(() => import('./pages/cashier/PaymentHistory'));
const DueCollections = lazy(() => import('./pages/cashier/DueCollections'));
const OverdueLoans = lazy(() => import('./pages/cashier/OverdueLoans'));
const LoanSchedule = lazy(() => import('./pages/cashier/LoanSchedule'));

// Shared Pages
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/shared/UnauthorizedPage'));

// Borrowers Pages
const AllBorrowers = lazy(() => import('./pages/borrowers/AllBorrowers'));
const AddBorrower = lazy(() => import('./pages/borrowers/AddBorrower'));

// Receipt Display
const ReceiptDisplay = lazy(() => import('./pages/ReceiptDisplay'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    
                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="admin" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminDashboard />
                        </Suspense>
                      } />
                      <Route path="admin/users" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <UserManagement />
                        </Suspense>
                      } />
                      <Route path="admin/loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ViewAllLoans />
                        </Suspense>
                      } />
                      <Route path="admin/loans/add" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AddLoan />
                        </Suspense>
                      } />
                      <Route path="admin/loans/:id" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanDetails />
                        </Suspense>
                      } />
                      <Route path="admin/due-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <DueLoans />
                        </Suspense>
                      } />
                      <Route path="admin/missed-repayments" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <MissedRepayments />
                        </Suspense>
                      } />
                      <Route path="admin/loans-in-arrears" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoansInArrears />
                        </Suspense>
                      } />
                      <Route path="admin/no-repayment-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <NoRepaymentLoans />
                        </Suspense>
                      } />
                      <Route path="admin/past-maturity" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <PastMaturityDashboard />
                        </Suspense>
                      } />
                      <Route path="admin/principal-outstanding" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <PrincipalOutstandingView />
                        </Suspense>
                      } />
                      <Route path="admin/settings" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <SystemSettings />
                        </Suspense>
                      } />
                      <Route path="admin/reports" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Reports />
                        </Suspense>
                      } />
                      <Route path="admin/analytics" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Analytics />
                        </Suspense>
                      } />
                    </Route>

                    {/* Supervisor Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
                      <Route path="supervisor" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <SupervisorDashboard />
                        </Suspense>
                      } />
                      <Route path="supervisor/metrics" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <PerformanceMetrics />
                        </Suspense>
                      } />
                      <Route path="supervisor/due-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <DueLoans />
                        </Suspense>
                      } />
                    </Route>

                    {/* Borrowers Routes - Admin and Supervisor */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor']} />}>
                      <Route path="borrowers" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AllBorrowers />
                        </Suspense>
                      } />
                    </Route>

                    {/* Add Borrower - Admin, Supervisor, Loan Officer */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor', 'loan-officer']} />}>
                      <Route path="borrowers/add" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AddBorrower />
                        </Suspense>
                      } />
                    </Route>

                    {/* Loan Officer Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['loan-officer', 'supervisor', 'admin']} />}>
                      <Route path="loan-officer" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerDashboard />
                        </Suspense>
                      } />
                      <Route path="loan-officer/applications" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanApplications />
                        </Suspense>
                      } />
                      <Route path="loan-officer/borrowers" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerBorrowers />
                        </Suspense>
                      } />
                      <Route path="loan-officer/documents" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <DocumentProcessing />
                        </Suspense>
                      } />
                    </Route>

                    {/* Loan Officer Only Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['loan-officer']} />}>
                      <Route path="loan-officer/clients" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ClientManagement />
                        </Suspense>
                      } />
                      <Route path="loan-officer/clients/:clientId/loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ClientLoans />
                        </Suspense>
                      } />
                      <Route path="loan-officer/loans/add" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerAddLoan />
                        </Suspense>
                      } />
                      <Route path="loan-officer/due-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerDueLoans />
                        </Suspense>
                      } />
                      <Route path="loan-officer/no-repayment-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerNoRepaymentLoans />
                        </Suspense>
                      } />
                      <Route path="loan-officer/loans-in-arrears" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerLoansInArrears />
                        </Suspense>
                      } />
                      <Route path="loan-officer/missed-repayments" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanOfficerMissedRepayments />
                        </Suspense>
                      } />
                      <Route path="loan-officer/calculator" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanCalculator />
                        </Suspense>
                      } />
                      <Route path="loan-officer/my-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <MyLoans />
                        </Suspense>
                      } />
                      <Route path="loan-officer/borrower-loans/:borrowerId" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <BorrowerLoanDetails />
                        </Suspense>
                      } />
                    </Route>

                    {/* Cashier Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['cashier']} />}>
                      <Route path="cashier" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <CashierDashboard />
                        </Suspense>
                      } />
                      <Route path="cashier/payment-records" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <PaymentRecords />
                        </Suspense>
                      } />
                      <Route path="cashier/daily-reports" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <DailyReports />
                        </Suspense>
                      } />
                      <Route path="cashier/payment-history" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <PaymentHistory />
                        </Suspense>
                      } />
                      <Route path="cashier/due-collections" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <DueCollections />
                        </Suspense>
                      } />
                      <Route path="cashier/overdue-loans" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <OverdueLoans />
                        </Suspense>
                      } />
                      <Route path="cashier/loan-schedule" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <LoanSchedule />
                        </Suspense>
                                            } />
                    </Route>

                    {/* Shared Routes - All authenticated users */}
                    <Route path="profile" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProfilePage />
                      </Suspense>
                    } />

                    {/* Receipt Route - Multiple roles */}
                    <Route element={<ProtectedRoute allowedRoles={['cashier', 'supervisor', 'admin', 'loan-officer']} />}>
                      <Route path="receipt/:repaymentId" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ReceiptDisplay />
                        </Suspense>
                      } />
                    </Route>

                  </Route>
                </Route>

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Unauthorized Page */}
                <Route path="/unauthorized" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <UnauthorizedPage />
                  </Suspense>
                } />

                {/* 404 Page - Catch all unmatched routes */}
                <Route path="*" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFoundPage />
                  </Suspense>
                } />

              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
