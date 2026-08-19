/**
 * Role definitions, normalization, and per-role configuration for RetailMind AI.
 * Single source of truth — import from here everywhere.
 */
import {
  LayoutDashboard, BarChart3, TrendingUp, Package, DollarSign,
  Users, Brain, FileText, MessageSquare, Settings, Shield,
  Activity, type LucideIcon,
} from 'lucide-react'

// ─── Role Enum ──────────────────────────────────────────────
export enum AppRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
}

// ─── Normalize backend role string → AppRole ────────────────
const ROLE_MAP: Record<string, AppRole> = {
  'admin': AppRole.ADMIN,
  'retail manager': AppRole.MANAGER,
  'business analyst': AppRole.ANALYST,
}

export function normalizeRole(raw?: string | null): AppRole {
  if (!raw) return AppRole.ANALYST // least privilege
  const key = raw.trim().toLowerCase()
  return ROLE_MAP[key] ?? AppRole.ANALYST // unknown → least privilege
}

// ─── Dashboard path per role ────────────────────────────────
const DASHBOARD_PATHS: Record<AppRole, string> = {
  [AppRole.ADMIN]: '/app/admin',
  [AppRole.MANAGER]: '/app/manager',
  [AppRole.ANALYST]: '/app/analyst',
}

export function getRoleDashboardPath(role: AppRole): string {
  return DASHBOARD_PATHS[role]
}

// ─── Sidebar nav item type ──────────────────────────────────
export interface NavItem {
  path: string
  icon: LucideIcon
  label: string
  end?: boolean // exact match for NavLink
}

// ─── Per-role sidebar items ─────────────────────────────────
export const ROLE_SIDEBAR_ITEMS: Record<AppRole, NavItem[]> = {
  [AppRole.ADMIN]: [
    { path: '/app/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/app/inventory', icon: Package, label: 'Inventory' },
    { path: '/app/pricing', icon: DollarSign, label: 'Pricing' },
    { path: '/app/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/app/customer-reviews', icon: MessageSquare, label: 'Customer Reviews' },
    { path: '/app/ai-center', icon: Brain, label: 'AI Decision Center' },
    { path: '/app/reports', icon: FileText, label: 'Reports' },
    { path: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ],
  [AppRole.MANAGER]: [
    { path: '/app/manager', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/app/inventory', icon: Package, label: 'Inventory' },
    { path: '/app/pricing', icon: DollarSign, label: 'Pricing' },
    { path: '/app/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/app/customer-reviews', icon: MessageSquare, label: 'Customer Reviews' },
    { path: '/app/ai-center', icon: Brain, label: 'AI Decision Center' },
    { path: '/app/reports', icon: FileText, label: 'Reports' },
    { path: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ],
  [AppRole.ANALYST]: [
    { path: '/app/analyst', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/app/customer-reviews', icon: MessageSquare, label: 'Customer Reviews' },
    { path: '/app/reports', icon: FileText, label: 'Reports' },
    { path: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
  ],
}

// ─── Per-role page titles (for TopBar) ──────────────────────
export const ROLE_PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/app/admin': { title: 'Admin Dashboard', subtitle: 'System overview & administration' },
  '/app/manager': { title: 'Manager Dashboard', subtitle: 'Sales, inventory & business intelligence' },
  '/app/analyst': { title: 'Analyst Dashboard', subtitle: 'Analytics, forecasts & insights' },
  '/app/analytics': { title: 'Analytics', subtitle: 'Revenue, sales, and performance insights' },
  '/app/forecast': { title: 'Demand Forecast', subtitle: 'AI-powered demand predictions' },
  '/app/inventory': { title: 'Inventory Intelligence', subtitle: 'Real-time stock monitoring & optimization' },
  '/app/pricing': { title: 'Pricing Intelligence', subtitle: 'Smart pricing recommendations' },
  '/app/suppliers': { title: 'Supplier Intelligence', subtitle: 'Supplier performance & procurement insights' },
  '/app/customer-reviews': { title: 'Customer Feedback', subtitle: 'Review intelligence & sentiment analysis' },
  '/app/ai-center': { title: 'AI Decision Center', subtitle: 'Orchestrating intelligent retail decisions' },
  '/app/reports': { title: 'Reports', subtitle: 'Business reports & executive summaries' },
  '/app/chat': { title: 'AI Chat', subtitle: 'Conversational business intelligence' },
  '/app/settings': { title: 'Settings', subtitle: 'Manage your account & preferences' },
}

// ─── Role display names ─────────────────────────────────────
export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  [AppRole.ADMIN]: 'Admin',
  [AppRole.MANAGER]: 'Manager',
  [AppRole.ANALYST]: 'Analyst',
}

// ─── Role badge colors (for TopBar user dropdown) ───────────
export const ROLE_BADGE_COLORS: Record<AppRole, string> = {
  [AppRole.ADMIN]: 'bg-red-100 text-red-700',
  [AppRole.MANAGER]: 'bg-blue-100 text-blue-700',
  [AppRole.ANALYST]: 'bg-emerald-100 text-emerald-700',
}
