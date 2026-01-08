import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

// Support multiple AI providers via OpenRouter or direct OpenAI
const AI_PROVIDER = process.env.AI_PROVIDER || "openrouter" // "openrouter" or "openai"
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Default to free models on OpenRouter
const AI_MODEL = process.env.AI_MODEL || "google/gemini-flash-1.5-8b" // Free model

const client = new OpenAI({
  apiKey: AI_PROVIDER === "openrouter" ? OPENROUTER_API_KEY : OPENAI_API_KEY,
  baseURL: AI_PROVIDER === "openrouter"
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1",
  defaultHeaders: AI_PROVIDER === "openrouter"
    ? {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://revvdoctor.com",
        "X-Title": "RevvDoctor AI Agent",
      }
    : {},
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

    // Define available functions the AI can call
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "filter_vehicles",
          description: "Filter vehicles by criteria like make, price range, or risk score",
          parameters: {
            type: "object",
            properties: {
              make: { type: "string", description: "Filter by vehicle make (e.g., BMW, Audi)" },
              maxPrice: { type: "number", description: "Maximum price in GBP" },
              minPrice: { type: "number", description: "Minimum price in GBP" },
              maxRisk: { type: "number", description: "Maximum risk score (0-100)" },
              minProfit: { type: "number", description: "Minimum profit potential in GBP" },
            },
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_vehicle_details",
          description: "Get detailed information about a specific vehicle by ID or index",
          parameters: {
            type: "object",
            properties: {
              vehicleIndex: { type: "number", description: "Index of the vehicle from the list (1-based)" },
            },
            required: ["vehicleIndex"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "save_favorite",
          description: "Save a vehicle to favorites for later review",
          parameters: {
            type: "object",
            properties: {
              vehicleIndex: { type: "number", description: "Index of the vehicle to save (1-based)" },
            },
            required: ["vehicleIndex"],
          },
        },
      },
    ]

    // Call AI provider with function calling support (OpenRouter or OpenAI)
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
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
- Keep responses concise and scannable
- Use available functions to help users filter, analyze, and save vehicles
- When showing vehicles, reference them by their number (1, 2, 3, etc.)`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 300,
    })

    const responseMessage = completion.choices[0]?.message

    // Check if AI wants to call a function
    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)

      // Execute the function
      const functionResult = await executeFunctionCall(
        functionName,
        functionArgs,
        dealer?.id,
        recentMatches || [],
        supabase
      )

      // Get AI's final response incorporating the function result
      const followUpCompletion = await client.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: `You are RevvDoctor AI. Present the results in a clear, concise way.`,
          },
          {
            role: "user",
            content: message,
          },
          responseMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResult),
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      })

      const finalResponse = followUpCompletion.choices[0]?.message?.content || "Done!"
      const suggestions = generateSuggestions(message, recentMatches || [])

      return NextResponse.json({
        response: finalResponse,
        suggestions,
        action: functionName,
        actionResult: functionResult,
      })
    }

    const responseContent = responseMessage?.content || "Sorry, I couldn't process that request."

    // Generate contextual suggestions based on the conversation
    const suggestions = generateSuggestions(message, recentMatches || [])

    return NextResponse.json({
      response: responseContent,
      suggestions,
    })
  } catch (error: any) {
    console.error("Agent chat error:", error)

    // If API key is missing, return helpful error
    if (error?.message?.includes("API key") || error?.status === 401) {
      const provider = AI_PROVIDER === "openrouter" ? "OpenRouter" : "OpenAI"
      return NextResponse.json(
        {
          response:
            `Chat is currently unavailable. ${provider} API key needs to be configured. Please contact support.`,
          suggestions: ["Check agent status", "View dashboard", "See recent matches"],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

async function executeFunctionCall(
  functionName: string,
  args: any,
  dealerId: string,
  recentMatches: any[],
  supabase: any
): Promise<any> {
  switch (functionName) {
    case "filter_vehicles":
      let filtered = [...recentMatches]

      if (args.make) {
        filtered = filtered.filter((v) => v.make?.toLowerCase() === args.make.toLowerCase())
      }
      if (args.maxPrice) {
        filtered = filtered.filter((v) => v.price <= args.maxPrice)
      }
      if (args.minPrice) {
        filtered = filtered.filter((v) => v.price >= args.minPrice)
      }
      if (args.maxRisk) {
        filtered = filtered.filter((v) => v.risk_score <= args.maxRisk)
      }
      if (args.minProfit) {
        filtered = filtered.filter((v) => (v.profit_potential || 0) >= args.minProfit)
      }

      return {
        success: true,
        count: filtered.length,
        vehicles: filtered.slice(0, 5).map((v, i) => ({
          index: i + 1,
          make: v.make,
          model: v.model,
          year: v.year,
          price: v.price,
          risk: v.risk_score,
          profit: v.profit_potential,
        })),
      }

    case "get_vehicle_details":
      const index = args.vehicleIndex - 1
      if (index < 0 || index >= recentMatches.length) {
        return { success: false, error: "Vehicle not found" }
      }

      const vehicle = recentMatches[index]
      return {
        success: true,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          mileage: vehicle.mileage,
          risk: vehicle.risk_score,
          verdict: vehicle.verdict,
          profit: vehicle.profit_potential,
          url: vehicle.listing_url,
        },
      }

    case "save_favorite":
      const saveIndex = args.vehicleIndex - 1
      if (saveIndex < 0 || saveIndex >= recentMatches.length) {
        return { success: false, error: "Vehicle not found" }
      }

      const vehicleToSave = recentMatches[saveIndex]

      // Record SAVE interaction
      await supabase.from("dealer_interactions").insert({
        dealer_id: dealerId,
        vehicle_match_id: vehicleToSave.id,
        interaction_type: "SAVE",
      })

      // Update vehicle_matches table
      await supabase
        .from("vehicle_matches")
        .update({ saved: true, updated_at: new Date().toISOString() })
        .eq("id", vehicleToSave.id)

      return {
        success: true,
        message: `Saved ${vehicleToSave.year} ${vehicleToSave.make} ${vehicleToSave.model} to favorites`,
      }

    default:
      return { success: false, error: "Unknown function" }
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
