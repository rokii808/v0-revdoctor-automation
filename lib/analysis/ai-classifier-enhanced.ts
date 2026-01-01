/**
 * ENHANCED AI VEHICLE CLASSIFIER FOR REVVDOCTOR
 *
 * This classifier has strict role definition, checkpoints, and quality guardrails
 * to ensure only the best leads reach dealers while matching their preferences.
 */

import type { VehicleListing } from "../scrapers"
import type { Dealer } from "../types"

interface AIClassification {
  verdict: "HEALTHY" | "AVOID"
  minor_fault_type: "Battery" | "Tyre" | "Service" | "MOT" | "Keys" | "Body" | "Mechanical" | "Electrical" | "Other" | "None"
  reason: string
  risk_score: number // 0-100
  confidence: number // 0-100
  repair_cost_estimate: number
  profit_potential: number

  // Enhanced fields for quality control
  checkpoint_passed: boolean
  preference_match_score: number // 0-100
  quality_flags: string[]
}

export interface ClassificationResult extends VehicleListing {
  ai_classification: AIClassification
  classified_at: string
}

/**
 * AI AGENT ROLE DEFINITION
 *
 * Role: RevvDoctor AI Vehicle Analyst
 * Task: Find vehicles with minimal damage that match dealer preferences
 * Objective: Maximize dealer profit while minimizing risk
 *
 * Constraints:
 * - MUST reject vehicles with major mechanical issues
 * - MUST validate against dealer preferences
 * - MUST provide clear reasoning for decisions
 * - MUST maintain confidence threshold >70%
 *
 * Guardrails:
 * - Multi-checkpoint validation system
 * - Preference matching score
 * - Quality flag system
 * - Automatic fallback for low confidence
 *
 * Capabilities:
 * - Differentiate between minor cosmetic issues and major problems
 * - Calculate profit potential based on UK market data
 * - Match vehicles to dealer budgets and preferences
 * - Identify hidden red flags in condition reports
 */

const AGENT_SYSTEM_PROMPT = `You are RevvDoctor AI, an expert UK car auction analyst with 20 years of experience.

YOUR ROLE:
- Help UK car dealers find profitable vehicles with minimal risk
- Your analyses directly impact dealer profits and customer satisfaction
- You are the first line of defense against bad investments

YOUR MISSION:
Find vehicles that have the LEAST damage while matching the dealer's specific preferences.
Every car you recommend MUST be a vehicle the dealer would be happy to purchase and resell.

CRITICAL CONSTRAINTS:
1. REJECT any vehicle with major mechanical issues (engine, transmission, suspension, structural)
2. ACCEPT vehicles with minor, easily fixable issues (tyres, battery, service, cosmetic)
3. ONLY recommend vehicles that match the dealer's budget and preferences
4. BE HONEST - if you're not confident, mark it as AVOID
5. THINK LIKE A DEALER - would YOU buy this car to resell?

CHECKPOINT SYSTEM:
Before classifying as HEALTHY, verify ALL checkpoints:
✓ Checkpoint 1: No major mechanical damage
✓ Checkpoint 2: Within dealer's budget range
✓ Checkpoint 3: Matches dealer's make/model preferences (if specified)
✓ Checkpoint 4: Reasonable mileage for year
✓ Checkpoint 5: Clear profit margin available
✓ Checkpoint 6: No hidden red flags in condition notes

If ANY checkpoint fails, classify as AVOID.

QUALITY GUARDRAILS:
- Confidence <70%? → AVOID (better safe than sorry)
- Price <£1000? → AVOID (too risky)
- Salvage/Cat S/Cat N? → AVOID (structural damage)
- "Spares or repair"? → AVOID (not driveable)
- Excessive rust/corrosion? → AVOID (expensive to fix)

YOUR CAPABILITIES:
1. Differentiate between minor issues (tyres, battery) and major problems (engine, gearbox)
2. Identify excellent leads: low mileage, good condition, strong resale potential
3. Spot bad leads: hidden damage, overpriced, high risk
4. Calculate realistic profit potential for UK market
5. Match vehicles to dealer's specific requirements

REMEMBER:
- One bad recommendation can cost a dealer £5,000+ in losses
- One excellent recommendation can generate £3,000+ in profit
- Your accuracy directly affects dealer trust and business success
- When in doubt, be conservative - AVOID is better than a bad purchase`

/**
 * Classify vehicles with enhanced AI analysis and checkpoints
 */
