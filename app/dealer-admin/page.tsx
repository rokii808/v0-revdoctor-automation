import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Crown, Database, Filter, Plus, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function DealerAdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: dealer } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

  // Mock subscription data - in real app this would come from database
  const subscriptionTiers = [
    {
      name: "Starter",
      price: 97,
      features: [
        "Daily email list of healthy cars (limited to 1 auction site)",
        "Max 50 listings per day",
        "Basic filters (make, mileage, price)",
      ],
      current: dealer?.subscription_plan === "starter",
    },
    {
      name: "Growth",
      price: 297,
      features: [
        "Instant alerts + daily digest",
        "3 auction sites included",
        "Max 200 listings per day",
        "Advanced filters (condition, year, risk score)",
        "Dashboard access + saved searches",
        "Export to CSV/PDF",
      ],
      current: dealer?.subscription_plan === "growth",
      popular: true,
    },
    {
      name: "Enterprise / Platinum Dealers",
      price: 797,
      priceLabel: "£797+ / month",
      features: [
        "Unlimited auction sites",
        "Unlimited listings",
        'Custom scoring model (AI ranking for "best flips")',
        "Team logins (multi-user)",
        "Priority scraping (near real-time)",
        "Dedicated support + API feed to their DMS",
      ],
      current: dealer?.subscription_plan === "enterprise",
    },
  ]

  const addOns = [
    { name: "Extra auction site", price: 99, enabled: false },
    { name: "API access (raw data feed)", price: 499, enabled: false },
    { name: "White-label reporting (dealer branding)", price: 199, enabled: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} dealer={dealer} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Management</h1>
          <p className="text-muted-foreground">Manage your subscription, filters, and auction sources.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`border rounded-lg p-4 ${
                        tier.current ? "border-blue-500 bg-blue-50" : "border-border"
                      } ${tier.popular ? "ring-2 ring-blue-200" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{tier.name}</h3>
                          {tier.popular && <Badge className="bg-blue-600">Most Popular</Badge>}
                          {tier.current && <Badge variant="secondary">Current Plan</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{tier.priceLabel || `£${tier.price}`}</div>
                          {!tier.priceLabel && <div className="text-sm text-muted-foreground">/month</div>}
                        </div>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {!tier.current && (
                        <Button className="w-full" asChild>
                          <a href="/pricing">
                            {tier.price > (dealer?.current_plan_price || 0) ? "Upgrade" : "Downgrade"} to {tier.name}
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filter Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Makes</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dealer?.makes_csv?.split(",").map((make: string) => (
                        <Badge key={make.trim()} variant="secondary">
                          {make.trim()}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Budget</Label>
                    <p className="text-sm mt-1">
                      {dealer?.max_bid ? `£${dealer.max_bid.toLocaleString()}` : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Min Year</Label>
                    <p className="text-sm mt-1">{dealer?.min_year || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Mileage</Label>
                    <p className="text-sm mt-1">
                      {dealer?.max_mileage ? `${dealer.max_mileage.toLocaleString()} miles` : "Not set"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add-ons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addOns.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{addon.name}</p>
                      <p className="text-xs text-muted-foreground">+£{addon.price}/mo</p>
                    </div>
                    <Switch checked={addon.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Auction Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Auction Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">BCA</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manheim</span>
                  <Badge variant="secondary">Premium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ADESA</span>
                  <Badge variant="secondary">Premium</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect More Sources
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge variant="default">{dealer?.subscription_plan || "Trial"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Billing</span>
                  <span className="text-sm text-muted-foreground">
                    {dealer?.subscription_expires_at
                      ? new Date(dealer.subscription_expires_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
