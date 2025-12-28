import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { dailyScraperJob, manualScraperJob } from "@/lib/inngest/functions"

// Serve Inngest functions to the Inngest platform
// This endpoint handles both GET (for registration) and POST (for execution)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyScraperJob, manualScraperJob],
})
