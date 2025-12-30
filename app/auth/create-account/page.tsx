"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Lock, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function CreateAccountPage() {
  const [signupData, setSignupData] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get signup data from session storage
    const data = sessionStorage.getItem("signup_data")
    const plan = sessionStorage.getItem("selected_plan")

    if (!data || !plan) {
      // Redirect back to signup if no data
      router.push("/auth/signup")
      return
    }

    setSignupData(JSON.parse(data))
    setSelectedPlan(plan)
  }, [router])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.replace(/\//g, "").length <= 4) {
      setExpiryDate(formatted)
    }
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "")
    if (value.length <= 4) {
      setCvc(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate card details
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 15) {
        throw new Error("Please enter a valid card number")
      }
      if (!expiryDate || expiryDate.length < 5) {
        throw new Error("Please enter a valid expiry date")
      }
      if (!cvc || cvc.length < 3) {
        throw new Error("Please enter a valid CVC")
      }
      if (!cardName) {
        throw new Error("Please enter the cardholder name")
      }

      // Create Supabase account
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            dealer_name: signupData.dealerName,
            selected_plan: selectedPlan,
          },
        },
      })

      if (authError) throw authError

      // In a real app, you would:
      // 1. Send card details to Stripe/payment processor
      // 2. Create subscription with 7-day trial
      // 3. Store payment method securely
      // For now, we'll store the plan info and continue

      if (authData.user) {
        // Store account info for preferences page
        sessionStorage.setItem("account_created", "true")
        sessionStorage.setItem("user_id", authData.user.id)

        // Redirect to preferences form
        router.push("/auth/preferences")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  if (!signupData) {
    return null
  }

  const plans: { [key: string]: { price: number; description: string } } = {
    Starter: { price: 97, description: "Up to 5 cars daily" },
    Premium: { price: 299, description: "Up to 10 cars daily" },
    Pro: { price: 599, description: "Up to 25 cars daily" },
  }

  const currentPlan = plans[selectedPlan]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 py-12 px-6">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 mb-6" asChild>
            <Link href="/auth/select-plan">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-4">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">7-DAY FREE TRIAL</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Complete Your Account</h1>
            <p className="text-lg text-slate-600">
              Enter your payment details to start your free trial
            </p>
          </div>
        </div>

        {/* Selected Plan Summary */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Your Plan</p>
              <h2 className="text-3xl font-bold mb-2">{selectedPlan}</h2>
              <p className="text-orange-100">{currentPlan?.description}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm font-medium mb-1">After Trial</p>
              <p className="text-4xl font-bold">£{currentPlan?.price}</p>
              <p className="text-orange-100 text-sm">/month</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-orange-400/30">
            <p className="text-sm text-orange-100 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Free for 7 days, then £{currentPlan?.price}/month. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Payment Details</h3>
              <p className="text-sm text-slate-600">Secure payment processing</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="cardNumber" className="text-sm font-semibold text-slate-900 mb-2 block">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate" className="text-sm font-semibold text-slate-900 mb-2 block">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc" className="text-sm font-semibold text-slate-900 mb-2 block">
                  CVC
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder="123"
                  value={cvc}
                  onChange={handleCvcChange}
                  className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardName" className="text-sm font-semibold text-slate-900 mb-2 block">
                Cardholder Name
              </Label>
              <Input
                id="cardName"
                type="text"
                placeholder="John Smith"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="h-12 border-2 border-slate-200 rounded-xl shadow-sm focus:border-orange-400 hover:border-orange-300 transition-all"
                required
              />
            </div>

            {/* Account Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Account Email</p>
              <p className="font-semibold text-slate-900">{signupData.email}</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg h-14 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Your Account...
                </span>
              ) : (
                <>Start 7-Day Free Trial</>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Your payment information is encrypted and secure
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
