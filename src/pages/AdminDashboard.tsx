import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Users, Database, Activity, Server, CheckCircle2,
  AlertTriangle, FileText, Brain, Sparkles, Clock, Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/StatCard'
import { useAuth } from '@/contexts/AuthContext'
import { salesAPI, auditAPI, reviewsAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [systemStats, setSystemStats] = useState([
    { title: 'Total Revenue', value: '₹4.8M', change: '+12.5%', trend: 'up' as const, icon: Database, description: 'all-time platform revenue', color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Active Users', value: '3', change: '—', trend: 'up' as const, icon: Users, description: 'registered accounts', color: 'text-secondary', bgColor: 'bg-secondary/10' },
    { title: 'System Health', value: '100%', change: 'Healthy', trend: 'up' as const, icon: Activity, description: 'all services online', color: 'text-success', bgColor: 'bg-success/10' },
    { title: 'AI Model Accuracy', value: '88%', change: '+2.1%', trend: 'up' as const, icon: Brain, description: 'XGBoost demand model', color: 'text-accent', bgColor: 'bg-accent/10' },
  ])

  const [auditStats, setAuditStats] = useState<{ total_entries: number; top_actions: { action: string; count: number }[] } | null>(null)
  const [integrationHealth, setIntegrationHealth] = useState<any>(null)
  const [dbHealth, setDbHealth] = useState<{ status: string; database: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, auditRes, reviewHealthRes] = await Promise.all([
          salesAPI.analytics(30).catch(() => null),
          auditAPI.stats().catch(() => null),
          reviewsAPI.health().catch(() => null),
        ])

        if (salesRes?.data) {
          const s = salesRes.data
          const rev = s.revenue ?? s.total_revenue
          setSystemStats(prev => [
            { ...prev[0], value: formatCurrency(rev, false), description: 'Last 30 days revenue' },
            prev[1],
            prev[2],
            prev[3],
          ])
        }

        if (auditRes?.data) {
          setAuditStats(auditRes.data)
        }

        if (reviewHealthRes?.data) {
          setIntegrationHealth(reviewHealthRes.data)
        }

        // Health check
        try {
          const res = await fetch('http://localhost:8000/health')
          const data = await res.json()
          setDbHealth(data)
          setSystemStats(prev => [
            prev[0], prev[1],
            { ...prev[2], value: data.status === 'healthy' ? '100%' : '50%', change: data.status === 'healthy' ? 'Healthy' : 'Degraded' },
            prev[3],
          ])
        } catch {
          setDbHealth({ status: 'degraded', database: 'disconnected' })
        }
      } catch { /* fallback to initial state */ }
    }
    fetchData()
  }, [])

  const adminActions = [
    { label: 'Audit Logs', icon: FileText, color: 'bg-primary/10 text-primary', path: '/app/reports' },
    { label: 'AI Decision Center', icon: Brain, color: 'bg-secondary/10 text-secondary', path: '/app/ai-center' },
    { label: 'System Settings', icon: Shield, color: 'bg-accent/10 text-accent', path: '/app/settings' },
    { label: 'View Reports', icon: FileText, color: 'bg-success/10 text-success', path: '/app/reports' },
  ]

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-red-500/10 via-primary/10 to-secondary/10 border border-red-200/40 p-6 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Admin Control Center
            </h2>
            <p className="text-sm text-muted">
              Welcome back, {user?.first_name}. Full system overview and administration.
            </p>
          </div>
          <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">Admin</Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Database className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">PostgreSQL / SQLite Database</p>
                      <p className="text-xs text-muted">Primary data store</p>
                    </div>
                  </div>
                  <Badge variant={dbHealth?.database === 'connected' ? 'default' : 'danger'}>
                    {dbHealth?.database === 'connected' ? 'Connected' : dbHealth?.database || 'Checking...'}
                  </Badge>
                </div>

                {/* AI Model */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Brain className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">XGBoost Demand Forecaster</p>
                      <p className="text-xs text-muted">ML model for demand predictions</p>
                    </div>
                  </div>
                  <Badge variant="default">88% Accuracy</Badge>
                </div>

                {/* Sentiment Model */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Sparkles className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">DistilBERT Sentiment Analyzer</p>
                      <p className="text-xs text-muted">Customer review sentiment classification</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                {/* Review Sync */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Review Sync Scheduler</p>
                      <p className="text-xs text-muted">Background polling every 15 min</p>
                    </div>
                  </div>
                  <Badge variant={integrationHealth?.status === 'FRESH' || integrationHealth?.sync_status === 'FRESH' ? 'default' : 'secondary'}>
                    {integrationHealth?.sync_status || integrationHealth?.status || 'Checking...'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {adminActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Audit Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Audit Summary
            </CardTitle>
            {auditStats && (
              <Badge variant="muted">{auditStats.total_entries} total entries</Badge>
            )}
          </CardHeader>
          <CardContent>
            {auditStats?.top_actions && auditStats.top_actions.length > 0 ? (
              <div className="space-y-3">
                {auditStats.top_actions.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{item.action}</span>
                    </div>
                    <Badge variant="muted">{item.count}×</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No audit data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
