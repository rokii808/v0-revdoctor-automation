import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkUsageLimit } from "@/lib/subscription/check-subscription"

/**
 * POST /api/saved-searches
 *
 * Create a new saved search
 * Body: { name, make, maxMileage, maxPrice, minYear, fuelType }
 *
 * SUBSCRIPTION: Checks saved_searches limit based on plan
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check usage limit
    const limitCheck = await checkUsageLimit('saved_searches')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "limit_reached", message: limitCheck.reason },
        { status: 403 }
      )
    }

    // Get dealer profile
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    const body = await req.json()
    const { name, make, maxMileage, maxPrice, minYear, fuelType } = body

    // Validate required fields
    if (!name || !make) {
      return NextResponse.json(
        { error: "Missing required fields: name, make" },
        { status: 400 }
      )
    }

    // Create saved search
    const { data: savedSearch, error } = await supabase
      .from("saved_searches")
      .insert({
        dealer_id: dealer.id,
        name,
        make,
        max_mileage: maxMileage ? parseInt(maxMileage) : null,
        max_price: maxPrice ? parseInt(maxPrice) : null,
        min_year: minYear ? parseInt(minYear) : null,
        fuel_type: fuelType || null,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: savedSearch,
      message: "Saved search created successfully"
    })
  } catch (error) {
    console.error("[Saved Searches POST] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create saved search",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/saved-searches
 *
 * Get all saved searches for authenticated user
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer profile
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Get all saved searches
    const { data: savedSearches, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("dealer_id", dealer.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: savedSearches || [],
    })
  } catch (error) {
    console.error("[Saved Searches GET] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch saved searches",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
