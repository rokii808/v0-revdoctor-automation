"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mail, Clock, Bell } from "lucide-react"
import type { EmailSettingsProps } from "@/lib/types"
import { toast } from "sonner"

export default function EmailSettings({ dealer }: EmailSettingsProps) {
  const [settings, setSettings] = useState({
    frequency: "daily",
    time: "07:00",
    instantAlerts: true,
    weekendEmails: false,
    digestEnabled: true,
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_frequency: settings.frequency,
          email_time: settings.time,
          instant_alerts: settings.instantAlerts,
          weekend_emails: settings.weekendEmails,
          digest_enabled: settings.digestEnabled,
        }),
      })

      if (res.ok) {
        toast.success("Settings Saved!", {
          description: "Your email preferences have been updated.",
        })
      } else {
        const error = await res.json()
        toast.error("Save Failed", {
          description: error.message || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Unable to save settings. Please check your connection.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Digest Frequency</Label>
          <div className="mt-1 p-2 border rounded-md">
            {settings.frequency}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Daily Digest Time</Label>
          <div className="mt-1 p-2 border rounded-md">
            {settings.time}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <Label className="text-sm">Instant Alerts</Label>
            </div>
            <Switch
              checked={settings.instantAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, instantAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Label className="text-sm">Weekend Emails</Label>
            </div>
            <Switch
              checked={settings.weekendEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, weekendEmails: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <Label className="text-sm">Daily Digest</Label>
            </div>
            <Switch
              checked={settings.digestEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, digestEnabled: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
