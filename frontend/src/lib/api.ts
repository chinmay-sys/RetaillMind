import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('retailmind_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('retailmind_token')
      localStorage.removeItem('retailmind_user')
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ───────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { first_name: string; last_name: string; email: string; password: string; organization?: string }) =>
    api.post('/auth/register', data),
  verifyEmail: (email: string, otp: string) =>
    api.post('/auth/verify-email', { email, otp }),
  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),
  me: () => api.get('/auth/me'),
}

// ─── Sales / Analytics API ──────────────────────────────
export const salesAPI = {
  analytics: (days = 30) => api.get(`/sales/analytics?days=${days}`),
  topProducts: (limit = 10, days = 90, category = 'all') =>
    api.get(`/sales/top-products?limit=${limit}&days=${days}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''}`),
  monthlyTrend: (months = 12) => api.get(`/sales/monthly-trend?months=${months}`),
  byStore: (days = 90) => api.get(`/sales/by-store?days=${days}`),
  byCategory: (days = 90) => api.get(`/sales/by-category?days=${days}`),
}

// ─── Inventory API ──────────────────────────────────────
export const inventoryAPI = {
  status: (page = 1, pageSize = 12, statusFilter?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (statusFilter) params.set('status_filter', statusFilter)
    if (search) params.set('search', search)
    return api.get(`/inventory/status?${params}`)
  },
  getItem: (id: number) => api.get(`/inventory/items/${id}`),
  updateStock: (id: number, data: { current_stock?: number; safety_stock?: number }) =>
    api.patch(`/inventory/items/${id}`, null, { params: data }),
}

// ─── Forecast API ───────────────────────────────────────
export const forecastAPI = {
  thirtyDay: () => api.get('/forecast/30-day'),
  predictions: (days = 30) => api.get('/forecast/30-day'),
  predict: (productId: number, days = 30) =>
    api.post('/forecast/predict', { product_id: productId, days }),
}

// ─── Pricing API ────────────────────────────────────────
export const pricingAPI = {
  recommendations: () => api.get('/pricing/recommendations'),
  suggestions: () => api.get('/pricing/recommendations'),
  updatePrice: (productId: number, sellingPrice: number) =>
    api.patch(`/pricing/products/${productId}/price?selling_price=${sellingPrice}`),
}


// ─── Supplier API ───────────────────────────────────────
export const supplierAPI = {
  scorecard: () => api.get('/suppliers/scorecard'),
  list: () => api.get('/suppliers/list'),
  leadTimeTrend: (months = 6) => api.get(`/suppliers/lead-time-trend?months=${months}`),
}

// ─── AI Decision Center API ─────────────────────────────
export const aiCenterAPI = {
  status: () => api.get('/ai-center/status'),
  runPipeline: () => api.post('/ai-center/pipeline/run'),
  runAgent: (agentId: string) => api.post(`/ai-center/agents/${agentId}/run`),
  reviewDecision: (data: { recommendation_id: number; action: string; notes?: string }) =>
    api.post('/ai-center/decisions/review', data),
}


// ─── Chat API ───────────────────────────────────────────
export const chatAPI = {
  query: (message: string, conversationId?: string) =>
    api.post('/chat/query', { message, conversation_id: conversationId }),
}

// ─── Reports API ────────────────────────────────────────
export const reportsAPI = {
  list: () => api.get('/reports/list'),
  generateCSV: (reportId: number) => api.get(`/reports/generate/${reportId}`, { responseType: 'blob' }),
}

// ─── Audit API ──────────────────────────────────────────
export const auditAPI = {
  logs: (page = 1, pageSize = 20, entityType?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (entityType) params.set('entity_type', entityType)
    return api.get(`/audit/logs?${params}`)
  },
  stats: () => api.get('/audit/stats'),
}

// ─── Customer Reviews & Feedback Intelligence API ───────
export const reviewsAPI = {
  dashboard: () => api.get('/reviews/dashboard'),
  list: (limit = 10, offset = 0, productId?: number, sentiment?: string) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (productId) params.set('product_id', String(productId))
    if (sentiment) params.set('sentiment', sentiment)
    return api.get(`/reviews/list?${params}`)
  },
  health: () => api.get('/reviews/health'),
  sync: () => api.post('/reviews/sync'),
  product: (id: number) => api.get(`/reviews/product/${id}`),
  triggerDemoEvent: (data?: { review_text?: string; rating?: number; product_id?: number }) => {
    const params = new URLSearchParams()
    if (data?.review_text) params.set('review_text', data.review_text)
    if (data?.rating !== undefined) params.set('rating', String(data.rating))
    if (data?.product_id !== undefined) params.set('product_id', String(data.product_id))
    return api.post(`/reviews/trigger-demo-event?${params}`)
  },
}

// ─── Kaggle Dataset API ─────────────────────────────────
export const kaggleAPI = {
  sync: (dataset = 'ahmdayman/retail-sales-dataset') => api.post(`/datasets/kaggle/sync?dataset=${dataset}`),
}

export default api
