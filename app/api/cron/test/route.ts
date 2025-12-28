import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const cronSecret = process.env.CRON_SECRET || "dev-secret"

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
