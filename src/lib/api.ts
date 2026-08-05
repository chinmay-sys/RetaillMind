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
    if (error.response?.status === 401) {
      localStorage.removeItem('retailmind_token')
      localStorage.removeItem('retailmind_user')
      window.location.href = '/auth/login'
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
  me: () => api.get('/auth/me'),
}

// ─── Sales / Analytics API ──────────────────────────────
export const salesAPI = {
  analytics: (days = 30) => api.get(`/sales/analytics?days=${days}`),
  topProducts: (limit = 10, days = 90) => api.get(`/sales/top-products?limit=${limit}&days=${days}`),
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
  predict: (productId: number, days = 30) =>
    api.post('/forecast/predict', { product_id: productId, days }),
}

// ─── Pricing API ────────────────────────────────────────
export const pricingAPI = {
  recommendations: () => api.get('/pricing/recommendations'),
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

export default api
