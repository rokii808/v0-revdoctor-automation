import { NextRequest, NextResponse } from "next/server"
import { inngest } from "@/lib/inngest/client"

/**
 * API endpoint to trigger "See It in Action" demo
 *
 * POST /api/demo/see-action
 * Body: { email: "user@example.com" }
 *
 * This endpoint:
 * 1. Validates the email address
 * 2. Triggers the Inngest demo workflow
 * 3. Returns immediately (workflow runs async)
 *
 * No authentication required - public demo endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    console.log(`[API] Triggering demo for email: ${email}`)

    // Trigger Inngest workflow
    await inngest.send({
      name: "demo/see-action",
      data: {
        email: email.toLowerCase().trim(),
        triggered_at: new Date().toISOString(),
      },
    })

    console.log(`[API] Demo workflow triggered successfully for ${email}`)

    return NextResponse.json({
      success: true,
      message: "Demo email will be sent shortly! Check your inbox in 2-3 minutes.",
      email,
    })
  } catch (error) {
    console.error("[API] Error triggering demo:", error)

    return NextResponse.json(
      {
        error: "Failed to trigger demo",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * Handle OPTIONS for CORS (if needed)
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
