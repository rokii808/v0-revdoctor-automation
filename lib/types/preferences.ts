import { z } from "zod"

// User preference validation schema
export const userPreferencesSchema = z.object({
  // Vehicle Preferences
  preferred_makes: z.array(z.string()).max(20).optional(),
  preferred_models: z.array(z.string()).max(50).optional(),
  min_year: z.number().min(1990).max(new Date().getFullYear()),
  max_year: z.number().min(1990).max(new Date().getFullYear() + 1).optional(),
  min_price: z.number().min(0).max(1000000).default(0),
  max_price: z.number().min(0).max(1000000).default(50000),
  max_mileage: z.number().min(0).max(500000).default(100000),
  preferred_conditions: z.array(z.enum(['Excellent', 'Good', 'Fair', 'Poor'])).optional(),
  fuel_types: z.array(z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plugin Hybrid'])).optional(),
  transmission_types: z.array(z.enum(['Automatic', 'Manual'])).optional(),

  // Auction Site Preferences
  enabled_auction_sites: z.array(z.string()).min(1).max(10),

  // Notification Preferences
  email_frequency: z.enum(['daily', 'weekly', 'instant']).default('daily'),
  email_enabled: z.boolean().default(true),
  min_vehicles_to_send: z.number().min(0).max(50).default(1),
})

export type UserPreferences = z.infer<typeof userPreferencesSchema>

// Demo request schema (for non-registered users)
export const demoRequestSchema = z.object({
  email: z.string().email().max(100),
  preferences: z.object({
    makes: z.array(z.string()).max(5).optional(),
    min_year: z.number().min(2010).max(new Date().getFullYear()).optional(),
    max_price: z.number().min(0).max(100000).optional(),
  }).optional(),
})

export type DemoRequest = z.infer<typeof demoRequestSchema>

// Vehicle matching score calculator
export function calculateMatchScore(
  vehicle: {
    make: string
    model: string
    year: number
    price: number
    mileage?: number
    condition?: string
    fuel_type?: string
    transmission?: string
  },
  preferences: UserPreferences
): number {
  let score = 0
  let maxScore = 0

  // Make match (20 points)
  maxScore += 20
  if (!preferences.preferred_makes || preferences.preferred_makes.length === 0) {
    score += 20 // No preference = full points
  } else if (preferences.preferred_makes.some(make =>
    vehicle.make.toLowerCase().includes(make.toLowerCase())
  )) {
    score += 20
  }

  // Model match (15 points)
  maxScore += 15
  if (!preferences.preferred_models || preferences.preferred_models.length === 0) {
    score += 15
  } else if (preferences.preferred_models.some(model =>
    vehicle.model.toLowerCase().includes(model.toLowerCase())
  )) {
    score += 15
  }

  // Year match (15 points)
  maxScore += 15
  if (vehicle.year >= preferences.min_year) {
    const yearScore = preferences.max_year
      ? 15 * (1 - Math.abs(vehicle.year - preferences.min_year) / (preferences.max_year - preferences.min_year))
      : 15
    score += Math.max(0, yearScore)
  }

  // Price match (20 points)
  maxScore += 20
  if (vehicle.price >= preferences.min_price && vehicle.price <= preferences.max_price) {
    // Better score for lower prices within range
    const priceRange = preferences.max_price - preferences.min_price
    const pricePosition = vehicle.price - preferences.min_price
    score += 20 * (1 - pricePosition / priceRange) * 0.5 + 10
  }

  // Mileage match (15 points)
  maxScore += 15
  if (vehicle.mileage && vehicle.mileage <= preferences.max_mileage) {
    score += 15 * (1 - vehicle.mileage / preferences.max_mileage)
  } else if (!vehicle.mileage) {
    score += 7.5 // Partial points if mileage unknown
  }

  // Condition match (10 points)
  maxScore += 10
  if (!preferences.preferred_conditions || preferences.preferred_conditions.length === 0) {
    score += 10
  } else if (vehicle.condition && preferences.preferred_conditions.includes(vehicle.condition as any)) {
    score += 10
  }

  // Fuel type match (5 points)
  maxScore += 5
  if (!preferences.fuel_types || preferences.fuel_types.length === 0) {
    score += 5
  } else if (vehicle.fuel_type && preferences.fuel_types.includes(vehicle.fuel_type as any)) {
    score += 5
  }

  // Return percentage score
  return Math.round((score / maxScore) * 100)
}
