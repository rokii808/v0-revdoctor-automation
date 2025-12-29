import { NextRequest, NextResponse } from "next/server"
import { checkUsageLimit } from "@/lib/subscription/check-subscription"

/**
 * GET /api/subscription/check-limit?feature=saved_searches
 *
 * Check if user has reached limit for a specific feature
 * Returns { allowed: boolean, reason?: string }
 *
 * Features: vehicles_per_day, saved_searches, export, api_access
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const feature = searchParams.get("feature")

    if (!feature) {
      return NextResponse.json(
        { error: "Missing feature parameter" },
        { status: 400 }
      )
    }

    const result = await checkUsageLimit(feature)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Check Limit] Error:", error)
    return NextResponse.json(
      {
        allowed: false,
        reason: "Failed to check usage limit"
      },
      { status: 500 }
    )
  }
}
