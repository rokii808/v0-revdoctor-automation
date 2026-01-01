"use client"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { VehicleGrid } from "@/components/dashboard/vehicle-grid"
import { ActivityFeed, generateMockActivities } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UsageOverview } from "@/components/dashboard/usage-overview"
import { getPlanConfig, type PlanTier } from "@/lib/plans/config"
import { getUsageStats } from "@/lib/plans/usage-tracker"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Car, Eye, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", user.id)
    .single()

  // Allow new users to access dashboard (they're on free trial)
  // Only redirect to pricing if subscription is explicitly cancelled
  if (subscription && subscription.status === "cancelled") {
    redirect("/pricing?required=true")
  }

  // Get or create dealer profile
  let { data: dealer, error: dealerError } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

  // If no dealer profile exists, create one
  if (!dealer || dealerError) {
    console.log("[Dashboard] Creating new dealer profile for user:", user.id)
    const { data: newDealer, error: createError } = await supabase
      .from("dealers")
      .insert({
        user_id: user.id,
        dealer_name: user.user_metadata?.dealer_name || user.email?.split("@")[0] || "Your Dealership",
        email: user.email!,
        subscription_status: subscription?.status || "trial",
        subscription_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plan: "trial",
      })
      .select()
      .single()

    if (createError) {
      console.error("[Dashboard] Error creating dealer profile:", createError)
    } else {
      dealer = newDealer
    }
  }

  // Determine plan tier
  const planTier: PlanTier = (dealer?.plan as PlanTier) || "trial"
  const planConfig = getPlanConfig(planTier)

  // Get usage stats
  const usageStats = dealer?.id
    ? await getUsageStats(dealer.id, planTier)
    : {
        viewedToday: 0,
        limit: 3,
        remaining: 3,
        canView: true,
        percentage: 0,
        resetAt: new Date(),
      }

  // Get today's healthy cars
  const today = new Date().toISOString().split("T")[0]
  const { data: healthyCars, error: healthyCarsError } = await supabase
    .from("vehicle_matches")
    .select("*")
    .eq("dealer_id", dealer?.id || "")
    .gte("created_at", `${today}T00:00:00`)
    .order("match_score", { ascending: false })
    .limit(planConfig.features.dailyCarLimit)

  if (healthyCarsError) {
    console.error("[Dashboard] Error fetching healthy cars:", healthyCarsError.message)
  }

  // Debug: Log the first vehicle to see data structure
  if (healthyCars && healthyCars.length > 0) {
    console.log("[Dashboard] Sample vehicle data:", JSON.stringify(healthyCars[0], null, 2))
  }

  // Get total vehicles found this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyResult = await supabase
    .from("vehicle_matches")
    .select("*", { count: "exact", head: true })
    .eq("dealer_id", dealer?.id || "")
    .gte("created_at", weekAgo.toISOString())
  const weeklyCount = (weeklyResult as any).count

  // Get total healthy cars all time
  const totalResult = await supabase
    .from("vehicle_matches")
    .select("*", { count: "exact", head: true })
    .eq("dealer_id", dealer?.id || "")
  const totalHealthy = (totalResult as any).count

  // Calculate stats
  const stats = {
    todaysCars: healthyCars?.length || 0,
    weeklyScans: weeklyCount || 0,
    totalHealthy: totalHealthy || 0,
    averageRoi:
      healthyCars && healthyCars.length > 0
        ? Math.round(
            healthyCars
              .filter((car: any) => car.profit_estimate && car.profit_estimate > 0)
              .reduce((sum: number, car: any) => sum + (car.profit_estimate || 0), 0) /
              healthyCars.filter((car: any) => car.profit_estimate && car.profit_estimate > 0).length || 1,
          )
        : 0,
  }

  // Transform vehicle data for VehicleGrid
  // Database schema has flat structure: make, model, year, price, mileage, image_url, listing_url, verdict, profit_estimate
  const vehicles = (healthyCars || []).map((match: any) => ({
    id: match.id,
    make: match.make || "Unknown",
    model: match.model || "Unknown",
    year: match.year || 2020,
    price: match.price || 0,
    mileage: match.mileage || 0,
    location: null, // Not in current schema
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

  // Generate activity feed (using mock data for now - replace with real activity later)
  const activities = generateMockActivities()

  return (
    <DashboardShell user={user} dealer={dealer} planTier={planTier} usageStats={usageStats}>
      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Welcome Section - Hero Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
                <h2 className="text-5xl font-bold flex items-center gap-3">
                  Hello {dealer?.dealer_name?.split(" ")[0] || "Your Dealership"} 👋
                </h2>
              </div>
              <div className="hidden sm:flex gap-3">
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-orange-200 text-lg">Here's what your AI scout found today</p>
          </div>
        </motion.div>

        {/* Stats Section - Two Columns with Right Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Stats (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Metrics Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Total Healthy Cars Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/30 overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Car className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-white/80">VEHICLES FOUND</span>
                  </div>
                  <p className="text-5xl font-bold mb-2">{stats.totalHealthy}</p>
                  <p className="text-orange-100">All-time healthy matches</p>
                </div>
              </motion.div>

              {/* This Week's Scans Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/30 overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Eye className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-white/80">THIS WEEK</span>
                  </div>
                  <p className="text-5xl font-bold mb-2">{stats.weeklyScans}</p>
                  <p className="text-blue-100">Vehicles scanned</p>
                </div>
              </motion.div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Today's Best Picks</h2>
                <p className="text-slate-600">AI-verified vehicles with strong profit potential</p>
              </div>
              <Link href="/dashboard?view=all">
                <Button variant="outline" size="sm">
                  View All Vehicles
                </Button>
              </Link>
            </div>

            {/* Vehicle Grid */}
            <VehicleGrid vehicles={vehicles} planTier={planTier} canViewMore={usageStats.canView} />
          </div>

          {/* Right Column - Sidebar Widgets (1/3 width) */}
          <div className="space-y-6">
            {/* ROI Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Average ROI</h3>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>

              {/* Donut Chart Placeholder */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 mb-4">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeDasharray={`${stats.averageRoi / 10} 251.2`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-slate-900">£{stats.averageRoi.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">per vehicle</p>
                  </div>
                </div>
              </div>

              <Link href="/pricing?section=upgrade">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  View Opportunities
                </Button>
              </Link>
            </motion.div>

            {/* Usage Overview */}
            <UsageOverview planTier={planTier} stats={usageStats} compact={true} />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>

        {/* Activity Feed Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <ActivityFeed activities={activities} compact={true} />
        </motion.div>
      </div>
    </DashboardShell>
  )
}
