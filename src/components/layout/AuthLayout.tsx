import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RetailMind AI</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Intelligence that<br />
            powers retail<br />
            <span className="text-gradient bg-gradient-to-r from-blue-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
              decisions.
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Harness the power of AI agents, machine learning, and real-time analytics to make smarter business decisions.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border-2 border-white/20 flex items-center justify-center text-white text-xs font-medium"
                >
                  {letter}
                </div>
              ))}
            </div>
            <span className="text-white/60 text-sm">Trusted by 500+ retailers</span>
          </div>
          <p className="text-white/40 text-xs">
            © 2026 RetailMind AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
