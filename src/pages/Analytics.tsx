import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salesAPI } from '@/lib/api'

const defaultMarginData = [
  { month: 'Jan', revenue: 3200000, cost: 2240000, profit: 960000, margin: 30 },
  { month: 'Feb', revenue: 3500000, cost: 2450000, profit: 1050000, margin: 30 },
  { month: 'Mar', revenue: 3800000, cost: 2660000, profit: 1140000, margin: 30 },
  { month: 'Apr', revenue: 3600000, cost: 2520000, profit: 1080000, margin: 30 },
  { month: 'May', revenue: 4100000, cost: 2870000, profit: 1230000, margin: 30 },
  { month: 'Jun', revenue: 4300000, cost: 2924000, profit: 1376000, margin: 32 },
  { month: 'Jul', revenue: 3900000, cost: 2652000, profit: 1248000, margin: 32 },
  { month: 'Aug', revenue: 4200000, cost: 2856000, profit: 1344000, margin: 32 },
  { month: 'Sep', revenue: 4500000, cost: 3015000, profit: 1485000, margin: 33 },
  { month: 'Oct', revenue: 4700000, cost: 3149000, profit: 1551000, margin: 33 },
  { month: 'Nov', revenue: 4600000, cost: 3036000, profit: 1564000, margin: 34 },
  { month: 'Dec', revenue: 4800000, cost: 3120000, profit: 1680000, margin: 35 },
]

const defaultTopProducts = [
  { name: 'White Hanging Heart T-Light Holder', sales: 2847, revenue: 1423500, growth: 15.2 },
  { name: 'Regency Cakestand 3 Tier', sales: 1890, revenue: 1215000, growth: 28.4 },
  { name: 'Jumbo Bag Red Retrospot', sales: 1420, revenue: 923000, growth: 19.1 },
  { name: 'Set 3 Retrospot Tea Tins', sales: 850, revenue: 849900, growth: 16.5 },
  { name: 'Assorted Colour Bird Ornament', sales: 4521, revenue: 678150, growth: 22.8 },
]

const defaultCategoryData = [
  { name: 'Home & Decor', value: 35, revenue: 2400000, color: '#5B5CEB' },
  { name: 'Kitchen & Dining', value: 28, revenue: 1900000, color: '#7C3AED' },
  { name: 'Storage & Organizers', value: 20, revenue: 1400000, color: '#14B8A6' },
  { name: 'Stationery & Craft', value: 17, revenue: 1100000, color: '#EF4444' },
]

const defaultStoreData = [
  { store: 'Mumbai Central', revenue: 1250000, sales: 3240, customers: 1870 },
  { store: 'Delhi NCR', revenue: 1180000, sales: 3050, customers: 1650 },
  { store: 'Bangalore Tech', revenue: 980000, sales: 2680, customers: 1420 },
  { store: 'Hyderabad Hub', revenue: 870000, sales: 2310, customers: 1280 },
]

// Full 12-month chart data
const profitMarginData = defaultMarginData
const revenueChartData = [
  { month: 'Jan', sales: 1240, revenue: 3200000 },
  { month: 'Feb', sales: 1380, revenue: 3500000 },
  { month: 'Mar', sales: 1520, revenue: 3800000 },
  { month: 'Apr', sales: 1430, revenue: 3600000 },
  { month: 'May', sales: 1680, revenue: 4100000 },
  { month: 'Jun', sales: 1750, revenue: 4300000 },
  { month: 'Jul', sales: 1590, revenue: 3900000 },
  { month: 'Aug', sales: 1700, revenue: 4200000 },
  { month: 'Sep', sales: 1820, revenue: 4500000 },
  { month: 'Oct', sales: 1910, revenue: 4700000 },
  { month: 'Nov', sales: 1870, revenue: 4600000 },
  { month: 'Dec', sales: 1950, revenue: 4800000 },
]

