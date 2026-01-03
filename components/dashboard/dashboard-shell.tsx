"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Car, LayoutDashboard, Settings, Bell, Search, Menu, X, LogOut, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PlanBadge } from "./plan-badge"
import type { PlanTier } from "@/lib/plans/config"
import type { UsageStats } from "@/lib/plans/usage-tracker"
import { AgentChat, AgentButton } from "./agent-chat"

interface DashboardShellProps {
  user: any
  dealer: any
  planTier: PlanTier
  usageStats: UsageStats
  children: React.ReactNode
}

export function DashboardShell({ user, dealer, planTier, usageStats, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [agentChatOpen, setAgentChatOpen] = useState(false)
  const router = useRouter()
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

  const dealerName = dealer?.dealer_name || dealer?.company_name || user?.email?.split("@")[0] || "Dealer"
  const initials = dealerName.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 hidden sm:block">RevvDoctor</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Usage Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <span className="text-xs text-slate-600">
                  {usageStats.viewedToday}/{usageStats.limit} today
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
                Live Agent
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900">{dealerName}</p>
                  <PlanBadge tier={planTier} size="sm" showIcon={false} />
                </div>
                <Avatar className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600">
                  <AvatarFallback className="bg-transparent text-white font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-40 lg:hidden"
            >
              <MobileSidebar onClose={() => setSidebarOpen(false)} onSignOut={handleSignOut} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Content */}
        {children}
      </main>

      {/* Agent Chat Interface */}
      <AgentChat isOpen={agentChatOpen} onClose={() => setAgentChatOpen(false)} onSendMessage={handleSendMessage} />

      {/* Floating Agent Button */}
      <AgentButton onClick={() => setAgentChatOpen(true)} />
    </div>
  )
}

function MobileSidebar({ onClose, onSignOut }: { onClose: () => void; onSignOut: () => void }) {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
      </div>

      <nav className="flex-1 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-600 font-medium"
          onClick={onClose}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50"
          onClick={onClose}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={onSignOut}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Sign Out
      </Button>
    </div>
  )
}
