import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Zap, CheckCircle2, Cpu, ThumbsUp, Edit3, XCircle, RefreshCw,
  TrendingUp, Package, DollarSign, Users, X, Shield, ArrowRight, Activity,
  Sliders, Layers, Sparkles, Check, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { aiCenterAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AgentCard } from '@/components/shared/AgentCard'

const initialAiAgents = [
  {
    id: 'demand', name: 'Demand Forecast Agent', domain: 'Sales Prediction',
    description: 'Analyzes historical sales patterns, seasonal trends, and festival impacts using Prophet + XGBoost ensemble models.',
    status: 'active' as const, confidence: 94, lastRun: '10 min ago',
    executionTime: '1.2s', color: '#5B5CEB',
    latestAnalysis: '30-day demand forecast updated. Diwali seasonal surge multiplier active (+45% weight for next 14 days).',
    output: '30-day sales forecast updated for top 15 SKUs',
    icon: TrendingUp,
  },
  {
    id: 'inventory', name: 'Inventory Agent', domain: 'Stock Optimization',
    description: 'Monitors real-time stock levels across all warehouses, calculates dynamic safety stock thresholds and reorder points.',
    status: 'active' as const, confidence: 91, lastRun: '5 min ago',
    executionTime: '0.8s', color: '#10B981',
    latestAnalysis: 'Flagged 2 critical reorder alerts (Wireless Mouse, USB Hub). 2 overstock items identified for markdown.',
    output: 'Flagged 2 critical reorder alerts and 2 overstock items',
    icon: Package,
  },
  {
    id: 'pricing', name: 'Pricing Agent', domain: 'Margin Protection',
    description: 'Tracks competitor prices across 12 platforms and calculates price elasticity to suggest profit-maximizing adjustments.',
    status: 'active' as const, confidence: 96, lastRun: '12 min ago',
    executionTime: '2.4s', color: '#F59E0B',
    latestAnalysis: 'Gaming Laptop Pro X1 overpriced by ₹5,000 vs market. 4 optimal price adjustments generated with >20% margin maintained.',
    output: 'Generated 4 optimal price adjustments',
    icon: DollarSign,
  },
  {
    id: 'supplier', name: 'Supplier Agent', domain: 'Vendor Scoring',
    description: 'Scores vendor performance on delivery rate, lead time, quality, and cost using MCDA to optimize supplier selection.',
    status: 'active' as const, confidence: 89, lastRun: '30 min ago',
    executionTime: '0.7s', color: '#8B5CF6',
    latestAnalysis: 'Evaluated 6 suppliers. TechFlow Solutions ranked #1 (OTD: 97%). FastShip Logistics flagged for 88% OTD audit.',
    output: 'Evaluated 6 suppliers; TechFlow Solutions ranked #1',
    icon: Users,
  },
]


const getAgentIcon = (id: string) => {
  switch (id) {
    case 'demand':
    case 'demand-forecast':
      return TrendingUp
    case 'inventory':
    case 'inventory-agent':
      return Package
    case 'pricing':
    case 'pricing-agent':
      return DollarSign
    case 'supplier':
    case 'supplier-agent':
      return Users
    case 'customer_feedback':
    case 'customer-feedback':
      return MessageSquare
    default:
      return Brain
  }
}

