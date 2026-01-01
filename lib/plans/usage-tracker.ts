/**
 * Daily Usage Tracker
 * Tracks and enforces daily car view limits per plan
 */

import { createClient } from '@/lib/supabase/server'
import { getDailyCarLimit, type PlanTier } from './config'

export interface UsageStats {
  viewedToday: number
  limit: number
  remaining: number
  canView: boolean
  percentage: number // 0-100
  resetAt: Date
}

/**
 * Get usage statistics for a dealer
 */
export async function getUsageStats(dealerId: string, planTier: PlanTier): Promise<UsageStats> {
  const limit = getDailyCarLimit(planTier)
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    const supabase = await createClient()

    // Count views for today
    const result = await supabase
      .from('vehicle_views')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('viewed_at', `${today}T00:00:00`)
      .lte('viewed_at', `${today}T23:59:59`)

    const count = (result as any).count
    const error = (result as any).error

    if (error) {
      console.error('[UsageTracker] Error fetching view count:', error)
      // Fallback to safe default
      return {
        viewedToday: 0,
        limit,
        remaining: limit,
        canView: true,
        percentage: 0,
        resetAt: getNextReset(),
      }
    }

    const viewedToday = count || 0
    const remaining = Math.max(0, limit - viewedToday)
    const canView = remaining > 0
    const percentage = Math.min(100, (viewedToday / limit) * 100)

    return {
      viewedToday,
      limit,
      remaining,
      canView,
      percentage,
      resetAt: getNextReset(),
    }
  } catch (err) {
    console.error('[UsageTracker] Unexpected error:', err)
    // Fallback to safe default
    return {
      viewedToday: 0,
      limit,
      remaining: limit,
      canView: true,
      percentage: 0,
      resetAt: getNextReset(),
    }
  }
}

/**
 * Record a vehicle view
 */
export async function recordVehicleView(
  dealerId: string,
  vehicleId: string,
  planTier: PlanTier
): Promise<{ success: boolean; stats: UsageStats }> {
  // Check if user can view more cars
  const stats = await getUsageStats(dealerId, planTier)

  if (!stats.canView) {
    return { success: false, stats }
  }

  try {
    const supabase = await createClient()

    // Record the view
    const { error } = await supabase
      .from('vehicle_views')
      .insert({
        dealer_id: dealerId,
        vehicle_id: vehicleId,
        viewed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[UsageTracker] Error recording view:', error)
      return { success: false, stats }
    }

    // Get updated stats
    const updatedStats = await getUsageStats(dealerId, planTier)

    return { success: true, stats: updatedStats }
  } catch (err) {
    console.error('[UsageTracker] Unexpected error recording view:', err)
    return { success: false, stats }
  }
}

/**
 * Check if user has reached their daily limit
 */
export async function hasReachedLimit(dealerId: string, planTier: PlanTier): Promise<boolean> {
  const stats = await getUsageStats(dealerId, planTier)
  return !stats.canView
}

/**
 * Get the next reset time (midnight tonight)
 */
function getNextReset(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

/**
 * Get time until reset as human-readable string
 */
export function getTimeUntilReset(): string {
  const now = new Date()
  const reset = getNextReset()
  const diff = reset.getTime() - now.getTime()

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Reset daily views (for testing/admin purposes)
 */
export async function resetDailyViews(dealerId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('vehicle_views')
      .delete()
      .eq('dealer_id', dealerId)
      .gte('viewed_at', `${today}T00:00:00`)

    if (error) {
      console.error('[UsageTracker] Error resetting views:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[UsageTracker] Unexpected error resetting views:', err)
    return false
  }
}
