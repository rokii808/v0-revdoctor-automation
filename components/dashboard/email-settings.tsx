"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mail, Clock, Bell } from "lucide-react"
import type { EmailSettingsProps } from "@/lib/types"

export default function EmailSettings({ dealer }: EmailSettingsProps) {
  const [settings, setSettings] = useState({
    frequency: "daily",
    time: "07:00",
    instantAlerts: true,
    weekendEmails: false,
    digestEnabled: true,
  })

  const handleSave = async () => {
    // In real app, this would call API to save settings
    console.log("Saving email settings:", settings)
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
          <Select value={settings.frequency} onValueChange={(value) => setSettings({ ...settings, frequency: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant (as they arrive)</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Daily Digest Time</Label>
          <Select value={settings.time} onValueChange={(value) => setSettings({ ...settings, time: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="06:00">6:00 AM</SelectItem>
              <SelectItem value="07:00">7:00 AM</SelectItem>
              <SelectItem value="08:00">8:00 AM</SelectItem>
              <SelectItem value="09:00">9:00 AM</SelectItem>
            </SelectContent>
          </Select>
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

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
