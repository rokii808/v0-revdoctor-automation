import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Car } from "lucide-react"
import Link from "next/link"

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 flex">
      {/* Left side - Image with overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/professional-car-dealer-reviewing-auction-listings.jpg"
          alt="Car dealership professional"
          className="object-cover w-full h-full"
        />
        {/* Orange gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5"></div>

        {/* Branding overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Car className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-bold drop-shadow-lg">RevvDoctor</h2>
            <p className="text-xl text-white/90 drop-shadow-md max-w-md">
              AI-powered car auction screening for smarter sourcing
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
