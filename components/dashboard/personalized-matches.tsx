"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Car,
  TrendingUp,
  Heart,
  X,
  ExternalLink,
  Sparkles,
  Info,
  Eye,
  Share2,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleMatch {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  url: string
  verdict: string
  risk: number
  base_score: number
  personalization_boost: number
  final_score: number
  score_breakdown?: Record<string, number>
  viewed: boolean
  saved: boolean
  skipped: boolean
}

interface LearnedPreferences {
  learned_makes?: Record<string, number>
  learned_models?: Record<string, number>
  learned_price_range?: { min: number; max: number; preferred: number }
  total_interactions: number
  total_saves: number
}

interface PersonalizedMatchesProps {
  dealerId?: string
  initialMatches?: VehicleMatch[]
}

export function PersonalizedMatches({ dealerId, initialMatches = [] }: PersonalizedMatchesProps) {
  const [matches, setMatches] = useState<VehicleMatch[]>(initialMatches)
  const [preferences, setPreferences] = useState<LearnedPreferences | null>(null)
  const [loading, setLoading] = useState(!initialMatches.length)
  const [hasLearningData, setHasLearningData] = useState(false)

  useEffect(() => {
    if (!initialMatches.length) {
      fetchMatches()
    }
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dealers/matches?limit=20")
      const data = await response.json()

      if (data.success) {
        setMatches(data.matches)
        setPreferences(data.preferences)
        setHasLearningData(data.hasPreferences)
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (matchId: string, type: "VIEW" | "SAVE" | "SKIP" | "SHARE") => {
    try {
      const response = await fetch("/api/dealers/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleMatchId: matchId,
          interactionType: type,
        }),
      })

      if (response.ok) {
        // Update local state
        setMatches((prev) =>
          prev.map((match) => {
            if (match.id === matchId) {
              return {
                ...match,
                viewed: type === "VIEW" ? true : match.viewed,
                saved: type === "SAVE" ? true : match.saved,
                skipped: type === "SKIP" ? true : match.skipped,
              }
            }
            return match
          })
        )

        // Refresh matches to get updated personalization
        if (type === "SAVE" || type === "SKIP") {
          setTimeout(() => fetchMatches(), 1000)
        }
      }
    } catch (error) {
      console.error("Failed to record interaction:", error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getBoostBadgeColor = (boost: number) => {
    if (boost > 10) return "bg-green-100 text-green-700"
    if (boost > 0) return "bg-blue-100 text-blue-700"
    if (boost < 0) return "bg-orange-100 text-orange-700"
    return "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Car className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading personalized matches...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Learning Progress Card */}
      {preferences && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">
                    {hasLearningData ? "Learning Your Preferences" : "Getting Started"}
                  </h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  {hasLearningData
                    ? `Based on ${preferences.total_interactions} interactions, we're personalizing your matches`
                    : "Save or skip vehicles to help us learn what you like"}
                </p>
                <Progress
                  value={Math.min((preferences.total_interactions / 50) * 100, 100)}
                  className="h-2"
                />
                <p className="text-xs text-purple-600 mt-1">
                  {preferences.total_interactions < 50
                    ? `${50 - preferences.total_interactions} more interactions for optimal personalization`
                    : "Your preferences are well-learned!"}
                </p>
              </div>
              {preferences.total_saves > 0 && (
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-purple-600">{preferences.total_saves}</div>
                  <p className="text-xs text-purple-600">Vehicles Saved</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Personalized Matches
              </CardTitle>
              <CardDescription>
                Vehicles scored based on your preferences and market fit
              </CardDescription>
            </div>
            {hasLearningData && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Personalized
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match, index) => (
              <VehicleMatchCard
                key={match.id}
                match={match}
                index={index}
                onInteract={handleInteraction}
                hasLearningData={hasLearningData}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No matches found yet.</p>
              <p className="text-sm">Check back soon for personalized vehicle recommendations!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface VehicleMatchCardProps {
  match: VehicleMatch
  index: number
  onInteract: (matchId: string, type: "VIEW" | "SAVE" | "SKIP" | "SHARE") => void
  hasLearningData: boolean
}

function VehicleMatchCard({ match, index, onInteract, hasLearningData }: VehicleMatchCardProps) {
  const scoreColor = match.final_score >= 80
    ? "text-green-600 bg-green-50 border-green-200"
    : match.final_score >= 60
    ? "text-blue-600 bg-blue-50 border-blue-200"
    : "text-yellow-600 bg-yellow-50 border-yellow-200"

  const boostColor =
    match.personalization_boost > 10
      ? "bg-green-100 text-green-700"
      : match.personalization_boost > 0
      ? "bg-blue-100 text-blue-700"
      : match.personalization_boost < 0
      ? "bg-orange-100 text-orange-700"
      : "bg-gray-100 text-gray-700"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "border rounded-lg p-4 space-y-3 transition-all hover:shadow-md",
        match.saved ? "border-purple-200 bg-purple-50" : "border-border",
        match.skipped && "opacity-60"
      )}
    >
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">
            {match.year} {match.make} {match.model}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={scoreColor}>
              Score: {match.final_score}
            </Badge>
            {hasLearningData && match.personalization_boost !== 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={boostColor}>
                      {match.personalization_boost > 0 ? "+" : ""}
                      {match.personalization_boost} personalized
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {match.personalization_boost > 0
                        ? "Boosted because it matches your preferences"
                        : "Not typical for your preferences"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">£{match.price.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{match.mileage.toLocaleString()} mi</p>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant={match.verdict === "HEALTHY" ? "default" : "secondary"}>
          {match.verdict}
        </Badge>
        <span>Risk: {match.risk}/100</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={match.saved ? "default" : "outline"}
                  onClick={() => onInteract(match.id, "SAVE")}
                  disabled={match.saved || match.skipped}
                  className={match.saved ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <Heart className={cn("w-4 h-4", match.saved && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save for later</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onInteract(match.id, "SKIP")}
                  disabled={match.saved || match.skipped}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not interested</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onInteract(match.id, "SHARE")}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          size="sm"
          variant="outline"
          asChild
          onClick={() => onInteract(match.id, "VIEW")}
        >
          <a href={match.url} target="_blank" rel="noopener noreferrer">
            View Listing <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </div>
    </motion.div>
  )
}
