import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, Settings } from "lucide-react"
import type { DealersListProps } from "@/lib/types"

export default function DealersList({ dealers }: DealersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "trial":
        return "secondary"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Dealers Management
        </CardTitle>
        <CardDescription>View and manage all registered dealers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dealers.length > 0 ? (
            dealers.slice(0, 10).map((dealer) => (
              <div key={dealer.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{dealer.company_name || 'Unnamed Dealer'}</h4>
                  </div>
                  <Badge variant={getStatusColor(dealer.status || dealer.plan || 'inactive')}>{dealer.status || dealer.plan || 'inactive'}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="ml-2">{dealer.plan || 'trial'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Budget:</span>
                    <span className="ml-2">{dealer.prefs?.max_bid ? `£${dealer.prefs.max_bid.toLocaleString()}` : "Not set"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No dealers registered yet.</p>
            </div>
          )}

          {dealers.length > 10 && (
            <div className="text-center pt-4">
              <Button variant="outline">View All Dealers ({dealers.length})</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
