"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Car,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  TrendingUp,
  MessageCircle,
  MapPin,
  BarChart3,
  History,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PlanBadge } from "./plan-badge"
import { type PlanTier } from "@/lib/plans/config"
import { type UsageStats } from "@/lib/plans/usage-tracker"
import { AgentChat, AgentButton } from "./agent-chat"

interface DashboardShellProps {
  user: any
  dealer: any
  planTier: PlanTier
  usageStats: UsageStats
  children: React.ReactNode
}

export function DashboardShell({
  user,
  dealer,
  planTier,
  usageStats,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [agentChatOpen, setAgentChatOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleSendMessage = async (message: string) => {
    // TODO: Integrate with actual AI agent backend
    console.log("Message sent to agent:", message)
  }

  const dealerName = dealer?.dealer_name || dealer?.company_name || user?.email?.split('@')[0] || 'Dealer'
  const initials = dealerName.substring(0, 2).toUpperCase()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MapPin, label: "Auction Map", href: "/dashboard/map" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: History, label: "History", href: "/dashboard/history" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">RevvDoctor</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
            <Avatar className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600">
              <AvatarFallback className="bg-transparent text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{dealerName}</p>
              <PlanBadge tier={planTier} size="sm" showIcon={false} />
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50 lg:hidden"
            >
              <MobileSidebar
                navItems={navItems}
                pathname={pathname}
                dealerName={dealerName}
                initials={initials}
                planTier={planTier}
                onClose={() => setSidebarOpen(false)}
                onSignOut={handleSignOut}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Usage Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-xs text-slate-600">
                    {usageStats.viewedToday}/{usageStats.limit}
                  </span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                </Button>

                {/* Live Agent Button */}
                <Button
                  size="sm"
                  onClick={() => setAgentChatOpen(true)}
                  className="hidden lg:flex bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Agent
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Agent Chat Interface */}
      <AgentChat
        isOpen={agentChatOpen}
        onClose={() => setAgentChatOpen(false)}
        onSendMessage={handleSendMessage}
      />

      {/* Floating Agent Button */}
      <AgentButton onClick={() => setAgentChatOpen(true)} />
    </div>
  )
}

function MobileSidebar({
  navItems,
  pathname,
  dealerName,
  initials,
  planTier,
  onClose,
  onSignOut,
}: {
  navItems: any[]
  pathname: string
  dealerName: string
  initials: string
  planTier: PlanTier
  onClose: () => void
  onSignOut: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Car className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">RevvDoctor</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              onClick={onClose}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{dealerName}</p>
            <PlanBadge tier={planTier} size="sm" showIcon={false} />
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
