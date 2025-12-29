import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enforceSubscription } from "@/lib/subscription/check-subscription"
import { predictInventoryTurn, type VehicleInput } from "@/lib/market-intelligence/inventory-turn-predictor"

/**
 * POST /api/market-intelligence/predict
 *
 * Get Market Fit Score and inventory turn prediction for a vehicle
 *
 * Body: {
 *   make: string,
 *   model: string,
 *   year: number,
 *   price: number,
 *   mileage?: number,
 *   condition?: string,
 *   fuelType?: string
 * }
 *
 * SUBSCRIPTION: Requires 'market_intelligence' feature access
 * - Trial: Basic predictions only
 * - Basic+: Full predictions with local market data
 */
export async function POST(req: NextRequest) {
  try {
    // Enforce subscription - market intelligence is a premium feature
    const subscriptionError = await enforceSubscription('market_intelligence')
    if (subscriptionError) {
      return NextResponse.json(
        {
          error: subscriptionError.error,
          message: subscriptionError.message,
          upgradeRequired: true,
        },
        { status: subscriptionError.status }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer profile with location
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id, zip_code, state, avg_days_to_turn")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    if (!dealer.zip_code || !dealer.state) {
      return NextResponse.json({
        error: "Location required",
        message: "Please update your dealership location in settings to use market intelligence"
      }, { status: 400 })
    }

    const body = await req.json()
    const { make, model, year, price, mileage, condition, fuelType } = body

    // Validate required fields
    if (!make || !model || !year || !price) {
      return NextResponse.json(
        { error: "Missing required fields: make, model, year, price" },
        { status: 400 }
      )
    }

    // Build vehicle input
    const vehicleInput: VehicleInput = {
      make,
      model,
      year: parseInt(year),
      price: parseFloat(price),
      mileage: mileage ? parseInt(mileage) : undefined,
      condition,
      fuelType,
      dealerZipCode: dealer.zip_code,
      dealerState: dealer.state,
    }

    // Get prediction
    const prediction = await predictInventoryTurn(vehicleInput)

    // Store prediction in database for tracking
    const { data: storedPrediction, error: storageError } = await supabase
      .from("inventory_turn_predictions")
      .insert({
        dealer_id: dealer.id,
        // vehicle_match_id will be set when linked to actual vehicle match
        market_fit_score: prediction.marketFitScore,
        predicted_days_to_sell_min: prediction.predictedDaysToSellMin,
        predicted_days_to_sell_max: prediction.predictedDaysToSellMax,
        confidence_level: prediction.confidenceLevel,
        estimated_retail_price: prediction.estimatedRetailPrice,
        estimated_recon_cost: prediction.estimatedReconCost,
        estimated_holding_cost_per_day: prediction.estimatedHoldingCostPerDay,
        true_profit_estimate: prediction.trueProfitEstimate,
        capital_roi_monthly: prediction.capitalRoiMonthly,
        local_demand_level: prediction.localDemandLevel,
        competitive_listings_count: prediction.competitiveListingsCount,
        price_position: prediction.pricePosition,
        seasonality_impact: prediction.seasonalityImpact,
        is_fast_mover: prediction.isFastMover,
        is_slow_mover: prediction.isSlowMover,
        risk_flags: prediction.riskFlags,
        opportunity_flags: prediction.opportunityFlags,
        recommendation: prediction.recommendation,
        recommendation_reason: prediction.recommendationReason,
        model_version: 'v1.0-rule-based',
      })
      .select()
      .single()

    if (storageError) {
      console.error("[Market Intelligence] Failed to store prediction:", storageError)
      // Don't fail the request, just log
    }

    return NextResponse.json({
      success: true,
      prediction,
      predictionId: storedPrediction?.id,
      dealerContext: {
        avgDaysToTurn: dealer.avg_days_to_turn,
        location: `${dealer.zip_code}, ${dealer.state}`,
      }
    })

  } catch (error) {
    console.error("[Market Intelligence] Error:", error)
    return NextResponse.json(
      {
        error: "Prediction failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
