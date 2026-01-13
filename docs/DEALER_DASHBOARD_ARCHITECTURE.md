# Dealer Dashboard Architecture - Adapted from Consumer Platform

## Overview

This adapts the consumer vehicle recommendation architecture for **dealer dashboards**, focusing on:
- Learning dealer preferences from interactions
- Personalizing auction vehicle recommendations
- Transparent metrics with clear breakdowns
- Simple, dealer-focused UX

---

## Key Differences from Consumer Platform

| Feature | Consumer Platform | Dealer Platform |
|---------|------------------|-----------------|
| **Goal** | Help buyers find cars they'll like | Help dealers find profitable inventory |
| **Data Source** | Consumer listings (AutoTrader, eBay) | Auction sites (RAW2K, BCA, Autorola, Manheim) |
| **Scoring** | Price gap + user preference match | AI health classification + profit potential |
| **Learning** | Collaborative filtering (similar users) | Individual dealer learning only |
| **Delivery** | Real-time feed + app | Daily email digest + dashboard |
| **Metrics** | Matches found, personalization strength | Scans completed, healthy vehicles, profit estimates |

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    DEALER DASHBOARD (React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Metrics    │  │  Today's     │  │  Preferences │      │
│  │  Dashboard   │  │  Matches     │  │   Settings   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  /api/dealers/matches    /api/dealers/metrics               │
│  /api/dealers/interact   /api/dealers/preferences           │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  SCRAPING   │  │  AI HEALTH  │  │  LEARNING   │
    │  (Apify/    │  │  CLASSIFIER │  │  ENGINE     │
    │   Inngest)  │  │ (OpenRouter)│  │  (Simple)   │
    └─────────────┘  └─────────────┘  └─────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌─────────────────┐
                    │   SUPABASE DB   │
                    │   + Redis Cache │
                    └─────────────────┘
\`\`\`

---

## 1. Enhanced Database Schema

Add interaction tracking and learned preferences to existing schema:

\`\`\`sql
-- supabase/migrations/20260104_add_dealer_learning.sql

-- Track dealer interactions with matched vehicles
CREATE TABLE dealer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_match_id UUID REFERENCES vehicle_matches(id) ON DELETE CASCADE,

  -- Interaction type
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN ('VIEW', 'EMAIL_OPEN', 'EMAIL_CLICK', 'SAVE', 'SKIP', 'CONTACT_SELLER')
  ),

  -- Metadata
  duration_seconds INTEGER, -- How long they viewed
  metadata JSONB, -- Additional context

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT unique_dealer_vehicle_interaction UNIQUE(dealer_id, vehicle_match_id, interaction_type)
);

CREATE INDEX idx_dealer_interactions_dealer ON dealer_interactions(dealer_id);
CREATE INDEX idx_dealer_interactions_type ON dealer_interactions(interaction_type);
CREATE INDEX idx_dealer_interactions_created ON dealer_interactions(created_at DESC);

-- Store learned preferences (ML-derived from behavior)
CREATE TABLE dealer_learned_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID UNIQUE REFERENCES dealers(id) ON DELETE CASCADE,

  -- Learned from interactions
  learned_makes JSONB, -- {"BMW": 0.8, "Audi": 0.6} - preference scores
  learned_price_range JSONB, -- {"min": 15000, "max": 35000}
  learned_mileage_preference JSONB, -- {"max": 60000, "preferred": 40000}
  learned_year_preference JSONB, -- {"min": 2018, "preferred": 2020}
  learned_condition_tolerance JSONB, -- What fault types they accept

  -- Scoring weights (personalized)
  price_gap_weight DECIMAL DEFAULT 0.35, -- How much they care about price gap
  condition_weight DECIMAL DEFAULT 0.25, -- How much they care about condition
  preference_weight DECIMAL DEFAULT 0.20, -- How much they care about make/model match

  -- Statistics
  total_interactions INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_skips INTEGER DEFAULT 0,
  avg_view_duration_seconds INTEGER,

  -- Last learning update
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track email engagement
CREATE TABLE dealer_email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  digest_sent_at TIMESTAMPTZ NOT NULL,

  -- Events
  email_opened BOOLEAN DEFAULT FALSE,
  email_opened_at TIMESTAMPTZ,

  vehicle_clicks INTEGER DEFAULT 0, -- How many vehicles they clicked
  clicked_vehicle_ids UUID[], -- Which vehicles they clicked

  time_to_open_minutes INTEGER, -- How long until they opened
  engagement_score INTEGER, -- 0-100 based on clicks, time spent

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_events_dealer ON dealer_email_events(dealer_id);
CREATE INDEX idx_email_events_sent ON dealer_email_events(digest_sent_at DESC);

-- Function to update learned preferences
CREATE OR REPLACE FUNCTION update_dealer_learned_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment interaction counter
  UPDATE dealer_learned_preferences
  SET
    total_interactions = total_interactions + 1,
    total_saves = total_saves + CASE WHEN NEW.interaction_type = 'SAVE' THEN 1 ELSE 0 END,
    total_skips = total_skips + CASE WHEN NEW.interaction_type = 'SKIP' THEN 1 ELSE 0 END,
    last_updated = NOW()
  WHERE dealer_id = NEW.dealer_id;

  -- Create record if doesn't exist
  INSERT INTO dealer_learned_preferences (dealer_id)
  VALUES (NEW.dealer_id)
  ON CONFLICT (dealer_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learned_preferences
AFTER INSERT ON dealer_interactions
FOR EACH ROW
EXECUTE FUNCTION update_dealer_learned_preferences();
\`\`\`

---

## 2. API Routes for Dealer Dashboard

\`\`\`typescript
// app/api/dealers/matches/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get personalized vehicle matches for dealer
 * Includes learned preferences and personalized scoring
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get authenticated dealer
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get dealer
  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, email, dealer_name, prefs, min_year, max_bid')
    .eq('user_id', user.id)
    .single()

  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const limit = parseInt(searchParams.get('limit') || '50')

  // Get learned preferences
  const { data: learnedPrefs } = await supabase
    .from('dealer_learned_preferences')
    .select('*')
    .eq('dealer_id', dealer.id)
    .single()

  // Get today's matches with personalized scoring
  const { data: matches, error } = await supabase
    .from('vehicle_matches')
    .select(`
      *,
      interactions:dealer_interactions(interaction_type, created_at)
    `)
    .eq('dealer_id', dealer.id)
    .gte('classified_at', `${date}T00:00:00`)
    .lt('classified_at', `${date}T23:59:59`)
    .order('match_score', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Apply personalized scoring if we have learned preferences
  const personalizedMatches = matches.map(match => {
    let personalizedScore = match.match_score
    const reasons = [...(match.match_reasons || [])]

    if (learnedPrefs) {
      // Boost score for learned preferred makes
      const learnedMakes = learnedPrefs.learned_makes as Record<string, number> || {}
      if (learnedMakes[match.make]) {
        const boost = learnedMakes[match.make] * 10 // Up to +10 points
        personalizedScore += boost
        reasons.push(`You often save ${match.make} vehicles (+${boost.toFixed(0)} points)`)
      }

      // Adjust based on learned price range
      const learnedPriceRange = learnedPrefs.learned_price_range as { min?: number, max?: number } || {}
      if (learnedPriceRange.min && learnedPriceRange.max) {
        const midpoint = (learnedPriceRange.min + learnedPriceRange.max) / 2
        const distance = Math.abs(match.price - midpoint)
        const maxDistance = learnedPriceRange.max - midpoint
        const priceMatchScore = (1 - distance / maxDistance) * 5 // Up to +5 points
        if (priceMatchScore > 2) {
          personalizedScore += priceMatchScore
          reasons.push(`In your typical price range (+${priceMatchScore.toFixed(0)} points)`)
        }
      }
    }

    return {
      ...match,
      personalizedScore: Math.min(100, Math.round(personalizedScore)),
      personalized: !!learnedPrefs,
      enhancedReasons: reasons,
    }
  })

  // Sort by personalized score
  personalizedMatches.sort((a, b) => b.personalizedScore - a.personalizedScore)

  return NextResponse.json({
    matches: personalizedMatches,
    date,
    total: personalizedMatches.length,
    personalized: !!learnedPrefs,
    learnedStats: learnedPrefs ? {
      totalInteractions: learnedPrefs.total_interactions,
      totalSaves: learnedPrefs.total_saves,
      topMakes: Object.entries(learnedPrefs.learned_makes as Record<string, number> || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([make, score]) => ({ make, score })),
    } : null,
  })
}
\`\`\`

\`\`\`typescript
// app/api/dealers/interact/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Record dealer interaction with a vehicle match
 * This feeds into the learning engine
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { vehicleMatchId, interactionType, duration, metadata } = body

  // Validate interaction type
  const validTypes = ['VIEW', 'EMAIL_OPEN', 'EMAIL_CLICK', 'SAVE', 'SKIP', 'CONTACT_SELLER']
  if (!validTypes.includes(interactionType)) {
    return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 })
  }

  // Get dealer
  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }

  // Record interaction
  const { data: interaction, error } = await supabase
    .from('dealer_interactions')
    .upsert({
      dealer_id: dealer.id,
      vehicle_match_id: vehicleMatchId,
      interaction_type: interactionType,
      duration_seconds: duration,
      metadata,
    }, {
      onConflict: 'dealer_id,vehicle_match_id,interaction_type',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // For strong signals (SAVE, CONTACT_SELLER), update learned preferences immediately
  if (['SAVE', 'CONTACT_SELLER'].includes(interactionType)) {
    await updateLearnedPreferences(dealer.id, vehicleMatchId, interactionType, supabase)
  }

  return NextResponse.json({ success: true, interactionId: interaction.id })
}

/**
 * Update dealer's learned preferences based on interaction
 */
async function updateLearnedPreferences(
  dealerId: string,
  vehicleMatchId: string,
  interactionType: string,
  supabase: any
) {
  // Get the vehicle details
  const { data: match } = await supabase
    .from('vehicle_matches')
    .select('make, model, price, year, mileage')
    .eq('id', vehicleMatchId)
    .single()

  if (!match) return

  // Get current learned preferences
  const { data: prefs } = await supabase
    .from('dealer_learned_preferences')
    .select('*')
    .eq('dealer_id', dealerId)
    .single()

  // Calculate weight based on interaction
  const weight = {
    'SAVE': 1.0,
    'CONTACT_SELLER': 1.5,
    'SKIP': -0.3,
  }[interactionType] || 0

  // Update learned makes
  const learnedMakes = (prefs?.learned_makes as Record<string, number>) || {}
  learnedMakes[match.make] = (learnedMakes[match.make] || 0) + weight

  // Normalize scores (0-1 range)
  const maxScore = Math.max(...Object.values(learnedMakes), 1)
  Object.keys(learnedMakes).forEach(make => {
    learnedMakes[make] = Math.max(0, learnedMakes[make] / maxScore)
  })

  // Update learned price range
  const learnedPriceRange = (prefs?.learned_price_range as { min?: number, max?: number, count?: number }) || { count: 0 }
  if (weight > 0) { // Only for positive signals
    if (!learnedPriceRange.min || match.price < learnedPriceRange.min) {
      learnedPriceRange.min = match.price
    }
    if (!learnedPriceRange.max || match.price > learnedPriceRange.max) {
      learnedPriceRange.max = match.price
    }
    learnedPriceRange.count = (learnedPriceRange.count || 0) + 1
  }

  // Upsert learned preferences
  await supabase
    .from('dealer_learned_preferences')
    .upsert({
      dealer_id: dealerId,
      learned_makes: learnedMakes,
      learned_price_range: learnedPriceRange,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'dealer_id',
    })
}
\`\`\`

\`\`\`typescript
// app/api/dealers/metrics/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get transparent metrics with clear breakdowns
 * Shows exactly how numbers are calculated
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch metrics in parallel
  const [
    todayMatches,
    weeklyMatches,
    learnedPrefs,
    recentInteractions,
  ] = await Promise.all([
    // Today's matches
    supabase
      .from('vehicle_matches')
      .select('id, match_score, ai_classification', { count: 'exact' })
      .eq('dealer_id', dealer.id)
      .gte('classified_at', `${today}T00:00:00`)
      .lt('classified_at', `${today}T23:59:59`),

    // Weekly matches
    supabase
      .from('vehicle_matches')
      .select('classified_at, match_score', { count: 'exact' })
      .eq('dealer_id', dealer.id)
      .gte('classified_at', weekAgo),

    // Learned preferences
    supabase
      .from('dealer_learned_preferences')
      .select('*')
      .eq('dealer_id', dealer.id)
      .single(),

    // Recent interactions
    supabase
      .from('dealer_interactions')
      .select('interaction_type, created_at')
      .eq('dealer_id', dealer.id)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false }),
  ])

  // Calculate score distribution
  const scoreDistribution = (todayMatches.data || []).reduce(
    (acc, match) => {
      if (match.match_score >= 90) acc.high++
      else if (match.match_score >= 80) acc.medium++
      else acc.low++
      return acc
    },
    { high: 0, medium: 0, low: 0 }
  )

  // Calculate engagement rate
  const totalSent = weeklyMatches.count || 0
  const totalInteractions = recentInteractions.data?.length || 0
  const engagementRate = totalSent > 0 ? Math.round((totalInteractions / totalSent) * 100) : 0

  const metrics = {
    todaysMatches: {
      value: todayMatches.count || 0,
      breakdown: [
        { label: 'Score 90-100 (Excellent)', count: scoreDistribution.high, color: 'emerald', description: 'Perfect matches - highly recommended' },
        { label: 'Score 80-89 (Very Good)', count: scoreDistribution.medium, color: 'orange', description: 'Strong matches - worth considering' },
        { label: 'Score 70-79 (Good)', count: scoreDistribution.low, color: 'stone', description: 'Decent matches - review carefully' },
      ],
      explanation: "Vehicles that match your preferences AND passed AI health screening",
      lastUpdated: today,
    },

    weeklyActivity: {
      value: weeklyMatches.count || 0,
      breakdown: calculateDailyBreakdown(weeklyMatches.data || []),
      explanation: "Total healthy vehicles found in past 7 days",
      avgPerDay: Math.round((weeklyMatches.count || 0) / 7),
    },

    personalization: {
      enabled: !!learnedPrefs.data,
      stats: learnedPrefs.data ? {
        totalInteractions: learnedPrefs.data.total_interactions,
        savedVehicles: learnedPrefs.data.total_saves,
        skippedVehicles: learnedPrefs.data.total_skips,
        topPreferredMakes: Object.entries(learnedPrefs.data.learned_makes || {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([make, score]) => ({ make, preferenceScore: Math.round((score as number) * 100) })),
      } : null,
      explanation: learnedPrefs.data
        ? `System has learned your preferences from ${learnedPrefs.data.total_interactions} interactions`
        : "Start saving/skipping vehicles to enable personalized recommendations",
    },

    engagement: {
      rate: engagementRate,
      totalInteractions: totalInteractions,
      breakdown: (recentInteractions.data || []).reduce((acc, int) => {
        acc[int.interaction_type] = (acc[int.interaction_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      explanation: `You've interacted with ${engagementRate}% of matched vehicles this week`,
    },
  }

  return NextResponse.json(metrics)
}

