import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Call n8n webhook to stop agent
    if (!process.env.N8N_WEBHOOK_URL) {
      return NextResponse.json({ error: "N8N webhook not configured" }, { status: 500 })
    }

    const response = await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/stopAgent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })

    if (!response.ok) {
      throw new Error("Failed to stop agent")
    }

    return NextResponse.json({ success: true, message: "Agent stopped successfully" })
  } catch (error) {
    console.error("Stop agent error:", error)
    return NextResponse.json({ error: "Failed to stop agent" }, { status: 500 })
  }
}
