import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/workflow/digest - Log email digest sent from n8n
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { dealer_id, email, car_count, cars_data, sent_at } = body

    // Validate required fields
    if (!dealer_id || !email || car_count === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert digest log
    const { data: digest, error } = await supabase
      .from("digests")
      .insert({
        dealer_id,
        email,
        car_count: Number.parseInt(car_count),
        cars_data: cars_data || [],
        sent_at: sent_at || new Date().toISOString(),
        status: "sent",
      })
      .select()
      .single()

    if (error) {
      console.error("Error logging digest:", error)
      return NextResponse.json({ error: "Failed to log digest" }, { status: 500 })
    }

    // Update dealer's last_digest_at timestamp
    await supabase
      .from("dealers")
      .update({
        last_digest_at: sent_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealer_id)

    return NextResponse.json({ success: true, digest })
  } catch (error) {
    console.error("Workflow digest API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
