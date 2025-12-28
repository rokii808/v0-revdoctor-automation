import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET /api/workflow/dealers - Returns dealer preferences for n8n workflow
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get all active dealers with their preferences
    const { data: dealers, error } = await supabase
      .from("dealers")
      .select(`
        id,
        email,
        company_name,
        prefs,
        status,
        plan
      `)
      .eq("status", "active")
      .not("prefs", "is", null)

    if (error) {
      console.error("Error fetching dealers:", error)
      return NextResponse.json({ error: "Failed to fetch dealers" }, { status: 500 })
    }

    // Transform to n8n expected format
    const formattedDealers =
      dealers?.map((dealer) => ({
        dealer_id: dealer.id,
        dealer_name: dealer.company_name,
        email: dealer.email,
        makes_csv: dealer.prefs?.makes?.join(", ") || "",
        max_mileage: dealer.prefs?.maxMileage || 100000,
        min_year: dealer.prefs?.minYear || 2010,
        max_bid: dealer.prefs?.maxBid || 10000,
        locations_csv: dealer.prefs?.locations?.join(", ") || "",
        plan: dealer.plan,
        status: dealer.status,
      })) || []

    return NextResponse.json(formattedDealers)
  } catch (error) {
    console.error("Workflow dealers API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
