"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: 97,
    description: "Up to 5 cars daily",
    features: ["Basic AI screening", "Email support", "Daily digest emails", "Basic analytics"],
    popular: false,
  },
  {
    name: "Premium",
    price: 299,
    description: "Up to 10 cars daily",
    features: [
      "Advanced AI screening",
      "ROI tracking",
      "Priority support",
      "Advanced analytics",
      "Custom preferences",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: 599,
    description: "Up to 25 cars daily",
    features: [
      "Team accounts",
      "6 AM delivery",
      "Chat support",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
    ],
    popular: false,
  },
]

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState("Premium")
  const [signupData, setSignupData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get signup data from session storage
    const data = sessionStorage.getItem("signup_data")
    if (!data) {
      // Redirect back to signup if no data
      router.push("/auth/signup")
      return
    }
    setSignupData(JSON.parse(data))
  }, [router])

  const handleContinue = () => {
    // Store selected plan
    sessionStorage.setItem("selected_plan", selectedPlan)
    // Redirect to payment/account creation
    router.push("/auth/create-account")
  }

  if (!signupData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 mb-6" asChild>
            <Link href="/auth/signup">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-4">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">7-DAY FREE TRIAL</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start your 7-day free trial. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={`relative p-8 rounded-3xl text-left transition-all duration-300 ${
                selectedPlan === plan.name
                  ? "bg-white border-3 border-orange-500 shadow-2xl shadow-orange-500/20 -translate-y-2"
                  : "bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
              } ${plan.popular ? "ring-2 ring-orange-400" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-bold shadow-lg shadow-orange-500/40 px-6 py-2">
                  MOST POPULAR
                </div>
              )}

              {/* Selection indicator */}
              {selectedPlan === plan.name && (
                <div className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-4">{plan.name}</h3>
              <p className="text-slate-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <p className="text-5xl font-bold text-slate-900">£{plan.price}</p>
                <p className="text-slate-500">/month after trial</p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="max-w-2xl mx-auto text-center">
          <Button
            onClick={handleContinue}
            className="w-full max-w-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg h-16 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:-translate-y-1"
          >
            Start 7-Day Free Trial with {selectedPlan}
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            No payment required during trial • Cancel anytime before trial ends
          </p>
        </div>
      </div>
    </div>
  )
}
