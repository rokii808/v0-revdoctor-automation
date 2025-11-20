import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json()

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get user email from Supabase
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single()

    if (!profile?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const priceId = plan === "pro" ? STRIPE_PRICE_IDS.pro : STRIPE_PRICE_IDS.basic

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: profile.email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pricing?cancelled=true`,
      metadata: {
        userId,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
