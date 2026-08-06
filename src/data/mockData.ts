import { 
  TrendingUp, TrendingDown, Package, ShoppingCart, Brain, 
  Target, BarChart3, DollarSign, Users, Zap, AlertTriangle,
  CheckCircle2, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

// ============ DASHBOARD DATA ============
export const dashboardStats = [
  {
    title: 'Total Revenue',
    value: '₹4.8M',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    description: 'vs last month',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Total Sales',
    value: '12,847',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    description: 'vs last month',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: 'Forecast Accuracy',
    value: '94%',
    change: '+2.1%',
    trend: 'up' as const,
    icon: Target,
    description: 'model performance',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    title: 'AI Confidence',
    value: '96%',
    change: '+1.4%',
    trend: 'up' as const,
    icon: Brain,
    description: 'decision quality',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
]

export const revenueChartData = [
  { month: 'Jan', revenue: 3200000, sales: 8420, profit: 960000 },
  { month: 'Feb', revenue: 3500000, sales: 9100, profit: 1050000 },
  { month: 'Mar', revenue: 3800000, sales: 9800, profit: 1140000 },
  { month: 'Apr', revenue: 3600000, sales: 9400, profit: 1080000 },
  { month: 'May', revenue: 4100000, sales: 10600, profit: 1230000 },
  { month: 'Jun', revenue: 4300000, sales: 11200, profit: 1290000 },
  { month: 'Jul', revenue: 3900000, sales: 10100, profit: 1170000 },
  { month: 'Aug', revenue: 4200000, sales: 10900, profit: 1260000 },
  { month: 'Sep', revenue: 4500000, sales: 11700, profit: 1350000 },
  { month: 'Oct', revenue: 4700000, sales: 12200, profit: 1410000 },
  { month: 'Nov', revenue: 4600000, sales: 11900, profit: 1380000 },
  { month: 'Dec', revenue: 4800000, sales: 12847, profit: 1440000 },
]

export const inventoryHealthData = [
  { name: 'Healthy', value: 65, color: '#10B981' },
  { name: 'Warning', value: 22, color: '#F59E0B' },
  { name: 'Critical', value: 8, color: '#EF4444' },
  { name: 'Overstock', value: 5, color: '#5B5CEB' },
]

export const recentActivity = [
  { id: 1, action: 'AI Agent flagged low stock alert', item: 'Wireless Mouse', time: '2 min ago', type: 'warning', icon: AlertTriangle },
  { id: 2, action: 'Demand forecast updated', item: 'Gaming Laptop', time: '15 min ago', type: 'info', icon: Brain },
  { id: 3, action: 'Price optimization completed', item: 'Mechanical Keyboard', time: '32 min ago', type: 'success', icon: CheckCircle2 },
  { id: 4, action: 'Supplier delivery confirmed', item: 'USB-C Hub', time: '1 hour ago', type: 'success', icon: Package },
  { id: 5, action: 'New reorder point calculated', item: 'Webcam HD Pro', time: '2 hours ago', type: 'info', icon: Target },
  { id: 6, action: 'Revenue milestone reached', item: '₹4.8M monthly', time: '3 hours ago', type: 'success', icon: TrendingUp },
]

export const quickActions = [
  { label: 'Generate Report', icon: BarChart3, color: 'bg-primary/10 text-primary', path: '/app/reports' },
  { label: 'Run Forecast', icon: Brain, color: 'bg-secondary/10 text-secondary', path: '/app/forecast' },
  { label: 'Check Inventory', icon: Package, color: 'bg-accent/10 text-accent', path: '/app/inventory' },
  { label: 'View Insights', icon: Zap, color: 'bg-warning/10 text-warning', path: '/app/ai-center' },
]

export const notifications = [
  { id: 1, title: 'Low Stock Alert', message: 'Wireless Mouse stock below safety level (23 units)', time: '2 min ago', read: false, type: 'warning' },
  { id: 2, title: 'Forecast Updated', message: 'Q1 2026 demand forecast ready for review', time: '15 min ago', read: false, type: 'info' },
  { id: 3, title: 'Price Alert', message: 'Competitor price drop detected for Gaming Laptop', time: '1 hour ago', read: true, type: 'danger' },
  { id: 4, title: 'Delivery Confirmed', message: 'TechFlow Solutions shipment arrived at warehouse', time: '2 hours ago', read: true, type: 'success' },
]

// ============ ANALYTICS DATA ============
export const topProducts = [
  { name: 'Gaming Laptop Pro X1', sales: 2847, revenue: 1423500, growth: 15.2 },
  { name: 'Smartphone Pro Max 5G', sales: 1890, revenue: 1215000, growth: 28.4 },
  { name: 'Ultrabook Slim 14"', sales: 1420, revenue: 923000, growth: 19.1 },
  { name: 'Curved Gaming Monitor 34"', sales: 850, revenue: 849900, growth: 16.5 },
  { name: 'Mechanical Keyboard RGB', sales: 4521, revenue: 678150, growth: 22.8 },
  { name: '27" 4K Monitor', sales: 1567, revenue: 627800, growth: 12.1 },
  { name: 'Wireless Mouse Elite', sales: 6234, revenue: 561060, growth: -3.4 },
  { name: 'ANC Earbuds Pro', sales: 3890, revenue: 466800, growth: 24.1 },
  { name: 'USB-C Hub Ultra', sales: 3156, revenue: 473400, growth: 18.9 },
  { name: 'Ergonomic Chair Pro', sales: 945, revenue: 472500, growth: 31.2 },
  { name: 'Webcam HD Pro 4K', sales: 2890, revenue: 433500, growth: 8.7 },
  { name: 'Noise Canceling Headset', sales: 3421, revenue: 410520, growth: 25.3 },
  { name: 'Smart Watch Ultra GPS', sales: 1980, revenue: 376200, growth: 17.8 },
  { name: 'Portable SSD 1TB', sales: 2789, revenue: 334680, growth: 9.6 },
  { name: 'Desk Lamp Smart LED', sales: 4123, revenue: 247380, growth: 14.5 },
]

export const categoryData = [
  { name: 'Laptops & PCs', value: 32, revenue: 2100000, color: '#5B5CEB' },
  { name: 'Peripherals', value: 28, revenue: 1800000, color: '#7C3AED' },
  { name: 'Audio & Video', value: 18, revenue: 1200000, color: '#14B8A6' },
  { name: 'Storage', value: 12, revenue: 780000, color: '#F59E0B' },
  { name: 'Furniture', value: 10, revenue: 650000, color: '#EF4444' },
]

export const customerGrowthData = [
  { month: 'Jan', newCustomers: 420, returning: 1850, total: 2270 },
  { month: 'Feb', newCustomers: 480, returning: 1920, total: 2400 },
  { month: 'Mar', newCustomers: 530, returning: 2010, total: 2540 },
  { month: 'Apr', newCustomers: 490, returning: 2080, total: 2570 },
  { month: 'May', newCustomers: 560, returning: 2150, total: 2710 },
  { month: 'Jun', newCustomers: 610, returning: 2230, total: 2840 },
  { month: 'Jul', newCustomers: 580, returning: 2190, total: 2770 },
  { month: 'Aug', newCustomers: 640, returning: 2310, total: 2950 },
  { month: 'Sep', newCustomers: 710, returning: 2420, total: 3130 },
  { month: 'Oct', newCustomers: 680, returning: 2500, total: 3180 },
  { month: 'Nov', newCustomers: 730, returning: 2580, total: 3310 },
  { month: 'Dec', newCustomers: 790, returning: 2670, total: 3460 },
]

export const storeComparisonData = [
  { store: 'Mumbai Central', revenue: 1250000, sales: 3240, customers: 1870 },
  { store: 'Delhi NCR', revenue: 1180000, sales: 3050, customers: 1650 },
  { store: 'Bangalore Tech', revenue: 980000, sales: 2680, customers: 1420 },
  { store: 'Hyderabad Hub', revenue: 870000, sales: 2310, customers: 1280 },
  { store: 'Pune Digital', revenue: 720000, sales: 1890, customers: 1050 },
]

export const profitMarginData = [
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

// ============ FORECAST DATA ============
export const forecastData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 0, i + 1)
  const base = 150000 + Math.sin(i / 5) * 30000 + Math.random() * 15000
  return {
    date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    actual: i < 20 ? Math.round(base) : undefined,
    predicted: Math.round(base + (Math.random() - 0.3) * 10000),
    upperBound: Math.round(base + 25000),
    lowerBound: Math.round(base - 20000),
  }
})

