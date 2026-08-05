import { motion } from 'framer-motion'
import { LucideIcon, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  name: string
  description: string
  status: 'active' | 'processing' | 'idle'
  confidence: number
  lastRun: string
  executionTime: string
  latestAnalysis: string
  output: string
  icon: LucideIcon
  color: string
  index?: number
}

export function AgentCard({
  name, description, status, confidence, lastRun,
  executionTime, latestAnalysis, output, icon: Icon, color, index = 0
}: AgentCardProps) {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const, pulse: true },
    processing: { label: 'Processing', variant: 'warning' as const, pulse: true },
    idle: { label: 'Idle', variant: 'muted' as const, pulse: false },
  }

  const statusInfo = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl border border-gray-100/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ backgroundColor: color }} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
            <p className="text-xs text-muted mt-0.5 line-clamp-1">{description}</p>
          </div>
          <Badge variant={statusInfo.variant} className="shrink-0">
            {statusInfo.pulse && (
              <span className={cn(
                'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                status === 'active' ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'
              )} />
            )}
            {statusInfo.label}
          </Badge>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold" style={{ color }}>{confidence}%</p>
            <p className="text-[10px] text-muted">Confidence</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-foreground">{executionTime}</p>
            <p className="text-[10px] text-muted">Exec Time</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-foreground">{lastRun}</p>
            <p className="text-[10px] text-muted">Last Run</p>
          </div>
        </div>

        {/* Latest Analysis */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-xs font-medium text-foreground">Latest Analysis</span>
          </div>
          <p className="text-xs text-muted leading-relaxed line-clamp-3">{latestAnalysis}</p>
        </div>

        {/* Output */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{output}</p>
        </div>
      </div>
    </motion.div>
  )
}
