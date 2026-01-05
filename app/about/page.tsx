import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Target, Users, Zap } from "lucide-react"

export const metadata = {
  title: "About Us | Revvdoctor - Automated Vehicle Intelligence Platform",
  description:
    "Learn about Revvdoctor's mission to revolutionize automotive retail through intelligent automation and data-driven insights.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">Revvdoctor</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-orange-600 font-semibold">
                About Us
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Transforming Vehicle Sourcing Through Intelligent Automation
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-balance leading-relaxed">
            We're building the future of automotive retail by helping dealers find, evaluate, and acquire the best
            vehicles with unprecedented speed and accuracy.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm mb-6">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Empowering Dealers with Intelligent Technology</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every day, thousands of vehicles are listed across multiple auction platforms. Finding the right
                vehicles at the right price is time-consuming, error-prone, and often means missing out on the best
                opportunities.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Revvdoctor changes that. We've built an intelligent platform that continuously monitors auction sites,
                analyzes vehicle data, and delivers personalized recommendations directly to your inbox—so you never
                miss a deal.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-orange-200">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Automated Monitoring</h3>
                    <p className="text-gray-600">Continuous scanning of major auction platforms 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Intelligent Analysis</h3>
                    <p className="text-gray-600">Advanced algorithms evaluate vehicle condition and value</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personalized Delivery</h3>
                    <p className="text-gray-600">Only the best matches sent directly to you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 text-balance">The principles that guide everything we build</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-gray-200 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Speed & Efficiency</h3>
              <p className="text-gray-600 leading-relaxed">
                Time is money in automotive retail. We help you act faster than your competition by delivering insights
                in real-time.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-gray-200 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precision & Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Every recommendation is carefully analyzed to ensure you're only seeing vehicles worth your attention.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-gray-200 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dealer-First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Built by people who understand the automotive industry and the challenges dealers face every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Started</h2>
            <p className="text-xl text-gray-600 text-balance">Born from research into automotive value optimization</p>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-6">
              Revvdoctor began with extensive research into how automotive dealers could improve their value when
              purchasing from suppliers. Our team analyzed thousands of auction transactions, identifying patterns in
              pricing, vehicle condition, and market timing that separated profitable purchases from missed
              opportunities.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Through our research, we discovered that dealers were leaving significant value on the table—not due to
              lack of expertise, but simply because manually tracking every auction platform, comparing prices, and
              evaluating vehicle conditions in real-time was humanly impossible. The opportunity cost of missed deals
              far exceeded the time spent searching.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This research led us to develop an intelligent system that continuously monitors supplier inventories,
              analyzes market data, and identifies the highest-value purchasing opportunities. Today, Revvdoctor helps
              dealers across the UK maximize their return on every vehicle purchase by ensuring they never miss a
              high-value opportunity from their suppliers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Ready to Transform Your Vehicle Sourcing?
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-balance">
            Join dealers who are already saving time and finding better deals with Revvdoctor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 shadow-lg shadow-orange-500/30"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-gray-300 hover:border-orange-600 hover:text-orange-600 bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-bold text-xl text-white">Revvdoctor</span>
              </div>
              <p className="text-gray-400">Intelligent vehicle sourcing for automotive dealers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="hover:text-orange-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-orange-400 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-orange-400 transition-colors">
                    Our Story
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-orange-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Revvdoctor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
