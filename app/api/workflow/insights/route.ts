import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/workflow/insights - Store AI-analyzed car insights from n8n
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { dealer_id, title, make, year, price, url, verdict, minor_type, reason, risk, condition_html, mileage } =
      body

    // Validate required fields
    if (!dealer_id || !title || !verdict) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert insight into database
    const { data: insight, error } = await supabase
      .from("insights")
      .insert({
        dealer_id,
        title,
        make,
        year: year ? Number.parseInt(year) : null,
        price: price ? Number.parseFloat(price) : null,
        mileage: mileage ? Number.parseInt(mileage) : null,
        url,
        verdict: verdict.toUpperCase(),
        minor_fault_type: minor_type,
        reason,
        risk_score: risk ? Number.parseInt(risk) : null,
        condition_notes: condition_html,
        source: "raw2k",
        status: verdict.toUpperCase() === "HEALTHY" ? "available" : "rejected",
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing insight:", error)
      return NextResponse.json({ error: "Failed to store insight" }, { status: 500 })
    }

    return NextResponse.json({ success: true, insight })
  } catch (error) {
    console.error("Workflow insights API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
