import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
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
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

        // Update dealer status
        await supabase.from("dealers").update({
          subscription_status: "active",
          subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq("user_id", userId)

        // Call n8n webhook to start agent (if N8N_WEBHOOK_URL is configured)
        if (process.env.N8N_WEBHOOK_URL) {
          try {
            await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/startAgent`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, plan }),
            })
          } catch (error) {
            console.error("Failed to notify n8n:", error)
          }
        }

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
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_customer_id", customerId)

          // Update dealer status
          const dealerStatus = subscription.status === "active" ? "active" : "cancelled"
          await supabase.from("dealers").update({
            subscription_status: dealerStatus,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq("user_id", existingSubscription.user_id)

          // Stop agent if subscription cancelled
          if (subscription.status === "canceled" && process.env.N8N_WEBHOOK_URL) {
            try {
              await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/stopAgent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: existingSubscription.user_id }),
              })
            } catch (error) {
              console.error("Failed to notify n8n about cancellation:", error)
            }
          }
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
