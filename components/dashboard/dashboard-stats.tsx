import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Car, Clock, Zap, Target, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { DashboardStatsProps } from "@/lib/types"

export default function DashboardStats({ dealer, recentLeads }: DashboardStatsProps) {
  const totalLeads = recentLeads.reduce((sum, lead) => sum + lead.number_sent, 0)
  const avgDaily = recentLeads.length > 0 ? Math.round(totalLeads / recentLeads.length) : 0
  const thisWeek = recentLeads
    .filter((lead) => {
      const leadDate = new Date(lead.date)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return leadDate >= weekAgo
    })
    .reduce((sum, lead) => sum + lead.number_sent, 0)

  const streakDays = 12 // Mock data - would come from database
  const moneySaved = Math.round(totalLeads * 180) // £180 avg saved per avoided bad car
  const timeSaved = Math.round(totalLeads * 0.5) // 30 mins saved per car screened
  const monthlyMoneySaved = Math.round(moneySaved * 0.7) // This month's savings
  const monthlyTimeSaved = Math.round(timeSaved * 0.7) // This month's time savings

  // Note: subscription_expires_at would come from subscription data, not dealer
  const daysLeft = 0 // This should be calculated from subscription data

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Revvdoctor ROI This Month</h3>
          <Trophy className="h-6 w-6" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold">£{monthlyMoneySaved.toLocaleString()}</div>
            <p className="text-emerald-100">Money Saved</p>
            <p className="text-xs text-emerald-200 mt-1">Avoided {Math.round(monthlyMoneySaved / 180)} bad purchases</p>
          </div>
          <div>
            <div className="text-3xl font-bold">{monthlyTimeSaved}h</div>
            <p className="text-emerald-100">Time Saved</p>
            <p className="text-xs text-emerald-200 mt-1">Focus on bidding, not screening</p>
          </div>
        </div>
      </div>

      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-amber-800">Daily Digest Streak</CardTitle>
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-amber-700">{streakDays}</div>
            <div>
              <p className="font-medium text-amber-800">Days in a row!</p>
              <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">
                🔥 On fire!
              </Badge>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">You've saved time {streakDays} days in a row. Keep it up!</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{thisWeek}</div>
            <p className="text-xs text-muted-foreground">Healthy cars found</p>
            {thisWeek > 10 && (
              <Badge variant="secondary" className="text-xs mt-1">
                Above average!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">94%</div>
            <p className="text-xs text-muted-foreground">Healthy predictions</p>
            <Badge variant="secondary" className="text-xs mt-1 bg-blue-100 text-blue-700">
              Top 10% accuracy
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDaily}</div>
            <p className="text-xs text-muted-foreground">Cars per day</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Days Left</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{daysLeft}</div>
            <p className="text-xs text-muted-foreground">Free trial remaining</p>
            {daysLeft <= 3 && (
              <Badge variant="destructive" className="text-xs mt-1">
                Upgrade soon!
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
