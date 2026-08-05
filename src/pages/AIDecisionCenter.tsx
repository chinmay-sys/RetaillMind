import { motion } from 'framer-motion'
import { Brain, Zap, CheckCircle2, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentCard } from '@/components/shared/AgentCard'
import { aiAgents } from '@/data/mockData'
import { cn } from '@/lib/utils'

export default function AIDecisionCenter() {
  return (
    <div className="page-container">
      {/* Orchestrator Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03]">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Orchestrator Hub */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  {/* Pulse rings */}
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                  />
                  <motion.div
                    animate={{ scale: [1, 2.2], opacity: [0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.5 }}
                    className="absolute inset-0 rounded-2xl border border-primary"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">AI Orchestrator</h2>
                  <p className="text-sm text-muted mt-1">Coordinating 5 specialized agents in real-time</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="success">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-1.5" />
                      All Systems Active
                    </Badge>
                    <Badge variant="default">
                      <Cpu className="w-3 h-3 mr-1" />
                      96% Confidence
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Connection Lines */}
              <div className="hidden lg:flex flex-1 items-center justify-center">
                <svg className="w-full h-20" viewBox="0 0 400 80">
                  {/* Animated connection lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.line
                      key={i}
                      x1="0" y1="40"
                      x2="400" y2={10 + i * 15}
                      stroke="#5B5CEB"
                      strokeWidth="1"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    />
                  ))}
                  {/* Data flow dots */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.circle
                      key={`dot-${i}`}
                      r="3"
                      fill="#5B5CEB"
                      initial={{ cx: 0, cy: 40 }}
                      animate={{ cx: [0, 400], cy: [40, 10 + i * 15] }}
                      transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'linear', delay: i * 0.4 }}
                    />
                  ))}
                </svg>
              </div>

              {/* Agent Status Summary */}
              <div className="flex flex-col gap-2">
                {aiAgents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-100"
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      agent.status === 'active' ? 'bg-success animate-pulse' :
                      agent.status === 'processing' ? 'bg-warning animate-pulse' : 'bg-gray-400'
                    )} />
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                      {agent.name.replace(' Agent', '')}
                    </span>
                    <span className="text-[10px] text-muted ml-auto">{agent.confidence}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {aiAgents.map((agent, i) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            description={agent.description}
            status={agent.status}
            confidence={agent.confidence}
            lastRun={agent.lastRun}
            executionTime={agent.executionTime}
            latestAnalysis={agent.latestAnalysis}
            output={agent.output}
            icon={agent.icon}
            color={agent.color}
            index={i}
          />
        ))}
      </div>

      {/* Strategic Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI Strategic Recommendations
            </CardTitle>
            <CardDescription>Synthesized insights from all agents, prioritized by business impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  priority: 'Critical',
                  title: 'Immediate Restock: Wireless Mouse Elite',
                  description: 'Stock at 23 units (safety: 80). At current burn rate, stockout in 3.5 days. Emergency PO to TechFlow Solutions recommended.',
                  agent: 'Inventory + Supplier Agent',
                  impact: 'Prevent ₹2.3L revenue loss',
                  color: 'border-l-danger',
                  badgeVariant: 'danger' as const,
                },
                {
                  priority: 'High',
                  title: 'Price Reduction: Gaming Laptop Pro X1',
                  description: 'Currently overpriced by ₹5,000 vs market. Reducing to ₹84,999 projects +12% sales volume with minimal margin impact.',
                  agent: 'Pricing + Demand Agent',
                  impact: 'Projected +₹1.7L revenue',
                  color: 'border-l-warning',
                  badgeVariant: 'warning' as const,
                },
                {
                  priority: 'Medium',
                  title: 'Clearance Campaign: Desk Lamp Smart LED',
                  description: '445 units in stock (max: 300). 20% discount campaign recommended to clear 150+ excess units within 2 weeks.',
                  agent: 'Inventory + Pricing Agent',
                  impact: 'Free up ₹4.5L working capital',
                  color: 'border-l-primary',
                  badgeVariant: 'default' as const,
                },
              ].map((rec, i) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className={cn('p-5 rounded-xl bg-gray-50 border border-gray-100 border-l-4', rec.color)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.badgeVariant}>{rec.priority}</Badge>
                      <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{rec.agent}</Badge>
                  </div>
                  <p className="text-sm text-muted mb-2">{rec.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-medium text-success">{rec.impact}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
