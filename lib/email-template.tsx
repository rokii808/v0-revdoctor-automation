export interface CarItem {
  id?: string
  title: string
  price: string
  verdict: string
  faultType: string
  risk: number
  reason: string
  url: string
  source_url?: string
}

export interface EmailTemplateProps {
  items: CarItem[]
  date: string
  dealerName: string
  variant?: "daily" | "preview"
}

export function generateEmailHTML({ items, date, dealerName, variant = "daily" }: EmailTemplateProps): string {
  const carCards = items
    .map((car) => {
      const detailUrl = car.id
        ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vehicle/${car.id}`
        : car.url

      return `
    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
        ${car.title}
      </h3>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 24px; font-weight: 700; color: #FF007A;">${car.price}</span>
        <span style="background: linear-gradient(135deg, #FF007A 0%, #8A2EFF 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          ${car.verdict}
        </span>
      </div>
      <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #666; font-size: 14px;">Fault Type:</span>
          <span style="color: #1a1a1a; font-weight: 600; font-size: 14px;">${car.faultType}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666; font-size: 14px;">Risk Score:</span>
          <span style="color: ${car.risk <= 15 ? "#10b981" : car.risk <= 25 ? "#f59e0b" : "#ef4444"}; font-weight: 600; font-size: 14px;">${car.risk}%</span>
        </div>
      </div>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        ${car.reason}
      </p>
      <a href="${detailUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF007A 0%, #8A2EFF 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        ${car.id ? "View Full Details →" : "View on Auction Site →"}
      </a>
    </div>
  `
    })
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revvdoctor Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #FF007A 0%, #8A2EFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        Revvdoctor
      </h1>
      <p style="margin: 0; color: #666; font-size: 14px;">AI-powered car auction screening</p>
    </div>

    <!-- Greeting -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
        ${variant === "preview" ? "Preview: " : ""}Your Daily Healthy Cars
      </h2>
      <p style="margin: 0; color: #666; font-size: 16px;">
        Hi ${dealerName}, here are ${items.length} investment-ready vehicles for ${date}
      </p>
    </div>

    <!-- Car Cards -->
    ${carCards}

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
        Powered by Revvdoctor AI
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} Revvdoctor. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateEmailSubject(variant: "daily" | "preview", carCount: number): string {
  const prefix = variant === "preview" ? "[Preview] " : ""
  return `${prefix}${carCount} Healthy Cars Ready for You Today`
}