export async function classifyVehiclesWithAI(
  vehicles: VehicleListing[],
  dealer?: Dealer
): Promise<ClassificationResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured")
  }

  console.log(`[AI Classifier] Processing ${vehicles.length} vehicles`)
  console.log(`[AI Classifier] Dealer preferences:`, {
    name: dealer?.dealer_name,
    budget: dealer?.prefs?.max_bid,
    makes: dealer?.prefs?.makes?.slice(0, 3),
  })

  const results: ClassificationResult[] = []
  const BATCH_SIZE = 10 // Process 10 cars at a time
  const batches = chunkArray(vehicles, BATCH_SIZE)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`[AI Classifier] Processing batch ${i + 1}/${batches.length} (${batch.length} vehicles)`)

    try {
      const batchResults = await Promise.allSettled(
        batch.map(vehicle => classifySingleVehicleEnhanced(vehicle, dealer))
      )

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j]
        if (result.status === "fulfilled") {
          results.push(result.value)
        } else {
          console.error(
            `[AI Classifier] Failed to classify ${batch[j].make} ${batch[j].model}:`,
            result.reason
          )
          // Fallback to heuristic for failed classifications
          results.push(createFallbackClassification(batch[j], dealer))
        }
      }

      // Rate limiting: wait between batches
      if (i < batches.length - 1) {
        await sleep(1000) // 1 second between batches
      }
    } catch (error) {
      console.error(`[AI Classifier] Batch ${i + 1} failed:`, error)
      // Add fallback for entire batch
      batch.forEach(vehicle => {
        results.push(createFallbackClassification(vehicle, dealer))
      })
    }
  }

  // Quality statistics
  const stats = getClassificationStats(results)
  console.log(`[AI Classifier] Classification complete:`)
  console.log(`  ✅ HEALTHY: ${stats.healthy} (${stats.healthyPercentage}%)`)
  console.log(`  ❌ AVOID: ${stats.avoid}`)
  console.log(`  📊 Avg Risk: ${stats.avgRisk}/100`)
  console.log(`  💰 Total Profit Potential: £${stats.totalProfitPotential.toLocaleString()}`)

  return results
}

/**
 * Enhanced classification with checkpoints and guardrails
 */
async function classifySingleVehicleEnhanced(
  vehicle: VehicleListing,
  dealer?: Dealer
): Promise<ClassificationResult> {
  const { generateText } = await import("ai")
  const { openai } = await import("@ai-sdk/openai")

  // Build dealer context
  const dealerContext = dealer ? `
DEALER PREFERENCES:
- Max Budget: £${dealer.prefs?.max_bid || 50000}
- Preferred Makes: ${dealer.prefs?.makes?.join(", ") || "Any"}
- Max Mileage: ${dealer.prefs?.max_mileage || 100000} miles
- Min Year: ${dealer.prefs?.min_year || 2010}
` : "No specific preferences (dealer not provided)"

  const prompt = `${AGENT_SYSTEM_PROMPT}

${dealerContext}

VEHICLE TO ANALYZE:
- Make/Model: ${vehicle.make} ${vehicle.model}
- Year: ${vehicle.year}
- Price: £${vehicle.price.toLocaleString()}
- Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + " miles" : "Unknown"}
- Condition: ${vehicle.condition}
- Auction Site: ${vehicle.auction_site}
- Listing URL: ${vehicle.url}

CHECKPOINT VALIDATION:
Run through ALL 6 checkpoints systematically:
1. No major mechanical damage? (YES/NO)
2. Within dealer's budget (max £${dealer?.prefs?.max_bid || 50000})? (YES/NO)
3. Matches preferences (Makes: ${dealer?.prefs?.makes?.join(", ") || "Any"})? (YES/NO)
4. Reasonable mileage for year ${vehicle.year}? (YES/NO)
5. Clear profit margin (>£1000) possible? (YES/NO)
6. No hidden red flags? (YES/NO)

If ALL checkpoints pass → HEALTHY
If ANY checkpoint fails → AVOID

Respond with valid JSON:
{
  "verdict": "HEALTHY" or "AVOID",
  "minor_fault_type": "Battery|Tyre|Service|MOT|Keys|Body|Mechanical|Electrical|Other|None",
  "reason": "Clear explanation of your decision (max 100 words)",
  "risk_score": 0-100,
  "confidence": 0-100,
  "repair_cost_estimate": estimated cost in GBP,
  "profit_potential": estimated profit in GBP,
  "checkpoint_passed": true if all checkpoints passed,
  "preference_match_score": 0-100 (how well it matches dealer prefs),
  "quality_flags": ["flag1", "flag2"] array of any concerns
}`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"), // Use GPT-4 for better reasoning
      prompt,
      temperature: 0.2, // Very low temperature for consistency
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    const classification = JSON.parse(jsonMatch[0]) as AIClassification

    // Validation and guardrails
    if (!classification.verdict || !classification.reason) {
      throw new Error("Invalid AI response structure")
    }

    // Enforce confidence threshold
    if (classification.confidence < 70 && classification.verdict === "HEALTHY") {
      console.warn(`[AI Classifier] Low confidence (${classification.confidence}%), changing HEALTHY to AVOID for safety`)
      classification.verdict = "AVOID"
      classification.reason = `Low AI confidence (${classification.confidence}%). ` + classification.reason
      classification.quality_flags = [...(classification.quality_flags || []), "low_confidence"]
    }

    // Enforce checkpoint requirement
    if (!classification.checkpoint_passed && classification.verdict === "HEALTHY") {
      console.warn(`[AI Classifier] Checkpoints failed but marked HEALTHY, overriding to AVOID`)
      classification.verdict = "AVOID"
      classification.reason = "Failed checkpoint validation. " + classification.reason
    }

    // Normalize verdict
    classification.verdict = classification.verdict.toUpperCase() as "HEALTHY" | "AVOID"

    console.log(`[AI Classifier] ${vehicle.make} ${vehicle.model}: ${classification.verdict} (confidence: ${classification.confidence}%, match: ${classification.preference_match_score}%)`)

    return {
      ...vehicle,
      ai_classification: classification,
      classified_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`[AI Classifier] Error processing ${vehicle.make} ${vehicle.model}:`, error)
    throw error
  }
}

