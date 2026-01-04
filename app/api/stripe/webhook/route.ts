import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Validate webhook secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("[Stripe] STRIPE_WEBHOOK_SECRET environment variable not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      console.warn("[Stripe] Webhook request missing signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId || !subscriptionId) {
          console.error("No userId or subscriptionId in session")
          break
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const plan = session.metadata?.plan || "basic"

        // Update subscriptions table
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_sub_id: subscriptionId,
          plan,
          status: subscription.status,
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })

        // Update dealer status
        await supabase
          .from("dealers")
          .update({
            subscription_status: "active",
            subscription_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq("user_id", userId)

        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSubscription) {
          // Update subscription status
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq("stripe_customer_id", customerId)

          // Update dealer status
          const dealerStatus = subscription.status === "active" ? "active" : "cancelled"
          await supabase
            .from("dealers")
            .update({
              subscription_status: dealerStatus,
              subscription_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq("user_id", existingSubscription.user_id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
