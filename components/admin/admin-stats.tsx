import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, TrendingUp, Mail, Activity } from "lucide-react"
import type { AdminStatsProps } from "@/lib/types"

export default function AdminStats({ dealers, recentLeads, systemStats }: AdminStatsProps) {
  const totalDealers = dealers.length
  const activeDealers = dealers.filter(
    (d) => d.status === "active" || d.plan === "trial",
  ).length
  const totalLeads = recentLeads.reduce((sum, lead) => sum + lead.number_sent, 0)
  const todayLeads = recentLeads
    .filter((lead) => {
      const leadDate = new Date(lead.date)
      const today = new Date()
      return leadDate.toDateString() === today.toDateString()
    })
    .reduce((sum, lead) => sum + lead.number_sent, 0)

  const trialDealers = dealers.filter((d) => d.plan === "trial").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDealers}</div>
          <p className="text-xs text-muted-foreground">{activeDealers} active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{trialDealers}</div>
          <p className="text-xs text-muted-foreground">Free trial active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cars Today</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayLeads}</div>
          <p className="text-xs text-muted-foreground">Healthy cars sent</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentLeads.length}</div>
          <p className="text-xs text-muted-foreground">Recent digests</p>
        </CardContent>
      </Card>
    </div>
  )
}
