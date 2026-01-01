"use client"

import { Button } from "@/components/ui/button"
import { Car, Target, Shield, Users, TrendingUp, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-sans font-bold text-gray-900">RevvDoctor</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              How it works
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-orange-600 font-semibold">
              About Us
            </Link>
          </nav>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 rounded-full font-semibold px-8"
            asChild
          >
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
              About RevvDoctor
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're on a mission to revolutionize how UK car dealers source vehicles from auctions.
              By combining AI technology with deep industry expertise, we help dealerships save time,
              reduce risk, and increase profit margins.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Every day, UK car dealers spend hours manually searching through auction sites,
                analyzing condition reports, and trying to identify profitable vehicles. This process
                is time-consuming, error-prone, and often results in missed opportunities.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                RevvDoctor was built to solve this problem. We automate the entire vehicle sourcing
                process, delivering pre-qualified, investment-ready vehicles directly to dealers' inboxes.
                Our AI analyzes hundreds of auctions daily, ensuring you never miss a good deal again.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl border-2 border-orange-200">
                <p className="text-4xl font-bold text-orange-600 mb-2">100+</p>
                <p className="text-slate-700 font-medium">Active Dealers</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border-2 border-blue-200">
                <p className="text-4xl font-bold text-blue-600 mb-2">95%</p>
                <p className="text-slate-700 font-medium">AI Accuracy</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border-2 border-green-200">
                <p className="text-4xl font-bold text-green-600 mb-2">30+</p>
                <p className="text-slate-700 font-medium">Hours Saved/Week</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl border-2 border-purple-200">
                <p className="text-4xl font-bold text-purple-600 mb-2">22%</p>
                <p className="text-slate-700 font-medium">Margin Increase</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-xl text-slate-600">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl border-2 border-slate-200 hover:border-orange-300 hover:shadow-2xl transition-all"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Dealer-First</h3>
              <p className="text-slate-600 leading-relaxed">
                Every feature we build is designed with dealers in mind. We listen to feedback,
                understand challenges, and create solutions that actually work.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl border-2 border-slate-200 hover:border-orange-300 hover:shadow-2xl transition-all"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Quality & Trust</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI maintains 95%+ accuracy because we prioritize quality over quantity.
                We'd rather show you fewer perfect matches than hundreds of unsuitable vehicles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl border-2 border-slate-200 hover:border-orange-300 hover:shadow-2xl transition-all"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Continuous Innovation</h3>
              <p className="text-slate-600 leading-relaxed">
                The automotive industry evolves, and so do we. We're constantly improving our AI,
                adding new auction sites, and building features that help you stay ahead.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Built by Dealers, for Dealers</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-12">
            Our founding team comes from the automotive industry. We've experienced the pain of
            manual sourcing firsthand, which is why we're so passionate about solving it. We're not
            just building software — we're building a tool we wish we had when we were running
            dealerships.
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>

          <p className="text-slate-600 mb-8">
            Based in the UK, serving dealerships nationwide
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Sourcing?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join 100+ dealerships already saving time and increasing margins with RevvDoctor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-12 py-6 rounded-full shadow-xl shadow-orange-500/30"
                asChild
              >
                <Link href="/test-email">See It In Action</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-12 py-6 rounded-full"
                asChild
              >
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">RevvDoctor</span>
            </div>

            <div className="flex items-center gap-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link href="/#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
            </div>

            <p className="text-sm text-slate-500">© 2025 RevvDoctor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
