"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Settings, Car, MapPin, Calendar, Gauge, X, Plus, Lock, Crown, Zap, Smartphone, ArrowLeft } from "lucide-react"
import { savePrefs, getPrefs } from "@/lib/actions"
import UpgradeNudge from "@/components/ui/upgrade-nudge"
import Link from "next/link"

const TIER_LIMITS = {
  basic: {
    maxMakes: 3,
    maxLocations: 2,
    features: ["basic_filtering", "email_digest"],
    name: "Basic",
  },
  startup: {
    maxMakes: 5,
    maxLocations: 4,
    features: ["basic_filtering", "email_digest", "mot_history", "team_accounts", "priority_delivery"],
    name: "Startup",
  },
  premium: {
    maxMakes: 10,
    maxLocations: 8,
    features: [
      "basic_filtering",
      "email_digest",
      "mot_history",
      "team_accounts",
      "priority_delivery",
      "advanced_filtering",
      "sms_alerts",
      "custom_profiles",
    ],
    name: "Premium",
  },
  enterprise: {
    maxMakes: Number.POSITIVE_INFINITY,
    maxLocations: Number.POSITIVE_INFINITY,
    features: ["all"],
    name: "Enterprise",
  },
}

const popularMakes = [
  "BMW",
  "Mercedes",
  "Audi",
  "Volkswagen",
  "Ford",
  "Vauxhall",
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Peugeot",
]

const popularLocations = [
  "London",
  "Birmingham",
  "Manchester",
  "Leeds",
  "Liverpool",
  "Bristol",
  "Sheffield",
  "Newcastle",
  "Nottingham",
  "Leicester",
]

