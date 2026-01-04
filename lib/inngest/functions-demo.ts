import { inngest } from "./client"
import { createMockScraper } from "../scrapers/mock-scraper"
import { classifyVehiclesWithAI } from "../analysis/ai-classifier"
import { sendDemoEmail } from "../workflow/email-digest-demo"
import type { VehicleListing } from "../scrapers/index"
import type { VehicleMatch } from "../workflow/preference-matcher"

/**
 * DEMO "SEE IT IN ACTION" WORKFLOW
 *
 * Fast demo workflow that shows what Revvdoctor does:
 * 1. Scrape 2 cars from one auction site (RAW2K for speed)
 * 2. Classify with OpenAI AI
 * 3. Send demo email to the provided email address
 *
 * No signup required - anyone can see it in action!
 * Execution time: ~2-3 minutes
 */
export const sendDemoAction = inngest.createFunction(
  {
    id: "send-demo-action",
    name: "See It in Action - Demo Email",
    retries: 2, // Retry twice if fails
  },
  { event: "demo/see-action" },
  async ({ event, step }) => {
    const startTime = Date.now()
    const { email } = event.data

    if (!email) {
      throw new Error("Email is required for demo")
    }

    console.log(`🎬 [Demo] Starting "See It in Action" for ${email}`)

    // STEP 1: Get sample vehicles - try REAL scraping first for authentic demo with live links
    const scrapedVehicles = await step.run("scrape-sample-vehicles", async () => {
      console.log("🕷️  [Demo] Attempting to scrape REAL vehicles from RAW2K...")

      // Try to scrape real vehicles first - this gives authentic demo with clickable links
      try {
        const { scrapeRAW2K } = await import("../scrapers/raw2k")
        const realVehicles = await scrapeRAW2K()

        if (realVehicles && realVehicles.length > 0) {
          // Successfully scraped real vehicles with live auction links!
          const shuffled = realVehicles.sort(() => Math.random() - 0.5)
          const sampleVehicles = shuffled.slice(0, 5)

          console.log(`✅ [Demo] Got ${sampleVehicles.length} REAL vehicles from RAW2K with live links!`)
          console.log(`🔗 [Demo] Sample URL: ${sampleVehicles[0]?.url}`)
          return sampleVehicles
        }
      } catch (err) {
        console.warn("⚠️  [Demo] Real scraping failed, falling back to mock data:", err)
      }

      // Fallback: Use mock scraper if real scraping fails
      console.log("🔄 [Demo] Using mock vehicles as fallback...")
      const mockVehicles = await createMockScraper("DEMO")
      const shuffled = mockVehicles.sort(() => Math.random() - 0.5)
      const sampleVehicles = shuffled.slice(0, 5)

      console.log(`✅ [Demo] Got ${sampleVehicles.length} mock vehicles`)
      return sampleVehicles
    })

    // STEP 2: Classify with AI
    const classifiedVehicles = await step.run("ai-classification", async () => {
      console.log(`🤖 [Demo] Classifying ${scrapedVehicles.length} vehicles with AI...`)

      try {
        const results = await classifyVehiclesWithAI(scrapedVehicles)

        // Filter for HEALTHY vehicles only
        const healthy = results.filter(v => v.ai_classification.verdict === "HEALTHY")

        console.log(`✅ [Demo] AI Classification: ${healthy.length} HEALTHY vehicles`)

        return healthy
      } catch (err) {
        console.error("❌ [Demo] AI classification failed:", err)
        // Fallback: return scraped vehicles with mock AI data
        return scrapedVehicles.map(v => ({
          ...v,
          ai_classification: {
            verdict: "HEALTHY" as const,
            minor_fault_type: "Body",
            reason: "Good condition vehicle with minor cosmetic issues",
            risk_score: 30,
            confidence: 85,
            repair_cost_estimate: 500,
            profit_potential: 2000,
          },
        }))
      }
    })

    // STEP 3: Select best 2 vehicles for demo
    const demoVehicles = await step.run("select-demo-vehicles", async () => {
      console.log("🎯 [Demo] Selecting best 2 vehicles for demo...")

      // Sort by AI confidence and profit potential
      const sorted = classifiedVehicles.sort((a, b) => {
        const scoreA = a.ai_classification.confidence + (a.ai_classification.profit_potential || 0) / 100
        const scoreB = b.ai_classification.confidence + (b.ai_classification.profit_potential || 0) / 100
        return scoreB - scoreA
      })

      // Take top 2
      const top2 = sorted.slice(0, 2)

      // Convert to VehicleMatch format with demo match score
      const matches: VehicleMatch[] = top2.map(vehicle => ({
        ...vehicle,
        match_score: calculateDemoMatchScore(vehicle),
        match_reasons: generateDemoMatchReasons(vehicle),
        dealer_id: "demo",
        dealer_name: "Demo User",
        classified_at: new Date().toISOString(),
      } as VehicleMatch))

      console.log(`✅ [Demo] Selected ${matches.length} vehicles for demo`)

      return matches
    })

    // STEP 4: Send demo email
    const emailResult = await step.run("send-demo-email", async () => {
      console.log(`📧 [Demo] Sending demo email to ${email}...`)

      try {
        const result = await sendDemoEmail({
          email,
          vehicles: demoVehicles,
        })

        if (result.success) {
          console.log(`✅ [Demo] Email sent successfully (ID: ${result.message_id})`)
        } else {
          console.error(`❌ [Demo] Email failed: ${result.error}`)
        }

        return result
      } catch (err) {
        console.error("❌ [Demo] Email sending failed:", err)
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    })

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2)
    console.log(`🎉 [Demo] Complete in ${duration} minutes`)

    return {
      success: emailResult.success,
      email,
      vehicles_shown: demoVehicles.length,
      duration_minutes: parseFloat(duration),
      message_id: emailResult.message_id,
      error: emailResult.error,
    }
  }
)

/**
 * Calculate demo match score based on AI analysis
 */
function calculateDemoMatchScore(vehicle: any): number {
  let score = 70 // Base score for demo

  const { ai_classification } = vehicle

  // Low risk = higher score
  if (ai_classification.risk_score < 30) {
    score += 15
  } else if (ai_classification.risk_score < 50) {
    score += 8
  }

  // High confidence = higher score
  if (ai_classification.confidence > 85) {
    score += 10
  } else if (ai_classification.confidence > 75) {
    score += 5
  }

  // Good profit = higher score
  if (ai_classification.profit_potential > 2000) {
    score += 10
  } else if (ai_classification.profit_potential > 1000) {
    score += 5
  }

  return Math.min(100, score)
}

/**
 * Generate demo match reasons
 */
function generateDemoMatchReasons(vehicle: any): string[] {
  const reasons: string[] = []
  const { ai_classification } = vehicle

  if (ai_classification.risk_score < 30) {
    reasons.push("Low risk score")
  }

  if (ai_classification.confidence > 85) {
    reasons.push("High AI confidence")
  }

  if (ai_classification.profit_potential > 1500) {
    reasons.push(`£${ai_classification.profit_potential.toLocaleString()} profit potential`)
  }

  if (ai_classification.minor_fault_type === "None" || ai_classification.minor_fault_type === "Battery" || ai_classification.minor_fault_type === "Tyre") {
    reasons.push("Minor or no faults")
  }

  if (vehicle.year >= 2018) {
    reasons.push("Recent model year")
  }

  // Add at least 3 reasons
  if (reasons.length < 3) {
    reasons.push("Good market value")
  }

  return reasons
}
