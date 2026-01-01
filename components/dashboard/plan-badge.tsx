"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Sparkles, Rocket } from "lucide-react"
import { type PlanTier } from "@/lib/plans/config"

interface PlanBadgeProps {
  tier: PlanTier
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PlanBadge({ tier, showIcon = true, size = 'md' }: PlanBadgeProps) {
  const config = getPlanBadgeConfig(tier)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <Badge
      className={`${config.className} ${sizeClasses[size]} font-semibold border-0 shadow-sm`}
    >
      {showIcon && (
        <config.icon className={`${iconSizes[size]} mr-1.5`} />
      )}
      {config.label}
    </Badge>
  )
}

function getPlanBadgeConfig(tier: PlanTier) {
  const configs = {
    trial: {
      label: 'Free Trial',
      icon: Sparkles,
      className: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
    },
    starter: {
      label: 'Starter',
      icon: Zap,
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    },
    premium: {
      label: 'Premium',
      icon: Crown,
      className: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
    },
    pro: {
      label: 'Pro',
      icon: Rocket,
      className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    },
  }

  return configs[tier] || configs.trial
}