function calculateDailyBreakdown(matches: any[]) {
  const breakdown: Record<string, number> = {}

  matches.forEach(match => {
    const date = match.classified_at.split('T')[0]
    breakdown[date] = (breakdown[date] || 0) + 1
  })

  return Object.entries(breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}
\`\`\`

---

## 3. Frontend Dashboard Components

\`\`\`typescript
// app/dashboard/components/PersonalizedMatches.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, X, ExternalLink, Sparkles } from 'lucide-react'

interface Match {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  url: string
  match_score: number
  personalizedScore?: number
  enhancedReasons: string[]
  ai_classification: {
    verdict: string
    minor_fault_type: string
    risk_score: number
    profit_potential: number
  }
}

export function PersonalizedMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [personalized, setPersonalized] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const res = await fetch('/api/dealers/matches')
      const data = await res.json()
      setMatches(data.matches)
      setPersonalized(data.personalized)
    } finally {
      setLoading(false)
    }
  }

  async function handleInteraction(matchId: string, type: 'SAVE' | 'SKIP') {
    await fetch('/api/dealers/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleMatchId: matchId,
        interactionType: type,
      }),
    })

    // Remove from list
    setMatches(prev => prev.filter(m => m.id !== matchId))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {personalized && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-900">Personalized For You</h3>
              <p className="text-sm text-purple-700">
                These results are ranked based on your previous saves and preferences
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {match.year} {match.make} {match.model}
                </h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">£{match.price.toLocaleString()}</Badge>
                  <Badge variant="outline">{match.mileage.toLocaleString()} mi</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {match.ai_classification.verdict}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {match.personalizedScore || match.match_score}%
                </div>
                <div className="text-xs text-gray-500">Match Score</div>
                {match.personalizedScore && match.personalizedScore !== match.match_score && (
                  <div className="text-xs text-purple-600 mt-1">
                    +{match.personalizedScore - match.match_score} personalized
                  </div>
                )}
              </div>
            </div>

            {/* Match Reasons */}
            <div className="space-y-2 mb-4">
              <div className="text-sm font-semibold text-gray-700">Why this matches:</div>
              <div className="flex flex-wrap gap-2">
                {match.enhancedReasons.map((reason, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    ✓ {reason}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Classification Details */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="text-sm font-semibold text-blue-900 mb-2">AI Analysis</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-600">Fault Type</div>
                  <div className="font-semibold">{match.ai_classification.minor_fault_type}</div>
                </div>
                <div>
                  <div className="text-gray-600">Risk Score</div>
                  <div className="font-semibold">{match.ai_classification.risk_score}/100</div>
                </div>
                <div>
                  <div className="text-gray-600">Profit Potential</div>
                  <div className="font-semibold text-green-600">
                    £{match.ai_classification.profit_potential.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleInteraction(match.id, 'SAVE')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => handleInteraction(match.id, 'SKIP')}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button variant="outline" asChild>
                <a href={match.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
\`\`\`

\`\`\`typescript
// app/dashboard/components/TransparentMetrics.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function TransparentMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    try {
      const res = await fetch('/api/dealers/metrics')
      const data = await res.json()
      setMetrics(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) return <div>Loading metrics...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Matches */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-700">Today's Matches</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{metrics.todaysMatches.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-3xl font-bold mb-4">{metrics.todaysMatches.value}</div>

        <div className="space-y-2">
          {metrics.todaysMatches.breakdown.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Activity */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-700">7-Day Activity</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{metrics.weeklyActivity.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-3xl font-bold mb-1">{metrics.weeklyActivity.value}</div>
        <div className="text-sm text-gray-600 mb-4">
          ~{metrics.weeklyActivity.avgPerDay} per day
        </div>

        {/* Mini chart */}
        <div className="flex gap-1 h-20">
          {metrics.weeklyActivity.breakdown.map((day: any, i: number) => {
            const maxCount = Math.max(...metrics.weeklyActivity.breakdown.map((d: any) => d.count))
            const height = (day.count / maxCount) * 100
            return (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="bg-orange-500 rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.count}`}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Personalization */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-700">Learning Status</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{metrics.personalization.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {metrics.personalization.enabled ? (
          <>
            <div className="text-3xl font-bold mb-4 text-purple-600">
              {metrics.personalization.stats.totalInteractions}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-semibold mb-1">Your Top Preferences:</div>
              {metrics.personalization.stats.topPreferredMakes.map((make: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{make.make}</span>
                  <span className="font-semibold text-purple-600">{make.preferenceScore}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-600">
            Start saving and skipping vehicles to enable personalized recommendations
          </div>
        )}
      </Card>

      {/* Engagement */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-700">Your Engagement</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{metrics.engagement.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-3xl font-bold mb-4">{metrics.engagement.rate}%</div>

        <div className="space-y-2">
          {Object.entries(metrics.engagement.breakdown).map(([type, count], i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{type.replace('_', ' ')}</span>
              <span className="font-semibold">{count as number}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
\`\`\`

---

## 4. Key Simplifications vs Consumer Platform

| Feature | Consumer | Dealer (Simplified) |
|---------|----------|---------------------|
| **ML Model** | Python FastAPI service | Simple server-side logic |
| **Embeddings** | Vector DB (Pinecone) | Not needed |
| **Collaborative Filtering** | Yes (similar users) | No (individual dealers) |
| **Real-time Feed** | WebSocket updates | Daily email + dashboard |
| **Diversity Algorithm** | MMR | Not needed (show all matches) |
| **Complexity** | High | Low |

---

## 5. Implementation Summary

### What to Adopt:
✅ **Interaction tracking** - Learn from dealer saves/skips
✅ **Preference learning** - Auto-discover make/price preferences
✅ **Personalized scoring** - Boost scores for preferred makes
✅ **Transparent metrics** - Show breakdowns with tooltips
✅ **Engagement tracking** - Monitor email opens/clicks

### What to Skip:
❌ Complex ML service (Python/FastAPI)
❌ Vector embeddings and similarity search
❌ Collaborative filtering (dealers don't share preferences)
❌ Real-time WebSocket (email is primary delivery)
❌ Diversity algorithms (dealers want ALL good matches)

---

## Next Steps

1. Run database migration: `supabase/migrations/20260104_add_dealer_learning.sql`
2. Create API routes: `/api/dealers/matches`, `/api/dealers/interact`, `/api/dealers/metrics`
3. Build dashboard components: `PersonalizedMatches.tsx`, `TransparentMetrics.tsx`
4. Track email engagement via tracking pixels
5. Monitor and tune learning algorithms based on dealer feedback

This gives you **intelligent personalization** without the complexity of the consumer platform! 🎯
