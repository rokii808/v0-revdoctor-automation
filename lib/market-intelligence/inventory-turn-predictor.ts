/**
 * Inventory Turn Predictor - RevvDoctor's USP
 *
 * Predicts how fast a vehicle will sell in the dealer's local market
 * This is THE killer feature that keeps dealers coming back
 */

import { createClient } from "@/lib/supabase/server"

export interface MarketFitPrediction {
  // Core metrics (shown prominently)
  marketFitScore: number // 0-100, THE primary decision metric
  predictedDaysToSellMin: number
  predictedDaysToSellMax: number
  confidenceLevel: 'low' | 'medium' | 'high' | 'very_high'

  // Financial projections
  estimatedRetailPrice: number
  estimatedReconCost: number
  estimatedHoldingCostPerDay: number
  trueProfitEstimate: number // After ALL costs
  capitalRoiMonthly: number // % return per month

  // Market context
  localDemandLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  competitiveListingsCount: number
  pricePosition: 'below_market' | 'at_market' | 'above_market'
  seasonalityImpact: 'negative' | 'neutral' | 'positive'

  // Flags & insights
  isFastMover: boolean // <21 days
  isSlowMover: boolean // >60 days
  riskFlags: string[]
  opportunityFlags: string[]

  // Recommendation
  recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass'
  recommendationReason: string

  // Supporting data
  marketIntelligence?: MarketIntelligence
}

export interface MarketIntelligence {
  make: string
  model: string
  year: number
  avgDaysToSell: number
  medianDaysToSell: number
  activeListingsCount: number
  soldLast30Days: number
  avgRetailPrice: number
  searchVolume30d: number
  demandScore: number
  seasonalityFactor: number
  competitiveIntensity: 'low' | 'medium' | 'high'
  confidenceScore: number
}

export interface VehicleInput {
  make: string
  model: string
  year: number
  price: number // Acquisition price
  mileage?: number
  condition?: string
  fuelType?: string
  dealerZipCode: string
  dealerState: string
}

/**
 * Calculate Market Fit Score and turn prediction
 * This is the CORE algorithm that makes RevvDoctor valuable
 */
export async function predictInventoryTurn(
  vehicle: VehicleInput
): Promise<MarketFitPrediction> {

  // Get market intelligence for this vehicle in dealer's area
  const marketData = await getMarketIntelligence(
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.dealerZipCode
  )

  // Calculate individual scoring factors
  const demandScore = calculateDemandScore(marketData)
  const competitiveScore = calculateCompetitiveScore(vehicle, marketData)
  const priceScore = calculatePriceScore(vehicle, marketData)
  const seasonalityScore = calculateSeasonalityScore(marketData)
  const conditionScore = calculateConditionScore(vehicle)

  // Weighted Market Fit Score (0-100)
  const marketFitScore = Math.round(
    demandScore * 0.35 +        // 35% - Local demand is king
    competitiveScore * 0.25 +    // 25% - Competition matters
    priceScore * 0.20 +          // 20% - Price positioning
    seasonalityScore * 0.10 +    // 10% - Timing
    conditionScore * 0.10        // 10% - Vehicle health
  )

  // Predict days to sell based on market data + adjustments
  const { daysMin, daysMax, confidence } = predictDaysToSell(
    marketData,
    marketFitScore,
    vehicle
  )

  // Calculate financial projections
  const financials = calculateFinancialProjections(
    vehicle,
    marketData,
    daysMin,
    daysMax
  )

  // Determine flags and insights
  const isFastMover = daysMax <= 21
  const isSlowMover = daysMin >= 60
  const riskFlags = identifyRiskFlags(vehicle, marketData, marketFitScore)
  const opportunityFlags = identifyOpportunities(vehicle, marketData, marketFitScore)

  // Generate recommendation
  const { recommendation, reason } = generateRecommendation(
    marketFitScore,
    financials.trueProfitEstimate,
    isFastMover,
    riskFlags
  )

  // Determine local demand level
  const localDemandLevel = categorizeLocalDemand(marketData?.demandScore || 50)

  // Price position vs market
  const pricePosition = determinePricePosition(
    financials.estimatedRetailPrice,
    marketData?.avgRetailPrice
  )

  // Seasonality impact
  const seasonalityImpact = categorizeSeasonality(
    marketData?.seasonalityFactor || 1.0
  )

  return {
    marketFitScore,
    predictedDaysToSellMin: daysMin,
    predictedDaysToSellMax: daysMax,
    confidenceLevel: confidence,
    estimatedRetailPrice: financials.estimatedRetailPrice,
    estimatedReconCost: financials.estimatedReconCost,
    estimatedHoldingCostPerDay: financials.holdingCostPerDay,
    trueProfitEstimate: financials.trueProfitEstimate,
    capitalRoiMonthly: financials.capitalRoiMonthly,
    localDemandLevel,
    competitiveListingsCount: marketData?.activeListingsCount || 0,
    pricePosition,
    seasonalityImpact,
    isFastMover,
    isSlowMover,
    riskFlags,
    opportunityFlags,
    recommendation,
    recommendationReason: reason,
    marketIntelligence: marketData || undefined,
  }
}

