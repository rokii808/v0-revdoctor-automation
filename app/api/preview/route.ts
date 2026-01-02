import { NextResponse } from "next/server"
import { Resend } from "resend"
import { generateEmailHTML, generateEmailSubject } from "@/lib/email-template"

export async function POST(request: Request) {
  try {
    const { email, count = 2 } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("[v0] Sending preview email to:", email, "with", count, "cars")

    // Sample healthy cars data
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

    const sampleCars = allSampleCars.slice(0, count)

    console.log("[v0] Rendering email with", sampleCars.length, "cars...")

    const html = generateEmailHTML({
      items: sampleCars,
      date: new Date().toLocaleDateString(),
      dealerName: "Preview User",
      variant: "preview",
    })

    const subject = generateEmailSubject("preview", sampleCars.length)

    console.log("[v0] Email content rendered, sending via Resend...")

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
      carCount: sampleCars.length,
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
