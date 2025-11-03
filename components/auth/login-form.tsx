"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Check, X } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to Revvdoctor!</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/auth/signup"
          className="flex-1 py-3 text-center rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
        >
          SIGN UP
        </Link>
        <div className="flex-1 py-3 text-center rounded-lg bg-gradient-to-r from-pink-100 to-pink-50 text-slate-900 font-medium border border-pink-200">
          LOG IN
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Email (Login)
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello.nixtio@gmail.com"
              required
              className="pr-10 border-slate-700 text-white placeholder:text-slate-500 focus:border-pink-400 focus:ring-pink-400 bg-popover font-medium"
            />
            {email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isEmailValid ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Password must contain 8 characters or more
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="pr-10 border-slate-700 text-white placeholder:text-slate-500 focus:border-pink-400 focus:ring-pink-400 bg-background font-extrabold"
            />
            {password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPasswordValid ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-6 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-pink-600 hover:text-pink-700">
          Sign up for free
        </Link>
      </div>
    </div>
  )
}
