import { Resend } from "resend"
import type { VehicleMatch } from "./preference-matcher"

// Singleton pattern: Cache Resend client instance using closure
// This prevents creating a new instance on every call while avoiding
// module-level initialization errors when RESEND_API_KEY is missing
let resendClient: Resend | null = null

function getResendClient(): Resend {
  // Return cached instance if it exists
  if (resendClient) {
    return resendClient
  }

  // Validate API key exists
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is required")
  }

  // Create and cache new instance (closure captures this variable)
  resendClient = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build")
  return resendClient
}

interface DemoEmailData {
  email: string
  vehicles: VehicleMatch[]
}

/**
 * Send demo "See It in Action" email with sample vehicles
 * Shows what the Revvdoctor workflow does without requiring signup
 */
export async function sendDemoEmail(data: DemoEmailData): Promise<{
  success: boolean
  message_id?: string
  error?: string
}> {
  try {
    console.log(`[Demo] Sending demo email to ${data.email} with ${data.vehicles.length} vehicles`)

    const html = buildDemoEmailHTML(data)
    const resend = getResendClient()

    const { data: resendData, error } = await resend.emails.send({
      from: "Revvdoctor <digest@revvdoctor.com>",
      to: data.email,
      subject: "🚗 See Revvdoctor in Action - AI-Powered Vehicle Analysis",
      html,
      tags: [
        { name: "type", value: "demo_email" },
        { name: "vehicles", value: data.vehicles.length.toString() },
      ],
    })

    if (error) {
      console.error(`[Demo] Failed to send to ${data.email}:`, error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log(`[Demo] Successfully sent to ${data.email} (ID: ${resendData?.id})`)
    return {
      success: true,
      message_id: resendData?.id,
    }
  } catch (err) {
    console.error(`[Demo] Unexpected error sending to ${data.email}:`, err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

/**
 * Build demo email HTML
 */
function buildDemoEmailHTML(data: DemoEmailData): string {
  const { vehicles } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revvdoctor Demo - See It in Action</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ec4899;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #ec4899;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #666;
      font-size: 16px;
    }
    .demo-badge {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 600;
      font-size: 16px;
    }
    .intro {
      background-color: #fdf2f8;
      border-left: 4px solid #ec4899;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .intro h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #ec4899;
    }
    .intro p {
      margin: 8px 0;
      font-size: 15px;
      color: #374151;
    }
    .features {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .features h3 {
      margin: 0 0 15px 0;
      color: #3b82f6;
      font-size: 16px;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #374151;
    }
    .vehicle-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #fafafa;
    }
    .vehicle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .vehicle-title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin: 0;
    }
    .match-score {
      background-color: #10b981;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .match-score.high {
      background-color: #10b981;
    }
    .match-score.medium {
      background-color: #f59e0b;
    }
    .vehicle-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    .detail-item {
      font-size: 14px;
    }
    .detail-label {
      color: #6b7280;
      font-weight: 500;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 600;
    }
    .ai-analysis {
      background-color: #eff6ff;
      border-left: 3px solid #3b82f6;
      padding: 12px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .ai-analysis h4 {
      margin: 0 0 8px 0;
      color: #3b82f6;
      font-size: 14px;
      font-weight: 600;
    }
    .ai-analysis p {
      margin: 0;
      font-size: 13px;
      color: #374151;
    }
    .ai-metrics {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 12px;
      flex-wrap: wrap;
    }
    .ai-metric {
      display: flex;
      flex-direction: column;
    }
    .ai-metric-label {
      color: #6b7280;
    }
    .ai-metric-value {
      font-weight: 600;
      color: #1f2937;
    }
    .match-reasons {
      margin-top: 12px;
    }
    .match-reasons h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .reason-tag {
      display: inline-block;
      background-color: #e5e7eb;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      margin-right: 6px;
      margin-bottom: 6px;
      color: #374151;
    }
    .cta-section {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin-top: 30px;
    }
    .cta-section h3 {
      margin: 0 0 15px 0;
      font-size: 22px;
    }
    .cta-section p {
      margin: 0 0 20px 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .cta-button {
      display: inline-block;
      background-color: white;
      color: #ec4899;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .trial-badge {
      display: inline-block;
      background-color: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      margin-top: 15px;
      font-size: 14px;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 13px;
    }
    .footer a {
      color: #ec4899;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Revvdoctor</h1>
      <p>AI-Powered Vehicle Screening</p>
    </div>

    <div class="demo-badge">
      ✨ DEMO - See What Revvdoctor Can Do For You
    </div>

    <div class="intro">
      <h2>Welcome to Revvdoctor!</h2>
      <p>Below are <strong>2 real vehicle matches</strong> found by our AI-powered screening system. This is exactly what you'd receive daily as a subscriber!</p>
      <p style="margin-top: 12px;">Every morning, our system:</p>
    </div>

    <div class="features">
      <h3>🤖 How It Works:</h3>
      <ul>
        <li><strong>Scrapes</strong> thousands of vehicles from UK auction sites (RAW2K, BCA, Autorola, Manheim)</li>
        <li><strong>Analyzes</strong> each vehicle using OpenAI GPT-4 AI for condition and profitability</li>
        <li><strong>Matches</strong> healthy vehicles to your preferences (make, year, price, mileage)</li>
        <li><strong>Emails</strong> you personalized daily digests with your top matches</li>
        <li><strong>Saves you hours</strong> of manual searching and analysis every single day</li>
      </ul>
    </div>

    <h3 style="margin-bottom: 20px; color: #374151;">📋 Sample Matches Found:</h3>

    ${vehicles.map(vehicle => buildDemoVehicleCard(vehicle)).join('\n')}

    <div class="cta-section">
      <h3>Ready to Find Your Next Profitable Deal?</h3>
      <p>Start your 7-day free trial and get daily AI-powered vehicle matches delivered to your inbox!</p>
      <a href="https://revvdoctor.com/auth/signup" class="cta-button">Start Free Trial →</a>
      <div class="trial-badge">
        🎉 7 Days Free - No Credit Card Required
      </div>
    </div>

    <div class="footer">
      <p><strong>What You Get:</strong></p>
      <p style="margin-top: 10px;">
        ✓ Daily AI-screened vehicle matches<br>
        ✓ Detailed risk analysis & profit estimates<br>
        ✓ Custom preference matching<br>
        ✓ Dashboard with full history<br>
        ✓ Priority alerts for high-value deals
      </p>
      <p style="margin-top: 20px;">
        <a href="https://revvdoctor.com/pricing">View Pricing</a> |
        <a href="https://revvdoctor.com/auth/signup">Sign Up Free</a>
      </p>
      <p style="margin-top: 15px; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} Revvdoctor. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Build individual vehicle card for demo
 */
function buildDemoVehicleCard(vehicle: VehicleMatch): string {
  const {
    make,
    model,
    year,
    price,
    mileage,
    auction_site,
    url: listing_url,
    match_score,
    match_reasons,
    ai_classification,
  } = vehicle

  // Determine score class
  let scoreClass = "medium"
  if (match_score >= 80) scoreClass = "high"

  // Format mileage
  const mileageStr = mileage ? `${mileage.toLocaleString()} mi` : "N/A"

  // Format price
  const priceStr = `£${price.toLocaleString()}`

  // Format profit potential
  const profitStr = ai_classification.profit_potential
    ? `£${ai_classification.profit_potential.toLocaleString()}`
    : "TBD"

  // Format repair cost
  const repairStr = ai_classification.repair_cost_estimate
    ? `£${ai_classification.repair_cost_estimate.toLocaleString()}`
    : "N/A"

  return `
    <div class="vehicle-card">
      <div class="vehicle-header">
        <h3 class="vehicle-title">${year} ${make} ${model}</h3>
        <span class="match-score ${scoreClass}">${match_score}% Match</span>
      </div>

      <div class="vehicle-details">
        <div class="detail-item">
          <span class="detail-label">Price:</span>
          <span class="detail-value">${priceStr}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Mileage:</span>
          <span class="detail-value">${mileageStr}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Auction:</span>
          <span class="detail-value">${auction_site}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Condition:</span>
          <span class="detail-value">${ai_classification.minor_fault_type}</span>
        </div>
      </div>

      <div class="ai-analysis">
        <h4>🤖 AI Analysis</h4>
        <p>${ai_classification.reason}</p>
        <div class="ai-metrics">
          <div class="ai-metric">
            <span class="ai-metric-label">Risk Score</span>
            <span class="ai-metric-value">${ai_classification.risk_score}/100</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric-label">AI Confidence</span>
            <span class="ai-metric-value">${ai_classification.confidence}%</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric-label">Repair Cost</span>
            <span class="ai-metric-value">${repairStr}</span>
          </div>
          <div class="ai-metric">
            <span class="ai-metric-label">Profit Potential</span>
            <span class="ai-metric-value" style="color: #10b981;">${profitStr}</span>
          </div>
        </div>
      </div>

      <div class="match-reasons">
        <h4>Why this is a good match:</h4>
        ${match_reasons.slice(0, 4).map(reason => `<span class="reason-tag">✓ ${reason}</span>`).join('')}
      </div>
    </div>
  `
}
