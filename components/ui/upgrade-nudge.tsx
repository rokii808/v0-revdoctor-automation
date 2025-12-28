import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

interface UpgradeNudgeProps {
  title: string
  description: string
  missedOpportunities?: number
  potentialSavings?: number
  currentPlan: string
  suggestedPlan: string
  className?: string
}

export default function UpgradeNudge({
  title,
  description,
  missedOpportunities,
  potentialSavings,
  currentPlan,
  suggestedPlan,
  className = "",
}: UpgradeNudgeProps) {
  return (
    <Card className={`border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-2">{title}</h3>
            <p className="text-orange-700 text-sm mb-4">{description}</p>

            {(missedOpportunities || potentialSavings) && (
              <div className="flex gap-4 mb-4">
                {missedOpportunities && (
                  <div>
                    <div className="text-lg font-bold text-orange-600">{missedOpportunities}</div>
                    <p className="text-xs text-orange-600">deals missed this week</p>
                  </div>
                )}
                {potentialSavings && (
                  <div>
                    <div className="text-lg font-bold text-orange-600">£{potentialSavings.toLocaleString()}</div>
                    <p className="text-xs text-orange-600">potential profit lost</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                Current: {currentPlan}
              </Badge>
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <Badge className="bg-orange-600 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Upgrade to {suggestedPlan}
              </Badge>
            </div>
          </div>
          <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/pricing">Unlock Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
