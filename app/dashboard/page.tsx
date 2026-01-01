import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import PreferencesCard from "@/components/dashboard/preferences-card"
import SubscriptionCard from "@/components/dashboard/subscription-card"
import AchievementsCard from "@/components/dashboard/achievements-card"
import TodaysHealthyCars from "@/components/dashboard/todays-healthy-cars"
import AlertsFeed from "@/components/dashboard/alerts-feed"
import SavedSearches from "@/components/dashboard/saved-searches"
import EmailSettings from "@/components/dashboard/email-settings"
import ExportOptions from "@/components/dashboard/export-options"

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
  let { data: dealer, error: dealerError } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

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
      })
      .select()
      .single()

    if (createError) {
      console.error("[Dashboard] Error creating dealer profile:", createError)
    } else {
      dealer = newDealer
    }
  }

  // Get recent leads with error handling
  const { data: recentLeads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .eq("dealer_id", dealer?.id || '')
    .order("created_at", { ascending: false })
    .limit(7)

  if (leadsError) {
    console.error("[Dashboard] Error fetching leads:", leadsError.message)
  }

  // Get today's healthy cars with error handling
  const { data: healthyCars, error: healthyCarsError } = await supabase
    .from("vehicle_matches")
    .select("*")
    .eq("dealer_id", dealer?.id || '')
    .gte("created_at", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(50)

  if (healthyCarsError) {
    console.error("[Dashboard] Error fetching healthy cars:", healthyCarsError.message)
  }

  // Get alerts with error handling
  const { data: alerts, error: alertsError } = await supabase
    .from("car_alerts")
    .select("*")
    .eq("dealer_id", dealer?.id || '')
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(10)

  if (alertsError) {
    console.error("[Dashboard] Error fetching alerts:", alertsError.message)
  }

  // Get saved searches with error handling
  const { data: savedSearches, error: searchesError } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("dealer_id", dealer?.id || '')
    .order("created_at", { ascending: false })

  if (searchesError) {
    console.error("[Dashboard] Error fetching saved searches:", searchesError.message)
  }

  // Check if this is the user's first login (for welcome message)
  const isFirstLogin = !dealer?.last_login_at || new Date(dealer.last_login_at).getTime() > Date.now() - 60000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      <DashboardHeader user={user} dealer={dealer} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 shadow-2xl shadow-orange-500/20 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {isFirstLogin ? "Welcome" : "Welcome back"}, {dealer?.dealer_name || "Dealer"}! 🎉
                </h1>
                <p className="text-orange-100 text-lg">
                  {isFirstLogin
                    ? "Your dashboard is ready! Start exploring the best car deals from today's auctions."
                    : "Here's your RevvDoctor dashboard with the latest healthy car picks and insights."}
                </p>
              </div>
              {isFirstLogin && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                  <p className="text-sm font-medium text-orange-50 mb-1">Quick Tip</p>
                  <p className="text-sm text-white">
                    Check "Today's Healthy Cars" below to see your personalized recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <DashboardStats dealer={dealer} recentLeads={recentLeads || []} />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* Today's Healthy Cars - Main feature */}
            <TodaysHealthyCars dealer={dealer} healthyCars={healthyCars || []} />

            {/* Alerts Feed */}
            <div className="mt-6">
              <AlertsFeed dealer={dealer} alerts={alerts || []} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Settings */}
            <EmailSettings dealer={dealer} />

            {/* Saved Searches */}
            <SavedSearches dealer={dealer} savedSearches={savedSearches || []} />

            {/* Export Options */}
            <ExportOptions dealer={dealer} />

            {/* Existing cards */}
            <AchievementsCard dealer={dealer} />
            <PreferencesCard dealer={dealer} />
            <SubscriptionCard dealer={dealer} />
          </div>
        </div>
      </main>
    </div>
  )
}
