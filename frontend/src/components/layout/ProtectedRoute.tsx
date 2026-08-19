import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppRole, getRoleDashboardPath } from '@/lib/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: AppRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, normalizedRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-muted">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Role-based access check
  if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole)) {
    // Redirect to the user's own dashboard instead of showing an error
    const correctPath = getRoleDashboardPath(normalizedRole)
    return <Navigate to={correctPath} replace />
  }

  return <>{children}</>
}
