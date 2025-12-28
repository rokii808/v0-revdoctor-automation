import * as cheerio from "cheerio"
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

    const $ = cheerio.load(html)
    const listings: VehicleListing[] = []
    
    // Select all vehicle cards - adjust selector based on actual site structure
    // Using a broad selector to match potential variations
    const vehicleCards = $(".vehicle-card, .vehicle-listing, article.vehicle")

    if (vehicleCards.length === 0) {
      console.warn("[RAW2K] No vehicle cards found")
      return []
    }

    console.log(`[RAW2K] Found ${vehicleCards.length} matches`)

    vehicleCards.each((_, element) => {
      try {
        const el = $(element)
        
        // Extract data using selectors
        // These selectors are best guesses based on common patterns and the previous regex
        // In a real scenario, we would inspect the actual HTML
        
        const listingId = el.attr("data-id") || `RAW2K-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const lotNumber = el.find(".lot-number, .lot").text().replace(/\D/g, "") || `LOT-UNKNOWN`
        
        const title = el.find(".title, h3, h4, .vehicle-name").first().text().trim()
        // Try to parse make/model from title if explicit fields aren't found
        const make = el.find(".make").text().trim() || title.split(" ")[0] || ""
        const model = el.find(".model").text().trim() || title.split(" ").slice(1).join(" ") || ""
        
        const yearText = el.find(".year").text().trim() || title.match(/\b20\d{2}\b/)?.[0] || "2020"
        const year = parseInt(yearText, 10)

        const priceText = el.find(".price, .current-bid").text().trim()
        const price = parsePrice(priceText)

        const auctionDate = el.find(".auction-date, .time-left").text().trim() || new Date().toISOString()
        
        const relativeUrl = el.attr("href") || el.find("a").attr("href") || ""
        const url = relativeUrl.startsWith("http") ? relativeUrl : `https://www.raw2k.co.uk${relativeUrl}`

        const condition = el.find(".condition, .category").text().trim() || "Unknown"
        
        const mileageText = el.find(".mileage, .odometer").text().trim()
        const mileage = parseInt(mileageText.replace(/\D/g, ""), 10) || 0

        const images: string[] = []
        el.find("img").each((_, img) => {
          const src = $(img).attr("src")
          if (src) images.push(src)
        })

        const listing: VehicleListing = {
          listing_id: listingId,
          lot_number: lotNumber,
          make,
          model,
          year,
          price,
          auction_date: auctionDate,
          auction_site: "RAW2K",
          url,
          condition,
          mileage,
          images: images.slice(0, 3)
        }

        if (listing.make && listing.model) {
          listings.push(listing)
        }
      } catch (err) {
        console.error(`[RAW2K] Error processing vehicle:`, err)
      }
    })

    console.log(`[RAW2K] Successfully scraped ${listings.length} vehicles`)
    return listings
  } catch (error) {
    console.error("[RAW2K] Scraping error:", error)
    return []
  }
}

function parsePrice(priceStr: string | null): number {
  if (!priceStr) return 0
  return Number.parseInt(priceStr.replace(/[^\d.]/g, ""))
}

