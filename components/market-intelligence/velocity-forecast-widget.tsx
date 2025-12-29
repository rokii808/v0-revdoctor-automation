"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Zap, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface VelocityForecastProps {
  currentAvgTurnDays: number
  predictedAvgTurnDays: number
  totalVehiclesInPipeline: number
  fastMoversCount: number
  estimatedMonthlySavings: number
  capitalVelocityImprovement: number
}

/**
 * Velocity Forecast Widget
 * Shows the BIG PICTURE business impact of using RevvDoctor's predictions
 * This widget demonstrates the ROI and keeps dealers engaged
 */
export function VelocityForecastWidget({
  currentAvgTurnDays,
  predictedAvgTurnDays,
  totalVehiclesInPipeline,
  fastMoversCount,
  estimatedMonthlySavings,
  capitalVelocityImprovement,
}: VelocityForecastProps) {

  const improvement = currentAvgTurnDays - predictedAvgTurnDays
  const improvementPercent = ((improvement / currentAvgTurnDays) * 100).toFixed(1)

  const isImprovement = improvement > 0

  return (
    <Card className="overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-orange-600 fill-orange-600" />
            <span>Inventory Velocity Forecast</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
            Live Predictions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Performance */}
          <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Current Avg Turn
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-700">
              {currentAvgTurnDays}
            </div>
            <div className="text-sm text-slate-500 mt-1">days</div>
          </div>

          {/* Predicted Performance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-500 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  With RevvDoctor
                </div>
              </div>
              <div className="text-4xl font-bold text-green-700">
                {predictedAvgTurnDays}
              </div>
              <div className="text-sm text-green-600 mt-1">days</div>
            </div>
          </div>
        </div>

        {/* Improvement Indicator */}
        {isImprovement && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg shadow-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium opacity-90">Projected Improvement</div>
                  <div className="text-2xl font-bold">
                    {improvement} days faster
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {improvementPercent}%
                </div>
                <div className="text-sm opacity-90">faster turns</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Impact Grid */}
        <div className="grid grid-cols-2 gap-3">
          <ImpactMetric
            icon={DollarSign}
            label="Est. Monthly Savings"
            value={`$${estimatedMonthlySavings.toLocaleString()}`}
            subtitle="in flooring costs"
            color="green"
          />
          <ImpactMetric
            icon={TrendingUp}
            label="Capital Velocity"
            value={`+${capitalVelocityImprovement}%`}
            subtitle="more profit potential"
            color="blue"
          />
        </div>

        {/* Pipeline Stats */}
        <div className="pt-4 border-t-2 border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Today's Pipeline
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              icon={BarChart3}
              value={totalVehiclesInPipeline}
              label="Vehicles"
            />
            <StatBox
              icon={Zap}
              value={fastMoversCount}
              label="Fast Movers"
              highlight
            />
            <StatBox
              icon={Calendar}
              value={predictedAvgTurnDays}
              label="Avg Days"
            />
          </div>
        </div>

        {/* CTA Message */}
        <div className="bg-slate-900 text-white rounded-xl p-4">
          <div className="text-sm font-semibold mb-1">
            💡 Pro Tip
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Focus on vehicles with Market Fit Score <span className="font-bold">85+</span> for the fastest turns.
            Your current pipeline has <span className="font-bold">{fastMoversCount}</span> ready to move in &lt;21 days.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Impact Metric Component
 */
function ImpactMetric({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: any
  label: string
  value: string
  subtitle: string
  color: 'green' | 'blue' | 'orange'
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }

  return (
    <div className={cn(
      "rounded-lg border-2 p-3",
      colorClasses[color]
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
          {label}
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5">
        {value}
      </div>
      <div className="text-xs opacity-75">
        {subtitle}
      </div>
    </div>
  )
}

/**
 * Stat Box Component
 */
function StatBox({
  icon: Icon,
  value,
  label,
  highlight = false,
}: {
  icon: any
  value: number
  label: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg p-3 border-2 transition-all",
      highlight ? "bg-orange-50 border-orange-300" : "bg-white border-slate-200"
    )}>
      <Icon className={cn(
        "w-4 h-4 mb-2",
        highlight ? "text-orange-600" : "text-slate-400"
      )} />
      <div className={cn(
        "text-xl font-bold",
        highlight ? "text-orange-700" : "text-slate-900"
      )}>
        {value}
      </div>
      <div className="text-xs text-slate-500">
        {label}
      </div>
    </div>
  )
}

/**
 * Compact version for smaller widgets
 */
export function VelocityForecastCompact({
  currentAvgTurnDays,
  predictedAvgTurnDays,
  estimatedMonthlySavings,
}: {
  currentAvgTurnDays: number
  predictedAvgTurnDays: number
  estimatedMonthlySavings: number
}) {
  const improvement = currentAvgTurnDays - predictedAvgTurnDays

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-orange-600 fill-orange-600" />
        <div className="text-sm font-bold text-slate-900">Velocity Forecast</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 mb-1">Current → Predicted</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-700">{currentAvgTurnDays}</span>
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{predictedAvgTurnDays}</span>
            <span className="text-sm text-slate-500">days</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Save per month</div>
          <div className="text-xl font-bold text-green-600">
            ${estimatedMonthlySavings.toLocaleString()}
          </div>
        </div>
      </div>

      {improvement > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200 text-xs text-slate-600">
          <span className="font-semibold text-green-600">{improvement} days faster</span> inventory turns
        </div>
      )}
    </div>
  )
}
