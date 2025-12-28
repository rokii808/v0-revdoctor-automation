// Multi-site scraper registry
export interface VehicleListing {
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

export interface AuctionSiteScraper {
  name: string
  enabled: boolean
  scrape: () => Promise<VehicleListing[]>
}

// Import scrapers
import { scrapeRAW2K } from "./raw2k"
import { scrapeAutorola } from "./autorola"
import { scrapeBCA } from "./bca"
import { scrapeManheim } from "./manheim"

// Registry of all supported auction sites
export const AUCTION_SITES: Record<string, AuctionSiteScraper> = {
  RAW2K: {
    name: "RAW2K",
    enabled: true,
    scrape: scrapeRAW2K,
  },
  Autorola: {
    name: "Autorola",
    enabled: true,
    scrape: scrapeAutorola,
  },
  BCA: {
    name: "BCA (British Car Auctions)",
    enabled: true,
    scrape: scrapeBCA,
  },
  Manheim: {
    name: "Manheim",
    enabled: false, // Enable when ready
    scrape: scrapeManheim,
  },
}

// Get enabled auction sites
export function getEnabledSites(): AuctionSiteScraper[] {
  return Object.values(AUCTION_SITES).filter(site => site.enabled)
}

// Scrape specific site
export async function scrapeSite(siteName: string): Promise<VehicleListing[]> {
  const site = AUCTION_SITES[siteName]
  if (!site || !site.enabled) {
    console.warn(`[Scraper] Site ${siteName} not found or disabled`)
    return []
  }

  console.log(`[Scraper] Scraping ${site.name}...`)
  try {
    return await site.scrape()
  } catch (error) {
    console.error(`[Scraper] Error scraping ${site.name}:`, error)
    return []
  }
}

// Scrape all enabled sites
export async function scrapeAllSites(): Promise<{
  site: string
  vehicles: VehicleListing[]
  success: boolean
}[]> {
  const enabledSites = getEnabledSites()
  console.log(`[Scraper] Scraping ${enabledSites.length} enabled sites`)

  const results = await Promise.allSettled(
    enabledSites.map(async site => ({
      site: site.name,
      vehicles: await site.scrape(),
      success: true,
    }))
  )

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value
    } else {
      console.error(`[Scraper] Failed to scrape ${enabledSites[index].name}:`, result.reason)
      return {
        site: enabledSites[index].name,
        vehicles: [],
        success: false,
      }
    }
  })
}
