import { NextResponse } from "next/server"
import { inngest } from "@/lib/inngest/client"

export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization")
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Trigger Inngest function for reliability and background processing
        await inngest.send({
            name: "scraper/manual.trigger",
            data: {
                sites: [] // Empty array implies all sites as per manualScraperJob logic
            }
        })

        return NextResponse.json({ success: true, message: "Scraper job triggered" })
    } catch (error) {
        console.error("Cron error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
