import { NextResponse } from "next/server"
import { generateEmailHTML, generateEmailSubject } from "@/lib/email-template"

export async function POST(request: Request) {
  try {
    const { items, date, dealerName, variant } = await request.json()

    console.log("[v0] Rendering digest email with", items?.length || 0, "cars")

    const html = generateEmailHTML({
      items: items || [],
      date: date || new Date().toLocaleDateString(),
      dealerName: dealerName || "Dealer",
      variant: variant || "daily",
    })

    const subject = generateEmailSubject(variant || "daily", items?.length || 0)

    console.log("[v0] Email rendered successfully")

    return NextResponse.json({
      success: true,
      subject,
      html,
    })
  } catch (error) {
    console.error("[v0] Render digest error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to render email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
