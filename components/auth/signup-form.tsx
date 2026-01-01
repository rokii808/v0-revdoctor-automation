"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dealerName, setDealerName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordValid = password.length >= 8
  const isDealerNameValid = dealerName.length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Store signup data in session storage to use after plan selection
    sessionStorage.setItem(
      "signup_data",
      JSON.stringify({
        email,
        password,
        dealerName,
      })
    )

    // Redirect to plan selection page
    router.push("/auth/select-plan")
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome to RevvDoctor!</h1>
        <p className="text-slate-600 text-lg">Create your account to get started</p>
      </motion.div>

      {/* Tab switcher */}
      <motion.div
        className="flex gap-3 justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30">
          SIGN UP
        </div>
        <Link href="/auth/login">
          <button className="px-8 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-md hover:shadow-lg">
            LOG IN
          </button>
        </Link>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
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
            >
              <Alert className="border-red-200 bg-red-50 rounded-xl shadow-sm">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label htmlFor="dealerName" className="text-sm font-semibold text-slate-700">
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
              className={`h-12 border-2 pr-11 rounded-xl shadow-sm transition-all ${
                dealerName && isDealerNameValid
                  ? "border-green-400 focus:border-green-500 bg-green-50/30"
                  : dealerName
                    ? "border-red-400 focus:border-red-500 bg-red-50/30"
                    : "border-slate-200 focus:border-orange-400 hover:border-orange-300"
              }`}
            />
            <AnimatePresence>
              {dealerName && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {isDealerNameValid ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
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
                  {isEmailValid ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password <span className="text-slate-500 font-normal">(minimum 8 characters)</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
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
                  {isPasswordValid ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 pb-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-5 h-5 rounded-md border-2 border-slate-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
            I have read and agree to the{" "}
            <a href="#" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Terms and Risk Statements
            </a>
          </label>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={!isEmailValid || !isPasswordValid || !isDealerNameValid}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base h-14 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Plan Selection
          </Button>
        </motion.div>
      </motion.form>

      <motion.div
        className="mt-8 text-center text-sm text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-orange-600 hover:text-orange-700">
          Sign in
        </Link>
      </motion.div>
    </motion.div>
  )
}
