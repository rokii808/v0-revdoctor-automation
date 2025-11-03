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

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase.from("dealers_v2").select("*").eq("id", userId).single()

    // Get subscription info
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        profile: profile || null,
        dealer: dealer || null,
        subscription: subscription || null,
      },
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, email, companyName } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Update profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      name,
      email,
    })

    if (profileError) {
      throw profileError
    }

    // Update dealer info
    const { error: dealerError } = await supabase.from("dealers_v2").upsert({
      id: userId,
      company_name: companyName,
    })

    if (dealerError) {
      throw dealerError
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
