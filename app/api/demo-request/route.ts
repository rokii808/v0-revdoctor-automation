import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/demo-request
 *
 * Capture demo request / lead from "See It In Action" form
 * No auth required - this is a public lead capture form
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      businessType,
      monthlyVolume,
      source = 'see_it_in_action'
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email" },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already submitted (prevent duplicates)
    const { data: existingRequest } = await supabase
      .from("demo_requests")
      .select("id, created_at")
      .eq("email", email)
      .single()

    if (existingRequest) {
      // Don't error - just return success (prevents spam detection)
      // But you could track "duplicate request" in analytics
      return NextResponse.json({
        success: true,
        message: "Thank you! We'll be in touch soon.",
        duplicate: true,
      })
    }

    // Get metadata
    const ipAddress = req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Get UTM parameters from referrer or headers
    const url = new URL(req.url)
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')

    // Insert demo request
    const { data: demoRequest, error } = await supabase
      .from("demo_requests")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        company_name: companyName || null,
        business_type: businessType || null,
        monthly_volume: monthlyVolume || null,
        source,
        status: 'new',
        ip_address: ipAddress,
        user_agent: userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select()
      .single()

    if (error) {
      console.error("[Demo Request] Database error:", error)
      throw error
    }

    // TODO: Send notification email to sales team
    // TODO: Add to CRM (HubSpot, Salesforce, etc.)
    // TODO: Send auto-reply email to lead

    console.log("[Demo Request] New lead captured:", {
      id: demoRequest.id,
      email,
      companyName,
      source
    })

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch within 24 hours.",
      requestId: demoRequest.id,
    })

  } catch (error) {
    console.error("[Demo Request] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to submit request",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/demo-request
 *
 * Get all demo requests (admin only)
 * TODO: Add admin auth check
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // TODO: Add admin auth check here
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from("demo_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: requests, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: requests,
      total: requests?.length || 0,
    })

  } catch (error) {
    console.error("[Demo Request GET] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}
