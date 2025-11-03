import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Car, DollarSign, Calendar, Target } from "lucide-react"

export default async function ReportsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: dealer } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()

  // Mock data for reports - in real app this would come from database
  const thisWeekFlagged = 47
  const lastWeekFlagged = 32
  const purchasedThisWeek = 8
  const totalPotentialProfit = 24500
  const avgReservePrice = 18750

  const weeklyComparison = ((thisWeekFlagged - lastWeekFlagged) / lastWeekFlagged) * 100

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} dealer={dealer} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your performance and analyze healthy car opportunities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Flagged This Week</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{thisWeekFlagged}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {weeklyComparison > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {Math.abs(weeklyComparison).toFixed(1)}% vs last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Purchased</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{purchasedThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {((purchasedThisWeek / thisWeekFlagged) * 100).toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">£{totalPotentialProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">vs £{avgReservePrice.toLocaleString()} avg reserve</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">94%</div>
              <p className="text-xs text-muted-foreground">Healthy predictions accuracy</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">This Week</p>
                    <p className="text-sm text-muted-foreground">{thisWeekFlagged} cars flagged</p>
                  </div>
                  <Badge variant="default" className="bg-emerald-600">
                    Current
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Last Week</p>
                    <p className="text-sm text-muted-foreground">{lastWeekFlagged} cars flagged</p>
                  </div>
                  <Badge variant="secondary">Previous</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cars Purchased</span>
                  <span className="text-2xl font-bold text-blue-600">{purchasedThisWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-lg font-semibold text-green-600">
                    {((purchasedThisWeek / thisWeekFlagged) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Profit per Car</span>
                  <span className="text-lg font-semibold text-purple-600">
                    £{Math.round(totalPotentialProfit / purchasedThisWeek).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
