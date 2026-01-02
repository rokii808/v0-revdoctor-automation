"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Check, ArrowRight, Car, MapPin, Calendar, Gauge, Plus, X, Loader2, Sparkles } from "lucide-react"
import { savePrefs } from "@/lib/actions"

const PRICING_PLANS = [
  {
    name: "Basic",
    price: "£29",
    period: "/month",
    plan: "basic",
    features: [
      "Daily digest (10 cars)",
      "Basic AI screening",
      "Email delivery",
    ],
    popular: false,
  },
  {
    name: "Startup",
    price: "£59",
    period: "/month",
    plan: "startup",
    features: [
      "Daily digest (25 cars)",
      "MOT history lookup",
      "Team accounts (3 users)",
      "Priority delivery",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "£99",
    period: "/month",
    plan: "premium",
    features: [
      "Daily digest (50 cars)",
      "Real-time SMS alerts",
      "Advanced filtering",
      "Custom profiles",
    ],
    popular: false,
  },
]

const POPULAR_MAKES = [
  "BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Toyota", "Honda", "Nissan"
]

const POPULAR_LOCATIONS = [
  "London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Bristol"
]

function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Step 2: Plan selection
  const [selectedPlan, setSelectedPlan] = useState("startup")

  // Step 3: Preferences
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

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setUser(user)

    // Check if already has dealer profile and preferences
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id, subscription_status")
      .eq("user_id", user.id)
      .single()

    if (dealer && dealer.subscription_status) {
      // User already onboarded, redirect to dashboard
      router.push("/dashboard")
    }
  }

  const handlePlanSelect = async () => {
    setIsLoading(true)

    try {
      // Create dealer profile with 7-day free trial
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7)

      const { error: dealerError } = await supabase
        .from("dealers")
        .upsert({
          user_id: user.id,
          email: user.email,
          dealer_name: user.email?.split("@")[0] || "Dealer",
          subscription_status: "trial",
          subscription_expires_at: trialEndsAt.toISOString(),
          selected_plan: selectedPlan,
          min_year: 2015,
          max_bid: 15000,
          created_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        })

      if (dealerError) {
        console.error("Error creating dealer:", dealerError)
        throw dealerError
      }

      setStep(3)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to start trial. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)

    try {
      // Save preferences
      const result = await savePrefs(user.id, preferences)

      if (!result.success) {
        throw new Error("Failed to save preferences")
      }

      // Update dealer profile
      await supabase
        .from("dealers")
        .update({
          min_year: preferences.minYear,
          max_bid: preferences.maxBid,
        })
        .eq("user_id", user.id)

      // Redirect to dashboard
      router.push("/dashboard?onboarding=complete")
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Failed to save preferences. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addMake = (make: string) => {
    if (make && !preferences.makes.includes(make)) {
      setPreferences(prev => ({ ...prev, makes: [...prev.makes, make] }))
      setNewMake("")
    }
  }

  const removeMake = (make: string) => {
    setPreferences(prev => ({ ...prev, makes: prev.makes.filter(m => m !== make) }))
  }

  const addLocation = (location: string) => {
    if (location && !preferences.locations.includes(location)) {
      setPreferences(prev => ({ ...prev, locations: [...prev.locations, location] }))
      setNewLocation("")
    }
  }

  const removeLocation = (location: string) => {
    setPreferences(prev => ({ ...prev, locations: prev.locations.filter(l => l !== location) }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Revvdoctor
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-pink-600" : "text-gray-400"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? "bg-pink-600 text-white" : "bg-gray-200"
                }`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : "1"}
                </div>
                <span className="font-medium hidden sm:block">Welcome</span>
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? "bg-pink-600" : "bg-gray-200"}`} />
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-pink-600" : "text-gray-400"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? "bg-pink-600 text-white" : "bg-gray-200"
                }`}>
                  {step > 2 ? <Check className="w-5 h-5" /> : "2"}
                </div>
                <span className="font-medium hidden sm:block">Choose Plan</span>
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? "bg-pink-600" : "bg-gray-200"}`} />
              <div className={`flex items-center gap-2 ${step >= 3 ? "text-pink-600" : "text-gray-400"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 3 ? "bg-pink-600 text-white" : "bg-gray-200"
                }`}>
                  3
                </div>
                <span className="font-medium hidden sm:block">Preferences</span>
              </div>
            </div>
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Welcome to Revvdoctor!</CardTitle>
                <CardDescription className="text-lg mt-4">
                  Let's get you set up to find the healthiest auction cars in just 3 simple steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>7-day free trial - no credit card required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Daily AI-powered vehicle screening</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Personalized recommendations based on your preferences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Cancel anytime during trial</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-green-600">7-Day Free Trial</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Start your free trial today. No credit card required.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {PRICING_PLANS.map((plan) => (
                  <Card
                    key={plan.plan}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.plan
                        ? "border-2 border-pink-600 shadow-xl scale-105"
                        : "border-2 border-gray-200 hover:border-gray-300"
                    } ${plan.popular ? "bg-gradient-to-b from-pink-50 to-white" : ""}`}
                    onClick={() => setSelectedPlan(plan.plan)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                        7-day free trial
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {selectedPlan === plan.plan && (
                        <div className="w-full text-center text-pink-600 font-medium">
                          <Check className="w-5 h-5 inline mr-1" />
                          Selected
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  onClick={handlePlanSelect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Trial...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Your Preferences</h2>
                <p className="text-gray-600">Tell us what types of cars you're looking for</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-pink-600" />
                    Preferred Car Makes
                  </CardTitle>
                  <CardDescription>
                    Select the brands you're interested in (or leave empty for all makes)
                  </CardDescription>
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

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom make..."
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addMake(newMake)}
                    />
                    <Button variant="outline" onClick={() => addMake(newMake)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_MAKES.filter(m => !preferences.makes.includes(m)).map((make) => (
                      <Button
                        key={make}
                        variant="outline"
                        size="sm"
                        onClick={() => addMake(make)}
                      >
                        + {make}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-600" />
                    Year Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minYear">Minimum Year</Label>
                      <Input
                        id="minYear"
                        type="number"
                        value={preferences.minYear}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          minYear: parseInt(e.target.value) || 2000
                        }))}
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
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          maxYear: parseInt(e.target.value) || new Date().getFullYear()
                        }))}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-pink-600" />
                    Maximum Mileage
                  </CardTitle>
                  <CardDescription>
                    {preferences.maxMileage.toLocaleString()} miles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={[preferences.maxMileage]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, maxMileage: value[0] }))}
                    max={200000}
                    min={10000}
                    step={5000}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>10,000</span>
                    <span>200,000</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    Preferred Locations
                  </CardTitle>
                  <CardDescription>
                    Select auction locations (or leave empty for all locations)
                  </CardDescription>
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

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom location..."
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addLocation(newLocation)}
                    />
                    <Button variant="outline" onClick={() => addLocation(newLocation)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LOCATIONS.filter(l => !preferences.locations.includes(l)).map((location) => (
                      <Button
                        key={location}
                        variant="outline"
                        size="sm"
                        onClick={() => addLocation(location)}
                      >
                        + {location}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup & Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingPageContent />
    </Suspense>
  )
}
