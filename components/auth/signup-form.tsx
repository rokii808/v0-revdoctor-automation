"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Check, X } from "lucide-react"
import Link from "next/link"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dealerName, setDealerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordValid = password.length >= 6
  const isDealerNameValid = dealerName.length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            dealer_name: dealerName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="pt-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-pink-600 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="text-gray-600">
            We've sent you a confirmation link at <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">Click the link in your email to activate your Revvdoctor account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="space-y-3 text-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Welcome to Revvdoctor!</h1>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm">
            SIGN UP
          </button>
          <Link href="/auth/login">
            <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">
              LOG IN
            </button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-600">
            Email (Login)
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dealer@example.com"
              required
              className={`border-2 pr-10 ${
                email && isEmailValid
                  ? "border-green-400 focus:border-green-500"
                  : email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-pink-400"
              }`}
            />
            {email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isEmailValid ? (
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-600">
            Password must contain 8 characters or more
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={`border-2 pr-10 ${
                password && isPasswordValid
                  ? "border-green-400 focus:border-green-500"
                  : password
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-pink-400"
              }`}
            />
            {password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPasswordValid ? (
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="dealerName" className="text-sm font-medium text-gray-600">
            Dealership Name
          </label>
          <div className="relative">
            <Input
              id="dealerName"
              type="text"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              placeholder="Your Dealership Ltd"
              required
              className={`border-2 pr-10 ${
                dealerName && isDealerNameValid
                  ? "border-green-400 focus:border-green-500"
                  : dealerName
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-pink-400"
              }`}
            />
            {dealerName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isDealerNameValid ? (
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I have read and agree{" "}
            <a href="#" className="text-pink-600 hover:text-pink-700 underline">
              Terms and Risk statements
            </a>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900 font-semibold text-base py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-pink-600 hover:text-pink-700">
          Sign in
        </Link>
      </div>
    </div>
  )
}
