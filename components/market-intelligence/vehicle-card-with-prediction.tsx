"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarketFitScoreBadge } from "./market-fit-score-badge"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Gauge,
  MapPin,
  Zap,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface VehiclePrediction {
  marketFitScore: number
  predictedDaysToSellMin: number
  predictedDaysToSellMax: number
  confidenceLevel: 'low' | 'medium' | 'high' | 'very_high'
  estimatedRetailPrice: number
  estimatedReconCost: number
  trueProfitEstimate: number
  capitalRoiMonthly: number
  localDemandLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  competitiveListingsCount: number
  isFastMover: boolean
  isSlowMover: boolean
  riskFlags: string[]
  opportunityFlags: string[]
  recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass'
  recommendationReason: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  condition?: string
  listingUrl: string
  auctionSite: string
}

interface VehicleCardWithPredictionProps {
  vehicle: Vehicle
  prediction: VehiclePrediction
  onViewDetails?: (vehicleId: string) => void
}

/**
 * Enhanced Vehicle Card with Market Fit Score
 * This is THE primary UI component dealers interact with
 * Market Fit Score is the HERO metric, displayed prominently
 */
export function VehicleCardWithPrediction({
  vehicle,
  prediction,
  onViewDetails,
}: VehicleCardWithPredictionProps) {

  const [showDetails, setShowDetails] = useState(false)

  const recommendationConfig = {
    strong_buy: {
      label: 'STRONG BUY',
      color: 'bg-green-600',
      textColor: 'text-white',
      glow: 'shadow-green-500/50',
    },
    buy: {
      label: 'BUY',
      color: 'bg-blue-600',
      textColor: 'text-white',
      glow: 'shadow-blue-500/50',
    },
    consider: {
      label: 'CONSIDER',
      color: 'bg-yellow-500',
      textColor: 'text-slate-900',
      glow: 'shadow-yellow-500/50',
    },
    pass: {
      label: 'PASS',
      color: 'bg-slate-400',
      textColor: 'text-white',
      glow: 'shadow-slate-500/50',
    },
  }

  const recConfig = recommendationConfig[prediction.recommendation]

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-xl",
      prediction.recommendation === 'strong_buy' && "ring-2 ring-green-500 ring-offset-2",
      prediction.isFastMover && "border-orange-500 border-2",
    )}>
      <CardContent className="p-0">
        {/* Hero Section: Market Fit Score */}
        <div className={cn(
          "relative px-6 py-4 border-b-2",
          prediction.marketFitScore >= 85 && "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
          prediction.marketFitScore >= 70 && prediction.marketFitScore < 85 && "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200",
          prediction.marketFitScore >= 55 && prediction.marketFitScore < 70 && "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200",
          prediction.marketFitScore < 55 && "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200",
        )}>
          <div className="flex items-start justify-between gap-4">
            {/* LEFT: Market Fit Score (THE HERO) */}
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Market Fit Score
              </div>
              <MarketFitScoreBadge score={prediction.marketFitScore} size="lg" animated />

              {/* Quick metrics */}
              <div className="mt-3 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-700">
                    {prediction.predictedDaysToSellMin}-{prediction.predictedDaysToSellMax} days
                  </span>
                </div>
                {prediction.isFastMover && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Zap className="w-4 h-4 fill-orange-600" />
                    <span className="text-xs font-bold">FAST MOVER</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Recommendation Badge */}
            <div className={cn(
              "px-4 py-2 rounded-lg shadow-lg",
              recConfig.color,
              recConfig.textColor,
              recConfig.glow,
            )}>
              <div className="text-xs font-bold uppercase tracking-wider">
                {recConfig.label}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info Section */}
        <div className="px-6 py-4">
          {/* Vehicle Title */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
                {vehicle.mileage && (
                  <span className="flex items-center gap-1">
                    <Gauge className="w-4 h-4" />
                    {vehicle.mileage.toLocaleString()} mi
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vehicle.auctionSite}
                </span>
              </div>
            </div>

            {/* Acquisition Price */}
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Purchase Price</div>
              <div className="text-2xl font-bold text-slate-900">
                ${vehicle.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Financial Projections Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricBox
              label="Retail Price"
              value={`$${prediction.estimatedRetailPrice.toLocaleString()}`}
              icon={DollarSign}
            />
            <MetricBox
              label="True Profit"
              value={`$${prediction.trueProfitEstimate.toLocaleString()}`}
              icon={TrendingUp}
              highlight={prediction.trueProfitEstimate >= 3000}
            />
            <MetricBox
              label="Recon Cost"
              value={`$${prediction.estimatedReconCost.toLocaleString()}`}
              icon={DollarSign}
              subtle
            />
            <MetricBox
              label="Monthly ROI"
              value={`${prediction.capitalRoiMonthly.toFixed(1)}%`}
              icon={TrendingUp}
              highlight={prediction.capitalRoiMonthly >= 15}
            />
          </div>

          {/* Opportunity & Risk Flags */}
          {(prediction.opportunityFlags.length > 0 || prediction.riskFlags.length > 0) && (
            <div className="space-y-2 mb-4">
              {prediction.opportunityFlags.slice(0, 2).map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
              {prediction.riskFlags.slice(0, 1).map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}

          {/* Expandable Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  {/* Market Context */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Market Context
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Local Demand</div>
                        <div className="text-sm font-semibold capitalize text-slate-700">
                          {prediction.localDemandLevel.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Competition</div>
                        <div className="text-sm font-semibold text-slate-700">
                          {prediction.competitiveListingsCount} similar listings
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Reason */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Analysis
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {prediction.recommendationReason}
                    </p>
                  </div>

                  {/* All Flags */}
                  {prediction.riskFlags.length > 1 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Risk Factors
                      </div>
                      <div className="space-y-1">
                        {prediction.riskFlags.slice(1).map((flag, idx) => (
                          <div key={idx} className="text-xs text-orange-700 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Less Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  More Details
                </>
              )}
            </Button>

            <Button
              asChild
              size="sm"
              className={cn(
                "flex-1",
                prediction.recommendation === 'strong_buy' && "bg-green-600 hover:bg-green-700",
                prediction.recommendation === 'buy' && "bg-blue-600 hover:bg-blue-700",
              )}
            >
              <a href={vehicle.listingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Listing
              </a>
            </Button>

            {onViewDetails && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onViewDetails(vehicle.id)}
                className="flex-1"
              >
                Full Analysis
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Metric Box Component
 */
function MetricBox({
  label,
  value,
  icon: Icon,
  highlight = false,
  subtle = false,
}: {
  label: string
  value: string
  icon: any
  highlight?: boolean
  subtle?: boolean
}) {
  return (
    <div className={cn(
      "px-3 py-2 rounded-lg border transition-all",
      highlight && "bg-green-50 border-green-200",
      subtle && "bg-slate-50 border-slate-200",
      !highlight && !subtle && "bg-white border-slate-200",
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn(
          "w-3.5 h-3.5",
          highlight ? "text-green-600" : subtle ? "text-slate-400" : "text-slate-500"
        )} />
        <div className="text-xs text-slate-500 font-medium">{label}</div>
      </div>
      <div className={cn(
        "text-sm font-bold",
        highlight ? "text-green-700" : "text-slate-900"
      )}>
        {value}
      </div>
    </div>
  )
}
