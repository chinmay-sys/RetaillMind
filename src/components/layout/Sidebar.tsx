
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, TrendingUp, Package, DollarSign,
  Users, Brain, FileText, MessageSquare, Settings, ChevronLeft,
  ChevronRight, Sparkles, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
  { path: '/app/inventory', icon: Package, label: 'Inventory' },
  { path: '/app/pricing', icon: DollarSign, label: 'Pricing' },
  { path: '/app/suppliers', icon: Users, label: 'Suppliers' },
  { path: '/app/ai-center', icon: Brain, label: 'AI Decision Center' },
  { path: '/app/reports', icon: FileText, label: 'Reports' },
  { path: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'RM'

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-100 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold text-foreground truncate">RetailMind AI</span>
              <span className="text-[10px] text-muted truncate">Decision Intelligence</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item relative group',
                isActive && 'active',
                collapsed && 'justify-center px-0'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/[0.08] rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                'w-5 h-5 shrink-0 relative z-10 transition-colors',
                isActive ? 'text-primary' : 'text-muted group-hover:text-primary'
              )} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'relative z-10 truncate transition-colors',
                      isActive ? 'text-primary font-semibold' : 'text-gray-600 group-hover:text-primary'
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-gray-50 hover:text-foreground transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* User Profile */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 shrink-0',
        collapsed && 'justify-center px-2'
      )}>
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Retail Manager'}
              </p>
              <p className="text-xs text-muted truncate">
                {user?.role || 'Retail Manager'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
