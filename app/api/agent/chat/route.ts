import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/agent/chat - Chat with AI agent about vehicles and deals
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get dealer info
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id, company_name, prefs")
      .eq("user_id", user.id)
      .single()

    // Get recent vehicle matches for context (last 20)
    const { data: recentMatches } = await supabase
      .from("vehicle_matches")
      .select("*")
      .eq("dealer_id", dealer?.id)
      .order("created_at", { ascending: false })
      .limit(20)

    // Build context for AI
    const vehicleContext =
      recentMatches && recentMatches.length > 0
        ? `Recent vehicle matches:\n${recentMatches
            .map(
              (v, i) =>
                `${i + 1}. ${v.year} ${v.make} ${v.model} - £${v.price?.toLocaleString() || "N/A"} (${v.mileage?.toLocaleString() || "N/A"} miles)\n   Risk Score: ${v.risk_score}/100, Profit Potential: £${v.profit_potential || "N/A"}, Verdict: ${v.verdict}`
            )
            .join("\n")}`
        : "No recent vehicle matches available."

    const preferences = dealer?.prefs
      ? `User preferences: Max budget £${dealer.prefs.maxBid || "N/A"}, Min year: ${dealer.prefs.minYear || "N/A"}, Preferred makes: ${dealer.prefs.makes?.join(", ") || "Any"}, Max mileage: ${dealer.prefs.maxMileage || "N/A"}`
      : ""

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are RevvDoctor AI, an intelligent assistant for car dealers. You help dealers find profitable vehicles, analyze deals, and maximize ROI. You have access to real-time vehicle data, AI classifications, and market insights.

Your personality:
- Professional but friendly
- Data-driven and analytical
- Focused on ROI and profitability
- Brief and to the point (2-3 sentences max unless asked for details)

${preferences}

${vehicleContext}

When answering:
- Be specific with numbers and data
- Suggest actionable next steps
- Highlight profit potential
- Warn about high-risk vehicles
- Keep responses concise and scannable`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const responseContent = completion.choices[0]?.message?.content || "Sorry, I couldn't process that request."

    // Generate contextual suggestions based on the conversation
    const suggestions = generateSuggestions(message, recentMatches || [])

    return NextResponse.json({
      response: responseContent,
      suggestions,
    })
  } catch (error: any) {
    console.error("Agent chat error:", error)

    // If OpenAI API key is missing, return helpful error
    if (error?.message?.includes("API key")) {
      return NextResponse.json(
        {
          response:
            "Chat is currently unavailable. The OpenAI API key needs to be configured. Please contact support.",
          suggestions: ["Check agent status", "View dashboard", "See recent matches"],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

function generateSuggestions(message: string, recentMatches: any[]): string[] {
  const lower = message.toLowerCase()

  // Context-aware suggestions
  if (lower.includes("deal") || lower.includes("best") || lower.includes("show")) {
    return [
      "What's my average ROI this week?",
      "Find vehicles by profit potential",
      "Show me low-risk opportunities",
    ]
  }

  if (lower.includes("roi") || lower.includes("profit")) {
    return ["Show me the best deals", "Find high-margin vehicles", "What are the top picks today?"]
  }

  if (lower.includes("find") || lower.includes("search")) {
    return ["Show me luxury cars", "Find vehicles under £15k", "What about SUVs?"]
  }

  if (recentMatches.length > 0) {
    return [
      "Show me today's best deals",
      "What's my average ROI?",
      "Find low-risk opportunities",
    ]
  }

  return [
    "Show me the best deals",
    "What's my profit potential?",
    "Find vehicles in my budget",
  ]
}
