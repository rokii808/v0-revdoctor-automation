import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Get dealer profile
  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (dealerError || !dealer) {
    return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
  }

  // Get today's vehicles
  const today = new Date().toISOString().split("T")[0]
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicle_matches")
    .select("*")
    .eq("dealer_id", dealer.id)
    .gte("created_at", today)
    .order("created_at", { ascending: false })
    .limit(50)

  if (vehiclesError) {
    return NextResponse.json({ error: vehiclesError.message }, { status: 500 })
  }

  return NextResponse.json({ vehicles: vehicles || [] })
}
