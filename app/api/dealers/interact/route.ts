import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Track dealer interaction with a vehicle
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleMatchId, interactionType, durationSeconds, metadata } = body

    // Validate input
    if (!interactionType) {
      return NextResponse.json({ error: "Missing interactionType" }, { status: 400 })
    }

    const validTypes = ['VIEW', 'SAVE', 'SKIP', 'CONTACT_SELLER', 'SHARE']
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json({
        error: `Invalid interactionType. Must be one of: ${validTypes.join(', ')}`
      }, { status: 400 })
    }

    // Record the interaction
    const { data: interaction, error: insertError } = await supabase
      .from("dealer_interactions")
      .insert({
        dealer_id: user.id,
        vehicle_match_id: vehicleMatchId || null,
        interaction_type: interactionType,
        duration_seconds: durationSeconds || null,
        metadata: metadata || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[Interact] Insert error:", insertError)
      return NextResponse.json({ error: "Failed to record interaction" }, { status: 500 })
    }

    // Update vehicle_matches table if applicable
    if (vehicleMatchId) {
      const updates: Record<string, boolean> = {}

      if (interactionType === 'VIEW') {
        updates.viewed = true
      } else if (interactionType === 'SAVE') {
        updates.saved = true
      } else if (interactionType === 'SKIP') {
        updates.skipped = true
      } else if (interactionType === 'CONTACT_SELLER') {
        updates.contacted_seller = true
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("vehicle_matches")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", vehicleMatchId)
          .eq("dealer_id", user.id)

        if (updateError) {
          console.warn("[Interact] Failed to update vehicle_matches:", updateError)
          // Don't fail the request, just log the warning
        }
      }
    }

    // Trigger preference learning update
    // This is automatically handled by the database trigger

    return NextResponse.json({
      success: true,
      interaction,
      message: "Interaction recorded successfully"
    })
  } catch (error) {
    console.error("[Interact POST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Retrieve dealer's interaction history
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const interactionType = searchParams.get("type")

    let query = supabase
      .from("dealer_interactions")
      .select("*")
      .eq("dealer_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (interactionType) {
      query = query.eq("interaction_type", interactionType)
    }

    const { data: interactions, error } = await query

    if (error) {
      console.error("[Interact GET] Error:", error)
      return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 })
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from("dealer_learned_preferences")
      .select("total_interactions, total_saves, total_skips")
      .eq("dealer_id", user.id)
      .single()

    return NextResponse.json({
      success: true,
      interactions: interactions || [],
      stats: stats || { total_interactions: 0, total_saves: 0, total_skips: 0 },
    })
  } catch (error) {
    console.error("[Interact GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
