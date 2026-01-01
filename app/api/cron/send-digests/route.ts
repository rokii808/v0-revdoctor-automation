import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { generateEmailHTML, generateEmailSubject, type CarItem } from "@/lib/email-template"

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret"
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build")

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[v0] Cron job started: send-digests")

  try {
    const supabase = createAdminClient()

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

      const vehicles: CarItem[] = insights.map((insight: any) => ({
        id: insight.id,
        title: insight.title,
        price: `£${insight.price?.toLocaleString() || "N/A"}`,
        verdict: "HEALTHY",
        faultType: "None",
        risk: insight.risk || 10,
        reason: "This vehicle passed all checks and is ready for investment",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/vehicle/${insight.id}`,
      }))

      try {
        const emailHtml = generateEmailHTML({
          items: vehicles,
          date: new Date().toLocaleDateString(),
          dealerName: dealer.dealer_name || "Dealer",
          variant: "daily",
        })

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
