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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      console.error(`[v0] RAW2K returned status ${response.status}`)
      throw new Error(`RAW2K returned ${response.status}`)
    }

    const html = await response.text()
    console.log(`[v0] Fetched ${html.length} characters from RAW2K`)

    const listings: VehicleListing[] = []

    // More robust pattern matching - try multiple patterns
    const patterns = [
      /<div class="vehicle-card"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*class="[^"]*vehicle[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<article[^>]*class="[^"]*vehicle[^"]*"[^>]*>(.*?)<\/article>/gs,
    ]

    let matches: IterableIterator<RegExpMatchArray> | null = null
    for (const pattern of patterns) {
      matches = html.matchAll(pattern)
      const matchArray = Array.from(matches)
      if (matchArray.length > 0) {
        console.log(`[v0] Found ${matchArray.length} matches with pattern`)
        matches = matchArray[Symbol.iterator]() as IterableIterator<RegExpMatchArray>
        break
      }
    }

    if (!matches) {
      console.warn("[v0] No vehicle cards found - HTML structure may have changed")
      console.log("[v0] Sample HTML:", html.substring(0, 500))
      return []
    }

    let processedCount = 0
    for (const match of matches) {
      try {
        const cardHtml = match[1] || match[0]

        const listing: VehicleListing = {
          listing_id: extractData(cardHtml, /data-id="([^"]+)"/) || `RAW2K-${Date.now()}-${Math.random()}`,
          lot_number: extractData(cardHtml, /Lot:\s*(\d+)/) || `LOT-${processedCount}`,
          make: extractData(cardHtml, /make[">]\s*([^<]+)/) || extractData(cardHtml, /<h3[^>]*>([^<]+)\s+([^<]+)<\/h3>/)?.split(' ')[0] || "",
          model: extractData(cardHtml, /model[">]\s*([^<]+)/) || extractData(cardHtml, /<h3[^>]*>([^<]+)\s+([^<]+)<\/h3>/)?.split(' ')[1] || "",
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
          processedCount++
        } else {
          console.warn(`[v0] Skipping vehicle - missing make/model:`, { make: listing.make, model: listing.model })
        }
      } catch (err) {
        console.error(`[v0] Error processing vehicle card:`, err)
        continue
      }
    }

    console.log(`[v0] Successfully scraped ${listings.length} vehicles from RAW2K`)
    return listings
  } catch (error) {
    console.error("[v0] RAW2K scraping error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message, error.stack)
    }
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

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[v0] OPENAI_API_KEY not configured - using heuristic analysis")
    return heuristicAnalysis(vehicle)
  }

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
      maxRetries: 2,
    })

    const analysis = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    // Validate response structure
    if (!analysis.verdict || !analysis.reason || typeof analysis.risk_level !== 'number') {
      throw new Error('Invalid AI response structure')
    }

    return analysis
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    console.log("[v0] Falling back to heuristic analysis")
    return heuristicAnalysis(vehicle)
  }
}

// Fallback heuristic analysis when AI is unavailable
function heuristicAnalysis(vehicle: VehicleListing): {
  verdict: string
  reason: string
  risk_level: number
  profit_estimate: number
} {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicle.year
  const mileage = vehicle.mileage || 0

  // Simple scoring system
  let riskScore = 5
  let verdict = "HEALTHY"
  let reason = ""

  // Age factor
  if (age > 10) {
    riskScore += 2
    reason += "Older vehicle. "
  } else if (age < 3) {
    riskScore -= 1
  }

  // Mileage factor
  if (mileage > 100000) {
    riskScore += 2
    reason += "High mileage. "
  } else if (mileage < 30000) {
    riskScore -= 1
    reason += "Low mileage. "
  }

  // Price factor
  if (vehicle.price > 30000) {
    riskScore += 1
    reason += "Higher price point. "
  }

  // Condition factor
  if (vehicle.condition.toLowerCase().includes("poor") || vehicle.condition.toLowerCase().includes("damaged")) {
    riskScore += 3
    reason += "Condition concerns. "
  }

  riskScore = Math.max(1, Math.min(10, riskScore))

  if (riskScore > 7) {
    verdict = "AVOID"
    reason = "High risk: " + reason
  } else {
    reason = reason || "Standard market vehicle with acceptable parameters."
  }

  const profitEstimate = Math.max(0, Math.floor((vehicle.price * 0.15) - (riskScore * 100)))

  return {
    verdict,
    reason: reason.trim(),
    risk_level: riskScore,
    profit_estimate: profitEstimate
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
          // Insert into both tables to maintain compatibility
          const vehicleData = {
            dealer_id: dealer.id,
            user_id: dealer.user_id,
            title: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
            make: vehicle.make,
            model: vehicle.model,
            minor_type: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            url: vehicle.url,
            verdict: analysis.verdict,
            reason: analysis.reason,
            risk: analysis.risk_level,
            profit_estimate: analysis.profit_estimate,
            mileage: vehicle.mileage,
            condition: vehicle.condition,
            auction_site: vehicle.auction_site,
            listing_id: vehicle.listing_id,
            created_at: new Date().toISOString(),
          }

          // Insert into insights table
          const { error: insightsError } = await supabase.from("insights").insert(vehicleData)
          if (insightsError) {
            console.error("[v0] Error inserting into insights:", insightsError.message)
          }

          // Insert into healthy_cars table
          const { error: healthyCarsError } = await supabase.from("healthy_cars").insert(vehicleData)
          if (healthyCarsError) {
            console.error("[v0] Error inserting into healthy_cars:", healthyCarsError.message)
          }

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
