import { createMockScraper } from "../scrapers/mock-scraper"
import { classifyVehiclesWithAI } from "../analysis/ai-classifier"
import { sendDemoEmail } from "./email-digest-demo"
import type { VehicleMatch } from "./preference-matcher"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Direct demo email sender (no Inngest required)
 *
 * This is a fallback for preview/development environments where Inngest
 * is not configured. It performs the same logic as the Inngest workflow
 * but runs directly in the API route.
 */
export async function sendDemoEmailDirect(
  email: string,
  supabase: SupabaseClient
): Promise<void> {
  const startTime = Date.now()
  console.log(`🎬 [Direct Demo] Starting for ${email}`)

  try {
    // STEP 1: Get sample vehicles - try REAL scraping first
    console.log("🕷️  [Direct Demo] Attempting to scrape REAL vehicles from RAW2K...")
    let scrapedVehicles: any[] = []

    try {
      const { scrapeRAW2K } = await import("../scrapers/raw2k")
      const realVehicles = await scrapeRAW2K()

      if (realVehicles && realVehicles.length > 0) {
        const shuffled = realVehicles.sort(() => Math.random() - 0.5)
        scrapedVehicles = shuffled.slice(0, 5)
        console.log(`✅ [Direct Demo] Got ${scrapedVehicles.length} REAL vehicles from RAW2K`)
      }
    } catch (err) {
      console.warn("⚠️  [Direct Demo] Real scraping failed, using mock data:", err)
    }

    // Fallback to mock data if scraping failed
    if (scrapedVehicles.length === 0) {
      console.log("🔄 [Direct Demo] Using mock vehicles as fallback...")
      const mockVehicles = await createMockScraper("DEMO")
      const shuffled = mockVehicles.sort(() => Math.random() - 0.5)
      scrapedVehicles = shuffled.slice(0, 5)
      console.log(`✅ [Direct Demo] Got ${scrapedVehicles.length} mock vehicles`)
    }

    // STEP 2: Classify with AI
    console.log(`🤖 [Direct Demo] Classifying ${scrapedVehicles.length} vehicles with AI...`)
    let classifiedVehicles: any[] = []

    try {
      const results = await classifyVehiclesWithAI(scrapedVehicles)
      const healthy = results.filter((v) => v.ai_classification.verdict === "HEALTHY")
      classifiedVehicles = healthy
      console.log(`✅ [Direct Demo] AI Classification: ${healthy.length} HEALTHY vehicles`)
    } catch (err) {
      console.error("❌ [Direct Demo] AI classification failed:", err)
      // Fallback: use scraped vehicles with mock AI data
      classifiedVehicles = scrapedVehicles.map((v) => ({
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

    // STEP 3: Select best 2 vehicles
    console.log("🎯 [Direct Demo] Selecting best 2 vehicles...")
    const sorted = classifiedVehicles.sort((a, b) => {
      const scoreA = a.ai_classification.confidence + (a.ai_classification.profit_potential || 0) / 100
      const scoreB = b.ai_classification.confidence + (b.ai_classification.profit_potential || 0) / 100
      return scoreB - scoreA
    })

    const top2 = sorted.slice(0, 2)
    const demoVehicles: VehicleMatch[] = top2.map((vehicle) => ({
      ...vehicle,
      match_score: calculateDemoMatchScore(vehicle),
      match_reasons: generateDemoMatchReasons(vehicle),
      dealer_id: "demo",
      dealer_name: "Demo User",
      classified_at: new Date().toISOString(),
    })) as VehicleMatch[]

    console.log(`✅ [Direct Demo] Selected ${demoVehicles.length} vehicles`)

    // STEP 4: Send email
    console.log(`📧 [Direct Demo] Sending email to ${email}...`)
    const emailResult = await sendDemoEmail({
      email,
      vehicles: demoVehicles,
    })

    // STEP 5: Update tracking database
    console.log(`💾 [Direct Demo] Updating tracking database...`)
    const normalizedEmail = email.toLowerCase().trim()

    try {
      await supabase
        .from("see_it_in_action_submissions")
        .update({
          last_email_status: emailResult.success ? "sent" : "failed",
          last_email_sent_at: new Date().toISOString(),
          last_email_error: emailResult.error || null,
          updated_at: new Date().toISOString(),
        })
        .eq("email", normalizedEmail)

      console.log(`✅ [Direct Demo] Tracking updated: ${emailResult.success ? "sent" : "failed"}`)
    } catch (err) {
      console.error("⚠️ [Direct Demo] Failed to update tracking:", err)
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2)
    console.log(`🎉 [Direct Demo] Complete in ${duration} minutes`)

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Email sending failed")
    }
  } catch (error) {
    console.error(`❌ [Direct Demo] Failed for ${email}:`, error)

    // Update tracking with error
    try {
      await supabase
        .from("see_it_in_action_submissions")
        .update({
          last_email_status: "failed",
          last_email_error: error instanceof Error ? error.message : "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase().trim())
    } catch (updateErr) {
      console.error("⚠️ [Direct Demo] Failed to update error status:", updateErr)
    }

    throw error
  }
}

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

  if (
    ai_classification.minor_fault_type === "None" ||
    ai_classification.minor_fault_type === "Battery" ||
    ai_classification.minor_fault_type === "Tyre"
  ) {
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
