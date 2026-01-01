"use client"

import { Button } from "@/components/ui/button"
import { Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getUpgradeMessage, type PlanTier } from "@/lib/plans/config"

interface FeatureLockProps {
  feature: string
  currentTier: PlanTier
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function FeatureLock({
  feature,
  currentTier,
  title,
  description,
  children,
  className = '',
}: FeatureLockProps) {
  const message = description || getUpgradeMessage(feature, currentTier)

  return (
    <div className={`relative ${className}`}>
      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-sm rounded-lg border-2 border-dashed border-orange-300">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>

          {title && (
            <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
          )}

          <p className="text-slate-600 text-sm mb-6">{message}</p>

          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              Unlock This Feature
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple feature lock card without blurred background
 */
export function FeatureLockCard({
  feature,
  currentTier,
  title,
  description,
}: Omit<FeatureLockProps, 'children' | 'className'>) {
  const message = description || getUpgradeMessage(feature, currentTier)

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-dashed border-orange-300 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-orange-600" />
        </div>

        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
          )}

          <p className="text-slate-600 text-sm mb-4">{message}</p>

          <Link href="/pricing">
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              Upgrade to Unlock
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
