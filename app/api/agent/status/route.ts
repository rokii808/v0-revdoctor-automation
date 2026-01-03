import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/agent/status - Returns current agent status for authenticated user
export async function GET() {
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

    // Get dealer record for this user
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select(
        `
        id,
        agent_active,
        last_scan_at,
        last_scan_completed_at,
        total_agent_runs,
        total_cars_found,
        total_healthy_cars,
        subscription_status,
        selected_plan
      `
      )
      .eq("user_id", user.id)
      .single()

    if (dealerError) {
      // If dealer doesn't exist yet, return default status
      if (dealerError.code === "PGRST116") {
        return NextResponse.json({
          isActive: false,
          lastRun: null,
          totalRuns: 0,
          carsFound: 0,
          healthyCars: 0,
          hasActiveSubscription: false,
        })
      }
      throw dealerError
    }

    // Check if subscription is active
    const hasActiveSubscription =
      dealer.subscription_status === "active" || dealer.subscription_status === "trial"

    return NextResponse.json({
      isActive: dealer.agent_active || false,
      lastRun: dealer.last_scan_completed_at,
      totalRuns: dealer.total_agent_runs || 0,
      carsFound: dealer.total_cars_found || 0,
      healthyCars: dealer.total_healthy_cars || 0,
      hasActiveSubscription,
      plan: dealer.selected_plan || "trial",
    })
  } catch (error) {
    console.error("Agent status API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