export const festivalImpact = [
  { name: 'Diwali Season', impact: '+45%', period: 'Oct 15 - Nov 15', color: 'text-warning', description: 'Massive surge in electronics & gifts. Gaming laptops see 3x demand.' },
  { name: 'Christmas / New Year', impact: '+38%', period: 'Dec 15 - Jan 5', color: 'text-danger', description: 'Premium product demand spike. High-end peripherals dominate.' },
  { name: 'Republic Day Sale', impact: '+22%', period: 'Jan 20 - Jan 28', color: 'text-primary', description: 'Steady increase in office equipment & productivity tools.' },
  { name: 'Back to School', impact: '+18%', period: 'Jun 1 - Jun 30', color: 'text-accent', description: 'Laptop & accessory bundles drive bulk orders.' },
]

export const seasonalData = [
  { season: 'Q1 (Jan-Mar)', avgDemand: 10200, trend: 'stable' as const, confidence: 92 },
  { season: 'Q2 (Apr-Jun)', avgDemand: 11500, trend: 'up' as const, confidence: 89 },
  { season: 'Q3 (Jul-Sep)', avgDemand: 10800, trend: 'stable' as const, confidence: 91 },
  { season: 'Q4 (Oct-Dec)', avgDemand: 14200, trend: 'up' as const, confidence: 95 },
]