/**
 * Fallback heuristic with dealer preferences
 */
function createFallbackClassification(vehicle: VehicleListing, dealer?: Dealer): ClassificationResult {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicle.year
  const mileage = vehicle.mileage || 0

  let riskScore = 50
  let verdict: "HEALTHY" | "AVOID" = "HEALTHY"
  let reason = "Heuristic analysis (AI unavailable). "
  let preferenceMatchScore = 100
  const qualityFlags: string[] = []

  // Checkpoint 1: No major damage
  const conditionLower = vehicle.condition.toLowerCase()
  if (conditionLower.includes("damaged") || conditionLower.includes("accident") ||
      conditionLower.includes("salvage") || conditionLower.includes("cat s") ||
      conditionLower.includes("cat n")) {
    riskScore += 40
    verdict = "AVOID"
    reason += "Major damage detected. "
    qualityFlags.push("major_damage")
  }

  // Checkpoint 2: Budget check
  if (dealer) {
    if (vehicle.price > (dealer.prefs?.max_bid || 50000)) {
      verdict = "AVOID"
      reason += "Exceeds dealer budget. "
      qualityFlags.push("exceeds_budget")
    }
  }

  // Checkpoint 3: Make preference
  if (dealer?.prefs?.makes && dealer.prefs.makes.length > 0) {
    if (!dealer.prefs.makes.includes(vehicle.make)) {
      preferenceMatchScore -= 50
      qualityFlags.push("make_mismatch")
    }
  }

  // Checkpoint 4: Mileage check
  if (mileage > (dealer?.prefs?.max_mileage || 100000)) {
    riskScore += 20
    verdict = "AVOID"
    reason += "Exceeds max mileage. "
    qualityFlags.push("high_mileage")
  }

  // Age factor
  if (age > 15) {
    riskScore += 20
    qualityFlags.push("very_old")
  } else if (age < 3) {
    riskScore -= 10
  }

  // Checkpoint 5: Profit potential
  const estimatedRepairCost = Math.floor(riskScore * 50)
  const profitPotential = Math.max(0, Math.floor(vehicle.price * 0.15 - estimatedRepairCost))

  if (profitPotential < 1000) {
    verdict = "AVOID"
    reason += "Insufficient profit margin. "
    qualityFlags.push("low_profit")
  }

  // Checkpoint 6: Price sanity
  if (vehicle.price < 1000) {
    verdict = "AVOID"
    reason += "Suspiciously low price. "
    qualityFlags.push("too_cheap")
  }

  riskScore = Math.max(0, Math.min(100, riskScore))

  if (riskScore > 70) {
    verdict = "AVOID"
  }

  const checkpointPassed = verdict === "HEALTHY" && qualityFlags.length === 0

  return {
    ...vehicle,
    ai_classification: {
      verdict,
      minor_fault_type: "Other",
      reason: reason.trim(),
      risk_score: riskScore,
      confidence: 60, // Lower confidence for heuristic
      repair_cost_estimate: estimatedRepairCost,
      profit_potential: profitPotential,
      checkpoint_passed: checkpointPassed,
      preference_match_score: preferenceMatchScore,
      quality_flags: qualityFlags,
    },
    classified_at: new Date().toISOString(),
  }
}

// Utility functions
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getClassificationStats(results: ClassificationResult[]) {
  const total = results.length
  const healthy = results.filter(r => r.ai_classification.verdict === "HEALTHY").length
  const avoid = results.filter(r => r.ai_classification.verdict === "AVOID").length
  const avgRisk = total > 0 ? results.reduce((sum, r) => sum + r.ai_classification.risk_score, 0) / total : 0
  const avgConfidence = total > 0 ? results.reduce((sum, r) => sum + r.ai_classification.confidence, 0) / total : 0
  const totalProfitPotential = results
    .filter(r => r.ai_classification.verdict === "HEALTHY")
    .reduce((sum, r) => sum + r.ai_classification.profit_potential, 0)

  return {
    total,
    healthy,
    avoid,
    healthyPercentage: total > 0 ? ((healthy / total) * 100).toFixed(1) : "0.0",
    avgRisk: avgRisk.toFixed(1),
    avgConfidence: avgConfidence.toFixed(1),
    totalProfitPotential: Math.floor(totalProfitPotential),
  }
}
