import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Validate environment variables
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[CRON] CRON_SECRET environment variable not set")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  // Verify authorization for this test endpoint
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[CRON] Unauthorized test cron attempt")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    console.log("[v0] Triggering test scrape...")

    const scrapeResponse = await fetch(`${baseUrl}/api/cron/scrape-raw2k`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    const scrapeResult = await scrapeResponse.json()

    return NextResponse.json({
      success: true,
      scraping: scrapeResult,
      message: "Test cron triggered successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
