import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
        <p className="text-sm text-muted">We've sent a 6-digit verification code to<br /><span className="text-foreground font-medium">chinmay@retailmind.ai</span></p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        {otp.map((digit, i) => (
          <motion.input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        ))}
      </div>

      <Link to="/app">
        <Button className="w-full" size="lg">Verify & Continue <ArrowRight className="w-4 h-4" /></Button>
      </Link>

      <div className="text-center mt-6">
        <p className="text-sm text-muted">
          Didn't receive the code?{' '}
          <button className="text-primary font-medium hover:underline inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Resend
          </button>
        </p>
      </div>
    </motion.div>
  )
}
