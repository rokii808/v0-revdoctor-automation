/**
 * Hot Deal Detection System
 *
 * Analyzes vehicle matches to identify "hot deals" that deserve instant alerts
 * Based on multiple factors: profit potential, risk score, match score, urgency
 */

export interface HotDealCriteria {
  minProfitPotential?: number // Minimum profit to be considered "hot"
  maxRiskScore?: number // Maximum risk score (lower is better)
  minFinalScore?: number // Minimum personalized match score
  minPersonalizationBoost?: number // Minimum boost from personalization
  urgencyFactors?: {
    newListing?: boolean // Just listed (within last hour)
    priceDrop?: boolean // Recent price reduction
    endingSoon?: boolean // Auction ending soon
  }
}

export interface HotDealResult {
  isHotDeal: boolean
  score: number // 0-100, how "hot" this deal is
  reasons: string[]
  urgency: "CRITICAL" | "HIGH" | "MEDIUM"
  shouldNotify: boolean
}

const DEFAULT_CRITERIA: HotDealCriteria = {
  minProfitPotential: 2000, // £2000+ profit
  maxRiskScore: 30, // Risk score <= 30
  minFinalScore: 80, // Match score >= 80
  minPersonalizationBoost: 10, // At least +10 from personalization
}

/**
 * Analyze a vehicle match to determine if it's a "hot deal"
 */
export function detectHotDeal(
  match: any,
  criteria: HotDealCriteria = DEFAULT_CRITERIA
): HotDealResult {
  const reasons: string[] = []
  let score = 0

  // Factor 1: Profit Potential (0-30 points)
  const profit = match.profit_estimate || match.ai_classification?.profit_potential || 0
  if (profit >= (criteria.minProfitPotential || 2000)) {
    const profitPoints = Math.min(30, Math.floor(profit / 200))
    score += profitPoints
    reasons.push(`£${profit.toLocaleString()} profit potential`)
  }

  // Factor 2: Low Risk (0-25 points)
  const risk = match.risk || match.ai_classification?.risk_score || 100
  if (risk <= (criteria.maxRiskScore || 30)) {
    const riskPoints = Math.floor(((criteria.maxRiskScore || 30) - risk) / 1.2)
    score += riskPoints
    reasons.push(`Low risk score (${risk}/100)`)
  }

  // Factor 3: High Match Score (0-20 points)
  const finalScore = match.final_score || match.match_score || 0
  if (finalScore >= (criteria.minFinalScore || 80)) {
    const matchPoints = Math.min(20, finalScore - 80)
    score += matchPoints
    reasons.push(`Excellent match (${finalScore}/100)`)
  }

  // Factor 4: Strong Personalization Boost (0-15 points)
  const boost = match.personalization_boost || 0
  if (boost >= (criteria.minPersonalizationBoost || 10)) {
    const boostPoints = Math.min(15, boost)
    score += boostPoints
    reasons.push(`Personalized for you (+${boost} boost)`)
  }

  // Factor 5: Urgency Factors (0-10 points)
  const createdAt = new Date(match.created_at)
  const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

  if (hoursSinceCreated < 1) {
    score += 10
    reasons.push("Newly listed")
  } else if (hoursSinceCreated < 6) {
    score += 5
    reasons.push("Recently listed")
  }

  // Determine urgency level
  let urgency: "CRITICAL" | "HIGH" | "MEDIUM"
  if (score >= 85) {
    urgency = "CRITICAL"
  } else if (score >= 70) {
    urgency = "HIGH"
  } else {
    urgency = "MEDIUM"
  }

  // Should notify if score is high enough and meets basic criteria
  const shouldNotify =
    score >= 70 &&
    profit >= (criteria.minProfitPotential || 2000) &&
    risk <= (criteria.maxRiskScore || 30)

  return {
    isHotDeal: shouldNotify,
    score,
    reasons,
    urgency,
    shouldNotify,
  }
}

/**
 * Batch process multiple matches to find hot deals
 */
export function findHotDeals(
  matches: any[],
  criteria: HotDealCriteria = DEFAULT_CRITERIA
): Array<{ match: any; hotDeal: HotDealResult }> {
  const hotDeals: Array<{ match: any; hotDeal: HotDealResult }> = []

  for (const match of matches) {
    const hotDealResult = detectHotDeal(match, criteria)

    if (hotDealResult.shouldNotify) {
      hotDeals.push({
        match,
        hotDeal: hotDealResult,
      })
    }
  }

  // Sort by hot deal score (highest first)
  hotDeals.sort((a, b) => b.hotDeal.score - a.hotDeal.score)

  return hotDeals
}

/**
 * Get dealer's hot deal preferences from database
 */
export async function getDealerHotDealPreferences(
  dealerId: string,
  supabase: any
): Promise<HotDealCriteria> {
  const { data } = await supabase
    .from("dealer_preferences")
    .select("hot_deal_criteria")
    .eq("dealer_id", dealerId)
    .single()

  if (data?.hot_deal_criteria) {
    return {
      ...DEFAULT_CRITERIA,
      ...data.hot_deal_criteria,
    }
  }

  return DEFAULT_CRITERIA
}

/**
 * Format hot deal for notification
 */
export function formatHotDealNotification(match: any, hotDeal: HotDealResult): {
  title: string
  message: string
  priority: "critical" | "high" | "normal"
} {
  const vehicle = `${match.year} ${match.make} ${match.model}`
  const price = `£${match.price?.toLocaleString() || "N/A"}`

  let title: string
  if (hotDeal.urgency === "CRITICAL") {
    title = `🔥 URGENT: ${vehicle}`
  } else if (hotDeal.urgency === "HIGH") {
    title = `⚡ Hot Deal: ${vehicle}`
  } else {
    title = `💎 Great Find: ${vehicle}`
  }

  const message = `${price} • ${hotDeal.reasons.join(" • ")}`

  return {
    title,
    message,
    priority: hotDeal.urgency === "CRITICAL" ? "critical" : hotDeal.urgency === "HIGH" ? "high" : "normal",
  }
}
