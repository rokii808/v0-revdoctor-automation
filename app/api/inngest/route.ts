import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { dailyScraperJob, manualScraperJob } from "@/lib/inngest/functions"
import {
  dailyScraperJobEnhanced,
  triggerManualScrape,
  healthCheck,
} from "@/lib/inngest/functions-enhanced"
import { sendDemoAction } from "@/lib/inngest/functions-demo"

// Serve Inngest functions to the Inngest platform
// This endpoint handles both GET (for registration) and POST (for execution)
//
// Functions included:
// - dailyScraperJob (legacy) - Basic heuristic workflow
// - manualScraperJob (legacy) - Manual trigger for basic workflow
// - dailyScraperJobEnhanced (NEW) - AI-powered workflow with OpenAI
// - triggerManualScrape (NEW) - Manual trigger for AI workflow
// - healthCheck (NEW) - Validate environment and services
// - sendDemoAction (NEW) - "See It in Action" demo email
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Legacy functions (keep for backward compatibility)
    dailyScraperJob,
    manualScraperJob,
    // New AI-powered functions
    dailyScraperJobEnhanced,
    triggerManualScrape,
    healthCheck,
    // Demo function (public - no auth required)
    sendDemoAction,
  ],
})
