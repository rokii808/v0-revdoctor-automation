"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

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
          console.log("[v0] User confirmed successfully, redirecting to dashboard")
          router.push("/dashboard")
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
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Confirming your account...</h2>
        <p className="text-gray-600">Please wait while we set up your Revvdoctor account.</p>
      </div>
    </div>
  )
}
