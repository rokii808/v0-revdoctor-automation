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

export interface DigestRecipient {
  dealer_id: string
  dealer_name: string
  email: string
  matches: VehicleMatch[]
  subscription_plan: string
}

interface SendDigestResult {
  success: boolean
  dealer_id: string
  email: string
  message_id?: string
  error?: string
}

/**
 * Send daily vehicle digest to a dealer
 */
export async function sendDailyDigest(
  recipient: DigestRecipient
): Promise<SendDigestResult> {
  try {
    console.log(
      `[Email] Sending digest to ${recipient.email} (${recipient.matches.length} matches)`
    )

    // Don't send empty digests
    if (recipient.matches.length === 0) {
      console.log(`[Email] No matches for ${recipient.email}, skipping`)
      return {
        success: true,
        dealer_id: recipient.dealer_id,
        email: recipient.email,
        message_id: "skipped_no_matches",
      }
    }

    const html = buildDigestHTML(recipient)
    const subject = buildSubjectLine(recipient)
    const resend = getResendClient()

    const { data, error } = await resend.emails.send({
      from: "Revvdoctor <digest@revvdoctor.com>",
      to: recipient.email,
      subject,
      html,
      tags: [
        { name: "type", value: "daily_digest" },
        { name: "dealer_id", value: recipient.dealer_id },
        { name: "matches", value: recipient.matches.length.toString() },
      ],
    })

    if (error) {
      console.error(`[Email] Failed to send to ${recipient.email}:`, error)
      return {
        success: false,
        dealer_id: recipient.dealer_id,
        email: recipient.email,
        error: error.message,
      }
    }

    console.log(`[Email] Successfully sent to ${recipient.email} (ID: ${data?.id})`)
    return {
      success: true,
      dealer_id: recipient.dealer_id,
      email: recipient.email,
      message_id: data?.id,
    }
  } catch (err) {
    console.error(`[Email] Unexpected error sending to ${recipient.email}:`, err)
    return {
      success: false,
      dealer_id: recipient.dealer_id,
      email: recipient.email,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

/**
 * Send digests to multiple dealers in parallel
 */
export async function sendDigestBatch(
  recipients: DigestRecipient[]
): Promise<SendDigestResult[]> {
  console.log(`[Email] Sending batch of ${recipients.length} digests`)

  // Send in parallel but limit concurrency
  const BATCH_SIZE = 5 // Send 5 emails at a time
  const results: SendDigestResult[] = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(recipient => sendDailyDigest(recipient))
    )
    results.push(...batchResults)

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const successful = results.filter(r => r.success).length
  console.log(`[Email] Batch complete: ${successful}/${results.length} sent successfully`)

  return results
}

/**
 * Build subject line with match count
 */
function buildSubjectLine(recipient: DigestRecipient): string {
  const count = recipient.matches.length
  const topScore = recipient.matches[0]?.match_score || 0

  if (count === 1) {
    return `🚗 1 new match found (${topScore}% fit)`
  } else if (topScore >= 80) {
    return `🚗 ${count} new matches - Including high-quality leads!`
  } else {
    return `🚗 ${count} new matches found today`
  }
}

/**
 * Build HTML email with vehicle cards
 */
function buildDigestHTML(recipient: DigestRecipient): string {
  const { dealer_name, matches } = recipient

  // Get top 10 matches only
  const topMatches = matches.slice(0, 10)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Vehicle Digest</title>
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
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #f97316;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #666;
      font-size: 16px;
    }
    .summary {
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .summary h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #f97316;
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
    .match-score.low {
      background-color: #6b7280;
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
    .view-button {
      display: inline-block;
      background-color: #f97316;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }
    .view-button:hover {
      background-color: #ea580c;
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
      color: #f97316;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Revvdoctor</h1>
      <p>Your Daily Vehicle Digest</p>
    </div>

    <div class="summary">
      <h2>Good morning, ${dealer_name || "Dealer"}!</h2>
      <p>We found <strong>${matches.length} healthy vehicles</strong> matching your preferences today.</p>
      ${topMatches.length < matches.length ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Showing top ${topMatches.length} matches</p>` : ''}
    </div>

    ${topMatches.map(vehicle => buildVehicleCard(vehicle)).join('\n')}

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://revvdoctor.com/dashboard" class="view-button">View All Matches in Dashboard</a>
    </div>

    <div class="footer">
      <p>This digest was generated by AI analysis of ${matches.length} auction listings.</p>
      <p style="margin-top: 10px;">
        <a href="https://revvdoctor.com/settings">Update Preferences</a> |
        <a href="https://revvdoctor.com/settings/notifications">Unsubscribe</a>
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
 * Build individual vehicle card HTML
 */
function buildVehicleCard(vehicle: VehicleMatch): string {
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
  let scoreClass = "low"
  if (match_score >= 80) scoreClass = "high"
  else if (match_score >= 60) scoreClass = "medium"

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
          <span class="detail-label">Location:</span>
          <span class="detail-value">${auction_site}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fault Type:</span>
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
            <span class="ai-metric-label">Confidence</span>
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
        <h4>Why this matches:</h4>
        ${match_reasons.map(reason => `<span class="reason-tag">✓ ${reason}</span>`).join('')}
      </div>

      <div style="margin-top: 15px;">
        <a href="${listing_url}" class="view-button">View Listing →</a>
      </div>
    </div>
  `
}

/**
 * Get digest statistics
 */
export function getDigestStats(results: SendDigestResult[]) {
  const total = results.length
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const skipped = results.filter(r => r.message_id === "skipped_no_matches").length

  return {
    total,
    successful,
    failed,
    skipped,
    sent: successful - skipped,
    success_rate: total > 0 ? ((successful / total) * 100).toFixed(1) : "0",
  }
}