// ============ INVENTORY DATA ============
export const inventoryItems = [
  { id: 1, name: 'Gaming Laptop Pro X1', sku: 'GLP-X1-001', category: 'Laptops', currentStock: 145, safetyStock: 50, reorderPoint: 80, maxStock: 300, price: 89999, status: 'healthy' as const, lastRestocked: '2026-01-15' },
  { id: 2, name: 'Mechanical Keyboard RGB', sku: 'MKB-RGB-002', category: 'Peripherals', currentStock: 312, safetyStock: 100, reorderPoint: 150, maxStock: 500, price: 4999, status: 'healthy' as const, lastRestocked: '2026-01-18' },
  { id: 3, name: 'Wireless Mouse Elite', sku: 'WME-003', category: 'Peripherals', currentStock: 23, safetyStock: 80, reorderPoint: 120, maxStock: 400, price: 2499, status: 'critical' as const, lastRestocked: '2026-01-02' },
  { id: 4, name: 'USB-C Hub Ultra', sku: 'UCH-004', category: 'Accessories', currentStock: 89, safetyStock: 60, reorderPoint: 90, maxStock: 250, price: 3499, status: 'warning' as const, lastRestocked: '2026-01-10' },
  { id: 5, name: 'Webcam HD Pro 4K', sku: 'WHP-4K-005', category: 'Audio & Video', currentStock: 178, safetyStock: 40, reorderPoint: 70, maxStock: 200, price: 7999, status: 'healthy' as const, lastRestocked: '2026-01-20' },
  { id: 6, name: '27" 4K Monitor', sku: 'MON-4K-006', category: 'Monitors', currentStock: 56, safetyStock: 30, reorderPoint: 45, maxStock: 120, price: 34999, status: 'warning' as const, lastRestocked: '2026-01-08' },
  { id: 7, name: 'Noise Canceling Headset', sku: 'NCH-007', category: 'Audio & Video', currentStock: 234, safetyStock: 70, reorderPoint: 100, maxStock: 350, price: 8999, status: 'healthy' as const, lastRestocked: '2026-01-22' },
  { id: 8, name: 'Portable SSD 1TB', sku: 'SSD-1T-008', category: 'Storage', currentStock: 167, safetyStock: 50, reorderPoint: 80, maxStock: 300, price: 6999, status: 'healthy' as const, lastRestocked: '2026-01-17' },
  { id: 9, name: 'Ergonomic Chair Pro', sku: 'ECP-009', category: 'Furniture', currentStock: 12, safetyStock: 15, reorderPoint: 25, maxStock: 60, price: 24999, status: 'critical' as const, lastRestocked: '2025-12-28' },
  { id: 10, name: 'Desk Lamp Smart LED', sku: 'DLS-010', category: 'Accessories', currentStock: 445, safetyStock: 80, reorderPoint: 120, maxStock: 300, price: 2999, status: 'overstock' as const, lastRestocked: '2026-01-25' },
  { id: 11, name: 'Thunderbolt Dock', sku: 'TBD-011', category: 'Accessories', currentStock: 67, safetyStock: 30, reorderPoint: 50, maxStock: 150, price: 12999, status: 'healthy' as const, lastRestocked: '2026-01-12' },
  { id: 12, name: 'Gaming Mouse Pad XL', sku: 'GMP-012', category: 'Peripherals', currentStock: 523, safetyStock: 100, reorderPoint: 150, maxStock: 400, price: 1299, status: 'overstock' as const, lastRestocked: '2026-01-20' },
  { id: 13, name: 'Ultrabook Slim 14"', sku: 'UBS-14-013', category: 'Laptops', currentStock: 98, safetyStock: 40, reorderPoint: 60, maxStock: 200, price: 64999, status: 'healthy' as const, lastRestocked: '2026-01-24' },
  { id: 14, name: 'Smartphone Pro Max 5G', sku: 'SPM-5G-014', category: 'Laptops', currentStock: 215, safetyStock: 60, reorderPoint: 100, maxStock: 400, price: 74999, status: 'healthy' as const, lastRestocked: '2026-01-22' },
  { id: 15, name: 'Smart Watch Ultra GPS', sku: 'SWU-GPS-015', category: 'Accessories', currentStock: 184, safetyStock: 50, reorderPoint: 80, maxStock: 300, price: 18999, status: 'healthy' as const, lastRestocked: '2026-01-19' },
  { id: 16, name: 'ANC Earbuds Pro', sku: 'ANC-EB-016', category: 'Audio & Video', currentStock: 340, safetyStock: 80, reorderPoint: 120, maxStock: 500, price: 5999, status: 'healthy' as const, lastRestocked: '2026-01-26' },
  { id: 17, name: 'Curved Gaming Monitor 34"', sku: 'CGM-34-017', category: 'Monitors', currentStock: 42, safetyStock: 20, reorderPoint: 35, maxStock: 100, price: 49999, status: 'warning' as const, lastRestocked: '2026-01-11' },
  { id: 18, name: 'Wireless Gamepad Pro', sku: 'WGC-P-018', category: 'Peripherals', currentStock: 290, safetyStock: 70, reorderPoint: 110, maxStock: 450, price: 3999, status: 'healthy' as const, lastRestocked: '2026-01-23' },
  { id: 19, name: 'Streamer Mic Studio Kit', sku: 'SMS-019', category: 'Audio & Video', currentStock: 115, safetyStock: 35, reorderPoint: 55, maxStock: 200, price: 6499, status: 'healthy' as const, lastRestocked: '2026-01-14' },
  { id: 20, name: 'Wi-Fi 6E Mesh Router', sku: 'WMR-6E-020', category: 'Accessories', currentStock: 76, safetyStock: 30, reorderPoint: 50, maxStock: 150, price: 14999, status: 'healthy' as const, lastRestocked: '2026-01-16' },
  { id: 21, name: 'External Hard Drive 4TB', sku: 'EHD-4T-021', category: 'Storage', currentStock: 195, safetyStock: 50, reorderPoint: 80, maxStock: 350, price: 8499, status: 'healthy' as const, lastRestocked: '2026-01-21' },
  { id: 22, name: 'Fast Power Bank 20000mAh', sku: 'FPB-20K-022', category: 'Accessories', currentStock: 410, safetyStock: 90, reorderPoint: 130, maxStock: 600, price: 2499, status: 'overstock' as const, lastRestocked: '2026-01-25' },
  { id: 23, name: 'Smart Security Cam 2K', sku: 'SSC-2K-023', category: 'Accessories', currentStock: 160, safetyStock: 40, reorderPoint: 70, maxStock: 300, price: 3799, status: 'healthy' as const, lastRestocked: '2026-01-18' },
  { id: 24, name: 'Motorized Standing Desk', sku: 'MSD-024', category: 'Furniture', currentStock: 18, safetyStock: 20, reorderPoint: 30, maxStock: 80, price: 32999, status: 'critical' as const, lastRestocked: '2025-12-30' },
]