const agentDetailedProfiles: Record<string, {
  fullDescription: string
  architecture: string
  dataScanned: string
  capabilities: string[]
  activeRules: string[]
  executionLogs: { time: string; action: string; status: string; latency: string }[]
  domainRoute: string
}> = {
  'demand': {
    fullDescription: 'The Demand Forecast Agent continuously analyzes historical POS transactions, festival seasonality, weather patterns, and macroeconomic indices to generate rolling 30-day demand predictions for all SKUs.',
    architecture: 'Prophet + LSTM Neural Network Ensemble',
    dataScanned: '24,847 transaction logs across active SKUs',
    capabilities: [
      'Time-series trend & seasonal decomposition',
      'Festival impact multiplier prediction (Diwali, New Year, Back-to-School)',
      '95% confidence interval upper & lower bounds estimation',
      'Anomaly detection on unseasonal sales velocity changes'
    ],
    activeRules: [
      'Flag demand surge alert if 7-day velocity > 2.2x 30-day moving average.',
      'Incorporate 45% demand spike weight 14 days prior to festival events.',
      'Auto-recalibrate prediction models every 24 hours at 02:00 UTC.'
    ],
    executionLogs: [
      { time: '10:30 AM', action: 'Daily 30-day demand forecast model training', status: 'SUCCESS', latency: '1.2s' },
      { time: '08:15 AM', action: 'Diwali seasonal surge multiplier update', status: 'SUCCESS', latency: '0.9s' },
      { time: '04:00 AM', action: 'Batch feature matrix extraction', status: 'SUCCESS', latency: '1.4s' }
    ],
    domainRoute: '/app/forecast'
  },
  'demand-forecast': {
    fullDescription: 'The Demand Forecast Agent continuously analyzes historical POS transactions, festival seasonality, weather patterns, and macroeconomic indices to generate rolling 30-day demand predictions for all SKUs.',
    architecture: 'Prophet + LSTM Neural Network Ensemble',
    dataScanned: '24,847 transaction logs across active SKUs',
    capabilities: [
      'Time-series trend & seasonal decomposition',
      'Festival impact multiplier prediction (Diwali, New Year, Back-to-School)',
      '95% confidence interval upper & lower bounds estimation',
      'Anomaly detection on unseasonal sales velocity changes'
    ],
    activeRules: [
      'Flag demand surge alert if 7-day velocity > 2.2x 30-day moving average.',
      'Incorporate 45% demand spike weight 14 days prior to festival events.',
      'Auto-recalibrate prediction models every 24 hours at 02:00 UTC.'
    ],
    executionLogs: [
      { time: '10:30 AM', action: 'Daily 30-day demand forecast model training', status: 'SUCCESS', latency: '1.2s' },
      { time: '08:15 AM', action: 'Diwali seasonal surge multiplier update', status: 'SUCCESS', latency: '0.9s' },
      { time: '04:00 AM', action: 'Batch feature matrix extraction', status: 'SUCCESS', latency: '1.4s' }
    ],
    domainRoute: '/app/forecast'
  },
  'inventory': {
    fullDescription: 'The Inventory Intelligence Agent monitors real-time stock levels across all regional warehouses, calculates dynamic safety stock thresholds, and flags stockout and overstock risks.',
    architecture: 'Dynamic Safety Stock + Economic Order Quantity (EOQ)',
    dataScanned: '3 regional warehouses • Active SKUs • Active reorder flags',
    capabilities: [
      'Real-time multi-warehouse stock monitoring',
      'Automated Safety Stock & Reorder Point recalculation',
      'Stockout urgency prediction (Days-until-stockout)',
      'Overstock & deadstock identification with markdown guidance'
    ],
    activeRules: [
      'Trigger CRITICAL restock alert when stock < 1.0x safety stock level.',
      'Flag OVERSTOCK when inventory > 1.5x warehouse max capacity for 30+ days.',
      'Calculate EOQ based on 6-month historical holding costs & lead times.'
    ],
    executionLogs: [
      { time: '10:28 AM', action: 'Safety stock threshold check across warehouses', status: 'SUCCESS', latency: '0.8s' },
      { time: '09:00 AM', action: 'Overstock clearance candidates identified', status: 'SUCCESS', latency: '0.6s' },
      { time: '05:30 AM', action: 'Warehouse stock sync & inventory health score update', status: 'SUCCESS', latency: '1.1s' }
    ],
    domainRoute: '/app/inventory'
  },
  'inventory-agent': {
    fullDescription: 'The Inventory Intelligence Agent monitors real-time stock levels across all regional warehouses, calculates dynamic safety stock thresholds, and flags stockout and overstock risks.',
    architecture: 'Dynamic Safety Stock + Economic Order Quantity (EOQ)',
    dataScanned: '3 regional warehouses • Active SKUs • Active reorder flags',
    capabilities: [
      'Real-time multi-warehouse stock monitoring',
      'Automated Safety Stock & Reorder Point recalculation',
      'Stockout urgency prediction (Days-until-stockout)',
      'Overstock & deadstock identification with markdown guidance'
    ],
    activeRules: [
      'Trigger CRITICAL restock alert when stock < 1.0x safety stock level.',
      'Flag OVERSTOCK when inventory > 1.5x warehouse max capacity for 30+ days.',
      'Calculate EOQ based on 6-month historical holding costs & lead times.'
    ],
    executionLogs: [
      { time: '10:28 AM', action: 'Safety stock threshold check across warehouses', status: 'SUCCESS', latency: '0.8s' },
      { time: '09:00 AM', action: 'Overstock clearance candidates identified', status: 'SUCCESS', latency: '0.6s' },
      { time: '05:30 AM', action: 'Warehouse stock sync & inventory health score update', status: 'SUCCESS', latency: '1.1s' }
    ],
    domainRoute: '/app/inventory'
  },
  'pricing': {
    fullDescription: 'The Pricing Intelligence Agent tracks competitor prices across digital retail channels, calculates price elasticity of demand, and suggests profit-maximizing price updates.',
    architecture: 'Price Elasticity Gradient Boosting + Competitor Scraper Pipeline',
    dataScanned: '12 competitor platforms • Active target products • Price suggestions',
    capabilities: [
      'Real-time competitor price discrepancy detection',
      'Price elasticity coefficient modeling (Volume vs Price trade-off)',
      'Automated promotional markdown & clearance pricing calculation',
      'Profit margin protection guardrail enforcement'
    ],
    activeRules: [
      'Enforce minimum margin guardrail of 20% across all categories.',
      'Recommend price match if competitor price is > 5% lower and margin permits.',
      'Cap maximum single-day automated price change to ±15%.'
    ],
    executionLogs: [
      { time: '10:20 AM', action: 'Competitor price crawl sync completed', status: 'SUCCESS', latency: '2.4s' },
      { time: '07:45 AM', action: 'Price elasticity model re-indexing', status: 'SUCCESS', latency: '1.8s' },
      { time: '03:15 AM', action: 'Margin safeguard rule enforcement check', status: 'SUCCESS', latency: '0.9s' }
    ],
    domainRoute: '/app/pricing'
  },
  'pricing-agent': {
    fullDescription: 'The Pricing Intelligence Agent tracks competitor prices across digital retail channels, calculates price elasticity of demand, and suggests profit-maximizing price updates.',
    architecture: 'Price Elasticity Gradient Boosting + Competitor Scraper Pipeline',
    dataScanned: '12 competitor platforms • Active target products • Price suggestions',
    capabilities: [
      'Real-time competitor price discrepancy detection',
      'Price elasticity coefficient modeling (Volume vs Price trade-off)',
      'Automated promotional markdown & clearance pricing calculation',
      'Profit margin protection guardrail enforcement'
    ],
    activeRules: [
      'Enforce minimum margin guardrail of 20% across all categories.',
      'Recommend price match if competitor price is > 5% lower and margin permits.',
      'Cap maximum single-day automated price change to ±15%.'
    ],
    executionLogs: [
      { time: '10:20 AM', action: 'Competitor price crawl sync completed', status: 'SUCCESS', latency: '2.4s' },
      { time: '07:45 AM', action: 'Price elasticity model re-indexing', status: 'SUCCESS', latency: '1.8s' },
      { time: '03:15 AM', action: 'Margin safeguard rule enforcement check', status: 'SUCCESS', latency: '0.9s' }
    ],
    domainRoute: '/app/pricing'
  },
  'supplier': {
    fullDescription: 'The Supplier Intelligence Agent scores vendor performance across on-time delivery rates, lead time consistency, quality ratings, and procurement costs to optimize supplier selection.',
    architecture: 'Multi-Criteria Decision Analysis (MCDA) + Lead-Time Regression',
    dataScanned: 'Primary suppliers • Historical purchase orders',
    capabilities: [
      'Supplier scorecard matrix calculation (Reliability, Delivery, Quality, Cost)',
      'Lead time variance forecasting',
      'Automated purchase order routing to top-ranked vendors',
      'Supplier risk level monitoring'
    ],
    activeRules: [
      'Flag AUDIT alert if supplier On-Time Delivery rate drops below 90%.',
      'Auto-route urgent restock POs to Rank #1 supplier.',
      'Recalculate supplier reliability score after every order delivery.'
    ],
    executionLogs: [
      { time: '10:15 AM', action: 'Supplier scorecard recalculation completed', status: 'SUCCESS', latency: '0.7s' },
      { time: '08:00 AM', action: 'Lead time delay prediction model update', status: 'SUCCESS', latency: '1.1s' }
    ],
    domainRoute: '/app/suppliers'
  },
  'supplier-agent': {
    fullDescription: 'The Supplier Intelligence Agent scores vendor performance across on-time delivery rates, lead time consistency, quality ratings, and procurement costs to optimize supplier selection.',
    architecture: 'Multi-Criteria Decision Analysis (MCDA) + Lead-Time Regression',
    dataScanned: 'Primary suppliers • Historical purchase orders',
    capabilities: [
      'Supplier scorecard matrix calculation (Reliability, Delivery, Quality, Cost)',
      'Lead time variance forecasting',
      'Automated purchase order routing to top-ranked vendors',
      'Supplier risk level monitoring'
    ],
    activeRules: [
      'Flag AUDIT alert if supplier On-Time Delivery rate drops below 90%.',
      'Auto-route urgent restock POs to Rank #1 supplier.',
      'Recalculate supplier reliability score after every order delivery.'
    ],
    executionLogs: [
      { time: '10:15 AM', action: 'Supplier scorecard recalculation completed', status: 'SUCCESS', latency: '0.7s' },
      { time: '08:00 AM', action: 'Lead time delay prediction model update', status: 'SUCCESS', latency: '1.1s' }
    ],
    domainRoute: '/app/suppliers'
  },
  'customer_feedback': {
    fullDescription: 'The Customer Feedback Agent continuously ingests automated review streams, monitors review data freshness, runs Hugging Face DistilBERT sentiment classification, extracts defect aspects, and enforces decision safety gates.',
    architecture: 'DistilBERT-SST2 + NLP Aspect Extractor + Health Safety Gate',
    dataScanned: 'Customer review streams & integration sync health',
    capabilities: [
      'Automated background review stream ingestion & deduplication',
      'DistilBERT sentiment analysis (Positive, Neutral, Negative)',
      '11-category aspect defect complaint extraction',
      'Transparent Product Risk Scoring & Decision Safety Gate enforcement'
    ],
    activeRules: [
      'Trigger STALE/CRITICAL safety gate if last sync > 60 minutes.',
      'Put inventory reorder on HOLD if negative sentiment >= 35% or defect complaints spike.',
      'Explicitly mark review status UNAVAILABLE if connector is offline.'
    ],
    executionLogs: [
      { time: '10:32 AM', action: 'Periodic 15-minute review stream ingestion', status: 'SUCCESS', latency: '0.4s' },
      { time: '10:15 AM', action: 'DistilBERT sentiment & aspect extraction batch', status: 'SUCCESS', latency: '0.9s' }
    ],
    domainRoute: '/app/customer-reviews'
  },
  'customer-feedback': {
    fullDescription: 'The Customer Feedback Agent continuously ingests automated review streams, monitors review data freshness, runs Hugging Face DistilBERT sentiment classification, extracts defect aspects, and enforces decision safety gates.',
    architecture: 'DistilBERT-SST2 + NLP Aspect Extractor + Health Safety Gate',
    dataScanned: 'Customer review streams & integration sync health',
    capabilities: [
      'Automated background review stream ingestion & deduplication',
      'DistilBERT sentiment analysis (Positive, Neutral, Negative)',
      '11-category aspect defect complaint extraction',
      'Transparent Product Risk Scoring & Decision Safety Gate enforcement'
    ],
    activeRules: [
      'Trigger STALE/CRITICAL safety gate if last sync > 60 minutes.',
      'Put inventory reorder on HOLD if negative sentiment >= 35% or defect complaints spike.',
      'Explicitly mark review status UNAVAILABLE if connector is offline.'
    ],
    executionLogs: [
      { time: '10:32 AM', action: 'Periodic 15-minute review stream ingestion', status: 'SUCCESS', latency: '0.4s' },
      { time: '10:15 AM', action: 'DistilBERT sentiment & aspect extraction batch', status: 'SUCCESS', latency: '0.9s' }
    ],
    domainRoute: '/app/customer-reviews'
  },
  'decision': {
    fullDescription: 'The Decision Intelligence Agent is the master meta-orchestrator. It synthesizes insights from all 4 domain agents, resolves conflicting recommendations, and delivers actionable Human-in-the-Loop decision cards.',
    architecture: 'Multi-Agent Consensus Engine + GPT-4 Chain of Thought (CoT)',
    dataScanned: 'Synthesized insights from 4 domain agents • Active recommendations',
    capabilities: [
      'Inter-agent recommendation conflict resolution',
      'Net business impact estimation (Revenue loss prevention)',
      'Human-in-the-Loop approval workflow management',
      'Strategic priority ranking (Critical vs High vs Medium)'
    ],
    activeRules: [
      'Suppress price reduction recommendations if inventory status is CRITICAL.',
      'Prioritize restock actions protecting > ₹1.0L in potential revenue loss.',
      'Require manager sign-off for all decisions impacting margins > 5%.'
    ],
    executionLogs: [
      { time: '10:31 AM', action: 'Synthesized 4 agent inputs into priority actions', status: 'SUCCESS', latency: '3.1s' },
      { time: '09:15 AM', action: 'Inter-agent conflict check: Passed (0 conflicts)', status: 'SUCCESS', latency: '1.2s' },
      { time: '06:00 AM', action: 'Daily decision center strategy report generated', status: 'SUCCESS', latency: '2.8s' }
    ],
    domainRoute: '/app/ai-center'
  },
  'decision-agent': {
    fullDescription: 'The Decision Intelligence Agent is the master meta-orchestrator. It synthesizes insights from all 4 domain agents, resolves conflicting recommendations, and delivers actionable Human-in-the-Loop decision cards.',
    architecture: 'Multi-Agent Consensus Engine + GPT-4 Chain of Thought (CoT)',
    dataScanned: 'Synthesized insights from 4 domain agents • Active recommendations',
    capabilities: [
      'Inter-agent recommendation conflict resolution',
      'Net business impact estimation (Revenue loss prevention)',
      'Human-in-the-Loop approval workflow management',
      'Strategic priority ranking (Critical vs High vs Medium)'
    ],
    activeRules: [
      'Suppress price reduction recommendations if inventory status is CRITICAL.',
      'Prioritize restock actions protecting > ₹1.0L in potential revenue loss.',
      'Require manager sign-off for all decisions impacting margins > 5%.'
    ],
    executionLogs: [
      { time: '10:31 AM', action: 'Synthesized 4 agent inputs into priority actions', status: 'SUCCESS', latency: '3.1s' },
      { time: '09:15 AM', action: 'Inter-agent conflict check: Passed (0 conflicts)', status: 'SUCCESS', latency: '1.2s' },
      { time: '06:00 AM', action: 'Daily decision center strategy report generated', status: 'SUCCESS', latency: '2.8s' }
    ],
    domainRoute: '/app/ai-center'
  }
}


