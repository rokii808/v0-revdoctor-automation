import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { render } from "@react-email/render"
import { EmailTemplate } from "@/lib/email-template"

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret"
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[v0] Cron job started: send-digests")

  try {
    const supabase = createClient()

    const { data: dealers } = await supabase.from("dealers").select("*").eq("subscription_status", "active")

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active dealers",
      })
    }

    let sentCount = 0

    for (const dealer of dealers) {
      // Get today's healthy insights for this dealer
      const today = new Date().toISOString().split("T")[0]

      const { data: insights } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", dealer.user_id)
        .eq("verdict", "HEALTHY")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .limit(10)

      if (!insights || insights.length === 0) {
        console.log(`[v0] No insights for dealer ${dealer.dealer_name}`)
        continue
      }

      const vehicles = insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        make: insight.make,
        model: insight.minor_type,
        year: insight.year,
        price: insight.price,
        profit: Math.round(insight.price * 0.15), // 15% estimated profit
        risk: insight.risk <= 3 ? "Low" : insight.risk <= 6 ? "Medium" : "High",
        condition: "Good",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/vehicle/${insight.id}`,
        image: `/placeholder.svg?height=200&width=300&query=${insight.make}+${insight.minor_type}`,
      }))

      try {
        const emailHtml = render(
          EmailTemplate({
            dealerName: dealer.dealer_name || "Dealer",
            vehicles,
            totalVehicles: vehicles.length,
            unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
          }),
        )

        await resend.emails.send({
          from: "RevvDoctor <noreply@revvdoctor.com>",
          to: dealer.email,
          subject: `${vehicles.length} Healthy Cars Found Today`,
          html: emailHtml,
        })

        // Record digest sent
        await supabase.from("digests").insert({
          user_id: dealer.user_id,
          count: vehicles.length,
          sent_at: new Date().toISOString(),
        })

        sentCount++
        console.log(`[v0] Sent digest to ${dealer.email}`)
      } catch (emailError) {
        console.error(`[v0] Failed to send to ${dealer.email}:`, emailError)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const today = new Date().toISOString().split("T")[0]
    await supabase.from("system_stats").update({ emails_sent: sentCount }).eq("date", today)

    console.log(`[v0] Sent ${sentCount} digests successfully`)

    return NextResponse.json({
      success: true,
      sent: sentCount,
      dealers: dealers.length,
    })
  } catch (error) {
    console.error("[v0] Digest cron error:", error)
    return NextResponse.json({ error: "Digest sending failed" }, { status: 500 })
  }
}
