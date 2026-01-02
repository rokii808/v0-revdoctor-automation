"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { VehicleGrid } from "@/components/dashboard/vehicle-grid"
import { ActivityFeed, generateMockActivities } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UsageOverview } from "@/components/dashboard/usage-overview"
import { getPlanConfig, type PlanTier } from "@/lib/plans/config"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Car, Eye, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [dealer, setDealer] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    const initializeDashboard = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Middleware already validated auth - just get user data
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Run all queries in parallel for faster loading
      const [subscriptionResult, dealerResult] = await Promise.all([
        supabase.from("subscriptions").select("status, plan").eq("user_id", user.id).single(),
        supabase.from("dealers").select("*").eq("user_id", user.id).single(),
      ])

      setSubscription(subscriptionResult.data)

      let dealerData = dealerResult.data

      // If no dealer found (shouldn't happen due to middleware), create one
      if (!dealerData) {
        const { data: newDealer } = await supabase
          .from("dealers")
          .insert({ user_id: user.id, email: user.email })
          .select()
          .single()
        dealerData = newDealer
      }

      setDealer(dealerData)

      // Fetch vehicles (can run after dealer is confirmed)
      const { data: vehiclesData } = await supabase
        .from("vehicle_matches")
        .select("*")
        .eq("dealer_id", dealerData?.id)
        .order("created_at", { ascending: false })
        .limit(20)

      setVehicles(vehiclesData || [])
      setLoading(false)
    }

    initializeDashboard()
  }, [router])

  if (loading || !user || !dealer) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const plan = (subscription?.plan || "trial") as PlanTier
  const planConfig = getPlanConfig(plan)

  const mockActivities = generateMockActivities()

  // Mock usage stats for client-side rendering
  const usageStats = {
    viewedToday: 0,
    limit: planConfig.features.dailyCarLimit,
    remaining: planConfig.features.dailyCarLimit,
    canView: true,
    percentage: 0,
    resetAt: new Date(),
  }

  // Calculate stats
  const stats = {
    todaysCars: vehicles.length,
    weeklyScans: 0, // Placeholder for weekly scans calculation
    totalHealthy: 0, // Placeholder for total healthy cars calculation
    averageRoi:
      vehicles && vehicles.length > 0
        ? Math.round(
            vehicles
              .filter((car: any) => car.profit_estimate && car.profit_estimate > 0)
              .reduce((sum: number, car: any) => sum + (car.profit_estimate || 0), 0) /
              vehicles.filter((car: any) => car.profit_estimate && car.profit_estimate > 0).length || 1,
          )
        : 0,
  }

  // Transform vehicle data for VehicleGrid
  // Database schema has flat structure: make, model, year, price, mileage, image_url, listing_url, verdict, profit_estimate
  const transformedVehicles = vehicles.map((match: any) => ({
    id: match.id,
    make: match.make || "Unknown",
    model: match.model || "Unknown",
    year: match.year || 2020,
    price: match.price || 0,
    mileage: match.mileage || 0,
    location: undefined, // Not in current schema
    image_url: match.image_url, // Single image URL field
    url: match.listing_url, // listing_url field
    condition: match.condition,
    ai_classification: {
      verdict: (match.verdict || "REVIEW") as "HEALTHY" | "AVOID" | "REVIEW",
      profit_potential: match.profit_estimate,
      confidence: match.match_score,
      issues: match.reason ? match.reason.split("; ").filter(Boolean) : undefined, // Split semicolon-separated reasons
    },
    viewed: false,
  }))

  return (
    <DashboardShell user={user} dealer={dealer} planTier={plan} usageStats={usageStats}>
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {dealer?.dealer_name?.split(" ")[0] || "Dealer"}! 👋</h1>
          <p className="text-slate-600 mt-1">Here's what your AI scout found today</p>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Vehicles Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl">🚗</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.todaysCars}</p>
            <p className="text-sm text-slate-600">Today's Vehicles</p>
          </motion.div>

          {/* Weekly Scans Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.weeklyScans}</p>
            <p className="text-sm text-slate-600">Weekly Scans</p>
          </motion.div>

          {/* Healthy Cars Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalHealthy}</p>
            <p className="text-sm text-slate-600">Healthy Matches</p>
          </motion.div>

          {/* Average ROI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold mb-1">£{stats.averageRoi.toLocaleString()}</p>
            <p className="text-sm text-orange-100">Avg. Profit/Vehicle</p>
          </motion.div>
        </div>

        {/* Main Grid: Vehicles + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicles (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Vehicles Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Today's Best Picks</h2>
                  <p className="text-sm text-slate-600 mt-1">AI-verified vehicles with strong profit potential</p>
                </div>
                <Link href="/dashboard?view=all">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {/* Vehicle Grid */}
              <VehicleGrid vehicles={transformedVehicles} planTier={plan} canViewMore={usageStats.canView} />
            </div>
          </div>

          {/* Right Column - Sidebar Widgets (1/3 width) */}
          <div className="space-y-6">
            {/* Usage Overview */}
            <UsageOverview planTier={plan} stats={usageStats} compact={true} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              </div>
              <ActivityFeed activities={mockActivities} compact={true} />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
