import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Users, Clock, Shield, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supplierAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const initialSuppliers = [
  { id: 1, name: 'TechFlow Solutions', category: 'Electronics', reliability: 96.5, leadTime: 3.2, deliveryScore: 98.2, qualityScore: 97.0, onTimeDelivery: 98.2, totalOrders: 12, rank: 1, contact_person: 'Rajiv Mehta' },
  { id: 2, name: 'GlobalChip Industries', category: 'Clothing', reliability: 94.2, leadTime: 4.5, deliveryScore: 96.5, qualityScore: 95.0, onTimeDelivery: 96.5, totalOrders: 8, rank: 2, contact_person: 'Anita Rao' },
  { id: 3, name: 'PrimeParts Trading', category: 'Beauty', reliability: 91.0, leadTime: 4.0, deliveryScore: 93.8, qualityScore: 92.0, onTimeDelivery: 93.8, totalOrders: 5, rank: 3, contact_person: 'Suresh Iyer' },
  { id: 4, name: 'Nexus Components', category: 'Sports', reliability: 89.0, leadTime: 8.0, deliveryScore: 91.2, qualityScore: 90.0, onTimeDelivery: 91.2, totalOrders: 3, rank: 4, contact_person: 'Deepa Nair' },
  { id: 5, name: 'SwiftLogix Supply', category: 'Home', reliability: 87.0, leadTime: 6.0, deliveryScore: 89.5, qualityScore: 88.0, onTimeDelivery: 89.5, totalOrders: 2, rank: 5, contact_person: 'Arjun Patel' },
  { id: 6, name: 'MegaSource Direct', category: 'Books', reliability: 82.0, leadTime: 10.0, deliveryScore: 85.1, qualityScore: 83.0, onTimeDelivery: 85.1, totalOrders: 1, rank: 6, contact_person: 'Kavita Singh' },
]

const supplierLeadTimeData = [
  { month: 'Jan', TechFlow: 3.1, GlobalChip: 4.2, PrimeParts: 4.0 },
  { month: 'Feb', TechFlow: 3.3, GlobalChip: 4.6, PrimeParts: 3.9 },
  { month: 'Mar', TechFlow: 3.0, GlobalChip: 4.4, PrimeParts: 4.1 },
  { month: 'Apr', TechFlow: 3.4, GlobalChip: 4.8, PrimeParts: 4.2 },
  { month: 'May', TechFlow: 3.2, GlobalChip: 4.5, PrimeParts: 4.0 },
]

import { AgentDomainWidget } from '@/components/shared/AgentDomainWidget'

export default function SupplierIntelligence() {
  const [suppliers, setSuppliers] = useState(initialSuppliers)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await supplierAPI.scorecard()
        const list = res.data?.suppliers ?? (Array.isArray(res.data) ? res.data : null)
        if (list && list.length > 0) {
          setSuppliers(list)
        }
      } catch {
        // Fallback to default initialSuppliers
      }
    }
    fetchSuppliers()
  }, [])

  const radarData = [
    { metric: 'Reliability', TechFlow: 96, GlobalChip: 94, PrimeParts: 91 },
    { metric: 'Delivery', TechFlow: 98, GlobalChip: 95, PrimeParts: 93 },
    { metric: 'Cost', TechFlow: 92, GlobalChip: 88, PrimeParts: 95 },
    { metric: 'Quality', TechFlow: 97, GlobalChip: 95, PrimeParts: 92 },
    { metric: 'Lead Time', TechFlow: 90, GlobalChip: 80, PrimeParts: 95 },
  ]

  return (
    <div className="page-container space-y-6">
      {/* Agent Domain Widget */}
      <AgentDomainWidget
        agentId="supplier"
        agentName="Supplier Intelligence Agent"
        description="Scores supplier reliability, tracks delivery lead times, and optimizes procurement vendor distribution."
        color="#EF4444"
        icon={Users}
        defaultAnalysis="Evaluated 6 active suppliers on reliability, quality, and lead time SLA. TechFlow Solutions ranked #1 with 98.2% on-time delivery."
        defaultConfidence={95.1}
        defaultOutputs={[
          "Ranked active suppliers based on Multi-Criteria Scoring (AHP)",
          "Detected lead-time delay risks for tier-2 suppliers",
          "Generated volume order allocation strategies for Q1 restocking"
        ]}
      />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Suppliers', value: '6', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Avg. Lead Time', value: '6.2 days', icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
          { title: 'Avg. Reliability', value: '89.8%', icon: Shield, color: 'text-accent', bg: 'bg-accent/10' },
          { title: 'On-Time Rate', value: '92.4%', icon: Truck, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}><stat.icon className={cn('w-5 h-5', stat.color)} /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Radar & Lead Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supplier Performance Radar</CardTitle>
              <CardDescription>Top 3 suppliers compared across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <PolarRadiusAxis angle={30} domain={[70, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Radar name="TechFlow" dataKey="TechFlow" stroke="#5B5CEB" fill="#5B5CEB" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="GlobalChip" dataKey="GlobalChip" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="PrimeParts" dataKey="PrimeParts" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.1} strokeWidth={2} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Time Trend</CardTitle>
              <CardDescription>Average delivery lead times by supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={supplierLeadTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94A3B8' } }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Line type="monotone" dataKey="TechFlow" stroke="#5B5CEB" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="GlobalChip" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="PrimeParts" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Nexus" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Supplier Rankings Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Rankings</CardTitle>
            <CardDescription>Comprehensive supplier scorecard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Rank</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Supplier</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted">Reliability</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted hidden md:table-cell">Lead Time</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted hidden md:table-cell">Delivery</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted hidden lg:table-cell">Quality</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted hidden lg:table-cell">On-Time</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, i) => {
                    const reliability = Number(s.reliability) || 0
                    const delivery = Number(s.deliveryScore) || Number(s.onTimeDelivery) || 0
                    const quality = Number(s.qualityScore) || 0
                    const overall = ((reliability + delivery + quality) / 3).toFixed(1)
                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-gray-100 text-gray-600' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-muted'
                          )}>
                            {s.rank}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-foreground">{s.name}</p>
                             <p className="text-xs text-muted">{s.totalOrders} orders</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={reliability} className="w-16 h-1.5" />
                             <span className="text-xs font-medium">{reliability}%</span>
                          </div>
                        </td>
                          <td className="py-3 px-3 text-center hidden md:table-cell">
                            <span className="text-sm font-medium text-foreground">{typeof s.leadTime === 'number' ? s.leadTime.toFixed(1) : s.leadTime} days</span>
                         </td>
                         <td className="py-3 px-3 text-center hidden md:table-cell">
                           <span className="text-sm font-medium text-foreground">{delivery}%</span>
                        </td>
                         <td className="py-3 px-3 text-center hidden lg:table-cell">
                           <span className="text-sm font-medium text-foreground">{quality}%</span>
                         </td>
                         <td className="py-3 px-3 text-center hidden lg:table-cell">
                           <span className="text-sm font-medium text-foreground">{delivery}%</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={Number(overall) > 92 ? 'success' : Number(overall) > 88 ? 'warning' : 'danger'}>
                            {overall}%
                          </Badge>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