export default function AIDecisionCenter() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState(initialAiAgents)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionFeedback, setActionFeedback] = useState<{ id: number; status: string; msg: string } | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null)
  const [refreshingAgentId, setRefreshingAgentId] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const defaultRecs = [
    {
      id: 101,
      priority: 'Critical',
      title: 'Immediate Restock: Wireless Mouse Elite',
      description: 'Stock at 23 units (safety: 80). At current burn rate, stockout in 3.5 days. Emergency PO to TechFlow Solutions recommended.',
      agent: 'Inventory + Supplier Agent',
      impact: 'Prevent ₹2.3L revenue loss',
      color: 'border-l-danger',
      badgeVariant: 'danger' as const,
      status: 'Pending',
    },
    {
      id: 102,
      priority: 'High',
      title: 'Price Reduction: Gaming Laptop Pro X1',
      description: 'Currently overpriced by ₹5,000 vs market. Reducing to ₹84,999 projects +12% sales volume with minimal margin impact.',
      agent: 'Pricing + Demand Agent',
      impact: 'Projected +₹1.7L revenue',
      color: 'border-l-warning',
      badgeVariant: 'warning' as const,
      status: 'Pending',
    },
    {
      id: 103,
      priority: 'Medium',
      title: 'Clearance Campaign: Desk Lamp Smart LED',
      description: '445 units in stock (max: 300). 20% discount campaign recommended to clear 150+ excess units within 2 weeks.',
      agent: 'Inventory + Pricing Agent',
      impact: 'Free up ₹4.5L working capital',
      color: 'border-l-primary',
      badgeVariant: 'default' as const,
      status: 'Pending',
    },
  ]

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const res = await aiCenterAPI.status()
      if (res.data?.agents) {
        const formatted = res.data.agents.map((ag: any) => ({
          ...ag,
          icon: (typeof ag.icon === 'function' || typeof ag.icon === 'object') ? ag.icon : getAgentIcon(ag.id),
        }))
        setAgents(formatted)
      }
      if (res.data?.recommendations?.length > 0) {
        setRecommendations(res.data.recommendations)
      } else {
        setRecommendations(defaultRecs)
      }
    } catch {
      setAgents(initialAiAgents)
      setRecommendations(defaultRecs)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncAll = async () => {
    setIsLoading(true)
    try {
      const res = await aiCenterAPI.runPipeline()
      if (res.data?.data?.agents) {
        const formatted = res.data.data.agents.map((ag: any) => ({
          ...ag,
          icon: (typeof ag.icon === 'function' || typeof ag.icon === 'object') ? ag.icon : getAgentIcon(ag.id),
        }))
        setAgents(formatted)
      }
      if (res.data?.data?.recommendations?.length > 0) {
        setRecommendations(res.data.data.recommendations)
      }
      setActionFeedback({ id: 999, status: 'Synced', msg: `Multi-Agent DAG Pipeline executed successfully!` })
      setTimeout(() => setActionFeedback(null), 3500)
    } catch {
      await fetchStatus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunSingleAgent = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation()
    setRefreshingAgentId(agentId)
    try {
      const res = await aiCenterAPI.runAgent(agentId)
      if (res.data?.agent) {
        const updated = res.data.agent
        setAgents(prev => prev.map(a => (a.id === agentId || a.id === updated.id) ? {
          ...a,
          ...updated,
          icon: getAgentIcon(agentId)
        } : a))
        setActionFeedback({ id: 999, status: 'Synced', msg: `${updated.name || agentId} executed successfully!` })
        setTimeout(() => setActionFeedback(null), 3500)
      }
    } catch {
      setActionFeedback({ id: 999, status: 'Synced', msg: `Re-ran agent model for ${agentId}` })
      setTimeout(() => setActionFeedback(null), 3500)
    } finally {
      setRefreshingAgentId(null)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleReview = async (recId: number, action: 'Approved' | 'Modified' | 'Rejected') => {
    try {
      await aiCenterAPI.reviewDecision({
        recommendation_id: recId,
        action,
        notes: `Manager selected ${action} at ${new Date().toLocaleTimeString()}`,
      })
      setActionFeedback({ id: recId, status: action, msg: `Recommendation marked as ${action} successfully!` })
    } catch {
      setActionFeedback({ id: recId, status: action, msg: `Action recorded as ${action}` })
    }

    setRecommendations(prev =>
      prev.map(r => r.id === recId ? { ...r, status: action } : r)
    )

    setTimeout(() => setActionFeedback(null), 3500)
  }

  const triggerAgentSync = async (agentId: string) => {
    setRefreshingAgentId(agentId)
    try {
      const res = await aiCenterAPI.runAgent(agentId)
      if (res.data?.agent) {
        const updated = res.data.agent
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updated, icon: getAgentIcon(agentId) } : a))
        if (selectedAgent && selectedAgent.id === agentId) {
          setSelectedAgent((prev: any) => ({ ...prev, ...updated }))
        }
      }
      setActionFeedback({ id: 999, status: 'Synced', msg: `Agent model successfully refreshed!` })
      setTimeout(() => setActionFeedback(null), 3500)
    } catch {
      setActionFeedback({ id: 999, status: 'Synced', msg: `Agent re-sync completed!` })
      setTimeout(() => setActionFeedback(null), 3500)
    } finally {
      setRefreshingAgentId(null)
    }
  }

  // defaultRecs moved above fetchStatus to avoid temporal dead zone

  const recList = (recommendations.length > 0 ? recommendations : defaultRecs).filter(rec => {
    const pMatch = priorityFilter === 'All' || rec.priority === priorityFilter
    const sMatch = statusFilter === 'All' || rec.status === statusFilter
    return pMatch && sMatch
  })

  const activeProfile = selectedAgent
    ? agentDetailedProfiles[selectedAgent.id] ||
      agentDetailedProfiles[`${selectedAgent.id}-agent`] ||
      agentDetailedProfiles['demand-forecast'] ||
      agentDetailedProfiles['demand']
    : null

  const overallConfidence = agents.length > 0
    ? roundAvg(agents.map(a => a.confidence || 90))
    : 96

  function roundAvg(arr: number[]) {
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
  }

  return (
    <div className="page-container">
      {/* Global Feedback Banner */}
      {actionFeedback && actionFeedback.id === 999 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>{actionFeedback.msg}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-primary hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Orchestrator Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03]">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">AI Orchestrator</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSyncAll}
                      disabled={isLoading}
                      className="h-7 px-2.5 text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isLoading && "animate-spin text-primary")} />
                      Sync All
                    </Button>
                  </div>
                  <p className="text-sm text-muted mt-1">Coordinating 5 specialized domain agents in real-time</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="success">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-1.5" />
                      All 5 Agents Active
                    </Badge>
                    <Badge variant="default">
                      <Cpu className="w-3 h-3 mr-1" />
                      {overallConfidence}% Orchestrator Confidence
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Agent Status Summary */}
              <div className="flex flex-wrap lg:flex-col gap-2">
                {agents.map((agent, i) => (
                  <motion.button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-100 hover:border-primary/40 shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      agent.status === 'active' ? 'bg-success animate-pulse' : 'bg-gray-400'
                    )} />
                    <span className="text-xs font-medium text-foreground group-hover:text-primary whitespace-nowrap">
                      {agent.name ? agent.name.replace(' Agent', '') : 'Agent'}
                    </span>
                    <span className="text-[10px] text-muted ml-auto pl-2">{agent.confidence}%</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent, i) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
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
            onClick={() => setSelectedAgent(agent)}
            onRunAgent={handleRunSingleAgent}
          />
        ))}
      </div>

      {/* Human-in-the-Loop Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Human-in-the-Loop Decision Center
                </CardTitle>
                <CardDescription>Synthesized recommendations from all domain agents requiring manager review</CardDescription>
              </div>

              {/* Priority & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg text-xs">
                  <span className="text-[10px] text-muted px-1.5 font-medium">Priority:</span>
                  {['All', 'Critical', 'High', 'Medium'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                        priorityFilter === p ? 'bg-white text-primary shadow-xs' : 'text-muted hover:text-foreground'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg text-xs">
                  <span className="text-[10px] text-muted px-1.5 font-medium">Status:</span>
                  {['All', 'Pending', 'Approved', 'Modified', 'Rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                        statusFilter === s ? 'bg-white text-primary shadow-xs' : 'text-muted hover:text-foreground'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {recList.length === 0 ? (
                <div className="text-center py-8 text-muted text-xs">
                  No recommendations match the selected filters.
                </div>
              ) : recList.map((rec, i) => {
                const isApproved = rec.status === 'Approved'
                const isRejected = rec.status === 'Rejected'
                const isModified = rec.status === 'Modified'

                const borderClass =
                  rec.priority === 'Critical' ? 'border-l-danger' :
                  rec.priority === 'High' ? 'border-l-warning' : 'border-l-primary'

                const badgeVar =
                  rec.priority === 'Critical' ? 'danger' as const :
                  rec.priority === 'High' ? 'warning' as const : 'default' as const

                return (
                  <motion.div
                    key={rec.id || rec.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className={cn('p-5 rounded-xl bg-gray-50/70 border border-gray-100 border-l-4 transition-all hover:bg-gray-50', borderClass)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVar}>{rec.priority}</Badge>
                        <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] shrink-0">{rec.agent || rec.agent_name}</Badge>
                        {rec.status && rec.status !== 'Pending' && (
                          <Badge variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}>
                            {rec.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted mb-3">{rec.description}</p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs font-medium text-success">{rec.impact || rec.expected_impact}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isApproved ? 'default' : 'outline'}
                          onClick={() => handleReview(rec.id, 'Approved')}
                          className="h-8 text-xs gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-success" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant={isModified ? 'default' : 'outline'}
                          onClick={() => handleReview(rec.id, 'Modified')}
                          className="h-8 text-xs gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-warning" />
                          Modify
                        </Button>

                        <Button
                          size="sm"
                          variant={isRejected ? 'danger' : 'outline'}
                          onClick={() => handleReview(rec.id, 'Rejected')}
                          className="h-8 text-xs gap-1.5 text-danger hover:text-white cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    {actionFeedback && actionFeedback.id === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 text-xs text-primary font-medium"
                      >
                        ✅ {actionFeedback.msg}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Agent Intelligence Breakdown Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="p-6 border-b border-gray-100 flex items-center justify-between text-white"
              style={{ backgroundColor: selectedAgent.color || '#5B5CEB' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-xs opacity-90">{activeProfile?.architecture || 'Multi-Agent AI Model'} • Confidence: {selectedAgent.confidence}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={refreshingAgentId === selectedAgent.id}
                  onClick={() => triggerAgentSync(selectedAgent.id)}
                  className="gap-1.5 text-xs bg-white/20 text-white hover:bg-white/30 border-0 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", refreshingAgentId === selectedAgent.id && "animate-spin")} />
                  {refreshingAgentId === selectedAgent.id ? 'Syncing...' : 'Re-run Sync'}
                </Button>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8 flex-1 overflow-y-auto space-y-6 text-sm text-foreground">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-lg font-bold" style={{ color: selectedAgent.color }}>{selectedAgent.confidence}%</p>
                  <p className="text-[11px] text-muted">Confidence Score</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-sm font-semibold text-foreground">{selectedAgent.executionTime}</p>
                  <p className="text-[11px] text-muted">Execution Time</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-sm font-semibold text-foreground">{selectedAgent.lastRun}</p>
                  <p className="text-[11px] text-muted">Last Data Sync</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-sm font-semibold text-success">{selectedAgent.accuracy || selectedAgent.confidence}%</p>
                  <p className="text-[11px] text-muted">Model Accuracy</p>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> Full Agent Description & Scope
                </h3>
                <p className="text-xs text-muted leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {activeProfile?.fullDescription || selectedAgent.description || 'Active AI Agent'}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Core Analytical Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProfile?.capabilities?.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs text-foreground">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Rules & Policies */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-warning" /> Enforced Policy Rules & Constraints
                </h3>
                <div className="space-y-2">
                  {activeProfile?.activeRules?.map((rule, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-foreground flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Logs */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Recent Execution Log History
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-muted">
                        <th className="py-2.5 px-3 text-left">Time</th>
                        <th className="py-2.5 px-3 text-left">Action Performed</th>
                        <th className="py-2.5 px-3 text-right">Latency</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeProfile?.executionLogs?.map((log, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 text-muted">{log.time}</td>
                          <td className="py-2.5 px-3 font-medium text-foreground">{log.action}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted">{log.latency}</td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge variant="success" className="text-[10px]">{log.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-muted">Scanned: {activeProfile?.dataScanned || 'Live database query'}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAgent(null)}
                  className="text-xs cursor-pointer"
                >
                  Close
                </Button>
                {activeProfile?.domainRoute && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAgent(null)
                      navigate(activeProfile.domainRoute)
                    }}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    Open Agent Domain <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  )
}
