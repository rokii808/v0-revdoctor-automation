import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET /api/workflow/status - Get workflow status for all dealers
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get workflow status summary
    const { data: dealers, error } = await supabase
      .from("dealers")
      .select(`
        id,
        email,
        company_name,
        status,
        plan,
        last_scan_at,
        last_scan_completed_at,
        last_digest_at,
        created_at
      `)
      .eq("status", "active")

    if (error) {
      console.error("Error fetching workflow status:", error)
      return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
    }

    // Get recent insights count for each dealer
    const dealerIds = dealers?.map((d: any) => d.id) || []
    const { data: insightCounts, error: insightError } = await supabase
      .from("insights")
      .select("dealer_id")
      .in("dealer_id", dealerIds)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    if (insightError) {
      console.error("Error fetching insight counts:", insightError)
    }

    // Count insights per dealer
    const insightCountMap = (insightCounts || []).reduce(
      (acc: Record<string, number>, insight: any) => {
        acc[insight.dealer_id] = (acc[insight.dealer_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Format response
    const statusData =
      dealers?.map((dealer: any) => ({
        dealer_id: dealer.id,
        dealer_name: dealer.company_name,
        email: dealer.email,
        status: dealer.status,
        plan: dealer.plan,
        last_scan: dealer.last_scan_at,
        last_completed: dealer.last_scan_completed_at,
        last_digest: dealer.last_digest_at,
        insights_this_week: insightCountMap[dealer.id] || 0,
        is_active: dealer.status === "active" && dealer.plan !== "free",
      })) || []

    return NextResponse.json({
      total_dealers: statusData.length,
      active_dealers: statusData.filter((d: any) => d.is_active).length,
      dealers: statusData,
    })
  } catch (error) {
    console.error("Workflow status API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
