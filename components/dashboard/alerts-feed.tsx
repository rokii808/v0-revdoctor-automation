"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Car, Clock, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Alert {
  id: string
  title: string
  message: string
  car_make: string
  car_model: string
  car_year: number
  price: number
  created_at: string
  source_link: string
  is_read: boolean
}

import type { AlertsFeedProps } from "@/lib/types"

interface AlertsFeedPropsWithAlerts extends Omit<AlertsFeedProps, 'dealer'> {
  dealer: AlertsFeedProps['dealer']
  alerts: Alert[]
}

export default function AlertsFeed({ dealer, alerts: initialAlerts }: AlertsFeedPropsWithAlerts) {
  const [alerts, setAlerts] = useState(initialAlerts)

  const markAsRead = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, { method: "PATCH" })
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId))
        toast.success("Alert Marked as Read", {
          description: "This alert has been removed from your feed.",
        })
      } else {
        const error = await res.json()
        toast.error("Failed to Mark as Read", {
          description: error.message || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Unable to update alert.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alerts Feed ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No new alerts. We'll notify you when cars matching your saved searches become available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-blue-600">
                        New Match
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-semibold">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        {alert.car_year} {alert.car_make} {alert.car_model}
                      </span>
                      <span className="text-green-600 font-medium">£{alert.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={alert.source_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                      Mark Read
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
