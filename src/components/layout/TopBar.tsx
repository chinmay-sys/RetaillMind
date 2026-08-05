import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notifications } from '@/data/mockData'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/app': { title: 'Dashboard', subtitle: 'Welcome back, Chinmay' },
  '/app/analytics': { title: 'Analytics', subtitle: 'Revenue, sales, and performance insights' },
  '/app/forecast': { title: 'Demand Forecast', subtitle: 'AI-powered demand predictions' },
  '/app/inventory': { title: 'Inventory Intelligence', subtitle: 'Real-time stock monitoring & optimization' },
  '/app/pricing': { title: 'Pricing Intelligence', subtitle: 'Smart pricing recommendations' },
  '/app/suppliers': { title: 'Supplier Intelligence', subtitle: 'Supplier performance & procurement insights' },
  '/app/ai-center': { title: 'AI Decision Center', subtitle: 'Orchestrating intelligent retail decisions' },
  '/app/reports': { title: 'Reports', subtitle: 'Business reports & executive summaries' },
  '/app/chat': { title: 'AI Chat', subtitle: 'Conversational business intelligence' },
  '/app/settings': { title: 'Settings', subtitle: 'Manage your account & preferences' },
}

export function TopBar() {
  const location = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)
  const pageInfo = pageTitles[location.pathname] || { title: 'RetailMind AI', subtitle: '' }
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{pageInfo.title}</h1>
          <p className="text-xs text-muted truncate hidden sm:block">{pageInfo.subtitle}</p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search anything..."
              className={`w-64 pl-9 pr-12 h-9 text-sm bg-gray-50 border-gray-200 transition-all duration-300 ${
                searchFocused ? 'w-80 bg-white border-primary/30 ring-2 ring-primary/10' : ''
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5 text-[10px] text-muted bg-white border border-gray-200 rounded px-1.5 py-0.5">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-gray-50 transition-colors">
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
                <Badge variant="default" className="text-[10px]">{unreadCount} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-primary'}`} />
                    <span className="text-sm font-medium truncate">{notif.title}</span>
                    <span className="text-[10px] text-muted ml-auto shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-muted pl-4 line-clamp-1">{notif.message}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                    CR
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Chinmay R.</span>
                  <span className="text-xs text-muted font-normal">chinmay@retailmind.ai</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
