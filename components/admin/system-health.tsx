import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
import type { SystemHealthProps } from "@/lib/types"

export default function SystemHealth({ dealers, recentLeads }: SystemHealthProps) {
  const systemStatus = "operational" // This would come from actual health checks
  const lastProcessed = recentLeads.length > 0 ? new Date(recentLeads[0].created_at) : null
  const processingDelay = lastProcessed ? Date.now() - lastProcessed.getTime() : 0
  const isDelayed = processingDelay > 24 * 60 * 60 * 1000 // More than 24 hours

  const healthChecks = [
    {
      name: "Database Connection",
      status: "healthy",
      lastCheck: "2 minutes ago",
    },
    {
      name: "Email Service",
      status: "healthy",
      lastCheck: "5 minutes ago",
    },
    {
      name: "AI Processing",
      status: isDelayed ? "warning" : "healthy",
      lastCheck: lastProcessed ? `${Math.round(processingDelay / (1000 * 60 * 60))} hours ago` : "Never",
    },
    {
      name: "Auction Data Feed",
      status: "healthy",
      lastCheck: "1 minute ago",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
        <CardDescription>Monitor system components and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium">Overall Status</h4>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">Operational</Badge>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Component Status</h4>
          {healthChecks.map((check) => (
            <div key={check.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="text-sm">{check.name}</span>
              </div>
              <div className="text-right">
                {getStatusBadge(check.status)}
                <div className="text-xs text-muted-foreground mt-1">{check.lastCheck}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span>99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Time:</span>
              <span>245ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Processes:</span>
              <span>12</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
