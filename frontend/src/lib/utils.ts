import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value?: number | string | null, compact = true): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return '—'
  }
  if (num === 0) {
    return '₹0'
  }

  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (compact) {
    if (absNum >= 10000000) {
      return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`
    }
    if (absNum >= 100000) {
      return `${sign}₹${(absNum / 100000).toFixed(1)} L`
    }
    if (absNum >= 1000) {
      return `${sign}₹${(absNum / 1000).toFixed(1)} K`
    }
    return `${sign}₹${absNum.toLocaleString('en-IN')}`
  }

  return `${sign}₹${absNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function formatNumber(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return '—'
  }
  return new Intl.NumberFormat('en-IN').format(num)
}

export function formatPercent(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return '—'
  }
  return `${num.toFixed(1)}%`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'healthy':
    case 'success':
      return 'text-success bg-success-50'
    case 'warning':
    case 'processing':
      return 'text-warning bg-warning-50'
    case 'critical':
    case 'error':
    case 'danger':
      return 'text-danger bg-danger-50'
    case 'idle':
    case 'inactive':
      return 'text-muted bg-gray-100'
    default:
      return 'text-primary bg-primary-50'
  }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-success'
    case 'down':
      return 'text-danger'
    case 'stable':
      return 'text-muted'
  }
}
