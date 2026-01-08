"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Play,
  Pause,
  Clock,
  TrendingUp,
  Car,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface AgentStatus {
  isActive: boolean
  lastRun: string | null
  totalRuns: number
  carsFound: number
  healthyCars: number
  hasActiveSubscription: boolean
  plan: string
}

interface AgentControlPanelProps {
  compact?: boolean
}

export function AgentControlPanel({ compact = false }: AgentControlPanelProps) {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
    // Poll every 30 seconds for status updates
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/agent/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to fetch agent status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAgent = async () => {
    if (!status) return

    setActionLoading(true)
    try {
      const endpoint = status.isActive ? "/api/agent/stop" : "/api/agent/start"
      const response = await fetch(endpoint, { method: "POST" })

      if (response.ok) {
        await fetchStatus()
        toast.success(
          status.isActive ? "Agent Stopped" : "Agent Started",
          {
            description: status.isActive
              ? "Your AI agent has been paused"
              : "Your AI agent is now scanning for vehicles",
          }
        )
      } else {
        const error = await response.json()
        toast.error("Action Failed", {
          description: error.error || "Please try again",
        })
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: "Unable to update agent status",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getNextRunTime = () => {
    // Agent runs daily at 6 AM
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(6, 0, 0, 0)

    // If it's past 6 AM today, schedule for tomorrow
    if (now.getHours() >= 6) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    const hours = Math.floor((nextRun.getTime() - now.getTime()) / (1000 * 60 * 60))
    const minutes = Math.floor(((nextRun.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const getSuccessRate = () => {
    if (!status || status.carsFound === 0) return 0
    return Math.round((status.healthyCars / status.carsFound) * 100)
  }

  if (loading) {
    return (
      <Card className={cn(compact && "")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Bot className="w-8 h-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  if (compact) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                status.isActive ? "bg-green-500" : "bg-gray-400"
              )}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">AI Agent</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {status.isActive ? "Active" : "Paused"}
                </p>
              </div>
            </div>
            <Badge variant={status.isActive ? "default" : "secondary"} className={cn(
              status.isActive && "bg-green-600"
            )}>
              {status.isActive ? "ON" : "OFF"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Total Runs</p>
              <p className="font-bold text-lg">{status.totalRuns}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Healthy Cars</p>
              <p className="font-bold text-lg text-green-600">{status.healthyCars}</p>
            </div>
          </div>

          <Button
            onClick={handleToggleAgent}
            disabled={actionLoading || !status.hasActiveSubscription}
            className="w-full"
            variant={status.isActive ? "outline" : "default"}
          >
            {actionLoading ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : status.isActive ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {status.isActive ? "Pause Agent" : "Start Agent"}
          </Button>

          {!status.hasActiveSubscription && (
            <p className="text-xs text-orange-600 text-center">
              Active subscription required
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={status.isActive ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: status.isActive ? Infinity : 0,
                repeatDelay: 3,
              }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-md",
                status.isActive
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-gray-400 to-gray-500"
              )}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Agent Control
                {status.isActive && (
                  <Badge variant="default" className="bg-green-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {status.isActive
                  ? "Your agent is monitoring auctions 24/7"
                  : "Activate to start finding vehicles"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Total Scans</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{status.totalRuns}</p>
            <p className="text-xs text-blue-600 mt-1">Complete workflow runs</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Healthy Vehicles</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{status.healthyCars}</p>
            <p className="text-xs text-green-600 mt-1">
              {getSuccessRate()}% success rate
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">Total Screened</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{status.carsFound}</p>
            <p className="text-xs text-purple-600 mt-1">Vehicles analyzed</p>
          </div>
        </div>

        <Separator />

        {/* Timing Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Next Scheduled Run</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{getNextRunTime()}</span>
          </div>

          {status.lastRun && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Last Run</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(status.lastRun).toLocaleString()}
              </span>
            </div>
          )}

          {status.isActive && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Agent is learning your preferences as you interact with vehicles</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Control Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleToggleAgent}
            disabled={actionLoading || !status.hasActiveSubscription}
            className={cn(
              "w-full",
              status.isActive
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-green-600 hover:bg-green-700"
            )}
            size="lg"
          >
            {actionLoading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : status.isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Agent
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate Agent
              </>
            )}
          </Button>

          {!status.hasActiveSubscription && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Active subscription required to use the AI agent</span>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Agent runs daily at 6:00 AM and scans all enabled auction sites
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
