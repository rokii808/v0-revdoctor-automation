import { NextResponse } from "next/server"
import { Resend } from "resend"
import { generateEmailHTML, generateEmailSubject } from "@/lib/email-template"
import { scrapeRAW2K } from "@/lib/scrapers/raw2k"
import { classifyVehiclesWithAI } from "@/lib/analysis/ai-classifier-enhanced"

export async function POST(request: Request) {
  try {
    const { email, count = 2, useRealData = false } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("[Preview] Sending preview email to:", email, "with", count, "cars", useRealData ? "(REAL SCRAPE)" : "(MOCK DATA)")

    let carsToSend: any[] = []

    if (useRealData) {
      // REAL SCRAPER WORKFLOW
      console.log("[Preview] 🔄 Scraping RAW2K...")
      const scrapedVehicles = await scrapeRAW2K()
      console.log(`[Preview] ✅ Scraped ${scrapedVehicles.length} vehicles`)

      if (scrapedVehicles.length === 0) {
        return NextResponse.json(
          { error: "No vehicles found during scrape" },
          { status: 404 }
        )
      }

      // Classify with enhanced AI
      console.log("[Preview] 🤖 Classifying with AI...")
      const classified = await classifyVehiclesWithAI(scrapedVehicles.slice(0, 20)) // Limit to 20 for demo

      // Filter HEALTHY only
      const healthy = classified.filter(v => v.ai_classification.verdict === "HEALTHY")
      console.log(`[Preview] ✅ Found ${healthy.length} healthy vehicles`)

      if (healthy.length === 0) {
        return NextResponse.json(
          { error: "No healthy vehicles found. Try again later!" },
          { status: 404 }
        )
      }

      // Take top N by profit potential
      const topVehicles = healthy
        .sort((a, b) => b.ai_classification.profit_potential - a.ai_classification.profit_potential)
        .slice(0, count)

      // Convert to email format
      carsToSend = topVehicles.map(v => ({
        title: `${v.year} ${v.make} ${v.model}`,
        price: `£${v.price.toLocaleString()}`,
        verdict: v.ai_classification.verdict,
        faultType: v.ai_classification.minor_fault_type,
        risk: v.ai_classification.risk_score,
        reason: v.ai_classification.reason,
        url: v.url,
      }))

      console.log(`[Preview] 📧 Sending ${carsToSend.length} real vehicles`)
    } else {
      // MOCK DATA FOR QUICK TESTING
      const allSampleCars = [
        {
          title: "2019 BMW 3 Series 320d M Sport",
          price: "£18,500",
          verdict: "HEALTHY",
          faultType: "Service",
          risk: 15,
          reason: "Minor service light, otherwise excellent condition",
          url: "https://www.raw2k.co.uk/vehicle/bmw-3-series-2019",
        },
        {
          title: "2020 Audi A4 2.0 TDI S Line",
          price: "£22,000",
          verdict: "HEALTHY",
          faultType: "Tyre",
          risk: 20,
          reason: "Front tyres need replacing, no other issues",
          url: "https://www.raw2k.co.uk/vehicle/audi-a4-2020",
        },
        {
          title: "2018 Mercedes C220d AMG Line",
          price: "£19,750",
          verdict: "HEALTHY",
          faultType: "Battery",
          risk: 10,
          reason: "Weak battery, easily replaceable",
          url: "https://www.raw2k.co.uk/vehicle/mercedes-c220d-2018",
        },
        {
          title: "2021 Volkswagen Golf GTI",
          price: "£24,500",
          verdict: "HEALTHY",
          faultType: "MOT",
          risk: 5,
          reason: "MOT due next month, no advisories",
          url: "https://www.raw2k.co.uk/vehicle/vw-golf-gti-2021",
        },
      ]

      carsToSend = allSampleCars.slice(0, count)
      console.log("[Preview] 📧 Sending mock data for demo")
    }

    console.log("[Preview] Rendering email with", carsToSend.length, "cars...")

    const html = generateEmailHTML({
      items: carsToSend,
      date: new Date().toLocaleDateString(),
      dealerName: "Preview User",
      variant: "preview",
    })

    const subject = generateEmailSubject("preview", carsToSend.length)

    console.log("[Preview] Email content rendered, sending via Resend...")

    const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build")

    const result = await resend.emails.send({
      from: "Revvdoctor <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    })

    console.log("[v0] Preview email sent successfully:", result)

    if (result.error) {
      console.error("[v0] Resend API error:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error.message || "Email service error",
          details: result.error,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Preview email sent to ${email}`,
      emailId: result.data?.id,
      carCount: carsToSend.length,
      dataSource: useRealData ? "real_scrape" : "mock_data",
    })
  } catch (error) {
    console.error("[v0] Preview API error:", error)
    return NextResponse.json(
      {
        error: "Failed to send preview email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
