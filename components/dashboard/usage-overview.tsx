"use client"

import { motion } from "framer-motion"
import { TrendingUp, Crown, Zap, Eye, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { type PlanTier, getPlanConfig } from "@/lib/plans/config"
import { type UsageStats } from "@/lib/plans/usage-tracker"
import { PlanBadge } from "./plan-badge"

interface UsageOverviewProps {
  planTier: PlanTier
  stats: UsageStats
  compact?: boolean
}

export function UsageOverview({ planTier, stats, compact = false }: UsageOverviewProps) {
  const planConfig = getPlanConfig(planTier)
  const isNearLimit = stats.percentage >= 80
  const isAtLimit = !stats.canView
  const isTrial = planTier === "trial"

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <PlanBadge tier={planTier} size="sm" />
          <Link href="/pricing">
            <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Upgrade
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-600">Daily Views</span>
            <span className="text-sm font-bold text-slate-900">
              {stats.viewedToday}/{stats.limit}
            </span>
          </div>
          <Progress
            value={stats.percentage}
            className="h-2"
            indicatorClassName={
              isAtLimit
                ? "bg-red-500"
                : isNearLimit
                ? "bg-orange-500"
                : "bg-green-500"
            }
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl -ml-12 -mb-12" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-xs font-medium mb-1">Current Plan</p>
              <PlanBadge tier={planTier} size="lg" />
            </div>
            {isTrial && (
              <Badge className="bg-white/20 text-white border-white/30">
                Trial
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {planTier === "trial" ? "Free" : `£${planConfig.price}`}
            </span>
            {planTier !== "trial" && (
              <span className="text-white/80 text-sm">/month</span>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6 space-y-6">
        {/* Daily Limit */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isAtLimit
                  ? "bg-red-50"
                  : isNearLimit
                  ? "bg-orange-50"
                  : "bg-green-50"
              }`}>
                <Eye className={`w-4 h-4 ${
                  isAtLimit
                    ? "text-red-600"
                    : isNearLimit
                    ? "text-orange-600"
                    : "text-green-600"
                }`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Daily Views</p>
                <p className="text-xs text-slate-500">Resets in {getTimeUntilReset(stats.resetAt)}</p>
              </div>
            </div>
            <Badge variant={isAtLimit ? "destructive" : "secondary"}>
              {stats.remaining} left
            </Badge>
          </div>

          <div className="space-y-2">
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
            <p className="text-xs text-slate-500 text-right">{Math.round(stats.percentage)}% used</p>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Plan Features</p>
          <div className="space-y-2">
            <FeatureItem
              label="Daily Car Limit"
              value={`${planConfig.features.dailyCarLimit} cars/day`}
            />
            <FeatureItem
              label="Saved Searches"
              value={planConfig.features.savedSearchesLimit === 999 ? "Unlimited" : `${planConfig.features.savedSearchesLimit}`}
            />
            <FeatureItem
              label="AI Analysis"
              value={planConfig.features.advancedAI ? "Advanced" : "Basic"}
            />
            <FeatureItem
              label="ROI Tracking"
              value={planConfig.features.roiTracking ? "Enabled" : "Disabled"}
              highlight={!planConfig.features.roiTracking}
            />
          </div>
        </div>

        {/* Upgrade CTA */}
        {(isAtLimit || isTrial) && (
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-3">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                {isAtLimit ? "Limit Reached!" : "Unlock More Features"}
              </p>
              <p className="text-xs text-slate-600">
                {isAtLimit
                  ? "Upgrade to see more cars daily and unlock advanced features"
                  : "Upgrade to get more daily views, advanced AI, and ROI tracking"}
              </p>
            </div>
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md">
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Manage Plan */}
        {!isTrial && (
          <Link href="/dashboard/billing">
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

interface FeatureItemProps {
  label: string
  value: string
  highlight?: boolean
}

function FeatureItem({ label, value, highlight }: FeatureItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
      <span className="text-xs text-slate-600">{label}</span>
      <span className={`text-xs font-semibold ${
        highlight ? "text-orange-600" : "text-slate-900"
      }`}>
        {value}
      </span>
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
