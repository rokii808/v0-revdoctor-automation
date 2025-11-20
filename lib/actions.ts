"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function savePrefs(
  userId: string,
  prefs: {
    makes: string[]
    minYear: number
    maxYear: number
    maxMileage: number
    maxBid: number
    locations: string[]
  },
) {
  try {
    const supabase = createAdminClient()

    // Update dealer preferences in database
    const { error } = await supabase.from("dealers_v2").upsert({
      id: userId,
      prefs: {
        makes: prefs.makes,
        min_year: prefs.minYear,
        max_year: prefs.maxYear,
        max_mileage: prefs.maxMileage,
        max_bid: prefs.maxBid,
        locations: prefs.locations,
      },
    })

    if (error) {
      throw error
    }

    // Optional: Call n8n webhook to reload agent cache
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/updatePrefs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, prefs }),
        })
      } catch (error) {
        console.error("Failed to notify n8n about preference update:", error)
      }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Save preferences error:", error)
    return { success: false, error: "Failed to save preferences" }
  }
}

export async function getPrefs(userId: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("dealers_v2").select("prefs").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return {
      success: true,
      prefs: data?.prefs || {
        makes: [],
        min_year: 2015,
        max_year: new Date().getFullYear(),
        max_mileage: 100000,
        max_bid: 15000,
        locations: [],
      },
    }
  } catch (error) {
    console.error("Get preferences error:", error)
    return { success: false, error: "Failed to load preferences" }
  }
}
