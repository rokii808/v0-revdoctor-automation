import type { VehicleListing } from "../scrapers"

export function heuristicAnalysis(vehicle: VehicleListing): {
  verdict: string
  reason: string
  risk_level: number
  profit_estimate: number
} {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicle.year
  const mileage = vehicle.mileage || 0

  let riskScore = 5
  let verdict = "HEALTHY"
  let reason = ""

  // Age factor
  if (age > 10) {
    riskScore += 2
    reason += "Older vehicle. "
  } else if (age < 3) {
    riskScore -= 1
  }

  // Mileage factor
  if (mileage > 100000) {
    riskScore += 2
    reason += "High mileage. "
  } else if (mileage < 30000) {
    riskScore -= 1
    reason += "Low mileage. "
  }

  // Price factor
  if (vehicle.price > 30000) {
    riskScore += 1
    reason += "Higher price point. "
  }

  // Condition factor
  if (vehicle.condition.toLowerCase().includes("poor") || vehicle.condition.toLowerCase().includes("damaged")) {
    riskScore += 3
    reason += "Condition concerns. "
  }

  riskScore = Math.max(1, Math.min(10, riskScore))

  if (riskScore > 7) {
    verdict = "AVOID"
    reason = "High risk: " + reason
  } else {
    reason = reason || "Standard market vehicle with acceptable parameters."
  }

  const profitEstimate = Math.max(0, Math.floor(vehicle.price * 0.15 - riskScore * 100))

  return {
    verdict,
    reason: reason.trim(),
    risk_level: riskScore,
    profit_estimate: profitEstimate,
  }
}
