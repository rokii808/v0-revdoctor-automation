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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-serif font-bold text-gray-900">Revvdoctor</span>
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
            className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 text-white shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transition-all hover:scale-105 text-base rounded-full font-semibold px-4 py-4"
            asChild
          >
            <a href="/auth/signup">Get Started</a>
          </Button>
        </div>
      </header>

      <section className="py-32 px-6 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
            Automate your car sourcing.
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Close deals faster.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            RevvDoctor scans hundreds of auctions and sends pre qualified, investment ready vehicles directly to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 text-white text-xl px-14 py-8 rounded-full shadow-2xl shadow-pink-500/40 hover:shadow-3xl hover:shadow-pink-500/50 transition-all hover:scale-105 font-semibold"
              asChild
            >
              <a href="/test-email">
                See It in Action <ArrowRight className="w-6 h-6 ml-3" />
              </a>
            </Button>
          </div>

          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 mb-4 font-medium">Trusted by 100+ dealerships across the UK</p>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Car sourcing shouldn't
              <br />
              take hours.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dealers waste time filtering auction sites, chasing leads, and analyzing cars that don't meet their
              criteria. RevDoctor removes that manual work so you can focus on deals that actually convert.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-10 rounded-3xl border-2 border-red-200 bg-red-50/50 shadow-lg">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Wasting hours scrolling auctions</h3>
              <p className="text-gray-600 leading-relaxed">
                Manually checking multiple sites daily eats up valuable selling time
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl border-2 border-red-200 bg-red-50/50 shadow-lg">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Missing good vehicles</h3>
              <p className="text-gray-600 leading-relaxed">
                Quality cars slip through while you're busy with other tasks
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl border-2 border-red-200 bg-red-50/50 shadow-lg">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Unreliable condition data</h3>
              <p className="text-gray-600 leading-relaxed">Risky purchases from incomplete or misleading information</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-pink-50 border-2 border-pink-300 p-12 rounded-3xl shadow-2xl text-center">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">The Solution</h3>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              RevDoctor uses automation and data to filter, validate, and deliver the cars you actually want  directly to your inbox, twice a day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20" id="how-it-works">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            Start sourcing in minutes,
            <br />
            not weeks.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            Get your AI-powered screening up and running in just four simple steps.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-10 rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/30">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Set your preferences</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Tell us what you're looking for — make, model, mileage, budget, and more.
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/30">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">We scan the auctions</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Our system checks multiple marketplaces and identifies qualified listings.
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/30">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Receive healthy cars</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                You'll get clean, pre-filtered car lists in your inbox twice a day.
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/30">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Focus on deals</h3>
              <p className="text-gray-600 leading-relaxed text-base">
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
              Twice a day, RevvDoctor emails you a curated list of cars that meet your requirements  verified and ready for bidding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border-2 border-gray-200 shadow-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Make, model & year</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Exactly what you're looking for, filtered by your preferences
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Mileage & price</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Clear pricing and mileage data for quick decision-making
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Condition validation</h4>
                  <p className="text-gray-600 leading-relaxed">AI-verified condition ratings to minimize risk</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Direct source links</h4>
                  <p className="text-gray-600 leading-relaxed">
                    One-click access to auction listings for immediate action
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 text-white text-lg px-10 py-7 rounded-full shadow-xl shadow-pink-500/30 hover:scale-105 transition-all font-semibold"
                asChild
              >
                <a href="/test-email">Get My First Sample Email</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="container mx-auto text-center max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            Everything you need to
            <br />
            source smarter.
          </h2>
          <p className="text-xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed">
            Built specifically for dealers who want to save time and increase margins.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Filter className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">AI-powered filtering</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Only see cars that match your exact criteria. No more wasting time on unsuitable vehicles.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Condition validation</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Automatically flags potential risks before you bid. Make confident purchasing decisions.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Auction coverage</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Searches multiple platforms simultaneously. Never miss a good deal again.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Dealer-ready format</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Clean, structured email reports. All the information you need at a glance.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Zero manual work</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Save 30+ hours per week on sourcing. Focus on what matters — closing deals.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border border-gray-100 hover:border-pink-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Increase margins</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Find better deals faster. Our dealers report 22% higher profit margins on average.
              </p>
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
            <div className="bg-gradient-to-br from-pink-50 to-purple-50/50 p-10 rounded-3xl border-2 border-pink-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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

            <div className="bg-gradient-to-br from-pink-50 to-purple-50/50 p-10 rounded-3xl border-2 border-pink-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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

            <div className="bg-gradient-to-br from-pink-50 to-purple-50/50 p-10 rounded-3xl border-2 border-pink-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-12 rounded-3xl shadow-2xl text-center">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-5xl font-bold text-white mb-2">30+</p>
                <p className="text-gray-300">Hours saved per week</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2">22%</p>
                <p className="text-gray-300">Average margin increase</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2">95%</p>
                <p className="text-gray-300">AI accuracy rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 text-center mb-6 leading-tight">
              Built for every type
              <br />
              of dealership.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Independent Dealers</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Streamline sourcing without hiring extra staff. Get professional grade screening at an affordable price.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>No technical setup required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Affordable starter plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Compete with larger dealers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Large Dealership Groups</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Standardize sourcing across multiple branches. Centralize data and improve consistency.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Team accounts & collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-gray-200 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-2">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">New Startups</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Launch sourcing with zero technical setup. Start finding profitable cars from day one.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Quick onboarding process</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Scale as you grow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>No long-term contracts</span>
                </li>
              </ul>
            </div>
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
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Basic AI screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-pink-50 border-2 border-pink-400 p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white rounded-full text-sm font-bold shadow-xl shadow-pink-500/40 px-8 py-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 mt-2">Premium</h3>
              <p className="text-gray-600 mb-6 text-base">Up to 10 cars daily</p>
              <p className="text-5xl font-serif font-bold text-gray-900 mb-2">£299</p>
              <p className="text-base text-gray-500 mb-8">/month</p>
              <Button
                size="lg"
                className="w-full mb-8 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 rounded-full shadow-xl shadow-pink-500/30 text-base py-6 hover:scale-105 transition-all"
                asChild
              >
                <a href="/test-email">See it in action</a>
              </Button>
              <ul className="text-left space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Advanced AI screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>ROI tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
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
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Team accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>6 AM delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
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
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
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
            We&#39;ve got answers  here&#39;s everything you need to know before getting started.
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
            Join dealerships already saving time and increasing margins with RevDoctor.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 text-white text-xl px-14 py-8 rounded-full shadow-2xl shadow-pink-500/40 hover:shadow-3xl hover:shadow-pink-500/50 transition-all hover:scale-105 font-semibold"
            asChild
          >
            <a href="/test-email">
              See It in Action <ArrowRight className="w-6 h-6 ml-3" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold text-gray-900">Revvdoctor</span>
            </div>
            <p className="text-sm text-gray-500">2025 Copyright - Privacy Terms & Conditions</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
