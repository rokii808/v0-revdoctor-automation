"use client"

import { Button } from "@/components/ui/button"
import {
  Car,
  ArrowRight,
  Shield,
  Clock,
  Target,
  Plus,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  Mail,
  Filter,
  BarChart3,
} from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCounter } from "@/components/animated-counter"
import { LiveMetricsPreview } from "@/components/live-metrics-preview"
import { InteractiveMapPreview } from "@/components/interactive-map-preview"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30 transition-transform duration-300 hover:scale-110">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-sans font-bold text-gray-900">RevvDoctor</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-base"
            >
              How it works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-base">
              Pricing
            </a>
            <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-base">
              About Us
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Button
                variant="ghost"
                size="lg"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </Button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a
                  href="/auth/login"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
                >
                  Dealer Login
                </a>
                <a
                  href="/demo-login"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors border-t border-gray-100"
                >
                  Demo Login
                </a>
              </div>
            </div>

            <Button
              size="lg"
              className="cta-enterprise bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 text-base rounded-full font-semibold px-8 py-4"
              asChild
            >
              <a href="/auth/signup">Start Free Trial</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 hero-bg-motion bg-gradient-to-br from-slate-50 via-white to-orange-50/20 relative overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(148 163 184 / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(148 163 184 / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        ></div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/15 to-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/15 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

        {/* Accent Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-orange-100 shadow-sm mb-8 animate-fade-in signal-pill-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-700">Scanning live auctions</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-sans font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
              Automate your car sourcing.
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Close deals faster.
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            RevvDoctor scans hundreds of auctions and sends pre-qualified, investment-ready vehicles directly to your
            inbox.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Button
              size="lg"
              className="cta-enterprise bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-14 py-8 rounded-full shadow-xl shadow-orange-500/30 font-semibold group"
              asChild
            >
              <a href="/test-email">
                See It In Action <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-sm text-slate-500 font-medium">Trusted by 100+ dealerships across the UK</p>
          </motion.div>
        </div>
      </section>

      {/* Live Metrics Dashboard Preview */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-orange-700">LIVE DATA</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-sans font-bold text-slate-900 mb-6 leading-tight">
              See Results in
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Real-Time
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Watch as our AI scans hundreds of auctions and delivers qualified vehicles to your inbox — updated every
              minute.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <LiveMetricsPreview />
          </motion.div>
        </div>
      </section>

      {/* Problems Section with 3-Column Layout */}
      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 mb-6 leading-tight">
              Car sourcing shouldn't
              <br />
              take hours.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Dealers waste time filtering auction sites, chasing leads and analyzing cars that don&#39;t meet their
              criteria. RevvDoctor removes that manual work so you can focus on deals that actually convert.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-20"
            initial="hidden"
            whileInView="visible"
            transition={{ staggerChildren: 0.15, delayChildren: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
              hidden: {},
            }}
          >
            <motion.div
              className="group relative text-center p-10 rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div className="relative z-10" whileHover={{ scale: 1.02 }}>
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Clock className="w-10 h-10 text-orange-500 group-hover:text-orange-600 transition-colors" />
                </motion.div>
                <h3 className="text-2xl font-sans font-bold text-slate-900 mb-4">Wasting hours scrolling</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Manually checking multiple sites daily eats up valuable selling time
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="group relative text-center p-10 rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div className="relative z-10" whileHover={{ scale: 1.02 }}>
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Target className="w-10 h-10 text-orange-500 group-hover:text-orange-600 transition-colors" />
                </motion.div>
                <h3 className="text-2xl font-sans font-bold text-slate-900 mb-4">Missing good vehicles</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Quality cars slip through while you're busy with other tasks
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="group relative text-center p-10 rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div className="relative z-10" whileHover={{ scale: 1.02 }}>
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Shield className="w-10 h-10 text-orange-500 group-hover:text-orange-600 transition-colors" />
                </motion.div>
                <h3 className="text-2xl font-sans font-bold text-slate-900 mb-4">Unreliable condition data</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Risky purchases from incomplete or misleading information
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-white via-orange-50/20 to-blue-50/10 border border-orange-100 p-12 rounded-3xl shadow-lg text-center relative overflow-hidden group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ boxShadow: "0 25px 50px rgba(249, 115, 22, 0.15)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <h3 className="text-3xl font-sans font-bold text-slate-900 mb-6 relative z-10">The Solution</h3>
            <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto relative z-10">
              RevvDoctor uses automation and data to filter, validate and deliver the cars you actually want — directly
              to your inbox, twice a day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-b from-white to-gray-50" id="how-it-works">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            Start sourcing in minutes,
            <br />
            not weeks.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            Get your AI powered screening up and running in just four simple steps.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-8 rounded-3xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Set preferences</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Tell us what you're looking for — make, model, mileage, budget and more.
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">We scan auctions</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Our system checks multiple marketplaces and identifies qualified listings.
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Get healthy cars</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                You'll get clean, pre-filtered car lists in your inbox twice a day.
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Focus on deals</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Close profitable deals faster without wasting time on unsuitable listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Here's exactly what
              <br />
              you'll receive.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Twice a day, RevvDoctor emails you a curated list of cars that meet your requirements verified and ready
              for bidding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border-2 border-gray-200 shadow-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Today's Healthy Cars</p>
                    <p className="text-sm text-gray-500">7:00 AM Daily Digest</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-1">2019 BMW 3 Series</p>
                    <p className="text-sm text-gray-600">45,000 miles • £12,500 • Excellent</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-1">2020 Audi A4</p>
                    <p className="text-sm text-gray-600">32,000 miles • £15,800 • Very Good</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-1">2018 Mercedes C-Class</p>
                    <p className="text-sm text-gray-600">58,000 miles • £11,200 • Good</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">Sample email preview</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Make, model & year</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Exactly what you're looking for, filtered by your preferences
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Mileage & price</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Clear pricing and mileage data for quick decision making
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Condition validation</h4>
                  <p className="text-gray-600 leading-relaxed">AI verified condition ratings to minimize risk</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Direct source links</h4>
                  <p className="text-gray-600 leading-relaxed">
                    One click access to auction listings for immediate action
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-7 rounded-full shadow-xl shadow-orange-500/30 hover:scale-105 transition-all font-semibold"
                asChild
              >
                <a href="/test-email">Get My First Sample Email</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            Everything you need to
            <br />
            source smarter.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            Built specifically for dealers who want to save time and increase margins.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <Filter className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">AI powered filtering</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Only see cars that match your exact criteria. No more wasting time on unsuitable vehicles.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Condition validation</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Automatically flags potential risks before you bid. Make confident purchasing decisions.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Auction coverage</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Searches multiple platforms simultaneously. Never miss a good deal again.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Dealer-ready format</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Clean, structured email reports. All the information you need at a glance.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Zero manual work</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Save 30+ hours per week on sourcing. Focus on what matters closing deals.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-12 rounded-3xl border border-slate-200 hover:border-orange-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Increase margins</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Find better deals faster. Our dealers report 22% higher profit margins on average.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Trusted by dealerships
              <br />
              across the UK.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-10 rounded-3xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  JS
                </div>
                <div>
                  <p className="font-bold text-gray-900">James Smith</p>
                  <p className="text-sm text-gray-600">AutoDirect Ltd</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "We now close 3x more deals because RevDoctor delivers only cars we want. The time savings alone are
                worth it."
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-10 rounded-3xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  MJ
                </div>
                <div>
                  <p className="font-bold text-gray-900">Maria Johnson</p>
                  <p className="text-sm text-gray-600">Premier Motors</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "The AI screening is incredibly accurate. We've reduced bad purchases by 85% since switching to
                RevDoctor."
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-10 rounded-3xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  DW
                </div>
                <div>
                  <p className="font-bold text-gray-900">David Williams</p>
                  <p className="text-sm text-gray-600">Elite Car Sales</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "Saved 10 hours per week and increased profit margins by 22%. Best investment we've made this year."
              </p>
            </div>
          </div>

          <AnimatedSection delay={200}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-3xl shadow-2xl text-center">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={30} suffix="+" />
                  </p>
                  <p className="text-slate-300">Hours saved per week</p>
                </div>
                <div>
                  <p className="text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={22} suffix="%" />
                  </p>
                  <p className="text-slate-300">Average margin increase</p>
                </div>
                <div>
                  <p className="text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={95} suffix="%" />
                  </p>
                  <p className="text-slate-300">AI accuracy rate</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 text-center mb-6 leading-tight">
            Built for every type
            <br />
            of dealership.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            We're built specifically for dealers who want to save time and increase margins.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Independent Dealers</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Streamline sourcing without hiring extra staff. Get professional grade screening at an affordable price.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>No technical setup required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Affordable starter plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Compete with larger dealers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Large Dealership Groups</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Standardize sourcing across multiple branches. Centralize data and improve consistency.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Team accounts & collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">New Startups</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Launch sourcing with zero technical setup. Start finding profitable cars from day one.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Quick onboarding process</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Scale as you grow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>No long-term contracts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview */}
      <section className="py-28 px-6 bg-gradient-to-br from-white via-slate-50/50 to-white">
        <div className="container mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-blue-700">INTERACTIVE PREVIEW</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 mb-6 leading-tight">
              Live Auction Coverage
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                Across the UK
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See real vehicles from live auctions, pinned to their locations. Click any vehicle to view full details
              and start your free trial.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <InteractiveMapPreview />
          </AnimatedSection>

          <div className="text-center mt-12">
            <p className="text-sm text-slate-500">
              📍 Covering all major auction houses across England, Scotland, and Wales
            </p>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white" id="pricing">
        <div className="container mx-auto text-center max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            Simple pricing.
            <br />
            Maximum value.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your dealership. Cancel anytime, no questions asked.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-gray-200 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Starter</h3>
              <p className="text-gray-600 mb-6 text-base">Up to 5 cars daily</p>
              <p className="text-5xl font-serif font-bold text-gray-900 mb-2">£97</p>
              <p className="text-base text-gray-500 mb-8">/month</p>
              <Button
                size="lg"
                variant="outline"
                className="w-full mb-8 rounded-full border-2 bg-transparent text-base py-6 hover:scale-105 transition-all"
                asChild
              >
                <a href="/test-email">See it in action</a>
              </Button>
              <ul className="text-left space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Basic AI screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-pink-50 border-2 border-orange-400 p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 relative shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-xl shadow-orange-500/40 px-8 py-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 mt-2">Premium</h3>
              <p className="text-gray-600 mb-6 text-base">Up to 10 cars daily</p>
              <p className="text-5xl font-serif font-bold text-gray-900 mb-2">£299</p>
              <p className="text-base text-gray-500 mb-8">/month</p>
              <Button
                size="lg"
                className="w-full mb-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-xl shadow-orange-500/30 text-base py-6 hover:scale-105 transition-all"
                asChild
              >
                <a href="/test-email">See it in action</a>
              </Button>
              <ul className="text-left space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Advanced AI screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>ROI tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Pro</h3>
              <p className="text-gray-600 mb-6 text-base">Up to 25 cars daily</p>
              <p className="text-5xl font-serif font-bold text-gray-900 mb-2">£599</p>
              <p className="text-base text-gray-500 mb-8">/month</p>
              <Button
                size="lg"
                variant="outline"
                className="w-full mb-8 rounded-full border-2 bg-transparent text-base py-6 hover:scale-105 transition-all"
                asChild
              >
                <a href="/test-email">See it in action</a>
              </Button>
              <ul className="text-left space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Team accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>6 AM delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Chat support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Enterprise</h3>
              <p className="text-gray-600 mb-6 text-base">Unlimited cars</p>
              <p className="text-5xl font-serif font-bold text-gray-900 mb-2">Custom</p>
              <p className="text-base text-gray-500 mb-8">pricing</p>
              <Button
                size="lg"
                variant="outline"
                className="w-full mb-8 rounded-full border-2 bg-transparent text-base py-6 hover:scale-105 transition-all"
                asChild
              >
                <a href="/auth/signup">Book a Demo</a>
              </Button>
              <ul className="text-left space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-gray-500 mt-12 text-lg">Cancel anytime. No questions asked.</p>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 text-center mb-6 leading-tight">
            Loved by Dealers and Buyers Alike.
          </h2>
          <p className="text-xl text-gray-600 text-center mb-20 leading-relaxed">
            We&#39;ve got answers here&#39;s everything you need to know before getting started.
          </p>

          <div className="space-y-6">
            {[
              {
                q: "How accurate is the AI screening?",
                a: "Our AI achieves 95%+ accuracy by analyzing condition reports, images, and historical data patterns.",
              },
              {
                q: "Can I customize my preferences?",
                a: "Yes, you can set preferred makes, budget ranges, mileage limits, and specific auction houses.",
              },
              {
                q: "Do you support multiple auction sites?",
                a: "Currently we support RAW2K with plans to add more major UK auction platforms.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white border-2 border-gray-200 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{faq.q}</h3>
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mt-5 leading-relaxed text-base">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            Start sourcing healthy
            <br />
            cars today.
          </h2>
          <p className="text-xl text-gray-600 mb-14 max-w-2xl mx-auto leading-relaxed">
            Join dealerships already saving time and increasing margins with RevvDoctor.
          </p>
          <Button
            size="lg"
            className="cta-enterprise bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-14 py-8 rounded-full shadow-xl shadow-orange-500/30 font-semibold group"
            asChild
          >
            <a href="/test-email">
              See It In Action <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-16 px-6 footer-subtle-motion">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-sans font-bold text-slate-900">RevvDoctor</span>
            </div>
            <p className="text-sm text-slate-500">2025 Copyright - Privacy Terms & Conditions</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
