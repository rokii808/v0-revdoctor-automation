import type { ClassificationResult } from "../analysis/ai-classifier"

interface DealerPreferences {
  makes: string[]
  min_year: number
  max_year: number
  max_mileage: number
  max_bid: number
  locations: string[]
}

interface Dealer {
  id: string
  user_id: string
  email: string
  dealer_name: string
  subscription_status: string
  min_year?: number
  max_bid?: number
  prefs?: DealerPreferences
}

interface VehicleMatch extends ClassificationResult {
  match_score: number
  match_reasons: string[]
  dealer_id: string
  dealer_name: string
}

/**
 * Match classified vehicles to dealer preferences
 * Returns vehicles that meet dealer criteria with match scores
 */
export async function matchVehiclesToDealers(
  vehicles: ClassificationResult[],
  dealers: Dealer[]
): Promise<Map<string, VehicleMatch[]>> {
  console.log(`[Matcher] Matching ${vehicles.length} vehicles to ${dealers.length} dealers`)

  const dealerMatches = new Map<string, VehicleMatch[]>()

  // Only process HEALTHY vehicles
  const healthyVehicles = vehicles.filter(
    v => v.ai_classification.verdict === "HEALTHY"
  )

  console.log(`[Matcher] ${healthyVehicles.length} healthy vehicles to match`)

  for (const dealer of dealers) {
    const matches: VehicleMatch[] = []

    for (const vehicle of healthyVehicles) {
      const matchResult = checkVehicleMatch(vehicle, dealer)

      if (matchResult.matches) {
        matches.push({
          ...vehicle,
          match_score: matchResult.score,
          match_reasons: matchResult.reasons,
          dealer_id: dealer.id,
          dealer_name: dealer.dealer_name || dealer.email.split("@")[0],
        })
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score)

    dealerMatches.set(dealer.id, matches)

    console.log(
      `[Matcher] Dealer ${dealer.dealer_name}: ${matches.length} matches (avg score: ${
        matches.length > 0
          ? (matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length).toFixed(1)
          : 0
      })`
    )
  }

  return dealerMatches
}

/**
 * Check if a vehicle matches dealer preferences
 */
function checkVehicleMatch(
  vehicle: ClassificationResult,
  dealer: Dealer
): { matches: boolean; score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Get dealer preferences (from prefs JSONB or fallback to legacy columns)
  const prefs: DealerPreferences = dealer.prefs || {
    makes: [],
    min_year: dealer.min_year || 2015,
    max_year: new Date().getFullYear(),
    max_mileage: 100000,
    max_bid: dealer.max_bid || 50000,
    locations: [],
  }

  // HARD REQUIREMENTS (must pass to match)

  // 1. Year check
  if (vehicle.year < prefs.min_year) {
    return { matches: false, score: 0, reasons: ["Too old"] }
  }
  if (vehicle.year > prefs.max_year) {
    return { matches: false, score: 0, reasons: ["Too new"] }
  }

  // 2. Price check
  if (vehicle.price > prefs.max_bid) {
    return { matches: false, score: 0, reasons: ["Over budget"] }
  }

  // 3. Mileage check (if available)
  if (vehicle.mileage && vehicle.mileage > prefs.max_mileage) {
    return { matches: false, score: 0, reasons: ["Mileage too high"] }
  }

  // 4. Make preference (if specified)
  if (prefs.makes.length > 0) {
    const makeMatch = prefs.makes.some(
      prefMake => vehicle.make.toLowerCase() === prefMake.toLowerCase()
    )
    if (!makeMatch) {
      return { matches: false, score: 0, reasons: ["Make not in preferences"] }
    }
  }

  // 5. Location preference (if specified)
  // Note: auction_site doesn't directly map to location, but we can use it
  // In production, you'd need to extract location from listing data
  if (prefs.locations.length > 0) {
    // For now, we'll skip this check if location data isn't available
    // You can enhance this when you have proper location data in listings
  }

  // PASSED HARD REQUIREMENTS - Calculate match score (0-100)

  score = 50 // Base score for passing requirements

  // Score boost factors

  // 1. Low risk = higher score
  const riskScore = vehicle.ai_classification.risk_score
  if (riskScore < 20) {
    score += 20
    reasons.push("Very low risk")
  } else if (riskScore < 40) {
    score += 10
    reasons.push("Low risk")
  } else if (riskScore > 60) {
    score -= 10
    reasons.push("Medium-high risk")
  }

  // 2. High AI confidence = higher score
  const confidence = vehicle.ai_classification.confidence
  if (confidence > 90) {
    score += 10
    reasons.push("High AI confidence")
  } else if (confidence < 70) {
    score -= 5
  }

  // 3. Good profit potential
  const profit = vehicle.ai_classification.profit_potential
  if (profit > 2000) {
    score += 15
    reasons.push(`£${profit.toLocaleString()} profit potential`)
  } else if (profit > 1000) {
    score += 8
    reasons.push(`£${profit.toLocaleString()} profit potential`)
  }

  // 4. Price well below budget = higher score
  const priceRatio = vehicle.price / prefs.max_bid
  if (priceRatio < 0.5) {
    score += 10
    reasons.push("Well under budget")
  } else if (priceRatio < 0.7) {
    score += 5
  }

  // 5. Low mileage for year
  if (vehicle.mileage) {
    const avgMileagePerYear = 10000
    const expectedMileage = (new Date().getFullYear() - vehicle.year) * avgMileagePerYear
    if (vehicle.mileage < expectedMileage * 0.6) {
      score += 8
      reasons.push("Low mileage for year")
    }
  }

  // 6. Preferred make (extra points if in list)
  if (prefs.makes.length > 0 && prefs.makes.includes(vehicle.make)) {
    score += 5
    reasons.push("Preferred make")
  }

  // 7. Newer vehicle = slight boost
  const age = new Date().getFullYear() - vehicle.year
  if (age < 3) {
    score += 5
    reasons.push("Nearly new")
  }

  // 8. Minor fault type affects score
  const faultType = vehicle.ai_classification.minor_fault_type
  if (faultType === "None") {
    score += 10
    reasons.push("No faults detected")
  } else if (["Battery", "Tyre", "Keys"].includes(faultType)) {
    score += 5
    reasons.push(`Minor fault: ${faultType}`)
  } else if (["Mechanical", "Electrical"].includes(faultType)) {
    score -= 5
    reasons.push(`Caution: ${faultType} issue`)
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score))

  return {
    matches: true,
    score: Math.round(score),
    reasons,
  }
}

/**
 * Get top N matches for a dealer
 */
export function getTopMatches(
  dealerMatches: VehicleMatch[],
  limit: number = 10
): VehicleMatch[] {
  return dealerMatches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit)
}

/**
 * Get match statistics
 */
export function getMatchStats(allMatches: Map<string, VehicleMatch[]>) {
  let totalMatches = 0
  let totalDealersWithMatches = 0
  let highestMatchScore = 0
  let avgMatchScore = 0
  let totalScore = 0

  for (const [dealerId, matches] of allMatches.entries()) {
    if (matches.length > 0) {
      totalDealersWithMatches++
      totalMatches += matches.length

      for (const match of matches) {
        totalScore += match.match_score
        if (match.match_score > highestMatchScore) {
          highestMatchScore = match.match_score
        }
      }
    }
  }

  avgMatchScore = totalMatches > 0 ? totalScore / totalMatches : 0

  return {
    totalMatches,
    totalDealersWithMatches,
    avgMatchScore: avgMatchScore.toFixed(1),
    highestMatchScore,
    matchesPerDealer: totalDealersWithMatches > 0 ? (totalMatches / totalDealersWithMatches).toFixed(1) : "0",
  }
}
