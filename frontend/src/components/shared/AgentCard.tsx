import { useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Zap, Brain, ArrowRight, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  id?: string
  name: string
  description: string
  status?: 'active' | 'processing' | 'idle' | string
  confidence: number
  lastRun: string
  executionTime: string
  latestAnalysis: string
  output: string | string[]
  icon?: LucideIcon
  color: string
  index?: number
  onClick?: () => void
  onRunAgent?: (e: React.MouseEvent, id: string) => void
}

export function AgentCard({
  id, name, description, status = 'active', confidence, lastRun,
  executionTime, latestAnalysis, output, icon, color, index = 0, onClick, onRunAgent
}: AgentCardProps) {
  const [isRunning, setIsRunning] = useState(false)
  const IconComponent = (typeof icon === 'function' || typeof icon === 'object') ? icon : Brain

  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const, pulse: true },
    processing: { label: 'Processing', variant: 'warning' as const, pulse: true },
    idle: { label: 'Idle', variant: 'muted' as const, pulse: false },
  }

  const validStatus = (status && status in statusConfig) ? (status as 'active' | 'processing' | 'idle') : 'active'
  const statusInfo = statusConfig[validStatus]

  const outputText = Array.isArray(output) ? output.join(' • ') : (output || '')

  const handleRunClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!id || !onRunAgent) return
    setIsRunning(true)
    try {
      await onRunAgent(e, id)
    } finally {
      setTimeout(() => setIsRunning(false), 600)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between"
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ backgroundColor: color || '#5B5CEB' }} />
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${color || '#5B5CEB'}15` }}
            >
              <IconComponent className="w-5 h-5" style={{ color: color || '#5B5CEB' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-xs text-muted mt-0.5 line-clamp-1">{description}</p>
            </div>
            <Badge variant={statusInfo.variant} className="shrink-0">
              {statusInfo.pulse && (
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                  validStatus === 'active' ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'
                )} />
              )}
              {statusInfo.label}
            </Badge>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100/60">
              <p className="text-base font-bold" style={{ color: color || '#5B5CEB' }}>{confidence}%</p>
              <p className="text-[10px] text-muted">Confidence</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100/60">
              <p className="text-xs font-semibold text-foreground mt-0.5">{executionTime}</p>
              <p className="text-[10px] text-muted">Exec Time</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100/60">
              <p className="text-xs font-semibold text-foreground mt-0.5">{lastRun}</p>
              <p className="text-[10px] text-muted">Last Run</p>
            </div>
          </div>

          {/* Latest Analysis */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: color || '#5B5CEB' }} />
              <span className="text-xs font-medium text-foreground">Latest Analysis</span>
            </div>
            <p className="text-xs text-muted leading-relaxed line-clamp-3">{latestAnalysis}</p>
          </div>
        </div>

        {/* Output & Click CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted truncate flex-1">{outputText}</p>
          
          <div className="flex items-center gap-2 shrink-0">
            {onRunAgent && id && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRunClick}
                disabled={isRunning}
                className="h-7 px-2 text-[11px] gap-1 hover:bg-gray-100 text-muted hover:text-foreground cursor-pointer"
                title={`Re-run ${name}`}
              >
                <RefreshCw className={cn("w-3 h-3", isRunning && "animate-spin text-primary")} />
                Run
              </Button>
            )}
            <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
