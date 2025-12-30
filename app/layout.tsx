import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SubscriptionProvider } from "@/components/providers/subscription-provider"
import { PaymentReminderModal } from "@/components/modals/payment-reminder-modal"
import { Toaster } from "sonner"

// Using system fonts temporarily due to network restrictions
// const playfairDisplay = Playfair_Display({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800", "900"],
//   variable: "--font-playfair",
//   display: "swap",
// })

// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-inter",
//   display: "swap",
// })

export const metadata: Metadata = {
  title: "Revvdoctor - AI-Powered Car Auction Health Screening",
  description:
    "Revvdoctor helps car dealerships find healthy vehicles at auctions using AI-powered condition analysis.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SubscriptionProvider>
          {children}
          <PaymentReminderModal />
          <Toaster position="top-right" richColors />
        </SubscriptionProvider>
      </body>
    </html>
  )
}
