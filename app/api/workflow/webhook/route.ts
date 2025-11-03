import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/workflow/webhook - General webhook endpoint for n8n workflow events
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { event_type, dealer_id, data, timestamp } = body

    // Log webhook event for debugging
    console.log("[v0] Workflow webhook received:", { event_type, dealer_id, timestamp })

    switch (event_type) {
      case "workflow_started":
        // Log that workflow started for a dealer
        await supabase
          .from("dealers")
          .update({
            last_scan_at: timestamp || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", dealer_id)
        break

      case "workflow_completed":
        // Log workflow completion with stats
        await supabase
          .from("dealers")
          .update({
            last_scan_completed_at: timestamp || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", dealer_id)
        break

      case "error":
        // Log workflow errors
        console.error("[v0] Workflow error for dealer:", dealer_id, data)
        break

      default:
        console.log("[v0] Unknown webhook event type:", event_type)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error("Workflow webhook API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
