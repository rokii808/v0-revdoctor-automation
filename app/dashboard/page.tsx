import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatsCards } from "@/components/dashboard/stats-cards"
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
            .filter((car: any) => car.ai_classification?.profit_potential)
            .reduce((sum: number, car: any) => sum + (car.ai_classification?.profit_potential || 0), 0) /
          healthyCars.length
        )
      : 0,
  }

  // Transform vehicle data for VehicleGrid
  const vehicles = (healthyCars || []).map((match: any) => {
    // Get image URL - check multiple possible locations
    let imageUrl = null
    if (match.vehicle_data?.image_url) {
      imageUrl = match.vehicle_data.image_url
    } else if (match.vehicle_data?.images && match.vehicle_data.images.length > 0) {
      imageUrl = match.vehicle_data.images[0]
    } else if (match.images && match.images.length > 0) {
      imageUrl = match.images[0]
    } else if (match.image_url) {
      imageUrl = match.image_url
    }

    return {
      id: match.vehicle_id || match.id,
      make: match.vehicle_data?.make || match.make || 'Unknown',
      model: match.vehicle_data?.model || match.model || 'Unknown',
      year: match.vehicle_data?.year || match.year || 2020,
      price: match.vehicle_data?.price || match.price || 0,
      mileage: match.vehicle_data?.mileage || match.mileage || 0,
      location: match.vehicle_data?.location || match.location,
      image_url: imageUrl,
      url: match.vehicle_data?.url || match.url || match.listing_url,
      condition: match.vehicle_data?.condition || match.condition,
      ai_classification: {
        verdict: match.ai_classification?.verdict || 'REVIEW',
        profit_potential: match.ai_classification?.profit_potential,
        confidence: match.match_score ? Math.round(match.match_score * 100) : undefined,
        issues: match.ai_classification?.issues,
      },
      viewed: false,
    }
  })

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
