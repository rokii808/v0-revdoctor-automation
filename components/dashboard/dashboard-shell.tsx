"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Search, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { PlanTier } from "@/lib/plans/config"
import type { UsageStats } from "@/lib/plans/usage-tracker"
import { AgentChat, AgentButton } from "./agent-chat"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardShellProps {
  user: any
  dealer: any
  planTier: PlanTier
  usageStats: UsageStats
  children: React.ReactNode
}

export function DashboardShell({ user, dealer, planTier, usageStats, children }: DashboardShellProps) {
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-slate-50 flex w-full">
        <DashboardSidebar dealer={dealer} planTier={planTier} />

        <SidebarInset className="flex flex-col flex-1">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />

                <div className="hidden md:flex flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-xs text-slate-600">
                    {usageStats.viewedToday}/{usageStats.limit} today
                  </span>
                </div>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setAgentChatOpen(true)}
                  className="hidden lg:flex bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Agent
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

          <AgentChat isOpen={agentChatOpen} onClose={() => setAgentChatOpen(false)} onSendMessage={handleSendMessage} />

          <AgentButton onClick={() => setAgentChatOpen(true)} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
