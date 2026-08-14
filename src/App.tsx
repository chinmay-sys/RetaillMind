import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Layouts
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Pages
import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import OTPVerification from '@/pages/auth/OTPVerification'
import Dashboard from '@/pages/Dashboard'
import Analytics from '@/pages/Analytics'
import DemandForecast from '@/pages/DemandForecast'
import InventoryIntelligence from '@/pages/InventoryIntelligence'
import PricingIntelligence from '@/pages/PricingIntelligence'
import SupplierIntelligence from '@/pages/SupplierIntelligence'
import CustomerFeedbackIntelligence from '@/pages/CustomerFeedbackIntelligence'
import AIDecisionCenter from '@/pages/AIDecisionCenter'
import AIChat from '@/pages/AIChat'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Auth */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="otp" element={<OTPVerification />} />
            </Route>

            {/* App — Protected */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="forecast" element={<DemandForecast />} />
              <Route path="inventory" element={<InventoryIntelligence />} />
              <Route path="pricing" element={<PricingIntelligence />} />
              <Route path="suppliers" element={<SupplierIntelligence />} />
              <Route path="customer-reviews" element={<CustomerFeedbackIntelligence />} />
              <Route path="ai-center" element={<AIDecisionCenter />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  )
}

export default App
