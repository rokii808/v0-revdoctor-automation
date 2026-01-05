"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  TrendingUp,
  TrendingDown,
  Info,
  BarChart3,
  Target,
  Heart,
  Eye,
  X,
  Sparkles,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PreferencesData {
  totalInteractions: number
  totalSaves: number
  totalSkips: number
  saveRate: string
  learnedMakes: Record<string, number>
  learnedModels: Record<string, number>
  priceRange?: { min: number; max: number; preferred: number }
  lastUpdated: string
}

interface MatchStats {
  total_matches: number
  avg_base_score: number
  avg_personalization_boost: number
  avg_final_score: number
}

interface LearningProgress {
  stage: string
  percentage: number
  nextMilestone: string
}

interface MetricsData {
  preferences: PreferencesData | null
  matchStats: MatchStats
  recentActivity: {
    interactionsByType: Record<string, number>
    totalRecent: number
  }
  hasLearningData: boolean
  learningProgress: LearningProgress
}

export function TransparentMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dealers/metrics")
      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Learning Progress */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Learning Progress
          </CardTitle>
          <CardDescription>How well we understand your preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">
                {metrics.learningProgress.stage}
              </span>
              <span className="text-sm text-purple-700">
                {Math.round(metrics.learningProgress.percentage)}%
              </span>
            </div>
            <Progress
              value={metrics.learningProgress.percentage}
              className="h-3 bg-purple-200"
            />
            <p className="text-xs text-purple-600 mt-2">
              {metrics.learningProgress.nextMilestone}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {metrics.preferences?.totalInteractions || 0}
              </div>
              <p className="text-xs text-purple-600">Total Interactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {metrics.preferences?.totalSaves || 0}
              </div>
              <p className="text-xs text-purple-600">Vehicles Saved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {metrics.preferences?.saveRate || "0.0"}%
              </div>
              <p className="text-xs text-purple-600">Save Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learned Preferences */}
      {metrics.hasLearningData && metrics.preferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Learned Preferences
            </CardTitle>
            <CardDescription>
              Based on your interactions, here's what you typically prefer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Makes */}
            {Object.keys(metrics.preferences.learnedMakes).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  Preferred Vehicle Makes
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Calculated from the makes you save most often. Higher percentages mean
                          stronger preference.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <div className="space-y-2">
                  {Object.entries(metrics.preferences.learnedMakes)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([make, score]) => (
                      <div key={make} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{make}</span>
                          <span className="text-muted-foreground">
                            {(score * 100).toFixed(0)}% preference
                          </span>
                        </div>
                        <Progress value={score * 100} className="h-2" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Preferred Models */}
            {Object.keys(metrics.preferences.learnedModels).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  Preferred Models
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Specific vehicle models you interact with most frequently.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(metrics.preferences.learnedModels)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([model, score]) => (
                      <Badge
                        key={model}
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {model} ({(score * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            {metrics.preferences.priceRange && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  Typical Price Range
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          The price range where you typically find vehicles you're interested in.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600">Minimum</p>
                      <p className="text-lg font-bold text-blue-900">
                        £{metrics.preferences.priceRange.min.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <div className="text-center">
                      <p className="text-xs text-blue-600">Preferred</p>
                      <p className="text-lg font-bold text-blue-900">
                        £{metrics.preferences.priceRange.preferred.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Maximum</p>
                      <p className="text-lg font-bold text-blue-900">
                        £{metrics.preferences.priceRange.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Match Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Match Quality Over Time
          </CardTitle>
          <CardDescription>
            How personalization affects your vehicle recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Score</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Initial match score based on your explicit preferences (make, price, year,
                        etc.)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-3xl font-bold">{metrics.matchStats.avg_base_score.toFixed(0)}</div>
              <Progress value={metrics.matchStats.avg_base_score} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Personalization</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Average boost/penalty based on your learned preferences
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                className={cn(
                  "text-3xl font-bold",
                  metrics.matchStats.avg_personalization_boost > 0
                    ? "text-green-600"
                    : metrics.matchStats.avg_personalization_boost < 0
                    ? "text-orange-600"
                    : ""
                )}
              >
                {metrics.matchStats.avg_personalization_boost > 0 ? "+" : ""}
                {metrics.matchStats.avg_personalization_boost.toFixed(0)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {metrics.matchStats.avg_personalization_boost > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span>Boosting matches</span>
                  </>
                ) : (
                  <span>Not yet personalized</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Final Score</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Base score + personalization boost = your final match score
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics.matchStats.avg_final_score.toFixed(0)}
              </div>
              <Progress value={metrics.matchStats.avg_final_score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your interactions in the last 100 actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {metrics.recentActivity.interactionsByType.VIEW || 0}
                </div>
                <p className="text-xs text-blue-600">Views</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Heart className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {metrics.recentActivity.interactionsByType.SAVE || 0}
                </div>
                <p className="text-xs text-purple-600">Saves</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <X className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {metrics.recentActivity.interactionsByType.SKIP || 0}
                </div>
                <p className="text-xs text-orange-600">Skips</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {metrics.recentActivity.totalRecent}
                </div>
                <p className="text-xs text-green-600">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
