import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/admin"

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret"

interface VehicleListing {
  listing_id: string
  lot_number: string
  make: string
  model: string
  year: number
  price: number
  auction_date: string
  auction_site: string
  url: string
  condition: string
  mileage?: number
  images?: string[]
}

async function scrapeRAW2K(): Promise<VehicleListing[]> {
  console.log("[v0] Starting RAW2K scrape...")

  try {
    const response = await fetch("https://www.raw2k.co.uk/vehicles", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RevvDoctor/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`RAW2K returned ${response.status}`)
    }

    const html = await response.text()

    const listings: VehicleListing[] = []
    const vehiclePattern = /<div class="vehicle-card"[^>]*>(.*?)<\/div>/gs
    const matches = html.matchAll(vehiclePattern)

    for (const match of matches) {
      const cardHtml = match[1]

      const listing: VehicleListing = {
        listing_id: extractData(cardHtml, /data-id="([^"]+)"/) || `RAW2K-${Date.now()}-${Math.random()}`,
        lot_number: extractData(cardHtml, /Lot:\s*(\d+)/) || "",
        make: extractData(cardHtml, /make[">]\s*([^<]+)/) || "",
        model: extractData(cardHtml, /model[">]\s*([^<]+)/) || "",
        year: Number.parseInt(extractData(cardHtml, /(\d{4})/) || "2020"),
        price: parsePrice(extractData(cardHtml, /£([\d,]+)/)),
        auction_date: extractData(cardHtml, /auction-date[">]\s*([^<]+)/) || new Date().toISOString(),
        auction_site: "RAW2K",
        url: `https://www.raw2k.co.uk${extractData(cardHtml, /href="([^"]+)"/) || ""}`,
        condition: extractData(cardHtml, /condition[">]\s*([^<]+)/) || "Unknown",
        mileage: Number.parseInt(extractData(cardHtml, /([\d,]+)\s*miles/) || "0"),
        images: extractImages(cardHtml),
      }

      if (listing.make && listing.model) {
        listings.push(listing)
      }
    }

    console.log(`[v0] Scraped ${listings.length} vehicles from RAW2K`)
    return listings
  } catch (error) {
    console.error("[v0] RAW2K scraping error:", error)
    return []
  }
}

function extractData(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern)
  return match ? match[1].trim() : null
}

function parsePrice(priceStr: string | null): number {
  if (!priceStr) return 0
  return Number.parseInt(priceStr.replace(/,/g, ""))
}

function extractImages(html: string): string[] {
  const images: string[] = []
  const imgPattern = /<img[^>]+src="([^"]+)"/g
  let match
  while ((match = imgPattern.exec(html)) !== null) {
    images.push(match[1])
  }
  return images.slice(0, 3)
}

async function analyzeWithAI(vehicle: VehicleListing): Promise<{
  verdict: string
  reason: string
  risk_level: number
  profit_estimate: number
}> {
  console.log(`[v0] Analyzing ${vehicle.make} ${vehicle.model}...`)

  try {
    const { generateText } = await import("ai")

    const prompt = `Analyze this vehicle for UK dealership investment:
    
Make/Model: ${vehicle.make} ${vehicle.model} ${vehicle.year}
Price: £${vehicle.price}
Condition: ${vehicle.condition}
Mileage: ${vehicle.mileage || "Unknown"}
Auction: ${vehicle.auction_site}

Provide:
1. VERDICT: HEALTHY or AVOID
2. REASON: Brief explanation (max 50 words)
3. RISK_LEVEL: 1-10 (1=low risk, 10=high risk)
4. PROFIT_ESTIMATE: Estimated profit margin in pounds

Format as JSON: {"verdict": "...", "reason": "...", "risk_level": N, "profit_estimate": N}`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.3,
    })

    const analysis = JSON.parse(text)
    return analysis
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return {
      verdict: "PENDING",
      reason: "Analysis failed - manual review needed",
      risk_level: 5,
      profit_estimate: 0,
    }
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[v0] Cron job started: scrape-raw2k")

  try {
    const supabase = createClient()

    const { data: dealers, error: dealersError } = await supabase
      .from("dealers")
      .select("*")
      .eq("subscription_status", "active")

    if (dealersError) throw dealersError

    console.log(`[v0] Found ${dealers?.length || 0} active dealers`)

    const vehicles = await scrapeRAW2K()

    if (vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No vehicles found",
        scraped: 0,
        analyzed: 0,
      })
    }

    let analyzedCount = 0
    let healthyCount = 0

    for (const vehicle of vehicles) {
      const analysis = await analyzeWithAI(vehicle)

      for (const dealer of dealers || []) {
        const matchesCriteria = vehicle.year >= (dealer.min_year || 2015) && vehicle.price <= (dealer.max_bid || 50000)

        if (matchesCriteria && analysis.verdict === "HEALTHY") {
          await supabase.from("insights").insert({
            user_id: dealer.user_id,
            title: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
            make: vehicle.make,
            minor_type: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            url: vehicle.url,
            verdict: analysis.verdict,
            reason: analysis.reason,
            risk: analysis.risk_level,
            created_at: new Date().toISOString(),
          })

          healthyCount++
        }
      }

      analyzedCount++

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    await supabase.from("system_stats").insert({
      date: new Date().toISOString().split("T")[0],
      cars_screened: vehicles.length,
      healthy_cars_found: healthyCount,
      active_dealers: dealers?.length || 0,
      emails_sent: 0,
    })

    console.log("[v0] Scraping complete:", {
      scraped: vehicles.length,
      analyzed: analyzedCount,
      healthy: healthyCount,
    })

    return NextResponse.json({
      success: true,
      scraped: vehicles.length,
      analyzed: analyzedCount,
      healthy: healthyCount,
      dealers: dealers?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      { error: "Scraping failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