export const inventoryStats = [
  { title: 'Total SKUs', value: '1,248', icon: Package, change: '+24', trend: 'up' as const },
  { title: 'Inventory Health', value: '91%', icon: CheckCircle2, change: '+3.2%', trend: 'up' as const },
  { title: 'Low Stock Items', value: '18', icon: AlertTriangle, change: '-5', trend: 'down' as const },
  { title: 'Avg. Turnover', value: '4.2x', icon: ArrowUpRight, change: '+0.3x', trend: 'up' as const },
]

// ============ PRICING DATA ============
export const pricingSuggestions = [
  { id: 1, product: 'Gaming Laptop Pro X1', currentPrice: 89999, suggestedPrice: 84999, competitorPrice: 86499, margin: 28, suggestedMargin: 25, impact: '+12% sales volume', confidence: 94 },
  { id: 2, product: 'Mechanical Keyboard RGB', currentPrice: 4999, suggestedPrice: 5499, competitorPrice: 5299, margin: 35, suggestedMargin: 38, impact: '+8% revenue', confidence: 91 },
  { id: 3, product: 'Wireless Mouse Elite', currentPrice: 2499, suggestedPrice: 2299, competitorPrice: 2399, margin: 40, suggestedMargin: 35, impact: '+18% sales volume', confidence: 88 },
  { id: 4, product: 'USB-C Hub Ultra', currentPrice: 3499, suggestedPrice: 3299, competitorPrice: 3199, margin: 32, suggestedMargin: 29, impact: '+15% sales volume', confidence: 86 },
  { id: 5, product: '27" 4K Monitor', currentPrice: 34999, suggestedPrice: 32999, competitorPrice: 33499, margin: 22, suggestedMargin: 20, impact: '+10% sales volume', confidence: 92 },
  { id: 6, product: 'Noise Canceling Headset', currentPrice: 8999, suggestedPrice: 9499, competitorPrice: 9299, margin: 30, suggestedMargin: 33, impact: '+5% revenue', confidence: 89 },
  { id: 7, product: 'Smartphone Pro Max 5G', currentPrice: 74999, suggestedPrice: 71999, competitorPrice: 72999, margin: 24, suggestedMargin: 22, impact: '+14% sales volume', confidence: 95 },
  { id: 8, product: 'Curved Gaming Monitor 34"', currentPrice: 49999, suggestedPrice: 46999, competitorPrice: 47999, margin: 26, suggestedMargin: 23, impact: '+11% sales volume', confidence: 90 },
]

