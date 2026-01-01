import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { VehicleGrid } from "@/components/dashboard/vehicle-grid"
import { ActivityFeed, generateMockActivities } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UsageOverview } from "@/components/dashboard/usage-overview"
import { getPlanConfig, type PlanTier } from "@/lib/plans/config"
import { getUsageStats } from "@/lib/plans/usage-tracker"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  // Allow new users to access dashboard (they're on free trial)
  // Only redirect to pricing if subscription is explicitly cancelled
  if (subscription && subscription.status === 'cancelled') {
    redirect("/pricing?required=true")
  }

  // Get or create dealer profile
  let { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // If no dealer profile exists, create one
  if (!dealer || dealerError) {
    console.log("[Dashboard] Creating new dealer profile for user:", user.id)
    const { data: newDealer, error: createError } = await supabase
      .from("dealers")
      .insert({
        user_id: user.id,
        dealer_name: user.user_metadata?.dealer_name || user.email?.split('@')[0] || "Your Dealership",
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
  const planTier: PlanTier = (dealer?.plan as PlanTier) || 'trial'
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
  const today = new Date().toISOString().split('T')[0]
  const { data: healthyCars, error: healthyCarsError } = await supabase
    .from("vehicle_matches")
    .select("*")
    .eq("dealer_id", dealer?.id || '')
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
    .select("*", { count: 'exact', head: true })
    .eq("dealer_id", dealer?.id || '')
    .gte("created_at", weekAgo.toISOString())
  const weeklyCount = (weeklyResult as any).count

  // Get total healthy cars all time
  const totalResult = await supabase
    .from("vehicle_matches")
    .select("*", { count: 'exact', head: true })
    .eq("dealer_id", dealer?.id || '')
  const totalHealthy = (totalResult as any).count

  // Calculate stats
  const stats = {
    todaysCars: healthyCars?.length || 0,
    weeklyScans: weeklyCount || 0,
    totalHealthy: totalHealthy || 0,
    averageRoi: healthyCars && healthyCars.length > 0
      ? Math.round(
          healthyCars
            .filter((car: any) => car.profit_estimate && car.profit_estimate > 0)
            .reduce((sum: number, car: any) => sum + (car.profit_estimate || 0), 0) /
          healthyCars.filter((car: any) => car.profit_estimate && car.profit_estimate > 0).length || 1
        )
      : 0,
  }

  // Transform vehicle data for VehicleGrid
  // Database schema has flat structure: make, model, year, price, mileage, image_url, listing_url, verdict, profit_estimate
  const vehicles = (healthyCars || []).map((match: any) => ({
    id: match.id,
    make: match.make || 'Unknown',
    model: match.model || 'Unknown',
    year: match.year || 2020,
    price: match.price || 0,
    mileage: match.mileage || 0,
    location: null, // Not in current schema
    image_url: match.image_url, // Single image URL field
    url: match.listing_url, // listing_url field
    condition: match.condition,
    ai_classification: {
      verdict: (match.verdict || 'REVIEW') as "HEALTHY" | "AVOID" | "REVIEW",
      profit_potential: match.profit_estimate,
      confidence: match.match_score,
      issues: match.reason ? match.reason.split('; ').filter(Boolean) : undefined, // Split semicolon-separated reasons
    },
    viewed: false,
  }))

  // Generate activity feed (using mock data for now - replace with real activity later)
  const activities = generateMockActivities()

  return (
    <DashboardShell
      user={user}
      dealer={dealer}
      planTier={planTier}
      usageStats={usageStats}
    >
      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Stats Overview */}
        <StatsCards
          todaysCars={stats.todaysCars}
          weeklyScans={stats.weeklyScans}
          totalHealthy={stats.totalHealthy}
          averageRoi={stats.averageRoi}
          planTier={planTier}
        />

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Today's Healthy Cars</h2>
              <p className="text-slate-600">
                AI-verified vehicles that match your criteria and have strong profit potential
              </p>
            </div>

            {/* Vehicle Grid */}
            <VehicleGrid
              vehicles={vehicles}
              planTier={planTier}
              canViewMore={usageStats.canView}
            />

            {/* Activity Feed */}
            <div className="pt-6">
              <ActivityFeed
                activities={activities}
                compact={false}
              />
            </div>
          </div>

          {/* Right Column - Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Usage Overview */}
            <UsageOverview
              planTier={planTier}
              stats={usageStats}
              compact={false}
            />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
