import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get or create dealer profile
  const { data: dealer } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

  // If no dealer profile exists, create one
  if (!dealer) {
    const { data: newDealer } = await supabase
      .from("dealers")
      .insert({
        user_id: user.id,
        dealer_name: user.user_metadata?.dealer_name || "Your Dealership",
        email: user.email!,
        subscription_status: "trial",
        subscription_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()
  }

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("dealer_id", dealer?.id)
    .order("created_at", { ascending: false })
    .limit(7)

  // Get today's healthy cars
  const { data: healthyCars } = await supabase
    .from("healthy_cars")
    .select("*")
    .eq("dealer_id", dealer?.id)
    .gte("created_at", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(50)

  // Get alerts
  const { data: alerts } = await supabase
    .from("car_alerts")
    .select("*")
    .eq("dealer_id", dealer?.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get saved searches
  const { data: savedSearches } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("dealer_id", dealer?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} dealer={dealer} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {dealer?.dealer_name || "Dealer"}</h1>
          <p className="text-muted-foreground">
            Here's your Revvdoctor dashboard with the latest healthy car picks and insights.
          </p>
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
