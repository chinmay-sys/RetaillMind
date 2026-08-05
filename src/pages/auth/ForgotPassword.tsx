import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Reset your password</h1>
        <p className="text-sm text-muted">Enter your email address and we'll send you a verification code to reset your password.</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input id="email" type="email" placeholder="chinmay@retailmind.ai" className="pl-10" />
          </div>
        </div>
        <Link to="/auth/otp">
          <Button className="w-full mt-2" size="lg">Send Reset Code <ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </form>
      <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground mt-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
    </motion.div>
  )
}
