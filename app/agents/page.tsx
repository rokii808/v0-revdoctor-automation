"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bot, Play, Square, Activity, Clock, CheckCircle, AlertCircle, Settings, BarChart3, Zap, ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface AgentStatus {
  isActive: boolean
  lastRun: string | null
  totalRuns: number
  carsFound: number
  healthyCars: number
  plan: string
  subscriptionStatus: string
}

export default function AgentsPage() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    isActive: false,
    lastRun: null,
    totalRuns: 0,
    carsFound: 0,
    healthyCars: 0,
    plan: "basic",
    subscriptionStatus: "active",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  // Mock user ID - in real app, get from auth context
  const userId = "placeholder-user-id"

  useEffect(() => {
    loadAgentStatus()
  }, [])

  const loadAgentStatus = async () => {
    setIsLoading(true)
    // Mock data - in real app, fetch from API
    setTimeout(() => {
      setAgentStatus({
        isActive: true,
        lastRun: "2024-01-15T07:00:00Z",
        totalRuns: 23,
        carsFound: 156,
        healthyCars: 47,
        plan: "pro",
        subscriptionStatus: "active",
      })
      setIsLoading(false)
    }, 1000)
  }

  const startAgent = async () => {
    setIsStarting(true)
    try {
      const response = await fetch("/api/agent/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.success) {
        setAgentStatus((prev) => ({ ...prev, isActive: true }))
        alert("Agent started successfully!")
      } else {
        throw new Error(result.error || "Failed to start agent")
      }
    } catch (error) {
      console.error("Start agent error:", error)
      alert("Failed to start agent. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  const stopAgent = async () => {
    setIsStopping(true)
    try {
      const response = await fetch("/api/agent/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.success) {
        setAgentStatus((prev) => ({ ...prev, isActive: false }))
        alert("Agent stopped successfully!")
      } else {
        throw new Error(result.error || "Failed to stop agent")
      }
    } catch (error) {
      console.error("Stop agent error:", error)
      alert("Failed to stop agent. Please try again.")
    } finally {
      setIsStopping(false)
    }
  }

  const formatLastRun = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading agent status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Link>
            </Button>
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Revvdoctor
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/settings" className="text-slate-600 hover:text-slate-900 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">AI Agent Control</h1>
                <p className="text-slate-600">Manage your Revvdoctor AI agent that finds healthy cars for you</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Agent Status Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Agent Status
                    </CardTitle>
                    <CardDescription>Your Revvdoctor AI agent is currently scanning auction sites</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {agentStatus.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="agent-toggle" className="text-base font-medium">
                        Auto-Scan Mode
                      </Label>
                      <p className="text-sm text-slate-600">Automatically scan for healthy cars daily at 7:00 AM</p>
                    </div>
                  </div>
                  <Switch
                    id="agent-toggle"
                    checked={agentStatus.isActive}
                    onCheckedChange={(checked) => (checked ? startAgent() : stopAgent())}
                    disabled={isStarting || isStopping}
                  />
                </div>

                {/* Control Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={startAgent}
                    disabled={agentStatus.isActive || isStarting || agentStatus.subscriptionStatus !== "active"}
                    className="h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isStarting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Start My Agent
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={stopAgent}
                    disabled={!agentStatus.isActive || isStopping}
                    variant="outline"
                    className="h-16 border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    {isStopping ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                        Stopping...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Square className="w-5 h-5" />
                        Stop My Agent
                      </div>
                    )}
                  </Button>
                </div>

                {agentStatus.subscriptionStatus !== "active" && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Subscription Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      You need an active subscription to use the AI agent.{" "}
                      <Link href="/pricing" className="underline">
                        Upgrade now
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Statistics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Run</p>
                      <p className="font-semibold text-slate-900">{formatLastRun(agentStatus.lastRun)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Runs</p>
                      <p className="font-semibold text-slate-900">{agentStatus.totalRuns}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Cars Found</p>
                      <p className="font-semibold text-slate-900">{agentStatus.carsFound}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Healthy Cars</p>
                      <p className="font-semibold text-slate-900">{agentStatus.healthyCars}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Agent Configuration
                </CardTitle>
                <CardDescription>Current settings for your Revvdoctor AI agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Subscription Plan</h4>
                    <Badge variant="outline" className="capitalize">
                      {agentStatus.plan}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Scan Schedule</h4>
                    <p className="text-sm text-slate-600">Daily at 7:00 AM GMT</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-slate-600">Need to adjust your car preferences?</p>
                  <Button variant="outline" asChild>
                    <Link href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Preferences
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How Your AI Agent Works</CardTitle>
                <CardDescription>Understanding the Revvdoctor automation process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">1. Daily Scan</h4>
                    <p className="text-sm text-slate-600">
                      Every morning at 7 AM, your agent scans auction sites for cars matching your preferences.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">2. AI Analysis</h4>
                    <p className="text-sm text-slate-600">
                      Advanced AI analyzes each car's condition, identifying only the healthiest opportunities.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">3. Email Digest</h4>
                    <p className="text-sm text-slate-600">
                      Receive a curated list of healthy cars in your inbox, ready for bidding.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
