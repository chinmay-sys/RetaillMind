import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Tag, Percent, AlertTriangle, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { pricingSuggestions as initialSuggestions, discountRecommendations as initialDiscounts } from '@/data/mockData'
import { cn } from '@/lib/utils'

export default function PricingIntelligence() {
  const [suggestions, setSuggestions] = useState(
    initialSuggestions.map(s => ({ ...s, applied: false }))
  )
  const [discounts, setDiscounts] = useState(
    initialDiscounts.map(d => ({ ...d, applied: false }))
  )
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleApplyPrice = (id: number, product: string, newPrice: number, newMargin: number) => {
    setSuggestions(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              currentPrice: newPrice,
              margin: newMargin,
              applied: true,
            }
          : item
      )
    )
    setFeedback(`Applied new price ₹${newPrice.toLocaleString()} to ${product}!`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleApplyDiscount = (productName: string, newPrice: number) => {
    setDiscounts(prev =>
      prev.map(d => d.product === productName ? { ...d, applied: true } : d)
    )
    setFeedback(`Applied discount price ₹${newPrice.toLocaleString()} to ${productName}!`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const pendingCount = suggestions.filter(s => !s.applied).length

  const marginData = suggestions.map(p => ({
    name: p.product.split(' ').slice(0, 2).join(' '),
    current: p.margin,
    suggested: p.suggestedMargin,
  }))

  return (
    <div className="page-container">
      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-success-50 border border-success-200 text-success rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span>{feedback}</span>
          </div>
          <span className="text-xs font-normal text-muted">Updated in real-time</span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Avg. Margin', value: '31.2%', icon: Percent, color: 'text-primary', bg: 'bg-primary/10', change: '+2.1%' },
          { title: 'Price Suggestions', value: String(pendingCount), icon: Tag, color: 'text-secondary', bg: 'bg-secondary/10', change: pendingCount > 0 ? 'Pending' : 'All Applied' },
          { title: 'Revenue Impact', value: '+₹4.2L', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', change: 'Projected' },
          { title: 'Competitor Alerts', value: '3', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', change: 'Active' },
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

      {/* Pricing Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Price Suggestions</CardTitle>
            <CardDescription>Optimized pricing based on demand elasticity and competitor analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Product</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted">Current</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted">Suggested</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted hidden md:table-cell">Competitor</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted hidden lg:table-cell">Margin</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted">Impact</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted">Confidence</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((item, i) => {
                    const priceDown = item.suggestedPrice < item.currentPrice
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-medium text-foreground">{item.product}</td>
                        <td className="py-3 px-3 text-right text-muted">
                          {item.applied ? (
                            <span className="line-through text-gray-400">₹{(item.currentPrice * 1.05).toFixed(0)}</span>
                          ) : (
                            `₹${item.currentPrice.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={cn('font-semibold', priceDown ? 'text-danger' : 'text-success')}>
                            ₹{item.suggestedPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-muted hidden md:table-cell">₹{item.competitorPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right hidden lg:table-cell">
                          <span className="text-foreground">{item.suggestedMargin}%</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="success" className="text-[10px]">
                            {priceDown ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                            {item.impact}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={item.confidence} className="w-16 h-1.5" />
                            <span className="text-xs font-medium text-foreground">{item.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.applied ? (
                            <Badge variant="success" className="h-7 px-3 text-xs gap-1">
                              <Check className="w-3 h-3" /> Applied
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyPrice(item.id, item.product, item.suggestedPrice, item.suggestedMargin)}
                              className="h-7 text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            >
                              Apply
                            </Button>
                          )}
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

      {/* Margin Chart & Discount Recs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profit Margin Comparison</CardTitle>
              <CardDescription>Current vs AI-suggested margins</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={marginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="current" name="Current Margin" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suggested" name="Suggested Margin" fill="#5B5CEB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discount Recommendations</CardTitle>
              <CardDescription>AI-driven discount strategies for maximum impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discounts.map((rec, i) => (
                  <motion.div
                    key={rec.product}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">{rec.product}</h4>
                        <Badge variant={rec.urgency === 'high' ? 'danger' : rec.urgency === 'medium' ? 'warning' : 'muted'}>
                          {rec.urgency} priority
                        </Badge>
                      </div>
                      <p className="text-xs text-muted mb-2">{rec.reason}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted line-through">₹{rec.currentPrice.toLocaleString()}</span>
                        <span className="font-semibold text-success">₹{rec.newPrice.toLocaleString()}</span>
                        <Badge variant="danger" className="text-[10px]">-{rec.discountPercent}%</Badge>
                      </div>
                      <p className="text-xs text-muted mt-2">{rec.expectedImpact}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                      {rec.applied ? (
                        <Badge variant="success" className="h-7 px-3 text-xs gap-1">
                          <Check className="w-3 h-3" /> Discount Live
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyDiscount(rec.product, rec.newPrice)}
                          className="h-7 text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          Apply Discount
                        </Button>
                      )}
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

