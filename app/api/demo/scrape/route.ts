import { NextResponse } from "next/server"
import { Resend } from "resend"
import { demoRequestSchema, calculateMatchScore } from "@/lib/types/preferences"
import { z } from "zod"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build")

// Mock vehicles for demo (replace with actual scraper call)
const DEMO_VEHICLES = [
  {
    make: "BMW",
    model: "3 Series",
    year: 2020,
    price: 22000,
    mileage: 35000,
    condition: "Excellent",
    fuel_type: "Diesel",
    transmission: "Automatic",
    url: "https://example.com/vehicle/1",
    auction_site: "RAW2K",
    verdict: "HEALTHY",
    reason: "Low mileage, excellent condition, popular model with strong resale value.",
    risk_score: 2,
    profit_estimate: 3500,
  },
  {
    make: "Audi",
    model: "A4",
    year: 2019,
    price: 19500,
    mileage: 42000,
    condition: "Good",
    fuel_type: "Petrol",
    transmission: "Automatic",
    url: "https://example.com/vehicle/2",
    auction_site: "BCA",
    verdict: "HEALTHY",
    reason: "Competitive price point, average mileage for year, reliable engine.",
    risk_score: 3,
    profit_estimate: 2800,
  },
  {
    make: "Mercedes",
    model: "C-Class",
    year: 2021,
    price: 28000,
    mileage: 18000,
    condition: "Excellent",
    fuel_type: "Hybrid",
    transmission: "Automatic",
    url: "https://example.com/vehicle/3",
    auction_site: "RAW2K",
    verdict: "HEALTHY",
    reason: "Nearly new, low mileage, desirable hybrid model in high demand.",
    risk_score: 1,
    profit_estimate: 4200,
  },
]

// Rate limiting check (simple in-memory for demo, use Redis in production)
const demoRequests = new Map<string, number[]>()

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const requests = demoRequests.get(email) || []

  // Remove old requests
  const recentRequests = requests.filter(time => now - time < oneHour)

  if (recentRequests.length >= 3) {
    return true
  }

  recentRequests.push(now)
  demoRequests.set(email, recentRequests)
  return false
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = demoRequestSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { email, preferences } = validatedData.data

    // Rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in an hour." },
        { status: 429 }
      )
    }

    // Filter and score vehicles based on preferences
    let matchedVehicles = DEMO_VEHICLES

    if (preferences) {
      matchedVehicles = DEMO_VEHICLES.filter(vehicle => {
        // Filter by make
        if (preferences.makes && preferences.makes.length > 0) {
          if (!preferences.makes.some(make =>
            vehicle.make.toLowerCase().includes(make.toLowerCase())
          )) {
            return false
          }
        }

        // Filter by year
        if (preferences.min_year && vehicle.year < preferences.min_year) {
          return false
        }

        // Filter by price
        if (preferences.max_price && vehicle.price > preferences.max_price) {
          return false
        }

        return true
      }).map(vehicle => ({
        ...vehicle,
        match_score: calculateMatchScore(vehicle, {
          preferred_makes: preferences.makes || [],
          min_year: preferences.min_year || 2015,
          max_price: preferences.max_price || 50000,
          min_price: 0,
          max_mileage: 100000,
          enabled_auction_sites: ["RAW2K", "BCA"],
          email_frequency: "daily",
          email_enabled: true,
          min_vehicles_to_send: 1,
        }),
      }))
    } else {
      matchedVehicles = matchedVehicles.map(vehicle => ({
        ...vehicle,
        match_score: 85, // Default high score for demo
      }))
    }

    // Sort by match score
    matchedVehicles.sort((a, b) => (b as any).match_score - (a as any).match_score)

    // Send email with demo digest
    const emailHtml = generateDemoEmailHTML(matchedVehicles as any, email)

    if (!process.env.RESEND_API_KEY) {
      console.warn("[Demo] Resend API key not configured - email not sent")
      return NextResponse.json({
        success: true,
        message: "Demo data generated (email not sent - RESEND_API_KEY missing)",
        vehicles: matchedVehicles,
      })
    }

    const { data, error } = await resend.emails.send({
      from: "RevvDoctor Demo <demo@revvdoctor.com>",
      to: email,
      subject: "Your RevvDoctor Demo - Today's Healthy Cars",
      html: emailHtml,
    })

    if (error) {
      console.error("[Demo] Resend error:", error)
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      )
    }

    console.log("[Demo] Email sent successfully:", { email, vehicleCount: matchedVehicles.length })

    return NextResponse.json({
      success: true,
      message: "Demo email sent! Check your inbox.",
      vehicles: matchedVehicles.length,
      emailId: data?.id,
    })
  } catch (error) {
    console.error("[Demo] Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateDemoEmailHTML(
  vehicles: Array<{
    make: string
    model: string
    year: number
    price: number
    mileage?: number
    condition?: string
    url: string
    verdict: string
    reason: string
    risk_score: number
    profit_estimate: number
    match_score: number
  }>,
  email: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .demo-badge { background: #fbbf24; color: #92400e; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .vehicle-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background: white; }
    .vehicle-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .vehicle-price { font-size: 24px; color: #059669; font-weight: bold; }
    .verdict-healthy { background: #d1fae5; color: #065f46; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
    .match-score { background: #dbeafe; color: #1e40af; padding: 5px 10px; border-radius: 5px; font-weight: bold; float: right; }
    .details { margin: 15px 0; color: #6b7280; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
    .footer { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <span class="demo-badge">DEMO</span>
    <h1>RevvDoctor Demo Digest</h1>
    <p>Here's what we found for you today</p>
  </div>

  <div style="padding: 20px; background: #f9fafb;">
    <p>Hi there,</p>
    <p>Thanks for trying RevvDoctor! Here are <strong>${vehicles.length} healthy cars</strong> we found based on your preferences.</p>
    <p><em>This is a demo with sample data. Sign up to get real-time auction listings daily!</em></p>

    ${vehicles.map(vehicle => `
      <div class="vehicle-card">
        <div>
          <span class="verdict-healthy">${vehicle.verdict}</span>
          <span class="match-score">${vehicle.match_score}% Match</span>
        </div>
        <div class="vehicle-title">${vehicle.year} ${vehicle.make} ${vehicle.model}</div>
        <div class="vehicle-price">£${vehicle.price.toLocaleString()}</div>

        <div class="details">
          <strong>Mileage:</strong> ${vehicle.mileage?.toLocaleString() || 'Unknown'} miles<br>
          <strong>Condition:</strong> ${vehicle.condition || 'Unknown'}<br>
          <strong>Auction:</strong> ${(vehicle as any).auction_site || 'Unknown'}<br>
          <strong>Risk Score:</strong> ${vehicle.risk_score}/10 (Lower is better)<br>
          <strong>Profit Estimate:</strong> £${vehicle.profit_estimate.toLocaleString()}
        </div>

        <p><strong>Why it's healthy:</strong> ${vehicle.reason}</p>

        <a href="${vehicle.url}" class="cta-button">View Listing →</a>
      </div>
    `).join('')}

    <div style="text-align: center; margin-top: 40px; padding: 30px; background: white; border-radius: 10px;">
      <h2>Ready to find deals every day?</h2>
      <p>Sign up now to receive daily digests with real auction listings matched to your preferences.</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing" class="cta-button" style="font-size: 18px;">Start Free Trial →</a>
    </div>
  </div>

  <div class="footer">
    <p>This is a demo email sent to ${email}</p>
    <p>RevvDoctor - Decision Support for Automotive Sourcing</p>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a> | <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/terms">Terms of Service</a></p>
  </div>
</body>
</html>
  `
}