/**
 * Get market intelligence from database or external API
 */
async function getMarketIntelligence(
  make: string,
  model: string,
  year: number,
  zipCode: string
): Promise<MarketIntelligence | null> {

  const supabase = await createClient()

  // Try to get from database first
  const { data, error } = await supabase
    .from("market_intelligence")
    .select("*")
    .eq("make", make)
    .eq("model", model)
    .eq("year", year)
    .eq("zip_code", zipCode)
    .single()

  if (error || !data) {
    // TODO: Fall back to external API (vAuto, Black Book, Manheim)
    // For now, return estimated defaults
    return createDefaultMarketIntelligence(make, model, year)
  }

  return {
    make: data.make,
    model: data.model,
    year: data.year,
    avgDaysToSell: data.avg_days_to_sell || 35,
    medianDaysToSell: data.median_days_to_sell || 32,
    activeListingsCount: data.active_listings_count || 0,
    soldLast30Days: data.sold_last_30_days || 0,
    avgRetailPrice: data.avg_retail_price || 0,
    searchVolume30d: data.search_volume_30d || 0,
    demandScore: data.demand_score || 50,
    seasonalityFactor: data.seasonality_factor || 1.0,
    competitiveIntensity: data.competitive_intensity || 'medium',
    confidenceScore: data.confidence_score || 70,
  }
}

/**
 * Calculate demand score (0-100) based on search volume and sales velocity
 */
function calculateDemandScore(marketData: MarketIntelligence | null): number {
  if (!marketData) return 50 // Neutral

  const searchScore = Math.min(100, (marketData.searchVolume30d / 50) * 100)
  const velocityScore = marketData.soldLast30Days > 0
    ? Math.min(100, (marketData.soldLast30Days / 10) * 100)
    : 30

  return Math.round((searchScore * 0.4 + velocityScore * 0.6))
}

/**
 * Calculate competitive score based on supply
 */
function calculateCompetitiveScore(
  vehicle: VehicleInput,
  marketData: MarketIntelligence | null
): number {
  if (!marketData) return 50

  const activeListings = marketData.activeListingsCount

  // Fewer listings = higher score (less competition)
  if (activeListings === 0) return 100
  if (activeListings <= 2) return 90
  if (activeListings <= 5) return 75
  if (activeListings <= 10) return 60
  if (activeListings <= 20) return 40
  return 25
}

/**
 * Calculate price score based on acquisition price vs market
 */
function calculatePriceScore(
  vehicle: VehicleInput,
  marketData: MarketIntelligence | null
): number {
  if (!marketData || !marketData.avgRetailPrice) return 50

  // Estimate retail as 130% of acquisition (rough rule of thumb)
  const estimatedRetail = vehicle.price * 1.30
  const marketRetail = marketData.avgRetailPrice

  const priceDiff = ((marketRetail - estimatedRetail) / marketRetail) * 100

  // Better deal = higher score
  if (priceDiff >= 15) return 100 // 15%+ below market
  if (priceDiff >= 10) return 90
  if (priceDiff >= 5) return 75
  if (priceDiff >= 0) return 60
  if (priceDiff >= -5) return 40
  return 20 // Priced above market
}

/**
 * Calculate seasonality score
 */
function calculateSeasonalityScore(
  marketData: MarketIntelligence | null
): number {
  if (!marketData) return 50

  const factor = marketData.seasonalityFactor

  // Convert factor to score
  if (factor >= 1.2) return 100 // Peak season
  if (factor >= 1.1) return 85
  if (factor >= 1.0) return 70
  if (factor >= 0.9) return 50
  if (factor >= 0.8) return 30
  return 15 // Off-season
}