export const discountRecommendations = [
  { product: 'Desk Lamp Smart LED', reason: 'Overstock clearance', currentPrice: 2999, discountPercent: 20, newPrice: 2399, expectedImpact: 'Clear 150+ excess units in 2 weeks', urgency: 'high' as const },
  { product: 'Gaming Mouse Pad XL', reason: 'Overstock clearance', currentPrice: 1299, discountPercent: 15, newPrice: 1104, expectedImpact: 'Reduce overstock by 200 units', urgency: 'medium' as const },
  { product: 'Fast Power Bank 20000mAh', reason: 'Bulk overstock clearance', currentPrice: 2499, discountPercent: 25, newPrice: 1874, expectedImpact: 'Clear 250+ units, free up warehouse capital', urgency: 'high' as const },
  { product: 'Wireless Mouse Elite', reason: 'Competitive pricing', currentPrice: 2499, discountPercent: 8, newPrice: 2299, expectedImpact: 'Match competitor pricing, recover market share', urgency: 'high' as const },
  { product: 'Portable SSD 1TB', reason: 'Seasonal promotion', currentPrice: 6999, discountPercent: 10, newPrice: 6299, expectedImpact: 'Boost Q1 sales by 22%', urgency: 'low' as const },
]

// ============ SUPPLIER DATA ============
export const suppliers = [
  { id: 1, name: 'TechFlow Solutions', reliability: 96, leadTime: 5, deliveryScore: 98, costIndex: 92, totalOrders: 847, onTimeDelivery: 98.2, qualityScore: 97, rank: 1 },
  { id: 2, name: 'GlobalChip Industries', reliability: 94, leadTime: 7, deliveryScore: 95, costIndex: 88, totalOrders: 623, onTimeDelivery: 96.5, qualityScore: 95, rank: 2 },
  { id: 3, name: 'PrimeParts Trading', reliability: 91, leadTime: 4, deliveryScore: 93, costIndex: 95, totalOrders: 534, onTimeDelivery: 93.8, qualityScore: 92, rank: 3 },
  { id: 4, name: 'Nexus Components', reliability: 89, leadTime: 8, deliveryScore: 90, costIndex: 85, totalOrders: 412, onTimeDelivery: 91.2, qualityScore: 90, rank: 4 },
  { id: 5, name: 'SwiftLogix Supply', reliability: 87, leadTime: 6, deliveryScore: 88, costIndex: 90, totalOrders: 378, onTimeDelivery: 89.5, qualityScore: 88, rank: 5 },
  { id: 6, name: 'MegaSource Direct', reliability: 82, leadTime: 10, deliveryScore: 84, costIndex: 78, totalOrders: 298, onTimeDelivery: 85.1, qualityScore: 83, rank: 6 },
]

