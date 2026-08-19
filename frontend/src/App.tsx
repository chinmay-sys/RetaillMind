import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleRedirect } from '@/components/layout/RoleRedirect'
import { AppRole } from '@/lib/roles'

// Layouts
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Lazy-loaded public & auth pages
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'))

// Lazy-loaded role dashboards
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const ManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'))
const AnalystDashboard = lazy(() => import('@/pages/AnalystDashboard'))

// Lazy-loaded feature pages
const Analytics = lazy(() => import('@/pages/Analytics'))
const DemandForecast = lazy(() => import('@/pages/DemandForecast'))
const InventoryIntelligence = lazy(() => import('@/pages/InventoryIntelligence'))
const PricingIntelligence = lazy(() => import('@/pages/PricingIntelligence'))
const SupplierIntelligence = lazy(() => import('@/pages/SupplierIntelligence'))
const CustomerFeedbackIntelligence = lazy(() => import('@/pages/CustomerFeedbackIntelligence'))
const AIDecisionCenter = lazy(() => import('@/pages/AIDecisionCenter'))
const AIChat = lazy(() => import('@/pages/AIChat'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageSkeleton() {
  return (
    <div className="page-container animate-pulse space-y-6">
      <div className="h-8 w-48 bg-gray-200/70 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200/60 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-gray-200/50 rounded-2xl" />
        <div className="h-72 bg-gray-200/50 rounded-2xl" />
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />

                {/* Auth */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="otp" element={<OTPVerification />} />
                  <Route path="verify-otp" element={<OTPVerification />} />
                </Route>

                {/* App — Protected */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  {/* Index: redirect to role-specific dashboard */}
                  <Route index element={<RoleRedirect />} />

                  {/* Role-specific dashboards */}
                  <Route path="admin" element={
                    <ProtectedRoute allowedRoles={[AppRole.ADMIN]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="manager" element={
                    <ProtectedRoute allowedRoles={[AppRole.MANAGER]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <ManagerDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="analyst" element={
                    <ProtectedRoute allowedRoles={[AppRole.ANALYST]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <AnalystDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Shared pages — all authenticated roles */}
                  <Route path="analytics" element={<Suspense fallback={<PageSkeleton />}><Analytics /></Suspense>} />
                  <Route path="forecast" element={<Suspense fallback={<PageSkeleton />}><DemandForecast /></Suspense>} />
                  <Route path="customer-reviews" element={<Suspense fallback={<PageSkeleton />}><CustomerFeedbackIntelligence /></Suspense>} />
                  <Route path="chat" element={<Suspense fallback={<PageSkeleton />}><AIChat /></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={<PageSkeleton />}><Reports /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<PageSkeleton />}><Settings /></Suspense>} />

                  {/* Manager & Admin only pages */}
                  <Route path="inventory" element={
                    <ProtectedRoute allowedRoles={[AppRole.ADMIN, AppRole.MANAGER]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <InventoryIntelligence />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="pricing" element={
                    <ProtectedRoute allowedRoles={[AppRole.ADMIN, AppRole.MANAGER]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <PricingIntelligence />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="suppliers" element={
                    <ProtectedRoute allowedRoles={[AppRole.ADMIN, AppRole.MANAGER]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <SupplierIntelligence />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="ai-center" element={
                    <ProtectedRoute allowedRoles={[AppRole.ADMIN, AppRole.MANAGER]}>
                      <Suspense fallback={<PageSkeleton />}>
                        <AIDecisionCenter />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
