import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: LucideIcon
  description: string
  color: string
  bgColor: string
  index?: number
}

function AnimatedValue({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value)
  const prevValue = useRef(value)
  
  useEffect(() => {
    if (prevValue.current !== value) {
      setDisplayed(value)
      prevValue.current = value
    }
  }, [value])

  return <span>{displayed}</span>
}

export function StatCard({ title, value, change, trend, icon: Icon, description, color, bgColor, index = 0 }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', bgColor)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{change}</span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">
          <AnimatedValue value={value} />
        </h3>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-xs text-muted/70">{description}</p>
      </div>
    </motion.div>
  )
}
