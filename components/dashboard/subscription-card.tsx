import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar } from "lucide-react"
import type { SubscriptionCardProps } from "@/lib/types"

export default function SubscriptionCard({ dealer }: SubscriptionCardProps) {
  const isTrialActive = dealer?.subscription_status === "trial"
  const currentPlan = dealer?.subscription_status || "trial"
  const planDetails = {
    trial: { name: "Free Trial", price: 0 },
    starter: { name: "Starter", price: 97 },
    growth: { name: "Growth", price: 297 },
    enterprise: { name: "Enterprise", price: 797 },
  }

  const currentPlanInfo = planDetails[currentPlan as keyof typeof planDetails] || planDetails.trial

  // Calculate expiry date and days left
  const expiresAt = dealer?.subscription_expires_at
    ? new Date(dealer.subscription_expires_at)
    : null

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Subscription
        </CardTitle>
        <CardDescription>Your current plan and billing status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan</span>
          <Badge variant={isTrialActive ? "secondary" : "default"}>{currentPlanInfo.name}</Badge>
        </div>

        {!isTrialActive && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Cost</span>
            <span className="text-sm font-semibold">£{currentPlanInfo.price}/mo</span>
          </div>
        )}

        {isTrialActive && expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trial Ends</span>
            <div className="text-right">
              <div className="text-sm">{expiresAt.toLocaleDateString()}</div>
              <div className="text-xs text-muted-foreground">{daysLeft} days left</div>
            </div>
          </div>
        )}

        <div className="pt-2">
          {isTrialActive ? (
            <Button className="w-full" asChild>
              <a href="/dealer-admin">
                <Crown className="w-4 h-4 mr-2" />
                Choose Plan
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href="/dealer-admin">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Subscription
              </a>
            </Button>
          )}
        </div>

        {isTrialActive && (
          <div className="text-xs text-muted-foreground text-center">
            Choose from Starter (£97), Growth (£297), or Enterprise (£797+) plans to continue after your trial.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
