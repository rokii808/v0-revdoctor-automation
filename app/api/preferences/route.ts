import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { userPreferencesSchema } from "@/lib/types/preferences"

// GET - Fetch user preferences
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Get preferences
    const { data: preferences, error: prefsError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("dealer_id", dealer.id)
      .single()

    if (prefsError && prefsError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error("[Preferences] Error fetching:", prefsError)
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          min_year: 2015,
          max_price: 50000,
          min_price: 0,
          max_mileage: 100000,
          enabled_auction_sites: ["RAW2K"],
          email_frequency: "daily",
          email_enabled: true,
          min_vehicles_to_send: 1,
        },
        isDefault: true,
      })
    }

    return NextResponse.json({ preferences, isDefault: false })
  } catch (error) {
    console.error("[Preferences GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create or update user preferences
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = userPreferencesSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid preferences", details: validatedData.error.errors },
        { status: 400 }
      )
    }

    const preferences = validatedData.data

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Check if preferences already exist
    const { data: existing } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("dealer_id", dealer.id)
      .single()

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("[Preferences UPDATE] Error:", error)
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
      }

      return NextResponse.json({ preferences: data, updated: true })
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .insert({
          dealer_id: dealer.id,
          user_id: user.id,
          ...preferences,
        })
        .select()
        .single()

      if (error) {
        console.error("[Preferences CREATE] Error:", error)
        return NextResponse.json({ error: "Failed to create preferences" }, { status: 500 })
      }

      return NextResponse.json({ preferences: data, created: true })
    }
  } catch (error) {
    console.error("[Preferences POST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Reset preferences to default
export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Delete preferences
    const { error } = await supabase
      .from("user_preferences")
      .delete()
      .eq("dealer_id", dealer.id)

    if (error) {
      console.error("[Preferences DELETE] Error:", error)
      return NextResponse.json({ error: "Failed to delete preferences" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Preferences reset to default" })
  } catch (error) {
    console.error("[Preferences DELETE] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
