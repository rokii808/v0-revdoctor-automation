import { Resend } from "resend"
import type { HotDealResult } from "./hot-deal-detector"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || "RevvDoctor <noreply@revvdoctor.com>"

interface HotDealAlertParams {
  dealerEmail: string
  dealerName: string
  vehicle: {
    year: number
    make: string
    model: string
    price: number
    mileage: number
    url: string
    imageUrl?: string
    risk: number
    profit: number
  }
  hotDeal: HotDealResult
}

/**
 * Send instant hot deal alert email
 */
export async function sendHotDealAlert(params: HotDealAlertParams): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const { dealerEmail, dealerName, vehicle, hotDeal } = params

    const urgencyEmoji = hotDeal.urgency === "CRITICAL" ? "🔥" : hotDeal.urgency === "HIGH" ? "⚡" : "💎"
    const urgencyText = hotDeal.urgency === "CRITICAL" ? "URGENT" : hotDeal.urgency === "HIGH" ? "Hot Deal" : "Great Find"

    const subject = `${urgencyEmoji} ${urgencyText}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .urgency-banner {
      background: linear-gradient(135deg, ${hotDeal.urgency === "CRITICAL" ? "#dc2626 0%, #ef4444 100%" : hotDeal.urgency === "HIGH" ? "#ea580c 0%, #f59e0b 100%" : "#7c3aed 0%, #a855f7 100%"});
      color: white;
      padding: 20px;
      text-align: center;
    }
    .urgency-banner h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .urgency-banner p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .vehicle-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      background-color: #e5e7eb;
    }
    .content {
      padding: 30px;
    }
    .vehicle-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 10px 0;
    }
    .price {
      font-size: 32px;
      font-weight: 800;
      color: #059669;
      margin: 10px 0;
    }
    .profit-badge {
      display: inline-block;
      background-color: #d1fae5;
      color: #065f46;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .reasons {
      background-color: #f3f4f6;
      border-left: 4px solid ${hotDeal.urgency === "CRITICAL" ? "#dc2626" : hotDeal.urgency === "HIGH" ? "#ea580c" : "#7c3aed"};
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .reasons h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
    .reasons ul {
      margin: 0;
      padding-left: 20px;
    }
    .reasons li {
      margin: 5px 0;
      color: #4b5563;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .detail-item {
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 8px;
    }
    .detail-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s;
    }
    .cta-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      background-color: #f9fafb;
    }
    .score-badge {
      display: inline-block;
      background: ${hotDeal.score >= 90 ? "#dc2626" : hotDeal.score >= 75 ? "#ea580c" : "#7c3aed"};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Urgency Banner -->
    <div class="urgency-banner">
      <h1>${urgencyEmoji} ${urgencyText} Alert!</h1>
      <p>RevvDoctor AI found an exceptional match for you</p>
    </div>

    <!-- Vehicle Image -->
    ${vehicle.imageUrl ? `<img src="${vehicle.imageUrl}" alt="${vehicle.make} ${vehicle.model}" class="vehicle-image" />` : ''}

    <!-- Content -->
    <div class="content">
      <div class="score-badge">Hot Deal Score: ${hotDeal.score}/100</div>

      <h2 class="vehicle-title">${vehicle.year} ${vehicle.make} ${vehicle.model}</h2>

      <div class="price">£${vehicle.price.toLocaleString()}</div>

      <div class="profit-badge">
        💰 Estimated Profit: £${vehicle.profit.toLocaleString()}
      </div>

      <!-- Why This is Hot -->
      <div class="reasons">
        <h3>Why this is a ${urgencyText.toLowerCase()}:</h3>
        <ul>
          ${hotDeal.reasons.map(reason => `<li>${reason}</li>`).join('')}
        </ul>
      </div>

      <!-- Vehicle Details -->
      <div class="details">
        <div class="detail-item">
          <div class="detail-label">Mileage</div>
          <div class="detail-value">${vehicle.mileage.toLocaleString()} mi</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Risk Score</div>
          <div class="detail-value" style="color: ${vehicle.risk <= 30 ? "#059669" : vehicle.risk <= 50 ? "#ea580c" : "#dc2626"}">
            ${vehicle.risk}/100
          </div>
        </div>
      </div>

      <!-- CTA -->
      <center>
        <a href="${vehicle.url}" class="cta-button">
          View Full Listing →
        </a>
      </center>

      ${hotDeal.urgency === "CRITICAL" ? `
      <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          ⚠️ <strong>Act Fast!</strong> This vehicle matches your preferences extremely well and has high profit potential. Check the listing immediately.
        </p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This is an instant hot deal alert from your RevvDoctor AI agent.</p>
      <p style="margin-top: 10px; font-size: 12px;">
        You're receiving this because you have instant alerts enabled.<br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #3b82f6;">Manage your notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      subject: subject,
      html: html,
    })

    if (error) {
      console.error("[Hot Deal Alert] Email send error:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }

    console.log(`[Hot Deal Alert] Sent to ${dealerEmail} (ID: ${data?.id})`)

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error("[Hot Deal Alert] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