/**
 * Calculate condition score (placeholder - would use actual health data)
 */
function calculateConditionScore(vehicle: VehicleInput): number {
  // TODO: Integrate with actual vehicle health score from AI analysis
  if (!vehicle.mileage) return 70

  // Simple mileage-based scoring for now
  if (vehicle.mileage < 30000) return 95
  if (vehicle.mileage < 50000) return 85
  if (vehicle.mileage < 75000) return 75
  if (vehicle.mileage < 100000) return 60
  if (vehicle.mileage < 150000) return 40
  return 25
}

/**
 * Predict days to sell based on market data and scores
 */
function predictDaysToSell(
  marketData: MarketIntelligence | null,
  marketFitScore: number,
  vehicle: VehicleInput
): { daysMin: number; daysMax: number; confidence: 'low' | 'medium' | 'high' | 'very_high' } {

  const baselineDays = marketData?.avgDaysToSell || 35

  // Adjust baseline based on market fit score
  let multiplier = 1.0
  if (marketFitScore >= 90) multiplier = 0.5      // 50% faster
  else if (marketFitScore >= 80) multiplier = 0.65
  else if (marketFitScore >= 70) multiplier = 0.8
  else if (marketFitScore >= 60) multiplier = 1.0
  else if (marketFitScore >= 50) multiplier = 1.3
  else multiplier = 1.8                           // 80% slower

  const predictedDays = Math.round(baselineDays * multiplier)

  // Calculate range
  const variance = 0.25 // ±25%
  const daysMin = Math.max(7, Math.round(predictedDays * (1 - variance)))
  const daysMax = Math.round(predictedDays * (1 + variance))

  // Confidence based on data quality
  let confidence: 'low' | 'medium' | 'high' | 'very_high' = 'medium'
  const confidenceScore = marketData?.confidenceScore || 50

  if (confidenceScore >= 85) confidence = 'very_high'
  else if (confidenceScore >= 70) confidence = 'high'
  else if (confidenceScore >= 50) confidence = 'medium'
  else confidence = 'low'

  return { daysMin, daysMax, confidence }
}

/**
 * Calculate financial projections
 */
function calculateFinancialProjections(
  vehicle: VehicleInput,
  marketData: MarketIntelligence | null,
  daysMin: number,
  daysMax: number
) {
  const acquisitionCost = vehicle.price

  // Estimate retail price
  const estimatedRetailPrice = marketData?.avgRetailPrice || (acquisitionCost * 1.35)

  // Estimate reconditioning costs (rough rules)
  const baseRecon = 800 // Detailing, minor fixes
  const mileageRecon = vehicle.mileage && vehicle.mileage > 75000 ? 1200 : 0
  const estimatedReconCost = baseRecon + mileageRecon

  // Holding costs (floorplan interest @ 8% APR)
  const holdingCostPerDay = (acquisitionCost * 0.08) / 365

  // Calculate avg days and total holding cost
  const avgDays = (daysMin + daysMax) / 2
  const totalHoldingCost = Math.round(holdingCostPerDay * avgDays)

  // True profit = Retail - Acquisition - Recon - Holding
  const trueProfitEstimate = Math.round(
    estimatedRetailPrice - acquisitionCost - estimatedReconCost - totalHoldingCost
  )

  // Capital ROI (monthly)
  const totalInvested = acquisitionCost + estimatedReconCost
  const profitPerMonth = (trueProfitEstimate / avgDays) * 30
  const capitalRoiMonthly = (profitPerMonth / totalInvested) * 100

  return {
    estimatedRetailPrice: Math.round(estimatedRetailPrice),
    estimatedReconCost,
    holdingCostPerDay: Math.round(holdingCostPerDay * 100) / 100,
    trueProfitEstimate,
    capitalRoiMonthly: Math.round(capitalRoiMonthly * 10) / 10,
  }
}

/**
 * Identify risk flags
 */
