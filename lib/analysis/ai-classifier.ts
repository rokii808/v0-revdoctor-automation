import type { VehicleListing } from "../scrapers"

interface AIClassification {
  verdict: "HEALTHY" | "AVOID"
  minor_fault_type: "Battery" | "Tyre" | "Service" | "MOT" | "Keys" | "Body" | "Mechanical" | "Electrical" | "Other" | "None"
  reason: string
  risk_score: number // 0-100
  confidence: number // 0-100
  repair_cost_estimate: number
  profit_potential: number
}

interface ClassificationResult extends VehicleListing {
  ai_classification: AIClassification
  classified_at: string
}

/**
 * Classify vehicles using OpenAI GPT-4
 * Processes vehicles in batches for efficiency
 */
export async function classifyVehiclesWithAI(
  vehicles: VehicleListing[]
): Promise<ClassificationResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured")
  }

  console.log(`[AI Classifier] Processing ${vehicles.length} vehicles`)

  const results: ClassificationResult[] = []
  const BATCH_SIZE = 10 // Process 10 cars at a time
  const batches = chunkArray(vehicles, BATCH_SIZE)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`[AI Classifier] Processing batch ${i + 1}/${batches.length} (${batch.length} vehicles)`)

    try {
      const batchResults = await Promise.allSettled(
        batch.map(vehicle => classifySingleVehicle(vehicle))
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
          results.push(createFallbackClassification(batch[j]))
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
        results.push(createFallbackClassification(vehicle))
      })
    }
  }

  console.log(
    `[AI Classifier] Completed: ${results.length}/${vehicles.length} vehicles classified`
  )

  return results
}

/**
 * Classify a single vehicle using OpenAI
 */
async function classifySingleVehicle(
  vehicle: VehicleListing
): Promise<ClassificationResult> {
  const { generateText } = await import("ai")
  const { openai } = await import("@ai-sdk/openai")

  const prompt = `You are RevDoctor, an expert car auction analyst for UK dealers. Analyze this vehicle listing and determine if it's a good investment.

VEHICLE DETAILS:
- Make/Model: ${vehicle.make} ${vehicle.model}
- Year: ${vehicle.year}
- Price: £${vehicle.price.toLocaleString()}
- Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + " miles" : "Unknown"}
- Condition: ${vehicle.condition}
- Auction Site: ${vehicle.auction_site}

ANALYSIS CRITERIA:
1. Look for signs of major mechanical issues (engine, transmission, structural damage)
2. Minor issues are acceptable (tyres, battery, service, MOT, keys, cosmetic)
3. Consider value for money (price vs year/mileage)
4. UK market context (right-hand drive, MOT requirements)

TASK: Classify this vehicle as either:
- HEALTHY: Minor/easily fixable issues only, good investment potential
- AVOID: Major mechanical issues, structural damage, or poor value

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "HEALTHY" or "AVOID",
  "minor_fault_type": "Battery|Tyre|Service|MOT|Keys|Body|Mechanical|Electrical|Other|None",
  "reason": "Brief explanation (max 50 words)",
  "risk_score": 0-100 (0=very safe, 100=very risky),
  "confidence": 0-100 (how confident you are),
  "repair_cost_estimate": estimated repair cost in pounds,
  "profit_potential": estimated profit margin in pounds
}`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"), // Fast and cost-effective
      prompt,
      temperature: 0.3, // Lower temperature for consistent output
      maxTokens: 300,
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    const classification = JSON.parse(jsonMatch[0]) as AIClassification

    // Validate response structure
    if (!classification.verdict || !classification.reason) {
      throw new Error("Invalid AI response structure")
    }

    // Ensure verdict is exactly "HEALTHY" or "AVOID"
    classification.verdict = classification.verdict.toUpperCase() as "HEALTHY" | "AVOID"

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
 * Fallback to simple heuristic if AI fails
 */
function createFallbackClassification(vehicle: VehicleListing): ClassificationResult {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicle.year
  const mileage = vehicle.mileage || 0

  let riskScore = 50 // Start at medium risk
  let verdict: "HEALTHY" | "AVOID" = "HEALTHY"
  let reason = "Heuristic analysis (AI unavailable). "

  // Age factor
  if (age > 15) {
    riskScore += 20
    reason += "Very old vehicle. "
  } else if (age > 10) {
    riskScore += 10
    reason += "Older vehicle. "
  } else if (age < 3) {
    riskScore -= 10
    reason += "Nearly new. "
  }

  // Mileage factor
  if (mileage > 150000) {
    riskScore += 20
    reason += "Very high mileage. "
  } else if (mileage > 100000) {
    riskScore += 10
    reason += "High mileage. "
  } else if (mileage < 30000) {
    riskScore -= 10
    reason += "Low mileage. "
  }

  // Condition factor (parse from description)
  const conditionLower = vehicle.condition.toLowerCase()
  if (conditionLower.includes("damaged") || conditionLower.includes("accident")) {
    riskScore += 30
    reason += "Damage reported. "
  } else if (conditionLower.includes("poor")) {
    riskScore += 20
    reason += "Poor condition. "
  } else if (conditionLower.includes("excellent") || conditionLower.includes("mint")) {
    riskScore -= 15
    reason += "Excellent condition. "
  }

  // Price sanity check
  if (vehicle.price < 1000) {
    riskScore += 25
    reason += "Suspiciously low price. "
  } else if (vehicle.price > 50000) {
    riskScore += 15
    reason += "High-value vehicle, higher risk. "
  }

  // Clamp risk score
  riskScore = Math.max(0, Math.min(100, riskScore))

  // Determine verdict
  if (riskScore > 70) {
    verdict = "AVOID"
    reason = "High risk: " + reason
  }

  // Estimate repair cost based on risk
  const repairCost = Math.floor(riskScore * 50) // £50 per risk point

  // Estimate profit (15% margin minus risk-adjusted costs)
  const profitPotential = Math.max(
    0,
    Math.floor(vehicle.price * 0.15 - repairCost)
  )

  return {
    ...vehicle,
    ai_classification: {
      verdict,
      minor_fault_type: "Other",
      reason: reason.trim(),
      risk_score: riskScore,
      confidence: 60, // Lower confidence for heuristic
      repair_cost_estimate: repairCost,
      profit_potential: profitPotential,
    },
    classified_at: new Date().toISOString(),
  }
}

/**
 * Utility: Split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Utility: Sleep for ms
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get classification statistics
 */
export function getClassificationStats(results: ClassificationResult[]) {
  const total = results.length
  const healthy = results.filter(r => r.ai_classification.verdict === "HEALTHY").length
  const avoid = results.filter(r => r.ai_classification.verdict === "AVOID").length
  const avgRisk = results.reduce((sum, r) => sum + r.ai_classification.risk_score, 0) / total
  const avgConfidence =
    results.reduce((sum, r) => sum + r.ai_classification.confidence, 0) / total
  const totalProfitPotential = results
    .filter(r => r.ai_classification.verdict === "HEALTHY")
    .reduce((sum, r) => sum + r.ai_classification.profit_potential, 0)

  return {
    total,
    healthy,
    avoid,
    healthyPercentage: ((healthy / total) * 100).toFixed(1),
    avgRisk: avgRisk.toFixed(1),
    avgConfidence: avgConfidence.toFixed(1),
    totalProfitPotential: Math.floor(totalProfitPotential),
  }
}
