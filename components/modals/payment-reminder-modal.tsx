"use client"

import { useSubscription } from "@/components/providers/subscription-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CreditCard, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function PaymentReminderModal() {
  const { showPaymentModal, setShowPaymentModal, paymentFailed, status, plan, daysLeft } = useSubscription()
  const router = useRouter()

  // Don't show if not needed
  if (!showPaymentModal && !paymentFailed) return null

  const handleUpdatePayment = () => {
    setShowPaymentModal(false)
    router.push("/billing")
  }

  const handleUpgrade = () => {
    setShowPaymentModal(false)
    router.push("/pricing")
  }

  const handleDismiss = () => {
    // Only allow dismissing if not payment failed
    if (!paymentFailed) {
      setShowPaymentModal(false)
    }
  }

  return (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentFailed ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                Payment Failed
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 text-amber-600" />
                {status === 'trial' ? 'Trial Ending Soon' : 'Subscription Update'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {paymentFailed
              ? "We couldn't process your payment. Please update your payment method to continue using Revvdoctor."
              : status === 'trial'
              ? `Your free trial expires in ${daysLeft} days. Upgrade now to continue accessing all features.`
              : "Your subscription needs attention."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {paymentFailed && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your access to Revvdoctor features is currently blocked due to a failed payment.
                Please update your payment method immediately to restore access.
              </AlertDescription>
            </Alert>
          )}

          {status === 'trial' && daysLeft <= 3 && daysLeft > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your free trial.
                Choose a plan to continue accessing:
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">What you'll lose access to:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Daily healthy car recommendations</li>
              <li>• AI-powered vehicle analysis</li>
              <li>• Custom saved searches and alerts</li>
              <li>• Export and reporting features</li>
              <li>• Priority customer support</li>
            </ul>
          </div>

          {!paymentFailed && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm mb-2">Your current plan:</h4>
              <p className="text-sm">
                <span className="font-medium capitalize">{plan}</span>
                {status === 'trial' && ` (${daysLeft} days remaining)`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!paymentFailed && (
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full sm:w-auto"
            >
              Remind Me Later
            </Button>
          )}

          {paymentFailed ? (
            <Button
              onClick={handleUpdatePayment}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment Method
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="w-full sm:w-auto"
            >
              {status === 'trial' ? 'Choose Plan' : 'Manage Subscription'}
            </Button>
          )}
        </DialogFooter>

        {/* Prevent closing if payment failed */}
        {paymentFailed && (
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-50 cursor-not-allowed"
              disabled
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
