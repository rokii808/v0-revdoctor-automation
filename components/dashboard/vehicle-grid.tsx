"use client"

import { motion } from "framer-motion"
import { Car, TrendingUp, AlertTriangle, Eye, ExternalLink, MapPin, Gauge, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { type PlanTier } from "@/lib/plans/config"
import { FeatureLock } from "./feature-lock"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  location?: string
  image_url?: string
  url?: string
  condition?: string
  ai_classification?: {
    verdict: "HEALTHY" | "AVOID" | "REVIEW"
    profit_potential?: number
    confidence?: number
    issues?: string[]
  }
  viewed?: boolean
}

interface VehicleGridProps {
  vehicles: Vehicle[]
  planTier: PlanTier
  canViewMore: boolean
  onViewVehicle?: (vehicleId: string) => void
}

export function VehicleGrid({ vehicles, planTier, canViewMore, onViewVehicle }: VehicleGridProps) {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Car className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">No vehicles found</h3>
        <p className="text-slate-600 text-sm">
          We'll notify you when new healthy cars are discovered
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          variants={item}
          canView={canViewMore || Boolean(vehicle.viewed)}
          onView={onViewVehicle}
          planTier={planTier}
        />
      ))}
    </motion.div>
  )
}

interface VehicleCardProps {
  vehicle: Vehicle
  index: number
  variants: any
  canView: boolean
  onView?: (vehicleId: string) => void
  planTier: PlanTier
}

function VehicleCard({ vehicle, index, variants, canView, onView, planTier }: VehicleCardProps) {
  const isHealthy = vehicle.ai_classification?.verdict === "HEALTHY"
  const isAvoid = vehicle.ai_classification?.verdict === "AVOID"
  const profitPotential = vehicle.ai_classification?.profit_potential || 0

  const verdictConfig = {
    HEALTHY: {
      badge: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      border: "border-green-200",
      glow: "shadow-green-500/20",
      icon: TrendingUp,
    },
    AVOID: {
      badge: "bg-gradient-to-r from-red-500 to-red-600 text-white",
      border: "border-red-200",
      glow: "shadow-red-500/20",
      icon: AlertTriangle,
    },
    REVIEW: {
      badge: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
      border: "border-yellow-200",
      glow: "shadow-yellow-500/20",
      icon: Eye,
    },
  }

  const config = verdictConfig[vehicle.ai_classification?.verdict || "REVIEW"]

  // Lock card if user can't view more
  if (!canView && !vehicle.viewed) {
    return (
      <motion.div
        variants={variants}
        className="relative"
      >
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50">
          {/* Blurred Content */}
          <div className="blur-md pointer-events-none select-none opacity-40">
            <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="p-5">
              <div className="h-6 bg-slate-200 rounded mb-2 w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-sm">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-medium text-slate-900 text-sm mb-1">Daily Limit Reached</p>
              <p className="text-xs text-slate-600 mb-3">Upgrade to see more cars</p>
              <Link href="/pricing">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div className={`bg-white rounded-2xl border-2 ${config.border} overflow-hidden shadow-lg ${config.glow} hover:shadow-xl transition-shadow duration-300`}>
        {/* Vehicle Image */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-16 h-16 text-slate-300" />
            </div>
          )}

          {/* AI Verdict Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${config.badge} shadow-lg font-semibold`}>
              <config.icon className="w-3.5 h-3.5 mr-1.5" />
              {vehicle.ai_classification?.verdict}
            </Badge>
          </div>

          {/* Profit Potential Badge */}
          {isHealthy && profitPotential > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg font-semibold">
                +£{profitPotential.toLocaleString()} ROI
              </Badge>
            </div>
          )}

          {/* Viewed Indicator */}
          {vehicle.viewed && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Viewed
              </Badge>
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="p-5">
          {/* Title */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-slate-900 mb-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {vehicle.condition && (
                <Badge variant="outline" className="text-xs">
                  {vehicle.condition}
                </Badge>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Mileage</p>
                <p className="font-semibold text-slate-900">{vehicle.mileage.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Year</p>
                <p className="font-semibold text-slate-900">{vehicle.year}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {vehicle.location && (
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{vehicle.location}</span>
            </div>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Price</p>
              <p className="text-2xl font-bold text-slate-900">
                £{vehicle.price.toLocaleString()}
              </p>
            </div>

            {vehicle.url && (
              <Link href={vehicle.url} target="_blank">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
                  onClick={() => onView?.(vehicle.id)}
                >
                  View Listing
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* AI Issues (if AVOID) */}
          {isAvoid && vehicle.ai_classification?.issues && vehicle.ai_classification.issues.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-1.5">Issues Detected:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {vehicle.ai_classification.issues.slice(0, 2).map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence Score */}
          {vehicle.ai_classification?.confidence && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  style={{ width: `${vehicle.ai_classification.confidence}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {vehicle.ai_classification.confidence}% confident
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
