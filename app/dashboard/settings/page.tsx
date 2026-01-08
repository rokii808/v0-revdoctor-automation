"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { getPlanConfig, type PlanTier } from "@/lib/plans/config"
import { motion } from "framer-motion"
import {
  Settings,
  User,
  Mail,
  Bell,
  Car,
  DollarSign,
  Gauge,
  Calendar,
  MapPin,
  Sparkles,
  Trash2,
  Save,
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dealer, setDealer] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  // Preferences state
  const [preferences, setPreferences] = useState({
    // Vehicle preferences
    makes: [] as string[],
    minYear: 2015,
    maxPrice: 50000,
    minPrice: 0,
    maxMileage: 100000,
    enabledAuctionSites: ["RAW2K", "BCA", "Autorola", "Manheim"],

    // Email preferences
    emailEnabled: true,
    emailFrequency: "daily",
    emailTime: "07:00",
    minVehiclesToSend: 1,
    weekendEmails: false,
    instantAlerts: false,
  })

  // New make input
  const [newMake, setNewMake] = useState("")

  useEffect(() => {
    initializeSettings()
  }, [])

  const initializeSettings = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    setUser(user)

    const [subscriptionResult, dealerResult, prefsResult] = await Promise.all([
      supabase.from("subscriptions").select("status, plan").eq("user_id", user.id).single(),
      supabase.from("dealers").select("*").eq("user_id", user.id).single(),
      fetch("/api/preferences").then(res => res.json()),
    ])

    setSubscription(subscriptionResult.data)
    setDealer(dealerResult.data)

    // Load existing preferences
    if (prefsResult.preferences) {
      setPreferences({
        makes: dealerResult.data?.prefs?.makes || [],
        minYear: prefsResult.preferences.min_year || 2015,
        maxPrice: prefsResult.preferences.max_price || 50000,
        minPrice: prefsResult.preferences.min_price || 0,
        maxMileage: prefsResult.preferences.max_mileage || 100000,
        enabledAuctionSites: prefsResult.preferences.enabled_auction_sites || ["RAW2K"],
        emailEnabled: prefsResult.preferences.email_enabled ?? true,
        emailFrequency: prefsResult.preferences.email_frequency || "daily",
        emailTime: prefsResult.preferences.email_time || "07:00",
        minVehiclesToSend: prefsResult.preferences.min_vehicles_to_send || 1,
        weekendEmails: prefsResult.preferences.weekend_emails || false,
        instantAlerts: prefsResult.preferences.instant_alerts || false,
      })
    }

    setLoading(false)
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      // Save to preferences API
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_year: preferences.minYear,
          max_price: preferences.maxPrice,
          min_price: preferences.minPrice,
          max_mileage: preferences.maxMileage,
          enabled_auction_sites: preferences.enabledAuctionSites,
          email_enabled: preferences.emailEnabled,
          email_frequency: preferences.emailFrequency,
          email_time: preferences.emailTime,
          min_vehicles_to_send: preferences.minVehiclesToSend,
          weekend_emails: preferences.weekendEmails,
          instant_alerts: preferences.instantAlerts,
        }),
      })

      if (response.ok) {
        // Also update dealer prefs for makes
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        await supabase
          .from("dealers")
          .update({
            prefs: {
              ...dealer?.prefs,
              makes: preferences.makes,
            }
          })
          .eq("user_id", user.id)

        toast.success("Settings Saved!", {
          description: "Your preferences have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save preferences")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Save Failed", {
        description: "Unable to save settings. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetLearnedPreferences = async () => {
    if (!confirm("Are you sure? This will reset all learned preferences based on your interactions.")) {
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      await supabase
        .from("dealer_learned_preferences")
        .delete()
        .eq("dealer_id", user.id)

      toast.success("Preferences Reset", {
        description: "Your learned preferences have been cleared. Start fresh!",
      })
    } catch (error) {
      toast.error("Reset Failed", {
        description: "Unable to reset preferences. Please try again.",
      })
    }
  }

  const addMake = () => {
    if (newMake && !preferences.makes.includes(newMake)) {
      setPreferences({
        ...preferences,
        makes: [...preferences.makes, newMake],
      })
      setNewMake("")
    }
  }

  const removeMake = (make: string) => {
    setPreferences({
      ...preferences,
      makes: preferences.makes.filter(m => m !== make),
    })
  }

  const toggleAuctionSite = (site: string) => {
    if (preferences.enabledAuctionSites.includes(site)) {
      setPreferences({
        ...preferences,
        enabledAuctionSites: preferences.enabledAuctionSites.filter(s => s !== site),
      })
    } else {
      setPreferences({
        ...preferences,
        enabledAuctionSites: [...preferences.enabledAuctionSites, site],
      })
    }
  }

  if (loading || !user || !dealer) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const plan = (subscription?.plan || "trial") as PlanTier
  const planConfig = getPlanConfig(plan)

  const usageStats = {
    viewedToday: 0,
    limit: planConfig.features.dailyCarLimit,
    remaining: planConfig.features.dailyCarLimit,
    canView: true,
    percentage: 0,
    resetAt: new Date(),
  }

  return (
    <DashboardShell user={user} dealer={dealer} planTier={plan} usageStats={usageStats}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-slate-600 mt-1">Manage your account and vehicle preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Settings (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Preferences
                </CardTitle>
                <CardDescription>
                  Set your criteria for vehicle matching and AI screening
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Makes */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Preferred Makes</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., BMW, Audi, Mercedes"
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMake()}
                    />
                    <Button onClick={addMake} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.makes.length > 0 ? (
                      preferences.makes.map((make) => (
                        <Badge
                          key={make}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeMake(make)}
                        >
                          {make} ×
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No makes selected (all makes will be considered)</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Year Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Minimum Year
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[preferences.minYear]}
                      onValueChange={([value]) => setPreferences({ ...preferences, minYear: value })}
                      min={2010}
                      max={new Date().getFullYear()}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-semibold text-lg w-16 text-right">{preferences.minYear}</span>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price Range
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Minimum Price</Label>
                      <Input
                        type="number"
                        value={preferences.minPrice}
                        onChange={(e) => setPreferences({ ...preferences, minPrice: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Maximum Price</Label>
                      <Input
                        type="number"
                        value={preferences.maxPrice}
                        onChange={(e) => setPreferences({ ...preferences, maxPrice: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Max Mileage */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Maximum Mileage
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[preferences.maxMileage]}
                      onValueChange={([value]) => setPreferences({ ...preferences, maxMileage: value })}
                      min={20000}
                      max={200000}
                      step={5000}
                      className="flex-1"
                    />
                    <span className="font-semibold text-lg w-24 text-right">
                      {preferences.maxMileage.toLocaleString()} mi
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Auction Sites */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Enabled Auction Sites
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["RAW2K", "BCA", "Autorola", "Manheim"].map((site) => (
                      <div key={site} className="flex items-center space-x-2">
                        <Switch
                          id={site}
                          checked={preferences.enabledAuctionSites.includes(site)}
                          onCheckedChange={() => toggleAuctionSite(site)}
                        />
                        <Label htmlFor={site} className="cursor-pointer">
                          {site}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive vehicle notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive vehicle match emails</p>
                  </div>
                  <Switch
                    checked={preferences.emailEnabled}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailEnabled: checked })}
                  />
                </div>

                {preferences.emailEnabled && (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Digest Frequency</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={preferences.emailFrequency}
                        onChange={(e) => setPreferences({ ...preferences, emailFrequency: e.target.value })}
                      >
                        <option value="instant">Instant (as they arrive)</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    {preferences.emailFrequency === "daily" && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Preferred Time</Label>
                        <select
                          className="w-full border rounded-md p-2"
                          value={preferences.emailTime}
                          onChange={(e) => setPreferences({ ...preferences, emailTime: e.target.value })}
                        >
                          <option value="06:00">6:00 AM</option>
                          <option value="07:00">7:00 AM</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Vehicles to Send</Label>
                      <Input
                        type="number"
                        min={1}
                        value={preferences.minVehiclesToSend}
                        onChange={(e) => setPreferences({ ...preferences, minVehiclesToSend: parseInt(e.target.value) || 1 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Only send digest if at least this many vehicles are found
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Instant Alerts for Hot Deals
                          </Label>
                          <p className="text-xs text-muted-foreground">Get notified immediately for exceptional finds</p>
                        </div>
                        <Switch
                          checked={preferences.instantAlerts}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, instantAlerts: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Weekend Emails</Label>
                          <p className="text-xs text-muted-foreground">Receive emails on Saturday and Sunday</p>
                        </div>
                        <Switch
                          checked={preferences.weekendEmails}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, weekendEmails: checked })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions (1/3) */}
          <div className="space-y-6">
            {/* Save Button */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save All Settings"}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <Badge variant="secondary">{plan.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{dealer?.dealer_name || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Actions */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Personalization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Your AI learns from your saves and skips to improve recommendations over time.
                </p>
                <Button
                  onClick={handleResetLearnedPreferences}
                  variant="outline"
                  size="sm"
                  className="w-full text-purple-700 border-purple-300 hover:bg-purple-100"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Reset Learned Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
