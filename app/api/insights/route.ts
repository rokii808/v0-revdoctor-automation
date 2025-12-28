import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Insight } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get user's insights with pagination
    const { data: insights, error } = await supabase
      .from("insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (insights || []) as Insight[],
    })
  } catch (error) {
    console.error("Insights API error:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, title, make, year, price, url, verdict, minor_type, risk, reason } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Insert new insight
    const { data, error } = await supabase.from("insights").insert({
      user_id: userId,
      title,
      make,
      year,
      price,
      url,
      verdict,
      minor_type,
      risk,
      reason,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Create insight error:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
