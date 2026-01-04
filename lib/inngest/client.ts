import { Inngest } from "inngest"

// Create Inngest client with proper configuration for both dev and production
export const inngest = new Inngest({
  id: "revvdoctor",
  name: "RevvDoctor Background Jobs",
  // Only set eventKey in production
  // In development, omit eventKey to use local Inngest Dev Server
  ...(process.env.INNGEST_EVENT_KEY && {
    eventKey: process.env.INNGEST_EVENT_KEY
  }),
})
