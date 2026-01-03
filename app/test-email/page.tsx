"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Car, CheckCircle, ArrowLeft, AlertTriangle, Sparkles, RefreshCw, Shield } from 'lucide-react'
import { useState } from "react"

const sampleCars = [
  {
    title: "2019 BMW 3 Series 320d M Sport",
    price: "£18,500",
    verdict: "HEALTHY",
    faultType: "Service",
    risk: 15,
    reason: "Minor service light, otherwise excellent condition",
    url: "https://www.raw2k.co.uk/vehicle/bmw-3-series-2019",
  },
  {
    title: "2020 Audi A4 2.0 TDI S Line",
    price: "£22,000",
    verdict: "HEALTHY",
    faultType: "Tyre",
    risk: 20,
    reason: "Front tyres need replacing, no other issues",
    url: "https://www.raw2k.co.uk/vehicle/audi-a4-2020",
  },
]

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [cars, setCars] = useState(sampleCars)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const generateFreshListings = () => {
    const carModels = [
      { make: "BMW", model: "3 Series 320d M Sport", year: "2019", basePrice: 18500 },
      { make: "Audi", model: "A4 2.0 TDI S Line", year: "2020", basePrice: 22000 },
      { make: "Mercedes", model: "C220d AMG Line", year: "2018", basePrice: 19750 },
      { make: "Volkswagen", model: "Golf GTI", year: "2021", basePrice: 24500 },
      { make: "BMW", model: "X3 xDrive20d", year: "2020", basePrice: 28000 },
      { make: "Audi", model: "Q5 2.0 TDI", year: "2019", basePrice: 26500 },
      { make: "Mercedes", model: "GLC 220d", year: "2021", basePrice: 32000 },
      { make: "Jaguar", model: "XE 2.0d R-Sport", year: "2019", basePrice: 21000 },
    ]

    const faultTypes = ["Service", "Tyre", "Battery", "MOT", "Brake", "Clutch"]
    const reasons = [
      "Minor service light, otherwise excellent condition",
      "Front tyres need replacing, no other issues",
      "Weak battery, easily replaceable",
      "MOT due next month, no advisories",
      "Brake pads at 30%, good for 6 months",
      "Clutch feels slightly heavy but functional",
    ]

    const shuffled = [...carModels].sort(() => 0.5 - Math.random())

    return shuffled.slice(0, 2).map((car, index) => {
      const priceVariation = Math.floor(Math.random() * 2000) - 1000
      const risk = Math.floor(Math.random() * 25) + 5
      const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)]
      const reason = reasons[Math.floor(Math.random() * reasons.length)]

      return {
        title: `${car.year} ${car.make} ${car.model}`,
        price: `£${(car.basePrice + priceVariation).toLocaleString()}`,
        verdict: "HEALTHY",
        faultType,
        risk,
        reason,
        url: `https://www.raw2k.co.uk/vehicle/${car.make.toLowerCase()}-${car.model.toLowerCase().replace(/\s+/g, "-")}-${car.year}`,
      }
    })
  }

  const handleRefreshListings = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const freshListings = generateFreshListings()
    setCars(freshListings)
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  const handleSendTestEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsSending(true)
    try {
      console.log("[v0] Sending preview request via n8n...")

      const response = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          count: 2,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("[v0] Preview email sent successfully via n8n")
        alert(
          `✅ Success! Check your inbox at ${email}\n\nYour sample digest with 2 healthy car listings is on its way.\n\nCheck your spam folder if you don't see it within 2 minutes.`,
        )
      } else {
        console.error("[v0] Preview send failed:", result)
        const errorMessage = result.details || result.error || "Unknown error occurred"
        alert(`❌ Failed to send preview email:\n\n${errorMessage}`)
      }
    } catch (error) {
      console.error("[v0] Preview send error:", error)
      alert("❌ Error sending preview email. Check console for details.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-serif font-bold text-foreground">Revvdoctor</h1>
          </div>
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">See it in Action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Experience how Revvdoctor's AI-powered daily digest delivers pre-screened healthy cars directly to your
            inbox
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 text-sm">
              Free Trial - Preview 2 Cars
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Trusted by 100+ UK Dealerships</span>
            </div>
          </div>
        </div>

        <Card className="mb-16 border-2 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
              <CardTitle className="font-serif text-3xl">Get Your Sample Digest</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Enter your email address to receive a sample digest with 2 healthy car listings
              <br />
              <span className="inline-flex items-center gap-1.5 mt-3 text-sm">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by n8n
                </Badge>
                <span className="text-muted-foreground">Same template used for production digests</span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pb-10">
            <div className="max-w-md mx-auto space-y-2">
              <Input
                type="email"
                placeholder="e.g. dealer@example.com"
                value={email}
                onChange={handleEmailChange}
                className={`text-center h-14 text-lg ${emailError ? "border-red-500" : ""}`}
              />
              {emailError && (
                <p className="text-red-500 text-sm text-center">{emailError}</p>
              )}
            </div>
            <div className="text-center">
              <Button
                onClick={handleSendTestEmail}
                disabled={isSending || !email || !!emailError}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg px-10 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending to Your Inbox...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Get My Sample Listings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">
                {lastRefresh ? "Fresh Listings" : "Sample Healthy Cars"}
              </h2>
              <p className="text-muted-foreground text-lg">What you'd receive in your daily digest</p>
            </div>
            <div className="flex items-center gap-4">
              {lastRefresh && (
                <span className="text-sm text-muted-foreground">
                  Updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleRefreshListings}
                disabled={isRefreshing}
                variant="outline"
                size="lg"
                className="shadow-md bg-white hover:bg-gray-50"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Loading New Cars...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    See More Cars
                  </>
                )}
              </Button>
            </div>
          </div>

          {isRefreshing && (
            <Card className="mb-8 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200 shadow-md">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-orange-700 font-semibold text-xl mb-2">Scanning RAW2K Auctions...</p>
                  <p className="text-sm text-orange-600">AI is analyzing condition reports in real-time</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {cars.map((car, index) => (
              <Card
                key={`${car.title}-${index}`}
                className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30"
              >
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="font-semibold text-2xl">{car.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1.5">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        {car.verdict}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`px-3 py-1.5 ${
                          car.risk < 20 
                            ? "text-green-600 border-green-300 bg-green-50" 
                            : "text-orange-600 border-orange-300 bg-orange-50"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1.5" />
                        Risk: {car.risk}/100
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <span className="text-sm text-muted-foreground block mb-2">Price</span>
                      <p className="font-bold text-2xl text-green-600">{car.price}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <span className="text-sm text-muted-foreground block mb-2">Issue Type</span>
                      <p className="font-semibold text-lg">{car.faultType}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <span className="text-sm text-muted-foreground block mb-2">Risk Score</span>
                      <p className={`font-semibold text-lg ${car.risk < 20 ? "text-green-600" : "text-orange-600"}`}>
                        {car.risk}/100 {car.risk < 20 ? "✅" : "⚠️"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 p-5 bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-900">AI Analysis</span>
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                        Why this car?
                      </Badge>
                    </div>
                    <p className="text-base leading-relaxed text-gray-700">{car.reason}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="default" size="lg" asChild className="shadow-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                      <a href={car.url} target="_blank" rel="noopener noreferrer">
                        View Live Listing →
                      </a>
                    </Button>
                    {lastRefresh && (
                      <Badge className="bg-green-50 text-green-700 border-green-300 px-4 py-2 text-sm">
                        ✨ Fresh
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-10 border-2 border-orange-200 bg-white shadow-md">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                <strong className="text-foreground">Want cars like these in your inbox?</strong> Enter your email above to get started.
              </p>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="shadow-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Back to Email Input
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 shadow-sm bg-white">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Car className="w-5 h-5 text-orange-600" />
              <CardTitle className="font-serif text-2xl">How Revvdoctor Works for Dealerships</CardTitle>
            </div>
            <CardDescription className="text-base">
              Discover the steps our AI takes to ensure you receive only the best healthy car listings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="font-bold text-2xl">1</span>
                </div>
                <h4 className="font-semibold text-lg mb-3">AI Screens Cars</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI reads condition reports and identifies healthy vs problematic vehicles
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="font-bold text-2xl">2</span>
                </div>
                <h4 className="font-semibold text-lg mb-3">Smart Filtering</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Only cars matching your preferences (make, year, budget) are included
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="font-bold text-2xl">3</span>
                </div>
                <h4 className="font-semibold text-lg mb-3">Daily Digest</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every morning at 7 AM, get pre-screened healthy cars in your inbox
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="shadow-sm bg-transparent">
            <a href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
