import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 403 })
    }

    // Call n8n webhook to start agent
    if (!process.env.N8N_WEBHOOK_URL) {
      return NextResponse.json({ error: "N8N webhook not configured" }, { status: 500 })
    }

    const response = await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/startAgent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        plan: subscription.plan,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to start agent")
    }

    return NextResponse.json({ success: true, message: "Agent started successfully" })
  } catch (error) {
    console.error("Start agent error:", error)
    return NextResponse.json({ error: "Failed to start agent" }, { status: 500 })
  }
}
