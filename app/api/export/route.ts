import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enforceSubscription } from "@/lib/subscription/check-subscription"

/**
 * POST /api/export
 *
 * Export vehicle matches to CSV or PDF
 * Body: { format: 'csv' | 'pdf', filters?: {...} }
 *
 * SUBSCRIPTION: Requires 'export' feature access
 */
export async function POST(req: NextRequest) {
  try {
    // Enforce subscription and feature access
    const subscriptionError = await enforceSubscription('export')
    if (subscriptionError) {
      return NextResponse.json(
        { error: subscriptionError.error, message: subscriptionError.message },
        { status: subscriptionError.status }
      )
    }

    const body = await req.json()
    const { format = 'csv', filters = {} } = body

    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'csv' or 'pdf'" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dealer profile
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Build query with filters
    let query = supabase
      .from("vehicle_matches")
      .select("*")
      .eq("dealer_id", dealer.id)
      .order("created_at", { ascending: false })
      .limit(1000)

    // Apply filters if provided
    if (filters.date) {
      query = query.gte("created_at", filters.date)
    }
    if (filters.make) {
      query = query.eq("make", filters.make)
    }
    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice)
    }

    const { data: vehicles, error } = await query

    if (error) {
      throw error
    }

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json(
        { error: "No vehicles found to export" },
        { status: 404 }
      )
    }

    // Generate export file
    if (format === 'csv') {
      const csv = generateCSV(vehicles)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="revvdoctor-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // PDF format
      const pdf = generatePDFData(vehicles)
      return NextResponse.json({
        success: true,
        message: "PDF generation not fully implemented yet. Please use CSV format.",
        vehicleCount: vehicles.length,
      })
    }
  } catch (error) {
    console.error("[Export] Error:", error)
    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Escape CSV field to prevent formula injection attacks
 * Prefixes formula characters (=, +, -, @, \t, \r) with a single quote
 */
function escapeCSVField(value: any): string {
  let str = String(value ?? '')

  // Prevent CSV injection by escaping formula prefixes
  if (str.length > 0) {
    const firstChar = str.charAt(0)
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' ||
        firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
      str = "'" + str
    }
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""')

  // Wrap in quotes
  return `"${str}"`
}

/**
 * Generate CSV from vehicle data
 */
function generateCSV(vehicles: any[]): string {
  // CSV headers
  const headers = [
    'Date',
    'Make',
    'Model',
    'Year',
    'Price',
    'Mileage',
    'Condition',
    'Auction Site',
    'Match Score',
    'Risk Score',
    'Confidence',
    'Profit Potential',
    'Listing URL',
  ]

  // Build CSV rows
  const rows = vehicles.map(v => {
    const ai = v.ai_classification || {}
    return [
      new Date(v.created_at).toLocaleDateString(),
      v.make || '',
      v.model || '',
      v.year || '',
      v.price || '',
      v.mileage || '',
      v.condition || '',
      v.auction_site || '',
      v.match_score || '',
      ai.risk_score || '',
      ai.confidence || '',
      ai.profit_potential || '',
      v.listing_url || '',
    ].map(field => escapeCSVField(field))
  })

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

/**
 * Generate PDF data (placeholder for future implementation)
 */
function generatePDFData(vehicles: any[]): any {
  // This would use jsPDF or similar library
  // For now, return metadata
  return {
    vehicleCount: vehicles.length,
    generatedAt: new Date().toISOString(),
  }
}
