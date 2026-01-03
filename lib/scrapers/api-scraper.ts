import type { VehicleListing } from "./index"

/**
 * GENERIC API SCRAPER TEMPLATE
 *
 * Use this template for API-based scraping once you have API access.
 * Each auction site will have its own configuration.
 */

interface APIConfig {
  name: string
  baseURL: string
  apiKey?: string
  authHeader?: string
  endpoint: string
  method?: "GET" | "POST"
  headers?: Record<string, string>
}

interface APIResponse {
  data: any[]
  total?: number
  page?: number
  nextPage?: string
}

/**
 * Generic API scraper
 * Fetches vehicles from an API endpoint and transforms to VehicleListing format
 */
export async function scrapeFromAPI(
  config: APIConfig,
  transformFn: (apiVehicle: any) => VehicleListing
): Promise<VehicleListing[]> {
  console.log(`[${config.name}] Starting API scrape...`)

  try {
    const url = `${config.baseURL}${config.endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    }

    // Add authentication if provided
    if (config.apiKey && config.authHeader) {
      headers[config.authHeader] = config.apiKey
    }

    const response = await fetch(url, {
      method: config.method || "GET",
      headers,
      next: { revalidate: 0 }, // Don't cache
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const apiResponse: APIResponse = await response.json()
    console.log(`[${config.name}] API returned ${apiResponse.data?.length || 0} vehicles`)

    // Transform API data to VehicleListing format
    const listings = (apiResponse.data || [])
      .map((vehicle) => {
        try {
          return transformFn(vehicle)
        } catch (err) {
          console.error(`[${config.name}] Error transforming vehicle:`, err)
          return null
        }
      })
      .filter((v): v is VehicleListing => v !== null)

    console.log(`[${config.name}] Successfully transformed ${listings.length} vehicles`)
    return listings
  } catch (error) {
    console.error(`[${config.name}] API scraping error:`, error)
    return []
  }
}

/**
 * RAW2K API SCRAPER
 * Replace this with actual RAW2K API once you have access
 */
export async function scrapeRAW2KAPI(): Promise<VehicleListing[]> {
  const config: APIConfig = {
    name: "RAW2K",
    baseURL: process.env.RAW2K_API_URL || "https://api.raw2k.co.uk/v1",
    apiKey: process.env.RAW2K_API_KEY,
    authHeader: "X-API-Key",
    endpoint: "/vehicles",
  }

  // Transform RAW2K API response to VehicleListing
  const transform = (vehicle: any): VehicleListing => ({
    listing_id: vehicle.id || `RAW2K-${vehicle.lot_number}`,
    lot_number: vehicle.lot_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.current_bid || vehicle.price,
    mileage: vehicle.mileage,
    condition: vehicle.condition || "Unknown",
    auction_date: vehicle.auction_date,
    auction_site: "RAW2K",
    url: vehicle.url || `https://www.raw2k.co.uk/vehicle/${vehicle.id}`,
    images: vehicle.images || [],
  })

  return scrapeFromAPI(config, transform)
}

/**
 * BCA API SCRAPER
 * Requires BCA Partner API access
 */
export async function scrapeBCAAPI(): Promise<VehicleListing[]> {
  const config: APIConfig = {
    name: "BCA",
    baseURL: process.env.BCA_API_URL || "https://api.bca.co.uk/v1",
    apiKey: process.env.BCA_API_KEY,
    authHeader: "Authorization",
    endpoint: "/vehicles/search",
    headers: {
      "X-API-Secret": process.env.BCA_API_SECRET || "",
    },
  }

  // Transform BCA API response to VehicleListing
  const transform = (vehicle: any): VehicleListing => ({
    listing_id: vehicle.vehicleId || `BCA-${vehicle.lotNumber}`,
    lot_number: vehicle.lotNumber,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.registrationYear,
    price: vehicle.currentBid || vehicle.reservePrice,
    mileage: vehicle.mileage,
    condition: vehicle.grade || "Unknown",
    auction_date: vehicle.saleDate,
    auction_site: "BCA",
    url: vehicle.vehicleUrl || `https://www.bca.co.uk/vehicle/${vehicle.vehicleId}`,
    images: vehicle.images?.map((img: any) => img.url) || [],
  })

  return scrapeFromAPI(config, transform)
}

/**
 * AUTOROLA API SCRAPER
 * Requires Autorola dealer account and API credentials
 */
export async function scrapeAutorolaAPI(): Promise<VehicleListing[]> {
  // Autorola uses OAuth2, so we need to handle authentication first
  const accessToken = await getAutorolaAccessToken()

  const config: APIConfig = {
    name: "Autorola",
    baseURL: process.env.AUTOROLA_API_URL || "https://api.autorola.com/v1",
    apiKey: accessToken,
    authHeader: "Authorization",
    endpoint: "/vehicles",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }

  // Transform Autorola API response to VehicleListing
  const transform = (vehicle: any): VehicleListing => ({
    listing_id: vehicle.id || `Autorola-${vehicle.auctionId}`,
    lot_number: vehicle.lotNo,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.startingPrice || vehicle.estimatedPrice,
    mileage: vehicle.mileageKm,
    condition: vehicle.condition || "Unknown",
    auction_date: vehicle.auctionEndDate,
    auction_site: "Autorola",
    url: vehicle.vehicleUrl || `https://www.autorola.co.uk/vehicle/${vehicle.id}`,
    images: vehicle.photos?.map((p: any) => p.url) || [],
  })

  return scrapeFromAPI(config, transform)
}

/**
 * Get Autorola OAuth2 access token
 */
async function getAutorolaAccessToken(): Promise<string> {
  const clientId = process.env.AUTOROLA_CLIENT_ID
  const clientSecret = process.env.AUTOROLA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Autorola API credentials not configured")
  }

  try {
    const response = await fetch("https://api.autorola.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("[Autorola] OAuth error:", error)
    throw new Error("Failed to get Autorola access token")
  }
}

/**
 * MANHEIM API SCRAPER
 * Requires Manheim dealer account and API key
 */
export async function scrapeManheimAPI(): Promise<VehicleListing[]> {
  const config: APIConfig = {
    name: "Manheim",
    baseURL: process.env.MANHEIM_API_URL || "https://api.manheim.com/v1",
    apiKey: process.env.MANHEIM_API_KEY,
    authHeader: "X-API-Key",
    endpoint: "/inventory/search",
    headers: {
      "X-Dealer-ID": process.env.MANHEIM_DEALER_ID || "",
    },
  }

  // Transform Manheim API response to VehicleListing
  const transform = (vehicle: any): VehicleListing => ({
    listing_id: vehicle.vin || `Manheim-${vehicle.itemId}`,
    lot_number: vehicle.itemId,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.modelYear,
    price: vehicle.currentBid || vehicle.mmr, // MMR = Manheim Market Report price
    mileage: vehicle.odometer,
    condition: vehicle.conditionReport?.grade || "Unknown",
    auction_date: vehicle.saleDateTime,
    auction_site: "Manheim",
    url: vehicle.itemUrl || `https://www.manheim.com/members/gateway.do?itemId=${vehicle.itemId}`,
    images: vehicle.images?.map((img: any) => img.fullSize) || [],
  })

  return scrapeFromAPI(config, transform)
}
