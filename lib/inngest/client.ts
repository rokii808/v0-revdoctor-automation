import { Inngest } from "inngest"

// Create Inngest client with proper configuration for both dev and production
export const inngest = new Inngest({
  id: "revvdoctor",
  name: "RevvDoctor Background Jobs",
  // Event key is required for sending events
  // In development, Inngest Dev Server runs without auth
  // In production, set INNGEST_EVENT_KEY environment variable
  eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key",
})
