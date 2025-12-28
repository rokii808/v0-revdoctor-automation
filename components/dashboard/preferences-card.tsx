import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Edit } from "lucide-react"
import type { PreferencesCardProps } from "@/lib/types"

export default function PreferencesCard({ dealer }: PreferencesCardProps) {
  const makes = dealer?.prefs?.makes || []
  const locations = dealer?.prefs?.locations || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Your Preferences
        </CardTitle>
        <CardDescription>Current buying criteria for AI screening</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Preferred Makes</h4>
          <div className="flex flex-wrap gap-1">
            {makes.length > 0 ? (
              makes.map((make: string) => (
                <Badge key={make} variant="secondary">
                  {make}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Min Year</h4>
            <p className="text-sm">{dealer?.prefs?.min_year || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Max Budget</h4>
            <p className="text-sm">{dealer?.prefs?.max_bid ? `£${dealer.prefs.max_bid.toLocaleString()}` : "Not set"}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Max Mileage</h4>
          <p className="text-sm">{dealer?.prefs?.max_mileage ? `${dealer.prefs.max_mileage.toLocaleString()} miles` : "Not set"}</p>
        </div>

        <Button size="sm" variant="outline" className="w-full bg-transparent">
          <Edit className="w-4 h-4 mr-2" />
          Edit Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
