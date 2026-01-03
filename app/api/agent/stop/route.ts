import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer record
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (dealerError) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Deactivate agent by setting agent_active to false
    const { error: updateError } = await supabase
      .from("dealers")
      .update({
        agent_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealer.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, message: "Agent stopped successfully" })
  } catch (error) {
    console.error("Stop agent error:", error)
    return NextResponse.json({ error: "Failed to stop agent" }, { status: 500 })
  }
}
