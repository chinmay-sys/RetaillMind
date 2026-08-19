import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LucideIcon, Brain, Zap, RefreshCw, ArrowRight, ShieldCheck, Cpu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { aiCenterAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AgentDomainWidgetProps {
  agentId: 'demand' | 'inventory' | 'pricing' | 'supplier'
  agentName: string
  description: string
  color: string
  icon: LucideIcon
  defaultAnalysis: string
  defaultConfidence: number
  defaultOutputs: string[]
}

export function AgentDomainWidget({
  agentId,
  agentName,
  description,
  color,
  icon: IconComponent,
  defaultAnalysis,
  defaultConfidence,
  defaultOutputs,
}: AgentDomainWidgetProps) {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(defaultAnalysis)
  const [confidence, setConfidence] = useState(defaultConfidence)
  const [outputs, setOutputs] = useState<string[]>(defaultOutputs)
  const [executionTime, setExecutionTime] = useState('1.2s')
  const [lastRun, setLastRun] = useState('Active')
  const [isLoading, setIsLoading] = useState(false)

  const fetchAgentStatus = async () => {
    try {
      const res = await aiCenterAPI.status()
      if (res.data?.agents) {
        const found = res.data.agents.find((a: any) => a.id === agentId || a.id === `${agentId}-agent`)
        if (found) {
          if (found.latestAnalysis) setAnalysis(found.latestAnalysis)
          if (found.confidence) setConfidence(found.confidence)
          if (found.output) setOutputs(Array.isArray(found.output) ? found.output : [found.output])
          if (found.executionTime) setExecutionTime(found.executionTime)
          if (found.lastRun) setLastRun(found.lastRun)
        }
      }
    } catch {
      // Retain defaults on offline / error
    }
  }

  useEffect(() => {
    fetchAgentStatus()
  }, [agentId])

  const handleRunAgent = async () => {
    setIsLoading(true)
    try {
      const res = await aiCenterAPI.runAgent(agentId)
      if (res.data?.agent) {
        const ag = res.data.agent
        if (ag.latestAnalysis) setAnalysis(ag.latestAnalysis)
        if (ag.confidence) setConfidence(ag.confidence)
        if (ag.output) setOutputs(Array.isArray(ag.output) ? ag.output : [ag.output])
        if (ag.executionTime) setExecutionTime(ag.executionTime)
        if (ag.lastRun) setLastRun(ag.lastRun)
      }
    } catch {
      // Retain state
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-card transition-all">
        {/* Accent Bar */}
        <div className="h-1" style={{ backgroundColor: color || '#5B5CEB' }} />

        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Agent Branding */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div
                className="p-3 rounded-2xl shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <IconComponent className="w-6 h-6" style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{agentName}</h3>
                  <Badge variant="success" className="text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-1" />
                    Autonomous Mode
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">{description}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm font-bold block" style={{ color }}>{confidence}%</span>
                <span className="text-[10px] text-muted block">Confidence</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-foreground block">{executionTime}</span>
                <span className="text-[10px] text-muted block">Latency</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleRunAgent}
                disabled={isLoading}
                className="h-8 text-xs gap-1.5 cursor-pointer border-gray-200 hover:border-primary/40"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
                {isLoading ? 'Running...' : 'Re-Run Agent'}
              </Button>
            </div>
          </div>

          {/* Analysis & Output Box */}
          <div className="mt-4 pt-3.5 border-t border-gray-100/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gray-50/70 rounded-xl p-3.5 border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
                <Zap className="w-3.5 h-3.5" style={{ color }} />
                <span>Live Agent Findings</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{analysis}</p>
            </div>

            <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Agent Directives</span>
                </div>
                <ul className="space-y-1">
                  {outputs.slice(0, 2).map((out, idx) => (
                    <li key={idx} className="text-[11px] text-muted flex items-start gap-1">
                      <span className="text-primary font-bold">•</span>
                      <span className="line-clamp-1">{out}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate('/app/ai-center')}
                className="mt-2 text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open AI Decision Center <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
