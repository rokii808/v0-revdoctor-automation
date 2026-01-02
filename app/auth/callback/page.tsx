"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[Auth] Callback error:", error)
          router.push("/auth/login?error=confirmation_failed")
          return
        }

        if (data.session) {
          const userId = data.session.user.id

          // Run both queries in parallel for faster loading
          const [dealerResult, subscriptionResult] = await Promise.all([
            supabase
              .from("dealers")
              .select("id, subscription_status, user_id")
              .eq("user_id", userId)
              .single(),
            supabase
              .from("subscriptions")
              .select("status, current_period_end")
              .eq("user_id", userId)
              .single()
          ])

          const dealer = dealerResult.data
          const subscription = subscriptionResult.data

          if (!dealer) {
            // New user - redirect to onboarding
            console.log("[Auth] New user detected, redirecting to onboarding")
            router.push("/onboarding")
            return
          }

          // User has dealer profile
          if (dealer.subscription_status === "trial") {
            // Trial user - allow dashboard access
            console.log("[Auth] Trial user, redirecting to dashboard")
            router.push("/dashboard")
          } else if (subscription?.status === "active") {
            // Active paid subscription
            console.log("[Auth] Active subscription, redirecting to dashboard")
            router.push("/dashboard")
          } else if (dealer.subscription_status === "active") {
            // Active based on dealer status
            router.push("/dashboard")
          } else {
            // No active subscription or trial - redirect to pricing
            console.log("[Auth] No active subscription, redirecting to pricing")
            router.push("/pricing?required=true")
          }
        } else {
          console.log("[Auth] No session found, redirecting to login")
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[Auth] Unexpected error in callback:", err)
        router.push("/auth/login?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">Setting up your account...</h2>
        <p className="text-gray-600">Please wait while we prepare your Revvdoctor experience.</p>
      </div>
    </div>
  )
}
