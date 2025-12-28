// Core database types based on Supabase schema

export interface Profile {
  id: string
  email: string | null
  name: string | null
  created_at: string
}

export interface DealerPreferences {
  makes?: string[]
  max_mileage?: number
  min_year?: number
  max_bid?: number
  locations?: string[]
}

export interface Dealer {
  id: string
  company_name: string | null
  prefs: DealerPreferences | null
  plan: 'trial' | 'basic' | 'pro'
  status: 'active' | 'inactive' | 'cancelled'
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_sub_id: string | null
  plan: 'basic' | 'pro' | null
  status: 'active' | 'cancelled' | 'past_due' | null
  current_period_end: string | null
}

export interface Insight {
  id: string
  user_id: string
  dealer_id?: string // May be used in some contexts
  title: string | null
  make: string | null
  year: number | null
  price: number | null
  mileage?: number | null
  url: string | null
  verdict: 'HEALTHY' | 'UNHEALTHY' | null
  minor_type?: string | null
  minor_fault_type?: string | null
  risk?: number | null
  risk_score?: number | null
  reason: string | null
  condition_notes?: string | null
  condition_html?: string | null
  source?: string | null
  status?: 'available' | 'rejected' | null
  created_at: string
}

export interface Digest {
  id: string
  user_id: string
  run_id: string | null
  count: number | null
  sent_at: string
}

export interface Lead {
  id: string
  dealer_id: string
  date: string
  number_sent: number
  first_url: string | null
  created_at: string
}

export interface SystemStats {
  id: string
  date: string
  total_dealers: number
  active_dealers: number
  cars_screened: number
  healthy_cars_found: number
  emails_sent: number
  created_at: string
}

// Component prop types

export interface DashboardStatsProps {
  dealer: Dealer | null
  recentLeads: Lead[]
}

export interface DashboardHeaderProps {
  user: Profile | null
  dealer: Dealer | null
}

export interface PreferencesCardProps {
  dealer: Dealer | null
}

export interface SubscriptionCardProps {
  dealer: Dealer | null
}

export interface TodaysHealthyCarsProps {
  dealer: Dealer | null
}

export interface RecentPicksProps {
  dealer: Dealer | null
  recentLeads: Insight[]
}

export interface AlertsFeedProps {
  dealer: Dealer | null
}

export interface AchievementsCardProps {
  dealer: Dealer | null
}

export interface SavedSearchesProps {
  dealer: Dealer | null
}

export interface TodaysHealthyCarsProps {
  dealer: Dealer | null
}

export interface AlertsFeedProps {
  dealer: Dealer | null
}

export interface EmailSettingsProps {
  dealer: Dealer | null
}

export interface ExportOptionsProps {
  dealer: Dealer | null
}

export interface AdminStatsProps {
  dealers: Dealer[]
  recentLeads: Lead[]
  systemStats: SystemStats[]
}

export interface SystemHealthProps {
  dealers: Dealer[]
  recentLeads: Lead[]
}

export interface DealersListProps {
  dealers: Dealer[]
}

export interface AdminHeaderProps {
  user: Profile | null
}

// API Response types

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardData {
  stats: {
    totalCarsFound: number
    healthyCars: number
    totalDigests: number
    carsThisWeek: number
  }
  recentInsights: Insight[]
  recentDigests: Digest[]
}

export interface ProfileData {
  profile: Profile | null
  dealer: Dealer | null
  subscription: Subscription | null
}
