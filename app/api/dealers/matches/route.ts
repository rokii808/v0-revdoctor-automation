import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Retrieve personalized vehicle matches for a dealer
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const minScore = Number.parseInt(searchParams.get("minScore") || "0")
    const savedOnly = searchParams.get("savedOnly") === "true"
    const sortBy = searchParams.get("sortBy") || "final_score" // final_score, created_at, price

    let query = supabase
      .from("vehicle_matches")
      .select("*")
      .eq("dealer_id", user.id)

    if (minScore > 0) {
      query = query.gte("final_score", minScore)
    }

    if (savedOnly) {
      query = query.eq("saved", true)
    }

    // Sort
    if (sortBy === "final_score") {
      query = query.order("final_score", { ascending: false })
    } else if (sortBy === "created_at") {
      query = query.order("created_at", { ascending: false })
    } else if (sortBy === "price") {
      query = query.order("price", { ascending: true })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: matches, error } = await query

    if (error) {
      console.error("[Matches GET] Error:", error)
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
    }

    // Get learned preferences for context
    const { data: preferences } = await supabase
      .from("dealer_learned_preferences")
      .select("*")
      .eq("dealer_id", user.id)
      .single()

    // Get count of total matches
    const { count } = await supabase
      .from("vehicle_matches")
      .select("*", { count: "exact", head: true })
      .eq("dealer_id", user.id)
      .gte("final_score", minScore)

    return NextResponse.json({
      success: true,
      matches: matches || [],
      total: count || 0,
      preferences: preferences || null,
      hasPreferences: !!preferences && (preferences.total_interactions || 0) > 0,
    })
  } catch (error) {
    console.error("[Matches GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create or update a vehicle match
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      insightId,
      make,
      model,
      year,
      price,
      mileage,
      url,
      verdict,
      risk,
      baseScore,
      scoreBreakdown,
    } = body

    // Validate required fields
    if (!make || !model || baseScore === undefined) {
      return NextResponse.json({
        error: "Missing required fields: make, model, baseScore"
      }, { status: 400 })
    }

    // Calculate personalization boost using database function
    const { data: boostResult, error: boostError } = await supabase
      .rpc("calculate_personalization_boost", {
        p_dealer_id: user.id,
        p_make: make,
        p_model: model,
        p_price: price || 0,
        p_year: year || 0,
        p_mileage: mileage || 0,
      })

    if (boostError) {
      console.warn("[Matches] Failed to calculate boost:", boostError)
    }

    const personalizationBoost = boostResult || 0
    const finalScore = baseScore + personalizationBoost

    // Insert vehicle match
    const { data: match, error: insertError } = await supabase
      .from("vehicle_matches")
      .insert({
        dealer_id: user.id,
        insight_id: insightId || null,
        make,
        model,
        year: year || null,
        price: price || null,
        mileage: mileage || null,
        url: url || null,
        verdict: verdict || null,
        risk: risk || null,
        base_score: baseScore,
        personalization_boost: personalizationBoost,
        final_score: finalScore,
        score_breakdown: scoreBreakdown || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[Matches POST] Insert error:", insertError)
      return NextResponse.json({ error: "Failed to create match" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      match,
      message: "Vehicle match created successfully"
    })
  } catch (error) {
    console.error("[Matches POST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update a vehicle match
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { matchId, ...updates } = body

    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 })
    }

    const { data: match, error: updateError } = await supabase
      .from("vehicle_matches")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .eq("dealer_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[Matches PATCH] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      match,
      message: "Vehicle match updated successfully"
    })
  } catch (error) {
    console.error("[Matches PATCH] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