const last7DaysMarginData = [
  { month: 'Mon', revenue: 148000, cost: 103600, profit: 44400, margin: 30 },
  { month: 'Tue', revenue: 162000, cost: 113400, profit: 48600, margin: 30 },
  { month: 'Wed', revenue: 175000, cost: 122500, profit: 52500, margin: 30 },
  { month: 'Thu', revenue: 158000, cost: 110600, profit: 47400, margin: 30 },
  { month: 'Fri', revenue: 192000, cost: 130560, profit: 61440, margin: 32 },
  { month: 'Sat', revenue: 221000, cost: 150280, profit: 70720, margin: 32 },
  { month: 'Sun', revenue: 184000, cost: 125120, profit: 58880, margin: 32 },
]
const last30DaysMarginData = [
  { month: 'W1', revenue: 980000, cost: 686000, profit: 294000, margin: 30 },
  { month: 'W2', revenue: 1050000, cost: 735000, profit: 315000, margin: 30 },
  { month: 'W3', revenue: 1120000, cost: 784000, profit: 336000, margin: 30 },
  { month: 'W4', revenue: 1150000, cost: 805000, profit: 345000, margin: 30 },
]
const last7DaysSalesData = [
  { month: 'Mon', sales: 420, revenue: 148000 },
  { month: 'Tue', sales: 480, revenue: 162000 },
  { month: 'Wed', sales: 510, revenue: 175000 },
  { month: 'Thu', sales: 460, revenue: 158000 },
  { month: 'Fri', sales: 580, revenue: 192000 },
  { month: 'Sat', sales: 670, revenue: 221000 },
  { month: 'Sun', sales: 540, revenue: 184000 },
]
const last30DaysSalesData = [
  { month: 'W1', sales: 2800, revenue: 980000 },
  { month: 'W2', sales: 3100, revenue: 1050000 },
  { month: 'W3', sales: 3350, revenue: 1120000 },
  { month: 'W4', sales: 3450, revenue: 1150000 },
]
const customerGrowthData = [
  { month: 'Jan', newCustomers: 420, returning: 820 },
  { month: 'Feb', newCustomers: 480, returning: 900 },
  { month: 'Mar', newCustomers: 510, returning: 960 },
  { month: 'Apr', newCustomers: 490, returning: 940 },
  { month: 'May', newCustomers: 560, returning: 1040 },
  { month: 'Jun', newCustomers: 610, returning: 1090 },
  { month: 'Jul', newCustomers: 570, returning: 1010 },
  { month: 'Aug', newCustomers: 620, returning: 1080 },
  { month: 'Sep', newCustomers: 680, returning: 1140 },
  { month: 'Oct', newCustomers: 720, returning: 1190 },
  { month: 'Nov', newCustomers: 700, returning: 1160 },
  { month: 'Dec', newCustomers: 750, returning: 1210 },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('12m')
  const [category, setCategory] = useState('all')
  const [store, setStore] = useState('all')

  const [topProducts, setTopProducts] = useState(defaultTopProducts)
  const [categoryData, setCategoryData] = useState(defaultCategoryData)
  const [storeComparisonData, setStoreComparisonData] = useState(defaultStoreData)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [tpRes, catRes, storeRes] = await Promise.all([
          salesAPI.topProducts(10),
          salesAPI.byCategory(90),
          salesAPI.byStore(90)
        ])
        if (tpRes.data && Array.isArray(tpRes.data) && tpRes.data.length > 0) {
          setTopProducts(tpRes.data)
        }
        if (catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategoryData(catRes.data)
        }
        if (storeRes.data && Array.isArray(storeRes.data) && storeRes.data.length > 0) {
          setStoreComparisonData(storeRes.data)
        }
      } catch {
        // Fallback to default
      }
    }
    fetchAnalytics()
  }, [])


  const storeMultiplier = store === 'mumbai' ? 0.35 : store === 'delhi' ? 0.32 : store === 'bangalore' ? 0.28 : 1.0

  const rawMarginData = timeRange === '7d' ? last7DaysMarginData :
                        timeRange === '30d' ? last30DaysMarginData :
                        timeRange === '3m' ? profitMarginData.slice(-3) :
                        profitMarginData

  const rawSalesData = timeRange === '7d' ? last7DaysSalesData :
                       timeRange === '30d' ? last30DaysSalesData :
                       timeRange === '3m' ? revenueChartData.slice(-3) :
                       revenueChartData

  const filteredMarginData = rawMarginData.map(d => ({
    ...d,
    revenue: Math.round(d.revenue * storeMultiplier),
    cost: Math.round(d.cost * storeMultiplier),
    profit: Math.round(d.profit * storeMultiplier),
  }))

  const filteredSalesData = rawSalesData.map(d => ({
    ...d,
    sales: Math.round(d.sales * storeMultiplier),
    revenue: Math.round(d.revenue * storeMultiplier),
  }))

  const filteredProducts = topProducts.filter(p => {
    if (category === 'all') return true
    if (category === 'laptops') return p.name.includes('Laptop') || p.name.includes('Monitor')
    if (category === 'peripherals') return p.name.includes('Keyboard') || p.name.includes('Mouse') || p.name.includes('SSD') || p.name.includes('Hub') || p.name.includes('Chair') || p.name.includes('Lamp')
    if (category === 'audio') return p.name.includes('Headset') || p.name.includes('Webcam')
    return true
  }).map(p => ({
    ...p,
    revenue: Math.round(p.revenue * storeMultiplier),
  }))

  const maxProductRevenue = filteredProducts.length > 0 ? Math.max(...filteredProducts.map(p => p.revenue)) : 1

  return (
    <div className="page-container">
      {/* Filters Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Time Range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="laptops">Laptops & PCs</SelectItem>
            <SelectItem value="peripherals">Peripherals</SelectItem>
            <SelectItem value="audio">Audio & Video</SelectItem>
          </SelectContent>
        </Select>
        <Select value={store} onValueChange={setStore}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Store" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            <SelectItem value="mumbai">Mumbai Central</SelectItem>
            <SelectItem value="delhi">Delhi NCR</SelectItem>
            <SelectItem value="bangalore">Bangalore Tech</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Revenue & Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue & Profit Trend</CardTitle>
              <p className="text-xs text-muted">
                {timeRange === '7d' ? 'Daily breakdown (Last 7 Days)' :
                 timeRange === '30d' ? 'Period breakdown (Last 30 Days)' :
                 timeRange === '3m' ? 'Quarterly breakdown (Last 3 Months)' :
                 'Monthly breakdown with margin analysis'}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={filteredMarginData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5CEB" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#5B5CEB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `₹${(v / 1000000).toFixed(1)}M` : `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} formatter={(v: number) => [v >= 1000000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`, '']} />
                  <Area type="monotone" dataKey="revenue" stroke="#5B5CEB" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fill="url(#profGrad)" name="Profit" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales Trend</CardTitle>
              <p className="text-xs text-muted">
                {timeRange === '7d' ? 'Daily sales volume (Last 7 Days)' :
                 timeRange === '30d' ? 'Period sales volume (Last 30 Days)' :
                 'Monthly unit sales volume'}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="sales" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredProducts.slice(0, 8).map((product, i) => (
                  <div key={product.name} className="flex items-center gap-3 group">
                    <span className="text-xs text-muted w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                        <span className="text-sm font-semibold text-foreground">₹{(product.revenue / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(product.revenue / maxProductRevenue) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>
                    <Badge variant={product.growth > 0 ? 'success' : 'danger'} className="shrink-0">
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted flex-1">{cat.name}</span>
                    <span className="text-xs font-medium text-foreground">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Store Comparison & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Comparison</CardTitle>
              <p className="text-xs text-muted">Revenue by store location</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={storeComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="store" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, '']} />
                  <Bar dataKey="revenue" fill="#5B5CEB" radius={[0, 6, 6, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Growth</CardTitle>
              <p className="text-xs text-muted">New vs returning customers</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={customerGrowthData}>
                  <defs>
                    <linearGradient id="newCust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="retCust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Area type="monotone" dataKey="returning" stackId="1" stroke="#14B8A6" fill="url(#retCust)" name="Returning" />
                  <Area type="monotone" dataKey="newCustomers" stackId="1" stroke="#7C3AED" fill="url(#newCust)" name="New" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
