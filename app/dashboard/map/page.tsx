"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getPlanConfig, type PlanTier } from "@/lib/plans/config"
import { motion } from "framer-motion"
import { MapPin, Car, TrendingUp } from "lucide-react"

export default function MapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [dealer, setDealer] = useState<any>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("status, plan")
        .eq("user_id", user.id)
        .single()

      if (subscriptionData?.status === "cancelled") {
        router.push("/pricing?required=true")
        return
      }

      setSubscription(subscriptionData)

      let { data: dealerData } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

      if (!dealerData) {
        const { data: newDealer } = await supabase
          .from("dealers")
          .insert({ user_id: user.id, email: user.email })
          .select()
          .single()
        dealerData = newDealer
      }

      setDealer(dealerData)
      setLoading(false)
    }

    initializeDashboard()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !dealer) {
    return null
  }

  const plan = (subscription?.plan || "trial") as PlanTier
  const planConfig = getPlanConfig(plan)

  // Mock usage stats for client-side rendering
  const usageStats = {
    viewedToday: 0,
    limit: planConfig.features.dailyCarLimit,
    remaining: planConfig.features.dailyCarLimit,
    canView: true,
    percentage: 0,
    resetAt: new Date(),
  }

  // Mock auction locations across the UK
  const auctionLocations = [
    { id: 1, name: "RAW2K London", city: "London", vehicles: 156, lat: 51.5074, lng: -0.1278 },
    { id: 2, name: "Manchester Auctions", city: "Manchester", vehicles: 92, lat: 53.4808, lng: -2.2426 },
    { id: 3, name: "Birmingham Auto Sales", city: "Birmingham", vehicles: 78, lat: 52.4862, lng: -1.8904 },
    { id: 4, name: "Leeds Car Mart", city: "Leeds", vehicles: 64, lat: 53.8008, lng: -1.5491 },
    { id: 5, name: "Bristol Vehicle Hub", city: "Bristol", vehicles: 54, lat: 51.4545, lng: -2.5879 },
    { id: 6, name: "Edinburgh Auctions", city: "Edinburgh", vehicles: 48, lat: 55.9533, lng: -3.1883 },
  ]

  return (
    <DashboardShell user={user} dealer={dealer} planTier={plan} usageStats={usageStats}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">UK Auction Map 🗺️</h1>
          <p className="text-slate-600 mt-1">Live auction houses and vehicle availability across the UK</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{auctionLocations.length}</p>
            </div>
            <p className="text-sm text-slate-600">Active Auction Houses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {auctionLocations.reduce((sum, loc) => sum + loc.vehicles, 0)}
              </p>
            </div>
            <p className="text-sm text-slate-600">Total Vehicles Available</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">Live</p>
            </div>
            <p className="text-sm text-orange-100">Real-time Updates</p>
          </motion.div>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          {/* Map Placeholder */}
          <div className="relative h-[600px] bg-gradient-to-br from-slate-100 to-slate-200">
            {/* Simple UK Map Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-3xl h-full p-12">
                {/* Simplified UK outline */}
                <svg className="w-full h-full" viewBox="0 0 400 600" fill="none">
                  {/* UK Shape - simplified */}
                  <path
                    d="M200 50 L250 100 L280 180 L250 280 L220 380 L180 450 L140 380 L120 280 L150 180 L180 100 Z"
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />

                  {/* Auction Location Markers */}
                  {auctionLocations.map((location, i) => {
                    // Simplified positioning
                    const positions = [
                      { x: 220, y: 380 }, // London
                      { x: 160, y: 250 }, // Manchester
                      { x: 180, y: 300 }, // Birmingham
                      { x: 170, y: 220 }, // Leeds
                      { x: 140, y: 360 }, // Bristol
                      { x: 190, y: 100 }, // Edinburgh
                    ]

                    return (
                      <g key={location.id}>
                        {/* Pulse effect */}
                        <circle
                          cx={positions[i].x}
                          cy={positions[i].y}
                          r="20"
                          fill="#f97316"
                          opacity="0.2"
                          className="animate-ping"
                        />
                        {/* Main marker */}
                        <circle
                          cx={positions[i].x}
                          cy={positions[i].y}
                          r="8"
                          fill="#f97316"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Location Legend */}
          <div className="p-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Auction Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctionLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                    {location.vehicles}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{location.name}</p>
                    <p className="text-sm text-slate-600">{location.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Interactive Map Coming Soon</h4>
              <p className="text-sm text-blue-700">
                We're building a fully interactive map with real-time vehicle data, filtering by make/model, and direct
                links to auctions. This preview shows the auction houses we currently monitor across the UK.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
