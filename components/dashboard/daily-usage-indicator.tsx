"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Lock, Zap } from "lucide-react"
import { type UsageStats } from "@/lib/plans/usage-tracker"
import { type PlanTier } from "@/lib/plans/config"
import Link from "next/link"

interface DailyUsageIndicatorProps {
  stats: UsageStats
  planTier: PlanTier
  compact?: boolean
}

export function DailyUsageIndicator({ stats, planTier, compact = false }: DailyUsageIndicatorProps) {
  const isNearLimit = stats.percentage >= 80
  const isAtLimit = !stats.canView

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "default" : "secondary"} className="text-xs">
          {stats.viewedToday}/{stats.limit} cars today
        </Badge>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-green-500'}`} />
          <h3 className="font-semibold text-slate-900">Daily Limit</h3>
        </div>
        <Badge variant={isAtLimit ? "destructive" : "secondary"}>
          {stats.remaining} remaining
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{stats.viewedToday}</span>
          <span className="text-sm text-slate-500">of {stats.limit} cars</span>
        </div>

        <Progress
          value={stats.percentage}
          className="h-3"
          indicatorClassName={
            isAtLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-orange-500"
              : "bg-green-500"
          }
        />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{Math.round(stats.percentage)}% used</span>
          <span>Resets in {getTimeUntilReset(stats.resetAt)}</span>
        </div>

        {isAtLimit && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm mb-1">
                  Daily Limit Reached
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  You've viewed all {stats.limit} cars for today. Upgrade to see more vehicles daily!
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-900">
              ⚠️ You're running low on daily views. Consider upgrading to see more cars!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeUntilReset(resetAt: Date): string {
  const now = new Date()
  const diff = resetAt.getTime() - now.getTime()

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
