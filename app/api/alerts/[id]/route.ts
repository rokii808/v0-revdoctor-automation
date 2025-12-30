import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient()
  const { id } = await params

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Validate alert ID format (prevent injection)
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: "Invalid alert ID" }, { status: 400 })
  }

  // SECURITY FIX: Verify the user owns this alert before updating
  const { data: alert } = await supabase
    .from("car_alerts")
    .select("user_id")
    .eq("id", id)
    .single()

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 })
  }

  if (alert.user_id !== user.id) {
    console.warn(`[Security] User ${user.id} attempted to access alert ${id} owned by ${alert.user_id}`)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Update alert to mark as read
  const { error } = await supabase
    .from("car_alerts")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id) // Double-check ownership in update query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