function identifyRiskFlags(
  vehicle: VehicleInput,
  marketData: MarketIntelligence | null,
  marketFitScore: number
): string[] {
  const flags: string[] = []

  if (marketFitScore < 50) {
    flags.push("Low market fit - may take 60+ days to sell")
  }

  if (marketData && marketData.activeListingsCount > 15) {
    flags.push(`High competition - ${marketData.activeListingsCount} similar listings nearby`)
  }

  if (marketData && marketData.seasonalityFactor < 0.9) {
    flags.push("Off-season timing - demand is below average")
  }

  if (vehicle.mileage && vehicle.mileage > 100000) {
    flags.push("High mileage may require significant reconditioning")
  }

  if (marketData && marketData.demandScore < 40) {
    flags.push("Low local demand for this make/model")
  }

  return flags
}

/**
 * Identify opportunity flags
 */
function identifyOpportunities(
  vehicle: VehicleInput,
  marketData: MarketIntelligence | null,
  marketFitScore: number
): string[] {
  const flags: string[] = []

  if (marketFitScore >= 85) {
    flags.push("🔥 Excellent market fit - expected to sell quickly")
  }

  if (marketData && marketData.activeListingsCount <= 2) {
    flags.push("Low competition - only " + marketData.activeListingsCount + " similar listings")
  }

  if (marketData && marketData.searchVolume30d > 30) {
    flags.push("High buyer interest - " + marketData.searchVolume30d + " searches this month")
  }

  if (marketData && marketData.seasonalityFactor >= 1.15) {
    flags.push("Peak season demand - buyers are actively looking")
  }

  if (vehicle.mileage && vehicle.mileage < 40000) {
    flags.push("Low mileage appeals to quality-conscious buyers")
  }

  return flags
}

/**
 * Generate buy recommendation
 */
function generateRecommendation(
  marketFitScore: number,
  trueProfitEstimate: number,
  isFastMover: boolean,
  riskFlags: string[]
): { recommendation: 'strong_buy' | 'buy' | 'consider' | 'pass'; reason: string } {

  // Strong buy: High score + good profit + fast mover
  if (marketFitScore >= 85 && trueProfitEstimate >= 3000 && isFastMover) {
    return {
      recommendation: 'strong_buy',
      reason: `Excellent market fit (${marketFitScore}/100) with strong profit potential and fast turn expected`
    }
  }

  // Buy: Good score + decent profit
  if (marketFitScore >= 70 && trueProfitEstimate >= 2000) {
    return {
      recommendation: 'buy',
      reason: `Solid market fit (${marketFitScore}/100) with good profit margin`
    }
  }

  // Consider: Moderate score or risks present
  if (marketFitScore >= 55 && riskFlags.length <= 2) {
    return {
      recommendation: 'consider',
      reason: `Moderate market fit (${marketFitScore}/100) - review risk factors carefully`
    }
  }

  // Pass: Low score or too many risks
  return {
    recommendation: 'pass',
    reason: `Low market fit (${marketFitScore}/100) - likely to be slow mover with ${riskFlags.length} risk factors`
  }
}

/**
 * Helper functions
 */

function categorizeLocalDemand(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (score >= 80) return 'very_high'
  if (score >= 65) return 'high'
  if (score >= 45) return 'medium'
  if (score >= 30) return 'low'
  return 'very_low'
}

function determinePricePosition(
  estimatedRetail: number,
  marketAvg: number | undefined
): 'below_market' | 'at_market' | 'above_market' {
  if (!marketAvg) return 'at_market'

  const diff = ((estimatedRetail - marketAvg) / marketAvg) * 100

  if (diff < -5) return 'below_market'
  if (diff > 5) return 'above_market'
  return 'at_market'
}

function categorizeSeasonality(
  factor: number
): 'negative' | 'neutral' | 'positive' {
  if (factor >= 1.1) return 'positive'
  if (factor <= 0.9) return 'negative'
  return 'neutral'
}

function createDefaultMarketIntelligence(
  make: string,
  model: string,
  year: number
): MarketIntelligence {
  // Reasonable defaults when no data available
  return {
    make,
    model,
    year,
    avgDaysToSell: 35,
    medianDaysToSell: 32,
    activeListingsCount: 5,
    soldLast30Days: 3,
    avgRetailPrice: 0, // Will need external API
    searchVolume30d: 15,
    demandScore: 50,
    seasonalityFactor: 1.0,
    competitiveIntensity: 'medium',
    confidenceScore: 40, // Low confidence with defaults
  }
}
