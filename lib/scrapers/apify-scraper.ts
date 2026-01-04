import { ApifyClient } from 'apify-client'
import type { VehicleListing } from './index'

/**
 * APIFY SCRAPER
 *
 * Uses Apify platform to scrape auction sites reliably.
 *
 * Benefits:
 * - No need to maintain scrapers yourself
 * - Handles proxies, rate limiting, CAPTCHAs
 * - More reliable than basic HTML scraping
 * - Cheaper than official auction APIs
 *
 * Cost: ~$0.25 per 1000 pages scraped (after free tier)
 */

// Initialize Apify client
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY || 'placeholder_for_build',
})

/**
 * Scrape RAW2K using Apify
 */
export async function scrapeRAW2KApify(): Promise<VehicleListing[]> {
  console.log('[Apify] Starting RAW2K scrape...')

  try {
    // Run your Apify actor
    // Replace 'your-actor-name' with your actual actor ID
    const run = await client.actor('your-actor-name/raw2k-scraper').call({
      // Input parameters for the actor
      startUrls: ['https://www.raw2k.co.uk/vehicles'],
      maxPages: 10,
      // Add other configuration as needed
    })

    // Wait for the actor to finish and fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    // Transform Apify results to VehicleListing format
    const vehicles: VehicleListing[] = items.map((item: any) => ({
      listing_id: item.id || `RAW2K-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lot_number: item.lotNumber || 'N/A',
      make: item.make || '',
      model: item.model || '',
      year: parseInt(item.year) || 2020,
      price: parseFloat(item.price) || 0,
      mileage: parseInt(item.mileage) || 0,
      condition: item.condition || 'Unknown',
      auction_date: item.auctionDate || new Date().toISOString(),
      auction_site: 'RAW2K',
      url: item.url || '',
      images: item.images || [],
    }))

    console.log(`✅ [Apify] Scraped ${vehicles.length} vehicles from RAW2K`)
    return vehicles
  } catch (error) {
    console.error('[Apify] RAW2K scraping error:', error)
    return []
  }
}

/**
 * Scrape BCA using Apify
 */
export async function scrapeBCAApify(): Promise<VehicleListing[]> {
  console.log('[Apify] Starting BCA scrape...')

  try {
    const run = await client.actor('your-actor-name/bca-scraper').call({
      startUrls: ['https://www.bca.co.uk/search/cars'],
      maxPages: 10,
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    const vehicles: VehicleListing[] = items.map((item: any) => ({
      listing_id: item.id || `BCA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lot_number: item.lotNumber || 'N/A',
      make: item.make || '',
      model: item.model || '',
      year: parseInt(item.year) || 2020,
      price: parseFloat(item.price) || 0,
      mileage: parseInt(item.mileage) || 0,
      condition: item.condition || 'Unknown',
      auction_date: item.auctionDate || new Date().toISOString(),
      auction_site: 'BCA',
      url: item.url || '',
      images: item.images || [],
    }))

    console.log(`✅ [Apify] Scraped ${vehicles.length} vehicles from BCA`)
    return vehicles
  } catch (error) {
    console.error('[Apify] BCA scraping error:', error)
    return []
  }
}

/**
 * Scrape Autorola using Apify
 */
export async function scrapeAutorolaApify(): Promise<VehicleListing[]> {
  console.log('[Apify] Starting Autorola scrape...')

  try {
    const run = await client.actor('your-actor-name/autorola-scraper').call({
      startUrls: ['https://www.autorola.co.uk/vehicles'],
      maxPages: 10,
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    const vehicles: VehicleListing[] = items.map((item: any) => ({
      listing_id: item.id || `AUTOROLA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lot_number: item.lotNumber || 'N/A',
      make: item.make || '',
      model: item.model || '',
      year: parseInt(item.year) || 2020,
      price: parseFloat(item.price) || 0,
      mileage: parseInt(item.mileage) || 0,
      condition: item.condition || 'Unknown',
      auction_date: item.auctionDate || new Date().toISOString(),
      auction_site: 'AUTOROLA',
      url: item.url || '',
      images: item.images || [],
    }))

    console.log(`✅ [Apify] Scraped ${vehicles.length} vehicles from Autorola`)
    return vehicles
  } catch (error) {
    console.error('[Apify] Autorola scraping error:', error)
    return []
  }
}

/**
 * Scrape Manheim using Apify
 */
export async function scrapeManheimApify(): Promise<VehicleListing[]> {
  console.log('[Apify] Starting Manheim scrape...')

  try {
    const run = await client.actor('your-actor-name/manheim-scraper').call({
      startUrls: ['https://www.manheim.co.uk/search'],
      maxPages: 10,
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    const vehicles: VehicleListing[] = items.map((item: any) => ({
      listing_id: item.id || `MANHEIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lot_number: item.lotNumber || 'N/A',
      make: item.make || '',
      model: item.model || '',
      year: parseInt(item.year) || 2020,
      price: parseFloat(item.price) || 0,
      mileage: parseInt(item.mileage) || 0,
      condition: item.condition || 'Unknown',
      auction_date: item.auctionDate || new Date().toISOString(),
      auction_site: 'MANHEIM',
      url: item.url || '',
      images: item.images || [],
    }))

    console.log(`✅ [Apify] Scraped ${vehicles.length} vehicles from Manheim`)
    return vehicles
  } catch (error) {
    console.error('[Apify] Manheim scraping error:', error)
    return []
  }
}

/**
 * Generic Apify scraper
 * Use this if you have a custom actor that scrapes multiple sites
 */
export async function scrapeWithApify(
  actorId: string,
  input: Record<string, any>,
  auctionSite: string
): Promise<VehicleListing[]> {
  console.log(`[Apify] Starting ${auctionSite} scrape with actor ${actorId}...`)

  try {
    const run = await client.actor(actorId).call(input)
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    const vehicles: VehicleListing[] = items.map((item: any) => ({
      listing_id: item.id || `${auctionSite}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lot_number: item.lotNumber || 'N/A',
      make: item.make || '',
      model: item.model || '',
      year: parseInt(item.year) || 2020,
      price: parseFloat(item.price) || 0,
      mileage: parseInt(item.mileage) || 0,
      condition: item.condition || 'Unknown',
      auction_date: item.auctionDate || new Date().toISOString(),
      auction_site: auctionSite,
      url: item.url || '',
      images: item.images || [],
    }))

    console.log(`✅ [Apify] Scraped ${vehicles.length} vehicles from ${auctionSite}`)
    return vehicles
  } catch (error) {
    console.error(`[Apify] ${auctionSite} scraping error:`, error)
    return []
  }
}