export default function SettingsPage() {
  const [currentTier, setCurrentTier] = useState<keyof typeof TIER_LIMITS>("basic")
  const tierLimits = TIER_LIMITS[currentTier]

  const [preferences, setPreferences] = useState({
    makes: [] as string[],
    minYear: 2015,
    maxYear: new Date().getFullYear(),
    maxMileage: 100000,
    maxBid: 15000,
    locations: [] as string[],
  })

  const [newMake, setNewMake] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const userId = "placeholder-user-id"

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    setIsLoading(true)
    const result = await getPrefs(userId)
    if (result.success) {
      setPreferences(result.prefs)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await savePrefs(userId, preferences)
    if (result.success) {
      alert("Preferences saved successfully!")
    } else {
      alert("Failed to save preferences. Please try again.")
    }
    setIsSaving(false)
  }

  const addMake = (make: string) => {
    if (preferences.makes.length >= tierLimits.maxMakes) {
      return // Blocked by tier limit
    }
    if (make && !preferences.makes.includes(make)) {
      setPreferences((prev) => ({
        ...prev,
        makes: [...prev.makes, make],
      }))
    }
    setNewMake("")
  }

  const addLocation = (location: string) => {
    if (preferences.locations.length >= tierLimits.maxLocations) {
      return // Blocked by tier limit
    }
    if (location && !preferences.locations.includes(location)) {
      setPreferences((prev) => ({
        ...prev,
        locations: [...prev.locations, location],
      }))
    }
    setNewLocation("")
  }

  const removeMake = (make: string) => {
    setPreferences((prev) => ({
      ...prev,
      makes: prev.makes.filter((m) => m !== make),
    }))
  }

  const removeLocation = (location: string) => {
    setPreferences((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }))
  }

  const isFeatureLocked = (feature: string) => {
    return !tierLimits.features.includes(feature) && !tierLimits.features.includes("all")
  }

  const getNextTier = () => {
    const tiers = ["basic", "startup", "premium", "enterprise"] as const
    const currentIndex = tiers.indexOf(currentTier)
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Link>
            </Button>
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
            >
              Revvdoctor
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200"
            >
              {currentTier === "basic" && <Zap className="w-3 h-3" />}
              {currentTier === "startup" && <Crown className="w-3 h-3" />}
              {currentTier === "premium" && <Smartphone className="w-3 h-3" />}
              {tierLimits.name} Plan
            </Badge>
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/agents" className="text-slate-600 hover:text-slate-900 transition-colors">
              Agents
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shadow-md">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Car Preferences</h1>
                <p className="text-slate-600">Configure what types of cars Revvdoctor should find for you</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            {(preferences.makes.length >= tierLimits.maxMakes - 1 ||
              preferences.locations.length >= tierLimits.maxLocations - 1) &&
              getNextTier() && (
                <UpgradeNudge
                  title="You're hitting your limits!"
                  description={`You can only select ${tierLimits.maxMakes} car makes and ${tierLimits.maxLocations} locations on the ${tierLimits.name} plan.`}
                  missedOpportunities={8}
                  potentialSavings={1400}
                  currentPlan={tierLimits.name}
                  suggestedPlan={TIER_LIMITS[getNextTier()!].name}
                />
              )}

            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-orange-600" />
                      Preferred Car Makes
                    </CardTitle>
                    <CardDescription>
                      Select the car brands you're interested in. Leave empty to include all makes.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preferences.makes.length}/
                    {tierLimits.maxMakes === Number.POSITIVE_INFINITY ? "∞" : tierLimits.maxMakes} makes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {preferences.makes.map((make) => (
                    <Badge key={make} variant="secondary" className="flex items-center gap-1">
                      {make}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeMake(make)} />
                    </Badge>
                  ))}
                </div>

                <div
                  className={`space-y-4 ${preferences.makes.length >= tierLimits.maxMakes ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom make..."
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addMake(newMake)}
                      disabled={preferences.makes.length >= tierLimits.maxMakes}
                    />
                    <Button
                      variant="outline"
                      onClick={() => addMake(newMake)}
                      disabled={preferences.makes.length >= tierLimits.maxMakes}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {popularMakes
                      .filter((make) => !preferences.makes.includes(make))
                      .map((make) => (
                        <Button
                          key={make}
                          variant="outline"
                          size="sm"
                          onClick={() => addMake(make)}
                          disabled={preferences.makes.length >= tierLimits.maxMakes}
                        >
                          + {make}
                        </Button>
                      ))}
                  </div>
                </div>

                {preferences.makes.length >= tierLimits.maxMakes && getNextTier() && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-900">Limit reached</p>
                        <p className="text-sm text-orange-700">Upgrade to add more car makes</p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Link href="/pricing">Upgrade Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {isFeatureLocked("mot_history") && (
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-600" />
                    MOT History Lookup
                    <Badge className="bg-orange-600 text-white text-xs">Startup+</Badge>
                  </CardTitle>
                  <CardDescription>
                    Automatically check MOT history for every car to spot hidden issues before you bid.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 mb-2">
                        This feature could save you £500+ per avoided purchase
                      </p>
                      <p className="text-xs text-orange-600">Available on Startup plan and above</p>
                    </div>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                      <Link href="/pricing">Unlock MOT History</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isFeatureLocked("sms_alerts") && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Real-time SMS Alerts
                    <Badge className="bg-purple-600 text-white text-xs">Premium+</Badge>
                  </CardTitle>
                  <CardDescription>
                    Get instant SMS notifications when exceptional deals matching your criteria are found.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-2">Never miss a hot deal again - be first to bid</p>
                      <p className="text-xs text-purple-600">Available on Premium plan and above</p>
                    </div>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/pricing">Enable SMS Alerts</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      Year Range
                    </CardTitle>
                    <CardDescription>Set the minimum and maximum year for cars you're interested in.</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preferences.locations.length}/
                    {tierLimits.maxLocations === Number.POSITIVE_INFINITY ? "∞" : tierLimits.maxLocations} locations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minYear">Minimum Year</Label>
                    <Input
                      id="minYear"
                      type="number"
                      value={preferences.minYear}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          minYear: Number.parseInt(e.target.value) || 2000,
                        }))
                      }
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxYear">Maximum Year</Label>
                    <Input
                      id="maxYear"
                      type="number"
                      value={preferences.maxYear}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          maxYear: Number.parseInt(e.target.value) || new Date().getFullYear(),
                        }))
                      }
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-orange-600" />
                      Maximum Mileage
                    </CardTitle>
                    <CardDescription>
                      Set the maximum mileage you're comfortable with: {preferences.maxMileage.toLocaleString()} miles
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preferences.locations.length}/
                    {tierLimits.maxLocations === Number.POSITIVE_INFINITY ? "∞" : tierLimits.maxLocations} locations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[preferences.maxMileage]}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      maxMileage: value[0],
                    }))
                  }
                  max={200000}
                  min={10000}
                  step={5000}
                  className="w-full [&_.range-thumb]:bg-orange-500 [&_.range-track-active]:bg-orange-500"
                />
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>10,000 miles</span>
                  <span>200,000 miles</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      Preferred Locations
                    </CardTitle>
                    <CardDescription>
                      Select auction locations you prefer. Leave empty to include all locations.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preferences.locations.length}/
                    {tierLimits.maxLocations === Number.POSITIVE_INFINITY ? "∞" : tierLimits.maxLocations} locations
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {preferences.locations.map((location) => (
                    <Badge key={location} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeLocation(location)} />
                    </Badge>
                  ))}
                </div>

                <div
                  className={`space-y-4 ${preferences.locations.length >= tierLimits.maxLocations ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom location..."
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addLocation(newLocation)}
                      disabled={preferences.locations.length >= tierLimits.maxLocations}
                    />
                    <Button
                      variant="outline"
                      onClick={() => addLocation(newLocation)}
                      disabled={preferences.locations.length >= tierLimits.maxLocations}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {popularLocations
                      .filter((location) => !preferences.locations.includes(location))
                      .map((location) => (
                        <Button
                          key={location}
                          variant="outline"
                          size="sm"
                          onClick={() => addLocation(location)}
                          disabled={preferences.locations.length >= tierLimits.maxLocations}
                        >
                          + {location}
                        </Button>
                      ))}
                  </div>
                </div>

                {preferences.locations.length >= tierLimits.maxLocations && getNextTier() && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-900">Location limit reached</p>
                        <p className="text-sm text-orange-700">Upgrade to add more auction locations</p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Link href="/pricing">Upgrade Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
