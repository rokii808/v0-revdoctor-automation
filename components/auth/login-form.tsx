"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

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
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
        <p className="text-slate-600">Log in to your RevvDoctor account</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="flex gap-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/auth/signup"
          className="flex-1 py-3 text-center rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-all shadow-sm"
        >
          Sign Up
        </Link>
        <div className="flex-1 py-3 text-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30">
          Log In
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-slate-900 mb-2 block">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className={`h-12 border-2 pr-11 rounded-xl shadow-sm transition-all ${
                email && isEmailValid
                  ? "border-green-400 focus:border-green-500 bg-green-50/30"
                  : email
                    ? "border-red-400 focus:border-red-500 bg-red-50/30"
                    : "border-slate-200 focus:border-orange-400 hover:border-orange-300"
              }`}
            />
            <AnimatePresence>
              {email && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isEmailValid ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isEmailValid ? "✓" : "✗"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-slate-900 mb-2 block">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={`h-12 border-2 pr-11 rounded-xl shadow-sm transition-all ${
                password && isPasswordValid
                  ? "border-green-400 focus:border-green-500 bg-green-50/30"
                  : password
                    ? "border-red-400 focus:border-red-500 bg-red-50/30"
                    : "border-slate-200 focus:border-orange-400 hover:border-orange-300"
              }`}
            />
            <AnimatePresence>
              {password && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isPasswordValid ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isPasswordValid ? "✓" : "✗"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link href="/auth/reset-password" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base h-14 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </Button>
        </motion.div>
      </motion.form>

      {/* Sign up link */}
      <motion.div
        className="mt-6 text-center text-sm text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-orange-600 hover:text-orange-700">
          Sign up for free
        </Link>
      </motion.div>
    </motion.div>
  )
}
