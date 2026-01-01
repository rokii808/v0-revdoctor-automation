/**
 * Plan Configuration and Feature Limits
 * Defines what each subscription tier can access
 */

export type PlanTier = 'trial' | 'starter' | 'premium' | 'pro'

export interface PlanFeatures {
  // Core limits
  dailyCarLimit: number
  savedSearchesLimit: number
  exportFormats: ('csv' | 'excel' | 'json' | 'api')[]

  // Feature access
  basicAI: boolean
  advancedAI: boolean
  roiTracking: boolean
  teamAccounts: boolean
  apiAccess: boolean
  prioritySupport: boolean
  chatSupport: boolean
  earlyDelivery: boolean // 6 AM delivery
  customIntegrations: boolean
  dedicatedAccountManager: boolean

  // Analytics
  basicAnalytics: boolean
  advancedAnalytics: boolean
  customReports: boolean

  // Preferences
  basicPreferences: boolean
  advancedFilters: boolean
  customLogic: boolean
}

export interface PlanConfig {
  name: string
  tier: PlanTier
  price: number
  description: string
  features: PlanFeatures
  popular?: boolean
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  trial: {
    name: 'Free Trial',
    tier: 'trial',
    price: 0,
    description: '7-day free trial',
    features: {
      dailyCarLimit: 3,
      savedSearchesLimit: 1,
      exportFormats: ['csv'],
      basicAI: true,
      advancedAI: false,
      roiTracking: false,
      teamAccounts: false,
      apiAccess: false,
      prioritySupport: false,
      chatSupport: false,
      earlyDelivery: false,
      customIntegrations: false,
      dedicatedAccountManager: false,
      basicAnalytics: true,
      advancedAnalytics: false,
      customReports: false,
      basicPreferences: true,
      advancedFilters: false,
      customLogic: false,
    },
  },
  starter: {
    name: 'Starter',
    tier: 'starter',
    price: 97,
    description: 'Up to 5 cars daily',
    features: {
      dailyCarLimit: 5,
      savedSearchesLimit: 3,
      exportFormats: ['csv'],
      basicAI: true,
      advancedAI: false,
      roiTracking: false,
      teamAccounts: false,
      apiAccess: false,
      prioritySupport: false,
      chatSupport: false,
      earlyDelivery: false,
      customIntegrations: false,
      dedicatedAccountManager: false,
      basicAnalytics: true,
      advancedAnalytics: false,
      customReports: false,
      basicPreferences: true,
      advancedFilters: false,
      customLogic: false,
    },
  },
  premium: {
    name: 'Premium',
    tier: 'premium',
    price: 299,
    description: 'Up to 10 cars daily',
    popular: true,
    features: {
      dailyCarLimit: 10,
      savedSearchesLimit: 10,
      exportFormats: ['csv', 'excel'],
      basicAI: true,
      advancedAI: true,
      roiTracking: true,
      teamAccounts: false,
      apiAccess: false,
      prioritySupport: true,
      chatSupport: false,
      earlyDelivery: false,
      customIntegrations: false,
      dedicatedAccountManager: false,
      basicAnalytics: true,
      advancedAnalytics: true,
      customReports: false,
      basicPreferences: true,
      advancedFilters: true,
      customLogic: false,
    },
  },
  pro: {
    name: 'Pro',
    tier: 'pro',
    price: 599,
    description: 'Up to 25 cars daily',
    features: {
      dailyCarLimit: 25,
      savedSearchesLimit: 999, // Unlimited
      exportFormats: ['csv', 'excel', 'json', 'api'],
      basicAI: true,
      advancedAI: true,
      roiTracking: true,
      teamAccounts: true,
      apiAccess: true,
      prioritySupport: true,
      chatSupport: true,
      earlyDelivery: true,
      customIntegrations: true,
      dedicatedAccountManager: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      customReports: true,
      basicPreferences: true,
      advancedFilters: true,
      customLogic: true,
    },
  },
}

/**
 * Get plan configuration for a given tier
 */
export function getPlanConfig(tier: PlanTier): PlanConfig {
  return PLAN_CONFIGS[tier]
}

/**
 * Check if a feature is available for a given plan
 */
export function hasFeature(tier: PlanTier, feature: keyof PlanFeatures): boolean {
  return PLAN_CONFIGS[tier].features[feature] as boolean
}

/**
 * Get the daily car limit for a plan
 */
export function getDailyCarLimit(tier: PlanTier): number {
  return PLAN_CONFIGS[tier].features.dailyCarLimit
}

/**
 * Get saved searches limit for a plan
 */
export function getSavedSearchesLimit(tier: PlanTier): number {
  return PLAN_CONFIGS[tier].features.savedSearchesLimit
}

/**
 * Check if user can export in a specific format
 */
export function canExportFormat(tier: PlanTier, format: 'csv' | 'excel' | 'json' | 'api'): boolean {
  return PLAN_CONFIGS[tier].features.exportFormats.includes(format)
}

/**
 * Get upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: string, currentTier: PlanTier): string {
  const messages: Record<string, string> = {
    advancedAI: 'Upgrade to Premium to access advanced AI screening with profit potential analysis',
    roiTracking: 'Upgrade to Premium to track ROI and profit margins',
    teamAccounts: 'Upgrade to Pro to add team members and manage permissions',
    apiAccess: 'Upgrade to Pro to access the API and custom integrations',
    chatSupport: 'Upgrade to Pro to get live chat support',
    earlyDelivery: 'Upgrade to Pro to receive your digest at 6 AM',
    advancedFilters: 'Upgrade to Premium to use advanced search filters',
    excel: 'Upgrade to Premium to export to Excel format',
    json: 'Upgrade to Pro to export to JSON format',
    api: 'Upgrade to Pro to access API exports',
  }

  return messages[feature] || `Upgrade to unlock this feature`
}

/**
 * Get the next tier for upgrade suggestions
 */
export function getNextTier(currentTier: PlanTier): PlanTier | null {
  const tierOrder: PlanTier[] = ['trial', 'starter', 'premium', 'pro']
  const currentIndex = tierOrder.indexOf(currentTier)
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1]
  }
  return null
}
