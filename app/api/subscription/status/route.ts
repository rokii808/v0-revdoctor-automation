import { NextResponse } from "next/server"
import { checkSubscriptionStatus } from "@/lib/subscription/check-subscription"

/**
 * GET /api/subscription/status
 *
 * Returns current subscription status for authenticated user
 * Used by SubscriptionProvider to check access
 *
 * SECURITY: Uses server-side auth, no userId in params (prevents IDOR)
 */
export async function GET() {
  try {
    const subscription = await checkSubscriptionStatus()

    return NextResponse.json({
      isActive: subscription.isActive,
      status: subscription.status,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      daysLeft: subscription.daysLeft,
      paymentFailed: subscription.paymentFailed,
    })
  } catch (error) {
    console.error("[Subscription Status] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscription status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
