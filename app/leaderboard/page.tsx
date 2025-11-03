"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Users, Crown, Star, Target, Zap, Medal } from "lucide-react"
import Link from "next/link"

// Mock leaderboard data - would come from database
const leaderboardData = [
  {
    rank: 1,
    dealerName: "Anonymous Dealer #247",
    location: "Manchester",
    carsPerWeek: 18.5,
    successRate: 96,
    totalSavings: 12400,
    streak: 28,
    tier: "Enterprise",
    isCurrentUser: false,
  },
  {
    rank: 2,
    dealerName: "Anonymous Dealer #156",
    location: "London",
    carsPerWeek: 16.2,
    successRate: 94,
    totalSavings: 11200,
    streak: 22,
    tier: "Premium",
    isCurrentUser: false,
  },
  {
    rank: 3,
    dealerName: "Anonymous Dealer #089",
    location: "Birmingham",
    carsPerWeek: 15.8,
    successRate: 93,
    totalSavings: 10800,
    streak: 19,
    tier: "Premium",
    isCurrentUser: false,
  },
  {
    rank: 8,
    dealerName: "You",
    location: "Leeds",
    carsPerWeek: 12.3,
    successRate: 89,
    totalSavings: 8400,
    streak: 12,
    tier: "Basic",
    isCurrentUser: true,
  },
]

const achievements = [
  {
    title: "Speed Demon",
    description: "Check digest before 7 AM for 30 days",
    holders: 23,
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Deal Hunter",
    description: "Find 50+ healthy cars in a month",
    holders: 12,
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Profit Master",
    description: "Save £10,000+ in avoided bad purchases",
    holders: 8,
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Streak Legend",
    description: "Maintain 60-day usage streak",
    holders: 5,
    icon: Medal,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const benchmarkStats = {
  totalUsers: 847,
  avgCarsPerWeek: 8.2,
  avgSuccessRate: 87,
  avgSavings: 4200,
  topPerformers: 85, // Top 10%
}

export default function LeaderboardPage() {
  const currentUser = leaderboardData.find((d) => d.isCurrentUser)
  const userRankPercentile = currentUser
    ? Math.round((1 - (currentUser.rank - 1) / benchmarkStats.totalUsers) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Revvdoctor
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/settings" className="text-slate-600 hover:text-slate-900 transition-colors">
              Settings
            </Link>
            <Link href="/agents" className="text-slate-600 hover:text-slate-900 transition-colors">
              Agents
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Revvdoctor Leaderboard</h1>
                <p className="text-slate-600">See how you stack up against other dealers</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Users className="w-3 h-3 mr-1" />
              {benchmarkStats.totalUsers} active dealers competing
            </Badge>
          </div>

          {/* Your Performance Summary */}
          {currentUser && (
            <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">#{currentUser.rank}</div>
                    <p className="text-sm text-blue-700">Global Rank</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Top {userRankPercentile}%
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{currentUser.carsPerWeek}</div>
                    <p className="text-sm text-slate-600">Cars/week</p>
                    <p className="text-xs text-green-600">
                      +{(currentUser.carsPerWeek - benchmarkStats.avgCarsPerWeek).toFixed(1)} vs avg
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{currentUser.successRate}%</div>
                    <p className="text-sm text-slate-600">Success rate</p>
                    <p className="text-xs text-green-600">
                      +{currentUser.successRate - benchmarkStats.avgSuccessRate}% vs avg
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      £{currentUser.totalSavings.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600">Total savings</p>
                    <p className="text-xs text-green-600">
                      +£{(currentUser.totalSavings - benchmarkStats.avgSavings).toLocaleString()} vs avg
                    </p>
                  </div>
                </div>

                {currentUser.rank > 3 && (
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-900">Want to climb higher?</p>
                        <p className="text-sm text-orange-700">
                          Dealers in top 3 average {leaderboardData[0].carsPerWeek} cars/week
                        </p>
                      </div>
                      <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href="/pricing">Upgrade Plan</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Performers */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top Performers This Month
                  </CardTitle>
                  <CardDescription>Anonymous ranking of Revvdoctor's most successful dealers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboardData.map((dealer, index) => (
                    <div
                      key={dealer.rank}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        dealer.isCurrentUser
                          ? "border-blue-200 bg-blue-50"
                          : index < 3
                            ? "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
                              : index === 1
                                ? "bg-gradient-to-r from-slate-300 to-slate-400 text-white"
                                : index === 2
                                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                                  : dealer.isCurrentUser
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index < 3 ? (
                            index === 0 ? (
                              <Crown className="w-5 h-5" />
                            ) : index === 1 ? (
                              <Medal className="w-5 h-5" />
                            ) : (
                              <Trophy className="w-4 h-4" />
                            )
                          ) : (
                            dealer.rank
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {dealer.isCurrentUser ? "You" : dealer.dealerName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {dealer.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{dealer.location}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <div className="font-semibold text-slate-900">{dealer.carsPerWeek}</div>
                            <p className="text-xs text-slate-500">cars/week</p>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">{dealer.successRate}%</div>
                            <p className="text-xs text-slate-500">success</p>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-600">{dealer.streak}</div>
                            <p className="text-xs text-slate-500">day streak</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentUser && currentUser.rank > 10 && (
                    <div className="text-center py-4 border-t border-slate-200">
                      <p className="text-sm text-slate-500 mb-2">
                        ... and {benchmarkStats.totalUsers - 10} more dealers
                      </p>
                      <Badge variant="secondary">
                        You're #{currentUser.rank} of {benchmarkStats.totalUsers}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Achievements & Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Rare Achievements
                  </CardTitle>
                  <CardDescription>Exclusive badges earned by top performers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon
                    return (
                      <div key={achievement.title} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${achievement.bgColor}`}>
                          <Icon className={`w-5 h-5 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{achievement.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.holders} holders
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{achievement.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{benchmarkStats.totalUsers}</div>
                      <p className="text-xs text-slate-600">Active dealers</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{benchmarkStats.avgCarsPerWeek}</div>
                      <p className="text-xs text-slate-600">Avg cars/week</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{benchmarkStats.avgSuccessRate}%</div>
                      <p className="text-xs text-slate-600">Avg success rate</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        £{(benchmarkStats.avgSavings / 1000).toFixed(1)}k
                      </div>
                      <p className="text-xs text-slate-600">Avg savings</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-green-900 mb-1">Elite Club</p>
                    <p className="text-xs text-green-700">
                      Top {benchmarkStats.topPerformers} dealers (10%) average £
                      {((benchmarkStats.avgSavings * 2.5) / 1000).toFixed(1)}k+ monthly savings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
