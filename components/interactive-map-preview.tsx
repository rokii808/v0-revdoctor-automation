"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Car, MapPin, Sparkles } from "lucide-react"
import { Button } from "./ui/button"

interface VehiclePin {
  id: string
  make: string
  model: string
  price: number
  location: string
  x: number
  y: number
}

export function InteractiveMapPreview() {
  const [vehicles, setVehicles] = useState<VehiclePin[]>([
    { id: "1", make: "BMW", model: "3 Series", price: 12500, location: "Manchester", x: 45, y: 35 },
    { id: "2", make: "Audi", model: "A4", price: 15800, location: "Birmingham", x: 52, y: 58 },
    { id: "3", make: "Mercedes", model: "C-Class", price: 11200, location: "Leeds", x: 58, y: 28 },
    { id: "4", make: "VW", model: "Golf GTI", price: 9500, location: "Liverpool", x: 38, y: 42 },
    { id: "5", make: "Toyota", model: "RAV4", price: 18200, location: "London", x: 68, y: 72 },
  ])
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePin | null>(null)
  const [hoveredVehicle, setHoveredVehicle] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Fetch real vehicle data
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from("vehicle_matches")
        .select("id, make, model, price, location")
        .limit(8)
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        // Map real data to random positions on the map
        const mapped = data.map((v: any, i: number) => ({
          id: v.id,
          make: v.make || "Unknown",
          model: v.model || "Model",
          price: v.price || 0,
          location: v.location || "UK",
          x: 35 + ((i * 8) % 40),
          y: 25 + ((i * 12) % 50),
        }))
        setVehicles(mapped)
      }
    }

    fetchVehicles()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("vehicle_pins")
      // @ts-expect-error - Supabase real-time types are complex, suppressing for dummy client compatibility
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vehicle_matches" }, () => {
        fetchVehicles()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-200 shadow-lg sm:shadow-2xl">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Map Content */}
      <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Live Auction Coverage</h3>
              <p className="text-xs sm:text-sm text-slate-600">Real-time vehicle tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm flex-shrink-0">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-slate-700">{vehicles.length} Active</span>
          </div>
        </div>

        {/* Simplified UK Map with Pins */}
        <div className="relative w-full flex-1 min-h-0 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-2xl border border-slate-200 shadow-inner overflow-hidden">
          {/* UK Outline (simplified SVG) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M 50 10 Q 60 15 65 25 L 70 40 Q 72 50 68 60 L 65 70 Q 60 80 50 85 L 40 88 Q 30 85 25 75 L 22 60 Q 20 50 22 40 L 25 25 Q 30 15 40 12 Z"
              fill="none"
              stroke="rgb(148 163 184)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Vehicle Pins - Orange Board Pin Style */}
          {vehicles.map((vehicle, index) => (
            <button
              key={vehicle.id}
              className="group absolute transform -translate-x-1/2 translate-y-0 transition-all duration-300 hover:scale-110 hover:z-50"
              style={{
                left: `${vehicle.x}%`,
                top: `${vehicle.y}%`,
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => setSelectedVehicle(vehicle)}
              onMouseEnter={() => setHoveredVehicle(vehicle.id)}
              onMouseLeave={() => setHoveredVehicle(null)}
            >
              {/* Pulse Ring */}
              <div className="absolute -inset-4 sm:-inset-6 bg-orange-400 rounded-full opacity-15 group-hover:opacity-30 animate-ping"></div>

              {/* Board Pin Container */}
              <div className="relative flex flex-col items-center">
                {/* Pin Head - Large & Detailed */}
                <div className="relative w-9 h-9 sm:w-12 sm:h-12 mb-0.5 sm:mb-1 group-hover:mb-2 transition-all duration-300">
                  {/* Outer ring for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.6)] transition-shadow"></div>

                  {/* Inner gradient circle */}
                  <div className="absolute inset-1 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>

                  {/* Highlight effect for 3D look */}
                  <div className="absolute inset-2 bg-gradient-to-br from-white/40 to-transparent rounded-full"></div>

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg relative z-10" />
                  </div>

                  {/* Bottom shadow for depth */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-1.5 sm:h-2 bg-orange-900/30 blur-sm rounded-full"></div>
                </div>

                {/* Pin Point/Needle */}
                <div className="relative w-0.5 h-4 sm:h-6 bg-gradient-to-b from-orange-600 to-orange-800 rounded-full shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>

                {/* Pin Shadow at bottom */}
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-2 sm:h-3 bg-slate-900/20 blur-md rounded-full"></div>
              </div>

              {/* Price Tag - Shows on Hover/Click */}
              {hoveredVehicle === vehicle.id && (
                <>
                  {/* Desktop Tooltip */}
                  <div className="hidden sm:block absolute top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-orange-200 whitespace-nowrap animate-fade-in z-50">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-orange-600">£{vehicle.price.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 sm:mt-1">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {vehicle.location}
                    </p>
                  </div>

                  <div className="sm:hidden absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg border border-orange-200 z-50 min-w-max">
                    <p className="text-xs font-bold text-slate-900 whitespace-nowrap">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm font-bold text-orange-600 whitespace-nowrap">
                      £{vehicle.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      {vehicle.location}
                    </p>
                  </div>
                </>
              )}
            </button>
          ))}

          {/* Animated Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {vehicles.map((vehicle, i) => {
              if (i === 0) return null
              const prev = vehicles[i - 1]
              return (
                <line
                  key={`line-${vehicle.id}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${vehicle.x}%`}
                  y2={`${vehicle.y}%`}
                  stroke="rgb(249 115 22 / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="flow-line-animated"
                />
              )
            })}
          </svg>
        </div>

        {/* Selected Vehicle Details */}
        {selectedVehicle && (
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-lg sm:rounded-2xl shadow-xl sm:shadow-2xl border border-orange-200 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-base sm:text-xl font-bold text-slate-900">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {selectedVehicle.location}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto text-right">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  £{selectedVehicle.price.toLocaleString()}
                </p>
                <Button
                  size="sm"
                  className="mt-2 sm:mt-3 w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg text-xs sm:text-base"
                  asChild
                >
                  <a href="#pricing">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Start Free Trial
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
