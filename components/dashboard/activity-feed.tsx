"use client"

import { motion } from "framer-motion"
import { TrendingUp, AlertTriangle, Eye, Clock, CheckCircle2, XCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "scan" | "view" | "classification" | "alert"
  title: string
  description: string
  timestamp: Date
  metadata?: {
    verdict?: "HEALTHY" | "AVOID" | "REVIEW"
    vehicleInfo?: string
    profit?: number
  }
}

interface ActivityFeedProps {
  activities: Activity[]
  compact?: boolean
}

export function ActivityFeed({ activities, compact = false }: ActivityFeedProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-600">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Latest scans and classifications</p>
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={compact ? "divide-y divide-slate-100" : "p-4 space-y-3"}
      >
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            variants={item}
            compact={compact}
          />
        ))}
      </motion.div>
    </div>
  )
}

interface ActivityItemProps {
  activity: Activity
  variants: any
  compact?: boolean
}

function ActivityItem({ activity, variants, compact }: ActivityItemProps) {
  const typeConfig = {
    scan: {
      icon: Eye,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
    view: {
      icon: Eye,
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      iconBg: "bg-purple-500",
    },
    classification: {
      icon: activity.metadata?.verdict === "HEALTHY" ? CheckCircle2 :
            activity.metadata?.verdict === "AVOID" ? XCircle : Zap,
      gradient: activity.metadata?.verdict === "HEALTHY" ? "from-green-500 to-green-600" :
                activity.metadata?.verdict === "AVOID" ? "from-red-500 to-red-600" :
                "from-yellow-500 to-yellow-600",
      bg: activity.metadata?.verdict === "HEALTHY" ? "bg-green-50" :
          activity.metadata?.verdict === "AVOID" ? "bg-red-50" :
          "bg-yellow-50",
      iconBg: activity.metadata?.verdict === "HEALTHY" ? "bg-green-500" :
              activity.metadata?.verdict === "AVOID" ? "bg-red-500" :
              "bg-yellow-500",
    },
    alert: {
      icon: AlertTriangle,
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      iconBg: "bg-orange-500",
    },
  }

  const config = typeConfig[activity.type]

  if (compact) {
    return (
      <motion.div
        variants={variants}
        className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <config.icon className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm mb-0.5">{activity.title}</p>
          <p className="text-xs text-slate-600 line-clamp-1">{activity.description}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>

        {activity.metadata?.verdict && (
          <Badge
            variant="outline"
            className={`text-xs ${
              activity.metadata.verdict === "HEALTHY"
                ? "border-green-200 text-green-700"
                : activity.metadata.verdict === "AVOID"
                ? "border-red-200 text-red-700"
                : "border-yellow-200 text-yellow-700"
            }`}
          >
            {activity.metadata.verdict}
          </Badge>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-lg shadow-${config.iconBg}/30`}>
          <config.icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-slate-900">{activity.title}</p>
            {activity.metadata?.verdict && (
              <Badge
                className={`text-xs ${
                  activity.metadata.verdict === "HEALTHY"
                    ? "bg-green-100 text-green-700"
                    : activity.metadata.verdict === "AVOID"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {activity.metadata.verdict}
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-2">{activity.description}</p>

          {activity.metadata?.vehicleInfo && (
            <p className="text-xs text-slate-500 mb-2">{activity.metadata.vehicleInfo}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </div>

            {activity.metadata?.profit && activity.metadata.profit > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +£{activity.metadata.profit.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Generate mock activity data (for testing)
 */
export function generateMockActivities(): Activity[] {
  const now = new Date()

  return [
    {
      id: "1",
      type: "classification",
      title: "Healthy Car Found",
      description: "2019 BMW 3 Series classified as HEALTHY with high profit potential",
      timestamp: new Date(now.getTime() - 1000 * 60 * 5), // 5 mins ago
      metadata: {
        verdict: "HEALTHY",
        vehicleInfo: "BMW 3 Series • 45,000 miles • £18,500",
        profit: 3500,
      },
    },
    {
      id: "2",
      type: "scan",
      title: "New Scan Completed",
      description: "Scanned 15 vehicles from AutoTrader",
      timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 mins ago
    },
    {
      id: "3",
      type: "classification",
      title: "Vehicle Flagged",
      description: "2018 Audi A4 classified as AVOID due to multiple issues",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
      metadata: {
        verdict: "AVOID",
        vehicleInfo: "Audi A4 • 85,000 miles • £15,200",
      },
    },
    {
      id: "4",
      type: "view",
      title: "Vehicle Viewed",
      description: "You viewed 2020 Mercedes C-Class listing details",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
      metadata: {
        vehicleInfo: "Mercedes C-Class • 32,000 miles • £22,900",
      },
    },
    {
      id: "5",
      type: "alert",
      title: "Daily Limit Warning",
      description: "You've used 80% of your daily car views",
      timestamp: new Date(now.getTime() - 1000 * 60 * 120), // 2 hours ago
    },
  ]
}
