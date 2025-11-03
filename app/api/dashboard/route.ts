import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

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
    const totalCarsFound = insights?.length || 0
    const healthyCars = insights?.filter((car) => car.verdict === "HEALTHY").length || 0
    const totalDigests = digests?.length || 0
    const carsThisWeek =
      insights?.filter((car) => {
        const carDate = new Date(car.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return carDate >= weekAgo
      }).length || 0

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalCarsFound,
          healthyCars,
          totalDigests,
          carsThisWeek,
        },
        recentInsights: insights || [],
        recentDigests: digests || [],
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
