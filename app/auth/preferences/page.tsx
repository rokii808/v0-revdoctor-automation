"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Settings, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const popularMakes = [
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Toyota",
  "Honda",
  "Ford",
  "Land Rover",
  "Porsche",
  "Jaguar",
]

const notificationTimes = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
]

export default function PreferencesPage() {
  const [accountCreated, setAccountCreated] = useState(false)
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [minBudget, setMinBudget] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [minYear, setMinYear] = useState("")
  const [maxMileage, setMaxMileage] = useState("")
  const [notificationTime, setNotificationTime] = useState("07:00")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if account was created
    const created = sessionStorage.getItem("account_created")
    if (!created) {
      router.push("/auth/signup")
      return
    }
    setAccountCreated(true)
  }, [router])

  const toggleMake = (make: string) => {
    if (selectedMakes.includes(make)) {
      setSelectedMakes(selectedMakes.filter((m) => m !== make))
    } else {
      setSelectedMakes([...selectedMakes, make])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found")
      }

      // For now, skip saving preferences to database
      // TODO: Create user_preferences table in Supabase and uncomment this code
      /*
      const { error: prefError } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        preferred_makes: selectedMakes,
        min_budget: minBudget ? parseInt(minBudget) : null,
        max_budget: maxBudget ? parseInt(maxBudget) : null,
        min_year: minYear ? parseInt(minYear) : null,
        max_mileage: maxMileage ? parseInt(maxMileage) : null,
        notification_time: notificationTime,
        updated_at: new Date().toISOString(),
      })

      if (prefError) {
        console.error("Preferences save error:", prefError)
      }
      */

      // Store preferences in localStorage temporarily
      localStorage.setItem('user_preferences', JSON.stringify({
        preferred_makes: selectedMakes,
        min_budget: minBudget,
        max_budget: maxBudget,
        min_year: minYear,
        max_mileage: maxMileage,
        notification_time: notificationTime,
      }))

      // Clear session storage
      sessionStorage.removeItem("signup_data")
      sessionStorage.removeItem("selected_plan")
      sessionStorage.removeItem("account_created")
      sessionStorage.removeItem("user_id")

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to save preferences")
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Clear session storage and go to dashboard
    sessionStorage.removeItem("signup_data")
    sessionStorage.removeItem("selected_plan")
    sessionStorage.removeItem("account_created")
    sessionStorage.removeItem("user_id")
    router.push("/dashboard")
  }

  if (!accountCreated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 mb-6" asChild>
            <Link href="/auth/create-account">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-4">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">ALMOST THERE</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Set Your Preferences</h1>
            <p className="text-lg text-slate-600">
              Tell us what you're looking for so we can personalize your experience
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Your Preferences</h3>
              <p className="text-sm text-slate-600">Customize your car sourcing workflow</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Preferred Makes */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                Preferred Car Makes (Optional)
              </Label>
              <p className="text-sm text-slate-600 mb-4">Select the brands you're most interested in</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {popularMakes.map((make) => (
                  <button
                    key={make}
                    type="button"
                    onClick={() => toggleMake(make)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedMakes.includes(make)
                        ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md"
                        : "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {selectedMakes.includes(make) && (
                      <CheckCircle2 className="w-4 h-4 inline mr-1 text-orange-600" />
                    )}
                    {make}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">Budget Range (Optional)</Label>
              <p className="text-sm text-slate-600 mb-4">Set your preferred price range</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBudget" className="text-xs text-slate-600 mb-2 block">
                    Minimum (£)
                  </Label>
                  <Input
                    id="minBudget"
                    type="number"
                    placeholder="5,000"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="maxBudget" className="text-xs text-slate-600 mb-2 block">
                    Maximum (£)
                  </Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    placeholder="20,000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minYear" className="text-sm font-semibold text-slate-900 mb-2 block">
                  Minimum Year (Optional)
                </Label>
                <Input
                  id="minYear"
                  type="number"
                  placeholder="2015"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                />
              </div>
              <div>
                <Label htmlFor="maxMileage" className="text-sm font-semibold text-slate-900 mb-2 block">
                  Max Mileage (Optional)
                </Label>
                <Input
                  id="maxMileage"
                  type="number"
                  placeholder="60,000"
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(e.target.value)}
                  className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                />
              </div>
            </div>

            {/* Notification Time */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">Daily Digest Time</Label>
              <p className="text-sm text-slate-600 mb-4">When would you like to receive your daily car digest?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {notificationTimes.map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => setNotificationTime(time.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      notificationTime === time.value
                        ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md"
                        : "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg h-14 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <>Complete Setup</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
