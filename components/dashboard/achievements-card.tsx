import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AchievementsCardProps {
  dealer: any
}

export default function AchievementsCard({ dealer }: AchievementsCardProps) {
  const achievements = [
    {
      id: 1,
      title: "Early Bird",
      description: "Check digest before 8 AM for 7 days",
      progress: 85,
      icon: Zap,
      unlocked: false,
      reward: "Priority support access",
    },
    {
      id: 2,
      title: "Smart Buyer",
      description: "Save £5,000+ in avoided bad purchases",
      progress: 100,
      icon: Trophy,
      unlocked: true,
      reward: "Exclusive market insights",
    },
    {
      id: 3,
      title: "Top Performer",
      description: "Rank in top 20% of RevDoctor users",
      progress: 65,
      icon: Target,
      unlocked: false,
      reward: "Advanced filtering features",
    },
  ]

  const benchmarkData = {
    rank: "Top 15%",
    avgCarsPerWeek: 8.5,
    yourCarsPerWeek: 12,
    avgSavings: 1850,
    yourSavings: 2750,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Performance & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">Your Ranking</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-purple-600">{benchmarkData.rank}</div>
              <p className="text-purple-700">of all dealers</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {benchmarkData.yourCarsPerWeek} vs {benchmarkData.avgCarsPerWeek}
              </div>
              <p className="text-purple-700">cars/week (you vs avg)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Active Challenges</h4>
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div key={achievement.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${achievement.unlocked ? "text-amber-500" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{achievement.title}</span>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                        Unlocked!
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                </div>
                <Progress value={achievement.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {achievement.unlocked && <p className="text-xs text-amber-600 font-medium">🎁 {achievement.reward}</p>}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
