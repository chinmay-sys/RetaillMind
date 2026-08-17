import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Download, Calendar, Target, Sparkles, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { forecastAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const initialForecastData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 0, i + 1)
  const base = 150000 + Math.sin(i / 5) * 30000
  return {
    date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    actual: i < 20 ? Math.round(base) : undefined,
    predicted: Math.round(base + 5000),
    upperBound: Math.round(base + 25000),
    lowerBound: Math.round(base - 20000),
  }
})

const festivalImpact = [
  { name: 'Diwali Season', impact: '+45%', period: 'Oct 15 - Nov 15', color: 'text-warning', description: 'Massive surge in retail sales. High demand for home decor & gift sets.' },
  { name: 'Christmas / New Year', impact: '+38%', period: 'Dec 15 - Jan 5', color: 'text-danger', description: 'Holiday shopping spike. Cake stands & tea tins dominate sales.' },
  { name: 'Republic Day Sale', impact: '+22%', period: 'Jan 20 - Jan 28', color: 'text-primary', description: 'Steady increase in stationery & home organizer items.' },
  { name: 'Back to School', impact: '+18%', period: 'Jun 1 - Jun 30', color: 'text-accent', description: 'Craft & paper kit bundles drive bulk customer orders.' },
]

const seasonalData = [
  { season: 'Q1 (Jan-Mar)', avgDemand: 10200, trend: 'stable' as const, confidence: 92 },
  { season: 'Q2 (Apr-Jun)', avgDemand: 11500, trend: 'up' as const, confidence: 89 },
  { season: 'Q3 (Jul-Sep)', avgDemand: 10800, trend: 'stable' as const, confidence: 91 },
  { season: 'Q4 (Oct-Dec)', avgDemand: 14200, trend: 'up' as const, confidence: 95 },
]

import { AgentDomainWidget } from '@/components/shared/AgentDomainWidget'

export default function DemandForecast() {
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null)
  const [forecastData, setForecastData] = useState(initialForecastData)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await forecastAPI.predictions(30)
        const points = Array.isArray(res.data) ? res.data : (res.data?.forecast_points || [])
        if (points && points.length > 0) {
          setForecastData(points)
        }
      } catch {
        // Fallback to initial
      }
    }
    fetchForecast()
  }, [])

  const handleDownloadForecastReport = () => {
    const csvContent = `Date,Predicted Demand (INR),Actual Demand (INR),Lower Bound (INR),Upper Bound (INR)
${forecastData.map(f => `${f.date},${f.predicted},${f.actual || ''},${f.lowerBound},${f.upperBound}`).join('\n')}
`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', '30_Day_Demand_Forecast_Report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadFeedback('Downloaded 30_Day_Demand_Forecast_Report.csv!')
    setTimeout(() => setDownloadFeedback(null), 3000)
  }

  return (
    <div className="page-container space-y-6">
      {/* Agent Domain Widget */}
      <AgentDomainWidget
        agentId="demand"
        agentName="Demand Forecast Agent"
        description="Analyzes historical sales patterns, seasonal trends, and festival impacts using XGBoost with temporal lag features."
        color="#5B5CEB"
        icon={TrendingUp}
        defaultAnalysis="30-day demand forecast updated with high statistical confidence."
        defaultConfidence={94.2}
        defaultOutputs={[
          "XGBoost model retrained on historical transaction points",
          "7-day, 14-day, and 30-day temporal lag features computed",
          "95% confidence interval upper & lower bounds estimation",
          "Flagged SKUs with sudden sales velocity increase"
        ]}
      />

      {downloadFeedback && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-success font-medium bg-success-50 border border-success-200 px-3 py-1.5 rounded-lg shadow-sm mb-2 inline-block">
          ✅ {downloadFeedback}
        </motion.div>
      )}

      {/* Forecast Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Forecast Accuracy', value: '94.2%', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Model Confidence', value: '96%', icon: Sparkles, color: 'text-secondary', bg: 'bg-secondary/10' },
          { title: 'Data Points', value: '24,847', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
          { title: 'Next Update', value: '2h 15m', icon: Calendar, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Forecast Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">30-Day Demand Forecast</CardTitle>
              <CardDescription>Predicted vs actual demand with confidence bands</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadForecastReport} className="cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Download Report
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5CEB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#5B5CEB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.06} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} formatter={(v: number) => [`₹${(v / 1000).toFixed(1)}K`, '']} />
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#confGrad)" name="Upper Bound" />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="transparent" name="Lower Bound" />
                <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} fill="none" name="Actual" dot={{ fill: '#10B981', r: 3 }} />
                <Area type="monotone" dataKey="predicted" stroke="#5B5CEB" strokeWidth={2} strokeDasharray="8 4" fill="url(#predGrad)" name="Predicted" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Festival Impact & Seasonal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Festival Impact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Festival & Event Impact</CardTitle>
              <CardDescription>Projected demand impact from seasonal events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {festivalImpact.map((festival, i) => (
                  <motion.div
                    key={festival.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{festival.name}</h4>
                      <Badge variant="default" className={festival.color}>
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {festival.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted mb-1">{festival.period}</p>
                    <p className="text-xs text-muted/80">{festival.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Seasonal Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seasonal Analysis</CardTitle>
              <CardDescription>Quarterly demand patterns and confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {seasonalData.map((season, i) => (
                  <motion.div
                    key={season.season}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{season.season}</p>
                        <p className="text-xs text-muted">Avg. {season.avgDemand.toLocaleString()} units/month</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={season.trend === 'up' ? 'success' : 'muted'}>
                          {season.trend === 'up' ? '↑ Growing' : '→ Stable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={season.confidence} className="flex-1" />
                      <span className="text-xs font-medium text-foreground w-10 text-right">{season.confidence}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
