"use client"

import { motion } from "framer-motion"
import { Search, Settings, TrendingUp, Download, MessageCircle, Bell, Zap, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface QuickAction {
  label: string
  description: string
  icon: any
  href?: string
  onClick?: () => void
  variant: "primary" | "secondary" | "outline"
  gradient?: string
}

interface QuickActionsProps {
  onStartScan?: () => void
  onOpenAgent?: () => void
  onExportData?: () => void
}

export function QuickActions({ onStartScan, onOpenAgent, onExportData }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      label: "Start New Scan",
      description: "Scan listings for new cars",
      icon: Search,
      onClick: onStartScan,
      variant: "primary",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      label: "Talk to Agent",
      description: "Get AI recommendations",
      icon: MessageCircle,
      onClick: onOpenAgent,
      variant: "primary",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Export Data",
      description: "Download your reports",
      icon: Download,
      onClick: onExportData,
      variant: "secondary",
    },
    {
      label: "Settings",
      description: "Manage preferences",
      icon: Settings,
      href: "/dashboard/settings",
      variant: "outline",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500">Shortcuts to common tasks</p>
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-4 space-y-3"
      >
        {actions.map((action) => (
          <QuickActionButton
            key={action.label}
            action={action}
            variants={item}
          />
        ))}
      </motion.div>
    </div>
  )
}

interface QuickActionButtonProps {
  action: QuickAction
  variants: any
}

function QuickActionButton({ action, variants }: QuickActionButtonProps) {
  const content = (
    <motion.button
      variants={variants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={action.onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        action.variant === "primary"
          ? `bg-gradient-to-r ${action.gradient} text-white border-transparent shadow-lg hover:shadow-xl`
          : action.variant === "secondary"
          ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-md"
          : "bg-white border-slate-200 hover:border-orange-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            action.variant === "primary"
              ? "bg-white/20"
              : "bg-gradient-to-br from-orange-500 to-orange-600"
          }`}
        >
          <action.icon
            className={`w-5 h-5 ${
              action.variant === "primary" ? "text-white" : "text-white"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold mb-0.5 ${
              action.variant === "primary" ? "text-white" : "text-slate-900"
            }`}
          >
            {action.label}
          </p>
          <p
            className={`text-xs ${
              action.variant === "primary" ? "text-white/80" : "text-slate-600"
            }`}
          >
            {action.description}
          </p>
        </div>
      </div>
    </motion.button>
  )

  if (action.href) {
    return <Link href={action.href}>{content}</Link>
  }

  return content
}

/**
 * Compact Quick Actions Bar (for top of page)
 */
export function QuickActionsBar({ onStartScan, onOpenAgent }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onStartScan}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
      >
        <Search className="w-4 h-4 mr-2" />
        New Scan
      </Button>

      <Button
        onClick={onOpenAgent}
        variant="outline"
        className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Agent
      </Button>

      <Button variant="outline" size="icon">
        <Filter className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="icon">
        <Bell className="w-4 h-4" />
      </Button>
    </div>
  )
}
