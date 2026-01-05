import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Retrieve transparent metrics and scoring explanations
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")

    // If matchId is provided, return detailed metrics for that vehicle
    if (matchId) {
      const { data: match, error: matchError } = await supabase
        .from("vehicle_matches")
        .select("*")
        .eq("id", matchId)
        .eq("dealer_id", user.id)
        .single()

      if (matchError || !match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }

      // Get learned preferences for explanation
      const { data: preferences } = await supabase
        .from("dealer_learned_preferences")
        .select("*")
        .eq("dealer_id", user.id)
        .single()

      // Build transparent explanation
      const explanation = {
        baseScore: match.base_score,
        personalizationBoost: match.personalization_boost,
        finalScore: match.final_score,
        scoreBreakdown: match.score_breakdown || {},
        learnedPreferences: preferences ? {
          totalInteractions: preferences.total_interactions,
          totalSaves: preferences.total_saves,
          preferredMakes: preferences.learned_makes || {},
          preferredModels: preferences.learned_models || {},
          priceRange: preferences.learned_price_range || {},
        } : null,
        explanation: buildExplanation(match, preferences),
      }

      return NextResponse.json({
        success: true,
        match,
        metrics: explanation,
      })
    }

    // Otherwise, return aggregate metrics for the dealer
    const { data: preferences } = await supabase
      .from("dealer_learned_preferences")
      .select("*")
      .eq("dealer_id", user.id)
      .single()

    // Get match statistics
    const { data: matchStats, error: statsError } = await supabase
      .rpc("get_dealer_match_stats", { p_dealer_id: user.id })

    if (statsError) {
      console.warn("[Metrics] Failed to get match stats:", statsError)
    }

    // Get recent interactions summary
    const { data: recentInteractions, error: interactionsError } = await supabase
      .from("dealer_interactions")
      .select("interaction_type, created_at")
      .eq("dealer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (interactionsError) {
      console.warn("[Metrics] Failed to get interactions:", interactionsError)
    }

    // Calculate engagement metrics
    const interactionsByType = (recentInteractions || []).reduce((acc, interaction) => {
      acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const metrics = {
      preferences: preferences ? {
        totalInteractions: preferences.total_interactions,
        totalSaves: preferences.total_saves,
        totalSkips: preferences.total_skips,
        saveRate: preferences.total_interactions > 0
          ? ((preferences.total_saves / preferences.total_interactions) * 100).toFixed(1)
          : "0.0",
        learnedMakes: preferences.learned_makes || {},
        learnedModels: preferences.learned_models || {},
        priceRange: preferences.learned_price_range || {},
        mileageRange: preferences.learned_mileage_range || {},
        lastUpdated: preferences.last_updated,
      } : null,
      matchStats: matchStats || {
        total_matches: 0,
        avg_base_score: 0,
        avg_personalization_boost: 0,
        avg_final_score: 0,
      },
      recentActivity: {
        interactionsByType,
        totalRecent: recentInteractions?.length || 0,
      },
      hasLearningData: !!preferences && (preferences.total_interactions || 0) >= 5,
      learningProgress: calculateLearningProgress(preferences),
    }

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error("[Metrics GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function buildExplanation(match: any, preferences: any): string[] {
  const explanations: string[] = []

  explanations.push(`Base match score: ${match.base_score}/100`)

  if (match.personalization_boost > 0) {
    explanations.push(`+${match.personalization_boost} personalization boost`)

    if (preferences?.learned_makes && preferences.learned_makes[match.make]) {
      const makeScore = (preferences.learned_makes[match.make] * 100).toFixed(0)
      explanations.push(`  • You frequently save ${match.make} vehicles (${makeScore}% preference)`)
    }

    if (preferences?.learned_models && preferences.learned_models[match.model]) {
      const modelScore = (preferences.learned_models[match.model] * 100).toFixed(0)
      explanations.push(`  • You show interest in ${match.model} models (${modelScore}% preference)`)
    }

    if (preferences?.learned_price_range) {
      const { preferred } = preferences.learned_price_range
      if (preferred && Math.abs(match.price - preferred) < 2000) {
        explanations.push(`  • Price matches your typical range (around £${preferred.toLocaleString()})`)
      }
    }
  } else if (match.personalization_boost < 0) {
    explanations.push(`${match.personalization_boost} personalization penalty`)
    explanations.push(`  • This vehicle doesn't match your typical preferences`)
  } else {
    explanations.push(`No personalization applied yet - interact with more vehicles to improve recommendations`)
  }

  explanations.push(`Final score: ${match.final_score}/100`)

  return explanations
}

function calculateLearningProgress(preferences: any): {
  stage: string
  percentage: number
  nextMilestone: string
} {
  if (!preferences) {
    return {
      stage: "Getting Started",
      percentage: 0,
      nextMilestone: "Save or skip 5 vehicles to start learning your preferences"
    }
  }

  const totalInteractions = preferences.total_interactions || 0

  if (totalInteractions < 5) {
    return {
      stage: "Getting Started",
      percentage: (totalInteractions / 5) * 100,
      nextMilestone: `${5 - totalInteractions} more interactions to start learning`
    }
  } else if (totalInteractions < 20) {
    return {
      stage: "Learning",
      percentage: 50 + ((totalInteractions - 5) / 15) * 30,
      nextMilestone: `${20 - totalInteractions} more interactions for better recommendations`
    }
  } else if (totalInteractions < 50) {
    return {
      stage: "Improving",
      percentage: 80 + ((totalInteractions - 20) / 30) * 15,
      nextMilestone: `${50 - totalInteractions} more interactions for optimal personalization`
    }
  } else {
    return {
      stage: "Optimized",
      percentage: 95 + Math.min((totalInteractions - 50) / 100 * 5, 5),
      nextMilestone: "Your preferences are well-learned!"
    }
  }
}
