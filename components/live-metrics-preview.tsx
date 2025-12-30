"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AnimatedCounter } from "./animated-counter"
import { Car, TrendingUp, Clock, MapPin } from "lucide-react"

export function LiveMetricsPreview() {
  const [metrics, setMetrics] = useState({
    totalVehicles: 500,
    activeAuctions: 12,
    avgSavings: 30,
  })

  useEffect(() => {
    const supabase = createClient()

    // Fetch real-time vehicle count
    const fetchMetrics = async () => {
      const { count: vehicleCount } = await supabase
        .from("vehicle_matches")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (vehicleCount) {
        setMetrics((prev) => ({ ...prev, totalVehicles: vehicleCount }))
      }
    }

    fetchMetrics()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("vehicle_matches_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicle_matches" }, () => {
        fetchMetrics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Car className="w-10 h-10 text-white opacity-80" />
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            <AnimatedCounter end={metrics.totalVehicles} suffix="+" />
          </div>
          <p className="text-orange-100 font-medium">Auctions Scanned Today</p>
          <p className="text-orange-200 text-xs mt-2">Live updates • Just now</p>
        </div>
      </div>

      <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-white opacity-80" />
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-semibold backdrop-blur-sm">
              LIVE
            </div>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            <AnimatedCounter end={95} suffix="%" />
          </div>
          <p className="text-blue-100 font-medium">AI Accuracy Rate</p>
          <p className="text-blue-200 text-xs mt-2">Top 5% in the industry</p>
        </div>
      </div>

      <div className="group relative bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-10 h-10 text-white opacity-80" />
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            <AnimatedCounter end={metrics.avgSavings} suffix="+" />
          </div>
          <p className="text-teal-100 font-medium">Hours Saved Per Week</p>
          <p className="text-teal-200 text-xs mt-2">Average across all dealers</p>
        </div>
      </div>
    </div>
  )
}
