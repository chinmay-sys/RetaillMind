import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Building2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeRole, getRoleDashboardPath } from '@/lib/roles'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, error: authError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!firstName.trim()) { setLocalError('First name is required'); return }
    if (!lastName.trim()) { setLocalError('Last name is required'); return }
    if (!email.trim()) { setLocalError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setLocalError('Invalid email format'); return }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return }

    setIsSubmitting(true)
    try {
      await register({ first_name: firstName, last_name: lastName, email: email.trim().toLowerCase(), password, organization: organization || undefined })
      navigate('/auth/verify-otp', { state: { email: email.trim().toLowerCase() } })
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || authError

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
        <p className="text-sm text-muted">Start your 14-day free trial. No credit card required.</p>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input id="firstName" placeholder="Chinmay" className="pl-10" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="R." value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Organization</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input id="company" placeholder="RetailMind AI" className="pl-10" value={organization} onChange={(e) => setOrganization(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input id="email" type="email" placeholder="chinmay@retailmind.ai" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button className="w-full mt-2" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </form>
      <p className="text-center text-xs text-muted mt-6">
        By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
      </p>
      <p className="text-center text-sm text-muted mt-4">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </motion.div>
  )
}
