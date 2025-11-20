import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Digest } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "30")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get user's digests
    const { data: digests, error } = await supabase
      .from("digests")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (digests || []) as Digest[],
    })
  } catch (error) {
    console.error("Digests API error:", error)
    return NextResponse.json({ error: "Failed to fetch digests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, runId, count } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Insert new digest record
    const { data, error } = await supabase.from("digests").insert({
      user_id: userId,
      run_id: runId,
      count,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Create digest error:", error)
    return NextResponse.json({ error: "Failed to create digest record" }, { status: 500 })
  }
}
