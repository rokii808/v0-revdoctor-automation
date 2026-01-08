import { inngest } from "./client"
import { createClient } from "@supabase/supabase-js"
// HTML Scrapers (legacy - use only if no API access)
import { scrapeRAW2K } from "../scrapers/raw2k"
import { scrapeBCA } from "../scrapers/bca"
import { scrapeAutorola } from "../scrapers/autorola"
import { scrapeManheim } from "../scrapers/manheim"
// Mock Scrapers (for testing)
import {
  scrapeRAW2KMock,
  scrapeBCAMock,
  scrapeAutorolaMock,
  scrapeManheimMock,
} from "../scrapers/mock-scraper"
// API Scrapers (production - use when you have API keys)
import {
  scrapeRAW2KAPI,
  scrapeBCAAPI,
  scrapeAutorolaAPI,
  scrapeManheimAPI,
} from "../scrapers/api-scraper"
import { classifyVehiclesWithAI } from "../analysis/ai-classifier"
import { matchVehiclesToDealers, getMatchStats, type VehicleMatch } from "../workflow/preference-matcher"
import { sendDigestBatch, getDigestStats } from "../workflow/email-digest"
import { findHotDeals, getDealerHotDealPreferences } from "../notifications/hot-deal-detector"
import { sendHotDealAlert } from "../notifications/send-hot-deal-alert"
import type { VehicleListing } from "../scrapers/index"
import type { DigestRecipient } from "../workflow/email-digest"

// SCRAPER MODE: "mock" | "api" | "html"
// - "mock" = Use test data (recommended for initial testing)
// - "api" = Use auction site APIs (production, requires API keys)
// - "html" = Web scraping (fallback, less reliable)
const SCRAPER_MODE = (process.env.SCRAPER_MODE || "mock") as "mock" | "api" | "html"

// Initialize Supabase client with service role key for background jobs
// Use placeholders for build time, will fail at runtime if actually used without the keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key"

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * ENHANCED DAILY WORKFLOW
 *
 * This function replaces the basic workflow with full AI-powered analysis:
 *
 * 1. Scrape all auction sites in parallel
 * 2. Classify vehicles using OpenAI GPT-4 (batch processing)
 * 3. Match HEALTHY vehicles to dealer preferences
 * 4. Save matches to database
 * 5. Send personalized email digests
 * 6. Log statistics and metrics
 *
 * Runs daily at 6 AM UK time
 */
