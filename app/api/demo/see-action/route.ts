import { NextRequest, NextResponse } from "next/server"
import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"

const MAX_SUBMISSIONS_PER_EMAIL = 2

/**
 * API endpoint to trigger "See It in Action" demo
 *
 * POST /api/demo/see-action
 * Body: { email: "user@example.com" }
 *
 * This endpoint:
 * 1. Validates the email address
 * 2. Checks rate limit (max 2 submissions per email)
 * 3. Tracks submission in database
 * 4. Triggers the Inngest demo workflow
 * 5. Returns immediately (workflow runs async)
 *
 * No authentication required - public demo endpoint
 */
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()

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

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email has already submitted (rate limiting)
    const { data: existingSubmission } = await supabase
      .from("see_it_in_action_submissions")
      .select("*")
      .eq("email", normalizedEmail)
      .single()

    // Rate limit check
    if (existingSubmission && existingSubmission.submission_count >= MAX_SUBMISSIONS_PER_EMAIL) {
      console.log(`[API] Rate limit exceeded for ${normalizedEmail} (${existingSubmission.submission_count} submissions)`)
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've already received the demo ${MAX_SUBMISSIONS_PER_EMAIL} times. Please sign up for full access!`,
          submission_count: existingSubmission.submission_count,
        },
        { status: 429 }
      )
    }

    // Get IP and user agent for tracking
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    // Update or insert submission record
    if (existingSubmission) {
      // Update existing record
      await supabase
        .from("see_it_in_action_submissions")
        .update({
          submission_count: existingSubmission.submission_count + 1,
          last_submitted_at: new Date().toISOString(),
          last_email_status: "pending",
          ip_address: ip,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id)
    } else {
      // Insert new record
      await supabase.from("see_it_in_action_submissions").insert({
        email: normalizedEmail,
        submission_count: 1,
        last_email_status: "pending",
        ip_address: ip,
        user_agent: userAgent,
      })
    }

    console.log(`[API] Triggering demo for ${normalizedEmail} (submission #${existingSubmission ? existingSubmission.submission_count + 1 : 1})`)

    // Trigger Inngest workflow
    await inngest.send({
      name: "demo/see-action",
      data: {
        email: normalizedEmail,
        triggered_at: new Date().toISOString(),
        submission_number: existingSubmission ? existingSubmission.submission_count + 1 : 1,
      },
    })

    console.log(`[API] Demo workflow triggered successfully for ${normalizedEmail}`)

    const submissionCount = existingSubmission ? existingSubmission.submission_count + 1 : 1
    const remainingSubmissions = MAX_SUBMISSIONS_PER_EMAIL - submissionCount

    return NextResponse.json({
      success: true,
      message: "Demo email will be sent shortly! Check your inbox in 2-3 minutes.",
      email: normalizedEmail,
      submission_count: submissionCount,
      remaining_submissions: remainingSubmissions,
    })
  } catch (error) {
    console.error("[API] Error triggering demo:", error)

    // Try to update submission status to failed
    try {
      const body = await req.json()
      const { email } = body
      if (email) {
        await supabase
          .from("see_it_in_action_submissions")
          .update({
            last_email_status: "failed",
            last_email_error: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("email", email.toLowerCase().trim())
      }
    } catch (updateError) {
      console.error("[API] Failed to update error status:", updateError)
    }

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
