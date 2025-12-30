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
    <div className="relative">
      {/* 3D Car Visual Element */}
      <div className="absolute -top-32 -right-16 w-96 h-96 opacity-20 pointer-events-none hidden lg:block">
        <div className="relative w-full h-full animate-float">
          {/* 3D Car Illustration using CSS */}
          <div className="absolute inset-0 transform-gpu perspective-1000">
            {/* Car Body */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl transform rotate-12 skew-y-6">
              {/* Windshield */}
              <div className="absolute top-4 left-8 w-20 h-16 bg-gradient-to-br from-blue-400/40 to-blue-500/60 rounded-t-2xl transform -skew-x-12 backdrop-blur-sm"></div>
              {/* Headlights */}
              <div className="absolute top-1/2 left-2 w-6 h-4 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50"></div>
              <div className="absolute bottom-8 left-2 w-6 h-4 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>
              {/* Wheels */}
              <div className="absolute -bottom-4 left-8 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-700 shadow-xl">
                <div className="absolute inset-2 bg-slate-600 rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 right-8 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-700 shadow-xl">
                <div className="absolute inset-2 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        <div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl shadow-[0_20px_60px_rgba(249,115,22,0.3)] hover:shadow-[0_30px_80px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
                <Car className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
            <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              <AnimatedCounter end={metrics.totalVehicles} suffix="+" />
            </div>
            <p className="text-orange-100 font-medium">Auctions Scanned Today</p>
            <p className="text-orange-200 text-xs mt-2">Live updates • Just now</p>
          </div>
        </div>

      <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl shadow-[0_20px_60px_rgba(59,130,246,0.3)] hover:shadow-[0_30px_80px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
              <TrendingUp className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-semibold backdrop-blur-sm shadow-lg">
              LIVE
            </div>
          </div>
          <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            <AnimatedCounter end={95} suffix="%" />
          </div>
          <p className="text-blue-100 font-medium">AI Accuracy Rate</p>
          <p className="text-blue-200 text-xs mt-2">Top 5% in the industry</p>
        </div>
      </div>

      <div className="group relative bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl shadow-[0_20px_60px_rgba(20,184,166,0.3)] hover:shadow-[0_30px_80px_rgba(20,184,166,0.4)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
              <Clock className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce shadow-lg"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
          <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            <AnimatedCounter end={metrics.avgSavings} suffix="+" />
          </div>
          <p className="text-teal-100 font-medium">Hours Saved Per Week</p>
          <p className="text-teal-200 text-xs mt-2">Average across all dealers</p>
        </div>
      </div>
    </div>
    </div>
  )
}
