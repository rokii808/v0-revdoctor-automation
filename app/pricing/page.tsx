"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Zap, Shield, Clock, Lock, TrendingUp, Users, Smartphone, ArrowLeft, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Basic",
    price: "£29",
    period: "per month",
    description: "Perfect for solo dealers who want to save time and avoid bad purchases",
    features: [
      "Daily digest (up to 10 cars)",
      "Basic AI health screening",
      "ROI tracking dashboard",
      "Email delivery",
      "Standard support",
    ],
    limitations: ["Limited to 10 cars per day", "No MOT history lookup", "No team accounts"],
    buttonText: "Start Free Trial",
    popular: false,
    plan: "basic",
    icon: Zap,
    savings: "Save £2,000+ monthly",
  },
  {
    name: "Startup",
    price: "£59",
    period: "per month",
    description: "For small teams who need MOT data and want competitive edge with early access",
    features: [
      "Everything in Basic",
      "Up to 25 cars per digest",
      "MOT history auto-lookup",
      "Team accounts (up to 3 users)",
      "Priority digest at 6 AM",
      "Chat support",
    ],
    limitations: ["Limited to 25 cars per day", "No SMS alerts", "No advanced filtering"],
    buttonText: "Upgrade to Startup",
    popular: true,
    plan: "startup",
    icon: TrendingUp,
    savings: "Save £4,000+ monthly",
    upgrade_trigger: "You missed 12 healthy deals this week",
  },
  {
    name: "Premium",
    price: "£99",
    period: "per month",
    description: "For growing dealers who want instant alerts and never miss a great deal",
    features: [
      "Everything in Startup",
      "Up to 50 cars per digest",
      "Advanced filtering (auction house, condition grade)",
      "Real-time SMS/WhatsApp alerts",
      "Custom buyer profiles",
      "Phone support",
    ],
    limitations: ["Limited to 50 cars per day", "No API access", "No white-label features"],
    buttonText: "Go Premium",
    popular: false,
    plan: "premium",
    icon: Smartphone,
    savings: "Save £8,000+ monthly",
    upgrade_trigger: "Stop checking auction sites manually",
  },
  {
    name: "Enterprise",
    price: "£299",
    period: "per month",
    description: "For dealer groups who want unlimited access and custom AI training",
    features: [
      "Everything in Premium",
      "Unlimited cars and users",
      "API access for dealer systems",
      "Custom AI model training",
      "White-label dashboards",
      "Dedicated account manager",
    ],
    limitations: [],
    buttonText: "Contact Sales",
    popular: false,
    plan: "enterprise",
    icon: Users,
    savings: "Save £15,000+ monthly",
    custom_pricing: true,
  },
]

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  const isNewUser = searchParams.get('new_user') === 'true'
  const isRequired = searchParams.get('required') === 'true'
  const isTrial = searchParams.get('trial') === 'true'

  const handleSubscribe = async (plan: string) => {
    if (plan === "enterprise") {
      window.location.href = "mailto:sales@revvdoctor.ai?subject=Enterprise Plan Inquiry"
      return
    }

    setIsLoading(plan)

    try {
      const userId = "placeholder-user-id"

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, plan }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Failed to start subscription. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Link>
            </Button>
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Revvdoctor
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="hidden md:flex">
              Limited Time: 7-Day Free Trial
            </Badge>
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild variant="outline">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {isNewUser && (
          <Alert className="mb-8 max-w-4xl mx-auto border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <AlertCircle className="h-4 w-4 text-pink-600" />
            <AlertDescription className="text-pink-900">
              <strong>Welcome to RevvDoctor!</strong> Please select a plan to start finding profitable deals. All plans include a 7-day free trial.
            </AlertDescription>
          </Alert>
        )}

        {isRequired && (
          <Alert className="mb-8 max-w-4xl mx-auto border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>Subscription Required:</strong> An active subscription is needed to access the dashboard and start screening vehicles.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="w-3 h-3 mr-1" />
            Join 500+ Dealers Already Saving Time & Money
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Stop Missing Profitable Deals</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            While you manually screen cars, competitors using Revvdoctor are already bidding on the best deals. Join
            them and never miss a healthy car again.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto mb-6">
            <p className="text-red-700 font-medium">⚠️ You missed 23 healthy deals last week</p>
            <p className="text-red-600 text-sm">That's £4,140 in potential profit lost to competitors</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span>7-day free trial • No setup fees • Cancel anytime</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-blue-500 shadow-lg scale-105 bg-gradient-to-b from-blue-50 to-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    {!plan.custom_pricing && <span className="text-slate-500 ml-2">{plan.period}</span>}
                    {plan.custom_pricing && <span className="text-slate-500 ml-2">+ custom</span>}
                  </div>
                  <CardDescription className="mt-3 text-sm">{plan.description}</CardDescription>
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                      {plan.savings}
                    </Badge>
                  )}
                  {plan.upgrade_trigger && (
                    <div className="mt-2 text-xs text-red-600 font-medium">⚠️ {plan.upgrade_trigger}</div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3 opacity-60">
                      <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : ""
                    }`}
                    onClick={() => handleSubscribe(plan.plan)}
                    disabled={isLoading === plan.plan}
                  >
                    {isLoading === plan.plan ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 mb-16 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Don't Let Competitors Beat You to the Best Deals</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-3xl font-bold text-red-600">23</div>
              <p className="text-red-700">Healthy cars you missed last week</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">£4,140</div>
              <p className="text-red-700">Potential profit lost</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">3.5hrs</div>
              <p className="text-red-700">Daily time wasted screening</p>
            </div>
          </div>
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            Stop Missing Deals - Start Free Trial
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Why Choose Revvdoctor?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-600 text-sm">
                Advanced AI screens thousands of cars daily, identifying only the healthiest opportunities for your lot.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Risk-Free Decisions</h3>
              <p className="text-slate-600 text-sm">
                Every car comes with a detailed health report and risk score, so you bid with confidence.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Save Hours Daily</h3>
              <p className="text-slate-600 text-sm">
                Stop manually browsing auction sites. Get curated, healthy cars delivered to your inbox every morning.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="font-semibold text-slate-900 cursor-pointer">Can I change plans anytime?</summary>
              <p className="text-slate-600 mt-3">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </details>
            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="font-semibold text-slate-900 cursor-pointer">
                What happens during the free trial?
              </summary>
              <p className="text-slate-600 mt-3">
                You get full access to all features for 7 days. No credit card required. Cancel anytime during the trial
                with no charges.
              </p>
            </details>
            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="font-semibold text-slate-900 cursor-pointer">
                How accurate is the AI screening?
              </summary>
              <p className="text-slate-600 mt-3">
                Our AI has been trained on thousands of auction listings and achieves 95%+ accuracy in identifying
                healthy vs. problematic vehicles.
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  )
}
