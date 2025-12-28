import type { VehicleListing } from "./index"

export async function scrapeRAW2K(): Promise<VehicleListing[]> {
  console.log("[RAW2K] Starting scrape...")

  try {
    const response = await fetch("https://www.raw2k.co.uk/vehicles", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`RAW2K returned ${response.status}`)
    }

    const html = await response.text()
    console.log(`[RAW2K] Fetched ${html.length} characters`)

    const listings: VehicleListing[] = []

    // Try multiple patterns
    const patterns = [
      /<div class="vehicle-card"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*class="[^"]*vehicle[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<article[^>]*class="[^"]*vehicle[^"]*"[^>]*>(.*?)<\/article>/gs,
    ]

    let matches: RegExpMatchArray[] = []
    for (const pattern of patterns) {
      matches = Array.from(html.matchAll(pattern))
      if (matches.length > 0) {
        console.log(`[RAW2K] Found ${matches.length} matches`)
        break
      }
    }

    if (matches.length === 0) {
      console.warn("[RAW2K] No vehicle cards found")
      return []
    }

    for (const [index, match] of matches.entries()) {
      try {
        const cardHtml = match[1] || match[0]

        const listing: VehicleListing = {
          listing_id: extractData(cardHtml, /data-id="([^"]+)"/) || `RAW2K-${Date.now()}-${index}`,
          lot_number: extractData(cardHtml, /Lot:\s*(\d+)/) || `LOT-${index}`,
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
      } catch (err) {
        console.error(`[RAW2K] Error processing vehicle:`, err)
      }
    }

    console.log(`[RAW2K] Successfully scraped ${listings.length} vehicles`)
    return listings
  } catch (error) {
    console.error("[RAW2K] Scraping error:", error)
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
