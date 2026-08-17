import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Brain, AlertTriangle, CheckCircle2, Package, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/StatCard'
import { salesAPI } from '@/lib/api'
import { DollarSign, ShoppingCart, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialStats = [
  { title: 'Total Revenue', value: '₹4.8M', change: '+12.5%', trend: 'up' as const, icon: DollarSign, description: 'vs last month', color: 'text-primary', bgColor: 'bg-primary/10' },
  { title: 'Total Sales', value: '12,847', change: '+8.2%', trend: 'up' as const, icon: ShoppingCart, description: 'vs last month', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  { title: 'Forecast Accuracy', value: '94%', change: '+2.1%', trend: 'up' as const, icon: Target, description: 'model performance', color: 'text-accent', bgColor: 'bg-accent/10' },
  { title: 'AI Confidence', value: '96%', change: '+1.4%', trend: 'up' as const, icon: Brain, description: 'decision quality', color: 'text-success', bgColor: 'bg-success/10' },
]

const initialChartData = [
  { month: 'Jan', revenue: 3200000, sales: 8420, profit: 960000 },
  { month: 'Feb', revenue: 3500000, sales: 9100, profit: 1050000 },
  { month: 'Mar', revenue: 3800000, sales: 9800, profit: 1140000 },
  { month: 'Apr', revenue: 3600000, sales: 9400, profit: 1080000 },
  { month: 'May', revenue: 4100000, sales: 10600, profit: 1230000 },
  { month: 'Jun', revenue: 4300000, sales: 11200, profit: 1290000 },
]

const inventoryHealthData = [
  { name: 'Healthy', value: 65, color: '#10B981' },
  { name: 'Warning', value: 22, color: '#F59E0B' },
  { name: 'Critical', value: 8, color: '#EF4444' },
  { name: 'Overstock', value: 5, color: '#5B5CEB' },
]

const recentActivity = [
  { id: 1, action: 'AI Agent flagged low stock alert', item: 'Heart Of Wicker Small', time: '2 min ago', type: 'warning', icon: AlertTriangle },
  { id: 2, action: 'Demand forecast updated', item: 'Regency Cakestand', time: '15 min ago', type: 'info', icon: Brain },
  { id: 3, action: 'Price optimization completed', item: 'Retrospot Tea Tins', time: '32 min ago', type: 'success', icon: CheckCircle2 },
  { id: 4, action: 'Supplier delivery confirmed', item: 'Jumbo Bag Red Retrospot', time: '1 hour ago', type: 'success', icon: Package },
]

const quickActions = [
  { label: 'Generate Report', icon: CheckCircle2, color: 'bg-primary/10 text-primary', path: '/app/reports' },
  { label: 'Run Forecast', icon: Brain, color: 'bg-secondary/10 text-secondary', path: '/app/forecast' },
  { label: 'Check Inventory', icon: Package, color: 'bg-accent/10 text-accent', path: '/app/inventory' },
]


export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(initialStats)
  const [chartData, setChartData] = useState(initialChartData)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, trendRes] = await Promise.all([
          salesAPI.analytics(30),
          salesAPI.monthlyTrend(12)
        ])
        if (salesRes.data) {
          const s = salesRes.data
          setStats([
            {
              title: 'Total Revenue',
              value: `₹${(s.total_revenue / 100000).toFixed(1)}L`,
              change: '+12.5%',
              trend: 'up' as const,
              icon: initialStats[0].icon,
              description: 'real database transactions',
              color: 'text-primary',
              bgColor: 'bg-primary/10',
            },
            {
              title: 'Total Sales',
              value: s.total_sales.toLocaleString(),
              change: '+8.2%',
              trend: 'up' as const,
              icon: initialStats[1].icon,
              description: 'real orders processed',
              color: 'text-secondary',
              bgColor: 'bg-secondary/10',
            },
            {
              title: 'Forecast Accuracy',
              value: '94.2%',
              change: '+2.1%',
              trend: 'up' as const,
              icon: initialStats[2].icon,
              description: 'XGBoost model',
              color: 'text-accent',
              bgColor: 'bg-accent/10',
            },
            {
              title: 'AI Confidence',
              value: '96.0%',
              change: '+1.4%',
              trend: 'up' as const,
              icon: initialStats[3].icon,
              description: 'Decision Center score',
              color: 'text-success',
              bgColor: 'bg-success/10',
            },
          ])
        }
        if (trendRes.data && Array.isArray(trendRes.data)) {
          setChartData(trendRes.data)
        }
      } catch {
        // Fallback to initial state
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="page-container">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <p className="text-xs text-muted mt-1">Monthly revenue trend for 2026</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5CEB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#5B5CEB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                    formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#5B5CEB" strokeWidth={2.5} fill="url(#revenueGradient)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2} fill="url(#profitGradient)" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Inventory Health</CardTitle>
              <p className="text-xs text-muted">Current stock distribution</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={inventoryHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {inventoryHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {inventoryHealthData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted">{item.name}</span>
                    <span className="text-xs font-medium text-foreground ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.path && navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                  >
                    <div className={cn('p-2 rounded-lg transition-transform duration-200 group-hover:scale-110', action.color)}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Badge variant="muted">{recentActivity.length} events</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => {
                  const IconComp = activity.icon
                  const iconColor = activity.type === 'warning' ? 'text-warning bg-warning/10' :
                    activity.type === 'success' ? 'text-success bg-success/10' : 'text-primary bg-primary/10'
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className={cn('p-2 rounded-lg shrink-0', iconColor)}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted">{activity.item}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
