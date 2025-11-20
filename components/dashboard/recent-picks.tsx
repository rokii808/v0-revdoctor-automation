import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, TrendingUp, Star, Clock } from "lucide-react"
import { Car } from "lucide-react"
import type { RecentPicksProps } from "@/lib/types"

const mockHealthyCars = [
  {
    id: 1,
    title: "2019 BMW 3 Series 320d M Sport",
    price: 18500,
    risk: 15,
    reason: "Minor service light, easily resolved",
    minor_type: "Service",
    url: "https://example.com/car1",
    date: "2025-01-15",
    potential_profit: 2800,
    time_saved: "45 mins",
    is_hot_deal: true,
  },
  {
    id: 2,
    title: "2020 Audi A4 2.0 TDI S Line",
    price: 22000,
    risk: 25,
    reason: "Needs new tyres, otherwise excellent condition",
    minor_type: "Tyre",
    url: "https://example.com/car2",
    date: "2025-01-15",
    potential_profit: 3200,
    time_saved: "30 mins",
    is_hot_deal: false,
  },
  {
    id: 3,
    title: "2018 Mercedes C220d AMG Line",
    price: 19800,
    risk: 20,
    reason: "MOT due next month, no other issues",
    minor_type: "MOT",
    url: "https://example.com/car3",
    date: "2025-01-14",
    potential_profit: 2400,
    time_saved: "25 mins",
    is_hot_deal: false,
  },
]

export default function RecentPicks({ dealer, recentLeads }: RecentPicksProps) {
  const totalPotentialProfit = mockHealthyCars.reduce((sum, car) => sum + car.potential_profit, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Today's Opportunities</h3>
              <p className="text-sm text-blue-700">
                {mockHealthyCars.length} healthy cars • £{totalPotentialProfit.toLocaleString()} potential profit
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{mockHealthyCars.length}</div>
              <p className="text-xs text-blue-600">vs 3.2 avg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Healthy Picks
              </CardTitle>
              <CardDescription>AI-screened vehicles that match your preferences</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Above Average
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockHealthyCars.length > 0 ? (
            mockHealthyCars.map((car) => (
              <div
                key={car.id}
                className={`border rounded-lg p-4 space-y-3 transition-all hover:shadow-md ${
                  car.is_hot_deal ? "border-orange-200 bg-orange-50" : "border-border"
                }`}
              >
                {car.is_hot_deal && (
                  <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    Hot Deal - Act Fast!
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{car.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{car.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />£{car.potential_profit.toLocaleString()} potential profit
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Saved you {car.time_saved}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">£{car.price.toLocaleString()}</div>
                    <Badge variant={car.risk <= 20 ? "default" : "secondary"} className="mt-1">
                      Risk: {car.risk}/100
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{car.minor_type}</Badge>
                    <span className="text-xs text-muted-foreground">{car.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={car.url} target="_blank" rel="noopener noreferrer">
                        View Listing <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    {car.is_hot_deal && (
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        Bid Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No healthy cars found yet.</p>
              <p className="text-sm">Check back tomorrow for your daily digest!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
