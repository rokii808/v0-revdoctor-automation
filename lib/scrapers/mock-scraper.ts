import type { VehicleListing } from "./index"

/**
 * MOCK SCRAPER FOR TESTING
 *
 * Returns realistic vehicle data to test the full workflow:
 * - AI Classification
 * - Preference Matching
 * - Email Digests
 * - Database Storage
 *
 * Use this while waiting for real API access from auction sites.
 */

export async function createMockScraper(siteName: string = "MOCK"): Promise<VehicleListing[]> {
  console.log(`[${siteName}] Returning mock data for testing...`)

  const mockVehicles: VehicleListing[] = [
    // HEALTHY vehicles - should pass AI classification
    {
      listing_id: `${siteName}-001`,
      lot_number: "LOT-12345",
      make: "BMW",
      model: "3 Series",
      year: 2019,
      price: 18500,
      mileage: 42000,
      condition: "Good",
      auction_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      auction_site: siteName,
      url: "https://www.raw2k.co.uk/vehicle/BMW-3-Series-2019-12345",
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "https://images.unsplash.com/photo-1617531653520-bd4f49d82d1f?w=800",
      ],
    },
    {
      listing_id: `${siteName}-002`,
      lot_number: "LOT-12346",
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2020,
      price: 22900,
      mileage: 35000,
      condition: "Excellent",
      auction_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.bca.co.uk/vehicle/Mercedes-C-Class-2020-12346",
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      ],
    },
    {
      listing_id: `${siteName}-003`,
      lot_number: "LOT-12347",
      make: "Audi",
      model: "A4",
      year: 2018,
      price: 15800,
      mileage: 48000,
      condition: "Good",
      auction_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.autorola.co.uk/vehicle/Audi-A4-2018-12347",
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      ],
    },
    {
      listing_id: `${siteName}-004`,
      lot_number: "LOT-12348",
      make: "Volkswagen",
      model: "Golf",
      year: 2019,
      price: 13200,
      mileage: 38000,
      condition: "Very Good",
      auction_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.manheim.co.uk/vehicle/VW-Golf-2019-12348",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      ],
    },
    {
      listing_id: `${siteName}-005`,
      lot_number: "LOT-12349",
      make: "Ford",
      model: "Focus",
      year: 2020,
      price: 11500,
      mileage: 29000,
      condition: "Excellent",
      auction_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.raw2k.co.uk/vehicle/Ford-Focus-2020-12349",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      ],
    },

    // RISKY vehicles - should be flagged by AI
    {
      listing_id: `${siteName}-006`,
      lot_number: "LOT-12350",
      make: "BMW",
      model: "X5",
      year: 2015,
      price: 8500,
      mileage: 125000,
      condition: "Fair - High Mileage",
      auction_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.bca.co.uk/vehicle/BMW-X5-2015-12350",
      images: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
      ],
    },
    {
      listing_id: `${siteName}-007`,
      lot_number: "LOT-12351",
      make: "Land Rover",
      model: "Discovery",
      year: 2014,
      price: 7200,
      mileage: 98000,
      condition: "Requires Work",
      auction_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.autorola.co.uk/vehicle/Land-Rover-Discovery-2014-12351",
      images: [],
    },
    {
      listing_id: `${siteName}-008`,
      lot_number: "LOT-12352",
      make: "Audi",
      model: "A6",
      year: 2013,
      price: 6800,
      mileage: 110000,
      condition: "Poor - Multiple Issues",
      auction_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.manheim.co.uk/vehicle/Audi-A6-2013-12352",
      images: [],
    },

    // MODERATE vehicles - could go either way
    {
      listing_id: `${siteName}-009`,
      lot_number: "LOT-12353",
      make: "Nissan",
      model: "Qashqai",
      year: 2017,
      price: 10200,
      mileage: 62000,
      condition: "Good",
      auction_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.raw2k.co.uk/vehicle/Nissan-Qashqai-2017-12353",
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      ],
    },
    {
      listing_id: `${siteName}-010`,
      lot_number: "LOT-12354",
      make: "Toyota",
      model: "Corolla",
      year: 2018,
      price: 9800,
      mileage: 55000,
      condition: "Good",
      auction_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      auction_site: siteName,
      url: "https://www.bca.co.uk/vehicle/Toyota-Corolla-2018-12354",
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      ],
    },
  ]

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log(`[${siteName}] Returned ${mockVehicles.length} mock vehicles`)
  return mockVehicles
}

/**
 * Returns mock vehicles by site name
 */
export async function scrapeRAW2KMock(): Promise<VehicleListing[]> {
  return createMockScraper("RAW2K")
}

export async function scrapeBCAMock(): Promise<VehicleListing[]> {
  return createMockScraper("BCA")
}

export async function scrapeAutorolaMock(): Promise<VehicleListing[]> {
  return createMockScraper("Autorola")
}

export async function scrapeManheimMock(): Promise<VehicleListing[]> {
  return createMockScraper("Manheim")
}
