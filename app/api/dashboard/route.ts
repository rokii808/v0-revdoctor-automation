import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { DashboardData, Insight, Digest } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user's recent insights
    const { data: insights, error: insightsError } = await supabase
      .from("insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (insightsError) {
      throw insightsError
    }

    // Get user's digest stats
    const { data: digests, error: digestsError } = await supabase
      .from("digests")
      .select("count, sent_at")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(30)

    if (digestsError) {
      throw digestsError
    }

    // Calculate stats
    const typedInsights = (insights || []) as Insight[]
    const typedDigests = (digests || []) as Digest[]
    const totalCarsFound = typedInsights.length
    const healthyCars = typedInsights.filter((car) => car.verdict === "HEALTHY").length
    const totalDigests = typedDigests.length
    const carsThisWeek = typedInsights.filter((car) => {
      const carDate = new Date(car.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return carDate >= weekAgo
    }).length

    const data: DashboardData = {
      stats: {
        totalCarsFound,
        healthyCars,
        totalDigests,
        carsThisWeek,
      },
      recentInsights: typedInsights,
      recentDigests: typedDigests,
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
