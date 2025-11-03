import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Get subscription from database
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    let stripeSubscription = null
    if (subscription?.stripe_sub_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_sub_id)
      } catch (stripeError) {
        console.error("Failed to fetch Stripe subscription:", stripeError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: subscription || null,
        stripeSubscription,
        isActive: subscription?.status === "active",
        plan: subscription?.plan || "trial",
        currentPeriodEnd: subscription?.current_period_end || null,
      },
    })
  } catch (error) {
    console.error("Subscription status API error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
  }
}
