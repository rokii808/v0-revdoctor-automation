"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, LayoutDashboard, Settings, FileText, Trophy, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PlanBadge } from "./plan-badge"
import type { PlanTier } from "@/lib/plans/config"

interface DashboardSidebarProps {
  dealer: any
  planTier: PlanTier
}

const navigationGroups = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        icon: Trophy,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: FileText,
      },
      {
        title: "AI Agents",
        href: "/agents",
        icon: Bot,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Car Preferences",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
]

export function DashboardSidebar({ dealer, planTier }: DashboardSidebarProps) {
  const pathname = usePathname()
  const dealerName = dealer?.dealer_name || dealer?.company_name || "Dealer"
  const initials = dealerName.substring(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-sidebar-foreground">RevvDoctor</span>
            <p className="text-xs text-sidebar-foreground/60">Car Sourcing AI</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : ""}
                      >
                        <Link href={item.href}>
                          <item.icon className={`w-5 h-5 ${isActive ? "text-orange-600" : ""}`} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600">
            <AvatarFallback className="bg-transparent text-white font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{dealerName}</p>
            <PlanBadge tier={planTier} size="sm" showIcon={false} />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
