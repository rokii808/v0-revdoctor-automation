import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Car, Calendar, MapPin, Gauge } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from("insights")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (error || !vehicle) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">{vehicle.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={
                    vehicle.verdict === "HEALTHY"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }
                >
                  {vehicle.verdict === "HEALTHY" ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-1" />
                  )}
                  {vehicle.verdict}
                </Badge>
                <Badge variant="outline">Risk: {vehicle.risk || vehicle.risk_score || 0}/100</Badge>
                {vehicle.lot_number && <Badge variant="secondary">Lot #{vehicle.lot_number}</Badge>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">£{vehicle.price?.toLocaleString()}</div>
              {vehicle.source_url && (
                <Button asChild className="mt-3" variant="default">
                  <a href={vehicle.source_url} target="_blank" rel="noopener noreferrer">
                    View on {vehicle.auction_site || "RAW2K"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Car className="w-8 h-8 text-pink-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Make</div>
                  <div className="font-semibold">{vehicle.make || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Year</div>
                  <div className="font-semibold">{vehicle.year || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gauge className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Mileage</div>
                  <div className="font-semibold">
                    {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-semibold text-sm">{vehicle.auction_location || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              AI Analysis
            </CardTitle>
            <CardDescription>Why this vehicle was flagged as {vehicle.verdict}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{vehicle.reason}</p>
            {vehicle.minor_type && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="font-semibold text-sm text-muted-foreground mb-1">Issue Type</div>
                <div className="text-lg">{vehicle.minor_type}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {vehicle.condition_html && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Condition Report</CardTitle>
              <CardDescription>Detailed condition notes from auction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: vehicle.condition_html }} />
            </CardContent>
          </Card>
        )}

        {(vehicle.auction_date || vehicle.auction_site) && (
          <Card>
            <CardHeader>
              <CardTitle>Auction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle.auction_site && (
                <div>
                  <div className="text-sm text-muted-foreground">Auction Site</div>
                  <div className="font-semibold text-lg capitalize">{vehicle.auction_site}</div>
                </div>
              )}
              {vehicle.auction_date && (
                <div>
                  <div className="text-sm text-muted-foreground">Auction Date</div>
                  <div className="font-semibold">
                    {new Date(vehicle.auction_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
              {vehicle.listing_id && (
                <div>
                  <div className="text-sm text-muted-foreground">Listing ID</div>
                  <div className="font-mono">{vehicle.listing_id}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