export const supplierLeadTimeData = [
  { month: 'Jan', TechFlow: 5, GlobalChip: 7, PrimeParts: 4, Nexus: 8, SwiftLogix: 6 },
  { month: 'Feb', TechFlow: 5, GlobalChip: 6, PrimeParts: 4, Nexus: 9, SwiftLogix: 7 },
  { month: 'Mar', TechFlow: 4, GlobalChip: 7, PrimeParts: 5, Nexus: 8, SwiftLogix: 6 },
  { month: 'Apr', TechFlow: 5, GlobalChip: 8, PrimeParts: 4, Nexus: 7, SwiftLogix: 6 },
  { month: 'May', TechFlow: 6, GlobalChip: 7, PrimeParts: 3, Nexus: 9, SwiftLogix: 5 },
  { month: 'Jun', TechFlow: 5, GlobalChip: 7, PrimeParts: 4, Nexus: 8, SwiftLogix: 6 },
]

// ============ AI AGENT DATA ============
export const aiAgents = [
  {
    id: 'demand-forecast',
    name: 'Demand Forecast Agent',
    description: 'Predicts future product demand using historical sales, seasonality, and market trends.',
    status: 'active' as const,
    confidence: 94,
    lastRun: '2 min ago',
    executionTime: '1.2s',
    latestAnalysis: 'Q1 2026 demand projected to increase by 15% driven by back-to-school season. Gaming Laptop Pro X1 shows strongest growth trajectory.',
    output: 'Processed 24,847 data points across 1,248 SKUs. Identified 3 trend anomalies requiring attention.',
    model: 'Prophet + LSTM Ensemble',
    accuracy: 94.2,
    icon: TrendingUp,
    color: '#5B5CEB',
  },
  {
    id: 'inventory-agent',
    name: 'Inventory Agent',
    description: 'Monitors stock levels, calculates safety stock, and triggers reorder alerts in real-time.',
    status: 'active' as const,
    confidence: 91,
    lastRun: '5 min ago',
    executionTime: '0.8s',
    latestAnalysis: '18 SKUs below reorder point. Wireless Mouse Elite critically low at 23 units. 2 items overstocked requiring markdown.',
    output: 'Scanned 1,248 SKUs. Generated 18 reorder alerts, 2 overstock warnings, 5 safety stock adjustments.',
    model: 'Dynamic Safety Stock + EOQ',
    accuracy: 91.5,
    icon: Package,
    color: '#14B8A6',
  },
  {
    id: 'pricing-agent',
    name: 'Pricing Intelligence Agent',
    description: 'Analyzes competitor prices, demand elasticity, and margins to suggest optimal pricing strategies.',
    status: 'processing' as const,
    confidence: 89,
    lastRun: '12 min ago',
    executionTime: '2.4s',
    latestAnalysis: 'Gaming Laptop Pro X1 overpriced by ₹5,000 vs market. Recommending price reduction to ₹84,999 for 12% volume uplift.',
    output: 'Analyzed 6 products against 12 competitors. Generated 6 price suggestions with avg. confidence of 89%.',
    model: 'Price Elasticity + Competitive Analysis',
    accuracy: 89.3,
    icon: DollarSign,
    color: '#7C3AED',
  },
  {
    id: 'supplier-agent',
    name: 'Supplier Intelligence Agent',
    description: 'Evaluates supplier performance, predicts delivery risks, and recommends optimal procurement strategies.',
    status: 'active' as const,
    confidence: 92,
    lastRun: '8 min ago',
    executionTime: '1.5s',
    latestAnalysis: 'TechFlow Solutions maintains top rank with 98.2% on-time delivery. Nexus Components showing declining reliability — consider alternative.',
    output: 'Ranked 6 suppliers across 5 metrics. Flagged 1 supplier for performance review. Updated lead time predictions.',
    model: 'Multi-criteria Decision Analysis',
    accuracy: 92.1,
    icon: Users,
    color: '#F59E0B',
  },
  {
    id: 'decision-agent',
    name: 'Decision Intelligence Agent',
    description: 'The meta-agent that orchestrates all other agents and provides unified strategic recommendations.',
    status: 'active' as const,
    confidence: 96,
    lastRun: '1 min ago',
    executionTime: '3.1s',
    latestAnalysis: 'Strategic recommendation: Prioritize restocking Wireless Mouse Elite via TechFlow Solutions. Implement price reduction on Gaming Laptop Pro X1. Clear Desk Lamp overstock with 20% discount campaign.',
    output: 'Synthesized insights from all 4 agents. Generated 3 priority actions, 2 strategic recommendations, 1 risk alert.',
    model: 'RAG + GPT-4 + Chain of Thought',
    accuracy: 96.0,
    icon: Brain,
    color: '#5B5CEB',
  },
]

