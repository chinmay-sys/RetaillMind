import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  TrendingUp, BarChart3, FileText, MessageSquare,
  Target, Lightbulb, ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/StatCard'
import { useAuth } from '@/contexts/AuthContext'
import { salesAPI, reviewsAPI, reportsAPI, forecastAPI } from '@/lib/api'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

interface DashboardStat {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: any
  description: string
  color: string
  bgColor: string
}

const initialStats: DashboardStat[] = [
  { title: 'Total Revenue', value: '₹2,17,66,827', change: '+12.5%', trend: 'up', icon: BarChart3, description: 'Last 30 days', color: 'text-primary', bgColor: 'bg-primary/10' },
  { title: 'Units Sold', value: '12,847', change: '+8.2%', trend: 'up', icon: Target, description: 'Active orders', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  { title: 'Forecast Accuracy', value: '88.4%', change: '+2.1%', trend: 'up', icon: TrendingUp, description: 'Demand model', color: 'text-accent', bgColor: 'bg-accent/10' },
  { title: 'Avg. Sentiment', value: '85.0%', change: 'Positive', trend: 'up', icon: MessageSquare, description: 'Customer feedback', color: 'text-success', bgColor: 'bg-success/10' },
]

export default function AnalystDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(initialStats)
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number; units: number }[]>([])
  const [reports, setReports] = useState<{ id: number; title: string; report_type: string; status: string }[]>([])
  const [sentimentData, setSentimentData] = useState<{ positive: number; negative: number; neutral: number } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, topRes, reviewRes, reportsRes, forecastRes] = await Promise.all([
          salesAPI.analytics(30).catch(() => null),
          salesAPI.topProducts(5, 90).catch(() => null),
          reviewsAPI.dashboard().catch(() => null),
          reportsAPI.list().catch(() => null),
          forecastAPI.thirtyDay().catch(() => null),
        ])

        if (salesRes?.data) {
          const s = salesRes.data
          const rev = s.revenue ?? s.total_revenue
          const units = s.units_sold ?? s.total_sales
          const revGrowth = s.revenue_growth != null ? `${s.revenue_growth >= 0 ? '+' : ''}${s.revenue_growth}%` : '+12.5%'
          const unitsGrowth = s.units_growth != null ? `${s.units_growth >= 0 ? '+' : ''}${s.units_growth}%` : '+8.2%'

          setStats(prev => [
            {
              ...prev[0],
              value: formatCurrency(rev, false),
              change: revGrowth,
              trend: (s.revenue_growth ?? 0) >= 0 ? 'up' : 'down',
              description: 'Last 30 days revenue'
            },
            {
              ...prev[1],
              value: formatNumber(units),
              change: unitsGrowth,
              trend: (s.units_growth ?? 0) >= 0 ? 'up' : 'down',
              description: 'Units processed'
            },
            prev[2],
            prev[3],
          ])
        }

        if (forecastRes?.data) {
          const fc = forecastRes.data
          const conf = fc.confidence != null ? (fc.confidence > 1 ? fc.confidence : fc.confidence * 100) : null
          if (conf != null && !isNaN(conf)) {
            setStats(prev => [
              prev[0],
              prev[1],
              {
                ...prev[2],
                value: `${conf.toFixed(1)}%`,
                change: '+2.1%',
                trend: 'up',
                description: `${fc.model || 'XGBoost'} model`
              },
              prev[3],
            ])
          }
        }

        if (topRes?.data && Array.isArray(topRes.data)) {
          setTopProducts(topRes.data.slice(0, 5).map((p: any) => ({
            name: (p.product_name || p.name || 'Product').substring(0, 22),
            revenue: p.total_revenue || p.revenue || 0,
            units: p.total_quantity || p.units_sold || 0,
          })))
        }

        if (reviewRes?.data) {
          const d = reviewRes.data
          const totalReviews = d.total_reviews ?? (d.positive_count != null ? (d.positive_count + (d.negative_count || 0) + (d.neutral_count || 0)) : null)
          const positivePct = d.positive_pct != null ? Number(d.positive_pct) : (d.positive_percentage != null ? Number(d.positive_percentage) : (d.positive_count != null && totalReviews ? (d.positive_count / totalReviews) * 100 : null))
          const negativePct = d.negative_pct != null ? Number(d.negative_pct) : (d.negative_percentage != null ? Number(d.negative_percentage) : (d.negative_count != null && totalReviews ? (d.negative_count / totalReviews) * 100 : 0))
          const neutralPct = d.neutral_pct != null ? Number(d.neutral_pct) : (d.neutral_percentage != null ? Number(d.neutral_percentage) : (d.neutral_count != null && totalReviews ? (d.neutral_count / totalReviews) * 100 : 0))

          if (totalReviews != null && totalReviews > 0 && positivePct != null && !isNaN(positivePct)) {
            setSentimentData({
              positive: Number(positivePct.toFixed(1)),
              negative: Number(negativePct.toFixed(1)),
              neutral: Number(neutralPct.toFixed(1))
            })
            setStats(prev => [
              prev[0],
              prev[1],
              prev[2],
              {
                ...prev[3],
                value: `${positivePct.toFixed(1)}%`,
                change: `${totalReviews} reviews`,
                trend: positivePct >= 50 ? 'up' : 'down',
                description: 'Customer sentiment'
              },
            ])
          } else if (totalReviews === 0) {
            setSentimentData(null)
            setStats(prev => [
              prev[0],
              prev[1],
              prev[2],
              {
                ...prev[3],
                value: 'No review data',
                change: '0 reviews',
                trend: 'up',
                description: 'Customer sentiment'
              },
            ])
          }
        }

        if (reportsRes?.data?.reports) {
          setReports(reportsRes.data.reports.slice(0, 5))
        }
      } catch { /* graceful fallback */ }
    }
    fetchData()
  }, [])

  const quickActions = [
    { label: 'Sales Analytics', icon: BarChart3, color: 'bg-primary/10 text-primary', path: '/app/analytics' },
    { label: 'Demand Forecast', icon: TrendingUp, color: 'bg-accent/10 text-accent', path: '/app/forecast' },
    { label: 'View Reports', icon: FileText, color: 'bg-secondary/10 text-secondary', path: '/app/reports' },
    { label: 'Customer Feedback', icon: MessageSquare, color: 'bg-success/10 text-success', path: '/app/customer-reviews' },
  ]

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-200/40 p-6 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Analyst Intelligence Hub
            </h2>
            <p className="text-sm text-muted">
              Welcome back, {user?.first_name || 'Analyst'}. Revenue performance, demand analytics, and business insights.
            </p>
          </div>
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200">Analyst</Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Top Performing Products by Revenue
              </CardTitle>
              <p className="text-xs text-muted">Last 90 days aggregated performance</p>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => formatCurrency(v, true)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                      formatter={(value: any) => [formatCurrency(Number(value), false), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#5B5CEB" radius={[0, 8, 8, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm text-muted">
                  Loading top products...
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analytics Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                  >
                    <div className={cn('p-2 rounded-lg transition-transform duration-200 group-hover:scale-110', action.color)}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Breakdown */}
          {sentimentData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted uppercase tracking-wider">Customer Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted">Positive Reviews</span>
                  </div>
                  <span className="font-semibold text-foreground">{sentimentData.positive}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-muted">Neutral Feedback</span>
                  </div>
                  <span className="font-semibold text-foreground">{sentimentData.neutral}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-muted">Negative Alerts</span>
                  </div>
                  <span className="font-semibold text-foreground">{sentimentData.negative}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Generated Business Reports
            </CardTitle>
            <button
              onClick={() => navigate('/app/reports')}
              className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer font-medium"
            >
              View all reports <ArrowUpRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-2.5">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{report.title}</p>
                        <p className="text-xs text-muted">{report.report_type}</p>
                      </div>
                    </div>
                    <Badge variant={report.status === 'Ready' ? 'default' : 'muted'}>{report.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No reports generated yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
