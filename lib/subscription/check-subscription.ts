import { createClient } from "@/lib/supabase/server"

export interface SubscriptionStatus {
  isActive: boolean
  status: 'active' | 'trial' | 'expired' | 'canceled' | 'payment_failed' | null
  plan: 'basic' | 'startup' | 'premium' | 'trial' | null
  expiresAt: Date | null
  daysLeft: number
  canAccessFeature: (feature: string) => boolean
  limitReached: (feature: string, currentCount: number) => boolean
  paymentFailed: boolean
}

// Feature limits per plan
const PLAN_LIMITS = {
  trial: {
    vehicles_per_day: 10,
    saved_searches: 2,
    email_alerts: true,
    export: false,
    api_access: false,
    priority_support: false,
  },
  basic: {
    vehicles_per_day: 50,
    saved_searches: 5,
    email_alerts: true,
    export: true,
    api_access: false,
    priority_support: false,
  },
  startup: {
    vehicles_per_day: 200,
    saved_searches: 15,
    email_alerts: true,
    export: true,
    api_access: true,
    priority_support: false,
  },
  premium: {
    vehicles_per_day: 999999, // Unlimited
    saved_searches: 999999,   // Unlimited
    email_alerts: true,
    export: true,
    api_access: true,
    priority_support: true,
  },
}

/**
 * Check subscription status and permissions
 * This is the single source of truth for subscription enforcement
 */
export async function checkSubscriptionStatus(): Promise<SubscriptionStatus> {
  const supabase = createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return createInactiveStatus()
  }

  // Get dealer profile with subscription info
  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("subscription_status, subscription_expires_at, selected_plan, payment_failed")
    .eq("user_id", user.id)
    .single()

  if (dealerError || !dealer) {
    return createInactiveStatus()
  }

  const now = new Date()
  const expiresAt = dealer.subscription_expires_at ? new Date(dealer.subscription_expires_at) : null
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0

  // Determine if subscription is active
  const status = dealer.subscription_status as SubscriptionStatus['status']
  const isActive = (status === 'active' || (status === 'trial' && expiresAt && expiresAt > now))
  const paymentFailed = dealer.payment_failed === true

  // Get plan (default to trial if not set)
  const plan = (dealer.selected_plan || 'trial') as SubscriptionStatus['plan']

  return {
    isActive: isActive && !paymentFailed,
    status,
    plan,
    expiresAt,
    daysLeft,
    paymentFailed,
    canAccessFeature: (feature: string) => {
      if (paymentFailed) return false
      if (!isActive) return false

      const limits = PLAN_LIMITS[plan || 'trial']
      return limits[feature as keyof typeof limits] === true
    },
    limitReached: (feature: string, currentCount: number) => {
      if (paymentFailed) return true
      if (!isActive) return true

      const limits = PLAN_LIMITS[plan || 'trial']
      const limit = limits[feature as keyof typeof limits]

      if (typeof limit === 'number') {
        return currentCount >= limit
      }

      return false
    },
  }
}

/**
 * Helper to create inactive subscription status
 */
function createInactiveStatus(): SubscriptionStatus {
  return {
    isActive: false,
    status: null,
    plan: null,
    expiresAt: null,
    daysLeft: 0,
    paymentFailed: false,
    canAccessFeature: () => false,
    limitReached: () => true,
  }
}

/**
 * Enforce subscription for API routes
 * Returns error response if subscription invalid
 */
export async function enforceSubscription(requiredFeature?: string) {
  const subscription = await checkSubscriptionStatus()

  // Payment failed - block everything
  if (subscription.paymentFailed) {
    return {
      error: "payment_failed",
      message: "Your payment method failed. Please update your payment information to continue.",
      status: 402, // Payment Required
    }
  }

  // Subscription expired
  if (!subscription.isActive) {
    return {
      error: "subscription_inactive",
      message: subscription.status === 'trial'
        ? "Your free trial has expired. Please subscribe to continue."
        : "Your subscription is not active. Please renew to continue.",
      status: 403, // Forbidden
    }
  }

  // Check feature access
  if (requiredFeature && !subscription.canAccessFeature(requiredFeature)) {
    return {
      error: "feature_not_available",
      message: `This feature is not available on your ${subscription.plan} plan. Please upgrade to access it.`,
      status: 403,
      plan: subscription.plan,
    }
  }

  // All checks passed
  return null
}

/**
 * Get current usage for limits
 */
export async function getCurrentUsage(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // Get today's vehicle matches count
  const { count: vehiclesToday } = await supabase
    .from("vehicle_matches")
    .select("*", { count: 'exact', head: true })
    .eq("dealer_id", userId)
    .gte("created_at", today)

  // Get saved searches count
  const { count: savedSearches } = await supabase
    .from("saved_searches")
    .select("*", { count: 'exact', head: true })
    .eq("dealer_id", userId)

  return {
    vehicles_per_day: vehiclesToday || 0,
    saved_searches: savedSearches || 0,
  }
}

/**
 * Check if user can perform action based on limits
 */
export async function checkUsageLimit(feature: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await checkSubscriptionStatus()

  if (!subscription.isActive) {
    return {
      allowed: false,
      reason: subscription.paymentFailed
        ? "Payment failed. Please update your payment method."
        : "Subscription inactive. Please renew your subscription."
    }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, reason: "Not authenticated" }
  }

  const usage = await getCurrentUsage(user.id)
  const currentCount = usage[feature as keyof typeof usage] || 0

  if (subscription.limitReached(feature, currentCount)) {
    const limits = PLAN_LIMITS[subscription.plan || 'trial']
    const limit = limits[feature as keyof typeof limits]

    return {
      allowed: false,
      reason: `You've reached your ${subscription.plan} plan limit of ${limit} ${feature.replace('_', ' ')}. Please upgrade to continue.`
    }
  }

  return { allowed: true }
}
