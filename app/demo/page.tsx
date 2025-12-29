import { SeeItInActionForm } from "@/components/see-it-in-action-form"
import Link from "next/link"
import { ArrowLeft, Sparkles, Brain, Mail, Clock } from "lucide-react"

export const metadata = {
  title: "See It in Action - Revvdoctor Demo",
  description: "Get 2 AI-analyzed vehicles sent to your inbox in minutes. No signup required!",
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <Link
              href="/auth/signup"
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              See It in Action
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Try Revvdoctor Before You Sign Up
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get <strong>2 real AI-analyzed vehicles</strong> sent to your inbox in minutes.
              See exactly what our daily digests look like - no signup or credit card required!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600">
                Each vehicle analyzed by OpenAI GPT-4 for condition, risk, and profitability
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">
                Demo email arrives in 2-3 minutes with detailed vehicle insights
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Examples</h3>
              <p className="text-sm text-gray-600">
                Actual vehicles from UK auctions - not fake data or mockups
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <SeeItInActionForm />
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How the Demo Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-pink-600">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Enter Email</h4>
                <p className="text-sm text-gray-600">
                  Submit your email address above
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-purple-600">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">We Scrape</h4>
                <p className="text-sm text-gray-600">
                  Our system scrapes UK auction sites
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-blue-600">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analyzes</h4>
                <p className="text-sm text-gray-600">
                  OpenAI classifies condition & profit
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-green-600">
                  4
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">You Receive</h4>
                <p className="text-sm text-gray-600">
                  Beautiful email with 2 vehicles
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
              Frequently Asked Questions
            </h3>

            <details className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>How long does it take to receive the demo?</span>
                <span className="text-pink-600">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                The demo email typically arrives within 2-3 minutes. Our system scrapes vehicles,
                analyzes them with AI, and sends you the results automatically.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>Are these real vehicles or just examples?</span>
                <span className="text-pink-600">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                These are 100% real vehicles from actual UK auction sites (RAW2K, BCA, etc.).
                The AI analysis and profit estimates are generated in real-time.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>Do I need to sign up or pay anything?</span>
                <span className="text-pink-600">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                No! This demo is completely free and requires no signup or payment.
                Just enter your email and we'll send you the sample vehicles.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>What happens after the demo?</span>
                <span className="text-pink-600">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Nothing! You'll receive one demo email showing 2 vehicles. If you like what you see,
                you can sign up for a 7-day free trial to receive daily digests tailored to your preferences.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>Can I customize the demo vehicles?</span>
                <span className="text-pink-600">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                The demo shows a sample of our AI analysis. Once you sign up, you can set your
                preferences (makes, year range, budget, etc.) and receive personalized matches daily.
              </p>
            </details>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Like What You See?
            </h2>
            <p className="text-lg mb-6 opacity-95">
              Start your 7-day free trial and receive personalized daily digests
              with vehicles matched to your exact preferences!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="bg-pink-700/50 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-4 text-sm opacity-80">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
