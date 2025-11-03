import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/signup-form"

export default async function SignUpPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/professional-car-dealer-reviewing-auction-listings.jpg"
          alt="Car dealership professional"
          className="object-cover w-full h-full"
        />
        {/* Overlay gradient for better text visibility if needed */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Revvdoctor</h1>
            <p className="text-gray-600">AI-powered car auction screening</p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
