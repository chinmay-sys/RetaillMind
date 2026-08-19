import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeRole, getRoleDashboardPath } from '@/lib/roles'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, error: authError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validation
    if (!email.trim()) { setLocalError('Email is required'); return }
    if (!password.trim()) { setLocalError('Password is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setLocalError('Invalid email format'); return }

    setIsSubmitting(true)
    try {
      await login(email, password)
      // AuthContext.login() saves user to localStorage synchronously before returning
      const savedUser = JSON.parse(localStorage.getItem('retailmind_user') || '{}')
      const role = normalizeRole(savedUser.role)
      navigate(getRoleDashboardPath(role))
    } catch (err: any) {
      setLocalError(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || authError

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to access your retail intelligence dashboard</p>
      </div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {displayError}
        </motion.div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              id="email"
              type="email"
              placeholder="chinmay@retailmind.ai"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button className="w-full mt-2" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted">
            quick demo login
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setEmail('chinmay@retailmind.ai'); setPassword('admin123'); }}
            className="text-xs flex flex-col h-auto py-2"
          >
            <span className="font-semibold text-primary">Admin</span>
            <span className="text-[10px] text-muted">chinmay@retailmind.ai</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setEmail('priya@retailmind.ai'); setPassword('manager123'); }}
            className="text-xs flex flex-col h-auto py-2"
          >
            <span className="font-semibold text-primary">Manager</span>
            <span className="text-[10px] text-muted">priya@retailmind.ai</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setEmail('vikram@retailmind.ai'); setPassword('analyst123'); }}
            className="text-xs flex flex-col h-auto py-2"
          >
            <span className="font-semibold text-primary">Analyst</span>
            <span className="text-[10px] text-muted">vikram@retailmind.ai</span>
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted mt-8">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  )
}