export const dailyScraperJobEnhanced = inngest.createFunction(
  {
    id: "daily-scraper-enhanced",
    name: "Daily Vehicle Scraper with AI Analysis",
    retries: 3,
  },
  { cron: "0 6 * * *" }, // 6 AM daily
  async ({ event, step }) => {
    const startTime = Date.now()
    console.log("🚀 [Enhanced Workflow] Starting daily scraper with AI analysis")

    // STEP 1: Load active dealers
    const dealers = await step.run("get-active-dealers", async () => {
      console.log("📋 [Step 1] Loading active dealers...")

      const { data, error } = await supabase
        .from("dealers")
        .select(`
          id,
          user_id,
          email,
          dealer_name,
          subscription_status,
          subscription_expires_at,
          selected_plan,
          min_year,
          max_bid,
          prefs
        `)
        .or("subscription_status.eq.active,subscription_status.eq.trial")

      if (error) {
        console.error("❌ [Step 1] Failed to load dealers:", error)
        throw new Error(`Failed to load dealers: ${error.message}`)
      }

      // Filter out expired trials
      const now = new Date()
      const activeDealers = data.filter(dealer => {
        if (dealer.subscription_status === "trial") {
          const expiresAt = new Date(dealer.subscription_expires_at)
          return expiresAt > now
        }
        return true
      })

      console.log(
        `✅ [Step 1] Loaded ${activeDealers.length} active dealers (${data.length - activeDealers.length} expired trials filtered)`
      )

      return activeDealers
    })

    if (dealers.length === 0) {
      console.log("⚠️  No active dealers found. Skipping workflow.")
      return {
        success: true,
        message: "No active dealers",
        dealers: 0,
        vehicles: 0,
        matches: 0,
        emails_sent: 0,
      }
    }

    // STEP 2: Scrape all auction sites in parallel
    const scrapedVehicles = await step.run("scrape-all-sites", async () => {
      console.log(`🕷️  [Step 2] Scraping all auction sites in parallel (mode: ${SCRAPER_MODE})...`)

      // Select scraper functions based on mode
      let scrapers: Array<() => Promise<VehicleListing[]>>

      switch (SCRAPER_MODE) {
        case "api":
          console.log("  Using API scrapers (production mode)")
          scrapers = [scrapeRAW2KAPI, scrapeBCAAPI, scrapeAutorolaAPI, scrapeManheimAPI]
          break
        case "html":
          console.log("  Using HTML scrapers (fallback mode)")
          scrapers = [scrapeRAW2K, scrapeBCA, scrapeAutorola, scrapeManheim]
          break
        case "mock":
        default:
          console.log("  Using MOCK scrapers (testing mode)")
          scrapers = [scrapeRAW2KMock, scrapeBCAMock, scrapeAutorolaMock, scrapeManheimMock]
          break
      }

      const scrapeResults = await Promise.allSettled(scrapers.map(fn => fn()))

      const allVehicles: VehicleListing[] = []
      const siteStats: Record<string, number> = {}

      scrapeResults.forEach((result, index) => {
        const sites = ["RAW2K", "BCA", "Autorola", "Manheim"]
        const siteName = sites[index]

        if (result.status === "fulfilled") {
          const vehicles = result.value
          allVehicles.push(...vehicles)
          siteStats[siteName] = vehicles.length
          console.log(`  ✅ ${siteName}: ${vehicles.length} vehicles`)
        } else {
          console.error(`  ❌ ${siteName}: ${result.reason}`)
          siteStats[siteName] = 0
        }
      })

      console.log(`✅ [Step 2] Scraped ${allVehicles.length} total vehicles`)
      console.log(`  Stats:`, siteStats)

      return allVehicles
    })

    if (scrapedVehicles.length === 0) {
      console.log("⚠️  No vehicles scraped. Skipping workflow.")
      return {
        success: true,
        message: "No vehicles found",
        dealers: dealers.length,
        vehicles: 0,
        matches: 0,
        emails_sent: 0,
      }
    }

    // STEP 3: Classify vehicles with OpenAI AI
    const classifiedVehicles = await step.run("ai-classification", async () => {
      console.log("🤖 [Step 3] Classifying vehicles with OpenAI AI...")
      console.log(`  Processing ${scrapedVehicles.length} vehicles in batches...`)

      try {
        const results = await classifyVehiclesWithAI(scrapedVehicles)

        const healthy = results.filter(v => v.ai_classification.verdict === "HEALTHY")
        const avoid = results.filter(v => v.ai_classification.verdict === "AVOID")

        console.log(`✅ [Step 3] AI Classification complete:`)
        console.log(`  ✓ HEALTHY: ${healthy.length}`)
        console.log(`  ✗ AVOID: ${avoid.length}`)
        console.log(
          `  Average confidence: ${(
            results.reduce((sum, v) => sum + v.ai_classification.confidence, 0) /
            results.length
          ).toFixed(1)}%`
        )

        return results
      } catch (err) {
        console.error("❌ [Step 3] AI classification failed:", err)
        throw new Error(`AI classification failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    })

    // STEP 4: Match vehicles to dealer preferences
    const dealerMatches = await step.run("match-preferences", async () => {
      console.log("🎯 [Step 4] Matching vehicles to dealer preferences...")

      try {
        const matches = await matchVehiclesToDealers(classifiedVehicles, dealers)
        const stats = getMatchStats(matches)

        console.log(`✅ [Step 4] Matching complete:`)
        console.log(`  Total matches: ${stats.totalMatches}`)
        console.log(`  Dealers with matches: ${stats.totalDealersWithMatches}/${dealers.length}`)
        console.log(`  Average match score: ${stats.avgMatchScore}`)
        console.log(`  Highest match score: ${stats.highestMatchScore}`)

        return matches
      } catch (err) {
        console.error("❌ [Step 4] Preference matching failed:", err)
        throw new Error(`Preference matching failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    })

    // STEP 5: Calculate personalization boosts
    const personalizedMatches = await step.run("calculate-personalization", async () => {
      console.log("✨ [Step 5] Calculating personalization boosts...")

      const enhanced: any[] = []
      let boostCount = 0
      let totalBoost = 0

      for (const [dealerId, matches] of (dealerMatches as Map<string, VehicleMatch[]>).entries()) {
        for (const match of matches) {
          // Calculate personalization boost using database function
          const { data: boostResult } = await supabase
            .rpc("calculate_personalization_boost", {
              p_dealer_id: dealerId,
              p_make: match.make,
              p_model: match.model,
              p_price: match.price || 0,
              p_year: match.year || 0,
              p_mileage: match.mileage || 0,
            })

          const personalizationBoost = boostResult || 0
          const baseScore = match.match_score
          const finalScore = baseScore + personalizationBoost

          if (personalizationBoost !== 0) {
            boostCount++
            totalBoost += personalizationBoost
          }

          enhanced.push({
            dealerId,
            match,
            baseScore,
            personalizationBoost,
            finalScore,
          })
        }
      }

      const avgBoost = boostCount > 0 ? (totalBoost / boostCount).toFixed(1) : 0
      console.log(`✅ [Step 5] Personalization complete:`)
      console.log(`  ${boostCount} matches received boost (avg: ${avgBoost} points)`)

      return enhanced
    })

    // STEP 6: Save matches to database
    await step.run("save-matches-to-db", async () => {
      console.log("💾 [Step 6] Saving matches to database...")

      const matchesToSave: any[] = []

      for (const item of personalizedMatches) {
        const { dealerId, match, baseScore, personalizationBoost, finalScore } = item

        matchesToSave.push({
          dealer_id: dealerId,
          make: match.make,
          model: match.model,
          year: match.year,
          price: match.price,
          mileage: match.mileage,
          auction_site: match.auction_site,
          listing_url: match.url,
          url: match.url,
          image_url: match.images?.[0] || null,
          verdict: match.ai_classification.verdict,
          risk: match.ai_classification.risk_score,
          reason: match.ai_classification.reason,

          // Personalized scoring
          base_score: baseScore,
          personalization_boost: personalizationBoost,
          final_score: finalScore,
          score_breakdown: {
            ai_risk: match.ai_classification.risk_score <= 30 ? 15 : (match.ai_classification.risk_score <= 50 ? 8 : 0),
            profit_potential: match.ai_classification.profit_potential > 2000 ? 15 : (match.ai_classification.profit_potential > 1000 ? 8 : 0),
            preference_match: baseScore - 70,
            personalization: personalizationBoost,
          },

          // Keep legacy fields for backward compatibility
          match_score: finalScore,
          match_reasons: match.match_reasons,

          created_at: new Date().toISOString(),
        })
      }

      if (matchesToSave.length > 0) {
        // Insert in batches to avoid payload size limits
        const BATCH_SIZE = 500
        let savedCount = 0

        for (let i = 0; i < matchesToSave.length; i += BATCH_SIZE) {
          const batch = matchesToSave.slice(i, i + BATCH_SIZE)
          const { error } = await supabase.from("vehicle_matches").insert(batch)

          if (error) {
            console.error(`❌ Failed to save batch ${i / BATCH_SIZE + 1}:`, error)
          } else {
            savedCount += batch.length
          }
        }

        console.log(`✅ [Step 6] Saved ${savedCount}/${matchesToSave.length} matches to database`)
      } else {
        console.log("⚠️  [Step 6] No matches to save")
      }

      return matchesToSave.length
    })

    // STEP 7: Detect and send hot deal alerts
    const hotDealAlerts = await step.run("send-hot-deal-alerts", async () => {
      console.log("🔥 [Step 7] Detecting hot deals and sending instant alerts...")

      let totalHotDeals = 0
      let alertsSent = 0
      let alertsFailed = 0

      for (const [dealerId, matches] of (dealerMatches as Map<string, VehicleMatch[]>).entries()) {
        const dealer = dealers.find(d => d.id === dealerId)
        if (!dealer) continue

        // Check dealer's instant alert preference
        const prefs = dealer.prefs || {}
        const instantAlertsEnabled = prefs.instant_alerts !== false // Default to true

        if (!instantAlertsEnabled) {
          console.log(`  ⏭️  Skipping ${dealer.email} - instant alerts disabled`)
          continue
        }

        // Get dealer's hot deal criteria
        const criteria = await getDealerHotDealPreferences(dealerId, supabase)

        // Find hot deals for this dealer
        const hotDeals = findHotDeals(matches as any[], criteria)

        if (hotDeals.length > 0) {
          console.log(`  🔥 Found ${hotDeals.length} hot deals for ${dealer.email}`)
          totalHotDeals += hotDeals.length

          // Send instant alert for top hot deal only (avoid spam)
          const topDeal = hotDeals[0]

          try {
            const result = await sendHotDealAlert({
              dealerEmail: dealer.email,
              dealerName: dealer.dealer_name || dealer.email.split("@")[0],
              vehicle: {
                year: topDeal.match.year,
                make: topDeal.match.make,
                model: topDeal.match.model,
                price: topDeal.match.price,
                mileage: topDeal.match.mileage,
                url: topDeal.match.url,
                imageUrl: topDeal.match.images?.[0],
                risk: topDeal.match.ai_classification?.risk_score || 50,
                profit: topDeal.match.ai_classification?.profit_potential || 0,
              },
              hotDeal: topDeal.hotDeal,
            })

            if (result.success) {
              alertsSent++
              console.log(`  ✅ Sent hot deal alert to ${dealer.email}`)
            } else {
              alertsFailed++
              console.error(`  ❌ Failed to send alert to ${dealer.email}:`, result.error)
            }
          } catch (err) {
            alertsFailed++
            console.error(`  ❌ Error sending alert to ${dealer.email}:`, err)
          }
        }
      }

      console.log(`✅ [Step 7] Hot deal alerts complete:`)
      console.log(`  Total hot deals found: ${totalHotDeals}`)
      console.log(`  Alerts sent: ${alertsSent}`)
      console.log(`  Alerts failed: ${alertsFailed}`)

      return {
        totalHotDeals,
        alertsSent,
        alertsFailed,
      }
    })

    // STEP 8: Send email digests
    const emailResults = await step.run("send-email-digests", async () => {
      console.log("📧 [Step 8] Sending email digests to dealers...")

      // Build digest recipients
      const recipients: DigestRecipient[] = []

      for (const [dealerId, matches] of (dealerMatches as Map<string, VehicleMatch[]>).entries()) {
        const dealer = dealers.find(d => d.id === dealerId)
        if (!dealer) continue

        // Only send if there are matches
        if (matches.length > 0) {
          recipients.push({
            dealer_id: dealerId,
            dealer_name: dealer.dealer_name || dealer.email.split("@")[0],
            email: dealer.email,
            matches: matches,
            subscription_plan: dealer.selected_plan || "basic",
          })
        }
      }

      console.log(`  Sending ${recipients.length} emails...`)

      try {
        const results = await sendDigestBatch(recipients)
        const stats = getDigestStats(results)

        console.log(`✅ [Step 8] Email digests sent:`)
        console.log(`  Sent: ${stats.sent}`)
        console.log(`  Failed: ${stats.failed}`)
        console.log(`  Skipped (no matches): ${stats.skipped}`)
        console.log(`  Success rate: ${stats.success_rate}%`)

        return results
      } catch (err) {
        console.error("❌ [Step 8] Email sending failed:", err)
        throw new Error(`Email sending failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    })

    // STEP 9: Log final statistics
    await step.run("log-statistics", async () => {
      console.log("📊 [Step 9] Logging workflow statistics...")

      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000 / 60).toFixed(2) // minutes

      const stats = {
        workflow_id: event.id,
        run_date: new Date().toISOString(),
        duration_minutes: parseFloat(duration),
        dealers_processed: dealers.length,
        vehicles_scraped: scrapedVehicles.length,
        vehicles_classified: classifiedVehicles.length,
        healthy_vehicles: classifiedVehicles.filter(
          v => v.ai_classification.verdict === "HEALTHY"
        ).length,
        total_matches: getMatchStats(dealerMatches as Map<string, VehicleMatch[]>).totalMatches,
        dealers_with_matches: getMatchStats(dealerMatches as Map<string, VehicleMatch[]>).totalDealersWithMatches,
        hot_deals_found: hotDealAlerts.totalHotDeals,
        hot_deal_alerts_sent: hotDealAlerts.alertsSent,
        emails_sent: getDigestStats(emailResults).sent,
        emails_failed: getDigestStats(emailResults).failed,
      }

      // Save to workflow_stats table (create if doesn't exist)
      const { error } = await supabase.from("workflow_stats").insert(stats)

      if (error) {
        console.warn("⚠️  Failed to save workflow stats:", error.message)
      }

      console.log(`✅ [Step 9] Workflow completed in ${duration} minutes`)
      console.log(`📊 Final stats:`, stats)

      return stats
    })

    console.log("🎉 [Enhanced Workflow] Complete!")

    return {
      success: true,
      dealers: dealers.length,
      vehicles: scrapedVehicles.length,
      classified: classifiedVehicles.length,
      matches: getMatchStats(dealerMatches as Map<string, VehicleMatch[]>).totalMatches,
      hot_deals: hotDealAlerts.totalHotDeals,
      hot_deal_alerts_sent: hotDealAlerts.alertsSent,
      emails_sent: getDigestStats(emailResults).sent,
      duration_minutes: ((Date.now() - startTime) / 1000 / 60).toFixed(2),
    }
  }
)

/**
 * MANUAL TRIGGER FUNCTION
 *
 * Allows admins to manually trigger the workflow for testing
 * or immediate re-run without waiting for cron schedule
 */
export const triggerManualScrape = inngest.createFunction(
  {
    id: "trigger-manual-scrape",
    name: "Manual Scraper Trigger",
  },
  { event: "scraper/manual-trigger" },
  async ({ event, step }) => {
    console.log("🔧 [Manual Trigger] Starting manual scraper run...")
    console.log("  Requested by:", event.data.admin_user_id || "Unknown")

    // Reuse the same workflow logic
    // @ts-expect-error - Accessing private fn property for code reuse
    return await dailyScraperJobEnhanced.fn({ event, step } as any)
  }
)

/**
 * HEALTH CHECK FUNCTION
 *
 * Validates all required environment variables and services
 * Run this before deploying to production
 */
export const healthCheck = inngest.createFunction(
  {
    id: "health-check",
    name: "Workflow Health Check",
  },
  { event: "workflow/health-check" },
  async ({ step }) => {
    console.log("🏥 [Health Check] Validating workflow configuration...")

    const checks = await step.run("run-health-checks", async () => {
      const results: Record<string, boolean> = {}

      // Check environment variables
      results["NEXT_PUBLIC_SUPABASE_URL"] = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      results["SUPABASE_SERVICE_ROLE_KEY"] = !!process.env.SUPABASE_SERVICE_ROLE_KEY
      results["OPENAI_API_KEY"] = !!process.env.OPENAI_API_KEY
      results["RESEND_API_KEY"] = !!process.env.RESEND_API_KEY

      // Check Supabase connection
      try {
        const { error } = await supabase.from("dealers").select("count").limit(1)
        results["Supabase Connection"] = !error
      } catch {
        results["Supabase Connection"] = false
      }

      // Check OpenAI API (just validate key format, don't make actual call)
      results["OpenAI Key Format"] = !!(
        process.env.OPENAI_API_KEY?.startsWith("sk-")
      )

      return results
    })

    const allHealthy = Object.values(checks).every(v => v === true)

    console.log("🏥 [Health Check] Results:", checks)
    console.log(allHealthy ? "✅ All checks passed!" : "❌ Some checks failed!")

    return {
      healthy: allHealthy,
      checks,
    }
  }
)
