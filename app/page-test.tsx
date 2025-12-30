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
          </nav>

          <Button
            size="lg"
            className="cta-enterprise bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 text-base rounded-full font-semibold px-8 py-4"
            asChild
          >
            <a href="/auth/signup">Start Free Trial</a>
          </Button>
        </div>
      </header>

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

          <h1 className="text-6xl md:text-8xl font-sans font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight animate-slide-up">
            Automate your car sourcing.
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Close deals faster.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-normal animate-slide-up delay-100">
            RevvDoctor scans hundreds of auctions and sends pre-qualified, investment-ready vehicles directly to your
            inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-slide-up delay-200">
            <Button
              size="lg"
              className="cta-enterprise bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-14 py-8 rounded-full shadow-xl shadow-orange-500/30 font-semibold group"
