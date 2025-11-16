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
          console.error("[v0] Auth callback error:", error)
          router.push("/auth/login?error=confirmation_failed")
          return
        }

        if (data.session) {
          // Check if user has a subscription
          const userId = data.session.user.id
          
          // Check dealer profile and subscription status
          const { data: dealer } = await supabase
            .from("dealers")
            .select("subscription_status")
            .eq("user_id", userId)
            .single()

          // Check Stripe subscription
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("user_id", userId)
            .single()

          // If no dealer profile or no active subscription, redirect to pricing
          if (!dealer || (!subscription && dealer.subscription_status !== "trial")) {
            console.log("[v0] New user, redirecting to pricing page")
            router.push("/pricing?new_user=true")
          } else if (subscription?.status === "active") {
            // Active subscription, go to dashboard
            console.log("[v0] Active subscription, redirecting to dashboard")
            router.push("/dashboard")
          } else {
            // Trial or no subscription, redirect to pricing with trial info
            console.log("[v0] Trial user, redirecting to pricing")
            router.push("/pricing?trial=true")
          }
        } else {
          console.log("[v0] No session found, redirecting to login")
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[v0] Unexpected error in auth callback:", err)
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