// ============ CHAT DATA ============
export const chatSuggestions = [
  'What are the top-selling products this month?',
  'Show me low stock items that need immediate reordering',
  'Analyze the impact of Diwali season on demand',
  'Compare supplier performance for Q4',
  'What pricing changes would maximize profit?',
  'Generate an executive summary of this week',
]

export const chatHistory = [
  {
    id: 1,
    role: 'user' as const,
    content: 'What are the top 3 products by revenue this month?',
    timestamp: '10:32 AM',
  },
  {
    id: 2,
    role: 'assistant' as const,
    content: `Based on the latest sales data, here are the **top 3 products by revenue** this month:\n\n| Rank | Product | Revenue | Growth |\n|------|---------|---------|--------|\n| 1 | Gaming Laptop Pro X1 | ₹14.23L | +15.2% |\n| 2 | Mechanical Keyboard RGB | ₹6.78L | +22.8% |\n| 3 | 27" 4K Monitor | ₹6.28L | +12.1% |\n\n**Key Insights:**\n- Gaming Laptop Pro X1 continues to dominate with ₹14.23L in revenue\n- Mechanical Keyboard RGB shows the strongest growth at 22.8%\n- Overall top-3 revenue is up 16.7% compared to last month\n\nWould you like me to dive deeper into any of these products?`,
    timestamp: '10:32 AM',
  },
  {
    id: 3,
    role: 'user' as const,
    content: 'Which items need restocking urgently?',
    timestamp: '10:35 AM',
  },
  {
    id: 4,
    role: 'assistant' as const,
    content: `🚨 **Urgent Restocking Required** for the following items:\n\n**Critical (Below Safety Stock):**\n1. **Wireless Mouse Elite** — 23 units remaining (Safety: 80)\n   - Burn rate: ~45 units/week\n   - Days until stockout: ~3.5 days\n   - Recommended action: Emergency PO to TechFlow Solutions\n\n2. **Ergonomic Chair Pro** — 12 units remaining (Safety: 15)\n   - Burn rate: ~8 units/week\n   - Days until stockout: ~10 days\n   - Recommended action: Standard PO to PrimeParts Trading\n\n**Warning (Approaching Reorder Point):**\n3. **USB-C Hub Ultra** — 89 units (Reorder: 90)\n4. **27" 4K Monitor** — 56 units (Reorder: 45) ✅ Above reorder\n\nShall I generate purchase orders for the critical items?`,
    timestamp: '10:35 AM',
  },
]

// ============ REPORTS DATA ============
export const reports = [
  { id: 1, title: 'Weekly Performance Report', type: 'weekly' as const, date: 'Jan 25, 2026', status: 'ready' as const, pages: 12, highlights: ['Revenue up 8.2%', '3 new AI insights', '2 restock alerts'] },
  { id: 2, title: 'Monthly Business Review', type: 'monthly' as const, date: 'Jan 1, 2026', status: 'ready' as const, pages: 28, highlights: ['₹4.8M revenue milestone', '94% forecast accuracy', 'Top supplier: TechFlow'] },
  { id: 3, title: 'Executive Summary Q4 2025', type: 'executive' as const, date: 'Dec 31, 2025', status: 'ready' as const, pages: 8, highlights: ['35% YoY growth', 'AI adoption at 96%', '12 new product launches'] },
  { id: 4, title: 'Weekly Performance Report', type: 'weekly' as const, date: 'Jan 18, 2026', status: 'ready' as const, pages: 11, highlights: ['Strong peripherals sales', 'Supplier delays resolved', 'New pricing model live'] },
  { id: 5, title: 'Demand Forecast Report', type: 'monthly' as const, date: 'Jan 15, 2026', status: 'generating' as const, pages: 0, highlights: [] },
]

export { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock }
