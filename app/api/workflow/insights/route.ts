import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/workflow/insights - Store AI-analyzed car insights from n8n scraper
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      dealer_id,
      title,
      make,
      year,
      price,
      url: source_url, // Renamed to source_url for clarity
      verdict,
      minor_type,
      reason,
      risk,
      listing_id,
      lot_number,
      auction_site = "raw2k",
      auction_date,
      auction_location,
      mileage,
      condition_html,
      images_json,
    } = body

    // Validate required fields
    if (!dealer_id || !title || !verdict) {
      return NextResponse.json({ error: "Missing required fields: dealer_id, title, verdict" }, { status: 400 })
    }

    const { data: insight, error } = await supabase
      .from("insights")
      .insert({
        user_id: dealer_id,
        title,
        make,
        year: year ? Number.parseInt(year) : null,
        price: price ? Number.parseFloat(price) : null,
        mileage: mileage ? Number.parseInt(mileage) : null,
        verdict: verdict.toUpperCase(),
        minor_type,
        reason,
        risk: risk ? Number.parseInt(risk) : null,
        listing_id,
        lot_number,
        auction_site,
        auction_date,
        auction_location,
        source_url, // External auction URL
        condition_html,
        images_json,
        scraped_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error storing insight:", error)
      return NextResponse.json({ error: "Failed to store insight", details: error.message }, { status: 500 })
    }

    const internalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vehicle/${insight.id}`

    await supabase
      .from("insights")
      .update({ url: internalUrl, url_verified_at: new Date().toISOString() })
      .eq("id", insight.id)

    console.log(`[v0] Insight stored successfully: ${insight.id} for dealer ${dealer_id}`)

    return NextResponse.json({
      success: true,
      insight: { ...insight, url: internalUrl },
      message: "Vehicle insight stored and indexed successfully",
    })
  } catch (error) {
    console.error("[v0] Workflow insights API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
