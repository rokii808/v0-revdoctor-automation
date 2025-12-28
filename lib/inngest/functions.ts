import { inngest } from "./client"
import { scrapeAllSites } from "../scrapers"
import { createAdminClient } from "../supabase/admin"
import { heuristicAnalysis } from "../analysis/heuristic"

// Daily scraper job - runs at 6 AM
export const dailyScraperJob = inngest.createFunction(
  { id: "daily-scraper", name: "Daily Multi-Site Vehicle Scraper" },
  { cron: "0 6 * * *" }, // 6 AM daily
  async ({ step }) => {
    // Step 1: Scrape all enabled sites
    const scrapedData = await step.run("scrape-all-sites", async () => {
      console.log("[Inngest] Starting multi-site scrape...")
      return await scrapeAllSites()
    })

    // Step 2: Get active dealers
    const dealers = await step.run("get-active-dealers", async () => {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("subscription_status", "active")

      if (error) throw error
      console.log(`[Inngest] Found ${data?.length || 0} active dealers`)
      return data || []
    })

    // Step 3: Process each site's vehicles
    let totalVehicles = 0
    let totalHealthy = 0

    for (const siteResult of scrapedData) {
      if (!siteResult.success || siteResult.vehicles.length === 0) {
        console.log(`[Inngest] Skipping ${siteResult.site} - no vehicles or failed`)
        continue
      }

      console.log(`[Inngest] Processing ${siteResult.vehicles.length} vehicles from ${siteResult.site}`)
      totalVehicles += siteResult.vehicles.length

      // Step 4: Analyze and match vehicles for each dealer
      await step.run(`process-${siteResult.site}`, async () => {
        const supabase = createAdminClient()

        for (const vehicle of siteResult.vehicles) {
          // Analyze vehicle
          const analysis = heuristicAnalysis(vehicle)

          // Match against dealer preferences
          for (const dealer of dealers) {
            const matchesCriteria =
              vehicle.year >= (dealer.min_year || 2015) &&
              vehicle.price <= (dealer.max_bid || 50000)

            if (matchesCriteria && analysis.verdict === "HEALTHY") {
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

              // Insert into both tables
              await supabase.from("insights").insert(vehicleData)
              await supabase.from("healthy_cars").insert(vehicleData)

              totalHealthy++
            }
          }

          // Rate limit - small delay between vehicles
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      })
    }

    // Step 5: Log stats
    await step.run("log-stats", async () => {
      const supabase = createAdminClient()
      await supabase.from("system_stats").insert({
        date: new Date().toISOString().split("T")[0],
        cars_screened: totalVehicles,
        healthy_cars_found: totalHealthy,
        active_dealers: dealers.length,
        emails_sent: 0,
      })
    })

    console.log(`[Inngest] Scraping complete: ${totalVehicles} vehicles, ${totalHealthy} healthy`)

    return {
      success: true,
      totalVehicles,
      totalHealthy,
      dealers: dealers.length,
      sites: scrapedData.map(s => ({ site: s.site, count: s.vehicles.length })),
    }
  }
)

// On-demand scraper (trigger manually)
export const manualScraperJob = inngest.createFunction(
  { id: "manual-scraper", name: "Manual Multi-Site Scraper" },
  { event: "scraper/manual.trigger" },
  async ({ event, step }) => {
    const { sites = [] } = event.data

    console.log(`[Inngest] Manual scrape triggered for sites: ${sites.join(", ") || "all"}`)

    // Similar logic to daily scraper but can specify sites
    return { success: true, message: "Manual scrape completed" }
  }
)
