import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/lib/api'

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()

  // Get email from location state, search params, or prompt
  const initialEmail = location.state?.email || searchParams.get('email') || ''
  const [emailInput, setEmailInput] = useState(initialEmail)

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const handleChange = (index: number, value: string) => {
    // Only allow single numeric digit
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = cleaned
    setOtp(newOtp)
    setError(null)
    if (cleaned && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    const nextIdx = Math.min(pasted.length, 5)
    inputs.current[nextIdx]?.focus()
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setInfo(null)

    const emailToVerify = emailInput.trim().toLowerCase()
    if (!emailToVerify) {
      setError('Please enter your email address.')
      return
    }

    const otpCode = otp.join('')
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    setIsVerifying(true)
    try {
      await verifyEmail(emailToVerify, otpCode)
      // On success, redirect to Business Analyst dashboard
      navigate('/app/analyst')
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your code.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    const emailToVerify = emailInput.trim().toLowerCase()
    if (!emailToVerify) {
      setError('Please enter your email address to resend the code.')
      return
    }
    if (cooldown > 0 || isResending) return

    setError(null)
    setInfo(null)
    setIsResending(true)

    try {
      const res = await authAPI.resendVerification(emailToVerify)
      setInfo(res.data?.message || 'A new verification code has been sent.')
      setCooldown(60)
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend verification code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
        <p className="text-sm text-muted">
          We've sent a 6-digit verification code to
        </p>
        {initialEmail ? (
          <p className="text-foreground font-semibold mt-1">{initialEmail}</p>
        ) : (
          <div className="mt-3 max-w-xs mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="text-center"
            />
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {info && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{info}</span>
        </motion.div>
      )}

      <form onSubmit={handleVerify}>
        <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              disabled={isVerifying}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isVerifying || otp.join('').length < 6}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying Code...
            </>
          ) : (
            <>
              Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-muted">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Resending...
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" /> Resend in {cooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" /> Resend Code
              </>
            )}
          </button>
        </p>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Link to="/auth/login" className="text-xs text-muted hover:text-foreground">
            Back to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
