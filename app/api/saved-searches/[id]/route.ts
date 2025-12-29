import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * PATCH /api/saved-searches/[id]
 *
 * Update a saved search (toggle active, edit fields)
 * Body: { isActive?, name?, make?, maxMileage?, maxPrice?, minYear?, fuelType? }
 *
 * SECURITY: Verifies ownership before updating
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get dealer profile
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Verify ownership
    const { data: existingSearch } = await supabase
      .from("saved_searches")
      .select("dealer_id")
      .eq("id", id)
      .single()

    if (!existingSearch || existingSearch.dealer_id !== dealer.id) {
      return NextResponse.json(
        { error: "Saved search not found or access denied" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { isActive, name, make, maxMileage, maxPrice, minYear, fuelType } = body

    // Build update object (only include provided fields)
    const updates: any = {}

    if (typeof isActive === 'boolean') {
      updates.is_active = isActive
    }
    if (name !== undefined) {
      updates.name = name
    }
    if (make !== undefined) {
      updates.make = make
    }
    if (maxMileage !== undefined) {
      updates.max_mileage = maxMileage ? parseInt(maxMileage) : null
    }
    if (maxPrice !== undefined) {
      updates.max_price = maxPrice ? parseInt(maxPrice) : null
    }
    if (minYear !== undefined) {
      updates.min_year = minYear ? parseInt(minYear) : null
    }
    if (fuelType !== undefined) {
      updates.fuel_type = fuelType || null
    }

    // Update saved search
    const { data: updatedSearch, error } = await supabase
      .from("saved_searches")
      .update(updates)
      .eq("id", id)
      .eq("dealer_id", dealer.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: updatedSearch,
      message: "Saved search updated successfully"
    })
  } catch (error) {
    console.error("[Saved Searches PATCH] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to update saved search",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/saved-searches/[id]
 *
 * Delete a saved search
 *
 * SECURITY: Verifies ownership before deleting
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get dealer profile
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Verify ownership
    const { data: existingSearch } = await supabase
      .from("saved_searches")
      .select("dealer_id")
      .eq("id", id)
      .single()

    if (!existingSearch || existingSearch.dealer_id !== dealer.id) {
      return NextResponse.json(
        { error: "Saved search not found or access denied" },
        { status: 404 }
      )
    }

    // Delete saved search
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", id)
      .eq("dealer_id", dealer.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Saved search deleted successfully"
    })
  } catch (error) {
    console.error("[Saved Searches DELETE] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete saved search",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
