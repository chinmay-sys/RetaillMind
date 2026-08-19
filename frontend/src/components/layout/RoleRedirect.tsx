import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleDashboardPath, AppRole } from '@/lib/roles'

/**
 * Redirects /app to the correct role-specific dashboard.
 * Used as the index route element for /app.
 */
export function RoleRedirect() {
  const { normalizedRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted animate-pulse">Redirecting to your dashboard...</p>
      </div>
    )
  }

  if (!isAuthenticated || !normalizedRole) {
    return <Navigate to="/auth/login" replace />
  }

  return <Navigate to={getRoleDashboardPath(normalizedRole)} replace />
}
