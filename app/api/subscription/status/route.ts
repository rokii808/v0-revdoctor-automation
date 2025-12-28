import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import type { Subscription } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

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

    const typedSubscription = subscription as Subscription | null

    return NextResponse.json({
      success: true,
      data: {
        subscription: typedSubscription,
        stripeSubscription,
        isActive: typedSubscription?.status === "active",
        plan: typedSubscription?.plan || "trial",
        currentPeriodEnd: typedSubscription?.current_period_end || null,
      },
    })
  } catch (error) {
    console.error("Subscription status API error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
  }
}
