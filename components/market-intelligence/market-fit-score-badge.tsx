"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Zap, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface MarketFitScoreBadgeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

/**
 * Market Fit Score Badge - THE PRIMARY METRIC
 * Prominently displayed on every vehicle card
 * This is what dealers will make decisions on
 */
export function MarketFitScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  animated = false,
}: MarketFitScoreBadgeProps) {

  const { color, bgColor, borderColor, textColor, icon, label } = getScoreDisplay(score)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const Icon = icon

  const badge = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        "border-2 transition-all duration-300",
        sizeClasses[size],
        bgColor,
        borderColor,
        textColor,
      )}
    >
      <Icon className={cn(iconSizes[size], "flex-shrink-0")} />
      <span className="font-bold">{score}</span>
      {showLabel && size !== 'sm' && (
        <span className="font-medium opacity-90">/100</span>
      )}
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}

/**
 * Full Market Fit Card with details
 */
interface MarketFitCardProps {
  score: number
  predictedDaysMin: number
  predictedDaysMax: number
  confidenceLevel: 'low' | 'medium' | 'high' | 'very_high'
  isFastMover: boolean
  recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass'
}

export function MarketFitCard({
  score,
  predictedDaysMin,
  predictedDaysMax,
  confidenceLevel,
  isFastMover,
  recommendation,
}: MarketFitCardProps) {

  const { color, bgColor, borderColor, textColor, icon, label } = getScoreDisplay(score)
  const Icon = icon

  const recommendationConfig = {
    strong_buy: { label: 'STRONG BUY', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    buy: { label: 'BUY', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    consider: { label: 'CONSIDER', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    pass: { label: 'PASS', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  }

  const recConfig = recommendationConfig[recommendation]

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3">
      {/* Header: Score + Recommendation */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Market Fit Score
          </div>
          <MarketFitScoreBadge score={score} size="lg" animated />
        </div>

        <div className={cn(
          "px-3 py-1 rounded-lg border-2 text-xs font-bold uppercase tracking-wide",
          recConfig.bg,
          recConfig.color,
          recConfig.border
        )}>
          {recConfig.label}
        </div>
      </div>

      {/* Predicted Days to Sell */}
      <div className="pt-3 border-t border-slate-200">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Est. Days to Sell
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {predictedDaysMin}-{predictedDaysMax}
          </span>
          <span className="text-sm text-slate-500">days</span>
          {isFastMover && (
            <div className="ml-auto">
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
          )}
        </div>

        {/* Confidence indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                confidenceLevel === 'very_high' && "bg-green-500 w-full",
                confidenceLevel === 'high' && "bg-blue-500 w-3/4",
                confidenceLevel === 'medium' && "bg-yellow-500 w-1/2",
                confidenceLevel === 'low' && "bg-slate-400 w-1/4",
              )}
            />
          </div>
          <span className="text-xs text-slate-500 capitalize">{confidenceLevel} confidence</span>
        </div>
      </div>

      {/* Fast Mover Badge */}
      {isFastMover && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <Zap className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-semibold text-orange-700">
            Fast Mover - Expected &lt;21 days
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Helper to get display properties based on score
 */
function getScoreDisplay(score: number) {
  if (score >= 85) {
    return {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: TrendingUp,
      label: 'Excellent',
    }
  }

  if (score >= 70) {
    return {
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      icon: TrendingUp,
      label: 'Good',
    }
  }

  if (score >= 55) {
    return {
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      icon: Minus,
      label: 'Fair',
    }
  }

  if (score >= 40) {
    return {
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      icon: TrendingDown,
      label: 'Below Average',
    }
  }

  return {
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    icon: AlertTriangle,
    label: 'Poor',
  }
}
