import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer record
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id, subscription_status, subscription_expires_at")
      .eq("user_id", user.id)
      .single()

    if (dealerError) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Check if user has active subscription or valid trial
    const now = new Date()
    const isActiveSubscription = dealer.subscription_status === "active"
    const isValidTrial =
      dealer.subscription_status === "trial" &&
      dealer.subscription_expires_at &&
      new Date(dealer.subscription_expires_at) > now

    if (!isActiveSubscription && !isValidTrial) {
      return NextResponse.json(
        { error: "Active subscription required to start agent" },
        { status: 403 }
      )
    }

    // Activate agent by setting agent_active to true
    const { error: updateError } = await supabase
      .from("dealers")
      .update({
        agent_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealer.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, message: "Agent started successfully" })
  } catch (error) {
    console.error("Start agent error:", error)
    return NextResponse.json({ error: "Failed to start agent" }, { status: 500 })
  }
}
