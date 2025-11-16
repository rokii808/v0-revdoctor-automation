"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoLoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 text-center bg-gradient-to-br from-[#FF007A] to-[#8A2EFF] text-white rounded-t-lg p-8">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-serif text-white">RevvDoctor</CardTitle>
          <CardDescription className="text-white/90 text-base">
            AI-Powered Sourcing for UK Dealerships
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-gray-900">Demo Access</h2>
            <p className="text-gray-600">
              Preview the customer dashboard without authentication
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer-dashboard")}
            className="w-full bg-gradient-to-r from-[#FF007A] to-[#8A2EFF] hover:from-[#E6006D] hover:to-[#7A28E6] text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Enter Customer Dashboard
          </Button>

          <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            For production access, please{" "}
            <a href="/auth/login" className="text-[#FF007A] hover:underline font-semibold">
              sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
