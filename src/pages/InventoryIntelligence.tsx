import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, CheckCircle2, Search, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { inventoryItems, inventoryStats } from '@/data/mockData'
import { cn } from '@/lib/utils'

const statusConfig = {
  healthy: { label: 'Healthy', color: 'bg-success/10 text-success', dot: 'bg-success' },
  warning: { label: 'Warning', color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  critical: { label: 'Critical', color: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  overstock: { label: 'Overstock', color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
}

export default function InventoryIntelligence() {
  const [search, setSearch] = useState('')
  const filtered = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  const stockComparisonData = inventoryItems.slice(0, 8).map(item => ({
    name: item.name.split(' ').slice(0, 2).join(' '),
    current: item.currentStock,
    safety: item.safetyStock,
    reorder: item.reorderPoint,
  }))

  return (
    <div className="page-container">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stock Comparison Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock vs Safety Level Comparison</CardTitle>
            <CardDescription>Current stock compared to safety stock and reorder points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="current" name="Current Stock" fill="#5B5CEB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safety" name="Safety Stock" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorder" name="Reorder Point" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Product Inventory</CardTitle>
              <CardDescription>Real-time stock levels across all products</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search products..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Product</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">SKU</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted hidden md:table-cell">Category</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted">Stock</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted hidden lg:table-cell">Safety</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted hidden lg:table-cell">Reorder</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Health</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const config = statusConfig[item.status]
                    const healthPercent = Math.min(100, (item.currentStock / item.maxStock) * 100)
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-medium text-foreground">{item.name}</td>
                        <td className="py-3 px-3 text-muted font-mono text-xs">{item.sku}</td>
                        <td className="py-3 px-3 text-muted hidden md:table-cell">{item.category}</td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground">{item.currentStock}</td>
                        <td className="py-3 px-3 text-right text-muted hidden lg:table-cell">{item.safetyStock}</td>
                        <td className="py-3 px-3 text-right text-muted hidden lg:table-cell">{item.reorderPoint}</td>
                        <td className="py-3 px-3">
                          <div className="w-20">
                            <Progress
                              value={healthPercent}
                              className="h-1.5"
                              indicatorClassName={cn(
                                item.status === 'healthy' ? 'bg-success' :
                                item.status === 'warning' ? 'bg-warning' :
                                item.status === 'critical' ? 'bg-danger' : 'bg-primary'
                              )}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', config.dot)} />
                            {config.label}
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
