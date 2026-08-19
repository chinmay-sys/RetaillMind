import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Command, LogOut, Check, ArrowRight, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_PAGE_TITLES, ROLE_DISPLAY_NAMES, ROLE_BADGE_COLORS, ROLE_SIDEBAR_ITEMS } from '@/lib/roles'
import { cn } from '@/lib/utils'

const initialNotifications = [
  { id: 1, title: 'Low Stock Alert', message: 'Heart Of Wicker Small stock below safety level (23 units)', time: '2 min ago', read: false, type: 'warning' },
  { id: 2, title: 'Forecast Updated', message: 'Q1 2026 demand forecast ready for review', time: '15 min ago', read: false, type: 'info' },
  { id: 3, title: 'Price Alert', message: 'Competitor price drop detected for Regency Cakestand', time: '1 hour ago', read: true, type: 'danger' },
  { id: 4, title: 'Delivery Confirmed', message: 'TechFlow Solutions shipment arrived at warehouse', time: '2 hours ago', read: true, type: 'success' },
]


const pageTitles: Record<string, { title: string; subtitle: string }> = ROLE_PAGE_TITLES

const notifTargetRoutes: Record<string, string> = {
  'Low Stock Alert': '/app/inventory',
  'Forecast Updated': '/app/forecast',
  'Price Alert': '/app/pricing',
  'Delivery Confirmed': '/app/suppliers',
}

const searchPages = [
  { name: 'Dashboard', path: '/app', category: 'Navigation' },
  { name: 'Analytics & Sales', path: '/app/analytics', category: 'Navigation' },
  { name: 'Demand Forecast', path: '/app/forecast', category: 'Navigation' },
  { name: 'Inventory Intelligence', path: '/app/inventory', category: 'Navigation' },
  { name: 'Pricing Intelligence', path: '/app/pricing', category: 'Navigation' },
  { name: 'Supplier Intelligence', path: '/app/suppliers', category: 'Navigation' },
  { name: 'AI Decision Center', path: '/app/ai-center', category: 'Navigation' },
  { name: 'Reports & Summaries', path: '/app/reports', category: 'Navigation' },
  { name: 'AI Chat Assistant', path: '/app/chat', category: 'Navigation' },
  { name: 'Settings & Account', path: '/app/settings', category: 'Navigation' },
  { name: 'Gaming Laptop Pro X1', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Smartphone Pro Max 5G', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Ultrabook Slim 14"', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Curved Gaming Monitor 34"', path: '/app/inventory', category: 'Product SKU' },
  { name: 'ANC Earbuds Pro', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Wireless Mouse Elite', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Mechanical Keyboard RGB', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Smart Watch Ultra GPS', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Motorized Standing Desk', path: '/app/inventory', category: 'Product SKU' },
  { name: 'Fast Power Bank 20000mAh', path: '/app/inventory', category: 'Product SKU' },
  { name: 'TechFlow Solutions', path: '/app/suppliers', category: 'Supplier' },
  { name: 'GlobalChip Industries', path: '/app/suppliers', category: 'Supplier' },
]

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, normalizedRole } = useAuth()
  const [notifs, setNotifs] = useState(initialNotifications)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const pageInfo = pageTitles[location.pathname] || { title: 'RetailMind AI', subtitle: '' }
  const unreadCount = notifs.filter(n => !n.read).length

  // Filter search results based on role — analysts don't see admin/manager-only pages
  const allowedPaths = normalizedRole ? ROLE_SIDEBAR_ITEMS[normalizedRole].map(i => i.path) : []
  const roleFilteredSearch = searchPages.filter(item => {
    // Always show product SKUs and suppliers for all roles
    if (item.category !== 'Navigation') return true
    return allowedPaths.some(p => item.path === p || item.path.startsWith(p + '/'))
  })

  const roleName = normalizedRole ? ROLE_DISPLAY_NAMES[normalizedRole] : 'User'
  const roleBadgeColor = normalizedRole ? ROLE_BADGE_COLORS[normalizedRole] : 'bg-gray-100 text-gray-700'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const handleNotificationClick = (id: number, title: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    const route = notifTargetRoutes[title] || '/app'
    navigate(route)
  }

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filteredSearch = roleFilteredSearch.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'RM'

  const subtitleText = (location.pathname === '/app/admin' || location.pathname === '/app/manager' || location.pathname === '/app/analyst') && user
    ? `Welcome back, ${user.first_name}`
    : pageInfo.subtitle

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          {/* Page Title */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{pageInfo.title}</h1>
            <p className="text-xs text-muted truncate hidden sm:block">{subtitleText}</p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Button / Trigger */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search anything..."
                onClick={() => setIsSearchOpen(true)}
                readOnly
                className="w-64 pl-9 pr-12 h-9 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:border-primary/30 transition-all duration-200 focus:outline-none"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5 text-[10px] text-muted bg-white border border-gray-200 rounded px-1.5 py-0.5">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-gray-50 transition-colors cursor-pointer">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[10px]">{unreadCount} unread</Badge>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifs.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.title)}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-primary animate-pulse'}`} />
                      <span className="text-sm font-medium truncate">{notif.title}</span>
                      <span className="text-[10px] text-muted ml-auto shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-muted pl-4 line-clamp-1">{notif.message}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user ? `${user.first_name} ${user.last_name}` : 'Retail Manager'}</span>
                    <span className="text-xs text-muted font-normal">{user?.email || 'manager@retailmind.ai'}</span>
                    <span className={cn('inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-1 w-fit', roleBadgeColor)}>{roleName}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/app/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger cursor-pointer flex items-center gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Search Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Input Header */}
            <div className="flex items-center px-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-muted shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command, page, or SKU to search..."
                className="w-full h-14 text-base bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                      navigate(item.path)
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-muted font-mono">{item.category}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary">{item.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted">
                  No matching results for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted px-4">
              <span>Press <kbd className="bg-white border rounded px-1">ESC</kbd> to close</span>
              <span>Use <kbd className="bg-white border rounded px-1">Ctrl+K</kbd> anytime</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

