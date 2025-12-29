"use client"

import { useState } from "react"
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react"

export function SeeItInActionForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/demo/see-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setEmail("")
      } else {
        setError(data.error || "Failed to send demo. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("Demo submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success State */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Demo Email Sent! 🎉
              </h4>
              <p className="text-sm text-green-700">
                Check your inbox in <strong>2-3 minutes</strong> to see 2 AI-analyzed vehicles with detailed insights.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your email to see it in action
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="demo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading || success}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending Demo...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Demo Sent!
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              Send Me 2 Sample Cars
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          ✓ No signup required • ✓ 2 real AI-analyzed vehicles • ✓ Arrives in 2-3 minutes
        </p>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
          What you'll receive:
        </h4>
        <ul className="space-y-1.5 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>2 real vehicles from UK auctions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>AI-powered risk analysis & profit estimates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Detailed insights (confidence, repair costs, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Example of daily digests you'd receive</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
